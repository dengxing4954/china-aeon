import React, { Component } from 'react'
import { 
    Row, Col, Layout, 
    Icon, Button, Modal 
} from 'antd'
import { Spin } from "antd/lib/index"
import intl from 'react-intl-universal'
import moment from 'moment'
import { 
    trade, submit, returnsubmit, 
    duesubmit, print,
} from '../Actions.js';
import actions from '@/views/presale/Actions.js'
import * as returnactions from '@/views/returngoods/Actions.js'
import * as eliminateactions from '@/views/eliminatebills/Actions.js'
import { updateXPH, updateAMC, isWarn, setState } from '@/views/initialize/Actions.js'
import { connect } from 'react-redux'
import InvoiceLeft from './InvoiceLeft'
import EventEmitter from '@/eventemitter'
import { Fetch } from '@/fetch/'
import Url from '@/config/url.js'
import message from '@/common/components/message'
import PaymentBox from '@/common/components/paymentBox'
import withKeyBoard from '@/common/components/keyBoard';
import calculate from '../../../common/calculate'
import {
    initButtons, handleEjoural, afterPayHandle,
    cancelPay, deletepay, finalSubmit, showPayDialog, 
    hidePayDialog
} from '../utils'
import '../style/invoice.less'


const { Sider, Content } = Layout;

// orderType 2为消单;4为退货;
class Pay4SaleService extends Component {

    constructor(props) {
        super(props);
        this.state = {
            paymodeCollapsed: true,
            delVisible: false,//删除付款
            payDialogData: {},//当前支付方式属性
            puid: "",
            payList: [],//付款信息 
            yftotal: 0,//已收金额 sjtotal
            sftotal: 0,//剩余应付 remainValue
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
            isPrint: false,
            na: 0,
            returncode: "0",
            retmsg: '',
            oldFphm: '',
            cacelButtonDisabled: false,

            /****************中百新增*********************/
            pagination: {
                pageSize: 5,
                current: 1,
                hideOnSinglePage: true,
                onChange: this.pageChange,
                size: 'large'
            },
            selectedPay: 0, //键盘选择支付方式index
            selectedDetail: 0, //键盘选择支付行index
            payRow: 4, //payList一行展示条数
            showBox: false,  // 支付方式弹框
            orderType: '1', // 订单类型  1销售 4退货
        };
    }

