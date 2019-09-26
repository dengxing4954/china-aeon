import React, { Component } from 'react'
import { Row, Col, Layout, Icon, Button, Modal } from 'antd'
import { Spin } from "antd/lib/index"
import intl from 'react-intl-universal'
import moment from 'moment'
import { trade, submit, returnsubmit, duesubmit, print, } from '../Actions.js';
import actions from '@/views/presale/Actions.js'
import { updateXPH, updateAMC, isWarn, setState } from '@/views/initialize/Actions.js'
import { connect } from 'react-redux'
import InvoiceLeft from './InvoiceLeft'
import EventEmitter from '@/eventemitter'
import { Fetch } from '@/fetch/'
import Url from '@/config/url.js'
import message from '@/common/components/message'
import PaymentBox from '@/common/components/showPaybox'
import calculate from '../../../common/calculate'
import '../style/invoice.less'


const { Sider, Content } = Layout;

class Pay4EliminateService extends Component {

    constructor(props) {
        super(props);
        this.state = {
            paymodeCollapsed: true,
            delVisible: false,//删除付款
            payDialogData: {},//当前支付方式属性
            puid: "",
            payList: [],//付款信息
            yftotal: 0,//已收金额
            sftotal: 0,//剩余应付
            change: 0,//找零
            overage: 0,//损益
            type: "1",
            batzzVisible: false,
            changename: intl.get("CHANGE"),
            paymode: [],//除外银行促销后的paymode
            query: this.props.location.query,
            octoDjlb: '',
            octozzfkDone: false,          //八达通增值付款完成
            octozzDone: false,          //八达通增值完成
            octozlDone: false,          //八达通找零完成
            octopusDeviceId: this.props.isBl ? this.props.octoDeviceId : null,      //八达通设备号
            octopusDedudeTotal: null,
            octopusCardno: this.props.isBl ? this.props.octoCardId : null,        //八达通卡号
            octopusRechargeTotal: null, //增值金额
            octopusBalance: null,       //八达通余额
            octopusRetrying: false,     //八达通100022错误重试中
            octopusIsSmart: false,          //是否八达通智能卡
            octopusLastAddValDate: null,    //最近增值日期
            octopusLastAddValType: null,    //最近增值类型
            octopusLastAddValTypeEn: null,    //最近增值类型(english)
            octopusTransDate: null, //八达通交易时间
            zliszzoctopus: false,     //是否连接八达通支付
            isrenderBox: false, //是否加载showpaybox
            backPrintStallInfo: [],//支持后厨打印的档口信息
            groupByGoodsList: [], //分组的goodsList
            isPrint: false,
            submitResult: null,
            na: 0,
            returncode: "0",
            retmsg: '',
            oldFphm: '',
            cacelButtonDisabled: false,
        };
    }




    

