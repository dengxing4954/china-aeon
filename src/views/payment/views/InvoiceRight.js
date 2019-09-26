import React, { Component } from 'react';
import ShowPaybox from '../../../common/components/showPaybox'
import { Row, Col, Layout, List, Icon, Button, Modal, message } from 'antd';
import messages from '@/common/components/message';
import intl from 'react-intl-universal';
import EventEmitter from '@/eventemitter';

const { Header, Sider, Content } = Layout;

//无状态组件
class InvoiceRight extends Component {

    // 第三方组件调用showPayDialog时需的提供该方法
    showPayDialog = (paymode) => {
        let modalCheck;
        let fun = () => {
            let show = true;
            let payACS, paySCB, payMahatan, payJFXF;
            let ishasWKZF = false;
            let isYprice = false;
            let isSCBprice = false;
            let isMAHAprice = false;
            this.props.goodsList.map(item => {
                if (item.price >= 1500) {
                    isYprice = true;
                    isSCBprice = true;
                    isMAHAprice = true;
                    return;
                } else if (item.price >= 1000) {
                    isYprice = true;
                    return;
                }
            })
            // if(this.props.octoDjlb==="Y3" && this.props.octozzDone===false){
            //     messages(intl.get("INFO_OCTOADDFIRST"));
            //     return;
            // }
            this.props.syspara.payObj.map((item) => {
                let str = item.split(',');
                if (str[0] == "payACS") {
                    payACS = str[1];
                    return;
                } else if (str[0] == "paySCB") {
                    paySCB = str[1];
                    return;
                } else if (str[0] == "payMahatan") {
                    payMahatan = str[1];
                    return;
                } else if (str[0] == "payJFXF") {
                    payJFXF = str[1];
                    return;
                }
            })
            this.props.paylist.map((item) => {
                if (item.paycode === this.props.syspara.wkzfPaycode) {
                    ishasWKZF = true;
                }
            })
            // this.props.syspara.nozjfkpaycode.map((itemno)=>{
            //     if(paymode.code == itemno){
            //         show = false;
            //         messages("该付款方式不能直接付款！");
            //         return;
            //     }
            // })
            if (this.props.sftotal <= 0 && this.props.zdyftotal > 0) {
                messages("錢已付清，請點擊付款完成！")
            } else if (this.props.paylist.length >= this.props.syspara.maxSalePayCount) {
                messages("超過最大付款行數")
            } else if (payACS !== undefined && paymode.code == payACS && !isYprice) {
                messages("單個商品價格低於1000不可以使用" + paymode.name)
            } else if (paySCB !== undefined && paymode.code == paySCB && !isSCBprice) {
                messages("單個商品價格低於1500不可以使用" + paymode.name)
            } else if (payMahatan !== undefined && paymode.code == payMahatan && !isMAHAprice) {
                messages("單個商品價格低於1500不可以使用" + paymode.name)
            } else if (payACS !== undefined && paymode.code == payACS && this.props.sftotal < 1000) {
                messages("剩餘應付金額低於1000不可以使用" + paymode.name)
            } else if (payJFXF !== undefined && paymode.code == payJFXF) {
                let _jfData = this.props.sysparaData.find((data) => {
                    return data.code === "JFXF"
                });
                let _jfbl = Number(_jfData.paravalue.split(",")[0]);
                let _jfmk = Number(_jfData.paravalue.split(",")[1]);
                if ((this.props.sftotal / _jfbl) < _jfmk) {
                    messages("剩餘應付金額低於" + (_jfmk * _jfbl) + "不可以使用" + paymode.name)
                } else {
                    // if(show) {
                    this.setState({
                        payDialogData: { ...paymode }
                    })
                    // }
                }
            } else if (paymode.code == this.props.syspara.wkzfPaycode && ishasWKZF == true) {
                messages("不可多次使用尾款支付")
            } /*else if (paymode.cardPayType == "0" && !this.props.staffCard && this.props.staffNo && paymode.code !== payACS) {
                messages("未綁定信用卡，請使用其他支付方式")
            }*/ else if (show) {
                this.setState({
                    payDialogData: { ...paymode }
                })
            }
        }
        let com = (value) => {
            // console.log(document.querySelector(".accredit").querySelector("button.ant-btn"));
            document.querySelector(".accredit").querySelector("button.ant-btn").blur();
            let flag = false;
            this.props.exceptPayData.crdInfo.forEach(element => {
                let crdB = element.crdBegin.replace(/\*/g, "");
                let crdE = element.crdEnd.replace(/\*/g, "");
                let crd = value.slice(0, crdB.length);
                if (crd >= crdB && crd <= crdE) {
                    flag = true;
                }
            });
            if (flag) {
                EventEmitter.off('Com', com);
                setTimeout(() => modalCheck.destroy(), 50);
                fun();
            } else {
                messages("該卡不參加優惠活動，請更換卡或重新刷卡！");
            }
        }
        if ((paymode.code == "0707" || paymode.code == "0800") && this.props.online == 0) {
            return messages("脫機狀態不支持此功能");
        }
        if (paymode.code == "0301" && this.props.exceptPayData && this.props.exceptPayData.crdInfo && this.props.exceptPayData.crdInfo.length) {
            EventEmitter.on('Com', com);
            modalCheck = Modal.info({
                className: "accredit",
                width: 350,
                iconType: "null",
                title: "校驗信用卡",
                okText: "取消",
                content: <p>
                    <span>請刷卡！</span>
                </p>,
                onOk: () => {
                    EventEmitter.off('Com', com);
                }
            });
            setTimeout(() => {
                document.querySelector(".accredit") && document.querySelector(".accredit").querySelector("button.ant-btn") && document.querySelector(".accredit").querySelector("button.ant-btn").blur();
            }, 200);
        } else {
            fun();
        }
    }