    componentDidMount() {
        console.log("IS: ", this.props, this.state)
        this.bindObj = {
            //pageUP
            "33": () => {
                //商品列表下翻页
                this.handlePage('next');
            },
            //pageDown
            "34": () => {
                //商品列表上翻页
                this.handlePage('pre');                
            },
            //end
            "35": () => {
                if(this.state.showBox) {
                    hidePayDialog.call(this);
                }
            },
            //home
            "36": () => {
                if(!this.state.showBox) {
                    let {selectedPay, paymode} = this.state;
                    showPayDialog.call(this, paymode[selectedPay]);
                }else{
                    this.refs.PaymentBox.paySubmit();
                }
            }, 
            //左箭头
            "37": () => {
                this.handlePayKey('left');
            },
            //上箭头
            "38": () => {
                this.handlePayKey('up');
            },
            //右箭头 
            "39": () => {
                this.handlePayKey('right');
            },
            //下箭头
            "40": () => {
                this.handlePayKey('down');
            },
            //f1
            '112': () => { //付款点击完成
                this.invoiceSubmit();
            },
            //f5
            "116": () => {this.repullSale()},// 重拉整单
            //f7
            "118": () => {cancelPay.call(this)}, //返回销售
            //f8 
            "119": () => { //支付行up
                if(this.state.selectedDetail !== 0) {
                    this.setState({selectedDetail: this.state.selectedDetail-1})
                }
            },
            
            //f9
            "120": () => { //支付行down
                if( this.state.selectedDetail < this.state.payList.length - 1 ) {
                    this.setState({selectedDetail: this.state.selectedDetail+1})
                }
            },
            //f10
            "121": () => { //删除支付行
                let {payList, selectedDetail} = this.state
                payList.length !== 0 && deletepay.call(this,payList[selectedDetail]);
            },
            //f12 
            "123": () => {
                //支付方式列表收起和更多
                if(!this.state.paymodeCollapsed && this.state.selectedPay > 7) {
                    this.setState({selectedPay: 0});           
                }
                this.setState({paymodeCollapsed: !this.state.paymodeCollapsed});  
            }
        }
        this.props.bind(this.bindObj);
        //付款模板控制删除不能直接付款方式
        // let payModeInfo = this.props.payModeInfo.filter((item, index) => {
        //     return this.props.syspara.nozjfkpaycode.indexOf(item.code) === -1;
        // })   //2019.09.20 无可用的nozjfkpaycode配置，暂屏弊以上处理  by Chenxuan
        //初始化筛选payMode
        let payModeInfo = this.props.payModeInfo;
        const filterPayMode = (order) => {
            let paymode = [...payModeInfo];
            let arr = [
                {   
                    //退货
                    match: () => this.props.type === "returnGoods" && this.props.djlb != "Y2",
                    func: () => {
                        payModeInfo.map((item, index) => {
                            if (item.virtualPayType == "6") {
                                paymode.splice(index, 1)
                            }
                        })
                        paymode = paymode.filter((item) => {
                            return item.returnPayFlag === 'Y';
                        }) 
                    }
                },
                {    
                    //消单 
                    match: () => this.props.type === "eliminatebills",
                    func: () => {
                        let list = [];
                        paymode.forEach(item => {
                            this.props.eliminatePayments.forEach(v => {
                                v.payCode === item.code && list.push(item);
                            })
                        })
                        paymode = list;
                    }
                },
                {    
                    //销售 
                    match: () => this.props.type === "presale",
                    func: () => {
                        if (order.remainValue <= 0) {
                            let list = [];
                            paymode.forEach(item => {
                                if (item.code == this.props.syspara.bbcodeHBFH[0]) {
                                    list.push(item)
                                }
                            })
                            paymode = list;
                        }
                    }
                },
            ]
            arr.map(item => {
                item.match() && item.func()
            })
            this.setState({paymode})
        }
        this.props.trade(this.props.operators, this.props.flowNo, this.props.mkt, this.props.syjh).then((res) => {
            // window.LineDisplay({ data: { total: res.total }, type: 2 })
            let {order} = res;
            filterPayMode(order);
            let stt = {
                sftotal: order.remainValue,
                yftotal: this.props.sjtotal ? this.props.sjtotal : 0,//已经付款金额
                payList: this.props.salePayments ? [...this.props.salePayments] : [],
                isrenderBox: true,
                orderType: order.orderType
            }
            this.setState(stt);
        });
    }

    //重拉整单
    repullSale = () => {
        this.props.trade(this.props.operators, this.props.flowNo, this.props.mkt, this.props.syjh).then((res) => {
            if (res) {
                let {order} = res;
                this.setState({
                    sftotal: order.remainValue,//剩余应付
                    yftotal: this.props.sjtotal ? this.props.sjtotal : 0,//已经付款金额
                    payList: this.props.salePayments ? [...this.props.salePayments] : []
                })
            }
        })
    }

    //完成付款
    invoiceSubmit = () => {
        let {sftotal} = this.state;
        if(sftotal > 0) {
            message('请付清余款!');
        }else{
            finalSubmit.call(this)
        }
    }

    pageChange= (page) => {
        let {pagination} = this.state;
        pagination.current = page;
        this.setState({pagination});
    }

    //商品展示列表翻页
    handlePage = (flag) => {
        let {pagination} = this.state;
        let {goodsList} = this.props;
        if (flag === 'next') {
            let totalPage = Math.ceil(goodsList.length / pagination.pageSize)
            totalPage > pagination.current && pagination.current++;
        }else{
            pagination.current > 1 && pagination.current--;
        }
        this.setState({pagination});
    }

    //支付方式键盘事件
    handlePayKey = (type) => {
        let {selectedPay, payRow} = this.state;
        let payList = [];
        if (this.state.paymodeCollapsed){
            for (let i = 0; i < payRow *2 - 1; i++) {
                if (!!this.state.paymode && !!this.state.paymode[i]) {
                    payList.push(this.state.paymode[i]);
                }
            }
        } else {
            if (!!this.state.paymode) {
                for (let i = 0; i < this.state.paymode.length; i++) {
                    if (!!this.state.paymode[i]) {
                        this.state.paymode[i].code != "0602" && payList.push(this.state.paymode[i]);
                    }
                }
            }
        }
        let funArr = [
            {
                match: () => type ==='left',
                func: () => {
                    if(selectedPay > 0) {
                        this.setState({
                            selectedPay: selectedPay - 1
                        })
                    }
                }
            },
            {
                match: () => type ==='up',
                func: () => {
                    if(selectedPay > payRow - 1) {
                        this.setState({
                            selectedPay: selectedPay - payRow
                        })
                    }
                }
            },
            {
                match: () => type ==='right',
                func: () => {
                    if(selectedPay < payList.length -1) {
                        this.setState({
                            selectedPay: selectedPay + 1
                        })
                    }
                }
            },
            {
                match: () => type ==='down',
                func: () => {
                    if(selectedPay < payList.length - payRow) {
                        this.setState({
                            selectedPay: selectedPay + payRow
                        })
                    }
                }
            }
        ]
        funArr.map(item => {
            item.match() && item.func()
        })
    }

