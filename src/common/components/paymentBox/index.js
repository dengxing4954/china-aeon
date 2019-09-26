import React, { Component } from 'react'
import moment from 'moment'
import Cash from './views/Cash'
import Bank from './views/Bank'
import SvCard from './views/SvCard'
import StoreValueCard from './views/StoreValueCard'
import { Spin, Modal } from 'antd'
import { Fetch } from '@/fetch/'
import Url from '@/config/url.js'
import calculate from '../../../common/calculate'
import message from '@/common/components/message'
import { hidePayDialog, afterPayHandle } from '../../../views/payment/utils'

let isFetching = false;
let payACS, payImpowerCode, paySCB, payMahatan, payMZcoupons, payDircoupons, payWZF;
class ShowPaybox extends Component {
    SalesMeomoAdd = (extra, expressNumber) => {
        const { operators, flow_no, mkt, syjh } = extra;
        let req = {
            command_id: "REFRESHDELIVERYINFO",
            operators, //操作员号
            flow_no,
            mkt,
            syjh, //终端号
            logisticsMode: 0,
            expressNumber
        };
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then(res => {
            if (res.retflag === "0") {
            } else {
                message(res.retmsg)
            }
        }).catch((error) => {
            throw new Error(error);
        });
    }

    /** 支付modal完成 */
    paySubmit = () => {
        let {payModeData} = this.props;
        let {refModal} = payModeData;
        this.refs[refModal].onOk();
    }