    // 第三方组件调用showPayDialog时需的提供该方法
    hidePayDialog = () => {
        this.setState({
            payDialogData: new Object({}),
            paymodeCollapsed: true,
        })
    }

    // componentWillUpdate() {
    //     this.props.paylist.map((item)=>{
    //         console.log(item)
    //         if(item.flag =="1"){
    //             extpaylist.push(item)
    //         }
    //     })
    // }

    showDelModal = (item, isAmcPay) => {
        let del = true;
        this.props.syspara.nodeletepaycode.map((itemno) => {
            if (item.paycode == itemno) {
                del = false;
                messages("該付款方式不允許刪除！");
                return;
            }
        })
        if (this.props.changename == "八達通增值" || this.props.changename == "八達通增值") {
            messages("找零已增值八達通，不允許刪除付款！");
        } else if (del) {
            this.setState({
                delVisible: true,
                puid: item.puid
            });
            Modal.confirm({
                className: 'vla-confirm',
                title: '確定要刪除付款嗎？',
                okText: '確定',
                cancelText: '取消',
                onOk: () => {
                    this.props.deletepay(this.state.puid, isAmcPay, item)
                }
            });
        }
    }

    showCancelModal = () => {
        // if (this.props.paylist.length > 0) {
        //     messages("请删除付款行！");
        // }else{
        if (this.props.cancelFilter()) {
            // Modal.confirm({
            //     className: 'vla-confirm',
            //     title: '确定要取消付款吗？',
            //     okText: '确认',
            //     cancelText: '取消',
            //     onOk:()=>{
            // if (this.props.paylist.length > 0) {
            //     messages("请删除付款行！");
            // } else {
            this.props.cancel();
            // }
            //         }
            //     });
            // }
        }
    }

    initButtons = () => {
        let _btns = [];
        for (let i = 0; i < 7; i++) {
            if (!!this.props.payModeInfo && !!this.props.payModeInfo[i]) {
                _btns.push(this.props.payModeInfo[i]);
            }
        }
        if (_btns.length > 0) {
            _btns.push({
                id: '-999',
                code: '-999',
                icon: 'ellipsis',
                name: '更多'
            });
        }
        return _btns;
    }
    paymodeToggle = () => {
        this.setState({
            paymodeCollapsed: !this.state.paymodeCollapsed
        });
    }
    initAllButtons = () => {
        let _btns = [];
        if (!!this.props.payModeInfo) {
            for (let i = 0; i < this.props.payModeInfo.length; i++) {
                if (!!this.props.payModeInfo[i]) {
                    this.props.payModeInfo[i].code != "0602" && _btns.push(this.props.payModeInfo[i]);
                }
            }
        }
        if (_btns.length > 0) {
            _btns.push({
                id: '-999',
                code: '-999',
                icon: 'ellipsis',
                name: '收起'
            });
        }
        return _btns;
    }

    constructor(props) {
        super(props);
        this.state = {
            readOnly: true,
            paymodeCollapsed: true,
            delVisible: false,//删除付款
            payDialogData: {},//当前支付方式属性
            puid: "",
        };
    }