    render() {
        const { 
            cardBin,
            erpCode,
            exceptPaycodes,
            expressNumber,
            flow_no,
            fphm, 
            goodsList, 
            mkt, 
            octoCardId,
            octoDeviceId,
            operators, 
            payModeInfo,
            switchEng, 
            syjh,
            syspara, 
            sysparaData,
            vip_name, 
            vip_no, 
            zddsctotal, 
            zdsjtotal, 
            zdyftotal
        } = this.props;
        const {
            change,
            changename,
            isrenderBox,
            payList,
            sftotal,
            type,
            yftotal
        } = this.state;

        let _bList = this.initButtons(false);
        let _bListAll = this.initButtons(true);
        let payDetailList = payList.map((item, index) => {
            if (JSON.stringify(item) === '[]') {
                return null;
            }
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
            IniPaymode: payModeInfo,
            cardBin,
            erpCode,
            exceptPaycodes,
            expressNumber,
            flow_no,
            fphm,
            mkt,
            operators,
            scene: "0",
            staffCard: this.props.creditCardNo || this.props.staffNo,
            syjh,
            type
        };

        return (
            <div className="invoice">
                <InvoiceLeft goodsList={goodsList}
                    zdyftotal={zdyftotal}
                    oldFphm={this.state.oldFphm}
                    zdsjtotal={zdsjtotal}
                    zddsctotal={zddsctotal}
                    vip_name={vip_name}
                    vip_no={vip_no}
                    fphm={fphm}
                    mkt={mkt}
                    repullSale={this.afterZKpay}
                    operators={operators}
                    type={this.state.type}
                    syspara={syspara}
                    switchEng={switchEng}
                    intl={this.intl}
                    cardNo={this.props.cardNo}
                    staffType={this.props.staffType}
                    delGoods={(guid, barcode) => this.delGoods(guid, barcode)}
                />
                <div className="cash_payright">
                    <Row className="row">
                        <Col span={24} className="payconsoleCnt">
                            <Layout className="payconsolelay">
                                <Content className="payconsole">
                                    <Row className="paymode">
                                        <p className="title">{intl.get("PAY_TIPTYPE")}</p>
                                        {_bList}
                                    </Row>
                                    <Row className="paydetail">
                                        <div className="title"><p>{intl.get("PAY_TYPE") + "："}</p>
                                            <p>{intl.get("PAY_ACCOUNTNUMBER") + "："}</p><p>{intl.get("PAY_EXCHANGE") + "："}</p>
                                            <p>{intl.get("PAY_CURRENCY") + "："}</p>
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
                                    <p className="title">{intl.get("PAY_TIPTYPE") + "："}</p>
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
                                    <Button 
                                        onClick={() => this.cancelpay(operators, flow_no, mkt, syjh)} 
                                        type="primary" className="res"
                                        disabled={this.props.cacelButtonDisabled}
                                        onClick={this.showCancelModal}>取消</Button>
                                    <Button onClick={submit} type="primary" className="sub"
                                        // onClick={this.finalsubmit.bind(this)}
                                        onClick={this.invoiceSubmit}
                                        >完成</Button>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    {isrenderBox ? 
                        <PaymentBox 
                            ref='ShowPaybox'
                            autoPay={(
                                (!!this.props.query && !!this.props.query.djlb) && 
                                ((this.props.query.djlb === 'Y3' || this.props.query.djlb === 'Y9') && this.props.query.isBl == "true")
                                )?true:false}
                            autoPayInfo={payModeInfo.find(v => v.paytype == '1')}
                            extra={extra} 
                            octoDeviceId={octoDeviceId}
                            octoCardId={octoCardId}
                            payModeData={this.state.payDialogData} 
                            sftotal={sftotal} 
                            syspara={syspara} 
                            sysparaData={sysparaData} 
                            vip_no={vip_no} 
                            zdyftotal={zdyftotal}
                            afterZKpay={this.afterZKpay}
                            onAfterPay={this.afterPayHandle}
                            onHidePay={this.hidePayDialog}
                            octoddRecord={this.octoddRecord}
                        /> : null}
                </div>
                {
                    this.state.isPrint ?
                        <div className="loading_mask" onClick={(e) => {
                            e.stopPropagation()
                        }}>
                            <Spin size="large" tip="打印中..." />
                        </div> : null
                }
            </div>
        );
    }


    intl = (key, params = {}) => {
        return intl.get(key, params);
    }


    // 支付方式入口初始化
    initButtons = (_forAll) => {
        let _btns = [];
        if (_forAll){
            if (!!this.state.paymode) {
                for (let i = 0; i < this.state.paymode.length; i++) {
                    if (!!this.state.paymode[i]) {
                        this.state.paymode[i].code != "0602" && _btns.push(this.state.paymode[i]);
                    }
                }
            }
        } else {
            for (let i = 0; i < 7; i++) {
                if (!!this.state.paymode && !!this.state.paymode[i]) {
                    _btns.push(this.state.paymode[i]);
                }
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
        return _btns.map((btn, btnIndex) => {
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
                                    this.showPayDialog(btn);
                                }}>
                                    <Icon type={btn.icon} />{btn.name}
                                </Button>
                            </Col>
                        );
                    }
                    return res;
                });
    }
    
    // 支付方式入口面板开闭
    paymodeToggle = () => {
        this.setState({
            paymodeCollapsed: !this.state.paymodeCollapsed
        });
    }
    
    // 打开支付组件
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
            this.state.payList.map((item) => {
                if (item.paycode === this.props.syspara.wkzfPaycode) {
                    ishasWKZF = true;
                }
            })
            if (this.state.sftotal <= 0 && this.props.zdyftotal > 0) {
                message("錢已付清，請點擊付款完成！")
            } else if (this.state.payList.length >= this.props.syspara.maxSalePayCount) {
                message("超過最大付款行數")
            } else if (payACS !== undefined && paymode.code == payACS && !isYprice) {
                message("單個商品價格低於1000不可以使用" + paymode.name)
            } else if (paySCB !== undefined && paymode.code == paySCB && !isSCBprice) {
                message("單個商品價格低於1500不可以使用" + paymode.name)
            } else if (payMahatan !== undefined && paymode.code == payMahatan && !isMAHAprice) {
                message("單個商品價格低於1500不可以使用" + paymode.name)
            } else if (payACS !== undefined && paymode.code == payACS && this.state.sftotal < 1000) {
                message("剩餘應付金額低於1000不可以使用" + paymode.name)
            } else if (payJFXF !== undefined && paymode.code == payJFXF) {
                let _jfData = this.props.sysparaData.find((data) => {
                    return data.code === "JFXF"
                });
                let _jfbl = Number(_jfData.paravalue.split(",")[0]);
                let _jfmk = Number(_jfData.paravalue.split(",")[1]);
                if ((this.state.sftotal / _jfbl) < _jfmk) {
                    message("剩餘應付金額低於" + (_jfmk * _jfbl) + "不可以使用" + paymode.name)
                } else {
                    // if(show) {
                    this.setState({
                        payDialogData: { ...paymode }
                    })
                    // }
                }
            } else if (paymode.code == this.props.syspara.wkzfPaycode && ishasWKZF == true) {
                message("不可多次使用尾款支付")
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
                message("該卡不參加優惠活動，請更換卡或重新刷卡！");
            }
        }
        if ((paymode.code == "0707" || paymode.code == "0800") && this.props.online == 0) {
            return message("脫機狀態不支持此功能");
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

}


