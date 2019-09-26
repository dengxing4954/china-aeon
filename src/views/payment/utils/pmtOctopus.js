import React, { Component } from 'react';
import { Row, Col, Layout, Icon, Button, Modal } from 'antd';
import { Spin } from "antd/lib/index"
import intl from 'react-intl-universal';
import moment from 'moment'
import message from '@/common/components/message';
import { Fetch } from '@/fetch/'
import Url from '@/config/url.js'
import OctoCountdown from '@/common/components/octoCountdown/index.js';

export function octoClear(sec) {
    if (!!global.octoClearTimer) {
        clearTimeout(global.octoClearTimer);
    }
    console.log("[invoiceService] new octoClearTimer [" + sec + "sec]");
    global.octoClearTimer = setTimeout(() => {
        window["OctopusClear"]({ type: '06' })
    }, sec * 1000);
}


export function octoClearCancel() {
    if (!!global.octoClearTimer) {
        clearTimeout(global.octoClearTimer);
    }
}


export function doOctozzfkDone(isAutoPay){
    let _this = this;    
    this.setState({ octozzfkDone: true }, () => {
        if (isAutoPay && !isAutoPay === true) {
            message(intl.get("INFO_OCTOSWIPE")); //请拍要增值的八达通卡
            setTimeout(() => {
                if (!!_this.state.query && !!_this.state.query && !!_this.state.query.djlb && _this.state.query.djlb === 'Y3') {
                    octocardRecharge(_this, _this.props.zdsjtotal, false, null)
                }
            }, 300);
        } else {
            octocardRecharge.call(_this, _this.props.zdsjtotal, false, null, undefined, undefined, undefined, undefined, isAutoPay)
        }
    });

}