    componentDidMount() {
        console.log("IR: ", this.props, this.state)
        this.props.onRef(this)
    }

    componentWillUnmount() {

    }

    finalsubmit() {
        // if(this.props.octoDjlb==="Y3" && (this.props.octozzfkDone===false || this.props.octozzDone===false)){
        //     // messages(intl.get("INFO_OCTOADDFIRST"));
        //     messages(intl.get("INFO_ADDVALNOTDONE")); //八达通增值未完成，请拍卡
        //     return;
        // }
        const { yftotal, sftotal, change, changename, overage, paylist, payModeInfo, submitFilter, cancelFilter, submit, cancel, deletepay, onAfterPay, flow_no, mkt, syjh, operators, fphm, type, syspara, intl, afterZKpay, staffCard, cardBin, sysparaData, exceptPaycodes, IniPaymode, isrenderBox, expressNumber, erpCode } = this.props;
        let extra = {
            flow_no,
            erpCode,
            mkt,
            syjh,
            operators,
            fphm,
            scene: "0",
            type,
            staffCard,
            cardBin,
            exceptPaycodes,
            IniPaymode,
            expressNumber
        };
        if (this.props.submitFilter()) {
            if (this.props.sftotal > 0) {
                let model = Modal.info({
                    className: "xjzl message-invoice",
                    maskClosable: true,
                    content: (<div>
                        <p className="ti"> 請付清餘款！</p>
                    </div>),
                    title: '提示',
                    onOk: () => {
                    }
                });
                setTimeout(() => model.destroy(), 2000);
            } else if (this.props.sftotal == 0 && this.props.addDjlb === 'Y12') {
                //印花换购单据 支付现金为0 点击完成直接交易
                let payInfo = this.props.payModeInfo.find(v => v.paytype == '1')
                if (!!payInfo) {
                    this.refs.ShowPaybox.doPayment(0, payInfo, extra, 0)
                }
            } else {
                this.props.submit();
            }
        }
    }