    /** 筛选payModeData */
    filterPayMode = (payDialogData) => {
        let obj;
        let funArr = [
            {
                //现金支付方式
                match: () => payDialogData.virtualPayType == '0',
                func: () => {
                    obj = Object.assign(payDialogData, {refModal: 'Cash'});   
                }
            },
            {
                //武汉通
                match: () => payDialogData.virtualPayType === 4 && payDialogData.code == "3102",
                func: () => {
                    obj = Object.assign(payDialogData, {refModal: 'WuhanCard'});   
                }
            },
            {
                //ICBC工行设备
                match: () => payDialogData.virtualPayType === 3 && payDialogData.code == "3114",
                func: () => {
                    obj = Object.assign(payDialogData, {refModal: 'ICBCCard'});   
                }
            },
            {
                //GMCCard银联设备
                match: () => payDialogData.virtualPayType === 3 && (payDialogData.code == "0299"|| payDialogData.code == "0428"),
                func: () => {
                    obj = Object.assign(payDialogData, {refModal: 'GMCCard'});   
                }
            },
            {
                //SvCard券平台
                match: () => payDialogData.virtualPayType === 5 && payDialogData.code == "0006",
                func: () => {
                    obj = Object.assign(payDialogData, {refModal: 'SvCard'});   
                }
            },
            {
                //StoreValueCard 储值卡
                match: () => payDialogData.virtualPayType === 3 && payDialogData.code == "0003",
                func: () => {
                    obj = Object.assign(payDialogData, {refModal: 'StoreValueCard'});   
                }
            },
            {
                match: () => JSON.stringify(payDialogData) === '{}',
                func: () => {obj = {}}
            }
        ]
        funArr.map(item => {
            item.match() && item.func()
        })
        return obj
    }


