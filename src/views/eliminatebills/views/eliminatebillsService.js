import React, { Component } from 'react';
import EliminateBills from './eliminatebills.js';
import { connect } from 'react-redux';
import { returnGoods, init, vip } from '../Actions';
import '../style/eliminatebills.less';
import moment from 'moment';
import { Fetch } from '@/fetch/';
import Url from '@/config/url.js';
import message from '@/common/components/message';
import EventEmitter from '@/eventemitter/';
import RechargeKeypad from '@/common/components/rechargeKeypad/index.js';
import ExtraPayModal from '@/common/components/extraPay/index.js';
import { Modal } from 'antd';

//状态组件
class EliminateBillsService extends Component {
    constructor(props) {
        super(props);
        this.state = {
            goodsList: [],
            totalData: 0,
            pagination: {   //分页参数
                pageSize: 6,
                current: 1,
                size: 'large'
            },
            flowNo: "",
            fphm: "",
            confirmStatus: 0,
            vipInfo: {},
            djlb: 2,
            orderType: "",
            payments: [],
            switchEng: false,
            cause: null,
            ymdNo: "",
            ysyjNo: "",
            yxpNo: "",
            addGoodsTime: "",
            dzyh: null,
            swyh: null,
            staff: null
        };
    }

    componentWillMount() {
        let { goodsList, zdyftotal, status, flow_no, payments, switchEng, cause, confirmStatus, ymdNo, ysyjNo, yxpNo, vip, orderType, addGoodsTime, staff } = this.props.eliminatebills;
        if (status) {
            EventEmitter.on('Com', this.com);
        }
        if (flow_no) {
            let data = {
                flowNo: flow_no,
                goodsList,
                switchEng,
                totalData: zdyftotal,
                payments,
                cause,
                confirmStatus,
                vipInfo: vip,
                ymdNo,
                ysyjNo,
                yxpNo,
                orderType,
                addGoodsTime,
                staff
            };
            this.setState(data);
        }
    }

    componentWillUnmount() {
        EventEmitter.off('Com', this.com);
    }

    render() {
        let props = {
            goodsList: this.state.goodsList,
            totalData: this.state.totalData,
            pick: this.pick,
            allHandle: this.allHandle,
            pagination: this.state.pagination,
            select: this.select,
            confirm: this.confirm,
            submit: this.submit,
            onCancel: this.onCancel,
            onBack: this.onBack,
            onPageChange: this.onPageChange,
            confirmStatus: this.state.confirmStatus,
            fphm: this.props.initialState.fphm,
            operator: this.props.operators && this.props.operators.gh,
            vip: this.state.vipInfo,
            switchEng: this.state.switchEng,
            onSwitchEng: this.onSwitchEng,
            threason: this.props.initialState.data.threason || [],
            cause: this.state.cause,
            ymdNo: this.state.ymdNo,
            ysyjNo: this.state.ysyjNo,
            yxpNo: this.state.yxpNo,
            payments: this.state.payments,
            syspara: this.props.initialState.Syspara,
            itemCode: this.itemCode,
            staff: this.state.staff
        };
        return (
            <EliminateBills {...props}></EliminateBills>
        );
    }

    onSwitchEng = () => {
        this.setState({
            switchEng: !this.state.switchEng
        })
    }