    render() {
        const { yftotal, sftotal, change, changename, overage, paylist, payModeInfo, submitFilter, cancelFilter, submit, cancel, deletepay, onAfterPay, flow_no, mkt, syjh, operators, fphm, type, syspara, intl, afterZKpay, staffCard, cardBin, sysparaData, exceptPaycodes, IniPaymode, isrenderBox, expressNumber, erpCode, zdyftotal, octoDeviceId, octoCardId } = this.props;
        let _this = this;
        let _b = this.initButtons();
        let _bAll = this.initAllButtons();
        let _bList = _b.map((btn, btnIndex) => {
            let res = null;
            if (btn.code === '-999') {
                res = (
                    <Col span={6} className="paylist" key={btnIndex}>
                        <Button className="icon" size="large" onClick={this.paymodeToggle}>
                            <Icon type={btn.icon} />{btn.name}
                        </Button>
                    </Col>
                );
            } else {
                res = (
                    <Col span={6} className="paylist" key={btnIndex}>
                        <Button className="icon" size="large" onClick={() => {
                            _this.showPayDialog(btn);
                        }}>
                            <Icon type={btn.icon} />{btn.name}
                        </Button>
                    </Col>
                );
            }
            return res;
        });

        let _bListAll = _bAll.map((btn, btnIndex) => {
            let res = null;
            if (btn.code === '-999') {
                res = (
                    <Col span={6} className="paylist" key={btnIndex}>
                        <Button className="icon" size="large" onClick={this.paymodeToggle}>
                            <Icon type={btn.icon} />{btn.name}
                        </Button>
                    </Col>
                );
            } else {
                res = (
                    <Col span={6} className="paylist" key={btnIndex}>
                        {/*onClick={showPayDialog(btn)}*/}
                        <Button className="icon" size="large" onClick={() => {
                            _this.showPayDialog(btn);
                        }}>
                            <Icon type={btn.icon} />{btn.name}
                        </Button>
                    </Col>
                );
            }
            return res;
        });

        let payDetailList = paylist.map((item, index) => {
            if (JSON.stringify(item) === '[]') {
                return null;
            }
            console.log("payDetailList-----> ", item)
            let res = null;
            if (item.flag !== "2" && item.flag !== "3") {
                res = (<div className="payDetailItem" key={index}>
                    <p>{item.payname}</p>
                    <p>{!!item.payno && item.payno.length > 10 ? (item.payno.substr(0, 2) + "**" + item.payno.substr(item.payno.length - 6, 6)) : item.payno}</p>
                    <p>{item.ybje}</p>
                    <p>{Number(item.total).toFixed(2)}</p>
                    <div className="del">
                        {/* 八达通方式的付款行不可删除 */
                            item.paytype === "4" ? null : (<span className="sc" onClick={() => {
                                this.showDelModal(item, item.paycode == "0800");
                            }}>刪除</span>)
                        }
                    </div>
                </div>);
            }
            return res
        });

        let extra = {
            flow_no,
            erpCode,
            mkt,
            syjh,
            operators,
            fphm,
            scene: "0",
            type,
            staffCard,
            cardBin,
            exceptPaycodes,
            IniPaymode,
            expressNumber
        };

        return (
            <div className="cash_payright">
                <Row className="row">
                    <Col span={24} className="payconsoleCnt">
                        <Layout className="payconsolelay">
                            <Content className="payconsole">
                                <Row className="paymode">
                                    <p className="title">{intl("PAY_TIPTYPE")}</p>
                                    {_bList}
                                </Row>
                                <Row className="paydetail">
                                    <div className="title"><p>{intl("PAY_TYPE") + "："}</p>
                                        <p>{intl("PAY_ACCOUNTNUMBER") + "："}</p><p>{intl("PAY_EXCHANGE") + "："}</p>
                                        <p>{intl("PAY_CURRENCY") + "："}</p>
                                        <div></div>
                                    </div>
                                    <div className="paylist">
                                        {payDetailList}
                                    </div>
                                </Row>
                            </Content>

                            <Sider
                                width="100%"
                                trigger={null}
                                collapsible
                                collapsed={this.state.paymodeCollapsed}
                                collapsedWidth={0}
                                style={{
                                    background: "#f9f9f9",
                                    margin: 0,
                                    padding: 0,
                                    display: "flex",
                                    flexDirection: "column"
                                }}
                            >
                                <p className="title">{intl("PAY_TIPTYPE") + "："}</p>
                                <Row className="paymode paymodeAll" style={{ overflow: "scroll" }}>
                                    {_bListAll}
                                </Row>
                                <Row>
                                </Row>
                            </Sider>
                        </Layout>
                    </Col>


                    <Col span={24} className="payctr">
                        <Row className="payctrrow">
                            <Col span={24} className="paymess">
                                <p>{type == "4" ? "已退金額：" : "已收金額："}<br /><span
                                    className="num">{syspara.bbcodeHBFH[1] + parseFloat(yftotal).toFixed(2)}</span></p>
                                <p>{sftotal > 0 ? "剩余應付：" : changename + ":"}<br />
                                    <span
                                        className="num">{sftotal > 0 ? syspara.bbcodeHBFH[1] + sftotal.toFixed(2) : syspara.bbcodeHBFH[1] + parseFloat(change).toFixed(2)}</span>
                                </p>
                                {/*<p>{overage !== 0 ? "损益：" : ""}<br/>*/}
                                {/*<span className="num">{overage !== 0 ? syspara.bbcodeHBFH[1] + overage : ""}</span></p>*/}
                            </Col>
                            <Col span={24} className="buttons">
                                <Button onClick={cancel} type="primary" className="res"
                                        disabled={this.props.cacelButtonDisabled}
                                    onClick={this.showCancelModal}>取消</Button>
                                <Button onClick={submit} type="primary" className="sub"
                                    onClick={this.finalsubmit.bind(this)}>完成</Button>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                {isrenderBox ? <ShowPaybox payModeData={this.state.payDialogData} extra={extra} yfzje={this.props.yfzje}
                    sjzje={this.props.sjzje} onAfterPay={onAfterPay}
                    ref='ShowPaybox'
                    onHidePay={this.hidePayDialog}
                    sftotal={sftotal} syspara={syspara} afterZKpay={afterZKpay}
                    sysparaData={sysparaData} octoddRecord={this.props.octoddRecord}
                    vip_no={this.props.vip_no} 
                    zdyftotal={this.props.zdyftotal}
                    autoPay={(
                        (!!this.props.query && !!this.props.query.djlb) && 
                        ((this.props.query.djlb === 'Y3' || this.props.query.djlb === 'Y9') && this.props.query.isBl == "true")
                        )?true:false}
                    autoPayInfo={this.props.payModeInfo.find(v => v.paytype == '1')}
                    octoDeviceId={octoDeviceId}
                    octoCardId={octoCardId}
                    /> : null}
            </div>
        );
    }
}

export default InvoiceRight;