    render() {
        const { 
            cardBin,
            erpCode,
            exceptPaycodes,
            expressNumber,
            flowNo,
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
            vip_info,
            vip_name, 
            vip_no, 
            zddsctotal, 
            zdsjtotal, 
            zdyftotal,
            saleDate
        } = this.props;
        const {
            change,
            changename,
            isrenderBox,
            payList,
            sftotal,
            orderType,
            yftotal
        } = this.state;
        const origin = {
            flowNo: this.props.originFlowNo,
            idSheetNo: this.props.originIdSheetNo,            
        }

        let _bList = initButtons.call(this, false);
        let _bListAll = initButtons.call(this, true);
        let payDetailList = payList.map((item, index) => {
            if (JSON.stringify(item) === '[]') {
                return null;
            }
            let res = null;
            if (item.flag !== "2" && item.flag !== "3") {
                res = (<div className= {`payDetailItem ${this.state.selectedDetail === index ? "selected": '' }`} key={index} >
                    <p>{item.payName}</p>
                    <p>{!!item.payNo && item.payNo.length > 10 ? (item.payNo.substr(0, 2) + "**" + item.payNo.substr(item.payNo.length - 6, 6)) : item.payNo}</p>
                    <p>{item.amount}</p>
                    <p>{Number(item.money).toFixed(2)}</p>
                    <div className="del">
                        {/* 八达通方式的付款行不可删除 */
                            item.paytype === "4" ? null : (<span className="sc" onClick={() => {
                                deletepay.call(this, item);
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
            flowNo,
            fphm,
            mkt,
            saleDate,
            operators,
            scene: "0",
            staffCard: this.props.creditCardNo || this.props.staffNo,
            syjh,
            orderType,
            vip_info,
            origin
        };
        console.log("###Render: ", this.props, this.state)
        return (
            <div className="invoice">
                <InvoiceLeft 
                    goodsList={goodsList}
                    zdyftotal={zdyftotal}
                    oldFphm={this.state.oldFphm}
                    pagination = {this.state.pagination}
                    zdsjtotal={zdsjtotal}
                    zddsctotal={zddsctotal}
                    vip_info={vip_info}
                    vip_name={vip_name}
                    vip_no={vip_no}
                    fphm={fphm}
                    syjh= {syjh}
                    mkt={mkt}
                    repullSale={this.repullSale}
                    operators={operators}
                    orderType={this.state.orderType}
                    pageChange = {this.pageChange}
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
                                    <p>{orderType == "4" || orderType == "2" ? "已退金额：" : "已收金额："}<br /><span
                                        className="num">{syspara.bbcodeHBFH[1] + parseFloat(yftotal).toFixed(2)}</span></p>
                                    <p>{sftotal >= 0 ? "剩余应付：" : changename + ":"}<br />
                                        <span
                                            className="num zhongbainum">{sftotal > 0 ? syspara.bbcodeHBFH[1] + sftotal.toFixed(2) : syspara.bbcodeHBFH[1] + parseFloat(change).toFixed(2)}</span>
                                    </p>
                                    {/*<p>{overage !== 0 ? "损益：" : ""}<br/>*/}
                                    {/*<span className="num">{overage !== 0 ? syspara.bbcodeHBFH[1] + overage : ""}</span></p>*/}
                                </Col>
                                <Col span={24} className="buttons">
                                    <Button 
                                        onClick={() => cancelPay.call(this)} 
                                        type="primary" className="res"
                                        disabled={this.props.cacelButtonDisabled}
                                        >取消</Button>
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
                            ref='PaymentBox'
                            _paymentBox = {this}
                            showBox = {this.state.showBox}
                            bindObj = {this.bindObj}
                            autoPay={(
                                (!!this.state.query && !!this.state.query.djlb) && 
                                ((this.state.query.djlb === 'Y3' || this.state.query.djlb === 'Y9') && this.state.query.isBl == "true")
                                )?true:false}
                            autoPayInfo={payModeInfo.find(v => v.paytype == '1')}
                            extra={extra} 
                            octoDeviceId={octoDeviceId}
                            octoCardId={octoCardId}
                            payModeData={this.filterPayMode(this.state.payDialogData)} 
                            sftotal={sftotal} 
                            syspara={syspara} 
                            sysparaData={sysparaData} 
                            vip_no={vip_no} 
                            zdyftotal={zdyftotal}
                            afterZKpay={this.afterZKpay}
                            // onAfterPay={afterPayHandle}
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

}


const mapStateToProps = (state, ownProps) => {
    console.log("Payment4SaleService", state, ownProps);
    let router = ownProps.location;
    let defaultProps = {
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
        uploadData: state["initialize"].data.uploadData,
        pagerNO: state["initialize"].pagerNO,
        pagerType: state["initialize"].PagerType,
        zdsjtotal: state["invoice"].zdsjtotal || '0',//实际总金额
        zdyftotal: state["invoice"].zdyftotal || '0',//应付总金额
        zddsctotal: state["invoice"].zddsctotal || '0',//优惠金额
        sjtotal: state["invoice"].sjtotal || '0',//！！实际付款总金额
        goodsList: state["invoice"].goods || [],//商品列表
        salePayments: state["invoice"].salePayments || [], //！！支付列表
        coupon_gain: state["invoice"].coupon_gain || [],  //返券信息
        operators: state['login'].operuser.gh || state['login'].operuser.cardno,   
        saleDate: state['invoice'].saleDate,    
    };
    if (router.state && router.state.type === "returnGoods") {
        //退货
        return {
            ...defaultProps,
            type: router.state.type,
            flowNo: state['returngoods'].flow_no,
            returnCause: state['returngoods'].cause,
            fphm: state['returngoods'].fphm,
            returnPayments: state['returngoods'].payments,
            uidlist: state['returngoods'].uidlist,
            ysyjNo: state['returngoods'].ysyjNo,
            yxpNo: state['returngoods'].yxpNo,
            ymdNo: state['returngoods'].ymdNo,
            orderType: state['returngoods'].orderType,
            originFlowNo: state['returngoods'].originFlowNo,
            originIdSheetNo: state['returngoods'].originIdSheetNo,
            originLogisticsState: state['returngoods'].originLogisticsState,
            originOrderState: state['returngoods'].originOrderState,
            originTerminalNo: state['returngoods'].originTerminalNo,
            originTerminalOperator: state['returngoods'].originTerminalOperator,
            originTerminalSno: state['returngoods'].originTerminalSno,
            vip_info: state['returngoods'].vip || null, 
            vip_no: state['returngoods'].vip ? state['returngoods'].vip.consumersCard : null,
            vip_name: state['returngoods'].vip ? state['returngoods'].vip.consumersCName : null,
        }
    }else if (router.state && router.state.type === "eliminatebills") {
        //消单
        return {
            ...defaultProps,
            type: router.state.type,
            flowNo: state['eliminatebills'].flow_no,
            eliminateCause: state['eliminatebills'].cause,
            fphm: state['eliminatebills'].fphm,
            eliminatePayments: state['eliminatebills'].payments,
            uidlist: state['eliminatebills'].uidlist,
            // ysyjNo: state['returngoods'].ysyjNo,
            yxpNo: state['eliminatebills'].yxpNo,
            // ymdNo: state['returngoods'].ymdNo,
            orderType: state['eliminatebills'].orderType,
            // originFlowNo: state['returngoods'].originFlowNo,
            // originIdSheetNo: state['returngoods'].originIdSheetNo,
            // originLogisticsState: state['returngoods'].originLogisticsState,
            // originOrderState: state['returngoods'].originOrderState,
            // originTerminalNo: state['returngoods'].originTerminalNo,
            // originTerminalOperator: state['returngoods'].originTerminalOperator,
            // originTerminalSno: state['returngoods'].originTerminalSno
            vip_info: state['eliminatebills'].vip || null, 
            vip_no: state['eliminatebills'].vip ? state['eliminatebills'].vip.consumersCard : null,
            vip_name: state['eliminatebills'].vip ? state['eliminatebills'].vip.consumersCName : null,
        }

    }else {
        //销售
        return {
            ...defaultProps,
            type: router.state.type,
            flowNo: state['presale'].flow_no,
            vip_info: state['presale'].vipInfo || null, 
            vip_no: state['presale'].vipInfo ? state['presale'].vipInfo.consumersCard : null,
            vip_name: state['presale'].vipInfo ? state['presale'].vipInfo.consumersCName : null,
            uidlist: state['presale'].uidlist,
            limitedPays: state['presale'].limitedPays,//除外支付
            exceptPaycode: state['presale'].discountPayCode,//优惠支付
            exceptPayData: state['presale'].exceptPayData,
            djlb: state['presale'].isBl == true ? state['presale'].octozz : state['presale'].djlb,//单据类别
            switchEng: state['presale'].switchEng,//中false英文true
            dcData: state['presale'].dcData,  //DC送货信息
            isBl: state['presale'].isBl,
            isDj: state['presale'].isDj,
            isDc: state['presale'].isDc,
            isHs: state['presale'].isSd,
            isJFXH: state['presale'].isJFXH,
            addDjlb: state['presale'].octozz,
        }
    }
    // return {
    //     flowNo: state['presale'].flow_no,
    //     vip_no: state['presale'].vipInfo ? state['presale'].vipInfo.memberId : null,
    //     vip_name: state['presale'].vipInfo ? state['presale'].vipInfo.memberNameChinese : null,
    //     uidlist: state['presale'].uidlist,
    //     limitedPays: state['presale'].limitedPays,//除外支付
    //     exceptPaycode: state['presale'].discountPayCode,//优惠支付
    //     exceptPayData: state['presale'].exceptPayData,
    //     djlb: state['presale'].isBl == true ? state['presale'].octozz : state['presale'].djlb,//单据类别
    //     switchEng: state['presale'].switchEng,//中false英文true
    //     dcData: state['presale'].dcData,  //DC送货信息
    //     breadFlag: state["initialize"].data.syjmain[0].isbreadpos === 'Y' ? true : false,
    //     isBl: state['presale'].isBl,
    //     isDj: state['presale'].isDj,
    //     isDc: state['presale'].isDc,
    //     isHs: state['presale'].isSd,
    //     isJFXH: state['presale'].isJFXH,
    //     addDjlb: state['presale'].octozz,
    //     isDiningHall: state['presale'].isDiningHall,
    //     amcNO: state['initialize'].amcNO,
    //     mkt: state["initialize"].mkt,
    //     xph: state["initialize"].xph,
    //     mktinfo: state["initialize"].data.mktinfo,
    //     sysparaData: state["initialize"].data.syspara,
    //     payModeInfo: state["initialize"].data.paymode,
    //     syjmain: state["initialize"].data.syjmain[0],
    //     stallhotkeytemplate: state["initialize"].data.stallhotkeytemplate,
    //     syjh: state["initialize"].syjh,
    //     fphm: state['initialize'].fphm,
    //     entid: state['initialize'].entid,
    //     erpCode: state["initialize"].erpCode,
    //     jygs: state["initialize"].jygs,
    //     interval: state["initialize"].interval,
    //     syspara: state["initialize"].Syspara,
    //     online: state["initialize"].online,
    //     zdsjtotal: state["invoice"].zdsjtotal || '0',//实际总金额
    //     zdyftotal: state["invoice"].zdyftotal || '0',//应付总金额
    //     zddsctotal: state["invoice"].zddsctotal || '0',//优惠金额
    //     sjtotal: state["invoice"].sjtotal || '0',//！！实际付款总金额
    //     goodsList: state["invoice"].goods || [],//商品列表
    //     salePayments: state["invoice"].salePayments || [], //！！支付列表
    //     coupon_gain: state["invoice"].coupon_gain || [],  //返券信息
    //     esystemStatus: state["invoice"].esystemStatus,
    //     memberInfo: state["invoice"].memberInfo,
    //     saveStatus: state["invoice"].saveStatus,
    //     jf: state["invoice"].jf || '0',  //本币获得积分
    //     curjf: state["invoice"].curjf || '0',   //当前积分
    //     outSideGiftsInfo: state["invoice"].outSideGiftsInfo,   //场外换购信息
    //     refundAuthzCardNo: state["invoice"].refundAuthzCardNo,
    //     terminalOperatorAuthzCardNo: state["invoice"].terminalOperatorAuthzCardNo,
    //     totalDiscAuthzCardNo: state["invoice"].totalDiscAuthzCardNo,
    //     recycleSer: state["invoice"].recycleSer,//四电一脑基础信息
    //     recycleSerInfo: state["invoice"].recycleSerInfo,//四电一脑详情
    //     popInfo: state["invoice"].popInfo, //整单折扣
    //     expressNumber: state["invoice"].expressNumber,//送货memo
    //     rqsj: state['invoice'].saleDate,
    //     eleStamp: state['invoice'].eleStamp,
    //     hasFastPay: state['invoice'].hasFastPay,
    //     sticker: state['invoice'].sticker,
    //     stamp: state['invoice'].stamp,
    //     stick: state['invoice'].stick,
    //     realConsumersCard: state['invoice'].realConsumersCard,
    //     operators: state['login'].operuser.gh || state['login'].operuser.cardno,
    //     giftList: state['presale'].giftList,  //赠品列表
    //     // cardNo: state['presale'].staffcard.cardNo,
    //     creditCardNo: state['presale'].staffcard.creditCardNo, //员工购物信用卡
    //     cardBin: state['presale'].staffcard.cardBin, //员工购物信用卡
    //     // staffNo: state['presale'].staffcard.staffNo,  //是员工工号
    //     // cardType: state['presale'].staffcard.cardType,  //1为员工购物  2为亲属购物
    //     consumersType: state["invoice"].consumersType,
    //     consumersCard: state["invoice"].consumersCard,
    //     cardNo: state["invoice"].staffCardNo,
    //     staffNo: state["invoice"].staffNo,
    //     cardType: state["invoice"].staffType,
    //     uploadData: state["initialize"].data.uploadData,
    //     pagerNO: state["initialize"].pagerNO,
    //     pagerType: state["initialize"].PagerType,
    //     octoDeviceId: state["presale"].octoDeviceId,
    //     octoCardId: state["presale"].octoCardId,
    //     octoFphm: state["presale"].octoFphm
    // };

    {
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
}

const mapDispatchToProps = (dispatch) => {
    return {
        trade: (terminalOperator, flowNo, shopCode, terminalNo) => dispatch(trade(terminalOperator, flowNo, shopCode, terminalNo)),
        submit: (operators, flow_no, mkt, syjh, uidlist, puidlist, refNo) =>
            dispatch(submit(operators, flow_no, mkt, syjh, uidlist, puidlist, refNo)),
        init: () => dispatch(actions.init()),
        returnInit: () => dispatch(returnactions.init()),
        eliminateInit: () => dispatch(eliminateactions.init()),
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

export default connect(mapStateToProps, mapDispatchToProps)(withKeyBoard(Pay4SaleService));