    itemCode = (recordNo, callback) => {
        const req = {
            command_id: "REFRESHRECYCLESERINFO",
            recordNo,
            flow_no: this.state.flowNo,
            operators: this.props.operators && this.props.operators.gh,
            mkt: this.props.initialState.mkt,
            syjh: this.props.initialState.syjh,
        };
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            const { retflag, retmsg } = res;
            if ("0" === retflag) {
                callback();
            } else {
                message(retmsg);
            }
        }).catch((error) => {
            console.error('error', error);
            throw new Error(error);
        });
    }

    //初始化退货
    init = (reasonId) => {
        console.log("eliminate INIT: ", this.props)
        let reason;
        this.props.initialState.data.threason.forEach(item => {
            if (item.code == reasonId) reason = item.cnName;
        })
        let params = {
            terminalOperator: this.props.operators && this.props.operators.gh,
            shopCode: this.props.initialState.mkt,
            shopID: this.props.initialState.mkt,
            terminalNo: this.props.initialState.syjh,
            saleDate: moment().format('YYYY-MM-DD HH:MM:SS'),
            orderType: this.state.djlb,
            terminalSno: this.props.initialState.xph,
            channel: 'javapos',
            flag: '0',
            shopName: this.props.initialState.data.mktinfo.mktname,
            entId: this.props.initialState.entid,
            erpCode: this.props.initialState.jygs,
            // gz: '1',
            // yyyh: "9527",
            language: 'CHN',
            //expdate: '1',
            precisionMode: this.props.initialState.data.syjmain[0] && this.props.initialState.data.syjmain[0].sswrfs || '0',
            reasonId,
            reason,
            accreditNo: this.props.initialState.sqkh || this.props.operators.gh,
            popMode: this.props.initialState.popMode,
            scheduleCode: this.props.login.data.workRound
        };
        const req = { command_id: "POSCERTIFY", ...params };
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            const { returncode, data } = res;
            if ("0" === returncode) {
                let { addGoodsTime } = this.state;
                if (addGoodsTime === "") {
                    addGoodsTime = moment().format('DD/MM/YYYY HH:mm:ss');
                }
                this.setState({ addGoodsTime });
                return res.data.flowNo;
            } else {
                message(data);
            }
        }).catch((error) => {
            console.error('error', error);
            throw new Error(error);
        });
    }

    select = ({ yfphm, retCause, oldShopCode, oldTerminalNo, oldTerminalSno }) => {
        this.setState({ goodsList: [], totalData: 0 });
        this.init(retCause).then(flowNo => {
            if (flowNo) {
                yfphm = yfphm.slice(6);
                const req = {
                    oldShopCode,
                    oldTerminalNo,
                    oldTerminalSno,
                    command_id: "GETRETURNMESSCERTIFY",
                    flowNo,
                    terminalOperator: this.props.operators && this.props.operators.gh,
                    shopCode: this.props.initialState.mkt,
                    terminalNo: this.props.initialState.syjh,
                    accreditNo: this.props.initialState.sqkh,
                    type: "1"

                    // ymkt: this.props.initialState.mkt,
                    // ysyjh: this.props.initialState.syjh,
                    // yfphm,
                    // command_id: "GETRETURNMESSCERTIFY",
                    // flow_no,
                    // operators: this.props.operators && this.props.operators.gh,
                    // mkt: this.props.initialState.mkt,
                    // syjh: this.props.initialState.syjh,
                    // sqkh: this.props.initialState.sqkh,
                    // type: "1"
                };
                return Fetch({
                    url: Url.base_url,
                    type: "POST",
                    data: req
                }).then((res) => {
                    const { 
                        returncode: retflag, 
                        data: retmsg,
                    } = res;
                    if ("0" === retflag) {
                        const { 
                            goodsList, 
                            orderType, 
                            salePayments: payments, 
                            consumers_cardno, 
                            staffCardNo, 
                            staffType, 
                            // depositRefund, 
                            // logisticsMode,
                            // originFlowNo,
                            // originIdSheetNo,
                            // originLogisticsState,
                            // originOrderState,
                            // originTerminalNo,
                            // originTerminalOperator,
                            // originTerminalSno,
                            consumersData,
                        } = res.data.order;
                        let staff;
                        if (staffCardNo) {
                            staff = { staffCardNo, staffType };
                        }
                        if (orderType == '4' || orderType == "Y2") {
                            message('此单非消单类型！');
                        } else {
                            //会员
                            this.setState({ vipInfo: consumersData});
                            // if (consumers_cardno) {
                            //     this.props.vip({
                            //         operators: this.props.operators && this.props.operators.gh,
                            //         fphm: this.props.initialState.fphm,
                            //         flowNo,
                            //         memberId: consumers_cardno,
                            //         certifytype: 'ERP',
                            //         mkt: this.props.initialState.mkt,
                            //         syjh: this.props.initialState.syjh,
                            //         idtype: '1',
                            //     }).then(res => {
                            //         if (res) {
                            //             const { memberInfo, promptMessage } = res;
                            //             const vipInfo = memberInfo;
                            //             this.setState({ vipInfo });
                            //             if (promptMessage) {
                            //                 message(promptMessage);
                            //             }
                            //         }
                            //     })
                            // }
                            this.setState({
                                flowNo: flowNo,
                                goodsList,
                                readOnly: true,
                                confirmStatus: 1,
                                totalData: 0,
                                payments,
                                cause: retCause,
                                yxpNo: yfphm,
                                orderType,
                                staff
                            });
                        }
                    } else {
                        message(retmsg);
                    }
                }).catch((error) => {
                    console.error('error', error);
                    throw new Error(error);
                });
            }
        });
    }

    setTotal = (pickArr) => {
        let totalData = { totalPrice: 0, num: 0, price: 0, discounts: 0 };
        for (let arr = this.state.goodsList, i = 0, len = arr.length; i < len; i++) {
            if (pickArr[i]) {
                totalData.num += 1;
                totalData.totalPrice += parseFloat(arr[i].price);
            }
        }
        this.setState({ totalData });
    }

    //确认退货商品
    finishback = (goodslist) => {
        const req = {
            command_id: "FINISHBACKSALEGOODS",
            flowNo: this.state.flowNo,
            terminalOperator: this.props.operators && this.props.operators.gh,
            shopCode: this.props.initialState.mkt,
            terminalNo: this.props.initialState.syjh,
            goodslist,
            orderType: this.state.orderType
        }
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            const { returncode: retflag, data: retmsg } = res;
            if ("0" === retflag) {
                let { goodsList, zdyftotal } = res.data.order;
                this.setState({ goodsList, totalData: zdyftotal });
                return goodsList;
            } else {
                message(retmsg);
            }
        }).catch((error) => {
            console.error('error', error);
            throw new Error(error);
        });
    }

    submit = () => {
        let goodslist = [];
        this.state.goodsList.forEach((item, index) => {
            if (item) {
                let { guid, qty } = this.state.goodsList[index];
                goodslist.push({ guid, qty });
            }
        });
        this.finishback(goodslist).then(res => {
            if (res) {
                this.setState({ confirmStatus: 1 });
                const req = {
                    command_id: "CALCULATERETURNCERTIFY",
                    flowNo: this.state.flowNo,
                    terminalOperator: this.props.operators && this.props.operators.gh,
                    shopCode: this.props.initialState.mkt,
                    terminalNo: this.props.initialState.syjh,
                    notYpopPayCodes: "",
                    autoBackPayCode: "0666",
                    calcMode: "0",
                    goodsList: this.state.goodsList
                };
                this.props.rg(req).then(res => {
                    let { returncode: retflag, data: retmsg } = res;
                    if (retflag == "0") {
                        this.calcreturn(res.data);
                    } else {
                        message(retmsg);
                    }
                }).catch(err => {
                    throw new Error(err);
                });
            }
        });
    }

    calcreturn = (res) => {
        switch (res.resultmode) {
            case "1":
                ExtraPayModal.open({
                    type: 'retGiftList',
                    data: res,
                    callback: (params) => {
                        if (params) {
                            let giftMode = "0";
                            if (params.length != res.gifts.length) {
                                Modal.confirm({
                                    className: 'vla-confirm',
                                    title: '扣回模式',
                                    content: '不退的贈品是否需要扣回？',
                                    okText: '是',
                                    cancelText: '否',
                                    onOk: () => {
                                        const req = {
                                            command_id: "CALCULATERETURNCERTIFY",
                                            flowNo: this.state.flowNo,
                                            terminalOperator: this.props.operators && this.props.operators.gh,
                                            shopCode: this.props.initialState.mkt,
                                            terminalNo: this.props.initialState.syjh,
                                            notYpopPayCodes: "",
                                            autoBackPayCode: "0666",
                                            calcMode: "1",
                                            goodsList: this.state.goodsList,
                                            gifts: params,
                                            giftMode
                                        };
                                        this.props.rg(req).then(res => {
                                            let { returncode: retflag, data: retmsg } = res;
                                            if (retflag == "0") {
                                                ExtraPayModal.close();
                                                this.calcreturn(res.data);
                                            } else {
                                                message(retmsg);
                                            }
                                        });
                                    },
                                    onCancel: () => {
                                        giftMode = "1";
                                        const req = {
                                            command_id: "CALCULATERETURNCERTIFY",
                                            flowNo: this.state.flowNo,
                                            terminalOperator: this.props.operators && this.props.operators.gh,
                                            shopCode: this.props.initialState.mkt,
                                            terminalNo: this.props.initialState.syjh,
                                            notYpopPayCodes: "",
                                            autoBackPayCode: "0666",
                                            calcMode: "1",
                                            goodsList: this.state.goodsList,
                                            gifts: params,
                                            giftMode
                                        };
                                        this.props.rg(req).then(res => {
                                            let { returncode: retflag, data: retmsg } = res;
                                            if (retflag == "0") {
                                                ExtraPayModal.close();
                                                this.calcreturn(res.data);
                                            } else {
                                                message(retmsg);
                                            }
                                        });
                                    }
                                });
                            } else {
                                const req = {
                                    command_id: "CALCULATERETURNCERTIFY",
                                    flowNo: this.state.flowNo,
                                    terminalOperator: this.props.operators && this.props.operators.gh,
                                    shopCode: this.props.initialState.mkt,
                                    terminalNo: this.props.initialState.syjh,
                                    notYpopPayCodes: "",
                                    autoBackPayCode: "0666",
                                    calcMode: "1",
                                    goodsList: this.state.goodsList,
                                    gifts: params,
                                    giftMode
                                };
                                this.props.rg(req).then(res => {
                                    let { returncode: retflag, data: retmsg } = res;
                                    if (retflag == "0") {
                                        ExtraPayModal.close();
                                        this.calcreturn(res.data);
                                    } else {
                                        message(retmsg);
                                    }
                                });
                            }
                        }
                    }
                });
                break;
            case "0":
                if (res.electronicStamp) {
                    this.setState({ dzyh: res.electronicStamp });
                    Modal.info({
                        className: 'vla-confirm',
                        title: '扣除印花',
                        content: `「已於電子會員帳戶扣除${res.electronicStamp}個印花」`,
                        okText: '確定',
                        onOk: () => {
                            this.toInvoice();
                        }
                    });
                } else {
                    this.toInvoice();
                }
                break;
            case "99":
                this.setState({ swyh: parseInt(res.tempPhysicalStamp) });
                const req = {
                    command_id: "CALCULATERETURNCERTIFY",
                    flowNo: this.state.flowNo,
                    terminalOperator: this.props.operators && this.props.operators.gh,
                    shopCode: this.props.initialState.mkt,
                    terminalNo: this.props.initialState.syjh,
                    notYpopPayCodes: "",
                    autoBackPayCode: "0666",
                    calcMode: "99",
                    goodsList: this.state.goodsList,
                    physicalStamp: parseInt(res.tempPhysicalStamp)
                };
                this.props.rg(req).then(res => {
                    let { returncode: retflag, data: retmsg } = res;
                    if (retflag == "0") {
                        Modal.info({
                            className: 'vla-confirm',
                            title: '扣除印花',
                            content: `「已扣除${req.physicalStamp}個紙質印花」`,
                            okText: '確定',
                            onOk: () => {
                                this.toInvoice();
                                window.openCashbox();
                            }
                        });
                    } else {
                        message(retmsg);
                    }
                });
                break;
            default:
                this.toInvoice();
                break;
        }
    }

    toInvoice = () => {
        let { flowNo, orderType, payments, switchEng, cause, vipInfo, yxpNo, confirmStatus, addGoodsTime, dzyh, swyh } = this.state;
        let isDiningHall = this.props.initialState.data.syjmain[0] && this.props.initialState.data.syjmain[0].touchposmode === 3;//美食广场版本
        let data = {
            fphm: this.props.initialState.fphm,
            orderType,
            payments,
            switchEng,
            cause,
            vip: vipInfo,
            addGoodsTime,
            yxpNo,
            confirmStatus,
            dzyh,
            swyh,
            isDiningHall
        };
        this.handleEjoural(this.state.goodsList);
        this.props.init(flowNo, data);
        let path = {
            // pathname: '/invoice',
            pathname: 'pay4Sale',
            state: { type: "eliminatebills" },
        }
        this.props.history.push(path);
    }

    onCancel = () => {
        this.setState({ flowNo: "", goodsList: [], confirmStatus: 0, totalData: 0, vipInfo: {} });
    }

    onBack = () => {
        this.props.init();
        this.props.history.push("/home");
    }

    onPageChange = (e) => {
        this.setState({
            pagination: e
        })
    }


    handleEjoural = (item) => {
        let ejouralTxt = `      V O I D    R E C E I P T\r\nSHOP ${this.props.initialState.mkt}/${this.props.initialState.syjh}  REF ${this.props.initialState.syjh + this.props.initialState.fphm}  ${moment().format('DD/MM/YY')}\r\nOPERATOR ${this.props.operators.gh}  ${moment().format('HH:mm:ss')}`;
        const fillLength = (num, n) => (num + '').length < n ? (Array(n).join(" ") + num).slice(-n) : num
        const addTxt = (item, index) => {
            let txt = `${fillLength(index, 3)} ${fillLength(item.incode, 9)} ${fillLength('-' + item.qty, 3)}@${fillLength((item.price * 1).toFixed(2), 9)} ${fillLength('-' + (item.dsctotal ? item.total * 1 : item.ysje * 1).toFixed(2), 9)} (${item.category})`
            if (item.dsctotal) {
                txt += `\r\n       DISC.$   ${fillLength((item.dsctotal * 1).toFixed(2), 15)}`
            }
            return txt;
        }
        item.forEach((_item, _index) => {
            ejouralTxt += `\r\n${addTxt(_item, _index + 1, 3)}`
        })
        window.Log(ejouralTxt, '1');
    }

}

const mapStateToProps = (state) => {
    return {
        eliminatebills: state.eliminatebills,
        initialState: state.initialize,
        operators: state.login.operuser,
        login: state.login,
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        rg: (req) => dispatch(returnGoods(req)),
        init: (no, params) => dispatch(init(no, params)),
        vip: (params) => dispatch(vip(params)),
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(EliminateBillsService);