export function octoZzReceipt(command_id, req, doSuccess, dsParams) {
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


//八达通增值写卡
export function octocardRecharge(_total, _isOddChange, _OddChangeState, reHandle, octoRwType, octoRwCardId, octoPollTimes, isAutoPay, afterPayHandle) {
    let _this = this;
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
        this.setState(xstt, () => {
            if (_isOddChange === true) {
                let changePayItem = _this.state.payList.find((item) => {
                    return item.flag === "2";
                });
                if (!!changePayItem) {
                    let payinfo = _this.state.paymode.find((payitem) => {
                        return payitem.code === changePayItem.paycode;
                    });
                    let fphmMax = /(\d*)9999$/;
                    let _fphm = fphmMax.exec(changePayItem.fphm) === null ? (Number(changePayItem.fphm) + 1) : (Number(("" + changePayItem.fphm).replace(fphmMax, "$10000")) + 1);
                    // 找零到八达通自动生成增值订单
                    const req = {
                        command_id: "CHARGEBDT",
                        mkt: _this.props.mkt,                 // 门店号
                        syjh: _this.props.syjh,               // 终端号
                        operators: _this.props.operators,     // 操作员号
                        mktname: _this.props.mktinfo.mktname, // 门店名称
                        ent_id: _this.props.entid,            // 企业ID
                        jygz: _this.props.jygs,               // 经营公司
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
                        octopusDeviceId: !!_this.state.octopusDeviceId ? _this.state.octopusDeviceId.toUpperCase() : "",//八达通设备号
                        octopusCardno: _this.state.octopusCardno,//八达通卡号
                        octopusRechargeTotal: "" + Number(_this.state.octopusRechargeTotal).toFixed(2),
                        octopusBalance: "" + Number(_this.state.octopusBalance).toFixed(2),//八达通余额
                        octopusLastAddValDate: _this.state.octopusLastAddValDate,//最近一次增值日期
                        octopusLastAddValType: _this.props.switchEng === true ? _this.state.octopusLastAddValTypeEn : _this.state.octopusLastAddValType,    //最近一次增值类型
                        // octopusLastAddValTypeEn: _this.state.octopusLastAddValTypeEn,//最近一次增值类型(english)
                        octopusIsSmart: _this.state.octopusIsSmart, //是否智能八达通卡
                        octopusTranscationTime: _this.state.octopusTransDate,
                        octopusRefNo: changePayItem.fphm,
                        flow_no: _this.props.flow_no
                    };
                    Fetch(
                        {
                            url: Url.base_url,
                            type: "POST",
                            data: req
                        }
                    ).then(res => {
                        if (res.retflag == "0") {
                            _this.finalSubmit();
                        }
                    }).catch((error) => {
                        console.error('[' + req.command_id + '] Error:', error);
                    });
                }
            } else {
                // 增值八达通更新八达通相关信息
                const req = {
                    command_id: "REFRESHOCTOPUSINFO",
                    operators: _this.props.operators,     // 操作员号
                    flow_no: _this.props.flow_no,
                    mkt: _this.props.mkt,                 // 门店号
                    syjh: _this.props.syjh,               // 终端号
                    octopusDeviceId: !!_this.state.octopusDeviceId ? _this.state.octopusDeviceId.toUpperCase() : "",//八达通设备号
                    octopusCardno: _this.state.octopusCardno,//八达通卡号
                    octopusRechargeTotal: "" + Number(_this.state.octopusRechargeTotal).toFixed(2),
                    octopusBalance: "" + Number(_this.state.octopusBalance).toFixed(2),//八达通余额
                    octopusLastAddValDate: _this.state.octopusLastAddValDate,//最近一次增值日期
                    octopusLastAddValType: _this.props.switchEng === true ? _this.state.octopusLastAddValTypeEn : _this.state.octopusLastAddValType,    //最近一次增值类型
                    // octopusLastAddValTypeEn: _this.state.octopusLastAddValTypeEn,//最近一次增值类型(english)
                    octopusIsSmart: _this.state.octopusIsSmart, //是否智能八达通卡
                    octopusTranscationTime: _this.state.octopusTransDate
                };
                Fetch(
                    {
                        url: Url.base_url,
                        type: "POST",
                        data: req
                    }
                ).then(res => {
                    if (res.retflag == "0") {
                        _this.finalSubmit();
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
    octoClearCancel();
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
        if (!!_this.state.query && !!_this.state.query && !!_this.state.query.djlb && _this.state.query.djlb === 'Y3') {
            // 增值八达通成功后，回到支付页（待付款完成后返回销售页）
            _this.finalSubmit();
        } else {
            // 找零到八达通成功后，即刻提交并返回销售页
            _this.finalSubmit(_req);
        }
    };
    if (pollRes.success === true) {
        octoClear(10);
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
        this.setState(stt, () => {
            if (_isOddChange === true) {
                let changePayItem = _this.state.payList.find((item) => {
                    return item.flag === "2";
                });
                if (!!changePayItem) {
                    let payinfo = _this.state.paymode.find((payitem) => {
                        return payitem.code === changePayItem.paycode;
                    });
                    let fphmMax = /(\d*)9999$/;
                    let _fphm = fphmMax.exec(changePayItem.fphm) === null ? (Number(changePayItem.fphm) + 1) : (Number(("" + changePayItem.fphm).replace(fphmMax, "$10000")) + 1);
                    // 找零到八达通自动生成增值订单
                    const req = {
                        command_id: "CHARGEBDT",
                        mkt: _this.props.mkt,                 // 门店号
                        syjh: _this.props.syjh,               // 终端号
                        operators: _this.props.operators,     // 操作员号
                        mktname: _this.props.mktinfo.mktname, // 门店名称
                        ent_id: _this.props.entid,            // 企业ID
                        jygz: _this.props.jygs,               // 经营公司
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
                    operators: _this.props.operators,     // 操作员号
                    flow_no: _this.props.flow_no,
                    mkt: _this.props.mkt,                 // 门店号
                    syjh: _this.props.syjh,               // 终端号
                    octopusDeviceId: !!_this.state.octopusDeviceId ? _this.state.octopusDeviceId.toUpperCase() : "",//八达通设备号
                    octopusCardno: _this.state.octopusCardno,//八达通卡号
                    octopusRechargeTotal: "" + Number(_this.state.octopusRechargeTotal).toFixed(2),//八达通卡号
                    octopusBalance: "" + Number(_this.state.octopusBalance).toFixed(2),//八达通余额
                    octopusLastAddValDate: _this.state.octopusLastAddValDate,//最近一次增值日期
                    octopusLastAddValType: _this.props.switchEng === true ? _this.state.octopusLastAddValTypeEn : _this.state.octopusLastAddValType,    //最近一次增值类型
                    // octopusLastAddValTypeEn: _this.state.octopusLastAddValTypeEn,//最近一次增值类型(english)
                    octopusIsSmart: _this.state.octopusIsSmart, //是否智能八达通卡
                    octopusTranscationTime: _this.state.octopusTransDate
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
                                    _this.octocardRecharge(_total, _isOddChange, _OddChangeState, reHandle, "08", pollRes.object.cardID, 200);
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
                                    _this.octocardRecharge(_this.props.zdsjtotal, false, null, undefined, "08", pollRes.object.cardID, 200);
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
                                    _this.octocardRecharge(_total, _isOddChange, _OddChangeState, reHandle, "08", pollRes.object.cardID, 200);
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
                                    _this.octocardRecharge(_this.props.zdsjtotal, false, null, undefined, "08", pollRes.object.cardID, 200);
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
                                _this.octocardRecharge(_total, _isOddChange, _OddChangeState, reHandle, "08", pollRes.object.cardID, pollRes.object.retryMsg.pollTimes);
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
                                _this.octocardRecharge(_this.props.zdsjtotal, false, null, undefined, "08", pollRes.object.cardID, pollRes.object.retryMsg.pollTimes);
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
                                octocardRecharge(_total, _isOddChange, _OddChangeState, reHandle, "08", pollRes.object.cardID, 50);
                            }, 100);
                            _modal.destroy();
                        },
                        onCancel() {
                            _this.setState({ octopusRetrying: false }, () => {
                                if (pollRes.code !== "100001") {
                                    octoClear(10);
                                }
                                afterPayHandle(reHandle.isPaySuccessed, reHandle.res, reHandle.errMsg, false, undefined, undefined, undefined, undefined, afterPayHandle);
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
                                    octocardRecharge(_total, _isOddChange, _OddChangeState, reHandle, "08", pollRes.object.cardID, pollRes.object.retryMsg.pollTimes);
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
                                octocardRecharge(_total, _isOddChange, _OddChangeState, reHandle);
                            }, 100);
                            _modal.destroy();
                        },
                        onCancel() {
                            _this.setState({ octopusRetrying: false }, () => {
                                if (pollRes.code !== "100001") {
                                    _this.octoClear(10);
                                }
                                afterPayHandle(reHandle.isPaySuccessed, reHandle.res, reHandle.errMsg, false, undefined, undefined, undefined, undefined, afterPayHandle);
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
                            _this.setState({ octopusRetrying: false }, () => {
                                if (pollRes.code !== "100001") {
                                    _this.octoClear(10);
                                }
                                afterPayHandle(reHandle.isPaySuccessed, reHandle.res, reHandle.errMsg, false);
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
                                octocardRecharge(_this.props.zdsjtotal, false, null, undefined, "08", pollRes.object.cardID, 50);
                            }, 100);
                            _modal.destroy();
                        },
                        onCancel() {
                            _this.setState({ octopusRetrying: false }, () => {
                                if (pollRes.code !== "100001") {
                                    octoClear(10);
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
                                    octocardRecharge(_this.props.zdsjtotal, false, null, undefined, "08", pollRes.object.cardID, pollRes.object.retryMsg.pollTimes);
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
                                octocardRecharge(_this.props.zdsjtotal, false, null);
                            }, 100);
                            _modal.destroy();
                        },
                        onCancel() {
                            _this.setState({ octopusRetrying: false }, () => {
                                if (pollRes.code !== "100001") {
                                    octoClear(10);
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
                            _this.setState({ octopusRetrying: false }, () => {
                                if (pollRes.code !== "100001") {
                                    octoClear(10);
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
export function octoddRecord(rec) {
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
export function octozzUnDoneFilter() {
    let _this = this;
    if (!!this.state.query && !!this.state.query && !!this.state.query.djlb
        && this.state.query.djlb === 'Y3'
        && this.state.query.isBl != "true"
        && (this.state.octozzfkDone === true && this.state.octozzDone === false)) {
        message(intl.get("INFO_ADDVALNOTDONE")); //八达通增值未完成，请拍卡
        setTimeout(() => {
            _this.octocardRecharge(_this.props.zdsjtotal, false, null)
        }, 300);
        return false;
    } else {
        return true;
    }
}


//八达通已付款未写卡取消拦截
export function octozzDoneFilter() {
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