const mapStateToProps = (state) => {
    console.log("Payment4SaleService", state);
    return {
        flow_no: state['presale'].flow_no,
        vip_no: state['presale'].vipInfo ? state['presale'].vipInfo.memberId : null,
        vip_name: state['presale'].vipInfo ? state['presale'].vipInfo.memberNameChinese : null,
        uidlist: state['presale'].uidlist,
        limitedPays: state['presale'].limitedPays,//除外支付
        exceptPaycode: state['presale'].discountPayCode,//优惠支付
        exceptPayData: state['presale'].exceptPayData,
        djlb: state['presale'].isBl == true ? state['presale'].octozz : state['presale'].djlb,//单据类别
        switchEng: state['presale'].switchEng,//中false英文true
        dcData: state['presale'].dcData,  //DC送货信息
        breadFlag: state["initialize"].data.syjmain[0].isbreadpos === 'Y' ? true : false,
        isBl: state['presale'].isBl,
        isDj: state['presale'].isDj,
        isDc: state['presale'].isDc,
        isHs: state['presale'].isSd,
        isJFXH: state['presale'].isJFXH,
        addDjlb: state['presale'].octozz,
        isDiningHall: state['presale'].isDiningHall,
        amcNO: state['initialize'].amcNO,
        mkt: state["initialize"].mkt,
        xph: state["initialize"].xph,
        mktinfo: state["initialize"].data.mktinfo,
        sysparaData: state["initialize"].data.syspara,
        payModeInfo: state["initialize"].data.paymode,
        syjmain: state["initialize"].data.syjmain[0],
        stallhotkeytemplate: state["initialize"].data.stallhotkeytemplate,
        syjh: state["initialize"].syjh,
        fphm: state['initialize'].fphm,
        entid: state['initialize'].entid,
        erpCode: state["initialize"].erpCode,
        jygs: state["initialize"].jygs,
        interval: state["initialize"].interval,
        syspara: state["initialize"].Syspara,
        online: state["initialize"].online,
        zdsjtotal: state["invoice"].zdsjtotal || '0',//实际总金额
        zdyftotal: state["invoice"].zdyftotal || '0',//应付总金额
        zddsctotal: state["invoice"].zddsctotal || '0',//优惠金额
        sjtotal: state["invoice"].sjtotal || '0',//！！实际付款总金额
        goodsList: state["invoice"].goods || [],//商品列表
        salePayments: state["invoice"].salePayments || [], //！！支付列表
        coupon_gain: state["invoice"].coupon_gain || [],  //返券信息
        esystemStatus: state["invoice"].esystemStatus,
        memberInfo: state["invoice"].memberInfo,
        saveStatus: state["invoice"].saveStatus,
        jf: state["invoice"].jf || '0',  //本币获得积分
        curjf: state["invoice"].curjf || '0',   //当前积分
        outSideGiftsInfo: state["invoice"].outSideGiftsInfo,   //场外换购信息
        refundAuthzCardNo: state["invoice"].refundAuthzCardNo,
        terminalOperatorAuthzCardNo: state["invoice"].terminalOperatorAuthzCardNo,
        totalDiscAuthzCardNo: state["invoice"].totalDiscAuthzCardNo,
        recycleSer: state["invoice"].recycleSer,//四电一脑基础信息
        recycleSerInfo: state["invoice"].recycleSerInfo,//四电一脑详情
        popInfo: state["invoice"].popInfo, //整单折扣
        expressNumber: state["invoice"].expressNumber,//送货memo
        rqsj: state['invoice'].saleDate,
        eleStamp: state['invoice'].eleStamp,
        hasFastPay: state['invoice'].hasFastPay,
        sticker: state['invoice'].sticker,
        stamp: state['invoice'].stamp,
        stick: state['invoice'].stick,
        realConsumersCard: state['invoice'].realConsumersCard,
        operators: state['login'].operuser.gh || state['login'].operuser.cardno,
        giftList: state['presale'].giftList,  //赠品列表
        // cardNo: state['presale'].staffcard.cardNo,
        creditCardNo: state['presale'].staffcard.creditCardNo, //员工购物信用卡
        cardBin: state['presale'].staffcard.cardBin, //员工购物信用卡
        // staffNo: state['presale'].staffcard.staffNo,  //是员工工号
        // cardType: state['presale'].staffcard.cardType,  //1为员工购物  2为亲属购物
        consumersType: state["invoice"].consumersType,
        consumersCard: state["invoice"].consumersCard,
        cardNo: state["invoice"].staffCardNo,
        staffNo: state["invoice"].staffNo,
        cardType: state["invoice"].staffType,
        uploadData: state["initialize"].data.uploadData,
        pagerNO: state["initialize"].pagerNO,
        pagerType: state["initialize"].PagerType,
        octoDeviceId: state["presale"].octoDeviceId,
        octoCardId: state["presale"].octoCardId,
        octoFphm: state["presale"].octoFphm
    };

    // let router = state["routing"].locationBeforeTransitions;
    // if (router.state && router.state.type === "returnGoods") {
    //     return {
    //         type: router.state.type,
    //         goodsList: state["invoice"].goods || [],
    //         zdsjtotal: state["invoice"].zdsjtotal || '',//实际总金额
    //         zdyftotal: state["invoice"].zdyftotal,//应付总金额
    //         zddsctotal: state["invoice"].zddsctotal || '0',//优惠金额
    //         sjtotal: state["invoice"].sjtotal || '',//！！实际付款总金额
    //         salePayments: state["invoice"].salePayments, //！！支付列表
    //         recycleSer: state["invoice"].recycleSer,//四电一脑基础信息
    //         recycleSerInfo: state["invoice"].recycleSerInfo,//四电一脑详情
    //         refundAuthzCardNo: state["invoice"].refundAuthzCardNo,
    //         terminalOperatorAuthzCardNo: state["invoice"].terminalOperatorAuthzCardNo,
    //         totalDiscAuthzCardNo: state["invoice"].totalDiscAuthzCardNo,
    //         expressNumber: state["invoice"].expressNumber,
    //         xph: state["initialize"].xph,
    //         memberInfo: state["invoice"].memberInfo,
    //         cardNo: state["invoice"].staffCardNo,
    //         staffNo: state["invoice"].staffNo,
    //         staffType: state["invoice"].staffType,
    //         cardType: state["invoice"].staffType,
    //         Revipno: state["invoice"].vipno,
    //         dcData: state['invoice'].dcData || '',  //DC送货信息
    //         depositSale: state['invoice'].depositSale,
    //         realConsumersCard: state['invoice'].realConsumersCard,
    //         flow_no: state['returngoods'].flow_no,
    //         uidlist: state['returngoods'].uidlist,
    //         vip_no: state['returngoods'].vip ? state['returngoods'].vip.memberId : null,
    //         vip_name: state['returngoods'].vip ? state['returngoods'].vip.name : null,
    //         fphm: state['returngoods'].fphm,
    //         dzyh: state['invoice'].eleStamp ? state['invoice'].eleStamp : 0,
    //         swyh: state['invoice'].sticker ? state['invoice'].sticker : 0,
    //         ysyjNo: state['returngoods'].ysyjNo,
    //         yxpNo: state['returngoods'].yxpNo,
    //         ymdNo: state['returngoods'].ymdNo,
    //         status: state['returngoods'].status,
    //         exceptPaycodes: state['returngoods'].payments,
    //         switchEng: state['returngoods'].switchEng,//中false英文true
    //         isDiningHall: state['returngoods'].isDiningHall,
    //         rqsj: state['invoice'].saleDate,
    //         djlb: state['returngoods'].orderType,//单据类别
    //         cause: state['returngoods'].cause,//退货code
    //         smType: state['returngoods'].smType,
    //         isDj: state['returngoods'].isDj,
    //         isDc: state['returngoods'].isDc,
    //         isHs: state['returngoods'].isSd,
    //         payModeInfo: state["initialize"].data.paymode,
    //         breadFlag: state["initialize"].data.syjmain[0].isbreadpos === 'Y' ? true : false,
    //         mkt: state["initialize"].mkt,
    //         mktinfo: state["initialize"].data.mktinfo,
    //         syjh: state["initialize"].syjh,
    //         entid: state['initialize'].entid,
    //         erpCode: state["initialize"].erpCode,
    //         jygs: state["initialize"].jygs,
    //         interval: state["initialize"].interval,
    //         syspara: state["initialize"].Syspara,
    //         online: state["initialize"].online,
    //         stallhotkeytemplate: state["initialize"].data.stallhotkeytemplate,
    //         popInfo: state["invoice"].popInfo, //整单折扣
    //         saveStatus: state["invoice"].saveStatus,
    //         syjmain: state["initialize"].data.syjmain[0],
    //         sysparaData: state["initialize"].data.syspara,
    //         operators: state['login'].operuser.gh || state['login'].operuser.cardno,
    //         consumersType: state["invoice"].consumersType,
    //         consumersCard: state["invoice"].consumersCard,
    //         uploadData: state["initialize"].data.uploadData
    //     };
    // }
    // if (router.state && router.state.type === "eliminatebills") {
    //     return {
    //         type: router.state.type,
    //         goodsList: state["invoice"].goods || [],
    //         zdsjtotal: state["invoice"].zdsjtotal || '',//实际总金额
    //         zdyftotal: state["invoice"].zdyftotal,//应付总金额
    //         zddsctotal: state["invoice"].zddsctotal || '0',//优惠金额
    //         sjtotal: state["invoice"].sjtotal || '',//！！实际付款总金额
    //         xph: state["initialize"].xph,
    //         salePayments: state["invoice"].salePayments, //！！支付列表
    //         recycleSer: state["invoice"].recycleSer,//四电一脑基础信息
    //         recycleSerInfo: state["invoice"].recycleSerInfo,//四电一脑详情
    //         refundAuthzCardNo: state["invoice"].refundAuthzCardNo,
    //         terminalOperatorAuthzCardNo: state["invoice"].terminalOperatorAuthzCardNo,
    //         totalDiscAuthzCardNo: state["invoice"].totalDiscAuthzCardNo,
    //         expressNumber: state["invoice"].expressNumber,
    //         cardNo: state["invoice"].staffCardNo,
    //         staffNo: state["invoice"].staffNo,
    //         cardType: state["invoice"].staffType,
    //         staffType: state["invoice"].staffType,
    //         Revipno: state["invoice"].vipno,
    //         dcData: state['invoice'].dcData || '',  //DC送货信息
    //         depositSale: state['invoice'].depositSale,
    //         dzyh: state['invoice'].eleStamp ? state['invoice'].eleStamp : 0,
    //         swyh: state['invoice'].sticker ? state['invoice'].sticker : 0,
    //         breadFlag: state["initialize"].data.syjmain[0].isbreadpos === 'Y' ? true : false,
    //         realConsumersCard: state['invoice'].realConsumersCard,
    //         saveStatus: state["invoice"].saveStatus,
    //         flow_no: state['eliminatebills'].flow_no,
    //         uidlist: state['eliminatebills'].uidlist,
    //         memberInfo: state["invoice"].memberInfo,
    //         vip_no: state['eliminatebills'].vip ? state['eliminatebills'].vip.memberId : null,
    //         vip_name: state['eliminatebills'].vip ? state['eliminatebills'].vip.name : null,
    //         fphm: state['eliminatebills'].fphm,
    //         ysyjNo: state['eliminatebills'].ysyjNo,
    //         yxpNo: state['eliminatebills'].yxpNo,
    //         ymdNo: state['eliminatebills'].ymdNo,
    //         exceptPaycodes: state['eliminatebills'].payments,
    //         switchEng: state['eliminatebills'].switchEng,//中false英文true
    //         isDiningHall: state['eliminatebills'].isDiningHall,
    //         rqsj: state['invoice'].saleDate,
    //         djlb: state['eliminatebills'].orderType,//单据类别
    //         cause: state['eliminatebills'].cause,//退货code
    //         payModeInfo: state["initialize"].data.paymode,
    //         mkt: state["initialize"].mkt,
    //         mktinfo: state["initialize"].data.mktinfo,
    //         syjh: state["initialize"].syjh,
    //         entid: state['initialize'].entid,
    //         stallhotkeytemplate: state["initialize"].data.stallhotkeytemplate,
    //         erpCode: state["initialize"].erpCode,
    //         jygs: state["initialize"].jygs,
    //         interval: state["initialize"].interval,
    //         syspara: state["initialize"].Syspara,
    //         syjmain: state["initialize"].data.syjmain[0],
    //         sysparaData: state["initialize"].data.syspara,
    //         warn: state["initialize"].data.syjmain[0],
    //         online: state["initialize"].online,
    //         popInfo: state["invoice"].popInfo, //整单折扣
    //         operators: state['login'].operuser.gh || state['login'].operuser.cardno,
    //         consumersType: state["invoice"].consumersType,
    //         consumersCard: state["invoice"].consumersCard,
    //         uploadData: state["initialize"].data.uploadData
    //     };
    // } else if (router.state && router.state.type === "finalpayment") {
    //     return {
    //         type: router.state.type,
    //         goodsList: state["invoice"].goods || [],
    //         zdsjtotal: state["invoice"].zdsjtotal || '',//实际总金额
    //         zdyftotal: state["invoice"].zdyftotal,//应付总金额
    //         zddsctotal: state["invoice"].zddsctotal || '0',//优惠金额
    //         sjtotal: state["invoice"].sjtotal || '',//！！实际付款总金额
    //         salePayments: state["invoice"].salePayments, //！！支付列表
    //         recycleSer: state["invoice"].recycleSer,//四电一脑基础信息
    //         recycleSerInfo: state["invoice"].recycleSerInfo,//四电一脑详情
    //         refundAuthzCardNo: state["invoice"].refundAuthzCardNo,
    //         terminalOperatorAuthzCardNo: state["invoice"].terminalOperatorAuthzCardNo,
    //         totalDiscAuthzCardNo: state["invoice"].totalDiscAuthzCardNo,
    //         expressNumber: state["invoice"].expressNumber,//送货memo
    //         dcData: state['invoice'].dcData || '',  //DC送货信息
    //         depositSale: state['invoice'].depositSale,
    //         flow_no: state['finalpayment'].flow_no,
    //         uidlist: state['finalpayment'].uidlist,
    //         cause: state['finalpayment'].cause,//退货code
    //         vip_no: state['finalpayment'].vip ? state['finalpayment'].vip.vipno : '',
    //         vip_name: state['finalpayment'].vip ? state['finalpayment'].vip.name : null,
    //         breadFlag: state["initialize"].data.syjmain[0].isbreadpos === 'Y' ? true : false,
    //         fphm: state['finalpayment'].fphm,
    //         djlb: state['finalpayment'].djlb,//单据类别
    //         receiptType: state['finalpayment'].receiptType,  //有小票或者无小票
    //         rqsj: state['invoice'].saleDate,
    //         realConsumersCard: state['invoice'].realConsumersCard,
    //         payModeInfo: state["initialize"].data.paymode,
    //         stallhotkeytemplate: state["initialize"].data.stallhotkeytemplate,
    //         mkt: state["initialize"].mkt,
    //         mktinfo: state["initialize"].data.mktinfo,
    //         syjh: state["initialize"].syjh,
    //         entid: state['initialize'].entid,
    //         erpCode: state["initialize"].erpCode,
    //         jygs: state["initialize"].jygs,
    //         interval: state["initialize"].interval,
    //         syspara: state["initialize"].Syspara,
    //         syjmain: state["initialize"].data.syjmain[0],
    //         online: state["initialize"].online,
    //         operators: state['login'].operuser.gh || state['login'].operuser.cardno,
    //         xph: state["initialize"].xph,
    //     };
    // } else {
    //     console.log("ms2p: ", state)
    //     return {
    //         flow_no: state['presale'].flow_no,
    //         vip_no: state['presale'].vipInfo ? state['presale'].vipInfo.memberId : null,
    //         vip_name: state['presale'].vipInfo ? state['presale'].vipInfo.memberNameChinese : null,
    //         uidlist: state['presale'].uidlist,
    //         limitedPays: state['presale'].limitedPays,//除外支付
    //         exceptPaycode: state['presale'].discountPayCode,//优惠支付
    //         exceptPayData: state['presale'].exceptPayData,
    //         djlb: state['presale'].isBl == true ? state['presale'].octozz : state['presale'].djlb,//单据类别
    //         switchEng: state['presale'].switchEng,//中false英文true
    //         dcData: state['presale'].dcData,  //DC送货信息
    //         breadFlag: state["initialize"].data.syjmain[0].isbreadpos === 'Y' ? true : false,
    //         isBl: state['presale'].isBl,
    //         isDj: state['presale'].isDj,
    //         isDc: state['presale'].isDc,
    //         isHs: state['presale'].isSd,
    //         isJFXH: state['presale'].isJFXH,
    //         addDjlb: state['presale'].octozz,
    //         isDiningHall: state['presale'].isDiningHall,
    //         amcNO: state['initialize'].amcNO,
    //         mkt: state["initialize"].mkt,
    //         xph: state["initialize"].xph,
    //         mktinfo: state["initialize"].data.mktinfo,
    //         sysparaData: state["initialize"].data.syspara,
    //         payModeInfo: state["initialize"].data.paymode,
    //         syjmain: state["initialize"].data.syjmain[0],
    //         stallhotkeytemplate: state["initialize"].data.stallhotkeytemplate,
    //         syjh: state["initialize"].syjh,
    //         fphm: state['initialize'].fphm,
    //         entid: state['initialize'].entid,
    //         erpCode: state["initialize"].erpCode,
    //         jygs: state["initialize"].jygs,
    //         interval: state["initialize"].interval,
    //         syspara: state["initialize"].Syspara,
    //         online: state["initialize"].online,
    //         zdsjtotal: state["invoice"].zdsjtotal || '0',//实际总金额
    //         zdyftotal: state["invoice"].zdyftotal || '0',//应付总金额
    //         zddsctotal: state["invoice"].zddsctotal || '0',//优惠金额
    //         sjtotal: state["invoice"].sjtotal || '0',//！！实际付款总金额
    //         goodsList: state["invoice"].goods || [],//商品列表
    //         salePayments: state["invoice"].salePayments || [], //！！支付列表
    //         coupon_gain: state["invoice"].coupon_gain || [],  //返券信息
    //         esystemStatus: state["invoice"].esystemStatus,
    //         memberInfo: state["invoice"].memberInfo,
    //         saveStatus: state["invoice"].saveStatus,
    //         jf: state["invoice"].jf || '0',  //本币获得积分
    //         curjf: state["invoice"].curjf || '0',   //当前积分
    //         outSideGiftsInfo: state["invoice"].outSideGiftsInfo,   //场外换购信息
    //         refundAuthzCardNo: state["invoice"].refundAuthzCardNo,
    //         terminalOperatorAuthzCardNo: state["invoice"].terminalOperatorAuthzCardNo,
    //         totalDiscAuthzCardNo: state["invoice"].totalDiscAuthzCardNo,
    //         recycleSer: state["invoice"].recycleSer,//四电一脑基础信息
    //         recycleSerInfo: state["invoice"].recycleSerInfo,//四电一脑详情
    //         popInfo: state["invoice"].popInfo, //整单折扣
    //         expressNumber: state["invoice"].expressNumber,//送货memo
    //         rqsj: state['invoice'].saleDate,
    //         eleStamp: state['invoice'].eleStamp,
    //         hasFastPay: state['invoice'].hasFastPay,
    //         sticker: state['invoice'].sticker,
    //         stamp: state['invoice'].stamp,
    //         stick: state['invoice'].stick,
    //         realConsumersCard: state['invoice'].realConsumersCard,
    //         operators: state['login'].operuser.gh || state['login'].operuser.cardno,
    //         giftList: state['presale'].giftList,  //赠品列表
    //         // cardNo: state['presale'].staffcard.cardNo,
    //         creditCardNo: state['presale'].staffcard.creditCardNo, //员工购物信用卡
    //         cardBin: state['presale'].staffcard.cardBin, //员工购物信用卡
    //         // staffNo: state['presale'].staffcard.staffNo,  //是员工工号
    //         // cardType: state['presale'].staffcard.cardType,  //1为员工购物  2为亲属购物
    //         consumersType: state["invoice"].consumersType,
    //         consumersCard: state["invoice"].consumersCard,
    //         cardNo: state["invoice"].staffCardNo,
    //         staffNo: state["invoice"].staffNo,
    //         cardType: state["invoice"].staffType,
    //         uploadData: state["initialize"].data.uploadData,
    //         pagerNO: state["initialize"].pagerNO,
    //         pagerType: state["initialize"].PagerType,
    //         octoDeviceId: state["presale"].octoDeviceId,
    //         octoCardId: state["presale"].octoCardId,
    //         octoFphm: state["presale"].octoFphm
    //     };
    // }
}

const mapDispatchToProps = (dispatch) => {
    return {
        trade: (operators, flow_no, mkt, syjh) => dispatch(trade(operators, flow_no, mkt, syjh)),
        submit: (operators, flow_no, mkt, syjh, uidlist, puidlist, refNo) =>
            dispatch(submit(operators, flow_no, mkt, syjh, uidlist, puidlist, refNo)),
        init: () => dispatch(actions.init()),
        setState: (data) => dispatch(setState(data)),
        update: () => dispatch(updateXPH()),
        updateAMC: () => dispatch(updateAMC()),
        cashierWarn: (promptNum) => dispatch(isWarn(promptNum)),
        returnsubmit: (operators, flow_no, mkt, syjh, uidlist, puidlist) =>
            dispatch(returnsubmit(operators, flow_no, mkt, syjh, uidlist, puidlist)),
        deusubmit: (params) =>
            dispatch(duesubmit(params)),
        print: (printDate) => dispatch(print(printDate)),
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Pay4EliminateService);
