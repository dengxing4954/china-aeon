import React, { Component } from 'react';
import { Row, Col, Layout, Icon, Button, Modal } from 'antd';
import { Spin } from "antd/lib/index";
import intl from 'react-intl-universal';
import { trade, submit, returnsubmit, duesubmit, print, updateHasBackPrint, getBackPrintConfig, handleBackPrint } from '../Actions.js';
import actions from '@/views/presale/Actions.js'
import * as returnactions from '@/views/returngoods/Actions.js'
import * as eliminateactions from '@/views/eliminatebills/Actions.js'
import finalpaymentactions from '@/views/finalpayment/Actions.js'
import moment from 'moment';
import { updateXPH, updateAMC, isWarn, setState } from '@/views/initialize/Actions.js'
import { connect } from 'react-redux';
// import {hashHistory} from 'react-router';
import InvoiceLeft from './InvoiceLeft';
import EventEmitter from '@/eventemitter';
import { Fetch } from '@/fetch/';
import Url from '@/config/url.js';
import '../style/invoice.less'
import message from '@/common/components/message';
import ShowPaybox from '@/common/components/showPaybox'
import OctoCountdown from '@/common/components/octoCountdown/index.js';
import calculate from '../../../common/calculate'

const { Sider, Content } = Layout;
let octoWaitingModal = null;

async function octoZzReceipt(command_id, req, doSuccess, dsParams) {
    Fetch(
        {
            url: Url.base_url,
            type: "POST",
            data: req
        }
    ).then(res => {
        console.log(res)
        if (res.retflag != "0") {
            console.error('[' + command_id + '] Failed:', res.retmsg);
        }
        if (!!dsParams.req) {
            doSuccess(dsParams.isSmartCard, dsParams._tempBalance, dsParams.req)
        } else {
            doSuccess(dsParams.isSmartCard, dsParams._tempBalance)
        }
    }).catch((error) => {
        console.error('[' + command_id + '] Error:', error);
        if (!!dsParams.req) {
            doSuccess(dsParams.isSmartCard, dsParams._tempBalance, dsParams.req)
        } else {
            doSuccess(dsParams.isSmartCard, dsParams._tempBalance)
        }
    });
};

class InvoiceService extends Component {

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
            // this.props.syspara.nozjfkpaycode.map((itemno)=>{
            //     if(paymode.code == itemno){
            //         show = false;
            //         messages("该付款方式不能直接付款！");
            //         return;
            //     }
            // })
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