    /** 银行卡发送日志 */
    sendBankLog(params) {  
        let {extra} = this;
        const  req = {
            command_id: "SENDBANKLOG",
            erpCode: extra.erpCode,
            mkt: extra.mkt,
            syjh: extra.syjh,
            fphm: extra.fphm,
            ...params
        };
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req,
                fetchFlag:true
            }
        ).then(res => {
            if ("0" === res.retflag) {
                return res;
            } else {
                message(res.retmsg);
            }
        }).catch((error) => {
            console.error('error', error);
            // throw new Error(error);
        });
 }

    /** 生成支付行 */
    doPayment = (params) => {
        if (isFetching) {
            return;
        }
        let {payModeData, extra} = this.props;
        isFetching = true;
        //单品计算促销
        const req = {
            command_id: "PAYCERTIFY",
            authCode: this.state.referenceNumber,//授权编码
            batchno: this.state.exDate || '',//有效时间
            couponBalance: this.state.octopusBalance, //八达通余额
            flag: this.props.flag ? this.props.flag : '0',//是否立即支付 默认为0    1 除外付款方式
            flowNo: extra.flowNo,//当前流水号
            rate: payModeData.pyhl,//汇率
            isOverage: payModeData.isyy,//是否溢余
            isAllowCharge: payModeData.iszl,//是否找零
            maxVal: payModeData.maxval,//最大成交金额
            merchantid: this.state.realMerchantid || '',//机构号
            minVal: payModeData.minval,//最小成交金额
            shopCode: extra.mkt,//门店号
            terminalOperator: extra.operators,//操作员号
            payCode: payModeData.code,//付款方式代码
            payNo: params.payNo || '',//付款卡号（储值卡卡号或微信交易单号）
            payName: payModeData.cardPayType !== "a" ? payModeData.name : payModeData.paysimplecode,
            payno: '', //八达通卡号
            payType: payModeData.paytype,//paytype
            payyhje: '',//支付渠道优惠金额
            misReferenceNo: params.ReferNo || '',//银行卡交易参考号
            misTerminalId: params.TerminalId || '', //银行卡终端号
            scene: extra.scene,//0普通， 1除外
            shyhje: '',//商户优惠金额
            cutMode: payModeData.sswrfs,//四舍五入方式
            precision: payModeData.sswrjd,//四舍五入精度
            terminalNo: extra.syjh,//终端号
            terminalid: null, //终端号
            money: params.bbje,//付款金额本币
            totalfrac: 0,//收银损益
            trace: null,//银联流水号
            amount: params.cash,//原币金额
            yhje: '',//优惠金额
            chargeRate: payModeData.pyhl,//找零汇率
        };
        if (params.flag && this.props.extra.type === "2") { 
            req.flag = params.flag
        }
        if (payModeData.virtualPayType === 3 && payModeData.cardPayType === "0" || payModeData.cardPayType === "1") {
            req.needHidePayNo = "Y"
        }
        console.log("doPayment--> ", req)
        this.onHidePay();
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req,
                fetchFlag: true
            }
        ).then(res => {
            console.log("doPayment==x ", res, this, this.props._paymentBox)
            isFetching = false;
            if (res.returncode === "0") {
                    // this.props.onAfterPay(true, res, null, null);
                    afterPayHandle.call(this.props._paymentBox, {res: res.data.order});
            } else {
                message(res.data)
            }
        }).catch((error) => {
            console.error('error', error);
            throw new Error(error);
        }).then(res => {
            this.setState({
                payid: '',             //付款卡号（储值卡卡号或微信交易单号）
                traceNumber: '',       //银联流水号
                merchantid: '',        //机构号
                realMerchantid: '',    //机构号
                exDate: '',            //有效时间
                referenceNumber: '',   //银行卡交易参考号
                octopusDeviceId: '',   //终端号
                octopusCardno: ''      //八达通卡号
            });
        })
    }

    /** 中百储值卡支付 撤销 退货 */
    storeValuePay = (type, params) => {
        let {payModeData, extra} = this.props;
        let command_id;
        //商户号+门店号+款台号+YYYYMMDDHH24MISS+2位流水号
        let orderNo = extra.erpCode + extra.mkt + extra.syjh + moment().format('YYYYMMDDHHmmss') + extra.fphm.substr(-2);   
        switch (type) {
            case 'sale':
                command_id = 'ZBMZKPAY';
            break;
            case 'cancel':
            command_id = 'ZBMZKCANCEL';
            break;
            case 'return':
            command_id = 'ZBMZKREFUND';
            break;
        }
        const req = {
            command_id,
            shopCode: extra.mkt,//门店号
            // terminalNo: extra.syjh,//终端号
            orderNo: type === 'sale' ? orderNo : null,
            terminalNo: '94100101',
            terminalOperator: extra.operators,//操作员号
            flowNo: extra.flowNo,//当前流水号
            invno: extra.fphm,//小票号
            cardNo: params.cardNo,//储值卡卡号
            passwd: params.passwd,//储值卡密码
            amount: params.cash,//原币金额
            cutMode: payModeData.sswrfs,//四舍五入方式
            precision: payModeData.sswrjd,//四舍五入精度
            payCode: payModeData.code,//付款方式代码
            payName: payModeData.cardPayType !== "a" ? payModeData.name : payModeData.paysimplecode,
            rate: payModeData.pyhl,//汇率
            isOverage: payModeData.isyy,//是否溢余
            isAllowCharge: payModeData.iszl,//是否找零
        };
        this.onHidePay();
        if (type === 'sale') {
            let storeValueReq = {...req};
            storeValueReq.command_id = 'ZBMZKRESERVE';
            window.StoreValueLog({url: Url.base_url, params: storeValueReq});
        }
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req,
                fetchFlag: true
            }
        ).then(res => {
            let {data, returncode} = res;
            if ("0" === returncode) {
                afterPayHandle.call(this.props._paymentBox, {res: res.data.order});
            } else {
                message(data);
            }
        })
    }

    //银行卡交易接口
    PaymentBankFunc = (total, payModeData, extra, isonline, approvelCode, cardId, yxDate, callback) => {
        window["Log"](isonline ? "offline" : "online");
        console.log('bankclick second')

        //todo 启动加载框
        this.setState({ isLoading: true })

        const bankConnectTest = (req, time) => {
            let _time = new Date().getTime();
            let reqData = window["PaymentBank"](JSON.stringify(req));
            if (reqData.code == 'BB' && !reqData.success && _time - time <= 5000) {
                return bankConnectTest(req, _time);
            }
            return reqData
        }

        //补录状态
        if (1 === isonline) {
            let offPayModeData = { ...payModeData }
            if (offPayModeData.cardPayType === "a") {
                offPayModeData.name = 'CUP';
            } else if (offPayModeData.cardPayType === "0") {
                if (cardId.length == 16 && cardId.slice(0, 1) === "3" && cardId.slice(0, 8) !== "35687004" && cardId.slice(0, 8) !== "35687101") {
                    offPayModeData.name = 'JCB';
                } else if (cardId.length == 15 && cardId.slice(0, 1) === "3" && cardId.slice(0, 7) !== "3771001" && cardId.slice(0, 8) !== "37710100") {
                    offPayModeData.name = 'AMEX';
                } else if (cardId.length == 14 && cardId.slice(0, 1) === "3") {
                    offPayModeData.name = 'DINERS';
                } else if ((cardId.length == 16 || cardId.length == 13 || cardId.length == 19) && cardId.slice(0, 1) === "4" && cardId.slice(0, 8) !== "47055801" && cardId.slice(0, 8) !== "45040501" && cardId.slice(0, 8) !== "40433828" && cardId.slice(0, 4) !== "6410") {
                    offPayModeData.name = 'VISA';
                } else if ((cardId.length == 16 && cardId.slice(0, 8) === "52009828") || (cardId.length == 16 && cardId.slice(0, 8) === "55931802")) {
                    offPayModeData.name = 'JUSCO_MC';
                } else if ((cardId.length == 15 && cardId.slice(0, 7) === "3771001") || (cardId.length == 16 && cardId.slice(0, 8) === "40433828") || (cardId.length == 15 && cardId.slice(0, 8) === "37710100")) {
                    offPayModeData.name = 'JSAMEX';
                } else if ((cardId.length == 16 && cardId.slice(0, 8) === "62249301") || (cardId.length == 16 && cardId.slice(0, 8) === "62249302")) {
                    offPayModeData.name = 'AEON_CUP';
                } else if ((cardId.length == 16 && cardId.slice(0, 8) === "35687004") || (cardId.length == 16 && cardId.slice(0, 8) === "35687101")) {
                    offPayModeData.name = 'AEON_JCB';
                } else if (cardId.length == 16 && cardId.slice(0, 4) === "6410") {
                    offPayModeData.name = 'AEON_CARD';
                } else if ((cardId.length == 16 && cardId.slice(0, 1) === "5") || (cardId.length == 19 && cardId.slice(0, 1) === "5") || (cardId.length == 16 && cardId.slice(0, 1) === "2")) {
                    offPayModeData.name = 'MASTERCARD';
                } else if (cardId.length == 16 && (cardId.slice(0, 8) === "47055801" || cardId.slice(0, 8) === "45040501")) {
                    offPayModeData.name = 'JUSCO_VISA';
                }
            }

            if (payModeData.cardPayType !== "5") {
                this.setState(
                    {
                        exDate: yxDate,
                        octopusCardno: cardId,
                        referenceNumber: approvelCode,
                        isLoading: false
                    }, () =>
                        this.doPayment(total, offPayModeData, extra, total)
                )
                return;
            } else {
                this.setState(
                    {
                        octopusDeviceId: yxDate,
                        octopusCardno: cardId,
                        referenceNumber: approvelCode,
                        isLoading: false
                    }, () =>
                        this.doPayment(total, offPayModeData, extra, total)
                )
                return;
            }
        }

        //根据单据类别转换请求参数
        let lsType = "";// 创建退货、消单临时判断字段
        if (extra.type === "4") {
            switch (payModeData.cardPayType) {
                case "0":  //EDC消费切换成退货
                    lsType = "2";
                    // payModeData.cardPayType = "2";
                    break;
                case "a":  //CUP消费切换成退货
                    lsType = "l";
                    // payModeData.cardPayType = "l";
                    break;
                default: 
                    break;
            }
        }
        else if (extra.type === "2") {
            switch (payModeData.cardPayType) {
                case "0":  //EDC消费切换成撤销
                    lsType = "3";
                    // payModeData.cardPayType = "3";
                    break;
                case "a":  //CUP消费切换成撤销
                    lsType = "d";
                    // payModeData.cardPayType = "d";
                    break;
                default: 
                    break;
            }
        }

        console.log("银行卡支付类型" + payModeData.cardPayType)
        let reqData;
        //信用卡消费、撤销，银联消费、退货，EPS消费交易
        if ((null != payModeData.cardPayType && "2" !== extra.type) && ("0" === payModeData.cardPayType || "5" === payModeData.cardPayType
            || "8" === payModeData.cardPayType || "a" === payModeData.cardPayType)) {
            console.log('bankclick third')
            // let data = {command: "0ECR_REFERENCE_NO000000200000000000000000"}
            var myDate = new Date();
            let mytime = myDate.getTime();
            let rand = "";
            //生成三位随机数
            for (let i = 0; i < 3; i++) {
                var r = Math.floor(Math.random() * 10);
                rand += r;
            }
            let money = calculate.padLeft(calculate.doubleConvert(total * 100, 2, 1) + "", 12, '0')
            let tipsMoney = calculate.padLeft('', 12, '0')

            if ("l" === lsType)//如果为银联退货需要添加6位密码，默认值为0
                tipsMoney = calculate.padLeft('', 18, '0')
            let req = '';
            //旧规则
            let referenceNumber = '0' + extra.mkt + '0' + extra.syjh + extra.fphm + '0' + extra.syjh;
            // if("5" === payModeData.cardPayType)
            if ("l" === lsType || "2" === lsType) {
                //新规则
                // if ("2" === lsType) {
                //     referenceNumber = '0' + extra.mkt + '/' + extra.syjh + '/' + extra.syjh + extra.fphm;
                // }
                //req = { command: lsType + '0' + extra.mkt + '0' + extra.syjh + extra.fphm + '0' + extra.syjh + money + tipsMoney }
                req = { command: lsType + referenceNumber + money + tipsMoney }
            }
            else {
                //新规则
                // if (payModeData.cardPayType == '0') {
                //     referenceNumber = '0' + extra.mkt + '/' + extra.syjh + '/' + extra.syjh + extra.fphm;
                // }
                //req = { command: payModeData.cardPayType + '0' + extra.mkt + '0' + extra.syjh + extra.fphm + '0' + extra.syjh + money + tipsMoney }
                req = { command: payModeData.cardPayType + referenceNumber + money + tipsMoney }
            }
            reqData = window["PaymentBank"](JSON.stringify(req));
        }
        else if (lsType && "3" === lsType) {
            let passwd = calculate.padLeft('', 6, '0')
            approvelCode = calculate.padLeft(approvelCode, 6, '0')
            let req = { command: lsType + approvelCode + passwd }
            reqData = bankConnectTest(req, new Date().getTime());
        }
        else if (lsType && "d" === lsType) {
            let passwd = calculate.padLeft('', 6, '0')
            let tranType = 'a';
            approvelCode = calculate.padLeft(approvelCode, 6, '0')
            let req = { command: lsType + approvelCode + passwd + tranType }
            reqData = window["PaymentBank"](JSON.stringify(req));
        }
        if (reqData && reqData.success) {
            let newPayModeData = { ...payModeData }
            if (null != reqData.object.cardType && "" != reqData.object.cardType)
                newPayModeData.name = reqData.object.cardType;
            let payNumber = reqData.object.cardNumber//交易卡号

            this.setState({
                traceNumber: reqData.object.traceNumber,//流水号
                referenceNumber: reqData.object.approvalCode,//订单号
                exDate: reqData.object.expirationDate,//有效期
                // payid: reqData.object.cardNumber,//交易卡号
                merchantid: reqData.object.entryMode,//刷卡类型
                octopusDeviceId: reqData.object.terminalNumber,//终端设备号
                octopusCardno: reqData.object.cardNumber,
                realMerchantid: reqData.object.merchantNumber,
            }, () => {
                this.doPayment(total, newPayModeData, extra, total).then(() => {
                    callback && callback();
                });
            })
        } else {
            let info = {
                title: "注意",
                okText: "確定",
                content: ""
            }
            if (reqData && reqData.message) {
                info.content = reqData.message;
            } else {
                info.content = '銀行支付失敗';
            }
            Modal.error(info);
        }
        this.setState({ isLoading: false })
    }

    //查询会员
    vip = (consumers_id, payModeData, extra) => {
        const req = {
            command_id: "VIPCERTIFY",
            operators: extra.operators,
            flow_no: extra.flow_no,
            vipno: consumers_id,
            certifytype: 'ERP',
            mkt: extra.mkt,
            syjh: extra.syjh,
            idtype: '1', //会员ID类型 1-卡号 2-手机号 A-磁道 B-二维码 C-CID
            channel: 'javapos',
            authScene: 'CONSUME',//登录场景 普通验证PLACEORDER 券 CONSUME 积分 CONSUMEBYCOUPON
        };
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then((res) => {
            const { retflag, retmsg } = res;
            if ("0" === retflag) {
                if (payModeData.name.indexOf("电子") !== -1) {
                    this.searchStock(res.vipid, payModeData, extra)
                } else {
                    message("會員登錄成功！")
                    return res;
                }
            } else {
                message(retmsg)
            }
        }).catch((error) => {
            console.error('error', error);
        });
    }

    //电子劵查询
    searchStock = (consumers_id, payModeData, extra) => {
        const req = {
            command_id: "COUPONCERTIFY",
            operators: extra.operators,//操作员号
            flow_no: extra.flow_no,//当前流水号
            syjh: extra.syjh,//终端号
            fphm: extra.fphm,//小票号
            mkt: extra.mkt,//门店号
            paycode: payModeData.code,//付款代码
            consumers_id: consumers_id,//会员号
            coupon_group: '02',//只查询指定类型(01-积分账号/02-券账户/03-余额账户)的可用余额 （余额账户即电子钱包）,为空时返回所有账户
            scene: extra.scene,//0-普通 1-除外 3-扣回
            distinct: 'N',//是否合并展示
            channel: "javaPos"//营销渠道
        };
        console.log(req)
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then(res => {
            if ("0" === res.retflag) {
                this.setState({
                    couponlist: [...res.couponlist]
                })
                console.log(this.state.couponlist)
            } else {
                message(res.retmsg)
            }
        }).catch((error) => {
            console.error('error', error);
            throw new Error(error);
        });
    }

    //劵核销
    payStock = (total, stock, consumers_id, payModeData, extra) => {
        const req = {
            command_id: "COUPONSALECERTIFY",
            operators: extra.operators,//操作员号
            mkt: extra.mkt,//门店号
            syjh: extra.syjh,//终端号收银机号
            flow_no: extra.flow_no,//当前流水号
            type: '1',//交易类型
            seqno: extra.flow_no,//交易流水号，保证唯一性
            fphm: extra.fphm,//小票号
            invdjlb: '1',//小票交易类型
            sellpayment: [{//                              付款方式
                payname: payModeData.name,//               付款名称
                coptype: stock.coupon_type,//                            付款劵种
                coupon_is_cash: stock.coupon_is_cash,//                     现金券标记(填入支付行)
                coupon_event_scd: stock.coupon_event_scd,//                用券档期
                coupon_event_id: '5',//                    用券活动id
                coupon_policy_id: stock.coupon_policy_id,//                   用券策略id
                payno: '625947412525563',//                付款卡号
                paycode: payModeData.code,
                hl: payModeData.pyhl,//                      汇率
                consumers_id,//                            会员id
                coupon_mutex_arr: stock.coupon_mutex,//                  券互斥规则
                coupon_group: extra.coupon_group,//                       券账户分组
                kye: extra.balance,//                               余额
                ybje: total,//原币金额
                total,//付款金额
            }],
            scene: extra.scene//0-普通 1-除外 3- 扣回
        };
        console.log(req)
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then(res => {
            if ("0" === res.retflag) {
                // this.props.onAfterPay(true, res, null);
                hidePayDialog.call(this, true, res, null);
                if (res.remainje === 0) {
                    this.onHidePay();
                } else if (consumers_id) {
                    this.vip(consumers_id, payModeData, extra);
                }
            } else {
                message(res.retmsg)
            }
        }).catch((error) => {
            console.error('error', error);
            throw new Error(error);
        });
    }

    //使用印花券手工券
    yhStock = (payModeData, extra, stockId, consumersobj) => {
        const req = {
            command_id: "PRINTCODECERTIFY",
            operators: extra.operators,//操作员号
            mkt: extra.mkt,//门店号
            syjh: extra.syjh,//终端号收银机号
            flow_no: extra.flow_no,//当前流水号
            discountCode: stockId, //印花码
            consumers_id: "",
            consumers_type: consumersobj ? consumersobj.viptype : "",
            consumers_trgs: "",
            consumers_cardno: consumersobj ? consumersobj.vipno : "",
            paycode: payModeData.code,
            scene: extra.scene//0普通， 1除外
        };
        console.log(req)
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then(res => {
            if ("0" === res.retflag) {
                this.onHidePay();
                this.props.afterZKpay();
            } else {
                message(res.retmsg)
            }
        }).catch((error) => {
            console.error('error', error);
            throw new Error(error);
        });
    }

    //折扣券
    zkStock = (payModeData, extra, stockId) => {
        const req = {
            command_id: "QUERYAEONOLDCOUPON",//
            couponCode: stockId, //券号
            operators: extra.operators,//操作员号
            mkt: extra.mkt,//门店号
            syjh: extra.syjh,//终端号收银机号
            flow_no: extra.flow_no,//当前流水号
            scene: extra.scene,//0普通， 1除外
            paycode: payModeData.code,
        };
        console.log(req)
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then(res => {
            console.log(res)
            if ("0" === res.retflag) {
                this.onHidePay();
                this.props.afterZKpay();
            } else {
                message(res.retmsg)
            }
        }).catch((error) => {
            console.error('error', error);
            throw new Error(error);
        });
    }

    //面值券（取不到折扣率请手动输入）   在用券支付（其他未用）
    mzStock = (payModeData, extra, stockId, total) => {
        const req = {
            command_id: "QUERYAEONOLDAMOUNTCOUPON",//
            couponCode: stockId, //券号
            operators: extra.operators,//操作员号
            mkt: extra.mkt,//门店号
            syjh: extra.syjh,//终端号收银机号
            flow_no: extra.flow_no,//当前流水号
            scene: extra.scene,//0普通， 1除外
            paycode: payModeData.code,
            payname: payModeData.name,
            amount: total ? total : 0,
            iszl: payModeData.iszl,//是否找零
            minval: payModeData.minval,//最小成交金额
            maxval: payModeData.maxval,//最大成交金额
            isyy: payModeData.isyy//是否溢余
        };
        console.log(req)
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then(res => {
            console.log(res)
            if (res && "0" === res.retflag) {
                this.onHidePay();
                this.setState({
                    isMZValue: false
                })
                // this.props.onAfterPay(true, res, null);
                hidePayDialog.call(this, true, res, null);
            } else {
                if (res.retflag === "3000" && res.retmsg) {
                    message(res.retmsg)
                    this.setState({
                        isMZValue: true
                    })
                } else if (res.retmsg) {
                    message(res.retmsg)
                } else {
                    message('券查詢失敗')
                }
            }
        }).catch((error) => {
            console.error('error', error);
            throw new Error(error);
        });
    }

    //融合支付
    payAllv = (res) => {
        console.log(res)
        isFetching = false;
        if (res.retflag === "0") {
            // this.props.onAfterPay(true, res, null);
            hidePayDialog.call(this, true, res, null);
        } else {
            message(res.retmsg)
        }
    }

    //八达通消费
    payOctopus = (total, payModeData, extra) => {
        this.doPayment(total, payModeData, extra, total);
    }

    //ACS支付
    payACS = (cardId, total, fqtime, memoNum, ExpiryDate, posEntryMode, trackData, payModeData, extra, refCode) => {
        let count = 30
        let timer = setInterval(() => {
            if (count > 0) {
                count = count - 1;
                this.setState({
                    tishitext: "分期處理中" + count + "秒，請稍等"
                })
            }
        }, 1000)
        let fqTime = Number(fqtime);
        const req = {
            command_id: "AEONACSPAY",
            operators: extra.operators,//操作员号
            mkt: extra.mkt,//门店号
            scene: extra.scene,//0普通， 1除外
            syjh: extra.syjh,//终端号
            flow_no: extra.flow_no,//当前流水号
            paycode: payModeData.code,//付款方式代码
            messageType: this.props.extra.type === "1" ? "10" : "20",//通信类型，销售10，消单20
            payno: cardId,//付款卡号；ACS卡号
            ybje: total,//原币金额
            hl: payModeData.pyhl,//汇率
            zlhl: payModeData.pyhl,//找零汇率
            total: total,//付款金额本币
            totalfrac: 0,//收银损益
            paytype: payModeData.virtualPayType,//paytype
            expiryDate: ExpiryDate,
            installmentTerms: fqTime,
            firstInstallmentAmount: 0,
            posEntryMode: posEntryMode,
            deliveryMemoNumber: memoNum,
            trackData: trackData,//***********************************磁卡轨道号 必传只能是37位,,,刷卡获取
            flag: "1",//是否立即支付
            iszl: payModeData.iszl,//是否找零
            isyy: payModeData.isyy,//是否溢余
            minval: payModeData.minval,//最小成交金额
            maxval: payModeData.maxval,//最大成交金额
            sswrfs: payModeData.sswrfs,//
            sswrjd: payModeData.sswrjd,//四舍五入精度
            payname: payModeData.name,
            authCode: "",//**********************授权码
            description: "",//***********************描述
            additionalData: "",//***************其它数据               //CashRegisterID: "",应该就是取收银机号后三位
        };
        if (refCode) {
            req.refCode = refCode
        }
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then(res => {
            console.log(res)
            clearInterval(timer);
            this.setState({
                tishitext: ""
            })
            isFetching = false;
            if (res.retflag === "0") {
                //'分期批核编号' + batchNo
                this.props.onHidePay();
                let _this = this
                let batchNo = "";
                res.salePayments.map((item) => {
                    if (item.paycode == payACS) {
                        batchNo = item.batchNo;
                        return;
                    }
                })
                if (this.props.extra.type === "1") {
                    Modal.success({
                        className: 'vla-confirm',
                        title: '分期批核編號' + batchNo,
                        content: '',
                        onOk() {
                            if (_this.props.extra.expressNumber !== memoNum) {
                                _this.SalesMeomoAdd(extra, memoNum).then(() => {
                                    // _this.props.onAfterPay(true, res, null);
                                    hidePayDialog.call(this, true, res, null);
                                });
                            } else {
                                // _this.props.onAfterPay(true, res, null);
                                hidePayDialog.call(this, true, res, null);
                            }
                        }
                    })
                } else {
                    this.SalesMeomoAdd(extra, memoNum).then(() => {
                        // this.props.onAfterPay(true, res, null);
                        hidePayDialog.call(this, true, res, null);
                    });
                }
            } else {
                message(res.retmsg)
            }
        }).catch((error) => {
            clearInterval(timer);
            this.setState({
                tishitext: ""
            })
            console.error('error', error);
            throw new Error(error);
        });
    }

    //授权编码交易接口
    PaymentBankSQBM = (total, payModeData, extra, approvelCode) => {
        //todo 启动加载框
        let lsType = "1";// 创建退货、消单临时判断字段
        if (extra.type === "4") {
            lsType = "2";
        } else if (extra.type === "2") {
            lsType = "3";
        }
        this.setState({ isLoading: true })
        let reqData;
        var myDate = new Date();
        let mytime = myDate.getTime();
        let rand = "";
        for (let i = 0; i < 3; i++) {
            var r = Math.floor(Math.random() * 10);
            rand += r;
        }
        let money = calculate.padLeft(calculate.doubleConvert(total * 100, 2, 1) + "", 12, '0')
        let tipsMoney = calculate.padLeft('', 12, '0')
        if ("l" === payModeData.cardPayType)//如果为银联退货需要添加6位密码，默认值为0
            tipsMoney = calculate.padLeft('', 18, '0')
        let req = { command: lsType + mytime + rand + money + tipsMoney + approvelCode }
        // let referenceNumber = '0' + extra.mkt + '/' + extra.syjh + '/' + extra.syjh + extra.fphm;
        // let req = { command: lsType + referenceNumber + money + tipsMoney + approvelCode }
        reqData = window["PaymentBank"](JSON.stringify(req));
        console.log(reqData);
        if (!!reqData && reqData.success) {
            if (null != reqData.object.cardType && "" != reqData.object.cardType)
                payModeData.name = reqData.object.cardType;
            this.setState(
                {
                    traceNumber: reqData.object.traceNumber,//流水号
                    referenceNumber: reqData.object.approvalCode,//订单号
                    exDate: reqData.object.expirationDate,//有效期
                    octopusCardno: reqData.object.cardNumber,//交易卡号
                    merchantid: reqData.object.entryMode,//刷卡类型
                    octopusDeviceId: reqData.object.terminalNumber,//终端设备号,
                    realMerchantid: reqData.object.merchantNumber,
                }, () =>
                    this.doPayment(total, payModeData, extra, total)
            )
        }
        else {
            if (reqData && reqData.message) {
                message(reqData.message);
            } else {
                message('銀行支付失敗');
            }
        }
        this.setState({ isLoading: false })
    }

    //券平台消单
    zbRevoke = (params) => {
        
        // return this.zbRevoke(ybje, mode, this.props.extra, total, obj.flag);
        console.log("zbRevoke: ", params, this.props, this.state)
        if (isFetching) {
            return;
        }
        let {payModeData, extra} = this.props;
        isFetching = true;
        //单品计算促销
        const req = {
            command_id: "ZHONGBAIREVOKE",
            shopCode: extra.mkt,         //门店号
            terminalNo: extra.syjh, //终端号收银机号
            terminalOperator: extra.operators,     //操作员号
            flowNo: extra.flowNo, //当前流水号
            voidType: "1",
            idSheetNo: extra.fphm,
            // orderNo: extra.erpCode + extra.mkt + extra.syjh + moment().format('YYYYMMDDHHmmss') + extra.fphm.substr(-2)   //商户号+门店号+款台号+YYYYMMDDHH24MISS+2位流水号
            orderNo: params.refCode,
            orgPayType: params.payType,
            orgPayCode: params.payCode,
            orgPayName: params.payName,
            orgAmount: params.amount,
            orgMoney: params.money,
            orgRate: params.rate,
            // orgCutMode: 
            // orgPrecision: 





        };
        if (params.flag && this.props.extra.type === "2") { 
            req.flag = params.flag
        }
        // if (payModeData.virtualPayType === 3 && payModeData.cardPayType === "0" || payModeData.cardPayType === "1") {
        //     req.needHidePayNo = "Y"
        // }
        console.log("doPayment--> ", req)
        this.onHidePay();
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req,
                fetchFlag: true
            }
        ).then(res => {
            console.log("doPayment==x ", res, this, this.props._paymentBox)
            isFetching = false;
            if (res.returncode === "0") {
                    // this.props.onAfterPay(true, res, null, null);
                    afterPayHandle.call(this.props._paymentBox, {res: res.data.order});
            } else {
                message(res.data)
            }
        }).catch((error) => {
            console.error('error', error);
            throw new Error(error);
        })
    }

    constructMethod = (index) => {
        let obj = { ...this.props.extra.exceptPaycodes[index] };
        if (obj.payCode == "0602") return Promise.resolve();
        let mode = this.props.extra.IniPaymode.find((mode) => mode.code === obj.payCode);
        switch (mode.virtualPayType) {
            case 0: 
                obj.virtualPayType = 0;
                break;
            case 1: 
                obj.virtualPayType = 1;
                break;
            case 2: 
                obj.virtualPayType = 2;
                break;
            case 3: 
                obj.virtualPayType = 3;
                break;
            case 4: 
                obj.virtualPayType = 4;
                break;
            case 5: 
                obj.virtualPayType = 5;
                obj.sswrfs = mode.sswrfs;
                obj.sswrjd = mode.sswrjd;
                break;
            default: 
                break;
        }
        if (obj.virtualPayType === 0 || mode.code == this.props.syspara.wkzfPaycode) {
            let change = 0;
            if (!this.xdChange) {
                this.props.extra.exceptPaycodes.map((item, index) => {
                    if (item.flag == "2" && obj.total > item.total) {
                        change = item.total
                        this.xdChange = true;
                    }
                })
            }
            let ybjechange = calculate.doubleConvert(change / obj.hl, 2, 1)
            let ybje = calculate.Subtr(obj.ybje, ybjechange)
            let total = calculate.Subtr(obj.total, change)
            if(obj.payType==="5"){ //中百券平台
                return this.zbRevoke(obj);
            } else {
                return this.doPayment(ybje, mode, this.props.extra, total, obj.flag);
            }

        } else if (mode.code === payACS) {
            return this.payACS(obj.payno, obj.total, obj.installmentTerms, obj.deliveryMemoNumber, obj.expiryDate, obj.posEntryMode, obj.trackData, mode, this.props.extra);
        } else if (mode.code === paySCB || mode.code === payMahatan) {
            return new Promise((resolve, reject) => {
                let payMode = { ...mode }
                payMode.name = obj.payname
                this.setState({
                    authCode: obj.authCode,
                    referenceNumber: obj.refCode,
                    exDate: obj.batchNo,
                    octopusCardno: obj.payno,
                    merchantid: obj.misMerchantId,
                    traceNumber: obj.trace
                }, () => {
                    this.doPayment(obj.ybje, payMode, this.props.extra, obj.total).then(() => {
                        resolve(this.SalesMeomoAdd(this.props.extra, obj.trace));
                    })
                })
            });
        } else if (mode.code === payMZcoupons || payDircoupons.indexOf(mode.code) !== -1) {
            return new Promise((resolve, reject) => {
                this.setState({
                    octopusCardno: obj.payno,
                }, () => {
                    resolve(this.doPayment(obj.ybje, mode, this.props.extra, obj.total))
                })
            })
        } else if (obj.virtualPayType === 3 && obj.payCode !== payImpowerCode) {
            if (obj.trace !== "0") {
                return new Promise((resolve, reject) => {
                    this.PaymentBankFunc(obj.total, mode, this.props.extra, 0, obj.trace, null, null, () => {
                        resolve();
                    });
                });
            } else {
                return new Promise((resolve, reject) => {
                    this.setState({
                        traceNumber: obj.trace,//流水号
                        referenceNumber: obj.refCode,//订单号
                        exDate: obj.batchNo,//有效期
                        octopusCardno: obj.payno,//交易卡号
                        merchantid: obj.misMerchantId,//刷卡类型
                        octopusDeviceId: obj.terminalid,//终端设备号
                    }, () => {
                        resolve(this.doPayment(obj.ybje, mode, this.props.extra, obj.total))
                    })
                })
            }
        } else if (obj.payCode == "0800") {
            return this.payPoints(obj.ybje, (1 / mode.pyhl), obj.payno, mode, this.props.extra);
        } else if (obj.payCode == payImpowerCode) {
            return new Promise((resolve, reject) => {
                this.setState({
                    traceNumber: obj.trace,//流水号
                    referenceNumber: obj.refCode,//订单号
                    exDate: obj.batchNo,//有效期
                    octopusCardno: obj.payno,//交易卡号
                    merchantid: obj.misMerchantId,//刷卡类型
                    octopusDeviceId: obj.terminalid,//终端设备号
                }, () => {
                    resolve(this.doPayment(obj.ybje, mode, this.props.extra, obj.total))
                })
            })
        } else if (obj.payCode === '0903') {
            // console.log("AEONPAYREFUND: ", obj, this.props, this.state);
            let _refcode = "";
            this.props.syspara.payObj.map((item) => {
                let str = item.split(',');
                if (str[0] == "payWZF") {
                    payWZF = item
                }
            })
            let _paylist = this.props.extra.exceptPaycodes;
            if (!!_paylist && _paylist.length > 0) {
                for (let i = 0; i < _paylist.length; i++) {
                    if (payWZF.indexOf(_paylist[i].payCode) != -1
                        && !!_paylist[i].refCode
                        && _paylist[i] != "") {
                        _refcode = _paylist[i].refCode;
                        break;
                    }
                }
            }
            let _tradeNo = this.props.extra.mkt + "0" + this.props.extra.mkt + moment().format('YYYYMMDDHHmmss') + this.props.extra.syjh  + this.props.extra.fphm;  // 支付单号: erpcode+门店号+收银机号+日期时间
            const req = {
                "command_id": "AEONPAYREFUND",
                "flow_no": this.props.extra.flow_no,  // 当前流水号
                "mkt": this.props.extra.mkt,      // 门店号
                "operators": this.props.extra.operators,
                "syjh": this.props.extra.syjh,     // 终端号
                "fphm": this.props.extra.fphm,     // 小票号
                "je": obj.ybje * 100,       // 支付金额（单位：分  int类型）
                "oldtradeno": _refcode,
                "tradeno": _tradeNo,
                "hl": obj.hl,
                "sswrjd": obj.sswrjd,
                "sswrfs": obj.sswrfs,
                "paytype": obj.paytype,
                "paycode": obj.paycode,
                "apitype": "A",
                "opttype": "C"
                // couponBalance
            };
            return Fetch(
                {
                    url: Url.base_url,
                    type: "POST",
                    data: req
                }
            ).then(res => {
                console.log("====allvpaycancel: ", res);
                if ("0" === res.retflag) {
                    message('撤銷成功');
                    // this.props.onAfterPay(true, res, null);
                    hidePayDialog.call(this, true, res, null);
                } else {
                    message(res.retmsg)
                    throw new Error("融合支付撤銷失败" + res.retflag + "----" + res.retmsg);
                }
            }).catch((error) => {
                console.error('error', error);
                // throw new Error(error);
            });
        }
    }

    //效验输入金额
    checkInputMoney = (cash, yscash, sswrfs) => {
        //判断小数点个数
        let cashArr = cash.split('.');
        if (cashArr.length > 2) {
            message('請輸入合法金額！')
            return yscash
        }
        switch (sswrfs) {
            case "0":  // 四舍五入保留两位小数
                if (cash.split('.')[1] && cash.split('.')[1].length > 2) {
                    message('該支付方式精確到分！')
                    return yscash;
                } else {
                    return cash;
                }       
            case "1": // 四舍五入保留一位小数
                if (cash.split('.')[1] && cash.split('.')[1].length > 1) {
                    message('該支付方式精確到角！')
                    return yscash;
                } else {
                    return cash;
                }
            case "2":  // 保留一位小数
                if (cash.split('.')[1] && cash.split('.')[1].length > 1) {
                    message('該支付方式截斷到角！')
                    return yscash;
                } else {
                    return cash;
                }
            case "3":  // 四舍五入保留整数
                if (cash.indexOf(".") !== -1) {
                    message('該支付方式精確到元！')
                    return yscash;
                } else {
                    return cash;
                }
            case "4":  // 保留整数
                if (cash.indexOf(".") !== -1) {
                    message('該支付方式截斷到元！')
                    return yscash;
                } else {
                    return cash;
                }
            default: 
                return cash;
        }
    };

    //积分查询
    searchPoints = (consumers_id, payModeData, extra) => {
        const req = {
            command_id: "AMCMEMBERLOGIN",
            operators: extra.operators,     //操作员号
            flow_no: extra.flow_no,       //当前流水号
            certifytype: "ERP",
            mkt: extra.mkt,         //门店号
            syjh: extra.syjh,       //终端号
            memberId: consumers_id,     //会员号
        };
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then(res => {
            console.log("--searchPoints: ", res);
            if ("0" === res.retflag) {
                this.setState({
                    points: res.couponlist[0]
                })
                console.log(this.state.couponlist + "points")
            } else {
                throw new Error("積分查詢失敗" + res.retflag + "----" + res.retmsg);
            }
        }).catch((error) => {
            console.error('error', error);
            throw new Error(error);
        });
    }

    //积分消费
    payPoints = (total, jfxfBl, consumers_id, payModeData, extra) => {
        let consumeInfo = this.props.sysparaData.find(item => item.code === "JFXF");
        let paravalue = consumeInfo.paravalue.split(',');
        total = parseFloat(total);
        if (!consumers_id) {
            message('請先刷會員卡');
            return
        }
        if (total < parseFloat(paravalue[1]) || total % parseFloat(paravalue[2])) {
            message("使用積分必須大於" + paravalue[1] + "且是" + paravalue[2] + "整數倍!");
            return;
        }
        const req = {
            command_id: "AEONAMCPAY",
            operators: extra.operators,     //操作员号
            flow_no: extra.flow_no, //当前流水号
            payno: consumers_id, //
            total: total * parseFloat(paravalue[0]),  //付款金额
            totalfrac: 0, //收银损益
            payid: consumers_id, //付款卡号
            flag: "0",
            mkt: extra.mkt,         //门店号
            ybje: total,     //原币金额 total*jfxfBl
            hl: paravalue[0],         //汇率 (积分消费倍率)
            syjh: extra.syjh,       //终端号收银机号
            iszl: payModeData.iszl,     //是否找零
            isyy: payModeData.isyy,     //是否溢余
            maxval: payModeData.maxval, //最大成交金额
            paycode: payModeData.code,  //付款方式代码
            payname: payModeData.name,  //付款名称
            zlhl: jfxfBl,//找零汇率 (积分消费倍率)
            minval: payModeData.minval,//最小成交金额
            sswrfs: payModeData.sswrfs,//
            sswrjd: payModeData.sswrjd,//四舍五入精度
            yhje: '',//优惠金额
            shyhje: '',//商户优惠金额
            payyhje: '',//支付渠道优惠金额
            scene: extra.scene,//0普通， 1除外
            paytype: payModeData.virtualPayType,//paytype
            authCode: this.state.authCode,//授权编码
            // couponBalance
        };
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then(res => {
            console.log("====AEONAMCPAY: ", res);
            if ("0" === res.retflag) {
                message('支付成功');
                // this.props.onAfterPay(true, res, null);
                hidePayDialog.call(this, true, res, null);
            } else {
                message(res.retmsg)
                throw new Error("積分消費失敗" + res.retflag + "----" + res.retmsg);
            }
        }).catch((error) => {
            console.error('error', error);
        });
    }

    onHidePay = () => {
        this.setState({
            couponlist: [],//劵列表
            points: null,//积分信息
            isMZValue: false
        })
        // this.props.onHidePay();
        hidePayDialog.call(this.props._paymentBox);
    }

    constructor(props) {
        super(props);
        this.state = {
            couponlist: [],//劵列表
            points: null,//积分信息
            traceNumber: null,
            exDate: null,
            merchantid: null,
            referenceNumber: null,
            //todo 加载框
            isLoading: false,
            tishitext: "",
            authCode: "",
            isMZValue: false,
            payid: null,
            octopusDeviceId: null,
            octopusCardno: null, //八达通卡号
            octopusBalance: null, //八达通余额
            octopusDedudeTotal: null,
            octopusIsSmart: false,
            octopusLastAddValDate: null,    //最近增值日期
            octopusLastAddValType: null,    //最近增值类型
            octopusLastAddValTypeEn: null,  //最近增值类型(english)
            octopusTransDate: null
        };
    }

    //自动消单
    componentDidMount() {
        console.log("except~~ : ", this.props, this.state)
        if (this.props.extra.orderType === "2") {
            let { exceptPaycodes } = this.props.extra, index = 0;
            try {
                let reqQueue = () => {
                    console.log('index', index);
                    if (exceptPaycodes[index].flag == "2") {
                        if (++index < exceptPaycodes.length) {
                            reqQueue();
                        }
                    } else {
                        if (exceptPaycodes[index].paycode === '0707') {
                            if (++index < exceptPaycodes.length) {
                                reqQueue();
                            } else {
                            this.props.onAfterPay(true, { remainje: 0 }, null);
                        }
                        } else {
                            this.constructMethod(index).then(() => {//匹配对应请求函数
                                if (++index < exceptPaycodes.length) {
                                    reqQueue();
                                }
                            })
                        }
                    }
                };
                setTimeout(() => {
                    reqQueue();
                }, 1000);
            } catch (e) {
                console.log('请求队列异常', e);
            }
        }
    }

    render() {
        const { 
            extra, 
            onHidePay, 
            payModeData, 
            sftotal, 
            syspara 
        } = this.props;
        syspara.payObj.map((item) => {
            let str = item.split(',');
            if (str[0] == "payACS") {
                payACS = str[1];
                return;
            } else if (str[0] == "payImpowerCode") {
                payImpowerCode = str[1];
                return;
            } else if (str[0] == "paySCB") {
                paySCB = str[1];
                return;
            } else if (str[0] == "payMahatan") {
                payMahatan = str[1];
                return;
            } else if (str[0] == "payMZcoupons") {
                payMZcoupons = str[1];
            } else if (str[0] == "payDircoupons") {
                payDircoupons = item;
            }
        })
        let showModal,
        defaultProps = {
            extra,
            syspara,
            payDialogData: payModeData,
            syyf: sftotal,
            _paymentBox: this.props._paymentBox,
            checkInputMoney:(newtotal, total) => this.checkInputMoney(newtotal, total, payModeData.sswrfs),
            onHidePay: this.onHidePay,
            doPayment: this.doPayment,
        };
        switch(payModeData.refModal) {     
            case 'Cash':
                //现金类
               showModal =                 
                <Cash
                ref  = 'Cash'
                callback={(cash, bbje) => this.doPayment(cash, payModeData, extra, bbje)}
                salesMemoAdd={this.SalesMeomoAdd}
                {...defaultProps}
                />
           break;
           case 'WuhanCard': 
                //武汉通
                showModal =
                <Cash
                ref  = 'WuhanCard'
                sendBankLog = {this.sendBankLog}
                {...defaultProps}
                />
            break;
            case 'ICBCCard': 
                //ICBC 工商银行
                showModal =
                <Bank
                ref  = 'ICBCCard'
                sendBankLog = {this.sendBankLog}
                {...defaultProps}
                />
            break;
            case 'GMCCard': 
                //GMC 银联
                showModal =
                <Bank
                ref  = 'GMCCard'
                sendBankLog = {this.sendBankLog}
                {...defaultProps}
                />
            break;
            case 'SvCard': 
                //券平台
                showModal =
                <SvCard
                ref  = 'SvCard'
                {...defaultProps}
                />
            break;
            case 'StoreValueCard': 
                //储值卡
                showModal =
                <StoreValueCard
                ref  = 'StoreValueCard'
                storeValuePay = {this.storeValuePay}
                {...defaultProps}
                />
            break;
           default: 
            showModal = null;
            break;
        }
        return showModal
        // if (payModeData.virtualPayType == '3' 
        //     && payModeData.code !== payACS 
        //     && payModeData.code !== payImpowerCode 
        //     && payModeData.code !== paySCB 
        //     && payModeData.code !== payMahatan) {
        //     //payModeData.code === '0505'银行
        //     return (
        //         <div>
        //             {this.state.isLoading ?
        //                 <div className="loading_mask">
        //                     <Spin size="large" />
        //                 </div> : null}
        //             <BankBox
        //                 syyf={sftotal}
        //                 hidePayDialog={onHidePay}
        //                 extra={extra}
        //                 payDialogData={payModeData}
        //                 PaymentBankFunc={(total, isonLine, approvelCode, cardId, yxDate) => this.PaymentBankFunc(total, payModeData, extra, isonLine, approvelCode, cardId, yxDate)}
        //                 checkInputMoney={(newtotal, total) => this.checkInputMoney(newtotal, total, payModeData.sswrfs)}
        //             />
        //         </div>
        //     )
        // } else if (payModeData.code === payACS 
        //     && payACS !== null && payACS !== undefined) {
        //     return (
        //         <ACSBox
        //             syyf={sftotal}
        //             hidePayDialog={onHidePay}
        //             extra={extra}
        //             tishitext={this.state.tishitext}
        //             payDialogData={payModeData}
        //             checkInputMoney={(newtotal, total) => this.checkInputMoney(newtotal, total, payModeData.sswrfs)}
        //             callback={(cardId, total, fqtime, memoNum, ExpiryDate, posEntryMode, trackData, refCode) => this.payACS(cardId, total, fqtime, memoNum, ExpiryDate, posEntryMode, trackData, payModeData, extra, refCode)}
        //         />
        //     )
        // } else if ((payModeData.code === payImpowerCode && payImpowerCode !== null && payImpowerCode !== undefined) 
        //     || (payModeData.code === paySCB && paySCB !== null && paySCB !== undefined) 
        //     || (payModeData.code === payMahatan && payMahatan !== null && payMahatan !== undefined)) {
        //     return (
        //         <ImpowerBox
        //             payImpowerCode={payImpowerCode}
        //             paySCB={paySCB}
        //             payMahatan={payMahatan}
        //             syyf={sftotal}
        //             hidePayDialog={onHidePay}
        //             extra={extra}
        //             syspara={syspara}
        //             payDialogData={payModeData}
        //             PaymentBankSQBM={(total, approvelCode) => this.PaymentBankSQBM(total, payModeData, extra, approvelCode)}
        //             checkInputMoney={(newtotal, total) => this.checkInputMoney(newtotal, total, payModeData.sswrfs)}
        //             callback={(cash, others, fqtime, cardId, yxDate, memoNum, payName) => {
        //                 let payMode = { ...payModeData }
        //                 payMode.name = payName
        //                 this.setState({
        //                     authCode: others,
        //                     referenceNumber: fqtime,
        //                     exDate: yxDate,
        //                     octopusCardno: cardId,
        //                     merchantid: 'M',
        //                     traceNumber: memoNum
        //                 }, () => {
        //                     this.doPayment(cash, payMode, extra, cash)
        //                 });
        //             }}
        //         />
        //     )
        // } else if (payModeData.virtualPayType == '4' 
        //     || payModeData.virtualPayType == '2' 
        //     || payModeData.paytype === '3') {
        //     //储值卡 八达通 积分payModeData.name === '八达通' || payModeData.code === '0503'
        //     return (
        //         <ValuecardBox
        //             sysparaData={this.props.sysparaData}
        //             syyf={sftotal}
        //             hidePayDialog={onHidePay}
        //             payDialogData={payModeData}
        //             extra={extra}
        //             points={this.state.points}
        //             octoddRecord={this.props.octoddRecord}
        //             vip_no={this.props.vip_no}
        //             payOctopus={(total, octopusData) => {
        //                 this.setState({
        //                     octopusDeviceId: octopusData.octopusDeviceId,
        //                     octopusCardno: octopusData.octopusCardno, //八达通卡号
        //                     octopusBalance: octopusData.octopusBalance, //八达通余额
        //                     octopusDedudeTotal: octopusData.octopusDedudeTotal,
        //                     octopusIsSmart: octopusData.octopusIsSmartCard,
        //                     octopusLastAddValDate: octopusData.octopusLastAddValDate,    //最近增值日期
        //                     octopusLastAddValType: octopusData.octopusLastAddValType,    //最近增值类型
        //                     octopusLastAddValTypeEn: octopusData.octopusLastAddValTypeEn,    //最近增值类型(english)
        //                     octopusTransDate: octopusData.octopusTransDate,
        //                 }, () => {
        //                     this.payOctopus(total, payModeData, extra)
        //                 });
        //             }}
        //             searchPoints={(consumers_id) => this.searchPoints(consumers_id, payModeData, extra)}
        //             payPoints={(total, jfxfBl, consumers_id) => this.payPoints(total, jfxfBl, consumers_id, payModeData, extra)}
        //         />
        //     )
        // } else if (payModeData.virtualPayType == '0' 
        //     || payModeData.code == syspara.wkzfPaycode) {
        //     //payModeData.code === '01' || payModeData.code === '02' || payModeData.code === 'DSSEE'现金
        //     return (
        //         <Cash
        //             _paymentBox = {this.props._paymentBox}
        //             extra = {extra}
        //             ref  = 'Cash'
        //             syyf={sftotal} 
        //             onHidePay={this.onHidePay}
        //             payDialogData={payModeData}
        //             checkInputMoney={(newtotal, total) => this.checkInputMoney(newtotal, total, payModeData.sswrfs)}
        //             callback={(cash, bbje) => this.doPayment(cash, payModeData, extra, bbje)}
        //             doPayment = {this.doPayment}
        //             syspara={syspara}
        //             salesMemoAdd={this.SalesMeomoAdd}
        //             // onAfterPay={this.props.onAfterPay}
        //         />
        //     )
        // } else if (payModeData.virtualPayType == '1') {
        //     //劵payModeData.code === '0500' || payModeData.code === '0501' || payModeData.code === '0502'
        //     return (
        //         <StockBox
        //             isMZValue={this.state.isMZValue}
        //             syyf={sftotal}
        //             checkInputMoney={this.checkInputMoney}
        //             hidePayDialog={this.onHidePay}
        //             payDialogData={payModeData}
        //             couponlist={this.state.couponlist}
        //             vip={(consumers_id) => this.vip(consumers_id, payModeData, extra)}
        //             searchStock={(consumers_id, stockId) => this.searchStock(consumers_id, payModeData, extra, stockId)}
        //             payStock={(total, stock, consumers_id) => this.payStock(total, stock, consumers_id, payModeData, extra)}
        //             yhStock={(stockId, vip) => this.yhStock(payModeData, extra, stockId, vip)}
        //             syspara={syspara}
        //             zkStock={(stockId) => this.zkStock(payModeData, extra, stockId)}
        //             mzStock={(stockId, total) => this.mzStock(payModeData, extra, stockId, total)}
        //             callback={(cash, bbje, zjzfQH) => {
        //                 this.setState({ octopusCardno: zjzfQH }, () => {
        //                     this.doPayment(cash, payModeData, extra, bbje)
        //                 })
        //             }}
        //         />
        //     )
        // } else if (payModeData.virtualPayType == '5' 
        //     || payModeData.paytype === '9' 
        //     || payModeData.name === '融合支付') {
        //     //微支付payModeData.code === '0506' || payModeData.code === '10002'  其他
        //     return (
        //         <AllVPayBox
        //             syyf={sftotal}
        //             hidePayDialog={onHidePay}
        //             payDialogData={payModeData}
        //             extraData={extra}
        //             syspara={syspara}
        //             callback={(res) => this.payAllv(res)}
        //         />
        //     )
        // } else {
        //     return null
        // }
    }
}

export default ShowPaybox