    showDelModal = (item, isAmcPay) => {
        let del = true;
        this.props.syspara.nodeletepaycode.map((itemno) => {
            if (item.paycode == itemno) {
                del = false;
                message("該付款方式不允許刪除！");
                return;
            }
        })
        if (this.state.changename == "八達通增值" || this.state.changename == "八達通增值") {
            message("找零已增值八達通，不允許刪除付款！");
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
        if (this.octozzDoneFilter()) {
            this.cancelpay(this.props.operators, this.props.flow_no, this.props.mkt, this.props.syjh);
        }
    }

    initButtons = () => {
        let _btns = [];
        for (let i = 0; i < 7; i++) {
            if (!!this.state.paymode && !!this.state.paymode[i]) {
                _btns.push(this.state.paymode[i]);
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
        if (!!this.state.paymode) {
            for (let i = 0; i < this.state.paymode.length; i++) {
                if (!!this.state.paymode[i]) {
                    this.state.paymode[i].code != "0602" && _btns.push(this.state.paymode[i]);
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


    //0进入支付 1支付  2删除支付 3取消支付  4完成支付  5八达通增值
    handleEjoural = (item, type) => {
        let payACS, paySCB, payMahatan, payOctopus, payWZF, payImpowerCode, isyellowPrint;
        if (this.props.rqsj) {
            if (this.props.rqsj.split('-')[2].slice(0, 2) == this.props.syspara.dateHSXP && !this.state.query.isBl) {
                isyellowPrint = true
            }
        }
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
            } else if (str[0] == "payOctopus") {
                payOctopus = str[1];
                return;
            } else if (str[0] == "payWZF") {
                payWZF = str;
                return;
            } else if (str[0] == "payImpowerCode") {
                payImpowerCode = str[1];
                return;
            }
        })
        const fillLength = (num, n) => (num + '').length < n ? (Array(n).join(" ") + num).slice(-n) : num
        const afterLength = (num, n) => (num + '').length < n ? (num + Array(n).join(" ")).slice(0, n) : num
        const addPay = (item) => {
            let pay;
            let delpay;
            let obj = { ...item };
            if (obj.paycode !== payOctopus && obj.octopusLastAddValType) {
                obj.misMerchantId = obj.octopusLastAddValType
            }
            if (item.flag !== "2" && item.flag != "3" && item.paycode != this.props.syspara.wkzfPaycode) {
                let mode = this.props.payModeInfo.find((mode) => mode.code === item.paycode);
                if (!mode) {
                    return false;
                }
                obj.virtualPayType = mode.virtualPayType;
                obj.cardPayType = mode.cardPayType;
                if (item.paycode !== paySCB && item.paycode !== payMahatan) {
                    obj.payname = mode.cardPayType !== "null" ? item.payname : mode.paysimplecode;
                    obj.trace = mode.cardPayType !== "null" ? ("000000" + item.trace).substr(-6) : item.trace;
                }
            }
            if (obj.virtualPayType == 0) {
                pay = `${fillLength(' ', 17)}${afterLength("CASH", 12)}${fillLength(obj.total.toFixed(2), 8)}`;
                delpay = `${fillLength(' ', 17)}${afterLength("CASH", 12)}${fillLength('-' + obj.total.toFixed(2), 8)}`;
                if (this.state.octoDjlb === "Y3") {
                    pay = "";
                    delpay = "";
                }
                if (this.state.type == "4" || this.state.type == "Y2" || this.state.type == "2") {
                    return delpay
                } else {
                    return pay;
                }
            } else if (obj.paycode == payOctopus) {
                pay = `${fillLength(' ', 17)}${afterLength(obj.payname, 12)}${fillLength(obj.total.toFixed(2), 8)}\r\n 八 達 通 付 款\r\n ${afterLength("機號", 18)} : ${fillLength(obj.misTerminalId, 12)}\r\n ${afterLength("八達通卡號碼", 14)} : ${fillLength(obj.payno, 12)}\r\n ${afterLength("扣除金額", 16)} : ${fillLength(parseFloat(obj.total).toFixed(2), 12)}\r\n ${afterLength("餘額", 18)} : ${fillLength(!obj.octopusIsSmart ? parseFloat(obj.couponBalance).toFixed(2) : "0.00", 12)}\r\n 交易時間 ${obj.octopusTranscationTime}\r\n 上一次於 ${obj.octopusLastAddValDate} ${obj.octopusLastAddValType}`;
                return pay;
            } else if (obj.virtualPayType == 3 && obj.paycode !== payACS && obj.paycode !== payImpowerCode && obj.paycode !== paySCB && obj.paycode !== payMahatan) {
                if (obj.trace === "000000" && obj.cardPayType !== "a" && obj.cardPayType !== "5") {
                    pay = `${afterLength(obj.payno, 21)}${obj.refCode}  ${fillLength(obj.total.toFixed(2), 8)} MASK ${obj.bankType ? obj.bankType : ''}\r\n${afterLength(obj.payno.slice(0, 6) + "******" + obj.payno.slice(12, obj.payno.length + 1), 21)}${obj.refCode}  ${fillLength(obj.total.toFixed(2), 8)}\r\n${afterLength(obj.payname, 12)}1460 M`;
                    delpay = `${afterLength(obj.payno, 21)}${obj.refCode}  ${fillLength("-" + obj.total.toFixed(2), 8)} MASK ${obj.bankType ? obj.bankType : ''}\r\n${afterLength(obj.payno.slice(0, 6) + "******" + obj.payno.slice(12, obj.payno.length + 1), 21)}${obj.refCode}  ${fillLength("-" + obj.total.toFixed(2), 8)}\r\n${afterLength(obj.payname, 12)}1460 M`;
                } else if (obj.cardPayType === "5") {
                    pay = `${afterLength(obj.payno, 21)}${obj.payname}     ${fillLength(obj.total.toFixed(2), 8)} MASK ${obj.bankType ? obj.bankType : '12'}\r\n${afterLength(obj.printPayNo ? obj.printPayNo : obj.payno.slice(0, 6) + "******" + obj.payno.slice(12, obj.payno.length + 1), 21)}${obj.payname}     ${fillLength(obj.total.toFixed(2), 8)}\r\n${obj.terminalid ? afterLength("TID " + obj.terminalid, 15) : ''}${obj.trace !== "000000" ? "TRACE #" + obj.trace : "ISN " + obj.refCode}`;
                    delpay = `${afterLength(obj.payno, 21)}${obj.payname}     ${fillLength("-" + obj.total.toFixed(2), 8)} MASK ${obj.bankType ? obj.bankType : '12'}\r\n${afterLength(obj.printPayNo ? obj.printPayNo : obj.payno.slice(0, 6) + "******" + obj.payno.slice(12, obj.payno.length + 1), 21)}${obj.payname}     ${fillLength("-" + obj.total.toFixed(2), 8)}\r\n${obj.terminalid ? afterLength("TID " + obj.terminalid, 15) : ''}${obj.trace !== "000000" ? "TRACE #" + obj.trace : "ISN " + obj.refCode}`;
                } else if (obj.cardPayType === "a") {
                    pay = `${afterLength(obj.payno, 21)}${obj.payname} ${fillLength(obj.total.toFixed(2), 12)} MASK ${obj.bankType ? obj.bankType : '22'}\r\n${afterLength(obj.printPayNo ? obj.printPayNo : obj.payno.slice(0, 6) + "******" + obj.payno.slice(12, obj.payno.length + 1), 21)}${obj.payname}     ${fillLength(obj.total.toFixed(2), 8)}${obj.terminalid ? '\r\n' + afterLength("TID " + obj.terminalid, 15) : ''}${obj.trace !== "000000" ? "TRACE #" + obj.trace : ''}`;
                    delpay = `${afterLength(obj.payno, 21)}${obj.payname} ${fillLength("-" + obj.total.toFixed(2), 12)} MASK ${obj.bankType ? obj.bankType : '22'}\r\n${afterLength(obj.printPayNo ? obj.printPayNo : obj.payno.slice(0, 6) + "******" + obj.payno.slice(12, obj.payno.length + 1), 21)}${obj.payname}     ${fillLength("-" + obj.total.toFixed(2), 8)}${obj.terminalid ? '\r\n' + afterLength("TID " + obj.terminalid, 15) : ''}${obj.trace !== "000000" ? "TRACE #" + obj.trace : ''}`;
                } else {
                    pay = `${afterLength(obj.payno, 21)}${obj.refCode}  ${fillLength(obj.total.toFixed(2), 8)} MASK ${obj.bankType}\r\n${afterLength(obj.printPayNo, 21)}${obj.refCode}  ${fillLength(obj.total.toFixed(2), 8)}\r\n${afterLength(obj.payname, 12)}1460 ${obj.misMerchantId}\r\n${obj.terminalid ? afterLength("TID " + obj.terminalid, 15) : ''}${"TRACE #" + obj.trace}`;
                    delpay = `${afterLength(obj.payno, 21)}${obj.refCode}  ${fillLength("-" + obj.total.toFixed(2), 8)} MASK ${obj.bankType}\r\n${afterLength(obj.printPayNo, 21)}${obj.refCode}  ${fillLength("-" + obj.total.toFixed(2), 8)}\r\n${afterLength(obj.payname, 12)}1460 ${obj.misMerchantId}\r\n${obj.terminalid ? afterLength("TID " + obj.terminalid, 15) : ''}${"TRACE #" + obj.trace}`;
                }
                if (this.state.type == "4" || this.state.type == "Y2" || this.state.type == "2") {
                    return delpay
                } else {
                    return pay;
                }
            } else if (obj.virtualPayType == 1) {
                pay = `${fillLength(' ', 2)} ${afterLength(obj.payno, 13)} ${afterLength(obj.payname, 12)}${fillLength(obj.total.toFixed(2), 8)}`
                delpay = `${fillLength(' ', 2)} ${afterLength(obj.payno, 13)} ${afterLength(obj.payname, 12)}${fillLength("-" + obj.total.toFixed(2), 8)}`
                if (this.state.type == "4" || this.state.type == "Y2" || this.state.type == "2") {
                    return delpay
                } else {
                    return pay;
                }
            } else if (payWZF.indexOf(obj.paycode) !== -1) {
                pay = `${fillLength(' ', 17)}${afterLength(item.payname, 12)}${fillLength(obj.total.toFixed(2), 8)}\r\nBARC# ${obj.refCode}\r\nRRNO# ${obj.payno}`
                delpay = `${fillLength(' ', 17)}${afterLength(item.payname, 12)}${fillLength("-" + obj.total.toFixed(2), 8)}\r\nBARC# ${obj.refCode}\r\nRRNO# ${obj.payno}`
                if (this.state.type == "4" || this.state.type == "Y2" || this.state.type == "2") {
                    return delpay
                } else {
                    return pay;
                }
            } else if (obj.paycode == payACS) {
                let deposit = ((parseFloat(this.props.zdyftotal) * 100 - obj.total * 100) / 100).toFixed(2);
                pay = `HP NO ${obj.refCode} ${"(" + obj.installmentTerms + ")"}/SM ${obj.deliveryMemoNumber} A\r\n${fillLength(' ', 10)} ${afterLength("DEPOSIT", 18)}${fillLength(deposit, 8)}\r\n${fillLength(' ', 10)} ${afterLength("BALANCE OWING", 18)}${fillLength(obj.total.toFixed(2), 8)}`;
                delpay = `HP NO ${obj.refCode} ${"(" + obj.installmentTerms + ")"}/SM ${obj.deliveryMemoNumber} A\r\n${fillLength(' ', 10)} ${afterLength("DEPOSIT", 18)}${fillLength(`-${deposit}`, 8)}\r\n${fillLength(' ', 10)} ${afterLength("BALANCE OWING", 18)}${fillLength("-" + obj.total.toFixed(2), 8)}`;
                if (this.state.type == "4" || this.state.type == "Y2" || this.state.type == "2") {
                    return delpay
                } else {
                    return pay;
                }
            } else if (obj.paycode == paySCB || obj.payMahatan) {
                pay = `${obj.payno}      ${obj.authCode}${fillLength(obj.total.toFixed(2), 8)}\r\n${afterLength(obj.payname, 12)}1460 ${obj.misMerchantId}`;
                delpay = `${afterLength(obj.payno, 18)}      ${obj.refCode}${fillLength("-" + obj.total.toFixed(2), 8)}\r\n${afterLength(obj.printPayNo, 18)}    ${obj.refCode}  ${fillLength("-" + obj.total.toFixed(2), 8)}  MASK ${obj.bankType}\r\n${afterLength(obj.payname, 12)}1460 ${obj.misMerchantId}\r\n${obj.terminalid ? afterLength("TID " + obj.terminalid, 15) : ''}${"TRACE #" + obj.trace}`;
                if (this.state.type == "4" || this.state.type == "Y2" || this.state.type == "2") {
                    return delpay
                } else {
                    return pay;
                }
            } else if (obj.paycode == payImpowerCode) {
                pay = `${afterLength(obj.payno, 18)}    ${obj.refCode}  ${fillLength(obj.total.toFixed(2), 8)} MASK ${obj.bankType}\r\n${afterLength(obj.printPayNo, 18)}    ${obj.refCode}  ${fillLength(obj.total.toFixed(2), 8)}\r\n${afterLength(obj.payname, 12)}1460 ${obj.misMerchantId}\r\n${obj.terminalid ? afterLength("TID " + obj.terminalid, 15) : ''}${"TRACE #" + obj.trace}`;
                delpay = `${afterLength(obj.payno, 18)}    ${obj.refCode}  ${fillLength("-" + obj.total.toFixed(2), 8)} MASK ${obj.bankType}\r\n${afterLength(obj.printPayNo, 18)}    ${obj.refCode}  ${fillLength("-" + obj.total.toFixed(2), 8)}\r\n${afterLength(obj.payname, 12)}1460 ${obj.misMerchantId}\r\n${obj.terminalid ? afterLength("TID " + obj.terminalid, 15) : ''}${"TRACE #" + obj.trace}`;
                if (this.state.type == "4" || this.state.type == "Y2" || this.state.type == "2") {
                    return delpay
                } else {
                    return pay;
                }
            } else if (obj.paycode == this.props.syspara.wkzfPaycode) {
                let isTailTotal = (Number(this.props.zdyftotal) - Number(obj.total)).toFixed(2);
                pay = `SALES MEMO NO. ${this.props.expressNumber}\r\n${fillLength(' ', 11)}${afterLength("DEPOSIT", 16)}${fillLength(isTailTotal, 10)}\r\n${fillLength(' ', 11)}${afterLength("BALANCE OWING", 16)}${fillLength(obj.total.toFixed(2), 10)}`;
                delpay = `SALES MEMO NO. ${this.props.expressNumber}\r\n${fillLength(' ', 11)}${afterLength("DEPOSIT", 16)}${fillLength(`-${isTailTotal}`, 10)}\r\n${fillLength(' ', 11)}${afterLength("BALANCE OWING", 16)}${fillLength('-' + obj.total.toFixed(2), 10)}`;
                if (this.state.type == "4" || this.state.type == "Y2" || this.state.type == "2") {
                    return delpay
                } else {
                    return pay;
                }
            }
            //积分换购
            if (item.paycode === '0707') {
                return `已使用${fillLength(item.ybje, 6)}積分 ${afterLength("E COUPON", 11)} ${fillLength(obj.total.toFixed(2), 8)}`
            }
        }
        const delPay = (item) => {
            let pay;
            let obj = { ...item };
            if (item.flag !== "2" && item.flag != "3" && item.paycode != this.props.syspara.wkzfPaycode) {
                let mode = this.props.payModeInfo.find((mode) => mode.code === item.paycode);
                if (!mode) {
                    return false;
                }
                obj.virtualPayType = mode.virtualPayType;
                if (item.paycode !== paySCB && item.paycode !== payMahatan) {
                    obj.payname = mode.cardPayType !== "null" ? item.payname : mode.paysimplecode;
                    obj.trace = mode.cardPayType !== "null" ? ("000000" + item.trace).substr(-6) : item.trace;
                }
            }
            pay = `<-- THIS LINE VOID ${afterLength(obj.payname, 10)}${fillLength(obj.total.toFixed(2), 8)}`
            return pay
        }
        switch (type) {
            //初始化支付
            case 0:
                let txt = '';
                if (this.props.staffNo) {
                    txt += `STAFF SALE TO ${this.props.staffNo}\r\n`;
                }
                if (this.props.vip_no && this.props.vip_no.length === 11) {
                    txt += `MEMBER NO.: ${this.props.vip_no}\r\n`;
                } else if (this.props.vip_no && this.props.consumersType !== "02" && this.props.vip_no.length > 11) {
                    if (this.props.realConsumersCard) {
                        txt += `MEMBER NO.: ${this.props.realConsumersCard}\r\n`;
                    } else {
                        txt += `MEMBER NO.: ${"************" + this.props.vip_no.slice(-4)}\r\n`;
                    }
                }
                if (this.props.zddsctotal && this.props.zddsctotal != 0) {
                    txt += `${fillLength(' ', 17)}${afterLength('SUB TOTAL', 12)}${fillLength(`${(this.state.type == "2" || this.state.type == "Y2" || this.state.type == "4") ? "-" : ""}${parseFloat(this.props.zdsjtotal).toFixed(2)}`, 8)}\r\n`
                    txt += `${fillLength(' ', 17)}${afterLength('DISC $', 12)}${fillLength((this.state.type == "2" || this.state.type == "Y2" || this.state.type == "4") ? "" : "-" + parseFloat(this.props.zddsctotal).toFixed(2), 8)}\r\n`
                }
                if (this.state.type !== "2" && this.state.type !== "Y2" && this.state.type !== "4" && this.state.type !== "Y3") {
                    if (this.state.type == "Y6") {
                        txt += `SALES MEMO NO. ${this.props.expressNumber}\r\n${fillLength(' ', 8)}${afterLength('AMOUNT PAID $', 12)}${fillLength(parseFloat(this.props.zdyftotal).toFixed(2), 10)}\r\n`
                    }
                    txt += `${fillLength(' ', 17)}${afterLength('TOTAL', 12)}${fillLength(parseFloat(this.props.zdyftotal).toFixed(2), 8)}`
                } else if (this.state.type === "2") {
                    txt += `${fillLength(' ', 17)}${afterLength('TOTAL', 12)}${fillLength("-" + parseFloat(this.props.zdyftotal).toFixed(2), 8)}\r\nREASON CODE ${this.props.cause} REF# ${this.props.mkt} ${this.props.syjh} ${this.props.yxpNo.slice(-7)}\r\nREFUNDED`
                } else if (this.state.type !== "Y3") {
                    txt += `${fillLength(' ', 17)}${afterLength('TOTAL', 12)}${fillLength("-" + parseFloat(this.props.zdyftotal).toFixed(2), 8)}\r\nREASON CODE ${this.props.cause} ${this.props.yxpNo ? `REF# ${this.props.ymdNo ? this.props.ymdNo.slice(0, 3) : this.props.ymdNo} ${this.props.ysyjNo} ${this.props.yxpNo && this.props.yxpNo.slice(-7)}` : ""}\r\nREFUNDED`
                }
                window.Log(txt, '1');
                break;
            //支付
            case 1:
                let pay = addPay(item);
                if (pay) window.Log(pay, '1');
                break;
            case 2:
                let delPayItem = delPay(item);
                if (delPayItem) window.Log(delPayItem, '1');
                break;
            case 5:
                let octAdd;
                let obj = { ...item };
                octAdd = `八 達 通 增 值\r\n${afterLength("機號", 18)} : ${fillLength(obj.octopusDeviceId, 12)}\r\n${afterLength("八達通卡號碼", 14)} : ${fillLength(obj.octopusCardno, 12)}\r\n${afterLength("增值金額", 16)} : ${fillLength(parseFloat(obj.octopusRechargeTotal).toFixed(2), 12)}\r\n${afterLength("餘額", 18)} : ${fillLength(obj.octopusBalance ? parseFloat(obj.octopusBalance).toFixed(2) : "0.00", 12)}\r\n${afterLength("現金", 18)} : ${fillLength(parseFloat(obj.sjfk).toFixed(2), 12)}\r\n${this.state.octozzDone ? afterLength("找續", 18) + " : " + fillLength(parseFloat(obj.zl).toFixed(2), 12) + "\r\n" : ""}交易時間 ${obj.octopusTransDate}\r\n上一次於 ${obj.octopusLastAddValDate} ${obj.octopusLastAddValType}\r\n八達通增值不設退款服務\r\n`;;
                window.Log(octAdd, '1');
                break;
            case 4:
                let endtxt = '';
                if (this.state.type !== "2" && this.state.type !== "Y2") {
                    endtxt += `${fillLength(' ', 17)}${afterLength("CHANGE", 12)}${fillLength(parseFloat(this.state.change).toFixed(2), 8)}\r\n`;
                    if (this.props.isHs) {
                        endtxt += ` *** SUPPLIER DELIVERY (${this.props.expressNumber}) ***\r\n`;
                    }
                    if (this.props.isDc) {
                        let dcData = this.props.dcData;
                        let arr = dcData.date.split("-");
                        arr[2] = arr[2].slice(-2);
                        let date = arr.join("-");
                        endtxt += `        *** D E L I V E R Y ***\r\nC NAME :${dcData.customName} (${date}/${dcData.reserveLocation})\r\n${afterLength("H PHONE:" + dcData.telephone, 19)}S MEMO :${this.props.expressNumber}\r\n${afterLength("L OUT  :" + dcData.locationOut, 19)}O PHONE:${dcData.otherTelephone}\r\n`;
                    }
                } else {
                    endtxt += `${fillLength(' ', 6)} ${afterLength("TOTAL MONEY REFUNDED", 22)}${fillLength(parseFloat(this.props.zdyftotal).toFixed(2), 8)}\r\n`;
                }
                if (this.props.consumersCard && this.props.consumersType == "02") {
                    endtxt += `AEON CARD : ${this.props.realConsumersCard}\r\nAEON CARD : ${"************" + this.props.consumersCard.slice(-4)}\r\n`;
                }
                if (this.props.consumersType === "04" && this.props.terminalOperatorAuthzCardNo) { //会员价授权
                    endtxt += `JCPRICE AUTH. STAFF ${this.props.terminalOperatorAuthzCardNo}\r\n`;
                }
                if (this.props.totalDiscAuthzCardNo || (this.props.terminalOperatorAuthzCardNo && this.props.consumersType !== "04") && this.state.type !== "2" && this.state.type !== "Y2" && this.state.type !== "4") {//改价，单件折，全单折授权
                    endtxt += `DIS/OVR AUTH. STAFF ${this.props.totalDiscAuthzCardNo ? this.props.totalDiscAuthzCardNo : this.props.terminalOperatorAuthzCardNo}\r\n`;
                }
                if (this.props.refundAuthzCardNo) {
                    endtxt += `REFUND AUTH. BY STAFF ${this.props.refundAuthzCardNo}\r\n`;
                }
                if (this.props.staffNo) {
                    endtxt += `STAFF SALE TO ${this.props.staffNo}\r\n`;
                }
                if (this.props.cardType == 2) {
                    endtxt += `FAMILY REF.: ${this.props.cardNo}\r\n`;
                }
                if (this.props.memberInfo && this.props.memberInfo.membershipExpireDate) {
                    endtxt += `本會籍年度至：${this.props.memberInfo.membershipExpireDate}\r\n可用積分(截至昨日)：${((this.props.memberInfo.bonusPointLastMonth * 100 - this.props.memberInfo.bonusPointUsed * 100) / 100).toFixed(2)}\r\n本月累積積分${this.props.memberInfo.lastUpdateTime ? `(至${this.props.memberInfo.lastUpdateTime})` : ""}：${this.props.memberInfo.bonusPointLastDay}\r\n(本月累積積分可於下月起使用)\r\n積分有效期至：${this.props.memberInfo.bonusPointExpireDate}\r\n有關積分詳情，歡迎向顧客服務台職員查詢\r\n`;
                }
                if (this.props.sticker) {
                    if (this.props.addDjlb === 'Y12') {
                        endtxt += `Redeem P-Stamp   ${this.props.sticker}\r\n`;
                    } else {
                        endtxt += ` ${this.props.sticker}\r\nPayout P-Stamp   ${this.props.sticker}\r\n`;
                    }
                } else if (this.props.eleStamp) {
                    if (this.props.addDjlb === 'Y12') {
                        endtxt += `Redeem E-Stamp   ${this.props.eleStamp}\r\n${this.state.stampStatus ? '(' + this.state.stampStatus + ')\r\n' : ''}`;
                    } else {
                        endtxt += ` ${this.props.eleStamp}\r\nPayout E-Stamp   ${this.props.eleStamp}\r\n`;
                    }
                } else if (this.props.dzyh) {
                    endtxt += `回收  ${this.props.dzyh}個印花 \r\nReceived E-Stamp   ${this.props.dzyh}\r\n`;
                } else if (this.props.swyh) {
                    endtxt += `回收  ${this.props.swyh}個印花 \r\nReceived P-Stamp   ${this.props.swyh}\r\n`;
                }
                if (this.state.type !== "4" && isyellowPrint) {
                    endtxt += `-------------------------------------\r\n      【 已 列 印 黃 色 小 票 】\r\n-------------------------------------\r\n`;
                }
                if (this.props.hasFastPay) {
                    endtxt += `           感謝使用快付通\r\n`
                }
                let na = `N.A. : ${this.state.na.toFixed(2)}`;
                endtxt += `${afterLength(na, 21)}${this.props.online == 0 ? "OFF-LINE" : ""}\r\n*************************************`;
                window.Log(endtxt, '1');
                if (this.state.octozzDone || this.state.octozlDone) {
                    let octAdd = `\r\n`;
                    let obj = {
                        octopusDeviceId: !!this.state.octopusDeviceId ? this.state.octopusDeviceId.toUpperCase() : "",    //八达通设备号
                        octopusCardno: this.state.octopusCardno,    //八达通卡号
                        octopusRechargeTotal: "" + Number(this.props.zdyftotal).toFixed(2), //充值金额
                        octopusBalance: "" + Number(this.state.octopusBalance).toFixed(2),  //八达通余额
                        octopusIsSmart: this.state.octopusIsSmart,          //是否八达通智能卡
                        octopusLastAddValDate: this.state.octopusLastAddValDate,    //最近一次增值日期
                        octopusLastAddValType: this.props.switchEng === true ? this.state.octopusLastAddValTypeEn : this.state.octopusLastAddValType,    //最近一次增值类型
                        octopusTransDate: this.state.octopusTransDate, //八达通交易时间
                        sjfk: this.state.yftotal,//实际付款
                        ysje: this.props.zdyftotal,//应收金额
                        zl: this.state.change,//找零金额
                    };
                    octAdd += `SHOP ${this.props.mkt}/${this.props.syjh}  REF ${this.props.syjh + this.props.fphm}  ${moment().format('DD/MM/YY')}\r\nOPERATOR ${this.props.operators}  ${moment().format('HH:mm:ss')}\r\n八 達 通 增 值\r\n${afterLength("機號", 18)} : ${fillLength(obj.octopusDeviceId, 12)}\r\n${afterLength("八達通卡號碼", 14)} : ${fillLength(obj.octopusCardno, 12)}\r\n${afterLength("增值金額", 16)} : ${fillLength(this.state.octozzDone ? parseFloat(obj.octopusRechargeTotal).toFixed(2) : parseFloat(obj.zl).toFixed(2), 12)}\r\n${afterLength("餘額", 18)} : ${fillLength(obj.octopusBalance ? parseFloat(obj.octopusBalance).toFixed(2) : "0.00", 12)}\r\n${afterLength("現金", 18)} : ${fillLength(parseFloat(obj.sjfk).toFixed(2), 12)}\r\n${this.state.octozzDone ? afterLength("找續", 18) + " : " + fillLength(obj.zl ? parseFloat(obj.zl).toFixed(2) : "0.00", 12) + "\r\n" : ""}交易時間 ${obj.octopusTransDate}\r\n上一次於 ${obj.octopusLastAddValDate} ${obj.octopusLastAddValType}\r\n八達通增值不設退款服務\r\n`;
                    window.Log(octAdd, '1');
                }
                break;
        }
    }

    // 请求支付后结果处理
    afterPayHandle = (isPaySuccessed, res, errMsg, isChangeSuccessed, isAutoPay) => {
        let ishaveZL = false;
        let change = '0.00';
        let that = this;
        let doOctozzfkDone = () => {
            // if (!!this.state.query && !!this.state.query && !!this.state.query.djlb && this.state.query.djlb === 'Y3') {
            that.setState({ octozzfkDone: true }, () => {
                if (isAutoPay && !isAutoPay === true) {
                    message(intl.get("INFO_OCTOSWIPE")); //请拍要增值的八达通卡
                    setTimeout(() => {
                        if (!!that.state.query && !!that.state.query && !!that.state.query.djlb && that.state.query.djlb === 'Y3') {
                            that.octocardRecharge(that.props.zdsjtotal, false, null)
                        }
                    }, 300);
                } else {
                    that.octocardRecharge(that.props.zdsjtotal, false, null, undefined, undefined, undefined, undefined, isAutoPay)
                }
            });
            // };
        }
        console.log('请求支付后结果处理', isPaySuccessed, res, errMsg, isChangeSuccessed, isAutoPay);
        console.log(res.remainje)
        if (isPaySuccessed) {
            if (!!isChangeSuccessed && isChangeSuccessed === false) {
                message('支付成功');
            }
            // res.invalidDiscountValue = 1;
            let sum = 0;
            let payments = res.salePayments ? res.salePayments : res.payments;
            !payments && (payments = this.props.salePayments);
            payments.map((item, index) => {
                let i = 'Y'
                this.state.payList.map((_item, _index) => {
                    if (item.puid == _item.puid) {
                        i = 'N';
                    }
                })
                if (i == 'Y' && item.flag !== "2" && item.flag != "3") {
                    this.handleEjoural(item, 1)
                }
            })
            payments.map((item) => {
                sum += Number(item.overage);
            });
            if (res.invalidDiscountValue) {

                let payMZcoupons;
                this.props.syspara.payObj.map((item) => {
                    let str = item.split(',');
                    if (str[0] == "payMZcoupons") {
                        payMZcoupons = str[1];
                        return;
                    }
                })
                let showPayMoney
                for (let i = payments.length - 1; i >= -1; i--) {
                    if (null != payMZcoupons && null != payments[i].paycode && payMZcoupons === payments[i].paycode) {
                        showPayMoney = payments[i].je;
                        break;
                    }
                }
                let that = this;
                Modal.confirm({
                    className: 'zlzz-confirm',
                    content: (<div>
                        <p className="quan">折扣金額：{"    " + that.props.syspara.bbcodeHBFH[1] + res.invalidDiscountValue}，回撥折扣後購物額：{"    " + that.props.syspara.bbcodeHBFH[1] + that.props.zdsjtotal}，是否選用此券</p>
                    </div>),
                    okText: "繼續使用券",
                    cancelText: "取消使用券",
                    iconType: '',
                    onOk() {
                        that.cancelConflict();
                    },
                    onCancel() {
                        that.deletepay(that.props.operators, that.props.flow_no, payments[payments.length - 1].puid, that.props.mkt, that.props.syjh, '', payments[payments.length - 1])
                    },
                });
                return;
            }
            if (res.remainje == 0) {
                payments.map((item) => {
                    if (item.flag === "2" && item.je !== 0) {
                        ishaveZL = true;
                        change = item.je
                        window.LineDisplay({ data: { cash: res.sjfk, change }, type: 3 })
                        return;
                    }
                })
            }
            if (ishaveZL) {
                this.setState({
                    change: change,
                    payList: [...payments],
                    yftotal: parseFloat(res.sjfk),
                    sftotal: parseFloat(res.remainje),
                    overage: sum,
                    changename: intl.get("CHANGE")
                })
                let _this = this;
                if (this.state.octoDjlb == "Y3" || this.props.type == "returnGoods" || this.props.type == "eliminatebills") {
                    // 订单类别为“八达通增值”时，默认现金找零，不弹框
                    _this.setState({
                        batzzVisible: false,
                        change: change,
                        payList: [...payments],
                        yftotal: parseFloat(res.sjfk),
                        sftotal: parseFloat(res.remainje),
                        overage: sum,
                        changename: _this.intl.get("CHANGE")
                    });
                    if (this.state.octoDjlb == "Y3") {
                        message(intl.get("INFO_OCTOSWIPE")); //请拍要增值的八达通卡
                        setTimeout(() => {
                            if (!!that.state.query && !!that.state.query && !!that.state.query.djlb && that.state.query.djlb === 'Y3') {
                                that.octocardRecharge(that.props.zdsjtotal, false, null)
                            }
                        }, 300);
                    }
                    if (_this.state.change) {
                        window.openCashbox();
                        Modal.success({
                            className: 'xjzl',
                            content: (<div>
                                <p className="zlje"> 找續金額{"    " + _this.props.syspara.bbcodeHBFH[1] + _this.state.change.toFixed(2)}</p>
                            </div>),
                            onOk() {
                                that.setState({ octozzfkDone: true }, () => {
                                    _this.finalSubmit();
                                })
                            }
                        })
                    } else {
                        _this.finalSubmit();
                    }
                } else {
                    console.log("to charge octo: ", this.state);
                    if (this.state.zliszzoctopus) {
                        window.openCashbox();
                        Modal.confirm({
                            className: 'zlzz-confirm',
                            content: (<div>
                                <p className="zlje"> 找續金額{"    " + _this.props.syspara.bbcodeHBFH[1] + change.toFixed(2)}</p>
                                {/*<p> 實際付款{"    " + _this.props.syspara.bbcodeHBFH[1] + parseFloat(res.sjfk).toFixed(2)}</p>*/}
                            </div>),
                            okText: _this.intl.get("CHANGE"),
                            cancelText: intl.get("INFO_OTPADDVALUE"),       //增值八达通
                            iconType: '',
                            onOk() {
                                _this.setState({
                                    batzzVisible: false,
                                    change: change,
                                    payList: [...payments],
                                    yftotal: parseFloat(res.sjfk),
                                    sftotal: parseFloat(res.remainje),
                                    overage: sum,
                                    changename: _this.intl.get("CHANGE")
                                }, () => {
                                    _this.finalSubmit();
                                });
                            },
                            onCancel() {
                                let newState = {
                                    batzzVisible: false,
                                    change: change,
                                    payList: [...payments],
                                    yftotal: parseFloat(res.sjfk),
                                    sftotal: parseFloat(res.remainje),
                                    overage: sum,
                                    changename: intl.get("INFO_OTPCHANGE"),       //八达通增值
                                };
                                message(intl.get("INFO_OCTOSWIPE"));      //请拍卡
                                setTimeout(() => {
                                    _this.octocardRecharge(change, true, newState, { isPaySuccessed, res, errMsg });
                                }, 300);
                            },
                        });
                    } else {
                        _this.setState({
                            batzzVisible: false,
                            change: change,
                            payList: [...payments],
                            yftotal: parseFloat(res.sjfk),
                            sftotal: parseFloat(res.remainje),
                            overage: sum,
                            changename: _this.intl.get("CHANGE")
                        });
                        if (_this.state.change) {
                            window.openCashbox();
                            Modal.success({
                                className: 'xjzl',
                                content: (<div>
                                    <p> 找續金額{"    " + _this.props.syspara.bbcodeHBFH[1] + _this.state.change.toFixed(2)}</p>
                                </div>),
                                onOk() {
                                    if (!!that.state.query && !!that.state.query && !!that.state.query.djlb && that.state.query.djlb === 'Y3') {
                                        message(intl.get("INFO_OCTOSWIPE")); //请拍要增值的八达通卡
                                        setTimeout(() => {
                                            that.octocardRecharge(that.props.zdsjtotal, false, null)
                                        }, 300);
                                    } else {
                                        _this.finalSubmit();
                                    }
                                }
                            })
                        } else {
                            _this.finalSubmit();
                        }
                    }
                }
            } else if (res.remainje == 0) {
                this.setState({
                    change: change,
                    payList: [...payments],
                    yftotal: parseFloat(res.sjfk || this.props.sjtotal),
                    sftotal: parseFloat(res.remainje),
                    overage: sum,
                    changename: intl.get("CHANGE")
                }, () => {
                    if (!!this.state.query && !!this.state.query && !!this.state.query.djlb) {
                        if (isAutoPay && isAutoPay === true) {
                            that.setState({ octozzfkDone: true }, () => {
                                // 补录单（增值/找零）统一按增值处理
                                that.octocardRecharge(that.props.zdsjtotal, false, null, undefined, undefined, undefined, undefined, isAutoPay)
                                // 补录单（增值/找零）分别处理
                                // if(this.state.query.djlb === 'Y3'){
                                //     that.octocardRecharge(that.props.zdsjtotal, false, null, undefined, undefined, undefined, undefined, isAutoPay)
                                // } else if(this.state.query.djlb === 'Y9'){
                                //     for(let z=0; z<payments.length; z++){
                                //         payments[z].flag = "2";
                                //     }
                                //     let newState = {
                                //         batzzVisible: false,
                                //         change: change,
                                //         payList: [...payments],
                                //         yftotal: parseFloat(res.sjfk),
                                //         sftotal: parseFloat(res.remainje),
                                //         overage: sum,
                                //         changename: intl.get("INFO_OTPCHANGE"),       //八达通增值
                                //     };
                                //     that.octocardRecharge(that.props.zdsjtotal, true, newState, undefined, undefined, undefined, undefined, isAutoPay)
                                // }
                            });
                        } else {
                            if (this.state.query.djlb === 'Y3') {
                                doOctozzfkDone();
                            }
                        }
                    } else {
                        this.finalSubmit();
                    }
                })
            } else {
                this.setState({
                    change: change,
                    payList: [...payments],
                    yftotal: parseFloat(res.sjfk),
                    sftotal: parseFloat(res.remainje),
                    overage: sum,
                    changename: intl.get("CHANGE")
                })
            }
            // if (!!this.state.query && !!this.state.query && this.state.query.djlb === 'Y3') {
            //     this.octocardRecharge(res.total, false, null);
            // }
        } else {
            message(errMsg)
        }
    }

    intl = (key, params = {}) => {
        return intl.get(key, params);
    }

    // octoClearTimer = null;
    octoClear = (sec) => {
        if (!!global.octoClearTimer) {
            clearTimeout(global.octoClearTimer);
        }
        console.log("[invoiceService] new octoClearTimer [" + sec + "sec]");
        global.octoClearTimer = setTimeout(() => {
            window["OctopusClear"]({ type: '06' })
        }, sec * 1000);
    }

    octoClearCancel = () => {
        if (!!global.octoClearTimer) {
            clearTimeout(global.octoClearTimer);
        }
    }

    deepCopy = (p, c) => {
        var c = c || {};
        for (var i in p) {
            if (!p.hasOwnProperty(i)) {
                continue;
            }
            if (typeof p[i] === 'object' && p[i] != null) {
                c[i] = (p[i].constructor === Array) ? [] : {};
                this.deepCopy(p[i], c[i]);
            } else {
                c[i] = p[i];
            }
        }
        return c;
    }

    //折扣券支付后结果和删除券后处理
    afterZKpay = () => {
        this.props.trade(this.props.operators, this.props.flow_no, this.props.mkt, this.props.syjh).then((res) => {
            this.setState({
                sftotal: res.remainje,//剩余应付
                yftotal: this.props.sjtotal ? this.props.sjtotal : 0,//已经付款金额
                payList: this.props.salePayments ? [...this.props.salePayments] : []
            })
        })
    }

    //用券回拨优惠
    cancelConflict = () => {
        const req = {
            command_id: "CANCELCONFLICTDISCOUNT",
            flow_no: this.props.flow_no,
            operators: this.props.operators,
            mkt: this.props.mkt,
            syjh: this.props.syjh,
        };
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then(res => {
            if ("0" === res.retflag) {
                this.afterZKpay();
            } else {
                message(res.retmsg);
            }
        }).catch((error) => {
            console.error('error', error);
            throw new Error(error);
        });
    }

    reCalcBill = () => {
        let uidlist, qty = 0;
        if (this.props.goodsList.length === 0) {
            return false
        }
        uidlist = this.props.goodsList.map(item => {
            qty += item.qty;
            return item.guid;
        }).join(',')

        const req = {
            command_id: "CXPAYREQUESTCERTIFY",
            flow_no: this.props.flow_no,
            count: this.props.goodsList.length,
            qty: qty,
            calc_mode: '5',
            operators: this.props.operators || this.props.operators.cardno,
            mkt: this.props.mkt,
            syjh: this.props.syjh,
            giftList: this.props.giftList,
            uidlist: uidlist,
        };
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then(res => {
            if ("0" === res.retflag) {
                this.afterZKpay();
            } else {
                message(res.retmsg);
            }
        }).catch((error) => {
            console.error('error', error);
            throw new Error(error);
        });


    }

    //删除商品
    delGoods = (guid, barcode) => {
        const req = {
            command_id: "CANCELBARCODECERTIFY",
            guid,
            flow_no: this.props.flow_no,
            barcode,
            sqkh: '0015',
            operators: this.props.operators,
            mkt: this.props.mkt,
            syjh: this.props.syjh,
        };
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then(res => {
            if ("0" === res.retflag) {
                // this.afterZKpay();
            } else {
                message(res.retmsg);
            }
        }).catch((error) => {
            console.error('error', error);
            throw new Error(error);
        });
    }

    //更新后厨打印单号 
    //@goodsList商品列表 @backPrintStallInfo允许后厨打印设备 @backPrintNo后厨打印单号
    updateHasBackPrint = (goodsList, backPrintStallInfo) => {
        let
            backPrintInfo = [],
            list = JSON.parse(JSON.stringify(goodsList)),
            pagerNo = this.props.pagerNO + '',
            firstNo = this.props.pagerNO.substring(0, 1)
        backPrintStallInfo.forEach(item => {
            list.forEach(v => {
                if (v.stallCode === item.stallCode && item.printAddress !== '') {
                    backPrintInfo.push(v)
                }
            })
        })
        if (this.props.pagerType == 'KH') {
            backPrintInfo.forEach(v => v.backPrintNo = pagerNo);
        } else {
            for (let i = 0; i < backPrintInfo.length; i++) {
                let no
                if (i >= 1) {
                    if (backPrintInfo[i].stallCode !== backPrintInfo[i - 1].stallCode) {
                        no = parseInt(pagerNo.substring(1)) + 1;
                        if (no >= 1000) no = 1;
                        no = no + "";
                        pagerNo = `${firstNo}${'0'.repeat(3 - no.length)}${no}`;
                        backPrintInfo[i].backPrintNo = pagerNo
                    } else {
                        backPrintInfo[i].backPrintNo = backPrintInfo[i - 1].backPrintNo
                    }
                } else {
                    backPrintInfo[i].backPrintNo = pagerNo
                }
            }
        }
        let req = {
            operators: this.props.operators,     // 操作员号
            flow_no: this.props.flow_no,
            mkt: this.props.mkt,
            syjh: this.props.syjh,
            backPrintInfo: backPrintInfo
        }
        return this.props.updateHasBackPrint(req)
    }

    //获取后厨打印配置
    getBackPrintConfig = (goodsList) => {
        let stallCodeList = []
        goodsList.forEach(item => {
            stallCodeList.push(item.stallCode)
        })
        let req = {
            operators: this.props.operators,
            flow_no: this.props.flow_no,
            mkt: this.props.mkt,
            syjh: this.props.syjh,
            shopCode: this.props.mkt,
            stallCode: stallCodeList.join(',')
        }
        return this.props.getBackPrintConfig(req).then(res => {
            this.setState({ backPrintStallInfo: res.stallinfo })
        })
    }

    //分类
    groupBy = (array, f) => {
        let groups = {}
        array.forEach(function (o) {
            let group = JSON.stringify(f(o))
            groups[group] = groups[group] || []
            groups[group].push(o)
        })
        return Object.keys(groups).map(function (group) {
            return groups[group]
        })
    }

    //消单后厨打印方法
    handleXDPrintFunc = (data, idSheetNo, saleDate, callback, backPrintStallInfo) => {
        let _this = this
        this.setState({ isPrint: false })
        if (data.length !== 0) {
            let list = data[0], items = [], backPrintNo = list[0].backPrintNo
            list.forEach(item => {
                let obj = {
                    name: item.fname,
                    extParams: item.categoryPropertys,
                    qty: item.qty,
                    eatWay: item.eatWay
                }
                items.push(obj)
            })
            let params = backPrintStallInfo.find(v => v.stallCode === list[0].stallCode)
            if (!!params && params.printAddress !== '') {
                //含有后厨打印档口
                let { stallName, stallCode, printAddress, selfId } = params
                let req = {
                    operators: this.props.operators,     // 操作员号
                    flow_no: this.props.flow_no,
                    mkt: this.props.mkt,
                    syjh: this.props.syjh,
                    shopCode: this.props.mkt,
                    items,
                    idSheetNo,
                    backPrintNo,
                    stallName,
                    stallCode,
                    printIp: printAddress,
                    erpCode: this.props.jygs,
                    isCancel: 'Y'
                }
                this.props.handleBackPrint(req).then(res => {
                    if (res && res.retflag === "0") {
                        data.shift();
                        return _this.handleXDPrintFunc(data, idSheetNo, saleDate, callback, backPrintStallInfo)
                    } else {
                        Modal.confirm({
                            title: `未能接通${stallName}廚房印表機`,
                            content: `請選擇[重試] 或 [出票尾給客人交予櫃臺] `,
                            width: 500,
                            className: 'vla-confirm',
                            okText: '出票尾',
                            cancelText: '重試',
                            onOk() {
                                if (data.length == 1) {
                                    _this.setState({ isPrint: true }, () => {
                                        window.Print(_this.tailPrint(data[0], saleDate, true), value => {
                                            if (!!value) {
                                                _this.setState({ isPrint: false })
                                                if (callback) {
                                                    callback()
                                                }
                                            }
                                            return
                                        })
                                    })
                                } else {
                                    _this.setState({ isPrint: true }, () => {
                                        window.Print(_this.tailPrint(data[0], saleDate, true), value => {
                                            if (!!value) {
                                                _this.setState({ isPrint: false })
                                                data.shift()
                                                return _this.handleXDPrintFunc(data, idSheetNo, saleDate, callback, backPrintStallInfo)
                                            }
                                        })
                                    })
                                }
                            },
                            onCancel() {
                                return _this.handleXDPrintFunc(data, idSheetNo, saleDate, callback, backPrintStallInfo)
                            }
                        });
                    }
                })
            } else {
                if (data.length == 1) {
                    _this.setState({ isPrint: true }, () => {
                        window.Print(_this.tailPrint(data[0], saleDate, true), value => {
                            if (!!value) {
                                _this.setState({ isPrint: false })
                                if (callback) {
                                    callback()
                                }
                            }
                            return
                        })
                    })
                } else {
                    _this.setState({ isPrint: true }, () => {
                        window.Print(_this.tailPrint(data[0], saleDate, true), value => {
                            if (!!value) {
                                _this.setState({ isPrint: false })
                                data.shift()
                                return _this.handleXDPrintFunc(data, idSheetNo, saleDate, callback, backPrintStallInfo)
                            }
                        })
                    })
                }
            }
        } else {
            if (callback) {
                callback()
            }
        }
    }

    //WP后厨打印方法
    handleWPPrintFunc = (data, idSheetNo, saleDate, callback, noList, flag = false) => {
        let _this = this;
        this.setState({ isPrint: false });
        const handlePager = (pagerParams) => {
            let flag = window.PagerSystem(pagerParams, true);
            if (flag == '1') {
                if (callback) {
                    for (let i = 0; i < noList.length; i++) {
                        window.UpdatePagerNO();
                    }
                    callback();
                }
            } else {
                Modal.confirm({
                    title: `請檢查傳呼器取餐號碼`,
                    content: `是否正確 `,
                    width: 500,
                    className: 'vla-confirm',
                    okText: '正確',
                    cancelText: '重新傳送',
                    onOk() {
                        if (callback) {
                            for (let i = 0; i < noList.length; i++) {
                                window.UpdatePagerNO();
                            }
                            callback();
                        }
                    },
                    onCancel() {
                        return handlePager(pagerParams)
                    }
                });
            }
        }
        if (data.length !== 0) {
            let list = data[0], items = [], backPrintNo = list[0].backPrintNo
            list.forEach(item => {
                let obj = {
                    name: item.fname,
                    extParams: item.categoryPropertys,
                    qty: item.qty,
                    eatWay: item.eatWay
                }
                items.push(obj)
            })
            let params = this.state.backPrintStallInfo.find(v => v.stallCode === list[0].stallCode)
            if (!!params && params.printAddress !== '') {
                //含有后厨打印档口
                let { stallName, stallCode, printAddress, selfId } = params
                let req = {
                    operators: this.props.operators,     // 操作员号
                    flow_no: this.props.flow_no,
                    mkt: this.props.mkt,
                    syjh: this.props.syjh,
                    shopCode: this.props.mkt,
                    items,
                    idSheetNo,
                    backPrintNo,
                    stallName,
                    stallCode,
                    printIp: printAddress,
                    erpCode: this.props.jygs
                }
                this.props.handleBackPrint(req).then(res => {
                    if (res && res.retflag === "0") {
                        if (data.length == 1) {
                            noList.push(backPrintNo)
                            let pagerParams = { no: noList };
                            return handlePager(pagerParams)
                        } else {
                            noList.push(backPrintNo)
                            data.shift()
                            return _this.handleWPPrintFunc(data, idSheetNo, saleDate, callback, noList)
                        }
                    } else {
                        Modal.confirm({
                            title: `未能接通${stallName}廚房印表機`,
                            content: `請選擇[重試] 或 [出票尾給客人交予櫃臺] `,
                            width: 500,
                            className: 'vla-confirm',
                            okText: '出票尾',
                            cancelText: '重試',
                            onOk() {
                                if (data.length == 1) {
                                    _this.setState({ isPrint: true }, () => {
                                        window.Print(_this.tailPrint(data[0], saleDate), value => {
                                            if (!!value) {
                                                _this.setState({ isPrint: false })
                                                noList.push(backPrintNo)
                                                let pagerParams = { no: noList };
                                                return handlePager(pagerParams)
                                            }
                                            return
                                        })
                                    })
                                } else {
                                    _this.setState({ isPrint: true }, () => {
                                        window.Print(_this.tailPrint(data[0], saleDate), value => {
                                            if (!!value) {
                                                _this.setState({ isPrint: false })
                                                noList.push(backPrintNo)
                                                data.shift()
                                                return _this.handleWPPrintFunc(data, idSheetNo, saleDate, callback, noList)
                                            }
                                        })
                                    })
                                }
                            },
                            onCancel() {
                                return _this.handleWPPrintFunc(data, idSheetNo, saleDate, callback, noList)
                            }
                        });
                    }
                })
            } else {
                if (data.length == 1) {
                    _this.setState({ isPrint: true }, () => {
                        window.Print(_this.tailPrint(data[0], saleDate), value => {
                            if (!!value) {
                                _this.setState({ isPrint: false });
                                // code.push(params.selfId);
                                if (!flag) {
                                    let no = _this.props.pagerNO + ''
                                    noList.push(no)
                                    let pagerParams = { no: noList };
                                    return handlePager(pagerParams);
                                } else {
                                    if (callback) {
                                        callback()
                                    }
                                }
                            }
                            return
                        })
                    })
                } else {
                    _this.setState({ isPrint: true }, () => {
                        window.Print(_this.tailPrint(data[0], saleDate), value => {
                            if (!!value) {
                                _this.setState({ isPrint: false })
                                data.shift()
                                return _this.handleWPPrintFunc(data, idSheetNo, saleDate, callback, noList)
                            }
                        })
                    })
                }
            }
        } else {
            if (callback) {
                callback()
            }
        }
    }

    //KH后厨打印方法
    handleKHPrintFunc = (data, idSheetNo, saleDate, callback, code, flag = false) => {
        let _this = this;
        this.setState({ isPrint: false });
        const handlePager = (pagerParams) => {
            let flag = window.PagerSystem(pagerParams);
            if (flag == '1') {
                if (callback) {
                    callback();
                }
            } else {
                Modal.confirm({
                    title: `請檢查傳呼器取餐號碼`,
                    content: `是否正確 `,
                    width: 500,
                    className: 'vla-confirm',
                    okText: '正確',
                    cancelText: '重新傳送',
                    onOk() {
                        if (callback) {
                            window.UpdatePagerNO();
                            callback();
                        }
                    },
                    onCancel() {
                        return handlePager(pagerParams)
                    }
                });
            }
        }
        if (data.length !== 0) {
            let list = data[0], items = [], backPrintNo = list[0].backPrintNo
            list.forEach(item => {
                let obj = {
                    name: item.fname,
                    extParams: item.categoryPropertys,
                    qty: item.qty,
                    eatWay: item.eatWay
                }
                items.push(obj)
            })
            let params = this.state.backPrintStallInfo.find(v => v.stallCode === list[0].stallCode)
            if (!!params && params.printAddress !== '') {
                //含有后厨打印档口
                let { stallName, stallCode, printAddress, selfId } = params
                let req = {
                    operators: this.props.operators,     // 操作员号
                    flow_no: this.props.flow_no,
                    mkt: this.props.mkt,
                    syjh: this.props.syjh,
                    shopCode: this.props.mkt,
                    items,
                    idSheetNo,
                    backPrintNo,
                    stallName,
                    stallCode,
                    printIp: printAddress,
                    erpCode: this.props.jygs
                }
                this.props.handleBackPrint(req).then(res => {
                    if (res && res.retflag === "0") {
                        if (data.length == 1) {
                            code.push(selfId)
                            let pagerParams = { no: backPrintNo, code };
                            return handlePager(pagerParams)
                        } else {
                            code.push(selfId)
                            data.shift()
                            return _this.handleKHPrintFunc(data, idSheetNo, saleDate, callback, code)
                        }
                    } else {
                        Modal.confirm({
                            title: `未能接通${stallName}廚房印表機`,
                            content: `請選擇[重試] 或 [出票尾給客人交予櫃臺] `,
                            width: 500,
                            className: 'vla-confirm',
                            okText: '出票尾',
                            cancelText: '重試',
                            onOk() {
                                if (data.length == 1) {
                                    _this.setState({ isPrint: true }, () => {
                                        window.Print(_this.tailPrint(data[0], saleDate), value => {
                                            if (!!value) {
                                                _this.setState({ isPrint: false })
                                                code.push(selfId)
                                                let pagerParams = { no: backPrintNo, code };
                                                return handlePager(pagerParams)
                                            }
                                            return
                                        })
                                    })
                                } else {
                                    _this.setState({ isPrint: true }, () => {
                                        window.Print(_this.tailPrint(data[0], saleDate), value => {
                                            if (!!value) {
                                                _this.setState({ isPrint: false })
                                                code.push(selfId)
                                                data.shift()
                                                return _this.handleKHPrintFunc(data, idSheetNo, saleDate, callback, code)
                                            }
                                        })
                                    })
                                }
                            },
                            onCancel() {
                                return _this.handleKHPrintFunc(data, idSheetNo, saleDate, callback, code)
                            }
                        });
                    }
                })
            } else {
                if (data.length == 1) {
                    _this.setState({ isPrint: true }, () => {
                        window.Print(_this.tailPrint(data[0], saleDate), value => {
                            if (!!value) {
                                _this.setState({ isPrint: false });
                                // code.push(params.selfId);
                                if (!flag) {
                                    let pagerParams = { no: _this.props.pagerNO + '', code };
                                    return handlePager(pagerParams);
                                } else {
                                    if (callback) {
                                        callback()
                                    }
                                }
                            }
                            return
                        })
                    })
                } else {
                    _this.setState({ isPrint: true }, () => {
                        window.Print(_this.tailPrint(data[0], saleDate), value => {
                            if (!!value) {
                                _this.setState({ isPrint: false })
                                data.shift()
                                return _this.handleKHPrintFunc(data, idSheetNo, saleDate, callback, code)
                            }
                        })
                    })
                }
            }
        } else {
            if (callback) {
                callback()
            }
        }
    }

    //八达通增值写卡
    octocardRecharge = (_total, _isOddChange, _OddChangeState, reHandle, octoRwType, octoRwCardId, octoPollTimes, isAutoPay) => {
        let that = this;
        if (isAutoPay && isAutoPay === true) {
            let xstt = {};
            if (_isOddChange === true) {
                xstt = _OddChangeState;
            }
            if (!!this.state.query && !!this.state.query && !!this.state.query.djlb) {
                if (this.state.query.djlb === 'Y3') {
                    xstt.octoDjlb = 'Y3';
                } else if (this.state.query.djlb === 'Y9') {
                    xstt.octoDjlb = 'Y9';
                }
            } else {
                xstt.octoDjlb = '';
            }   
            xstt.octopusDeviceId = this.props.octoDeviceId;
            xstt.octopusCardno = this.props.octoCardId;
            xstt.octopusRechargeTotal = _total;
            xstt.octopusBalance = 0;
            xstt.octopusIsSmart = false;   //是否八达通智能卡
            xstt.octopusTransDate = "";
            xstt.octopusLastAddValDate = "";    //最近增值日期
            xstt.octopusLastAddValType = "";    //最近增值类型
            xstt.octopusLastAddValTypeEn = "";    //最近增值类型(english)
            xstt.octozlDone = _isOddChange === true ? true : false;
            xstt.octozzDone = xstt.octoDjlb === 'Y3' ? true : false;
            xstt.octopusRetrying = false;
            that.setState(xstt, () => {
                if (_isOddChange === true) {
                    let changePayItem = that.state.payList.find((item) => {
                        return item.flag === "2";
                    });
                    if (!!changePayItem) {
                        let payinfo = that.state.paymode.find((payitem) => {
                            return payitem.code === changePayItem.paycode;
                        });
                        let fphmMax = /(\d*)9999$/;
                        let _fphm = fphmMax.exec(changePayItem.fphm) === null ? (Number(changePayItem.fphm) + 1) : (Number(("" + changePayItem.fphm).replace(fphmMax, "$10000")) + 1);
                        // 找零到八达通自动生成增值订单
                        const req = {
                            command_id: "CHARGEBDT",
                            mkt: that.props.mkt,                 // 门店号
                            syjh: that.props.syjh,               // 终端号
                            operators: that.props.operators,     // 操作员号
                            mktname: that.props.mktinfo.mktname, // 门店名称
                            ent_id: that.props.entid,            // 企业ID
                            jygz: that.props.jygs,               // 经营公司
                            language: 'CHN',                     // 小票语言
                            vjzrq: moment().format('YYYY-MM-DD HH:mm:ss'),    // 日期
                            djlb: "Y9",                          // 单据类别
                            ysje: changePayItem.total,           // 已收金额
                            qty: 1,                              // 商品数量
                            barcode: "12952701",                 // 商品code
                            fphm: "" + _fphm,    // 小票号码
                            paycode: changePayItem.paycode,      // 付款方式代码
                            payno: payinfo.code,                             // 付款订单号
                            ybje: changePayItem.ybje,            // 原币金额
                            hl: changePayItem.hl,                // 汇率
                            zlhl: payinfo.zlhl,                  // 找零汇率
                            total: changePayItem.total,          // 付款金额
                            totalfrac: 0,                        // 收银损益
                            payid: "",                           // 付款卡号；（储值卡卡号或微信交易单号）
                            paytype: "" + payinfo.paytype,     // 付款大类
                            trace: "",            // 银联流水号
                            terminalid: "",       // 终端号
                            merchantid: "",       // 机构号
                            batchno: "",          // 批次号
                            reference: "",        // 银行卡交易参考号
                            flag: "2",            // 是否立即支付 默认为1 1付款 2找零3 扣回
                            yhje: 0,             // 优惠金额
                            shyhje: 0,           // 商户优惠金额
                            payyhje: 0,          // 支付渠道优惠金额
                            iszl: payinfo.iszl,              // 是否找零 Y-N
                            isyy: payinfo.isyy,              // 是否溢余Y-N
                            minval: payinfo.minval,          // 最小成交金额
                            maxval: payinfo.maxval,          // 最大成交金额
                            sswrfs: payinfo.sswrfs,          // 四舍五入方式
                            sswrjd: "" + payinfo.sswrjd,          // 四舍五入精度
                            payname: changePayItem.payname,   // 付款方式名称
                            yys: "javapos",        // 渠道号
                            octopusDeviceId: !!this.state.octopusDeviceId ? this.state.octopusDeviceId.toUpperCase() : "",//八达通设备号
                            octopusCardno: this.state.octopusCardno,//八达通卡号
                            octopusRechargeTotal: "" + Number(this.state.octopusRechargeTotal).toFixed(2),
                            octopusBalance: "" + Number(this.state.octopusBalance).toFixed(2),//八达通余额
                            octopusLastAddValDate: this.state.octopusLastAddValDate,//最近一次增值日期
                            octopusLastAddValType: this.props.switchEng === true ? this.state.octopusLastAddValTypeEn : this.state.octopusLastAddValType,    //最近一次增值类型
                            // octopusLastAddValTypeEn: this.state.octopusLastAddValTypeEn,//最近一次增值类型(english)
                            octopusIsSmart: this.state.octopusIsSmart, //是否智能八达通卡
                            octopusTranscationTime: this.state.octopusTransDate,
                            octopusRefNo: changePayItem.fphm,
                            flow_no: this.props.flow_no
                        };
                        Fetch(
                            {
                                url: Url.base_url,
                                type: "POST",
                                data: req
                            }
                        ).then(res => {
                            if (res.retflag == "0") {
                                this.finalSubmit();
                            }
                        }).catch((error) => {
                            console.error('[' + req.command_id + '] Error:', error);
                        });
                    }
                } else {
                    // 增值八达通更新八达通相关信息
                    const req = {
                        command_id: "REFRESHOCTOPUSINFO",
                        operators: that.props.operators,     // 操作员号
                        flow_no: this.props.flow_no,
                        mkt: that.props.mkt,                 // 门店号
                        syjh: that.props.syjh,               // 终端号
                        octopusDeviceId: !!this.state.octopusDeviceId ? this.state.octopusDeviceId.toUpperCase() : "",//八达通设备号
                        octopusCardno: this.state.octopusCardno,//八达通卡号
                        octopusRechargeTotal: "" + Number(this.state.octopusRechargeTotal).toFixed(2),
                        octopusBalance: "" + Number(this.state.octopusBalance).toFixed(2),//八达通余额
                        octopusLastAddValDate: this.state.octopusLastAddValDate,//最近一次增值日期
                        octopusLastAddValType: this.props.switchEng === true ? this.state.octopusLastAddValTypeEn : this.state.octopusLastAddValType,    //最近一次增值类型
                        // octopusLastAddValTypeEn: this.state.octopusLastAddValTypeEn,//最近一次增值类型(english)
                        octopusIsSmart: this.state.octopusIsSmart, //是否智能八达通卡
                        octopusTranscationTime: this.state.octopusTransDate
                    };
                    Fetch(
                        {
                            url: Url.base_url,
                            type: "POST",
                            data: req
                        }
                    ).then(res => {
                        if (res.retflag == "0") {
                            this.finalSubmit();
                        }
                    }).catch((error) => {
                        console.error('[' + req.command_id + '] Error:', error);
                    });
                }
            });
            return;
        }
        if (octoRwType === undefined) {
            octoRwType = "03";
        }
        let octoWaitEnd = () => {
            if (!!this.octoWaitingModal) {
                this.octoWaitingModal.destroy()
            }
        }
        let octoWaitStart = () => {
            this.octoWaitingModal = Modal.info({
                className: "octoWaiting",
                content: (<div><Spin /> &nbsp; {intl.get("INFO_OCTOSWIPE")}</div>)
            });
        }
        this.octoClearCancel();
        let pollParam = {
            type: octoRwType,
            receiptNum: this.props.syjh + this.props.fphm,
            money: _total * 10,
            cardNo: octoRwCardId,
            pollTimes: octoPollTimes
        };
        let pollRes = window["Octopus"](pollParam);
        octoWaitEnd();
        let operFix = _isOddChange === true ? intl.get("INFO_OCTODOCHANGE")/*找零到八达通*/ : intl.get("INFO_OTPCHANGE");
        /*八达通增值*/
        let stt = {};
        if (_isOddChange === true) {
            stt = _OddChangeState;
        }
        if (!!this.state.query && !!this.state.query && !!this.state.query.djlb && this.state.query.djlb === 'Y3') {
            stt.octoDjlb = 'Y3';
        } else {
            stt.octoDjlb = '';
        }
        let doSuccess = (isSmartCard, _tempBalance, _req) => {
            let zzCtt = (
                <div className="octoAVDInfo">
                    <ul className="en">
                        <li>
                            <span className="label">Add value amount</span>
                            <span className="value">${(pollRes.object.addValue / 10).toFixed(1)}</span>
                        </li>
                        {isSmartCard === true ? null : (
                            <li>
                                <span className="label">Remaining value</span>
                                <span
                                    className="value">{_tempBalance > 0 ? "" : (_tempBalance < 0 ? "-" : "")}${Math.abs(_tempBalance).toFixed(1)}</span>
                            </li>
                        )}
                    </ul>
                    <ul className="cn">
                        <li>
                            <span className="label">{intl.get("INFO_OCTOADDAMOUT")}</span>
                            <span className="value">${(pollRes.object.addValue / 10).toFixed(1)}</span>
                        </li>
                        {isSmartCard === true ? null : (
                            <li>
                                <span className="label">{intl.get("INFO_OCTOBALANCE")}</span>
                                <span
                                    className="value">{_tempBalance > 0 ? "" : (_tempBalance < 0 ? "-" : "")}${Math.abs(_tempBalance).toFixed(1)}</span>
                            </li>
                        )}
                    </ul>
                </div>
            );
            let zlCtt = (
                <div className="octoAVDInfo">
                    <ul className="en">
                        <li>
                            <span className="label">Change Topup</span>
                            <span className="value">${(pollRes.object.addValue / 10).toFixed(1)}</span>
                        </li>
                        {isSmartCard === true ? null : (
                            <li>
                                <span className="label">Remaining value</span>
                                <span
                                    className="value">{_tempBalance > 0 ? "" : (_tempBalance < 0 ? "-" : "")}${Math.abs(_tempBalance).toFixed(1)}</span>
                            </li>
                        )}
                    </ul>
                    <ul className="cn">
                        <li>
                            <span className="label">{intl.get("INFO_OCTOCHANGEADDVAL")}</span>
                            <span className="value">${(pollRes.object.addValue / 10).toFixed(1)}</span>
                        </li>
                        {isSmartCard === true ? null : (
                            <li>
                                <span className="label">{intl.get("INFO_OCTOBALANCE")}</span>
                                <span
                                    className="value">{_tempBalance > 0 ? "" : (_tempBalance < 0 ? "-" : "")}${Math.abs(_tempBalance).toFixed(1)}</span>
                            </li>
                        )}
                    </ul>
                </div>
            );
            // 客户要求增值&找零增值成功后，此处不再弹窗确认
            // Modal.info({
            //     className: 'octoTipInfo',
            //     title: intl.get("INFO_TIP"),   //提示
            //     okText: intl.get("BTN_CONFIRM"),   //确定
            //     content: (!!that.state.query && !!that.state.query && !!that.state.query.djlb && that.state.query.djlb === 'Y3') ? zzCtt : zlCtt,
            //     onOk() {
            //     }
            // });
            if (!!that.state.query && !!that.state.query && !!that.state.query.djlb && that.state.query.djlb === 'Y3') {
                // 增值八达通成功后，回到支付页（待付款完成后返回销售页）
                that.finalSubmit();
            } else {
                // 找零到八达通成功后，即刻提交并返回销售页
                that.finalSubmit(_req);
            }
        };
        if (pollRes.success === true) {
            that.octoClear(10);
            OctoCountdown.close();
            let isSmartCard = false;
            if (!!pollRes.object.customerInfo && !!pollRes.object.customerInfo.octopusType) {
                if (pollRes.object.customerInfo.octopusType === "1") {
                    isSmartCard = true;
                }
            }
            let _tempBalance = pollRes.object.balance;
            _tempBalance = (_tempBalance / 10).toFixed(1);
            stt.octopusDeviceId = pollRes.object.deviceID;
            stt.octopusCardno = pollRes.object.cardID;
            stt.octopusRechargeTotal = _total;
            stt.octopusBalance = _tempBalance;
            stt.octopusIsSmart = isSmartCard;   //是否八达通智能卡
            stt.octopusTransDate = pollRes.object.transDate;
            stt.octopusLastAddValDate = pollRes.object.lastAddValueDate;    //最近增值日期
            let octAddValType = "";
            let octAddValTypeEn = "";
            if (pollRes.object.lastAddValueType === "1") {
                octAddValType = intl.get("INFO_OCTOATCASH");
                octAddValTypeEn = "Cash";
            } else if (pollRes.object.lastAddValueType === "2") {
                octAddValType = intl.get("INFO_OCTOATONLINE");
                octAddValTypeEn = "Online";
            } else if (pollRes.object.lastAddValueType === "4") {
                octAddValType = intl.get("INFO_OCTOATAAVS");
                octAddValTypeEn = "AAVS";
            }
            stt.octopusLastAddValType = octAddValType;    //最近增值类型
            stt.octopusLastAddValTypeEn = octAddValTypeEn;    //最近增值类型(english)
            stt.octozlDone = _isOddChange === true ? true : false;
            stt.octozzDone = stt.octoDjlb === 'Y3' ? true : false;
            stt.octopusRetrying = false;
            that.setState(stt, () => {
                if (_isOddChange === true) {
                    let changePayItem = that.state.payList.find((item) => {
                        return item.flag === "2";
                    });
                    if (!!changePayItem) {
                        let payinfo = that.state.paymode.find((payitem) => {
                            return payitem.code === changePayItem.paycode;
                        });
                        let fphmMax = /(\d*)9999$/;
                        let _fphm = fphmMax.exec(changePayItem.fphm) === null ? (Number(changePayItem.fphm) + 1) : (Number(("" + changePayItem.fphm).replace(fphmMax, "$10000")) + 1);
                        // 找零到八达通自动生成增值订单
                        const req = {
                            command_id: "CHARGEBDT",
                            mkt: that.props.mkt,                 // 门店号
                            syjh: that.props.syjh,               // 终端号
                            operators: that.props.operators,     // 操作员号
                            mktname: that.props.mktinfo.mktname, // 门店名称
                            ent_id: that.props.entid,            // 企业ID
                            jygz: that.props.jygs,               // 经营公司
                            language: 'CHN',                     // 小票语言
                            vjzrq: moment().format('YYYY-MM-DD HH:mm:ss'),    // 日期
                            djlb: "Y9",                          // 单据类别
                            ysje: changePayItem.total,           // 已收金额
                            qty: 1,                              // 商品数量
                            barcode: "12952701",                 // 商品code
                            fphm: "" + _fphm,    // 小票号码
                            paycode: changePayItem.paycode,      // 付款方式代码
                            payno: payinfo.code,                             // 付款订单号
                            ybje: changePayItem.ybje,            // 原币金额
                            hl: changePayItem.hl,                // 汇率
                            zlhl: payinfo.zlhl,                  // 找零汇率
                            total: changePayItem.total,          // 付款金额
                            totalfrac: 0,                        // 收银损益
                            payid: "",                           // 付款卡号；（储值卡卡号或微信交易单号）
                            paytype: "" + payinfo.paytype,     // 付款大类
                            trace: "",            // 银联流水号
                            terminalid: "",       // 终端号
                            merchantid: "",       // 机构号
                            batchno: "",          // 批次号
                            reference: "",        // 银行卡交易参考号
                            flag: "2",            // 是否立即支付 默认为1 1付款 2找零3 扣回
                            yhje: 0,             // 优惠金额
                            shyhje: 0,           // 商户优惠金额
                            payyhje: 0,          // 支付渠道优惠金额
                            iszl: payinfo.iszl,              // 是否找零 Y-N
                            isyy: payinfo.isyy,              // 是否溢余Y-N
                            minval: payinfo.minval,          // 最小成交金额
                            maxval: payinfo.maxval,          // 最大成交金额
                            sswrfs: payinfo.sswrfs,          // 四舍五入方式
                            sswrjd: "" + payinfo.sswrjd,          // 四舍五入精度
                            payname: changePayItem.payname,   // 付款方式名称
                            yys: "javapos",        // 渠道号
                            octopusDeviceId: !!this.state.octopusDeviceId ? this.state.octopusDeviceId.toUpperCase() : "",//八达通设备号
                            octopusCardno: this.state.octopusCardno,//八达通卡号
                            octopusRechargeTotal: "" + Number(this.state.octopusRechargeTotal).toFixed(2),//八达通卡号
                            octopusBalance: "" + Number(this.state.octopusBalance).toFixed(2),//八达通余额
                            octopusLastAddValDate: this.state.octopusLastAddValDate,//最近一次增值日期
                            octopusLastAddValType: this.props.switchEng === true ? this.state.octopusLastAddValTypeEn : this.state.octopusLastAddValType,    //最近一次增值类型
                            // octopusLastAddValTypeEn: this.state.octopusLastAddValTypeEn,//最近一次增值类型(english)
                            octopusIsSmart: this.state.octopusIsSmart, //是否智能八达通卡
                            octopusTranscationTime: this.state.octopusTransDate,
                            octopusRefNo: changePayItem.fphm,
                            flow_no: this.props.flow_no
                        };
                        // chargebdtReq.fphm = that.props.fphm;
                        // chargebdtReq.octopusRefNo = octoZlzzOrgiRef;
                        // chargebdtReq.flow_no = octoZlzzOrgiFlowNo;
                        // console.log("CHARGEBDT req:", req)
                        octoZzReceipt('CHARGEBDT', req, doSuccess, { isSmartCard, _tempBalance, req });
                        // doSuccess(isSmartCard, _tempBalance, req);
                    }
                } else {
                    // 增值八达通更新八达通相关信息
                    const req = {
                        command_id: "REFRESHOCTOPUSINFO",
                        operators: that.props.operators,     // 操作员号
                        flow_no: this.props.flow_no,
                        mkt: that.props.mkt,                 // 门店号
                        syjh: that.props.syjh,               // 终端号
                        octopusDeviceId: !!this.state.octopusDeviceId ? this.state.octopusDeviceId.toUpperCase() : "",//八达通设备号
                        octopusCardno: this.state.octopusCardno,//八达通卡号
                        octopusRechargeTotal: "" + Number(this.state.octopusRechargeTotal).toFixed(2),//八达通卡号
                        octopusBalance: "" + Number(this.state.octopusBalance).toFixed(2),//八达通余额
                        octopusLastAddValDate: this.state.octopusLastAddValDate,//最近一次增值日期
                        octopusLastAddValType: this.props.switchEng === true ? this.state.octopusLastAddValTypeEn : this.state.octopusLastAddValType,    //最近一次增值类型
                        // octopusLastAddValTypeEn: this.state.octopusLastAddValTypeEn,//最近一次增值类型(english)
                        octopusIsSmart: this.state.octopusIsSmart, //是否智能八达通卡
                        octopusTranscationTime: this.state.octopusTransDate
                    };
                    // console.log("REFRESHOCTOPUSINFO req:", req)
                    octoZzReceipt('REFRESHOCTOPUSINFO', req, doSuccess, { isSmartCard, _tempBalance });
                    // doSuccess(isSmartCard, _tempBalance);
                }
            });
        } else {
            let cnMsg = "";
            let enMsg = "";
            if (pollRes.code === "100022") {
                // Octopus强制重试错误时
                if (this.state.octopusRetrying === true) {
                    // 正处理强制重试流程中
                    OctoCountdown.close();
                    this.setState({
                        octopusRetrying: true
                    }, () => {
                        // 请重试（八达通号码{cardID}）
                        cnMsg = (<ul>
                            <li>{intl.get("INFO_OCTO" + pollRes.errorCode + "TIP")}</li>
                            <li>{pollRes.enMsgTit}</li>
                            <li><p>&nbsp;</p></li>
                            <li>{intl.get("INFO_OCTO" + pollRes.errorCode + "STT")}</li>
                            <li>{pollRes.enMsgStt}</li>
                            <li><p>&nbsp;</p></li>
                            <li>{intl.get("INFO_OCTO" + pollRes.errorCode)}</li>
                            <li>{pollRes.enMsg}</li>
                            <li><p>&nbsp;</p></li>
                            <li>{intl.get("INFO_OCTIPRETRY", { cardID: pollRes.object.cardID })}</li>
                            <li>Retry please (Octopus no. {pollRes.object.cardID})</li>
                        </ul>);
                        if (_isOddChange === true) {
                            // 找零增值
                            OctoCountdown.open({
                                data: {
                                    cnMsg,
                                    octoAccess: () => {
                                        // 继续poll，并重置倒计时时间
                                        // that.octocardRecharge(_total, _isOddChange, _OddChangeState, reHandle, "08", pollRes.object.cardID, pollRes.object.retryMsg.pollTimes);
                                        that.octocardRecharge(_total, _isOddChange, _OddChangeState, reHandle, "08", pollRes.object.cardID, 200);
                                    }
                                },
                            });
                        } else {
                            // 增值
                            OctoCountdown.open({
                                data: {
                                    cnMsg,
                                    octoAccess: () => {
                                        // 继续poll，并重置倒计时时间
                                        // that.octocardRecharge(that.props.zdsjtotal, false, null, undefined, "08", pollRes.object.cardID, pollRes.object.retryMsg.pollTimes);
                                        that.octocardRecharge(that.props.zdsjtotal, false, null, undefined, "08", pollRes.object.cardID, 200);
                                    }
                                },
                            });
                        }
                    });
                } else {
                    // 未在强制重试流程中
                    this.setState({
                        octopusRetrying: true
                    }, () => {
                        // 请通知顾客用同一张卡再次拍卡，以确保交易无误
                        cnMsg = (<ul>
                            <li>{intl.get("INFO_OCTO" + pollRes.errorCode + "TIP")}</li>
                            <li>{pollRes.enMsgTit}</li>
                            <li><p>&nbsp;</p></li>
                            <li>{intl.get("INFO_OCTO" + pollRes.errorCode + "STT")}</li>
                            <li>{pollRes.enMsgStt}</li>
                            <li><p>&nbsp;</p></li>
                            <li>{intl.get("INFO_OCTO" + pollRes.errorCode)}</li>
                            <li>{pollRes.enMsg}</li>
                        </ul>);
                        if (_isOddChange === true) {
                            // 找零增值
                            OctoCountdown.open({
                                data: {
                                    cnMsg,
                                    octoAccess: () => {
                                        // 开始持续poll，重置倒计时时间20秒
                                        that.octocardRecharge(_total, _isOddChange, _OddChangeState, reHandle, "08", pollRes.object.cardID, 200);
                                    }
                                },
                            });
                        } else {
                            // 增值
                            OctoCountdown.open({
                                data: {
                                    cnMsg,
                                    octoAccess: () => {
                                        // 开始持续poll，重置倒计时时间20秒
                                        that.octocardRecharge(that.props.zdsjtotal, false, null, undefined, "08", pollRes.object.cardID, 200);
                                    }
                                },
                            });
                        }
                    });
                }
                return false;
            } else if (pollRes.code === "100032") {
                // Octopus拍卡超时错误时
                if (_isOddChange === true) {
                    // 找零增值
                    if (this.state.octopusRetrying === true) {
                        // 正处理强制重试流程中
                        // 结束强制重试
                        // that.setState({octopusRetrying: false}, ()=>{
                        //     OctoCountdown.close();
                        //     that.afterPayHandle(reHandle.isPaySuccessed, reHandle.res, reHandle.errMsg, false);
                        // });
                        // that.setState({octopusRetrying: false}, ()=>{
                        OctoCountdown.close();
                        cnMsg = intl.get("INFO_OCTO" + pollRes.code);
                        enMsg = pollRes.enMsg;
                        // });
                        // return false;
                    } else {
                        // 普通100032错误时
                        cnMsg = intl.get("INFO_OCTO" + pollRes.code);
                        enMsg = pollRes.enMsg;
                    }
                } else {
                    // 增值
                    if (this.state.octopusRetrying === true) {
                        // 正处理强制重试流程中
                        // 结束强制重试
                        // that.setState({octopusRetrying: false}, ()=>{
                        //     OctoCountdown.close();
                        //     // that.hidePayDialog();
                        // });
                        // that.setState({octopusRetrying: false}, ()=>{
                        OctoCountdown.close();
                        cnMsg = intl.get("INFO_OCTO" + pollRes.code);
                        enMsg = pollRes.enMsg;
                        // });
                        // return false;
                    } else {
                        // 普通100032错误时
                        cnMsg = intl.get("INFO_OCTO" + pollRes.code);
                        enMsg = pollRes.enMsg;
                    }
                }
            } else if (pollRes.code === "-999999") {
                // 强制重试流程中，拍非SameCard错误时
                OctoCountdown.close();
                this.setState({
                    octopusRetrying: true
                }, () => {
                    // 请重试（八达通号码{cardID}）
                    cnMsg = (<ul>
                        <li>{intl.get("INFO_OCTIPRETRY", { cardID: pollRes.object.cardID })}</li>
                        <li>Retry please (Octopus no. {pollRes.object.cardID})</li>
                    </ul>);
                    if (_isOddChange === true) {
                        // 找零增值
                        OctoCountdown.open({
                            data: {
                                cnMsg,
                                octoAccess: () => {
                                    // 继续poll，不重置倒计时时间
                                    that.octocardRecharge(_total, _isOddChange, _OddChangeState, reHandle, "08", pollRes.object.cardID, pollRes.object.retryMsg.pollTimes);
                                }
                            },
                        });
                    } else {
                        // 增值
                        OctoCountdown.open({
                            data: {
                                cnMsg,
                                octoAccess: () => {
                                    // 继续poll，不重置倒计时时间
                                    that.octocardRecharge(that.props.zdsjtotal, false, null, undefined, "08", pollRes.object.cardID, pollRes.object.retryMsg.pollTimes);
                                }
                            },
                        });
                    }
                });
                return false;
            } else if (pollRes.errorCode === "999999") {
                // Octopus文档不涉及的普通错误时
                cnMsg = intl.get("INFO_OCTO999999", { errorCode: pollRes.code });
                enMsg = "Error " + pollRes.code;
            } else if (typeof pollRes === "string") {
                cnMsg = intl.get("INFO_OCTOSOCKETERR");
                // enMsg = pollRes.enMsg;
            } else {
                // Octopus文档中涉及的普通错误时
                cnMsg = intl.get("INFO_OCTO" + pollRes.code);
                enMsg = pollRes.enMsg;
            }
            // Octopus普通错误弹窗
            if (_isOddChange === true) {
                // 找零增值
                if (this.state.octopusRetrying === true) {
                    if (pollRes.code === "100032") {
                        // this.setState({octopusRetrying: false}, ()=>{
                        let _modal = Modal.confirm({
                            className: 'octoTipInfo',
                            title: operFix + intl.get("INFO_FAIL"),   //找零到八达通失败
                            okText: intl.get("BTN_RETRY"),   //重试
                            cancelText: intl.get("BACKTRACK"),   //返回
                            content: (<ul>
                                <li className="en">{enMsg}</li>
                                <li className="cn">{cnMsg}</li>
                            </ul>),
                            onOk() {
                                octoWaitStart();
                                setTimeout(() => {
                                    that.octocardRecharge(_total, _isOddChange, _OddChangeState, reHandle, "08", pollRes.object.cardID, 50);
                                }, 100);
                                _modal.destroy();
                            },
                            onCancel() {
                                that.setState({ octopusRetrying: false }, () => {
                                    if (pollRes.code !== "100001") {
                                        that.octoClear(10);
                                    }
                                    that.afterPayHandle(reHandle.isPaySuccessed, reHandle.res, reHandle.errMsg, false);
                                    window.octLog();
                                });
                            },
                        });
                        // });
                    } else {
                        // 正处理强制重试流程中
                        OctoCountdown.close();
                        // Octopus普通需重试/不需重试错误
                        if (pollRes.code === "100001" || pollRes.code === "100005") {
                            cnMsg = (<ul>
                                <li>{cnMsg}</li>
                                <li>{enMsg}</li>
                            </ul>);
                        } else {
                            cnMsg = (<ul>
                                <li>{cnMsg}</li>
                                <li>{enMsg}</li>
                                <li><p>&nbsp;</p></li>
                                <li>{intl.get("INFO_OCTIPRETRY", { cardID: pollRes.object.cardID })}</li>
                                <li>Retry please (Octopus no. {pollRes.object.cardID})</li>
                            </ul>);
                        }
                        OctoCountdown.open({
                            data: {
                                cnMsg,
                                octoAccess: () => {
                                    // 继续poll，不重置倒计时时间
                                    setTimeout(() => {
                                        that.octocardRecharge(_total, _isOddChange, _OddChangeState, reHandle, "08", pollRes.object.cardID, pollRes.object.retryMsg.pollTimes);
                                    }, 100);
                                }
                            },
                        });
                    }
                } else {
                    // 未在强制重试流程中
                    if (pollRes.retry > 0) {
                        // Octopus普通需重试错误
                        let _modal = Modal.confirm({
                            className: 'octoTipInfo',
                            title: operFix + intl.get("INFO_FAIL"),   //找零到八达通失败
                            okText: intl.get("BTN_RETRY"),   //重试
                            cancelText: intl.get("BACKTRACK"),   //返回
                            content: (<ul>
                                <li className="en">{enMsg}</li>
                                <li className="cn">{cnMsg}</li>
                            </ul>),
                            onOk() {
                                octoWaitStart();
                                setTimeout(() => {
                                    that.octocardRecharge(_total, _isOddChange, _OddChangeState, reHandle);
                                }, 100);
                                _modal.destroy();
                            },
                            onCancel() {
                                that.setState({ octopusRetrying: false }, () => {
                                    if (pollRes.code !== "100001") {
                                        that.octoClear(10);
                                    }
                                    that.afterPayHandle(reHandle.isPaySuccessed, reHandle.res, reHandle.errMsg, false);
                                    window.octLog();
                                });
                            },
                        });
                    } else {
                        // Octopus普通不需重试错误
                        Modal.info({
                            className: 'octoTipInfo',
                            title: operFix + intl.get("INFO_FAIL"),   //找零到八达通失败
                            okText: intl.get("BACKTRACK"),   //返回
                            content: (<ul>
                                <li className="en">{enMsg}</li>
                                <li className="cn">{cnMsg}</li>
                            </ul>),
                            onOk() {
                                that.setState({ octopusRetrying: false }, () => {
                                    if (pollRes.code !== "100001") {
                                        that.octoClear(10);
                                    }
                                    that.afterPayHandle(reHandle.isPaySuccessed, reHandle.res, reHandle.errMsg, false);
                                    window.octLog();
                                });
                            }
                        });
                    }
                }
            } else {
                // 增值
                if (this.state.octopusRetrying === true) {
                    if (pollRes.code === "100032") {
                        // this.setState({octopusRetrying: false}, ()=>{
                        let _modal = Modal.confirm({
                            className: 'octoTipInfo',
                            title: operFix + intl.get("INFO_FAIL"),   //八达通增值失败
                            okText: intl.get("BTN_RETRY"),   //重试
                            cancelText: intl.get("BACKTRACK"),   //返回
                            content: (<ul>
                                <li className="en">{enMsg}</li>
                                <li className="cn">{cnMsg}</li>
                            </ul>),
                            onOk() {
                                octoWaitStart();
                                setTimeout(() => {
                                    // that.octocardRecharge(that.props.zdsjtotal, false, null, undefined, "08", pollRes.object.cardID);
                                    that.octocardRecharge(that.props.zdsjtotal, false, null, undefined, "08", pollRes.object.cardID, 50);
                                }, 100);
                                _modal.destroy();
                            },
                            onCancel() {
                                that.setState({ octopusRetrying: false }, () => {
                                    if (pollRes.code !== "100001") {
                                        that.octoClear(10);
                                    }
                                    window.octLog();
                                });
                            },
                        });
                        // });
                    } else {
                        // 正处理强制重试流程中
                        OctoCountdown.close();
                        // Octopus普通需重试/不需重试错误
                        if (pollRes.code === "100001" || pollRes.code === "100005") {
                            cnMsg = (<ul>
                                <li>{cnMsg}</li>
                                <li>{enMsg}</li>
                            </ul>);
                        } else {
                            cnMsg = (<ul>
                                <li>{cnMsg}</li>
                                <li>{enMsg}</li>
                                <li><p>&nbsp;</p></li>
                                <li>{intl.get("INFO_OCTIPRETRY", { cardID: pollRes.object.cardID })}</li>
                                <li>Retry please (Octopus no. {pollRes.object.cardID})</li>
                            </ul>);
                        }
                        OctoCountdown.open({
                            data: {
                                cnMsg,
                                octoAccess: () => {
                                    // 继续poll，不重置倒计时时间
                                    setTimeout(() => {
                                        that.octocardRecharge(that.props.zdsjtotal, false, null, undefined, "08", pollRes.object.cardID, pollRes.object.retryMsg.pollTimes);
                                    }, 100);
                                }
                            },
                        });
                    }
                } else {
                    // 未在强制重试流程中
                    if (pollRes.retry > 0) {
                        // Octopus普通需重试错误
                        let _modal = Modal.confirm({
                            className: 'octoTipInfo',
                            title: operFix + intl.get("INFO_FAIL"),   //八达通增值失败
                            okText: intl.get("BTN_RETRY"),   //重试
                            cancelText: intl.get("BACKTRACK"),   //返回
                            content: (<ul>
                                <li className="en">{enMsg}</li>
                                <li className="cn">{cnMsg}</li>
                            </ul>),
                            onOk() {
                                octoWaitStart();
                                setTimeout(() => {
                                    that.octocardRecharge(that.props.zdsjtotal, false, null);
                                }, 100);
                                _modal.destroy();
                            },
                            onCancel() {
                                that.setState({ octopusRetrying: false }, () => {
                                    if (pollRes.code !== "100001") {
                                        that.octoClear(10);
                                    }
                                    window.octLog();
                                });
                            },
                        });
                    } else {
                        // Octopus普通不需重试错误
                        Modal.info({
                            className: 'octoTipInfo',
                            title: operFix + intl.get("INFO_FAIL"),   //八达通增值失败
                            okText: intl.get("BACKTRACK"),   //返回
                            content: (<ul>
                                <li className="en">{enMsg}</li>
                                <li className="cn">{cnMsg}</li>
                            </ul>),
                            onOk() {
                                that.setState({ octopusRetrying: false }, () => {
                                    if (pollRes.code !== "100001") {
                                        that.octoClear(10);
                                    }
                                    window.octLog();
                                });
                            }
                        });
                    }
                }
            }
        }
    }

    //八达通消费数据更新
    octoddRecord = (rec) => {
        this.setState({
            octopusDeviceId: rec.octopusDeviceId,    //八达通设备号
            octopusCardno: rec.octopusCardno,    //八达通卡号
            octopusBalance: rec.octopusBalance,  //八达通余额
            octopusDedudeTotal: rec.octopusDedudeTotal,
            octopusLastAddValDate: rec.octopusLastAddValDate,    //最近一次增值日期
            octopusLastAddValType: rec.octopusLastAddValType,    //最近一次增值类型
            octopusLastAddValTypeEn: rec.octopusLastAddValTypeEn,    //最近一次增值类型
            octopusIsSmart: rec.octopusIsSmartCard,
            octopusTransDate: rec.octopusTransDate
        });
    }

    //八达通已付款未写卡提交拦截
    octozzUnDoneFilter = () => {
        if (!!this.state.query && !!this.state.query && !!this.state.query.djlb
            && this.state.query.djlb === 'Y3'
            && this.state.query.isBl != "true"
            && (this.state.octozzfkDone === true && this.state.octozzDone === false)) {
            message(intl.get("INFO_ADDVALNOTDONE")); //八达通增值未完成，请拍卡
            setTimeout(() => {
                this.octocardRecharge(this.props.zdsjtotal, false, null)
            }, 300);
            return false;
        } else {
            return true;
        }
    }

    //八达通已付款未写卡取消拦截
    octozzDoneFilter = () => {
        if (!!this.state.query && !!this.state.query && !!this.state.query.djlb
            && this.state.query.djlb === 'Y3'
            && this.state.query.isBl != "true"
            && (this.state.octozzfkDone === true && this.state.octozzDone === false)) {
            // message(intl.get("INFO_ADDVALDONENOCANCEL")); //八达通卡已增值，不可取消付款
            // message(intl.get("INFO_ADDVALNOTDONE")); //八达通增值未完成，请拍卡
            // setTimeout(() => {
            //     this.octocardRecharge(this.props.zdsjtotal, false, null)
            // }, 300);
            // return false;
            return true
        } else {
            return true;
        }
    }

    //删除付款
    deletepay = (operators, flow_no, guid, mkt, syjh, isAmcPay, delItem) => {
        // if (item.payno === "0610") {
        //     message.info('该付款方式不允许删除！');
        // }else{
        let that = this;
        const req = {
            command_id: (!!isAmcPay && isAmcPay === true) ? "DELAEONAMCPAY" : "DELPAYCERTIFY",
            operators,//操作员号
            flow_no,//当前流水号
            guid,//付款行唯一标识
            mkt,
            syjh
        };
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then(res => {
            if ("0" === res.retflag) {
                message("刪除付款成功")
                let payMZcoupons;
                this.props.syspara.payObj.map((item) => {
                    let str = item.split(',');
                    if (str[0] == "payMZcoupons") {
                        payMZcoupons = str[1];
                        return;
                    }
                })
                if (delItem.paycode === payMZcoupons) {
                    this.afterZKpay()
                }
                let item = {}
                this.handleEjoural(delItem, 2);
                if (res.isNeedRefreshOrder) {
                    this.afterZKpay
                } else {
                    let payments = res.salePayments ? res.salePayments : [];
                    let sum = 0;
                    payments.map((item, index) => {
                        sum += Number(item.overage);
                    })
                    if (res.remainje == 0 && payments.length !== 0 && payments[payments.length - 1].flag === "2" && payments[payments.length - 1].je != 0) {
                        let _this = this;
                        let change = payments[payments.length - 1];
                        if (this.state.zliszzoctopus) {
                            // that.octoClear(10);
                            Modal.confirm({
                                className: 'zlzz-confirm',
                                okText: intl.get("INFO_OTPADDVALUE"),   //增值八达通
                                cancelText: _this.intl.get("CHANGE"),
                                onOk() {
                                    let newState = {
                                        batzzVisible: false,
                                        change: change.total,
                                        payList: [...payments],
                                        yftotal: parseFloat(res.sjfk),
                                        sftotal: res.remainje,
                                        overage: sum,
                                        changename: intl.get("INFO_OTPCHANGE"),   //八达通增值
                                    };
                                    message(intl.get("INFO_OCTOSWIPE"));    //请拍卡
                                    setTimeout(() => {
                                        _this.octocardRecharge(change.total, true, newState);
                                    }, 300);
                                },
                                onCancel() {
                                    _this.setState({
                                        batzzVisible: false,
                                        change: change.total,
                                        payList: [...payments],
                                        yftotal: res.zdsjtotal,
                                        sftotal: res.remainje,
                                        overage: sum,
                                        changename: _this.intl.get("CHANGE")
                                    });
                                },
                            });
                        } else {
                            _this.setState({
                                batzzVisible: false,
                                change: change.total,
                                payList: [...payments],
                                yftotal: res.zdsjtotal,
                                sftotal: res.remainje,
                                overage: sum,
                                changename: _this.intl.get("CHANGE")
                            });
                        }
                    } else {
                        this.setState({
                            change: '0.00',
                            payList: [...payments],
                            yftotal: res.zdsjtotal,
                            sftotal: res.remainje,
                            overage: sum,
                            changename: intl.get("CHANGE")
                        })
                    }
                }
            } else {
                message(res.retmsg);
            }
        }).catch((error) => {
            console.error('error', error);
            throw new Error(error);
        });
    }

    //取消付款
    cancelpay = (operators, flow_no, mkt, syjh) => {
        this.setState({
            cacelButtonDisabled: true
        })
        let that = this;
        const req = {
            command_id: "CANCELPAYCERTIFY",
            operators,//操作员号
            flow_no,
            flag: "0",//默认为0
            mkt,//门店号编码
            syjh//终端号
        };
        Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then(res => {
            if (res.retflag === "0") {
                // that.octoClear(10);
                // NativeModules.ControlFile.clearFlowNo();RN断电保护
                if (this.state.payList && this.state.payList.length > 0) {
                    this.state.payList.forEach(item => {
                        if (item.isAutoDelOnly || item.paycode === '0707') {
                            this.handleEjoural(item, 2)
                        }
                    })
                }
                // this.props.router.goBack()
                let path;
                switch (this.props.type) {
                    case "returnGoods":
                        path = {
                            pathname: '/returngoods',
                            state: { type: "invoice" },
                        };
                        break;
                    case "eliminatebills":
                        path = {
                            pathname: '/eliminatebills',
                            state: { type: "invoice" },
                        };
                        break;
                    case "finalpayment":
                        path = this.state.query.djlb === '4' ? 'cancelFinalpayment' : "/finalpayment"
                        break;
                    default:
                        path = this.props.isDiningHall ? "/square" : "/presale";
                        break;
                }
                this.props.router.push(path);
            } else {
                this.setState({
                    cacelButtonDisabled: false
                })
                message(res.retmsg)
            }
        }).catch(err => {
            this.setState({
                cacelButtonDisabled: true
            })
            console.log(err);
            throw new Error(err);
        })
    }

    //更新收银机状态
    updateSyjstate = (syjcurinvbs, syjcurcashje, syjcurinvje, oldFphm = this.props.fphm) => {
        localStorage.setItem('fphm', moment(new Date()).format('YYMMDD') + this.props.syjh + oldFphm);
        const req = {
            command_id: "UPDATECASHIERSTATUSCERTIFY",
            mkt: this.props.mkt,//门店号
            syjh: this.props.syjh,//收银机号
            syjcursyyh: this.props.operators,//收银机当前收银员
            syjcurinvje,//收银机当前交易金额
            syjcurstatus: "6",//收银机当前状态
            syjcurinvbs,//收银机当前交易笔数
            syjcurcashje,//收银机当前现金金额
            syjcurnum: oldFphm,//收银机当前小票号
            erpCode: this.props.jygs,//经营公司
        };
        // console.log(req)
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then(res => {
            if ("0" === res.retflag) {
                return res.syjcurstatus;
            } else {
                console.log("更新收银机状态失败" + res.retflag + "----" + res.retmsg);
                // throw new Error("更新收银机状态失败" + res.retflag + "----" + res.retmsg);
            }
        }).catch((error) => {
            console.error('error', error);
            // throw new Error(error);
        });
    }

    //打印回调方法
    printAfter = (printData, isACS, cashTotal, data, isSDYN, isPTFQ, octoZlzzNeedsPrint, octozzSalePrintData, octoZlzzOrgiRef, oldFphm) => {
        console.log(printData)
        console.log(data)
        console.log("打印回调方法")
        if (this.props.addDjlb == "Y10" || this.props.addDjlb == "Y11" || this.props.addDjlb == "Y19") {
            this.props.updateAMC()
        }

        //消单控制
        if (this.state.type === "2" && !printData.head[0].isflPrint) {
            printData.head[0].printtype = "0";
        }
        // ACS SDYN控制
        if (!data || data.code !== "0") {
            isACS = false;
            isSDYN = false;
            isPTFQ = false;
            if (octoZlzzNeedsPrint) this.props.update();
            octoZlzzNeedsPrint = false;
            printData.head[0].printtype = "0";
            message(data.message);
        }
        //页面跳转和更新收银机状态
        if (!isACS && !isSDYN && !isPTFQ && printData.head[0].printtype == "0" && !octoZlzzNeedsPrint) {
            if (this.state.type == "4" || this.state.type == "2" || this.state.type == "Y2") {
                let a = window.SyncCASHIER({
                    cash: cashTotal,
                    dealNumbers: 1,
                    mediaTotal: 0 - this.props.zdyftotal,
                    na: this.state.type == '4' && this.props.isDj ? 0 - (this.props.zdyftotal - this.props.sjtotal) : 0 - this.props.zdyftotal
                })
                this.setState({
                    na: a.na
                }, () => {
                    this.handleEjoural("item", 4)
                })
                this.updateSyjstate(a.dealNumbers, a.cash, a.mediaTotal, oldFphm).then((res) => {
                    if (this.state.type == "2") {
                        this.props.eliminateInit();
                    } else {
                        this.props.returnInit();
                        if (this.props.type == "finalpayment" && this.state.query.djlb === '4') {
                            this.props.finalpaymentInit();
                        }
                    }
                    // this.props.update();
                    this.setState({ isPrint: false });
                    this.props.router.push("/home");
                })
                return;
            } else if (this.state.type == "Y6") {
                let a = window.SyncCASHIER({
                    cash: cashTotal,
                    dealNumbers: 1,
                    mediaTotal: this.props.zdyftotal,
                    na: this.props.zdyftotal
                })
                this.setState({
                    na: a.na
                }, () => {
                    this.handleEjoural("item", 4)
                })
                this.updateSyjstate(a.dealNumbers, a.cash, a.mediaTotal, oldFphm).then((res) => {
                    this.props.finalpaymentInit();
                    // this.props.update();
                    this.setState({ isPrint: false });
                    this.props.router.push("/home");
                })
                return;
            } else {
                //收银练习处理
                if (this.props.djlb === "Y7") {
                    this.handleEjoural("item", 4);
                    // this.props.update();
                    this.props.init();
                    this.setState({ isPrint: false });
                    this.props.router.push("/presale");
                    return;
                }

                //记录钱箱金额
                let a = window.SyncCASHIER({
                    cash: cashTotal,
                    dealNumbers: 1,
                    mediaTotal: this.props.zdyftotal,
                    na: !!this.props.salePayments.filter(v => v.paycode === '0602') ? Number(this.props.zdyftotal - this.props.sjtotal) : this.props.zdyftotal
                })
                this.setState({
                    na: a.na
                }, () => {
                    this.handleEjoural("item", 4)
                    if (octozzSalePrintData === 1) this.props.update();
                })
                //更新收银机状态
                const updateSyjstateFunc = () => {
                    this.updateSyjstate(a.dealNumbers, a.cash, a.mediaTotal, oldFphm).then((status) => {
                        this.props.init();
                        // this.props.update();
                        let promptNum = this.props.interval || 0;
                        let info = {
                            title: intl.get("LOCK_TIP"),
                            okText: intl.get("INFO_CONFIRMA"),
                            content: intl.get("INFO_CASHEXCESS"),
                        };
                        if (status === '0') {
                            Modal.info(info);
                            this.setState({ isPrint: false });
                            this.props.router.push("/home");
                            return;
                        } else if (status === '8' && promptNum < 2) { //状态为8为现金溢出
                            if (promptNum === 0) {//第一次提示
                                Modal.info(info);
                                this.props.cashierWarn(1);
                            } else if (promptNum === 1) {//第二次提示（超出峰值允许交易）
                                let record = window["SyncCASHIER"]({
                                    cash: 0,
                                    dealNumbers: 0
                                });
                                let { cashsale, maxxj } = this.props.syspara;
                                let tranSales = cashsale.split(',');
                                if (parseFloat(record.cash) > parseFloat(tranSales[1])) {
                                    Modal.info(info);
                                    this.props.cashierWarn(2);
                                }
                            }
                        }
                        this.setState({ isPrint: false });
                        this.props.router.push(this.props.isDiningHall ? "/square" : "/presale");
                    })
                }
                if (this.props.isDiningHall && !this.props.breadFlag) {
                    // processFlag为1则打印后厨 processFlag为0则什么都不打
                    let goodsList = this.state.submitResult.goodsList.filter(v => v.processFlag == 1)
                    let groupByGoodsList = this.groupBy(goodsList, item => {
                        return [item.stallCode]
                    })
                    // let groupByGoodsList = this.groupBy(this.state.submitResult.goodsList, item => {
                    //     return [item.stallCode]
                    // })
                    //常购商品剔除
                    let list = groupByGoodsList.filter(v => v[0].stallCode !== '');
                    let refno = this.props.syjh + this.props.fphm
                    if (this.props.pagerType == 'KH') {
                        this.handleKHPrintFunc(list, refno, this.state.submitResult.saleDate, updateSyjstateFunc, [], true)
                    } else {
                        this.handleWPPrintFunc(list, refno, this.state.submitResult.saleDate, updateSyjstateFunc, [], true)
                    }
                } else {
                    updateSyjstateFunc()
                }
                return;
            }
        }

        //八达通增值小票
        if (printData.head[0].printtype === "0" && octoZlzzNeedsPrint === true) {
            octozzSalePrintData.Module = 'OctozzSalePrint';
            octozzSalePrintData.head[0].refno = this.props.syjh + this.props.fphm,  //ref值
                octozzSalePrintData.head[0].fphm = this.props.fphm,  //ref值
                // octozzSalePrintData.head[0].hykh = that.props.vip_no;   //会员号
                octozzSalePrintData.head[0].octopusRechargeTotal = "" + Number(this.state.change).toFixed(2); //(找零)充值金额
            octozzSalePrintData.head[0].orgiRefno = octoZlzzOrgiRef;
            octozzSalePrintData.head[0].zl = this.state.change; //找零金额
            octozzSalePrintData.head[0].printtype = "0"; //热敏
            octozzSalePrintData.head[0].barcodeString = this.props.mkt + this.props.syjh + this.props.xph,//门店号+收银机号+小票号
                // console.log("timeout1000找零增值八达通小票:", octozzSalePrintData);
                setTimeout(() => {
                    window.Print(octozzSalePrintData, (data) => {
                        //printData, isACS, cashTotal, data, isSDYN, isPTFQ, octoZlzzNeedsPrint, octozzSalePrintData, octoZlzzOrgiRef
                        this.printAfter(octozzSalePrintData, isACS, cashTotal, data, isSDYN, isPTFQ, false, 1)
                    });
                }, 1000);
            return;
        }

        //各种平推热敏打印
        if (data && data.code == "0" && printData.head[0].printtype === "1" && !isACS && !isSDYN && !isPTFQ) {
            message("印單完成請取回收據");
            if (this.state.type !== "2") {
                let newPrintData = { ...printData }
                newPrintData.Module = "SalePrint";
                if (this.props.isDiningHall) {
                    newPrintData.Module = "MS_SalePrint";
                }
                newPrintData.head[0].printtype = "0";
                console.log("热敏打印")
                console.log(printData)
                window.Print(newPrintData, (data) => {
                    this.printAfter(newPrintData, isACS, cashTotal, data, isSDYN, isPTFQ, octoZlzzNeedsPrint, octozzSalePrintData, octoZlzzOrgiRef, oldFphm)
                });
            } else if (printData.head[0].isflPrint && this.state.type == "2") {
                let sPrintData = { ...printData }
                sPrintData.Module = "SinglePrint";
                sPrintData.head[0].printtype = "0";
                console.log("热敏打印")
                window.Print(sPrintData, (data) => {
                    this.printAfter(sPrintData, isACS, cashTotal, data, isSDYN, null, null, null, null, oldFphm)
                });
            }
        } else if (data && data.code == "0" && printData.head[0].printtype === "1" && isACS && this.state.type !== "2") {
            this.setState({ isPrint: false });
            message("印單完成請取回收據")
            if (isSDYN && printData.Module !== "CJPrint") {
                setTimeout(() => {
                    let _this = this;
                    isSDYN = false;
                    let newPrintData = { ...printData }
                    newPrintData.Module = "CJPrint";
                    Modal.success({
                        className: 'vla-confirm',
                        title: '請放入AEON法定除舊服務記錄，然後按確定！',
                        okText: "確定",
                        content: '',
                        onOk() {
                            _this.setState({ isPrint: true }, () => {
                                window.Print(newPrintData, (data) => {
                                    _this.printAfter(newPrintData, isACS, cashTotal, data, isSDYN, isPTFQ, octoZlzzNeedsPrint, octozzSalePrintData, octoZlzzOrgiRef, oldFphm)
                                });
                            })
                        }
                    })
                }, 3000)
            } else {
                setTimeout(() => {
                    let _this = this;
                    isACS = false;
                    let newPrintData = { ...printData }
                    newPrintData.Module = "ACSMEMOPrint";
                    Modal.success({
                        className: 'vla-confirm',
                        title: '請放入SALES MEMO，然後按確定',
                        okText: "確定",
                        content: '',
                        onOk() {
                            _this.setState({ isPrint: true }, () => {
                                window.Print(newPrintData, (data) => {
                                    _this.printAfter(newPrintData, isACS, cashTotal, data, isSDYN, isPTFQ, octoZlzzNeedsPrint, octozzSalePrintData, octoZlzzOrgiRef, oldFphm)
                                });
                                console.log("SALES MEMO打印")
                            })
                        }
                    })
                }, 3000)
            }
        } else if (data && data.code == "0" && printData.head[0].printtype === "1" && isACS && this.state.type == "2") {
            message("印單完成請取回收據");
            if (printData.head[0].isflPrint) {
                let newPrintData = { ...printData }
                newPrintData.Module = "SinglePrint";
                newPrintData.head[0].printtype = "0";
                console.log("热敏打印")
                window.Print(newPrintData, (data) => {
                    this.printAfter(newPrintData, isACS, cashTotal, data, isSDYN, isPTFQ, octoZlzzNeedsPrint, octozzSalePrintData, octoZlzzOrgiRef, oldFphm)
                });
            }
        } else if (data && data.code == "0" && printData.head[0].printtype === "1" && isSDYN && this.props.expressNumber) {
            this.setState({ isPrint: false });
            message("印單完成請取回收據")
            if (isACS) {
                setTimeout(() => {
                    let _this = this;
                    isACS = false;
                    let newPrintData = { ...printData }
                    newPrintData.Module = "ACSFQPrint";
                    Modal.success({
                        className: 'vla-confirm',
                        title: '請放入AEON信貸財務分期批核表，然後按確定',
                        okText: "確定",
                        content: '',
                        onOk() {
                            _this.setState({ isPrint: true }, () => {
                                window.Print(newPrintData, (data) => {
                                    _this.printAfter(newPrintData, isACS, cashTotal, data, isSDYN, isPTFQ, octoZlzzNeedsPrint, octozzSalePrintData, octoZlzzOrgiRef, oldFphm)
                                });
                            })
                        }
                    })
                }, 3000)
            } else {
                setTimeout(() => {
                    let _this = this;
                    isSDYN = false;
                    let newPrintData = { ...printData }
                    if (newPrintData.head[0].isdc === "Y") {
                        newPrintData.Module = "DCPrint";
                    } else if (newPrintData.head[0].ishs === "Y") {
                        newPrintData.Module = "DeliveryPrint";
                    } else if (this.props.isDj) {
                        newPrintData.Module = "PressPrint";
                    }
                    Modal.success({
                        className: 'vla-confirm',
                        title: '請放入SALES MEMO，然後按確定',
                        okText: "確定",
                        content: '',
                        onOk() {
                            _this.setState({ isPrint: true }, () => {
                                window.Print(newPrintData, (data) => {
                                    _this.printAfter(newPrintData, isACS, cashTotal, data, isSDYN, isPTFQ, octoZlzzNeedsPrint, octozzSalePrintData, octoZlzzOrgiRef, oldFphm)
                                });
                                console.log("SALES MEMO打印")
                            })
                        }
                    })
                }, 3000)
            }
        } else if (isPTFQ) {
            this.setState({ isPrint: false });
            setTimeout(() => {
                let _this = this;
                isPTFQ = false;
                let newPrintData = { ...printData }
                newPrintData.Module = "FQPrint";
                Modal.success({
                    className: 'vla-confirm',
                    title: '請放入SALES MEMO，然後按確定',
                    okText: "確定",
                    content: '',
                    onOk() {
                        _this.setState({ isPrint: true }, () => {
                            window.Print(newPrintData, (data) => {
                                _this.printAfter(newPrintData, isACS, cashTotal, data, isSDYN, isPTFQ, octoZlzzNeedsPrint, octozzSalePrintData, octoZlzzOrgiRef, oldFphm)
                            });
                            console.log("普通分期打印")
                        })
                    }
                })
            }, 3000)
        }
    }

    //美食广场
    generateStallInfo = (goods) => {//
        let stallArr = [], stallInfo = [], newGoods = [], noExist = [];
        goods.forEach(item => item.stallCode ? stallArr.push(item.stallCode) : noExist.push(item)); //code数据目前有问题,所以这样写
        stallArr = new Set(stallArr); //去除重复code
        stallArr = Array.from(stallArr);
        stallArr.forEach(code => {
            let info = {}, goodsList, stall, backPrintNo;
            stall = this.props.stallhotkeytemplate.stallGoods.find(item => item.stallCode === code);
            backPrintNo = goods.find(item => item.stallCode === code).backPrintNo
            info.stallName = stall ? stall.stallName : '';
            info.mealsNum = !!backPrintNo ? backPrintNo : '';
            info.goods = [];

            goodsList = goods.filter(item => item.stallCode === code);//找到对应的档口下的商品信息
            goodsList.forEach(item => {
                info.goods.push({
                    name: item.fname,
                    qty: item.qty,
                    detail: item.categoryPropertys,
                    eatWay: item.eatWay
                });
                newGoods.push(item);//根据档口信息对商品行重新排序
            });
            stallInfo.push(info);
        });
        newGoods = [...newGoods, ...noExist]; //后续需要调整
        return { stallInfo, newGoods };
    }

    //过滤券信息
    filterGoodsStock = (data) => {
        let oldData = [];
        let oldsData = this.deepCopy(data);
        for (let key in oldsData) {
            oldData.push(oldsData[key]);
        }
        oldData = oldData.filter(item => item.goodsType !== "99" && item.goodsType !== "98");//过滤券商品
        return oldData;
    }

    //美食尾单打印
    tailPrint = (goodsList, saleDate, isCancel) => {
        let _a = saleDate.split(" ");
        let JyTime = _a[0].split("-")[2] + "/" + _a[0].split("-")[1] + "/" + _a[0].split("-")[0] + " " + _a[1];
        let obj = {
            refno: this.props.syjh + this.props.fphm,  //ref值
            rqsj: JyTime,//交易时间
            printtype: '0',
            stallInfo: this.props.isDiningHall ? this.changeGoods(goodsList).stallInfo : [],
            isCancel: null,
        }
        if (isCancel) {
            obj.isCancel = 'Y'
        }
        let salePrintData = {
            Module: 'MS_WD',
            head: [obj],
        };
        return salePrintData
    }

    //美食处理商品行
    changeGoods = (data) => {
        let oldData = [];
        let oldsData = this.deepCopy(data);
        for (let key in oldsData) {
            oldData.push(oldsData[key]);
        }
        oldData = oldData.filter(item => item.goodsType !== "99" && item.goodsType !== "98");//过滤券商品
        oldData.map((item, indexs) => {
            // items.categoryPropertys.map((item, index)=>{
            //     if(index == 0 && item && !item.isGoods){
            //         items.fname += "|" + item.propertyName
            //     }else if(item && index !== 0 && !item.isGoods && !items.categoryPropertys[index-1].isGoods){
            //         items.fname += "|" + item.propertyName
            //     }else if(item && index !== 0 && !item.isGoods && items.categoryPropertys[index-1].isGoods){
            //         items.categoryPropertys[index-1].propertyName +="|" + item.propertyName
            //     }
            // })
            let categoryPropertys = [], spliceData = '';
            item.categoryPropertys.forEach(data => { //合并商品属性
                if (!data.isGoods && !categoryPropertys.length && !spliceData) { //判断是否是主商品属性
                    item.fname = item.fname + '|' + data.propertyName;
                } else {
                    if (data.isGoods) {//判断是否是属性
                        if (spliceData) {
                            categoryPropertys.push(spliceData);
                            spliceData = '';
                        }
                        spliceData = data;
                    } else {
                        spliceData.propertyName = spliceData.propertyName + '|' + data.propertyName;
                    }
                }
            });
            spliceData && categoryPropertys.push(spliceData); //上一行方法漏洞修复
            item.categoryPropertys = categoryPropertys;
        })
        return this.generateStallInfo(oldData);
    }

    //销售打印
    submitPrint = (hykh, isyellowPrint, ArtcodeMoney, ArtcodeMoneyTotal, DirectMoney, hjzsl, bankTotal, notBankTotal, isTailTotal, isnotTailTotal, isYhrq, goods, pay, cashTotal, isSDYN, printObj, octoZlzzNeedsPrint, isACS, isPTFQ, isPress, isSCB, isMahatan, octozzSalePrintData, octoZlzzOrgiRef, oldFphm) => {
        pay.forEach(item => {
            if (!item.octopusCardno && item.octopusLastAddValType) {
                item.misMerchantId = item.octopusLastAddValType;
            }
        })
        if (this.state.octoDjlb == "Y3") {//八达通增值小票
            let _a = this.state.octopusTransDate.split(" ");
            let octoJyTime = _a[0].split("-")[2] + "/" + _a[0].split("-")[1] + "/" + _a[0].split("-")[0] + " " + _a[1];
            //八达通增值调用handleEjoural
            this.handleEjoural({
                octopusDeviceId: !!this.state.octopusDeviceId ? this.state.octopusDeviceId.toUpperCase() : "",    //八达通设备号
                octopusCardno: this.state.octopusCardno,    //八达通卡号
                octopusRechargeTotal: "" + Number(this.props.zdyftotal).toFixed(2), //充值金额
                octopusBalance: "" + Number(this.state.octopusBalance).toFixed(2),  //八达通余额
                octopusIsSmart: this.state.octopusIsSmart,          //是否八达通智能卡
                octopusLastAddValDate: this.state.octopusLastAddValDate,    //最近一次增值日期
                octopusLastAddValType: this.props.switchEng === true ? this.state.octopusLastAddValTypeEn : this.state.octopusLastAddValType,    //最近一次增值类型
                octopusTransDate: this.state.octopusTransDate, //八达通交易时间
                sjfk: this.state.yftotal,//实际付款
                ysje: this.props.zdyftotal,//应收金额
                zl: this.state.change,//找零金额
            }, 5);
            let octozzPrintData = {
                Module: 'OctopusPrint',
                head: [{
                    refno: this.props.syjh + oldFphm, //ref值
                    syyh: this.props.operators,//收银员
                    syjh: this.props.syjh,//收银机号
                    hykh: hykh,//会员号
                    mkt: this.props.mkt,//门店号
                    djlb: "Y3",//单据类别1代表销售，4代表退货
                    printtype: "0", //0代表热敏打印，1代表平推
                    rqsj: octoJyTime,//交易时间
                    sjfk: this.state.yftotal,//实际付款
                    ysje: this.props.zdyftotal,//应收金额
                    subTotal: this.props.zdsjtotal, //全单金额
                    printnum: 0,//重打次数
                    printtime: this.props.syspara.salebillnum || 1,//打印次数
                    shopname: this.props.syspara.shopname,//商场名称
                    shopEnName: this.props.mktinfo.shopEnName,
                    zl: this.state.change,//找零金额
                    barcodeString: this.props.mkt + this.props.syjh + this.props.xph.substring(0, 9) + oldFphm,//门店号+收银机号+小票号
                    isyellowPrint: isyellowPrint, //是否打印黄色小票
                    ArtcodeMoney: ArtcodeMoney, //黄色小票非直营金额
                    DirectMoney: DirectMoney, //黄色小票直营金额
                    switchEng: this.props.switchEng,  //是否打印英文小票
                    octopusDeviceId: !!this.state.octopusDeviceId ? this.state.octopusDeviceId.toUpperCase() : "",    //八达通设备号
                    octopusCardno: this.state.octopusCardno,    //八达通卡号
                    octopusRechargeTotal: "" + Number(this.props.zdyftotal).toFixed(2), //充值金额
                    octopusBalance: "" + Number(this.state.octopusBalance).toFixed(2),  //八达通余额
                    octopusLastAddValDate: this.state.octopusLastAddValDate,    //最近一次增值日期
                    octopusLastAddValType: this.props.switchEng === true ? this.state.octopusLastAddValTypeEn : this.state.octopusLastAddValType,    //最近一次增值类型
                    // octopusLastAddValTypeEn: this.state.octopusLastAddValTypeEn,    //最近一次增值类型(english)
                    octopusIsSmart: this.state.octopusIsSmart,
                    octopusTransactionTime: this.state.octopusTransDate,
                    address: this.props.mktinfo.address,  //门店地址
                    enAddress: this.props.mktinfo.enAddress,
                    mktname: this.props.mktinfo.mktname,//门店号名称
                    phone: this.props.mktinfo.telephone,//门店号名称
                    mdjc: this.props.mktinfo.shopSName,
                    refundAuthzCardNo: this.props.refundAuthzCardNo, //退货授权卡号
                    terminalOperatorAuthzCardNo: this.props.terminalOperatorAuthzCardNo,//员工授权卡号
                    totalDiscAuthzCardNo: this.props.totalDiscAuthzCardNo,//总折扣授权卡号
                    cardNo: this.props.creditCardNo,
                    staffcard: this.props.cardNo,   //员工购物
                    staffcardYGGH: this.props.staffNo,  //是员工工号
                    staffcardType: this.props.cardType,  //1为员工购物  2为亲属购物
                    eleStamp: this.props.eleStamp, //电子印花券
                    online: this.props.saveStatus === "1" ? 0 : "1",
                    hjzsl,//合计商品数
                    bankTotal,
                    notBankTotal,
                    isTailTotal,
                    isnotTailTotal,
                    isYhrq,
                    sticker: this.props.sticker, //印花券
                    memberInfo: this.props.memberInfo,
                }],
                goods,
                pay
            };
            // console.log("八达通增值小票:", octozzPrintData);
            this.setState({ isPrint: true }, () => {
                window.Print(octozzPrintData, () => {
                    let a = window.SyncCASHIER({
                        cash: cashTotal,
                        dealNumbers: 1,
                        mediaTotal: this.props.zdyftotal,
                        // na: this.props.zdyftotal,        //八达通增值时传递，不进行NA累加
                    })
                    //更新收银机状态
                    this.updateSyjstate(a.dealNumbers, a.cash, a.mediaTotal, oldFphm).then((status) => {
                        this.props.init();
                        // this.props.update();
                        let promptNum = this.props.interval || 0;
                        let info = {
                            title: intl.get("LOCK_TIP"),
                            okText: intl.get("INFO_CONFIRMA"),
                            content: intl.get("INFO_CASHEXCESS"),
                        };
                        if (status === '0') {
                            Modal.info(info);
                            this.setState({ isPrint: false });
                            this.props.router.push("/home");
                            return;
                        } else if (status === '8' && promptNum < 2) { //状态为8为现金溢出
                            if (promptNum === 0) {//第一次提示
                                Modal.info(info);
                                this.props.cashierWarn(1);
                            } else if (promptNum === 1) {//第二次提示（超出峰值允许交易）
                                let record = window["SyncCASHIER"]({
                                    cash: 0,
                                    dealNumbers: 0
                                });
                                let { cashsale, maxxj } = this.props.syspara;
                                let tranSales = cashsale.split(',');
                                if (parseFloat(record.cash) > parseFloat(tranSales[1])) {
                                    Modal.info(info);
                                    this.props.cashierWarn(2);
                                }
                            }
                        }
                        this.setState({ isPrint: false });
                        this.props.router.goBack();
                    })
                });
            })
        } else if (isSCB === true || isMahatan === true) {//渣打||曼哈顿平推打印
            console.log("渣打||曼哈顿平推打印")
            let smheadObj = { ...printObj };
            smheadObj.recycleSer = this.props.recycleSer;
            smheadObj.recycleSerInfo = this.props.recycleSerInfo;
            smheadObj.expressNumber = this.props.expressNumber;
            smheadObj.esystemStatus = this.props.esystemStatus;
            if (this.props.isDc) {
                smheadObj.isdc = "Y";
            }
            if (this.props.isHs) {
                smheadObj.ishs = "Y";
            }
            let FQPrintData = {
                Module: 'FQPrint',
                head: [smheadObj],
                goods,
                pay
            };
            let _this = this;
            Modal.success({
                className: 'vla-confirm',
                title: '請放入SALES MEMO，然後按確定',
                okText: "確定",
                content: '',
                onOk() {
                    _this.setState({ isPrint: true }, () => {
                        window.Print(FQPrintData, (data) => {
                            _this.printAfter(FQPrintData, isACS, cashTotal, data, isSDYN, false, null, null, null, oldFphm)
                        });
                    })
                }
            })
        } else if (isACS === true) {//AEON信貸財務分期批核表打印
            console.log("AEON信貸財務分期批核表打印")
            let ACSheadObj = { ...printObj }
            ACSheadObj.recycleSer = this.props.recycleSer
            ACSheadObj.recycleSerInfo = this.props.recycleSerInfo
            ACSheadObj.expressNumber = this.props.expressNumber;
            ACSheadObj.esystemStatus = this.props.esystemStatus;
            ACSheadObj.dcData = this.sliceDcDate(this.props.dcData);
            if (this.props.isDc) {
                ACSheadObj.isdc = "Y";
            }
            if (this.props.isHs) {
                ACSheadObj.ishs = "Y";
            }
            let ACSFQPrintData = {
                Module: 'ACSFQPrint',
                head: [ACSheadObj],
                goods,
                pay
            };
            let _this = this;
            Modal.success({
                className: 'vla-confirm',
                title: '請放入AEON信貸財務分期批核表，然後按確定',
                okText: "確定",
                content: '',
                onOk() {
                    _this.setState({ isPrint: true }, () => {
                        window.Print(ACSFQPrintData, (data) => {
                            _this.printAfter(ACSFQPrintData, isACS, cashTotal, data, isSDYN, null, null, null, null, oldFphm)
                        });
                    })
                }
            })
        } else if (isSDYN === true && (this.props.isDc || this.props.isHs || this.props.isDj)) {//四点一脑除旧打印加送货单
            console.log("四点一脑除旧打印")
            let sdynheadObj = { ...printObj };
            sdynheadObj.recycleSer = this.props.recycleSer
            sdynheadObj.recycleSerInfo = this.props.recycleSerInfo
            sdynheadObj.expressNumber = this.props.expressNumber
            sdynheadObj.esystemStatus = this.props.esystemStatus
            sdynheadObj.dcData = this.sliceDcDate(this.props.dcData)
            if (this.props.isDc) {
                sdynheadObj.isdc = 'Y'
            }
            if (this.props.isHs) {
                sdynheadObj.ishs = 'Y'
            }
            let CJPrintData = {
                Module: 'CJPrint',
                head: [sdynheadObj],
                goods,
                pay
            };
            let _this = this;
            Modal.success({
                className: 'vla-confirm',
                title: '請放入AEON法定除舊服務記錄，然後按確定！',
                okText: "確定",
                content: '',
                onOk() {
                    _this.setState({ isPrint: true }, () => {
                        window.Print(CJPrintData, (data) => {
                            _this.printAfter(CJPrintData, isACS, cashTotal, data, isSDYN, isPTFQ, null, null, null, oldFphm)
                        });
                    })
                }
            })
        } else if (isSDYN === true && !this.props.isDc && !this.props.isHs && !this.props.isDj) {//四点一脑除旧打印
            console.log("四点一脑除旧无送货单打印")
            let issdynheadObj = { ...printObj };
            issdynheadObj.recycleSer = this.props.recycleSer
            issdynheadObj.recycleSerInfo = this.props.recycleSerInfo
            issdynheadObj.expressNumber = this.props.expressNumber
            issdynheadObj.esystemStatus = this.props.esystemStatus
            issdynheadObj.dcData = this.sliceDcDate(this.props.dcData)
            let CJPrintData = {
                Module: 'CJPrint',
                head: [issdynheadObj],
                goods,
                pay
            };
            let _this = this;
            Modal.success({
                className: 'vla-confirm',
                title: '請放入AEON法定除舊服務記錄，然後按確定！',
                okText: "確定",
                content: '',
                onOk() {
                    _this.setState({ isPrint: true }, () => {
                        window.Print(CJPrintData, (data) => {
                            _this.printAfter(CJPrintData, isACS, cashTotal, data, false, isPTFQ, null, null, null, oldFphm)
                        });
                    })
                }
            })
        } else if (this.props.isDc && this.props.expressNumber && !isSDYN) {//DC送货打印
            console.log("DC送货打印");
            let _code = "", _commandId = "SEARCHSTOCKS";
            for (let i = 0; i < goods.length; i++) {
                i == goods.length - 1 ? _code += goods[i].goodsno : _code += (goods[i].goodsno + ",");
            }
            let req = {
                command_id: _commandId,
                mkt: this.props.dcData.reserveLocation,
                code: _code,
                ent_id: this.props.entid,
                jygs: this.props.jygs,
                operators: this.props.operators
            };
            Fetch(
                {
                    url: Url.base_url,
                    type: "POST",
                    data: req
                }
            ).then(res => {
                console.log(res)
                if (res.retflag != "0") {
                    // console.error('[' + _commandId + '] Failed:', res.retmsg);
                } else {
                    for (let i = 0; i < goods.length; i++) {
                        for (let j = 0; j < res.shopstocklist.length; j++) {
                            if (goods[i].goodsno === res.shopstocklist[j].goodsCode) {
                                goods[i].saleStock = res.shopstocklist[j].salestock;
                            }
                        }
                        goods[i].saleStock = goods[i].saleStock || 0; //服务查询不到默认填零
                    }
                }
                let DCPrintHead = { ...printObj };
                DCPrintHead.isdc = "Y";
                DCPrintHead.dcData = this.sliceDcDate(this.props.dcData);
                DCPrintHead.expressNumber = this.props.expressNumber;
                let DCPrintData = {
                    Module: 'DCPrint',
                    head: [DCPrintHead],
                    goods,
                    pay
                }
                if (octoZlzzNeedsPrint === true) {
                    //八达通找零增值调用handleEjoural
                    // 找零到八达通小票，延迟到update()后打印
                    octozzSalePrintData = this.deepCopy(DCPrintData);
                    let _a = this.state.octopusTransDate.split(" ");
                    let octoJyTime = _a[0].split("-")[2] + "/" + _a[0].split("-")[1] + "/" + _a[0].split("-")[0] + " " + _a[1];
                    octozzSalePrintData.head[0].rqsj = octoJyTime;
                    octozzSalePrintData.disCheck = true;
                }
                let _this = this;
                Modal.success({
                    className: 'vla-confirm',
                    title: '請放入送貨單，然後按確定！',
                    okText: "確定",
                    content: '',
                    onOk() {
                        _this.setState({ isPrint: true }, () => {
                            setTimeout(() => {
                                window.Print(DCPrintData, (data) => {
                                    _this.printAfter(DCPrintData, isACS, cashTotal, data, undefined, isPTFQ, octoZlzzNeedsPrint, octozzSalePrintData, octoZlzzOrgiRef, oldFphm)
                                });
                            }, 1000);
                        })
                    }
                });
            }).catch((error) => {
                console.error('[' + _commandId + '] Error:', error);
            });
        } else if (this.props.isHs && this.props.expressNumber && !isSDYN) {//行送打印
            console.log("行送打印")
            let DeliveryHead = { ...printObj }
            DeliveryHead.ishs = "Y";
            DeliveryHead.dcData = this.sliceDcDate(this.props.dcData);
            DeliveryHead.expressNumber = this.props.expressNumber;
            let DeliveryPrintData = {
                Module: 'DeliveryPrint',
                head: [DeliveryHead],
                goods,
                pay
            }
            if (octoZlzzNeedsPrint === true) {
                //八达通找零增值调用handleEjoural
                // 找零到八达通小票，延迟到update()后打印
                octozzSalePrintData = this.deepCopy(DeliveryPrintData);
                let _a = this.state.octopusTransDate.split(" ");
                let octoJyTime = _a[0].split("-")[2] + "/" + _a[0].split("-")[1] + "/" + _a[0].split("-")[0] + " " + _a[1];
                octozzSalePrintData.head[0].rqsj = octoJyTime;
                octozzSalePrintData.disCheck = true;
            }
            let _this = this;
            Modal.success({
                className: 'vla-confirm',
                title: '請放入送貨單，然後按確定！',
                okText: "確定",
                content: '',
                onOk() {
                    _this.setState({ isPrint: true }, () => {
                        setTimeout(() => {
                            window.Print(DeliveryPrintData, (data) => {
                                _this.printAfter(DeliveryPrintData, isACS, cashTotal, data, isSDYN, isPTFQ, octoZlzzNeedsPrint, octozzSalePrintData, octoZlzzOrgiRef, oldFphm)
                            });
                        }, 1000);
                    })
                }
            })
        } else if (isPress === true || (this.props.isDj && this.props.expressNumber && !isSDYN)) {//按金打印
            console.log("按金打印")
            let pressheadObj = { ...printObj };
            pressheadObj.recycleSer = this.props.recycleSer
            pressheadObj.recycleSerInfo = this.props.recycleSerInfo
            pressheadObj.expressNumber = this.props.expressNumber
            let AJPrintData = {
                Module: 'PressPrint',
                head: [pressheadObj],
                goods,
                pay
            };
            if (octoZlzzNeedsPrint === true) {
                //八达通找零增值调用handleEjoural
                // 找零到八达通小票，延迟到update()后打印
                octozzSalePrintData = this.deepCopy(AJPrintData);
                let _a = this.state.octopusTransDate.split(" ");
                let octoJyTime = _a[0].split("-")[2] + "/" + _a[0].split("-")[1] + "/" + _a[0].split("-")[0] + " " + _a[1];
                octozzSalePrintData.head[0].rqsj = octoJyTime;
                octozzSalePrintData.disCheck = true;
            }
            let _this = this;
            Modal.success({
                className: 'vla-confirm',
                title: '請放入按金單，然後按確定！',
                okText: "確定",
                content: '',
                onOk() {
                    _this.setState({ isPrint: true }, () => {
                        setTimeout(() => {
                            window.Print(AJPrintData, (data) => {
                                _this.printAfter(AJPrintData, isACS, cashTotal, data, isSDYN, isPTFQ, octoZlzzNeedsPrint, octozzSalePrintData, octoZlzzOrgiRef, oldFphm)
                            });
                        }, 1000);
                    });
                }
            })
        } else {
            let saleheadObj = { ...printObj };//普通销售小票热敏打印
            saleheadObj.printtype = "0"
            let salePrintData = {
                Module: 'SalePrint',
                head: [saleheadObj],
                goods,
                pay
            };
            if (this.props.isDiningHall) {
                salePrintData.Module = "MS_SalePrint";
            }
            let _this = this;
            if (octoZlzzNeedsPrint === true) {
                //八达通找零增值调用handleEjoural
                // this.handleEjoural({
                //     octopusDeviceId: !!this.state.octopusDeviceId ? this.state.octopusDeviceId.toUpperCase() : "",    //八达通设备号
                //     octopusCardno: this.state.octopusCardno,    //八达通卡号
                //     octopusRechargeTotal: "" + Number(this.props.zdyftotal).toFixed(2), //充值金额
                //     octopusBalance: "" + Number(this.state.octopusBalance).toFixed(2),  //八达通余额
                //     octopusIsSmart: this.state.octopusIsSmart,          //是否八达通智能卡
                //     octopusLastAddValDate: this.state.octopusLastAddValDate,    //最近一次增值日期
                //     octopusLastAddValType: this.props.switchEng === true ? this.state.octopusLastAddValTypeEn : this.state.octopusLastAddValType,    //最近一次增值类型
                //     octopusTransDate: this.state.octopusTransDate, //八达通交易时间
                //     sjfk: this.state.yftotal,//实际付款
                //     ysje: this.props.zdyftotal,//应收金额
                //     zl: this.state.change,//找零金额
                // }, 5);
                // 找零到八达通小票，延迟到update()后打印
                octozzSalePrintData = this.deepCopy(salePrintData);
                let _a = this.state.octopusTransDate.split(" ");
                let octoJyTime = _a[0].split("-")[2] + "/" + _a[0].split("-")[1] + "/" + _a[0].split("-")[0] + " " + _a[1];
                octozzSalePrintData.head[0].rqsj = octoJyTime;
                octozzSalePrintData.disCheck = true;
            }
            if ('N' === this.props.syjmain.isprint)
                this.printAfter(salePrintData, isACS, cashTotal, "", isSDYN, isPTFQ, octoZlzzNeedsPrint, octozzSalePrintData, octoZlzzOrgiRef, oldFphm)
            else {
                this.setState({ isPrint: true }, () => {
                    window.Print(salePrintData, (data) => {
                        _this.printAfter(salePrintData, isACS, cashTotal, data, isSDYN, isPTFQ, octoZlzzNeedsPrint, octozzSalePrintData, octoZlzzOrgiRef, oldFphm)
                    });
                })
            }
        }
    }

    //完成付款
    finalSubmit = () => {
        console.log("InvoiceService finalSubmit: ", this.state.octozzfkDone, this.state.octozzDone, this.props, this.state);
        let that = this;
        if (!!this.state.query && !!this.state.query && !!this.state.query.djlb && this.state.query.djlb === 'Y3') {
            if (this.state.octozzfkDone === false || this.state.octozzDone === false) {
                return false;
            }
        }
        let dcData = JSON.stringify(this.props.dcData);
        let isyellowPrint = 'N', ArtcodeMoney = [], ArtcodeMoneyTotal = 0, DirectMoney = 0, isflPrint = false, payACS,
            paySCB, payMahatan,
            payWZF, payJFXF, payJFHG,
            goods = [], pay = [], isSDYN = false, isACS = false, isPTFQ = false, hjzsl = 0, isPress = false,
            flPrinttime = 0,
            isSCB = false, isMahatan = false, isTailTotal = 0.00, isnotTailTotal = 0.00, bankTotal = 0.00,
            notBankTotal = 0.00, cashTotal = 0.00, isYhrq = 'N', oldFphm = '';
        //  黄色小票，黄色小票非直营金额，黄色小票直营金额, 副单打印,商品行,付款行,四电一脑打印 ,ACS付款打印, 商品件数, 按金支付
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
            } else if (str[0] == "payJFHG") {
                payJFHG = str[1];
                return;
            } else if (str[0] == "payWZF") {
                for (let n = 1; n < str.length; n++) {
                    payWZF += (n < str.length - 1 ? (str[n] + ",") : str[n]);
                }
                return;
            }
        })
        this.props.goodsList.map((item, index) => {
            let obj = { ...item };
            obj.idnum = index + 1;
            obj.disc = obj.disc + "%"
            goods.push(obj);
            if (item.prtDuplFlag === true) {
                isflPrint = true;
                flPrinttime += 1;
            }
            if (item.controlFlag) {
                isSDYN = true;
            } else {
                hjzsl += item.qty;
            }
            if (item.license == 0) {
                DirectMoney += parseFloat(item.ysje)
            } else if (item.license == 1) {
                let obj = {};
                let hasArtcode = false
                obj.artcode = item.category;
                obj.total = item.ysje;
                ArtcodeMoney.map((item, index) => {
                    if (item.artcode === obj.artcode) {
                        hasArtcode = true;
                        ArtcodeMoney[index].total = parseFloat(obj.total) + parseFloat(ArtcodeMoney[index].total)
                    }
                })
                if (!hasArtcode) {
                    ArtcodeMoney.push(obj);
                }
                ArtcodeMoneyTotal += parseFloat(item.ysje)
            }
        })
        DirectMoney = DirectMoney.toFixed(2)
        ArtcodeMoneyTotal = ArtcodeMoneyTotal.toFixed(2)
        let _payList = this.state.payList.map((item) => {
            let obj = { ...item };
            if (item.flag !== "2" && item.flag != "3") {
                let mode = this.props.payModeInfo.find((mode) => mode.code === item.paycode);
                if (!mode) {
                    return 'false';
                }
                if (mode.virtualPayType == 0 && mode.code != "0602") {
                    let total = calculate.Subtr(obj.total, obj.overage)
                    cashTotal = cashTotal + Number(total)
                    notBankTotal = cashTotal;
                    console.log(cashTotal)
                } else if (mode.code != "0602") {
                    bankTotal += obj.total;
                }
            }
        })
        if (_payList.indexOf('false') > -1) {
            message('付款模板錯誤');
            return false;
        }
        let isCash = false;
        this.state.payList.map((item) => {
            let obj = { ...item };
            if (item.flag !== "2" && item.flag != "3" && item.paycode != this.props.syspara.wkzfPaycode) {
                let mode = this.props.payModeInfo.find((mode) => mode.code === item.paycode);
                if (item.paycode !== paySCB && item.paycode !== payMahatan) {
                    obj.payname = mode.cardPayType !== "null" ? item.payname : mode.paysimplecode;
                    obj.trace = mode.cardPayType !== "null" ? ("000000" + item.trace).substr(-6) : item.trace;
                    if (obj.trace === "000000") {
                        obj.trace = ""
                    }
                }
                if (mode.virtualPayType === 3) {
                    if (obj.printPayNo && mode.cardPayType !== "a") {
                        obj.payno = obj.printPayNo
                    }
                    if (obj.trace === "") {
                        obj.misMerchantId = "M"
                    }
                }
                if (mode.cardPayType === "a" || (mode.cardPayType === "5" && obj.trace === "")) {
                    obj.payno = obj.payno.slice(0, 6) + "******" + obj.payno.slice(12, obj.payno.length)
                    if (mode.cardPayType === "5" && obj.trace === "") {
                        obj.trace = obj.refCode
                    }
                }
                if (payWZF !== "") {
                    let wzfStr = payWZF.split(",");
                    for (let q = 0; q < wzfStr.length; q++) {
                        if (wzfStr[q] === item.paycode) {
                            obj.payname = item.payname;
                        }
                    }
                }
                if (mode.virtualPayType === 0) {
                    isCash = true
                } else {
                    pay.push(obj);
                }
            }
            if (item.paycode == payACS && this.state.type !== "2") {
                isACS = true;
            } else if (item.paycode == paySCB && this.state.type !== "2") {
                isSCB = true;
                isPTFQ = true;
            } else if (item.paycode == payMahatan && this.state.type !== "2") {
                isMahatan = true;
                isPTFQ = true;
            }
            if (item.paycode === this.props.syspara.wkzfPaycode) {
                isPress = true;
                isnotTailTotal = item.total.toFixed(2)
            }
            if (isnotTailTotal && !isTailTotal) {
                isTailTotal = (Number(this.props.zdyftotal) - Number(isnotTailTotal)).toFixed(2)
            }
        });
        //合并现金支付行
        if (isCash) {
            pay.push({ payname: 'CASH', ybje: Number(cashTotal).toFixed(2) });
        }
        if (this.state.type == "4" || this.state.type == "2" || this.state.type == "Y2") {
            let returnsubmitReq = {
                operators: this.props.operators,
                flow_no: this.props.flow_no,
                mkt: this.props.mkt,
                syjh: this.props.syjh,
                uidlist: this.props.goodsList.map(item => item.guid).join(","),
                puidlist: this.state.payList.map(item => item.puid).join(","),
            };
            if (this.state.returncode === "2002") {
                returnsubmitReq.newTerminalSno = this.state.retmsg
            }
            let cancelFinalFlag = this.props.type == "finalpayment" && this.state.query.djlb === '4';
            let method = cancelFinalFlag ? 'deusubmit' : (this.props.status ? "submit" : "returnsubmit");
            this.props[method](returnsubmitReq).then(res => {
                if (res) {
                    let retmsg = res.retmsg;
                    retmsg = Number(retmsg) + 1
                    if (res.retflag === "2002") {
                        this.props.update();
                        this.setState({
                            returncode: "2002",
                            retmsg: retmsg.toString()
                        }, () => {
                            this.finalSubmit();
                        })
                        return;
                    }
                    window.welcome();
                    let JyTime = "", goods = [], hjzsl = 0, hykh, sysTime;
                    if (res.consumersCard) {
                        hykh = res.consumersCard;
                    }
                    if (res.memberInfo) {
                        hykh = res.memberInfo.memberId;
                    }
                    let isOpenCashbox = false;

                    //取服务返回时间
                    sysTime = res.saleDate;
                    if (sysTime) {
                        let a = sysTime.split(" ");
                        JyTime = a[0].split("-")[2] + "/" + a[0].split("-")[1] + "/" + a[0].split("-")[0] + " " + a[1];
                    }
                    let cashTotal = 0, isCoupon = 'N', _this = this;
                    if (this.props.coupon_gain == false) {
                        isCoupon = 'N'
                    } else {
                        isCoupon = 'Y'
                    }

                    let newGoods = this.props.isDiningHall ? this.changeGoods(res.goodsList).newGoods : this.filterGoodsStock(res.goodsList);
                    newGoods.map((item, index) => {
                        let obj = { ...item };
                        if (item.controlFlag) {
                            isSDYN = true;
                        } else {
                            hjzsl += item.qty;
                        }
                        obj.idnum = index + 1;
                        obj.disc = obj.disc + "%"
                        goods.push(obj);
                    })
                    this.state.payList.map((item) => {
                        if (item.flag !== "2" && item.flag != 3) {
                            let mode = this.props.payModeInfo.find((mode) => mode.code === item.paycode);

                            if (mode.virtualPayType == 0) {//判断是现金
                                cashTotal -= item.total
                                if (this.state.change == "0.00") {
                                    isOpenCashbox = true
                                }
                            } else if (mode.virtualPayType == 1) {//判断是券
                                isOpenCashbox = true
                            }
                        } else if (item.flag == "2" && (this.state.changename == "现金找零" || this.state.changename == "現金找續")) {
                            cashTotal += item.total
                        }
                    });
                    if (isOpenCashbox) {
                        window.openCashbox();
                    }
                    if (this.props.dcData.date) {
                        let _code = "", _commandId = "SEARCHSTOCKS";
                        for (let i = 0; i < goods.length; i++) {
                            i == goods.length - 1 ? _code += goods[i].goodsno : _code += (goods[i].goodsno + ",");
                        }
                        let req = {
                            command_id: "SEARCHSTOCKS",
                            mkt: this.props.dcData.reserveLocation,
                            code: _code,
                            ent_id: this.props.entid,
                            jygs: this.props.jygs,
                            operators: this.props.operators
                        };
                        Fetch(
                            {
                                url: Url.base_url,
                                type: "POST",
                                data: req
                            }
                        ).then(res => {
                            console.log(res)
                            if (res.retflag != "0") {
                                console.error('[' + _commandId + '] Failed:', res.retmsg);
                            } else {
                                for (let i = 0; i < goods.length; i++) {
                                    for (let j = 0; j < res.shopstocklist.length; j++) {
                                        if (goods[i].goodsno === res.shopstocklist[j].goodsCode) {
                                            goods[i].saleStock = res.shopstocklist[j].salestock;
                                        }
                                    }
                                    goods[i].saleStock = goods[i].saleStock || 0; //服务查询不到默认填零
                                }
                            }
                        }).catch((error) => {
                            console.error('[' + _commandId + '] Error:', error);
                        });
                    }
                    let XDTHPrintHead = {
                        refno: this.props.syjh + this.props.xph.substr(this.props.xph.length - 4),
                        syyh: this.props.operators,//收银员
                        mkt: this.props.mkt,//门店号
                        syjh: this.props.syjh,//收银机号
                        fphm: this.props.xph.substr(this.props.xph.length - 4),//小票号
                        zl: this.state.change,//找零金额
                        djlb: "4",//单据类别1代表销售，4代表退货
                        printtype: "1", //0代表热敏打印，1代表平推
                        rqsj: JyTime,//交易时间
                        saleDate: res.saleDate,
                        goodsList: res.goodsList,
                        sjfk: this.state.yftotal,//实际付款
                        ysje: this.props.zdyftotal,//应收金额
                        subTotal: this.props.zdsjtotal, //全单金额
                        printnum: 0,//重打次数
                        printtime: this.props.syspara.salebillnum || 1,//打印次数
                        refundAuthzCardNo: this.props.refundAuthzCardNo, //退货授权卡号
                        terminalOperatorAuthzCardNo: this.props.terminalOperatorAuthzCardNo,//员工授权卡号
                        totalDiscAuthzCardNo: this.props.totalDiscAuthzCardNo,//总折扣授权卡号
                        shopname: this.props.syspara.shopname,//商场名称
                        shopEnName: this.props.mktinfo.shopEnName,
                        iscoupon_gain: isCoupon, //是否打印券
                        switchEng: this.props.switchEng,  //是否打印英文小票
                        coupon_gain: this.props.coupon_gain,//返券
                        returnResaon: this.props.cause,//退货原因
                        address: this.props.mktinfo.address,  //门店地址
                        enAddress: this.props.mktinfo.enAddress,
                        mktname: this.props.mktinfo.mktname,//门店号名称
                        phone: this.props.mktinfo.telephone,//门店号名称
                        mdjc: this.props.mktinfo.shopSName,
                        isfl: this.props.syjmain.issryyy,  //当值为Y时，复联打印
                        isflPrint: isflPrint, //值为true打印副单
                        flPrinttime: flPrinttime,
                        isFS: "Y", //识别数据为负数
                        stallInfo: this.props.isDiningHall ? this.changeGoods(res.goodsList).stallInfo : [],
                        bankTotal,
                        notBankTotal,
                        isTailTotal,
                        isnotTailTotal,
                        hjzsl,//合计商品数
                        dzyh: this.props.dzyh,
                        swyh: this.props.swyh,
                        ysyjNo: this.props.ysyjNo,
                        yxpNo: this.props.yxpNo,
                        ymdNo: this.props.ymdNo ? this.props.ymdNo.slice(0, 3) : this.props.ymdNo,
                        popInfo: this.props.popInfo, //整单折扣
                        expressNumber: this.props.expressNumber,
                        cardNo: this.props.creditCardNo,
                        staffcard: this.props.cardNo,   //员工购物
                        staffcardYGGH: this.props.staffNo,
                        staffcardType: this.props.staffType,
                        dcData: this.sliceDcDate(this.props.dcData),  //DC送货信息
                        hykh: hykh,
                        recycleSer: this.props.recycleSer,//四电一脑基础信息
                        recycleSerInfo: this.props.recycleSerInfo,//四电一脑详情
                        memberInfo: this.props.memberInfo,
                        printMode: res.printMode,
                        consumersType: this.props.consumersType,
                        online: this.props.saveStatus === "1" ? 0 : "1",
                        barcodeString: this.props.mkt + this.props.syjh + this.props.xph,//门店号+收银机号+小票号
                    };
                    if (!this.props.uploadData) this.props.setState({ uploadData: parseInt(this.props.saveStatus) });
                    if (this.state.type == "4") {
                        XDTHPrintHead.status = this.props.status
                    }
                    if (this.props.dcData.date && !this.props.smType || this.props.smType == 5) {
                        XDTHPrintHead.isdc = 'Y'
                    }
                    if (res.logisticsMode == 3 || this.props.smType == 3) {
                        XDTHPrintHead.ishs = 'Y'
                    }
                    if (!!this.state.payList && payWZF !== "") {
                        let pwzfStr = payWZF.split(",");
                        for (let m = 0; m < pwzfStr.length; m++) {
                            for (let i = 0; i < this.state.payList.length; i++) {
                                if (pwzfStr[m] === this.state.payList[i].paycode) {
                                    XDTHPrintHead.tradeno = "BARC#" + this.state.payList[i].refCode;
                                    XDTHPrintHead.ordered = "RRNO#" + this.state.payList[i].payno;
                                }
                            }
                        }
                    }
                    if (!!pay && (!!payJFXF || !!payJFHG)) {
                        let hykDeduct = 0, hykDeductTotal = 0;
                        for (let m = 0; m < pay.length; m++) {
                            if (pay[m].paycode === payJFXF || pay[m].paycode === payJFHG) {
                                XDTHPrintHead.hykh = pay[m].consumers_id;
                                hykDeduct += parseFloat(pay[m].ybje);
                                hykDeductTotal += parseFloat(pay[m].total);
                            }
                        }
                        if (hykDeduct && hykDeductTotal) {
                            XDTHPrintHead.hykDeduct = hykDeduct.toFixed(2);
                            XDTHPrintHead.hykDeductTotal = hykDeductTotal.toFixed(2);
                        }
                        XDTHPrintHead.isgh = 'Y';
                    }
                    let XDTHPrintData = {
                        Module: 'ReturnPrint',
                        head: [XDTHPrintHead],
                        goods,
                        pay
                    }
                    oldFphm = this.props.fphm;
                    this.setState({
                        oldFphm
                    }, () => { this.props.update(); });
                    let that = this;
                    if (cancelFinalFlag) {
                        let cancelFinalHead = Object.assign(XDTHPrintHead, {
                            printtype: "0", //0代表热敏打印，1代表平推
                            returnResaon: '7',//退货原因
                            isTailPrint: 'Y', // 尾单打印
                            switchEng: this.props.switchEng || false,//是否打印英文小票
                            ysyjNo: res.originTerminalNo, //原收银机号
                            yxpNo: res.originTerminalSno,//原小票号
                            ymdNo: res.originShopCode  //原门店号
                        })
                        let cancelFinalPrintData = {
                            Module: 'SalePrint',
                            head: [cancelFinalHead],
                            pay
                        }
                        this.setState({ isPrint: true }, () => {
                            window.Print(cancelFinalPrintData, data => {
                                if (!!data) {
                                    that.printAfter(cancelFinalPrintData, false, cashTotal, data, false, null, null, null, null, oldFphm);
                                    that.setState({ isPrint: false })
                                }
                            });
                        })
                    } else {
                        if (this.state.type == "4" || this.state.type == "Y2" || (this.state.type == "2" && this.props.syspara.isHcPrintBill == "Y")) {
                            if (this.state.type == "2") {
                                XDTHPrintData.Module = this.props.isDiningHall ? "MS_XD" : "VoidPrint";
                            }
                            const getStallConfig = (goodsList) => {
                                let stallCodeList = []
                                goodsList.forEach(item => {
                                    stallCodeList.push(item.stallCode)
                                })
                                let req = {
                                    operators: this.props.operators,
                                    flow_no: this.props.flow_no,
                                    mkt: this.props.mkt,
                                    syjh: this.props.syjh,
                                    shopCode: this.props.mkt,
                                    stallCode: stallCodeList.join(',')
                                }
                                return this.props.getBackPrintConfig(req)
                            }
                            Modal.success({
                                className: 'vla-confirm',
                                title: this.state.type == "2" ? '請放入消單紙，然後按確定！' : '請放入退貨單，然後按確定！',
                                okText: "確定",
                                content: '',
                                onOk() {
                                    if ('N' === that.props.syjmain.isprint) {
                                        let flag = XDTHPrintData.goods.find(v => v.backPrintNo)
                                        if (!!flag) {
                                            getStallConfig(XDTHPrintData.goods).then(res => {
                                                if (res) {
                                                    let backPrintStallInfo = res.stallinfo;
                                                    let goodsList = XDTHPrintData.head[0].goodsList.filter(v => v.processFlag == 1)
                                                    let groupByGoodsList = that.groupBy(goodsList, item => {
                                                        return [item.stallCode]
                                                    })
                                                    //常购商品剔除
                                                    let list = groupByGoodsList.filter(v => v[0].stallCode !== '');
                                                    let callback = () => {
                                                        that.printAfter(XDTHPrintData, false, cashTotal, "", false, null, null, null, null, oldFphm)
                                                    }
                                                    that.handleXDPrintFunc(list, that.props.xph.substring(6), XDTHPrintData.head[0].saleDate, callback, backPrintStallInfo)
                                                }
                                            })
                                        } else {
                                            that.printAfter(XDTHPrintData, false, cashTotal, "", false, null, null, null, null, oldFphm)
                                        }
                                    } else {
                                        that.setState({ isPrint: true }, () => {
                                            window.Print(XDTHPrintData, (data) => {
                                                if (that.props.isDiningHall && !that.props.breadFlag) {
                                                    getStallConfig(XDTHPrintData.goods).then(res => {
                                                        if (res) {
                                                            let backPrintStallInfo = res.stallinfo;
                                                            let goodsList = XDTHPrintData.head[0].goodsList.filter(v => v.processFlag == 1)
                                                            let groupByGoodsList = that.groupBy(goodsList, item => {
                                                                return [item.stallCode]
                                                            })
                                                            //常购商品剔除
                                                            let list = groupByGoodsList.filter(v => v[0].stallCode !== '');
                                                            let callback = () => {
                                                                that.printAfter(XDTHPrintData, false, cashTotal, data, false, null, null, null, null, oldFphm)
                                                            }
                                                            that.handleXDPrintFunc(list, that.props.xph.substring(6), XDTHPrintData.head[0].saleDate, callback, backPrintStallInfo)

                                                        }
                                                    })
                                                } else {
                                                    that.printAfter(XDTHPrintData, false, cashTotal, data, false, null, null, null, null, oldFphm)
                                                }
                                            });
                                        })
                                    }
                                }
                            })
                        }
                    }
                }
            });
        } else if (this.state.type == "Y6" && this.state.query.djlb !== '4') {
            let params = {
                operators: this.props.operators,
                flow_no: this.props.flow_no,
                mkt: this.props.mkt,
                syjh: this.props.syjh,
                puidlist: this.state.payList.map(item => item.puid).join(",")
            };
            if (this.state.returncode === "2002") {
                params.newTerminalSno = this.state.retmsg
            }
            this.props.deusubmit(params).then(res => {
                if (res) {
                    let retmsg = res.retmsg;
                    retmsg = Number(retmsg) + 1
                    if (res.retflag === "2002") {
                        this.props.update();
                        this.setState({
                            returncode: "2002",
                            retmsg: retmsg.toString()
                        }, () => {
                            this.finalSubmit();
                        })
                        return;
                    }
                    window.welcome();
                    let JyTime = "", hykh, sysTime;
                    let isOpenCashbox = false;
                    if (res.consumersCard) {
                        hykh = res.consumersCard;
                    }
                    if (res.memberInfo) {
                        hykh = res.memberInfo.memberId;
                    }

                    //取服务返回时间
                    sysTime = res.saleDate;
                    if (sysTime) {
                        let a = sysTime.split(" ");
                        JyTime = a[0].split("-")[2] + "/" + a[0].split("-")[1] + "/" + a[0].split("-")[0] + " " + a[1];
                        if (sysTime.split('-')[2].slice(0, 2) == this.props.syspara.dateHSXP && !this.state.query.isBl) {
                            isyellowPrint = 'Y'
                        }
                    }
                    let cashTotal = 0;
                    this.state.payList.map((item) => {
                        if (item.flag !== "2") {
                            let mode = this.props.payModeInfo.find((mode) => mode.code === item.paycode);
                            if (mode.virtualPayType == 0) {//判断是现金
                                cashTotal -= item.total
                                if (this.state.change == "0.00") {
                                    isOpenCashbox = true
                                }
                            } else if (mode.virtualPayType == 1) {
                                isOpenCashbox = true
                            }
                        } else if (item.flag == "2" && (this.state.changename == "现金找零" || this.state.changename == "現金找續")) {
                            cashTotal += item.total
                        }
                    });
                    if (isOpenCashbox) {
                        window.openCashbox();
                    }
                    let _balance = "" + Number(this.state.octopusBalance).toFixed(2);
                    let DeuPrintHead = {
                        refno: this.props.syjh + this.props.fphm,
                        syyh: this.props.operators,//收银员
                        hykh: hykh,//会员号
                        mkt: this.props.mkt,//门店号
                        zl: this.state.change,//找零金额
                        djlb: "Y6",//单据类别1代表销售，4代表退货
                        printtype: "1", //0代表热敏打印，1代表平推
                        syjh: this.props.syjh,//收银机号
                        rqsj: JyTime,//交易时间
                        sjfk: this.state.yftotal,//实际付款
                        ysje: this.props.zdyftotal,//应收金额
                        subTotal: this.props.zdsjtotal, //全单金额
                        printnum: 0,//重打次数
                        printtime: this.props.syspara.salebillnum || 1,//打印次数
                        shopname: this.props.syspara.shopname,//商场名称
                        shopEnName: this.props.mktinfo.shopEnName,
                        isyellowPrint: isyellowPrint, //是否打印黄色小票
                        ArtcodeMoney: ArtcodeMoney, //黄色小票非直营金额
                        DirectMoney: DirectMoney, //黄色小票直营金额
                        barcodeString: this.props.mkt + this.props.syjh + this.props.xph,//门店号+收银机号+小票号
                        zliszzoctopus: this.state.octozlDone,    //是否找零增值到八达通
                        octopusDeviceId: !!this.state.octopusDeviceId ? this.state.octopusDeviceId.toUpperCase() : "",    //八达通设备号
                        octopusCardno: this.state.octopusCardno,    //八达通卡号
                        octopusDedudeTotal: this.state.octopusDedudeTotal,
                        octopusBalance: _balance,  //八达通余额
                        octopusLastAddValDate: this.state.octopusLastAddValDate,    //最近一次增值日期
                        octopusLastAddValType: this.props.switchEng === true ? this.state.octopusLastAddValTypeEn : this.state.octopusLastAddValType,    //最近一次增值类型
                        octopusIsSmart: this.state.octopusIsSmart,
                        octopusTransactionTime: this.state.octopusTransDate,
                        switchEng: false,  //是否打印英文小票
                        address: this.props.mktinfo.address,  //门店地址
                        enAddress: this.props.mktinfo.enAddress,
                        mktname: this.props.mktinfo.mktname,//门店号名称
                        phone: this.props.mktinfo.telephone,//门店号名称
                        mdjc: this.props.mktinfo.shopSName,
                        refundAuthzCardNo: this.props.refundAuthzCardNo, //退货授权卡号
                        terminalOperatorAuthzCardNo: this.props.terminalOperatorAuthzCardNo,//员工授权卡号
                        totalDiscAuthzCardNo: this.props.totalDiscAuthzCardNo,//总折扣授权卡号
                        expressNumber: this.props.expressNumber, //送货memo号
                        dcData: this.sliceDcDate(this.props.dcData),
                        consumersType: this.props.consumersType,
                        stallInfo: this.props.isDiningHall ? this.changeGoods(res.goodsList).stallInfo : [],
                        hjzsl,
                        bankTotal,
                        notBankTotal,
                        isTailTotal,
                        isnotTailTotal,
                        isTailPrint: 'Y',
                    };
                    if (!!this.state.payList && payWZF !== "") {
                        let pwzfStr = payWZF.split(",");
                        for (let m = 0; m < pwzfStr.length; m++) {
                            for (let i = 0; i < this.state.payList.length; i++) {
                                if (pwzfStr[m] === this.state.payList[i].paycode) {
                                    DeuPrintHead.tradeno = "BARC#" + this.state.payList[i].refCode;
                                    DeuPrintHead.ordered = "RRNO#" + this.state.payList[i].payno;
                                }
                            }
                        }
                    }
                    if (!!pay && !!payJFXF) {
                        let hykDeduct = 0, hykDeductTotal = 0;
                        for (let m = 0; m < pay.length; m++) {
                            if (pay[m].paycode === payJFXF || pay[m].paycode === payJFHG) {
                                DeuPrintHead.hykh = pay[m].payno;
                                hykDeduct += parseFloat(pay[m].ybje);
                                hykDeductTotal += parseFloat(pay[m].total);
                            }
                        }
                        if (hykDeduct && hykDeductTotal) {
                            DeuPrintHead.hykDeduct = hykDeduct.toFixed(2);
                            DeuPrintHead.hykDeductTotal = hykDeductTotal.toFixed(2);
                        }
                        DeuPrintHead.isgh = 'Y';
                    }

                    let DeuPrintData = {
                        Module: 'TailPrint',
                        head: [DeuPrintHead],
                        pay
                    }
                    let _this = this;
                    let octoZlzzNeedsPrint = false;  //是否打印找零八达通增值小票
                    let octozzSalePrintData = null;  //含找零八达通增值信息的销售小票
                    let octoZlzzOrgiRef = "";   //找零八达通增值原单号
                    let octoZlzzOrgiFlowNo = "";    //找零八达通增值原单flow_no
                    this.state.payList.map((item) => {
                        let obj = { ...item };
                        if (item.flag !== "2") {
                            let mode = this.props.payModeInfo.find((mode) => mode.code === item.paycode);
                            if (mode.virtualPayType == 0) {//判断是现金
                                cashTotal += Number(item.total)
                                if (this.state.change == "0.00") {
                                    isOpenCashbox = true
                                }
                            } else if (mode.virtualPayType == 1) {
                                isOpenCashbox = true
                            }
                        } else if (item.flag == "2" && (this.state.changename == "现金找零" || this.state.changename == "現金找續")) {
                            cashTotal -= Number(item.total)
                        } else if (item.flag === "2" && this.state.octozlDone === true) {
                            octoZlzzNeedsPrint = true;
                            octoZlzzOrgiRef = this.props.syjh.split("").join("") + ("" + this.props.fphm).split("").join("");
                            octoZlzzOrgiFlowNo = this.props.flow_no.split("").join("");
                            // console.log("找零八达通增值原单号-->", octoZlzzOrgiRef);
                        }
                    });
                    oldFphm = this.props.fphm;
                    if (octoZlzzNeedsPrint === true) {
                        //八达通找零增值调用handleEjoural
                        // this.handleEjoural({
                        //     octopusDeviceId: !!this.state.octopusDeviceId ? this.state.octopusDeviceId.toUpperCase() : "",    //八达通设备号
                        //     octopusCardno: this.state.octopusCardno,    //八达通卡号
                        //     octopusRechargeTotal: "" + Number(this.props.zdyftotal).toFixed(2), //充值金额
                        //     octopusBalance: "" + Number(this.state.octopusBalance).toFixed(2),  //八达通余额
                        //     octopusIsSmart: this.state.octopusIsSmart,          //是否八达通智能卡
                        //     octopusLastAddValDate: this.state.octopusLastAddValDate,    //最近一次增值日期
                        //     octopusLastAddValType: this.props.switchEng === true ? this.state.octopusLastAddValTypeEn : this.state.octopusLastAddValType,    //最近一次增值类型
                        //     octopusTransDate: this.state.octopusTransDate, //八达通交易时间
                        //     sjfk: this.state.yftotal,//实际付款
                        //     ysje: this.props.zdyftotal,//应收金额
                        //     zl: this.state.change,//找零金额
                        // }, 5);
                        // 找零到八达通小票，延迟到update()后打印
                        octozzSalePrintData = this.deepCopy(DeuPrintData);
                        this.props.update();        //更新小票号
                        let _a = this.state.octopusTransDate.split(" ");
                        let octoJyTime = _a[0].split("-")[2] + "/" + _a[0].split("-")[1] + "/" + _a[0].split("-")[0] + " " + _a[1];
                        octozzSalePrintData.head[0].rqsj = octoJyTime;

                        let fphmPlus = parseInt(this.props.fphm) + 1;
                        fphmPlus = "" + fphmPlus;
                        if (fphmPlus.length <= 4) fphmPlus = `${'0'.repeat(4 - fphmPlus.length)}${fphmPlus}`;
                        let printTemplate = {
                            Module: 'OctozzSalePrint',
                            head: [{
                                octopusDeviceId: !!this.state.octopusDeviceId ? this.state.octopusDeviceId.toUpperCase() : "",    //八达通设备号
                                octopusCardno: this.state.octopusCardno,    //八达通卡号
                                octopusRechargeTotal: this.state.change, //充值金额
                                octopusBalance: "" + Number(this.state.octopusBalance).toFixed(2),  //八达通余额
                                octopusIsSmart: this.state.octopusIsSmart,          //是否八达通智能卡
                                octopusLastAddValDate: this.state.octopusLastAddValDate,    //最近一次增值日期
                                octopusLastAddValType: this.props.switchEng === true ? this.state.octopusLastAddValTypeEn : this.state.octopusLastAddValType,    //最近一次增值类型
                                octopusTransDate: this.state.octopusTransDate, //八达通交易时间
                                octopusTransactionTime: this.state.octopusTransDate,
                                sjfk: this.state.yftotal,//实际付款
                                ysje: this.props.zdyftotal,//应收金额
                                refno: this.props.syjh + this.props.xph.substring(9),  //ref值
                                fphm: this.props.xph.substring(9),  //ref值
                                orgiRefno: this.props.syjh + oldFphm,
                                printtype: "0", //0代表热敏打印，1代表平推
                                printnum: 0,//重打字显示
                                printtime: 1,//打印次数
                                zl: this.state.change, //找零金额
                                mkt: this.props.mkt,//门店号
                                syyh: this.props.operators,//收银员
                                syjh: this.props.syjh,//收银机号
                                rqsj: octoJyTime,
                                switchEng: this.props.switchEng || false,  //是否打印英文小票
                                barcodeString: this.props.mkt + this.props.syjh + this.props.xph,//门店号+收银机号+小票号
                            }]
                        };

                        window.Print(printTemplate, () => {
                            // DeuPrintData.head[0].refno = printTemplate.head[0].orgiRefno;
                        });


                    }
                    this.setState({
                        oldFphm
                    }, () => { this.props.update(); });
                    Modal.success({
                        className: 'vla-confirm',
                        title: '請放入尾款單，然後按確定！',
                        okText: "確定",
                        content: '',
                        onOk() {
                            _this.setState({ isPrint: true }, () => {
                                window.Print(DeuPrintData, (data) => {
                                    _this.printAfter(DeuPrintData, isACS, cashTotal, data, isSDYN, null, null, null, null, oldFphm)
                                });
                            })
                        }
                    })
                }
            });
        } else {
            let submitReq = {
                operators: this.props.operators,
                flow_no: this.props.flow_no,
                mkt: this.props.mkt,
                syjh: this.props.syjh,
                uidlist: this.props.goodsList.map(item => item.guid).join(","),
                puidlist: this.state.payList.map(item => item.puid).join(","),
                refNo: '',
            };
            if (this.state.returncode === "2002") {
                submitReq.newTerminalSno = this.state.retmsg
            }
            const submitFunc = () => {
                this.props.submit(submitReq).then(res => {
                    if (res) {
                        let isPSYH = true;
                        this.setState({
                            submitResult: res,
                            stampStatus: res.stampStatus
                        })
                        let retmsg = res.retmsg;
                        retmsg = Number(retmsg) + 1
                        if (res.retflag === "2002") {
                            this.props.update();
                            this.setState({
                                returncode: "2002",
                                retmsg: retmsg.toString()
                            }, () => {
                                this.finalSubmit();
                            })
                            return;
                        }
                        if (res.memberInfo && !!res.pointUsed && res.pointUsed !== 0) {
                            let { bonusPointLastMonth, bonusPointUsed } = res.memberInfo
                            message(`原有積分: ${Number(bonusPointLastMonth) - Number(bonusPointUsed)}, 本次使用積分: ${Number(res.pointUsed)}, 剩余積分: ${Number(bonusPointLastMonth) - Number(bonusPointUsed) - Number(res.pointUsed)}`)
                        }
                        window.welcome();
                        let JyTime = "", sysTime;//交易日期
                        let isOpenCashbox = false;
                        let newDate = new Date();
                        let week = newDate.getDay();
                        let day = newDate.getDate();
                        //取服务返回时间
                        sysTime = res.saleDate;
                        if (sysTime) {
                            let a = sysTime.split(" ");
                            JyTime = a[0].split("-")[2] + "/" + a[0].split("-")[1] + "/" + a[0].split("-")[0] + " " + a[1];
                            if (sysTime.split('-')[2].slice(0, 2) == this.props.syspara.dateHSXP && !this.state.query.isBl) {
                                isyellowPrint = 'Y'
                            }
                        }
                        let cashTotal = 0, isCoupon, goods = [], hykh;
                        if (res.consumersCard) {
                            hykh = res.consumersCard;
                        }
                        if (res.memberInfo && res.memberInfo.memberId) {
                            hykh = res.memberInfo.memberId;
                        }

                        let newGoods = this.props.isDiningHall ? this.changeGoods(res.goodsList).newGoods : this.filterGoodsStock(res.goodsList);
                        newGoods.map((item, index) => {
                            let obj = { ...item };
                            obj.idnum = index + 1;
                            obj.disc = obj.disc + "%"
                            if ((this.props.addDjlb == "Y10" || this.props.addDjlb == "Y11" || this.props.addDjlb == "Y19") && index === 0) {
                                obj.amcNO = this.props.mkt.substring(this.props.mkt.length - 2) + this.props.syjh + this.props.amcNO
                            }
                            goods.push(obj);
                        });
                        if (this.props.coupon_gain == []) {
                            isCoupon = 'N'
                        } else {
                            isCoupon = 'Y'
                        }
                        if (this.props.syspara.yhrqTS.indexOf(day) !== -1 || week == 3) {
                            isYhrq = 'Y'
                        }
                        let octoZlzzNeedsPrint = false;  //是否打印找零八达通增值小票
                        let octozzSalePrintData = null;  //含找零八达通增值信息的销售小票
                        let octoZlzzOrgiRef = "";   //找零八达通增值原单号
                        let octoZlzzOrgiFlowNo = "";    //找零八达通增值原单flow_no
                        this.state.payList.map((item) => {
                            let obj = { ...item };
                            if (item.flag !== "2") {
                                let mode = this.props.payModeInfo.find((mode) => mode.code === item.paycode);
                                if (mode.virtualPayType == 0) {//判断是现金
                                    cashTotal += Number(item.total)
                                    if (this.state.change == "0.00") {
                                        isOpenCashbox = true
                                    }
                                } else if (mode.virtualPayType == 1) {
                                    isOpenCashbox = true
                                }
                            } else if (item.flag == "2" && (this.state.changename == "现金找零" || this.state.changename == "現金找續")) {
                                cashTotal -= Number(item.total)
                            } else if (item.flag === "2" && this.state.octozlDone === true) {
                                octoZlzzNeedsPrint = true;
                                octoZlzzOrgiRef = this.props.syjh.split("").join("") + ("" + this.props.fphm).split("").join("");
                                octoZlzzOrgiFlowNo = this.props.flow_no.split("").join("");
                                // console.log("找零八达通增值原单号-->", octoZlzzOrgiRef);
                            }
                        });
                        if (isOpenCashbox) {
                            window.openCashbox();
                        }
                        //完成销售打印head对象
                        let _balance = "" + Number(this.state.octopusBalance).toFixed(2);
                        let printObj = {
                            refno: this.props.syjh + this.props.fphm,  //ref值
                            syyh: this.props.operators,//收银员
                            hykh: hykh,//会员号
                            mkt: this.props.mkt,//门店号
                            stampStatus: res.stampStatus || '',
                            syjh: this.props.syjh,//收银机号
                            fphm: this.props.fphm,//小票号
                            zl: this.state.change,//找零金额
                            djlb: this.props.addDjlb ? this.props.addDjlb : this.props.djlb,//单据类别1代表销售，4代表退货,Y练习收银
                            rqsj: JyTime,//交易时间
                            sjfk: this.state.yftotal,//实际付款
                            ysje: this.props.zdyftotal,//应收金额
                            subTotal: this.props.zdsjtotal, //全单金额
                            printnum: 0,//重打次数
                            printtype: "1", //0代表热敏打印，1代表平推
                            printtime: this.props.syspara.salebillnum || 1,//打印次数
                            shopname: this.props.syspara.shopname,//商场名称
                            shopEnName: this.props.mktinfo.shopEnName,
                            iscoupon_gain: isCoupon, //是否打印券
                            isyellowPrint: isyellowPrint, //是否打印黄色小票
                            ArtcodeMoney: ArtcodeMoney, //黄色小票非直营数组
                            DirectMoney: DirectMoney, //黄色小票直营金额
                            ArtcodeMoneyTotal: ArtcodeMoneyTotal,//黄色小票非直营金额
                            switchEng: this.props.switchEng,  //是否打印英文小票
                            coupon_gain: this.props.coupon_gain,//返券
                            jf: this.props.jf,  //本币获得积分
                            curjf: this.props.curjf, //当前积分
                            outSideGiftsInfo: this.props.outSideGiftsInfo,  //场外换购信息
                            popInfo: this.props.popInfo, //整单折扣
                            isfl: this.props.syjmain.issryyy,  //当值为Y时，复联打印
                            isflPrint: isflPrint, //值为true打印副单
                            flPrinttime: flPrinttime,
                            address: this.props.mktinfo.address,  //门店地址
                            enAddress: this.props.mktinfo.enAddress,
                            mktname: this.props.mktinfo.mktname,//门店号名称
                            phone: this.props.mktinfo.telephone,//门店号名称
                            mdjc: this.props.mktinfo.shopSName,
                            barcodeString: this.props.mkt + this.props.syjh + this.props.xph,//门店号+收银机号+小票号
                            zliszzoctopus: this.state.octozlDone,    //是否找零增值到八达通
                            octopusDeviceId: !!this.state.octopusDeviceId ? this.state.octopusDeviceId.toUpperCase() : "",    //八达通设备号
                            octopusCardno: this.state.octopusCardno,    //八达通卡号
                            octopusDedudeTotal: this.state.octopusDedudeTotal,
                            octopusBalance: _balance,  //八达通余额
                            octopusLastAddValDate: this.state.octopusLastAddValDate,    //最近一次增值日期
                            octopusLastAddValType: this.props.switchEng === true ? this.state.octopusLastAddValTypeEn : this.state.octopusLastAddValType,    //最近一次增值类型
                            octopusIsSmart: this.state.octopusIsSmart,
                            octopusTransactionTime: this.state.octopusTransDate,
                            refundAuthzCardNo: this.props.refundAuthzCardNo, //退货授权卡号
                            terminalOperatorAuthzCardNo: this.props.terminalOperatorAuthzCardNo,//员工授权卡号
                            totalDiscAuthzCardNo: this.props.totalDiscAuthzCardNo,//总折扣授权卡号
                            cardNo: this.props.creditCardNo,
                            staffcard: this.props.cardNo,   //员工购物
                            staffcardYGGH: this.props.staffNo,  //是员工工号
                            staffcardType: this.props.cardType,  //1为员工购物  2为亲属购物
                            eleStamp: this.props.eleStamp, //印花券
                            sticker: this.props.sticker, //印花券
                            stamp: this.props.stamp,
                            stick: this.props.stick,
                            memberInfo: this.props.memberInfo,
                            printMode: res.printMode,
                            hasFastPay: this.props.hasFastPay,
                            stallInfo: this.props.isDiningHall ? this.changeGoods(res.goodsList).stallInfo : [],
                            consumersType: this.props.consumersType,
                            online: res.saveStatus === "1" ? 0 : "1",
                            hjzsl,//合计商品数
                            isYhrq,
                            bankTotal,
                            notBankTotal,
                            isTailTotal,
                            isnotTailTotal,
                        }
                        if (!this.props.uploadData) this.props.setState({ uploadData: parseInt(this.props.saveStatus) });
                        if (!!this.state.payList && payWZF !== "") {
                            let pwzfStr = payWZF.split(",");
                            for (let m = 0; m < pwzfStr.length; m++) {
                                for (let i = 0; i < this.state.payList.length; i++) {
                                    if (pwzfStr[m] === this.state.payList[i].paycode) {
                                        printObj.tradeno = "BARC#" + this.state.payList[i].refCode;
                                        printObj.ordered = "RRNO#" + this.state.payList[i].payno;
                                    }
                                }
                            }
                        }
                        if (!!pay && !!payJFXF) {
                            let hykDeduct = 0, hykDeductTotal = 0;
                            for (let m = 0; m < pay.length; m++) {
                                if (pay[m].paycode === payJFXF || pay[m].paycode === payJFHG) {
                                    // printObj.hykh = pay[m].payno;
                                    hykDeduct += parseFloat(pay[m].ybje);
                                    hykDeductTotal += parseFloat(pay[m].total);
                                }
                            }
                            if (hykDeduct && hykDeductTotal) {
                                printObj.hykDeduct = hykDeduct.toFixed(2);
                                printObj.hykDeductTotal = hykDeductTotal.toFixed(2);
                            }
                            printObj.isgh = 'Y';
                        }
                        oldFphm = this.props.fphm;
                        this.setState({
                            oldFphm
                        }, () => { this.props.update(); });
                        //派送券
                        if (this.props.addDjlb !== "Y12") {
                            if (this.props.syspara.yhrqTS.indexOf(day) !== -1 || week == 3) {
                                if (this.props.sticker) {//this.props.eleStamp ||
                                    let couponmess = this.props.eleStamp ? this.props.eleStamp + '张電子印花自動存入會員賬戶' : '';
                                    // let couponmesss = this.props.sticker ? '請提醒顧客到印花收集処領取' + this.props.sticker + '张纸质印花券' : '';
                                    let couponmesss = this.props.sticker ? '可獲印花' + this.props.sticker + '枚' : '';
                                    isPSYH = false;
                                    let that = this;
                                    if (!isOpenCashbox) {
                                        window.openCashbox();
                                    }
                                    Modal.success({
                                        className: 'vla-confirm',
                                        title: couponmess + couponmesss,
                                        content: '',
                                        onOk() {
                                            that.submitPrint(hykh, isyellowPrint, ArtcodeMoney, ArtcodeMoneyTotal, DirectMoney, hjzsl, bankTotal, notBankTotal, isTailTotal, isnotTailTotal,
                                                isYhrq, goods, pay, cashTotal, isSDYN, printObj, octoZlzzNeedsPrint, isACS, isPTFQ, isPress, isSCB, isMahatan, octozzSalePrintData, octoZlzzOrgiRef, oldFphm);
                                        }
                                    })
                                }
                            } else {
                                if (this.props.sticker) {//this.props.eleStamp ||
                                    let couponmess = this.props.eleStamp ? this.props.eleStamp + '张電子印花自動存入會員賬戶' : '';
                                    // let couponmesss = this.props.sticker ? '請派發' + this.props.sticker + '张纸质印花券' : '';
                                    let couponmesss = this.props.sticker ? '可獲印花' + this.props.sticker + '枚' : '';
                                    isPSYH = false;
                                    let that = this;
                                    if (!isOpenCashbox) {
                                        window.openCashbox();
                                    }
                                    Modal.success({
                                        className: 'vla-confirm',
                                        title: couponmess + couponmesss,
                                        content: '',
                                        onOk() {
                                            that.submitPrint(hykh, isyellowPrint, ArtcodeMoney, ArtcodeMoneyTotal, DirectMoney, hjzsl, bankTotal, notBankTotal, isTailTotal, isnotTailTotal,
                                                isYhrq, goods, pay, cashTotal, isSDYN, printObj, octoZlzzNeedsPrint, isACS, isPTFQ, isPress, isSCB, isMahatan, octozzSalePrintData, octoZlzzOrgiRef, oldFphm);
                                        }
                                    })
                                }
                            }
                        }
                        //是否派送完成印花再调打印
                        if (isPSYH) {
                            this.submitPrint(hykh, isyellowPrint, ArtcodeMoney, ArtcodeMoneyTotal, DirectMoney, hjzsl, bankTotal, notBankTotal, isTailTotal, isnotTailTotal,
                                isYhrq, goods, pay, cashTotal, isSDYN, printObj, octoZlzzNeedsPrint, isACS, isPTFQ, isPress, isSCB, isMahatan, octozzSalePrintData, octoZlzzOrgiRef, oldFphm
                            )
                                ;
                        }
                    }
                });
            }
            //美食广场更新后厨打印单号
            if (this.props.isDiningHall && !this.props.breadFlag) {
                this.updateHasBackPrint(this.props.goodsList, this.state.backPrintStallInfo).then(res => {
                    if (res) {
                        submitFunc()
                    }
                })
            } else {
                submitFunc()
            }

        }
    }

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

    componentDidMount() {
        console.log("IS: ", this.props, this.state)
        //付款模板控制删除不能直接付款方式
        let payModeInfo = this.props.payModeInfo.filter((item, index) => {
            return this.props.syspara.nozjfkpaycode.indexOf(item.code) === -1;
        })
        let noSalesMemoPaymode;
        let SalesMemoPaymode;
        let paymode;
        if (this.props.limitedPays) {//除外付款方式
            paymode = [...payModeInfo]
            payModeInfo.map((item, index) => {
                this.props.limitedPays.map((limit, id) => {
                    if (item.code == limit.paycode) {
                        paymode.splice(index, 1)
                    }
                })
            })
        } else if (this.props.exceptPaycode) {//银行优惠付款方式
            paymode = [...payModeInfo]
            payModeInfo.map((item, index) => {
                if (item.code == this.props.exceptPaycode) {
                    paymode.splice(index, 1)
                }
            })       
        } else if (this.props.type == "finalpayment") {//按金付款方式
            paymode = [...payModeInfo]
            payModeInfo.map((item, index) => {
                if (item.code == this.props.syspara.wkzfPaycode) {
                    paymode.splice(index, 1)
                }
            })
        } else if (this.props.type === "eliminatebills" && this.props.exceptPaycodes) {//消单付款方式
            paymode = [];
            for (let x of payModeInfo) {
                for (let y of this.props.exceptPaycodes) {
                    if (x.code == y.paycode) {
                        paymode.push(x);
                        break;
                    }
                }
            }
        } else if (this.props.djlb === "Y1") {
            paymode = []
            payModeInfo.map((item, index) => {
                this.props.syspara.buylqPaycode.map((itemok) => {
                    if (item.code == itemok) {
                        paymode.push(item)
                    }
                })
            })
        } else if (this.props.djlb === "Y7") {
            paymode = []
            payModeInfo.map((item, index) => {
                if (item.virtualPayType == 0 || item.virtualPayType == 1 || item.virtualPayType == 2) {
                    paymode.push(item)
                }
            })
        } else if (!!this.state.query && !!this.state.query && !!this.state.query.djlb && (this.state.query.djlb === 'Y3' || this.state.query.djlb === 'Y9')) {
            paymode = []
            payModeInfo.map((item, index) => {
                if (item.code === this.props.syspara.bbcodeHBFH[0]) {
                    paymode.push(item)
                }
            })
        } else if (this.props.type === "returnGoods" && this.props.djlb != "Y2") {
            paymode = [...payModeInfo]
            payModeInfo.map((item, index) => {
                if (item.virtualPayType == "6") {
                    paymode.splice(index, 1)
                }
            })
            paymode = paymode.filter((item) => {
                return item.returnPayFlag === 'Y';
            })
        } else if (this.props.djlb === "Y2") {
            paymode = []
            payModeInfo.map((item, index) => {
                if (item.code == this.props.syspara.bbcodeHBFH[0]) {
                    paymode.push(item)
                }
            })
        } else if (this.props.isJFXH === true) {
            paymode = []
            payModeInfo.map((item, index) => {
                if (item.code == "0800") {
                    paymode.push(item)
                }
            })
        } else {
            paymode = [...payModeInfo]
        }
        this.setState({
            paymode
        }, () => {
            noSalesMemoPaymode = [...this.state.paymode];
            SalesMemoPaymode = [...this.state.paymode];
            this.state.paymode.map((item, index) => {
                if (item.code == this.props.syspara.wkzfPaycode) {
                    noSalesMemoPaymode.splice(index, 1)
                }
            })
        })

        //判断是否有八达通支付
        let payOctopus;
        this.props.syspara.payObj.map((item) => {
            if (item.split(',')[0] == "payOctopus") {
                payOctopus = item.split(',')[1];
            }
        });
        this.props.payModeInfo.map((item) => {
            if (payOctopus === item.code) {
                this.setState({
                    zliszzoctopus: true
                })
            }
        })

        this.state.paymode.map((item, index) => {
            if (item.paycode == this.props.syspara.wkzfPaycode) {
                noSalesMemoPaymode.splice(index, 1)
            }
        })
        if (this.props.type == "finalpayment") {//按金交易
            this.props.trade(this.props.operators, this.props.flow_no, this.props.mkt, this.props.syjh).then((res) => {
                if (res) {
                    window.LineDisplay({ data: { total: res.total }, type: 2 })
                    let isSDYN = false;
                    this.props.goodsList.map((item, index) => {
                        if (item.controlFlag) {
                            isSDYN = true;
                        }
                    })
                    if (res.total <= 0) {
                        let paymode = []
                        payModeInfo.map((item, index) => {
                            if (item.code == this.props.syspara.bbcodeHBFH[0]) {
                                paymode.push(item)
                            }
                        })
                        noSalesMemoPaymode = [...paymode];
                        SalesMemoPaymode = [...paymode];
                        this.state.paymode.map((item, index) => {
                            if (item.code == this.props.syspara.wkzfPaycode) {
                                noSalesMemoPaymode.splice(index, 1)
                            }
                        })
                    }
                    this.setState({
                        type: this.state.query.djlb === '4' ? '4' : "Y6",
                        sftotal: res.remainje,//剩余应付
                        yftotal: this.props.sjtotal ? this.props.sjtotal : 0,//已经付款金额
                        payList: this.props.salePayments ? [this.props.salePayments] : [],
                        isrenderBox: true,
                        paymode: this.props.expressNumber || isSDYN ? SalesMemoPaymode : noSalesMemoPaymode
                    }, () => {
                        this.handleEjoural("item", 0);
                    })
                }
            });
            return;
        } else if (this.props.type == "returnGoods" || this.props.type == "eliminatebills") {//退货  消单
            this.props.trade(this.props.operators, this.props.flow_no, this.props.mkt, this.props.syjh).then((res) => {
                window.LineDisplay({ data: { total: res.total }, type: 2 })
                let isSDYN = false;
                this.props.goodsList.map((item, index) => {
                    if (item.controlFlag) {
                        isSDYN = true;
                    }
                })
                if (res.total <= 0) {
                    let paymode = []
                    payModeInfo.map((item, index) => {
                        if (item.code == this.props.syspara.bbcodeHBFH[0]) {
                            paymode.push(item)
                        }
                    })
                    noSalesMemoPaymode = [...paymode];
                    SalesMemoPaymode = [...paymode];
                    this.state.paymode.map((item, index) => {
                        if (item.code == this.props.syspara.wkzfPaycode) {
                            noSalesMemoPaymode.splice(index, 1)
                        }
                    })
                }
                this.setState({
                    deliveryTime: res.deliveryTime,
                    type: this.props.djlb,
                    sftotal: res.remainje,
                    yftotal: this.props.sjtotal ? this.props.sjtotal : 0,//已经付款金额
                    payList: this.props.salePayments ? [...this.props.salePayments] : [],
                    paymode: this.props.expressNumber || isSDYN ? SalesMemoPaymode : noSalesMemoPaymode,
                    isrenderBox: true,
                }, () => {
                    this.handleEjoural("item", 0);
                    if (res && res.salepayments && res.salepayments.length > 0) {
                        res.salepayments.forEach(item => {
                            if (item.isAutoDelOnly || item.paycode === '0707') {
                                this.handleEjoural(item, 1)
                            }
                        })
                    }
                })
            });
            return;
        } else {//销售
            this.props.trade(this.props.operators, this.props.flow_no, this.props.mkt, this.props.syjh).then((res) => {
                if (res && res.remainje > 0 && this.props.isDiningHall && !this.props.breadFlag) {
                    //获取后厨打印配置
                    this.getBackPrintConfig(res.goodlist)
                    let groupByGoodsList = this.groupBy(res.goodlist, item => {
                        return [item.stallCode]
                    })
                    this.setState({ groupByGoodsList })
                }
                window.LineDisplay({ data: { total: res.total }, type: 2 })
                let isSDYN = false;
                this.props.goodsList.map((item, index) => {
                    if (item.controlFlag) {
                        isSDYN = true;
                    }
                })
                if (res.total <= 0) {
                    let paymode = []
                    payModeInfo.map((item, index) => {
                        if (item.code == this.props.syspara.bbcodeHBFH[0]) {
                            paymode.push(item)
                        }
                    })
                    noSalesMemoPaymode = [...paymode];
                    SalesMemoPaymode = [...paymode];
                    this.state.paymode.map((item, index) => {
                        if (item.code == this.props.syspara.wkzfPaycode) {
                            noSalesMemoPaymode.splice(index, 1)
                        }
                    })
                }
                let stt = {
                    sftotal: res.remainje,
                    yftotal: this.props.sjtotal ? this.props.sjtotal : 0,//已经付款金额
                    payList: this.props.salePayments ? [...this.props.salePayments] : [],
                    isrenderBox: true,
                    paymode: this.props.expressNumber || isSDYN ? SalesMemoPaymode : noSalesMemoPaymode
                }
                //是否八达通增值订单
                if (!!this.state.query && !!this.state.query && !!this.state.query.djlb && this.state.query.djlb === 'Y3') {
                    // message(intl.get("INFO_OCTOSWIPE")); //请拍要增值的八达通卡
                    stt.octoDjlb = 'Y3';
                    stt.octopusRetrying = false;
                } else {
                    stt.octoDjlb = '';
                    stt.octopusRetrying = false;
                }
                if (res && res.remainje == 0 && this.props.addDjlb === 'Y12') {
                    //印花换购单据 支付现金为0 直接交易
                    this.setState({ isrenderBox: true }, () => {
                        this.child.finalsubmit()
                    })
                }
                this.setState(stt, () => {
                    if (res.remainje <= 0 && this.state.payList && this.state.payList.length !== 0) {
                        this.finalSubmit();
                    }
                    if (stt.octoDjlb != 'Y3') {
                        this.handleEjoural("item", 0);
                        if (res && res.salepayments && res.salepayments.length > 0) {
                            res.salepayments.forEach(item => {
                                if (item.isAutoDelOnly || item.paycode === '0707') {
                                    this.handleEjoural(item, 1)
                                }
                            })
                        }
                    }
                })
            });
        }
    }

    sliceDcDate = (dcData) => {
        console.log('dcData', dcData)
        let _dcData = JSON.parse(JSON.stringify(dcData));
        let date = _dcData && _dcData.date;
        //let sliceDate = ''
        // if (!!date) {
        //     let arr = date.split("-");
        //     let temp = arr[0];
        //     arr[0] = arr[2];
        //     arr[2] = temp;
        //     sliceDate = arr.join('-')
        // }
        let obj = Object.assign(_dcData, { date: moment(this.state.deliveryTime || date).format("DD/MM/YYYY") });
        return obj
    }    

    invoiceSubmit(){
        const { 
            addDjlb,
            cardBin, 
            erpCode,
            exceptPaycodes, 
            expressNumber, 
            flow_no, 
            fphm, 
            mkt, 
            operators, 
            syjh, 
            payModeInfo, 
        } = this.props; 
        const {
            sftotal,
            type
        } = this.state;       
        let staffCard = this.props.creditCardNo || this.props.staffNo;
        let extra = {
            cardBin,
            erpCode,
            exceptPaycodes,
            expressNumber,
            flow_no,
            fphm,
            mkt,
            operators,
            syjh,
            scene: "0",
            staffCard,
            type,
            IniPaymode: payModeInfo,
        };
        if (this.octozzUnDoneFilter()) {
            if (sftotal > 0) {
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
            } else if (sftotal == 0 && addDjlb === 'Y12') {
                //印花换购单据 支付现金为0 点击完成直接交易
                let payInfo = payModeInfo.find(v => v.paytype == '1')
                if (!!payInfo) {
                    this.refs.ShowPaybox.doPayment(0, payInfo, extra, 0)
                }
            } else {
                this.finalSubmit();
            }
        }
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
                        <ShowPaybox 
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
}

const mapStateToProps = (state) => {
    console.log("InvoiceService", state);
    let router = state["routing"].locationBeforeTransitions;
    let _defProps = {
        // initialize
            entid: state['initialize'].entid,
            erpCode: state["initialize"].erpCode,   
            interval: state["initialize"].interval,
            mkt: state["initialize"].mkt,
            mktinfo: state["initialize"].data.mktinfo,
            online: state["initialize"].online,
            payModeInfo: state["initialize"].data.paymode,
            stallhotkeytemplate: state["initialize"].data.stallhotkeytemplate,
            syjh: state["initialize"].syjh,
            syjmain: state["initialize"].data.syjmain[0],
            syspara: state["initialize"].Syspara,
            xph: state["initialize"].xph,
        // invoice
            expressNumber: state["invoice"].expressNumber,//送货memo
            goodsList: state["invoice"].goods || [],
            realConsumersCard: state['invoice'].realConsumersCard,
            recycleSer: state["invoice"].recycleSer,//四电一脑基础信息
            recycleSerInfo: state["invoice"].recycleSerInfo,//四电一脑详情
            refundAuthzCardNo: state["invoice"].refundAuthzCardNo,
            rqsj: state['invoice'].saleDate,
            salePayments: state["invoice"].salePayments || [], //！！支付列表        
            sjtotal: state["invoice"].sjtotal || '0',//！！实际付款总金额
            terminalOperatorAuthzCardNo: state["invoice"].terminalOperatorAuthzCardNo,
            totalDiscAuthzCardNo: state["invoice"].totalDiscAuthzCardNo,
            zddsctotal: state["invoice"].zddsctotal || '0',//优惠金额
            zdsjtotal: state["invoice"].zdsjtotal || '0',//实际总金额
            zdyftotal: state["invoice"].zdyftotal || '0',//应付总金额
        // login 
            operators: state['login'].operuser.gh || state['login'].operuser.cardno
    }

    if (router.state && router.state.type === "returnGoods") {
        let _sttType = router.state.type;
        return {
            type: router.state.type,
            // initialize
                breadFlag: state["initialize"].data.syjmain[0].isbreadpos === 'Y' ? true : false,
                jygs: state["initialize"].jygs,
                sysparaData: state["initialize"].data.syspara,
                uploadData: state["initialize"].data.uploadData,          
            // invoice
                Revipno: state["invoice"].vipno,
                cardNo: state["invoice"].staffCardNo,
                cardType: state["invoice"].staffType,
                consumersCard: state["invoice"].consumersCard,
                consumersType: state["invoice"].consumersType,
                dcData: state['invoice'].dcData || '',  //DC送货信息
                depositSale: state['invoice'].depositSale,
                dzyh: state['invoice'].eleStamp ? state['invoice'].eleStamp : 0,
                memberInfo: state["invoice"].memberInfo,
                popInfo: state["invoice"].popInfo, //整单折扣
                saveStatus: state["invoice"].saveStatus,
                staffNo: state["invoice"].staffNo,
                staffType: state["invoice"].staffType,
                swyh: state['invoice'].sticker ? state['invoice'].sticker : 0, 
            // returnGoods
                cause: state[_sttType].cause,//退货code
                djlb: state[_sttType].orderType,//单据类别
                exceptPaycodes: state[_sttType].payments,
                flow_no: state[_sttType].flow_no,
                fphm: state[_sttType].fphm,
                isDc: state[_sttType].isDc,
                isDiningHall: state[_sttType].isDiningHall,
                isDj: state[_sttType].isDj,
                isHs: state[_sttType].isSd,
                smType: state[_sttType].smType,
                status: state[_sttType].status,
                switchEng: state[_sttType].switchEng,//中false英文true
                uidlist: state[_sttType].uidlist,
                vip_name: state[_sttType].vip ? state[_sttType].vip.name : null,
                vip_no: state[_sttType].vip ? state[_sttType].vip.memberId : null,
                ymdNo: state[_sttType].ymdNo,
                ysyjNo: state[_sttType].ysyjNo,
                yxpNo: state[_sttType].yxpNo,
                ..._defProps
        };
    }
    if (router.state && router.state.type === "eliminatebills") {
        let _sttType = router.state.type;
        return {
            type: router.state.type,
            // initialize
                breadFlag: state["initialize"].data.syjmain[0].isbreadpos === 'Y' ? true : false,
                sysparaData: state["initialize"].data.syspara,
                uploadData: state["initialize"].data.uploadData,
                warn: state["initialize"].data.syjmain[0],
            // invoice
                Revipno: state["invoice"].vipno,
                cardNo: state["invoice"].staffCardNo,
                cardType: state["invoice"].staffType,
                consumersCard: state["invoice"].consumersCard,
                consumersType: state["invoice"].consumersType,
                depositSale: state['invoice'].depositSale,
                dzyh: state['invoice'].eleStamp ? state['invoice'].eleStamp : 0,
                memberInfo: state["invoice"].memberInfo,
                popInfo: state["invoice"].popInfo, //整单折扣
                saveStatus: state["invoice"].saveStatus,
                staffNo: state["invoice"].staffNo,
                staffType: state["invoice"].staffType,
                swyh: state['invoice'].sticker ? state['invoice'].sticker : 0,
            // eliminatebills
                cause: state[_sttType].cause,//退货code
                djlb: state[_sttType].orderType,//单据类别
                exceptPaycodes: state[_sttType].payments,
                flow_no: state[_sttType].flow_no,
                fphm: state[_sttType].fphm,
                isDiningHall: state[_sttType].isDiningHall,
                switchEng: state[_sttType].switchEng,//中false英文true
                uidlist: state[_sttType].uidlist,
                vip_name: state[_sttType].vip ? state[_sttType].vip.name : null,
                vip_no: state[_sttType].vip ? state[_sttType].vip.memberId : null,
                ymdNo: state[_sttType].ymdNo,
                ysyjNo: state[_sttType].ysyjNo,
                yxpNo: state[_sttType].yxpNo,
                ..._defProps
        };
    } else if (router.state && router.state.type === "finalpayment") {
        let _sttType = router.state.type;
        return {
            type: router.state.type,
            // initialize
                breadFlag: state["initialize"].data.syjmain[0].isbreadpos === 'Y' ? true : false,
            // invoice
                dcData: state['invoice'].dcData || '',  //DC送货信息
                depositSale: state['invoice'].depositSale,
            // finalpayment
                cause: state[_sttType].cause,//退货code
                djlb: state[_sttType].djlb,//单据类别
                flow_no: state[_sttType].flow_no,
                fphm: state[_sttType].fphm,
                receiptType: state[_sttType].receiptType,  //有小票或者无小票
                uidlist: state[_sttType].uidlist,
                vip_name: state[_sttType].vip ? state[_sttType].vip.name : null,
                vip_no: state[_sttType].vip ? state[_sttType].vip.vipno : '',                
                ..._defProps
        };
    } else {
        console.log("ms2p: ", state)
        return {
            // initialize
                amcNO: state['initialize'].amcNO,
                breadFlag: state["initialize"].data.syjmain[0].isbreadpos === 'Y' ? true : false,         
                fphm: state['initialize'].fphm,
                pagerNO: state["initialize"].pagerNO,
                pagerType: state["initialize"].PagerType,
                sysparaData: state["initialize"].data.syspara,
                uploadData: state["initialize"].data.uploadData,
            // invoice
                cardNo: state["invoice"].staffCardNo,
                cardType: state["invoice"].staffType,
                consumersCard: state["invoice"].consumersCard,
                consumersType: state["invoice"].consumersType,
                coupon_gain: state["invoice"].coupon_gain || [],  //返券信息  
                curjf: state["invoice"].curjf || '0',   //当前积分
                eleStamp: state['invoice'].eleStamp,
                esystemStatus: state["invoice"].esystemStatus,        
                hasFastPay: state['invoice'].hasFastPay,
                jf: state["invoice"].jf || '0',  //本币获得积分
                memberInfo: state["invoice"].memberInfo,
                outSideGiftsInfo: state["invoice"].outSideGiftsInfo,   //场外换购信息
                popInfo: state["invoice"].popInfo, //整单折扣
                saveStatus: state["invoice"].saveStatus,
                staffNo: state["invoice"].staffNo,
                stamp: state['invoice'].stamp,
                stick: state['invoice'].stick,
                sticker: state['invoice'].sticker,
                dcData: state['invoice'].dcData || '',  //DC送货信息
                depositSale: state['invoice'].depositSale,
            // presale
                addDjlb: state['presale'].octozz,
                cardBin: state['presale'].staffcard.cardBin, //员工购物信用卡
                creditCardNo: state['presale'].staffcard.creditCardNo, //员工购物信用卡
                dcData: state['presale'].dcData,  //DC送货信息
                djlb: state['presale'].isBl == true ? state['presale'].octozz : state['presale'].djlb,//单据类别
                exceptPayData: state['presale'].exceptPayData,
                exceptPaycode: state['presale'].discountPayCode,//优惠支付
                flow_no: state['presale'].flow_no,
                giftList: state['presale'].giftList,  //赠品列表
                isDc: state['presale'].isDc,
                isDiningHall: state['presale'].isDiningHall,
                isBl: state['presale'].isBl,
                isDj: state['presale'].isDj,
                isHs: state['presale'].isSd,
                isJFXH: state['presale'].isJFXH,
                limitedPays: state['presale'].limitedPays,//除外支付
                switchEng: state['presale'].switchEng,//中false英文true
                uidlist: state['presale'].uidlist,
                vip_name: state['presale'].vipInfo ? state['presale'].vipInfo.memberNameChinese : null,
                vip_no: state['presale'].vipInfo ? state['presale'].vipInfo.memberId : null,
                ..._defProps
        };
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        trade: (operators, flow_no, mkt, syjh) => dispatch(trade(operators, flow_no, mkt, syjh)),
        submit: (operators, flow_no, mkt, syjh, uidlist, puidlist, refNo) =>
            dispatch(submit(operators, flow_no, mkt, syjh, uidlist, puidlist, refNo)),
        init: () => dispatch(actions.init()),
        returnInit: () => dispatch(returnactions.init()),
        eliminateInit: () => dispatch(eliminateactions.init()),
        finalpaymentInit: () => dispatch(finalpaymentactions.init()),
        setState: (data) => dispatch(setState(data)),
        update: () => dispatch(updateXPH()),
        updateAMC: () => dispatch(updateAMC()),
        cashierWarn: (promptNum) => dispatch(isWarn(promptNum)),
        returnsubmit: (operators, flow_no, mkt, syjh, uidlist, puidlist) =>
            dispatch(returnsubmit(operators, flow_no, mkt, syjh, uidlist, puidlist)),
        deusubmit: (params) =>
            dispatch(duesubmit(params)),
        print: (printDate) => dispatch(print(printDate)),
        updateHasBackPrint: (params) => dispatch(updateHasBackPrint(params)),
        getBackPrintConfig: (params) => dispatch(getBackPrintConfig(params)),
        handleBackPrint: (params) => dispatch(handleBackPrint(params))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(InvoiceService);
