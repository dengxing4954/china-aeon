import React, { Component } from 'react'
import { Row, Col, Layout, Icon, Button, Modal } from 'antd'
import intl from 'react-intl-universal'
import moment from 'moment'
import message from '@/common/components/message'
import EventEmitter from '@/eventemitter'
import { Fetch } from '@/fetch/'
import Url from '@/config/url.js'
import { CashPayment } from './pmtCash.js'
import { 
    doOctozzfkDone, octoZzReceipt, octocardRecharge, 
    octoddRecord, octozzUnDoneFilter, octozzDoneFilter 
} from './pmtOctopus.js'
import {
    filterGoodsStock
} from './pmtStock.js'
import calculate from '../../../common/calculate'
import modalBox from '@/common/components/modalBox';

/**
 * Query objects this specify keys and values in an array where all values are objects.
 * @param   {array}         array   An array where all values are objects, like [{key:1},{key:2}].
 * @param   {string}        key     The key of the object this needs to be queried.
 * @param   {string}        value   The value of the object this needs to be queried.
 * @return  {object|undefined}   Return frist object when query success.
 */
// export function payModeFilt(array, key, value) {
//     if (!Array.isArray(array)) {
//         return
//     }
//     return array.find(_ => _[key] === value)
// }




// export function intl(key, params = {}) {
//     return intl.get(key, params);
// }

/** 生成支付行后结果处理 */
export function afterPayHandle({res}) {
    let _this = this;
    let ishaveZL = false;
    let change = '0.00', sum = 0;
    let payments = res.salePayments ? res.salePayments : res.payments;
    // _this.setState({
    //     change: change,
    //     payList: [...payments],
    //     yftotal: parseFloat(res.existPay || _this.props.sjtotal),
    //     sftotal: parseFloat(res.remainValue),
    //     // overage: sum,
    //     // changename: _this.intl("CHANGE")
    // })
    payments.map((item) => {
        sum += Number(item.overage);
    });
    if(res.remainValue == 0) {
        payments.map((item) => {
            if (item.flag === "2" && item.money !== 0) {
                ishaveZL = true;
                change = item.money
                window.LineDisplay({ data: { cash: res.sjfk, change }, type: 3 })
                return;
            }
        })
    }
    if(ishaveZL) {
        _this.setState({
            change: change,
            payList: [...payments],
            yftotal: parseFloat(res.existPay || _this.props.sjtotal),
            sftotal: parseFloat(res.remainValue),
            overage: sum
        })
        // window.openCashbox();
        modalBox({
            className: 'zlzz-confirm',
            type: 'success',
            content: (<div>
                <p className="zlje" style = {{fontSize: '25px'}}> 找零金額{"    " + _this.props.syspara.bbcodeHBFH[1] + change.toFixed(2)}</p>
                {/*<p> 實際付款{"    " + _this.props.syspara.bbcodeHBFH[1] + parseFloat(res.sjfk).toFixed(2)}</p>*/}
            </div>),
            okText: intl.get("CHANGE"), 
            onOk() {
                finalSubmit.call(_this);
            },
        })
    }else if (res.remainValue == 0) {
        _this.setState({
            change: change,
            payList: [...payments],
            yftotal: parseFloat(res.existPay || _this.props.sjtotal),
            sftotal: parseFloat(res.remainValue),
            overage: sum
        }, () => {
            finalSubmit.call(_this);
        })
    }else{
        _this.setState({
            change: change,
            payList: [...payments],
            yftotal: parseFloat(res.existPay || _this.props.sjtotal),
            sftotal: parseFloat(res.remainValue),
            overage: sum
        })
    }
}

/** 保存订单 */
export function finalSubmit() {
    let _this = this;
    //储值卡筛选
    const storeValueFunc = (res) => {
        let {salePayments} = res.data.order;
        let arr = [];
        salePayments.forEach(v => {
            if (v.payCode === '0003') arr.push(v);
        })
        if (arr.length !== 0) window.DelLog(arr);
    }
    const sumbitFunc = () => {
    let isOpenCashbox = false, cashTotal = 0;
        let submitReq = {
            terminalOperator: _this.props.operators,
            flowNo: _this.props.flowNo,
            shopCode: _this.props.mkt,
            terminalNo: _this.props.syjh,
            guidList: _this.props.goodsList.map(item => item.guid),
            puidList: _this.state.payList.map(item => item.puid),
            refNo: '',
        };
        if (_this.state.returncode === "2002") {
            submitReq.newTerminalSno = _this.state.retmsg
        }
        _this.props.submit(submitReq).then(res => {
           if (res) {
            let retmsg = res.retmsg;
            retmsg = Number(retmsg) + 1
            if (res.returncode === "2002") {
                _this.props.update();
                _this.setState({
                    returncode: "2002",
                    retmsg: retmsg.toString()
                }, () => {
                    _this.finalSubmit();
                })
                return;
            }
            window.welcome();
            _this.props.update();
            storeValueFunc(res);
            _this.state.payList.map((item) => {
                if (item.flag !== "2" && item.flag != 3) {
                    let mode = _this.props.payModeInfo.find((mode) => mode.code === item.payCode);
                    if (mode.virtualPayType == 0) {//判断是现金
                        cashTotal += Number(item.total)                        
                        isOpenCashbox = true
                    } else if (mode.virtualPayType == 1) {//判断是券
                        isOpenCashbox = true
                    }
                }else if (item.flag == '2') {
                    cashTotal -= Number(item.total)
                }
            });
            isOpenCashbox && window.openCashbox();
            let params = {
                cashTotal
            };
            window.Print(res, data => {
                console.log(data, 99999999999)
            })
            submitCallback.call(_this, params);
           } 
        })
        
    }
    sumbitFunc();
}

/** 保存订单回调页面跳转 */
export function submitCallback (params) {
    let _this = this;
    //记录钱箱金额
    let recordMoney = window.SyncCASHIER({
        cash: params.cashTotal,
        dealNumbers: 1,
        mediaTotal: _this.props.zdyftotal,
        na: !!_this.props.salePayments.filter(v => v.paycode === '0602') ? Number(_this.props.zdyftotal - _this.props.sjtotal) : _this.props.zdyftotal
    })
    //更新收银机状态  
    const updateSyjstateFunc = () => {
        updateSyjstate.call(_this, recordMoney.dealNumbers, recordMoney.cash, recordMoney.mediaTotal).then((status) => {
            _this.props.init();
            // _this.props.update();
            let promptNum = _this.props.interval || 0;
            let info = {
                title: intl.get("LOCK_TIP"),
                okText: intl.get("INFO_CONFIRMA"),
                content: intl.get("INFO_CASHEXCESS"),
            };
            if (status === '0') {
                Modal.info(info);
                _this.setState({ isPrint: false });
                _this.props.router.push("/home");
                return;
            } else if (status === '8' && promptNum < 2) { //状态为8为现金溢出
                if (promptNum === 0) {//第一次提示
                    Modal.info(info);
                    _this.props.cashierWarn(1);
                } else if (promptNum === 1) {//第二次提示（超出峰值允许交易）
                    let record = window["SyncCASHIER"]({
                        cash: 0,
                        dealNumbers: 0
                    });
                    let { cashsale, maxxj } = _this.props.syspara;
                    let tranSales = cashsale.split(',');
                    if (parseFloat(record.cash) > parseFloat(tranSales[1])) {
                        Modal.info(info);
                        _this.props.cashierWarn(2);
                    }
                }
            }
            _this.setState({ isPrint: false });
            if (_this.props.type === "returnGoods") {
                _this.props.returnInit();
                _this.props.history.push('/home');
            }else if (_this.props.type === "eliminatebills") {
                _this.props.eliminateInit();
                _this.props.history.push('/home');
            } else {
                _this.props.history.push(_this.props.isDiningHall ? "/square" : "/presale");
            }
        })
    }
    updateSyjstateFunc();
}

/** 删除付款 */
export function deletepay(item) {
    const filterCode = [
        {   
            //银联
            code: '0299',
            virtualPayType: 3
        },
        {
            //ICBC
            code: '3114',
             virtualPayType: 3
        },
        {
            //武汉通
            code: '3102',
            virtualPayType: 4
        }
    ];
    const zbqPay = [    //中百券平台支付
        {   
            //支付宝
            code: '3301',
        }, {   
            //
            code: '3302',
        },
    ];
    let filterList = filterCode.find(v => v.code === item.payCode);
    if (!!filterList) {
        message(`${item.payName}不允许删除付款`);
        return false;
    }    
    let req = {
        command_id: "DELPAYCERTIFY",
        terminalOperator: this.props.operators,//操作员号
        flowNo: this.props.flowNo,//当前流水号
        puid: item.puid,//付款行唯一标识
        shopCode: this.props.mkt,
        terminalNo: this.props.syjh
    };
    let zbqZf = zbqPay.find(v => v.code === item.payCode);
    if ( !!zbqZf ) {
        // 中百券平台支付
        req = {
            command_id:  "ZHONGBAIREVOKE",
            shopCode: this.props.mkt,
            terminalNo: this.props.syjh,
            terminalOperator: this.props.operators, //操作员号
            flowNo: this.props.flowNo,  //当前流水号
            voidType: "0", //交易类型  0-删除付款行（撤销）1-冲正
            idSheetNo: this.props.fphm,    //小票号
            orderNo: item.refCode,  //外部流水号
            puid: item.puid,    //付款行唯一标识
        }
    }
    let storeValuePay =  item.payCode === "0003";
    if(storeValuePay) {
        const payModeData = this.props.payModeInfo.find(v => v.code === item.payCode);
        req = {
            command_id: 'ZBMZKCANCEL',
            shopCode: this.props.mkt,//门店号
            // terminalNo: extra.syjh,//终端号
            puid: item.puid,//付款行唯一标识
            terminalNo: '94100101',
            terminalOperator: this.props.operators,//操作员号
            flowNo: this.props.flowNo,//当前流水号
            invno: this.props.fphm,//小票号
            cardNo: item.trackData,//储值卡卡号
            // passwd: params.passwd,//储值卡密码
            amount: item.amount,//原币金额
            orderNo: item.refCode,
            cutMode: payModeData.sswrfs,//四舍五入方式
            precision: payModeData.sswrjd,//四舍五入精度
            payCode: payModeData.code,//付款方式代码
            payName: payModeData.cardPayType !== "a" ? payModeData.name : payModeData.paysimplecode,
            rate: payModeData.pyhl,//汇率
            isOverage: payModeData.isyy,//是否溢余
            isAllowCharge: payModeData.iszl,//是否找零
        }
    }
    let fun = () => {
        // const req = {
        //     command_id:  "DELPAYCERTIFY",
        //     terminalOperator: this.props.operators,//操作员号
        //     flowNo: this.props.flowNo,//当前流水号
        //     puid: item.puid,//付款行唯一标识
        //     shopCode: this.props.mkt,
        //     terminalNo: this.props.syjh
        // };
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then(res => {
            if ("0" === res.returncode) {
                message("刪除付款成功")
                let {order} = res.data;
                let payments = order.salePayments ? order.salePayments : [];
                let sum = 0;
                if (storeValuePay) window.DelLog([item]);
                payments.map((item, index) => {
                    sum += Number(item.overage);
                })
                this.setState({
                    change: '0.00',
                    payList: [...payments],
                    selectedDetail: this.state.selectedDetail > 0 ? this.state.selectedDetail - 1 : 0,
                    yftotal: order.existPay,
                    sftotal: order.remainValue,
                    overage: sum,
                    changename: this.intl("CHANGE")
                })
            } else {
                message(res.data);
            }
        }).catch((error) => {
            console.error('error', error);
            throw new Error(error);
        });
    }

    fun();
    // Modal.confirm({
    //     className: 'vla-confirm',
    //     title: '確定要刪除付款嗎？',
    //     okText: '確定',
    //     cancelText: '取消',
    //     onOk: () => {
    //         fun();
    //     }
    // });
}

export function deepCopy(p, c) {
    var c = c || {};
    for (var i in p) {
        if (!p.hasOwnProperty(i)) {
            continue;
        }
        if (typeof p[i] === 'object' && p[i] != null) {
            c[i] = (p[i].constructor === Array) ? [] : {};
            deepCopy(p[i], c[i]);
        } else {
            c[i] = p[i];
        }
    }
    return c;
}

// 支付方式入口初始化
export function initButtons(_forAll) {
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
    //测试只展示人民币支付方式
    if (this.state.paymode.length > 7) {
        _btns.push({
            id: '-999',
            code: '-999',
            icon: 'ellipsis',
            name: this.state.paymodeCollapsed ? '更多' : '收起'
        });
    }
    return _btns.map((btn, btnIndex) => {
                let res = null;
                if (btn.code === '-999') {
                    res = (
                        <Col span={6} className="paylist" key={btnIndex}>
                            <Button className={this.state.selectedPay === btnIndex ? 'selectedIcon' : 'icon'} size="large" onClick={() => { this.setState({ paymodeCollapsed: !this.state.paymodeCollapsed }); }}>
                                <Icon type={btn.icon} />{btn.name}
                            </Button>
                        </Col>
                    );
                } else {
                    res = (
                        <Col span={6} className="paylist" key={btnIndex}>
                            <Button className = {this.state.selectedPay === btnIndex ? 'selectedIcon' : 'icon'} size="large" onClick={() => {
                                showPayDialog.call(this, btn);
                            }}>
                                <Icon type={btn.icon} />{btn.name}
                            </Button>
                        </Col>
                    );
                }
                return res;
            });
}


// // 支付方式入口面板开闭
// export function paymodeToggle() {
//     this.setState({
//         paymodeCollapsed: !this.state.paymodeCollapsed
//     });
// }


// 打开支付组件
export function showPayDialog(paymode) {
    let modalCheck;
    this.setState({showBox: true})
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
        if (this.props.sftotal <= 0 && this.props.zdyftotal > 0) {
            message("钱已付清,请点击付款完成！")
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
export function hidePayDialog() {
    this.setState({
        payDialogData: new Object({}),
        paymodeCollapsed: true,
        showBox: false,
    })
}


//0进入支付 1支付  2删除支付 3取消支付  4完成支付  5八达通增值
export function handleEjoural(item, type) {
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
    //初始化支付
    switch (type) {
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

//销售打印
export function submitPrint(hykh, isyellowPrint, ArtcodeMoney, ArtcodeMoneyTotal, DirectMoney, hjzsl, bankTotal, notBankTotal, isTailTotal, isnotTailTotal, isYhrq, goods, pay, cashTotal, isSDYN, printObj, octoZlzzNeedsPrint, isACS, isPTFQ, isPress, isSCB, isMahatan, octozzSalePrintData, octoZlzzOrgiRef, oldFphm) {
    let _this = this;
    pay.forEach(item => {
        if (!item.octopusCardno && item.octopusLastAddValType) {
            item.misMerchantId = item.octopusLastAddValType;
        }
    })
    if (_this.state.octoDjlb == "Y3") {//八达通增值小票
        let _a = _this.state.octopusTransDate.split(" ");
        let octoJyTime = _a[0].split("-")[2] + "/" + _a[0].split("-")[1] + "/" + _a[0].split("-")[0] + " " + _a[1];
        //八达通增值调用handleEjoural
        handleEjoural.call(_this, {
            octopusDeviceId: !!_this.state.octopusDeviceId ? _this.state.octopusDeviceId.toUpperCase() : "",    //八达通设备号
            octopusCardno: _this.state.octopusCardno,    //八达通卡号
            octopusRechargeTotal: "" + Number(_this.props.zdyftotal).toFixed(2), //充值金额
            octopusBalance: "" + Number(_this.state.octopusBalance).toFixed(2),  //八达通余额
            octopusIsSmart: _this.state.octopusIsSmart,          //是否八达通智能卡
            octopusLastAddValDate: _this.state.octopusLastAddValDate,    //最近一次增值日期
            octopusLastAddValType: _this.props.switchEng === true ? _this.state.octopusLastAddValTypeEn : _this.state.octopusLastAddValType,    //最近一次增值类型
            octopusTransDate: _this.state.octopusTransDate, //八达通交易时间
            sjfk: _this.state.yftotal,//实际付款
            ysje: _this.props.zdyftotal,//应收金额
            zl: _this.state.change,//找零金额
        }, 5);
        let octozzPrintData = {
            Module: 'OctopusPrint',
            head: [{
                refno: _this.props.syjh + oldFphm, //ref值
                syyh: _this.props.operators,//收银员
                syjh: _this.props.syjh,//收银机号
                hykh: hykh,//会员号
                mkt: _this.props.mkt,//门店号
                djlb: "Y3",//单据类别1代表销售，4代表退货
                printtype: "0", //0代表热敏打印，1代表平推
                rqsj: octoJyTime,//交易时间
                sjfk: _this.state.yftotal,//实际付款
                ysje: _this.props.zdyftotal,//应收金额
                subTotal: _this.props.zdsjtotal, //全单金额
                printnum: 0,//重打次数
                printtime: _this.props.syspara.salebillnum || 1,//打印次数
                shopname: _this.props.syspara.shopname,//商场名称
                shopEnName: _this.props.mktinfo.shopEnName,
                zl: _this.state.change,//找零金额
                barcodeString: _this.props.mkt + _this.props.syjh + _this.props.xph.substring(0, 9) + oldFphm,//门店号+收银机号+小票号
                isyellowPrint: isyellowPrint, //是否打印黄色小票
                ArtcodeMoney: ArtcodeMoney, //黄色小票非直营金额
                DirectMoney: DirectMoney, //黄色小票直营金额
                switchEng: _this.props.switchEng,  //是否打印英文小票
                octopusDeviceId: !!_this.state.octopusDeviceId ? _this.state.octopusDeviceId.toUpperCase() : "",    //八达通设备号
                octopusCardno: _this.state.octopusCardno,    //八达通卡号
                octopusRechargeTotal: "" + Number(_this.props.zdyftotal).toFixed(2), //充值金额
                octopusBalance: "" + Number(_this.state.octopusBalance).toFixed(2),  //八达通余额
                octopusLastAddValDate: _this.state.octopusLastAddValDate,    //最近一次增值日期
                octopusLastAddValType: _this.props.switchEng === true ? _this.state.octopusLastAddValTypeEn : _this.state.octopusLastAddValType,    //最近一次增值类型
                // octopusLastAddValTypeEn: _this.state.octopusLastAddValTypeEn,    //最近一次增值类型(english)
                octopusIsSmart: _this.state.octopusIsSmart,
                octopusTransactionTime: _this.state.octopusTransDate,
                address: _this.props.mktinfo.address,  //门店地址
                enAddress: _this.props.mktinfo.enAddress,
                mktname: _this.props.mktinfo.mktname,//门店号名称
                phone: _this.props.mktinfo.telephone,//门店号名称
                mdjc: _this.props.mktinfo.shopSName,
                refundAuthzCardNo: _this.props.refundAuthzCardNo, //退货授权卡号
                terminalOperatorAuthzCardNo: _this.props.terminalOperatorAuthzCardNo,//员工授权卡号
                totalDiscAuthzCardNo: _this.props.totalDiscAuthzCardNo,//总折扣授权卡号
                cardNo: _this.props.creditCardNo,
                staffcard: _this.props.cardNo,   //员工购物
                staffcardYGGH: _this.props.staffNo,  //是员工工号
                staffcardType: _this.props.cardType,  //1为员工购物  2为亲属购物
                eleStamp: _this.props.eleStamp, //电子印花券
                online: _this.props.saveStatus === "1" ? 0 : "1",
                hjzsl,//合计商品数
                bankTotal,
                notBankTotal,
                isTailTotal,
                isnotTailTotal,
                isYhrq,
                sticker: _this.props.sticker, //印花券
                memberInfo: _this.props.memberInfo,
            }],
            goods,
            pay
        };
        // console.log("八达通增值小票:", octozzPrintData);
        _this.setState({ isPrint: true }, () => {
            window.Print(octozzPrintData, () => {
                let a = window.SyncCASHIER({
                    cash: cashTotal,
                    dealNumbers: 1,
                    mediaTotal: _this.props.zdyftotal,
                    // na: _this.props.zdyftotal,        //八达通增值时传递，不进行NA累加
                })
                //更新收银机状态
                _this.updateSyjstate(a.dealNumbers, a.cash, a.mediaTotal, oldFphm).then((status) => {
                    _this.props.init();
                    // _this.props.update();
                    let promptNum = _this.props.interval || 0;
                    let info = {
                        title: intl.get("LOCK_TIP"),
                        okText: intl.get("INFO_CONFIRMA"),
                        content: intl.get("INFO_CASHEXCESS"),
                    };
                    if (status === '0') {
                        Modal.info(info);
                        _this.setState({ isPrint: false });
                        _this.props.router.push("/home");
                        return;
                    } else if (status === '8' && promptNum < 2) { //状态为8为现金溢出
                        if (promptNum === 0) {//第一次提示
                            Modal.info(info);
                            _this.props.cashierWarn(1);
                        } else if (promptNum === 1) {//第二次提示（超出峰值允许交易）
                            let record = window["SyncCASHIER"]({
                                cash: 0,
                                dealNumbers: 0
                            });
                            let { cashsale, maxxj } = _this.props.syspara;
                            let tranSales = cashsale.split(',');
                            if (parseFloat(record.cash) > parseFloat(tranSales[1])) {
                                Modal.info(info);
                                _this.props.cashierWarn(2);
                            }
                        }
                    }
                    _this.setState({ isPrint: false });
                    _this.props.router.goBack();
                })
            });
        })
    } else if (isSCB === true || isMahatan === true) {//渣打||曼哈顿平推打印
        console.log("渣打||曼哈顿平推打印")
        let smheadObj = { ...printObj };
        smheadObj.recycleSer = _this.props.recycleSer;
        smheadObj.recycleSerInfo = _this.props.recycleSerInfo;
        smheadObj.expressNumber = _this.props.expressNumber;
        smheadObj.esystemStatus = _this.props.esystemStatus;
        if (_this.props.isDc) {
            smheadObj.isdc = "Y";
        }
        if (_this.props.isHs) {
            smheadObj.ishs = "Y";
        }
        let FQPrintData = {
            Module: 'FQPrint',
            head: [smheadObj],
            goods,
            pay
        };
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
        ACSheadObj.recycleSer = _this.props.recycleSer
        ACSheadObj.recycleSerInfo = _this.props.recycleSerInfo
        ACSheadObj.expressNumber = _this.props.expressNumber;
        ACSheadObj.esystemStatus = _this.props.esystemStatus;
        ACSheadObj.dcData = _this.sliceDcDate(_this.props.dcData);
        if (_this.props.isDc) {
            ACSheadObj.isdc = "Y";
        }
        if (_this.props.isHs) {
            ACSheadObj.ishs = "Y";
        }
        let ACSFQPrintData = {
            Module: 'ACSFQPrint',
            head: [ACSheadObj],
            goods,
            pay
        };
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
    } else if (isSDYN === true && (_this.props.isDc || _this.props.isHs || _this.props.isDj)) {//四点一脑除旧打印加送货单
        console.log("四点一脑除旧打印")
        let sdynheadObj = { ...printObj };
        sdynheadObj.recycleSer = _this.props.recycleSer
        sdynheadObj.recycleSerInfo = _this.props.recycleSerInfo
        sdynheadObj.expressNumber = _this.props.expressNumber
        sdynheadObj.esystemStatus = _this.props.esystemStatus
        sdynheadObj.dcData = _this.sliceDcDate(_this.props.dcData)
        if (_this.props.isDc) {
            sdynheadObj.isdc = 'Y'
        }
        if (_this.props.isHs) {
            sdynheadObj.ishs = 'Y'
        }
        let CJPrintData = {
            Module: 'CJPrint',
            head: [sdynheadObj],
            goods,
            pay
        };
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
    } else if (isSDYN === true && !_this.props.isDc && !_this.props.isHs && !_this.props.isDj) {//四点一脑除旧打印
        console.log("四点一脑除旧无送货单打印")
        let issdynheadObj = { ...printObj };
        issdynheadObj.recycleSer = _this.props.recycleSer
        issdynheadObj.recycleSerInfo = _this.props.recycleSerInfo
        issdynheadObj.expressNumber = _this.props.expressNumber
        issdynheadObj.esystemStatus = _this.props.esystemStatus
        issdynheadObj.dcData = _this.sliceDcDate(_this.props.dcData)
        let CJPrintData = {
            Module: 'CJPrint',
            head: [issdynheadObj],
            goods,
            pay
        };
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
    } else if (_this.props.isDc && _this.props.expressNumber && !isSDYN) {//DC送货打印
        console.log("DC送货打印");
        let _code = "", _commandId = "SEARCHSTOCKS";
        for (let i = 0; i < goods.length; i++) {
            i == goods.length - 1 ? _code += goods[i].goodsno : _code += (goods[i].goodsno + ",");
        }
        let req = {
            command_id: _commandId,
            mkt: _this.props.dcData.reserveLocation,
            code: _code,
            ent_id: _this.props.entid,
            jygs: _this.props.jygs,
            operators: _this.props.operators
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
            DCPrintHead.dcData = _this.sliceDcDate(_this.props.dcData);
            DCPrintHead.expressNumber = _this.props.expressNumber;
            let DCPrintData = {
                Module: 'DCPrint',
                head: [DCPrintHead],
                goods,
                pay
            }
            if (octoZlzzNeedsPrint === true) {
                //八达通找零增值调用handleEjoural
                // 找零到八达通小票，延迟到update()后打印
                octozzSalePrintData = _this.deepCopy(DCPrintData);
                let _a = _this.state.octopusTransDate.split(" ");
                let octoJyTime = _a[0].split("-")[2] + "/" + _a[0].split("-")[1] + "/" + _a[0].split("-")[0] + " " + _a[1];
                octozzSalePrintData.head[0].rqsj = octoJyTime;
                octozzSalePrintData.disCheck = true;
            }
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
    } else if (_this.props.isHs && _this.props.expressNumber && !isSDYN) {//行送打印
        console.log("行送打印")
        let DeliveryHead = { ...printObj }
        DeliveryHead.ishs = "Y";
        DeliveryHead.dcData = _this.sliceDcDate(_this.props.dcData);
        DeliveryHead.expressNumber = _this.props.expressNumber;
        let DeliveryPrintData = {
            Module: 'DeliveryPrint',
            head: [DeliveryHead],
            goods,
            pay
        }
        if (octoZlzzNeedsPrint === true) {
            //八达通找零增值调用handleEjoural
            // 找零到八达通小票，延迟到update()后打印
            octozzSalePrintData = _this.deepCopy(DeliveryPrintData);
            let _a = _this.state.octopusTransDate.split(" ");
            let octoJyTime = _a[0].split("-")[2] + "/" + _a[0].split("-")[1] + "/" + _a[0].split("-")[0] + " " + _a[1];
            octozzSalePrintData.head[0].rqsj = octoJyTime;
            octozzSalePrintData.disCheck = true;
        }
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
    } else if (isPress === true || (_this.props.isDj && _this.props.expressNumber && !isSDYN)) {//按金打印
        console.log("按金打印")
        let pressheadObj = { ...printObj };
        pressheadObj.recycleSer = _this.props.recycleSer
        pressheadObj.recycleSerInfo = _this.props.recycleSerInfo
        pressheadObj.expressNumber = _this.props.expressNumber
        let AJPrintData = {
            Module: 'PressPrint',
            head: [pressheadObj],
            goods,
            pay
        };
        if (octoZlzzNeedsPrint === true) {
            //八达通找零增值调用handleEjoural
            // 找零到八达通小票，延迟到update()后打印
            octozzSalePrintData = _this.deepCopy(AJPrintData);
            let _a = _this.state.octopusTransDate.split(" ");
            let octoJyTime = _a[0].split("-")[2] + "/" + _a[0].split("-")[1] + "/" + _a[0].split("-")[0] + " " + _a[1];
            octozzSalePrintData.head[0].rqsj = octoJyTime;
            octozzSalePrintData.disCheck = true;
        }
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
        if (_this.props.isDiningHall) {
            salePrintData.Module = "MS_SalePrint";
        }
        if (octoZlzzNeedsPrint === true) {
            //八达通找零增值调用handleEjoural
            // _this.handleEjoural({
            //     octopusDeviceId: !!_this.state.octopusDeviceId ? _this.state.octopusDeviceId.toUpperCase() : "",    //八达通设备号
            //     octopusCardno: _this.state.octopusCardno,    //八达通卡号
            //     octopusRechargeTotal: "" + Number(_this.props.zdyftotal).toFixed(2), //充值金额
            //     octopusBalance: "" + Number(_this.state.octopusBalance).toFixed(2),  //八达通余额
            //     octopusIsSmart: _this.state.octopusIsSmart,          //是否八达通智能卡
            //     octopusLastAddValDate: _this.state.octopusLastAddValDate,    //最近一次增值日期
            //     octopusLastAddValType: _this.props.switchEng === true ? _this.state.octopusLastAddValTypeEn : _this.state.octopusLastAddValType,    //最近一次增值类型
            //     octopusTransDate: _this.state.octopusTransDate, //八达通交易时间
            //     sjfk: _this.state.yftotal,//实际付款
            //     ysje: _this.props.zdyftotal,//应收金额
            //     zl: _this.state.change,//找零金额
            // }, 5);
            // 找零到八达通小票，延迟到update()后打印
            octozzSalePrintData = _this.deepCopy(salePrintData);
            let _a = _this.state.octopusTransDate.split(" ");
            let octoJyTime = _a[0].split("-")[2] + "/" + _a[0].split("-")[1] + "/" + _a[0].split("-")[0] + " " + _a[1];
            octozzSalePrintData.head[0].rqsj = octoJyTime;
            octozzSalePrintData.disCheck = true;
        }
        if ('N' === _this.props.syjmain.isprint)
            printAfter.call(_this, salePrintData, isACS, cashTotal, "", isSDYN, isPTFQ, octoZlzzNeedsPrint, octozzSalePrintData, octoZlzzOrgiRef, oldFphm)
        else {
            _this.setState({ isPrint: true }, () => {
                window.Print(salePrintData, (data) => {
                    printAfter.call(_this, salePrintData, isACS, cashTotal, data, isSDYN, isPTFQ, octoZlzzNeedsPrint, octozzSalePrintData, octoZlzzOrgiRef, oldFphm)
                });
            })
        }
    }
}


//打印回调方法
export function printAfter(printData, isACS, cashTotal, data, isSDYN, isPTFQ, octoZlzzNeedsPrint, octozzSalePrintData, octoZlzzOrgiRef, oldFphm) {
    let _this = this;
    console.log(printData)
    console.log(data)
    console.log("打印回调方法")
    if (_this.props.addDjlb == "Y10" || _this.props.addDjlb == "Y11" || _this.props.addDjlb == "Y19") {
        _this.props.updateAMC()
    }

    //消单控制
    if (_this.state.type === "2" && !printData.head[0].isflPrint) {
        printData.head[0].printtype = "0";
    }
    // ACS SDYN控制
    if (!data || data.code !== "0") {
        isACS = false;
        isSDYN = false;
        isPTFQ = false;
        if (octoZlzzNeedsPrint) _this.props.update();
        octoZlzzNeedsPrint = false;
        printData.head[0].printtype = "0";
        message(data.message);
    }
    //页面跳转和更新收银机状态
    if (!isACS && !isSDYN && !isPTFQ && printData.head[0].printtype == "0" && !octoZlzzNeedsPrint) {
        if (_this.state.type == "4" || _this.state.type == "2" || _this.state.type == "Y2") {
            let a = window.SyncCASHIER({
                cash: cashTotal,
                dealNumbers: 1,
                mediaTotal: 0 - _this.props.zdyftotal,
                na: _this.state.type == '4' && _this.props.isDj ? 0 - (_this.props.zdyftotal - _this.props.sjtotal) : 0 - _this.props.zdyftotal
            })
            _this.setState({
                na: a.na
            }, () => {
                handleEjoural.call(_this, "item", 4)
            })
            _this.updateSyjstate(a.dealNumbers, a.cash, a.mediaTotal, oldFphm).then((res) => {
                if (_this.state.type == "2") {
                    _this.props.eliminateInit();
                } else {
                    _this.props.returnInit();
                    if (_this.props.type == "finalpayment" && _this.state.query.djlb === '4') {
                        _this.props.finalpaymentInit();
                    }
                }
                // _this.props.update();
                _this.setState({ isPrint: false });
                _this.props.router.push("/home");
            })
            return;
        } else if (_this.state.type == "Y6") {
            let a = window.SyncCASHIER({
                cash: cashTotal,
                dealNumbers: 1,
                mediaTotal: _this.props.zdyftotal,
                na: _this.props.zdyftotal
            })
            _this.setState({
                na: a.na
            }, () => {
                handleEjoural.call(_this, "item", 4)
            })
            _this.updateSyjstate(a.dealNumbers, a.cash, a.mediaTotal, oldFphm).then((res) => {
                _this.props.finalpaymentInit();
                // _this.props.update();
                _this.setState({ isPrint: false });
                _this.props.router.push("/home");
            })
            return;
        } else {
            //收银练习处理
            if (_this.props.djlb === "Y7") {
                handleEjoural.call(_this, "item", 4);
                // _this.props.update();
                _this.props.init();
                _this.setState({ isPrint: false });
                _this.props.router.push("/presale");
                return;
            }

            //记录钱箱金额
            let a = window.SyncCASHIER({
                cash: cashTotal,
                dealNumbers: 1,
                mediaTotal: _this.props.zdyftotal,
                na: !!_this.props.salePayments.filter(v => v.paycode === '0602') ? Number(_this.props.zdyftotal - _this.props.sjtotal) : _this.props.zdyftotal
            })
            _this.setState({
                na: a.na
            }, () => {
                handleEjoural.call(_this, "item", 4)
                if (octozzSalePrintData === 1) _this.props.update();
            })
            //更新收银机状态
            const updateSyjstateFunc = () => {
                updateSyjstate.call(_this, a.dealNumbers, a.cash, a.mediaTotal, oldFphm).then((status) => {
                    _this.props.init();
                    // _this.props.update();
                    let promptNum = _this.props.interval || 0;
                    let info = {
                        title: intl.get("LOCK_TIP"),
                        okText: intl.get("INFO_CONFIRMA"),
                        content: intl.get("INFO_CASHEXCESS"),
                    };
                    if (status === '0') {
                        Modal.info(info);
                        _this.setState({ isPrint: false });
                        _this.props.router.push("/home");
                        return;
                    } else if (status === '8' && promptNum < 2) { //状态为8为现金溢出
                        if (promptNum === 0) {//第一次提示
                            Modal.info(info);
                            _this.props.cashierWarn(1);
                        } else if (promptNum === 1) {//第二次提示（超出峰值允许交易）
                            let record = window["SyncCASHIER"]({
                                cash: 0,
                                dealNumbers: 0
                            });
                            let { cashsale, maxxj } = _this.props.syspara;
                            let tranSales = cashsale.split(',');
                            if (parseFloat(record.cash) > parseFloat(tranSales[1])) {
                                Modal.info(info);
                                _this.props.cashierWarn(2);
                            }
                        }
                    }
                    _this.setState({ isPrint: false });
                    _this.props.history.push(_this.props.isDiningHall ? "/square" : "/presale");
                })
            }
            if (_this.props.isDiningHall && !_this.props.breadFlag) {
                // processFlag为1则打印后厨 processFlag为0则什么都不打
                let goodsList = _this.state.submitResult.goodsList.filter(v => v.processFlag == 1)
                let groupByGoodsList = _this.groupBy(goodsList, item => {
                    return [item.stallCode]
                })
                // let groupByGoodsList = _this.groupBy(_this.state.submitResult.goodsList, item => {
                //     return [item.stallCode]
                // })
                //常购商品剔除
                let list = groupByGoodsList.filter(v => v[0].stallCode !== '');
                let refno = _this.props.syjh + _this.props.fphm
                if (_this.props.pagerType == 'KH') {
                    _this.handleKHPrintFunc(list, refno, _this.state.submitResult.saleDate, updateSyjstateFunc, [], true)
                } else {
                    _this.handleWPPrintFunc(list, refno, _this.state.submitResult.saleDate, updateSyjstateFunc, [], true)
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
        octozzSalePrintData.head[0].refno = _this.props.syjh + _this.props.fphm,  //ref值
            octozzSalePrintData.head[0].fphm = _this.props.fphm,  //ref值
            // octozzSalePrintData.head[0].hykh = that.props.vip_no;   //会员号
            octozzSalePrintData.head[0].octopusRechargeTotal = "" + Number(_this.state.change).toFixed(2); //(找零)充值金额
        octozzSalePrintData.head[0].orgiRefno = octoZlzzOrgiRef;
        octozzSalePrintData.head[0].zl = _this.state.change; //找零金额
        octozzSalePrintData.head[0].printtype = "0"; //热敏
        octozzSalePrintData.head[0].barcodeString = _this.props.mkt + _this.props.syjh + _this.props.xph,//门店号+收银机号+小票号
            // console.log("timeout1000找零增值八达通小票:", octozzSalePrintData);
            setTimeout(() => {
                window.Print(octozzSalePrintData, (data) => {
                    //printData, isACS, cashTotal, data, isSDYN, isPTFQ, octoZlzzNeedsPrint, octozzSalePrintData, octoZlzzOrgiRef
                    _this.printAfter(octozzSalePrintData, isACS, cashTotal, data, isSDYN, isPTFQ, false, 1)
                });
            }, 1000);
        return;
    }

    //各种平推热敏打印
    if (data && data.code == "0" && printData.head[0].printtype === "1" && !isACS && !isSDYN && !isPTFQ) {
        message("印單完成請取回收據");
        if (_this.state.type !== "2") {
            let newPrintData = { ...printData }
            newPrintData.Module = "SalePrint";
            if (_this.props.isDiningHall) {
                newPrintData.Module = "MS_SalePrint";
            }
            newPrintData.head[0].printtype = "0";
            console.log("热敏打印")
            console.log(printData)
            window.Print(newPrintData, (data) => {
                _this.printAfter(newPrintData, isACS, cashTotal, data, isSDYN, isPTFQ, octoZlzzNeedsPrint, octozzSalePrintData, octoZlzzOrgiRef, oldFphm)
            });
        } else if (printData.head[0].isflPrint && _this.state.type == "2") {
            let sPrintData = { ...printData }
            sPrintData.Module = "SinglePrint";
            sPrintData.head[0].printtype = "0";
            console.log("热敏打印")
            window.Print(sPrintData, (data) => {
                _this.printAfter(sPrintData, isACS, cashTotal, data, isSDYN, null, null, null, null, oldFphm)
            });
        }
    } else if (data && data.code == "0" && printData.head[0].printtype === "1" && isACS && _this.state.type !== "2") {
        _this.setState({ isPrint: false });
        message("印單完成請取回收據")
        if (isSDYN && printData.Module !== "CJPrint") {
            setTimeout(() => {
                let __this = _this;
                isSDYN = false;
                let newPrintData = { ...printData }
                newPrintData.Module = "CJPrint";
                Modal.success({
                    className: 'vla-confirm',
                    title: '請放入AEON法定除舊服務記錄，然後按確定！',
                    okText: "確定",
                    content: '',
                    onOk() {
                        __this.setState({ isPrint: true }, () => {
                            window.Print(newPrintData, (data) => {
                                __this.printAfter(newPrintData, isACS, cashTotal, data, isSDYN, isPTFQ, octoZlzzNeedsPrint, octozzSalePrintData, octoZlzzOrgiRef, oldFphm)
                            });
                        })
                    }
                })
            }, 3000)
        } else {
            setTimeout(() => {
                let __this = _this;
                isACS = false;
                let newPrintData = { ...printData }
                newPrintData.Module = "ACSMEMOPrint";
                Modal.success({
                    className: 'vla-confirm',
                    title: '請放入SALES MEMO，然後按確定',
                    okText: "確定",
                    content: '',
                    onOk() {
                        __this.setState({ isPrint: true }, () => {
                            window.Print(newPrintData, (data) => {
                                __this.printAfter(newPrintData, isACS, cashTotal, data, isSDYN, isPTFQ, octoZlzzNeedsPrint, octozzSalePrintData, octoZlzzOrgiRef, oldFphm)
                            });
                            console.log("SALES MEMO打印")
                        })
                    }
                })
            }, 3000)
        }
    } else if (data && data.code == "0" && printData.head[0].printtype === "1" && isACS && _this.state.type == "2") {
        message("印單完成請取回收據");
        if (printData.head[0].isflPrint) {
            let newPrintData = { ...printData }
            newPrintData.Module = "SinglePrint";
            newPrintData.head[0].printtype = "0";
            console.log("热敏打印")
            window.Print(newPrintData, (data) => {
                _this.printAfter(newPrintData, isACS, cashTotal, data, isSDYN, isPTFQ, octoZlzzNeedsPrint, octozzSalePrintData, octoZlzzOrgiRef, oldFphm)
            });
        }
    } else if (data && data.code == "0" && printData.head[0].printtype === "1" && isSDYN && _this.props.expressNumber) {
        _this.setState({ isPrint: false });
        message("印單完成請取回收據")
        if (isACS) {
            setTimeout(() => {
                let __this = _this;
                isACS = false;
                let newPrintData = { ...printData }
                newPrintData.Module = "ACSFQPrint";
                Modal.success({
                    className: 'vla-confirm',
                    title: '請放入AEON信貸財務分期批核表，然後按確定',
                    okText: "確定",
                    content: '',
                    onOk() {
                        __this.setState({ isPrint: true }, () => {
                            window.Print(newPrintData, (data) => {
                                __this.printAfter(newPrintData, isACS, cashTotal, data, isSDYN, isPTFQ, octoZlzzNeedsPrint, octozzSalePrintData, octoZlzzOrgiRef, oldFphm)
                            });
                        })
                    }
                })
            }, 3000)
        } else {
            setTimeout(() => {
                let __this = _this;
                isSDYN = false;
                let newPrintData = { ...printData }
                if (newPrintData.head[0].isdc === "Y") {
                    newPrintData.Module = "DCPrint";
                } else if (newPrintData.head[0].ishs === "Y") {
                    newPrintData.Module = "DeliveryPrint";
                } else if (_this.props.isDj) {
                    newPrintData.Module = "PressPrint";
                }
                Modal.success({
                    className: 'vla-confirm',
                    title: '請放入SALES MEMO，然後按確定',
                    okText: "確定",
                    content: '',
                    onOk() {
                        __this.setState({ isPrint: true }, () => {
                            window.Print(newPrintData, (data) => {
                                __this.printAfter(newPrintData, isACS, cashTotal, data, isSDYN, isPTFQ, octoZlzzNeedsPrint, octozzSalePrintData, octoZlzzOrgiRef, oldFphm)
                            });
                            console.log("SALES MEMO打印")
                        })
                    }
                })
            }, 3000)
        }
    } else if (isPTFQ) {
        _this.setState({ isPrint: false });
        setTimeout(() => {
            let __this = _this;
            isPTFQ = false;
            let newPrintData = { ...printData }
            newPrintData.Module = "FQPrint";
            Modal.success({
                className: 'vla-confirm',
                title: '請放入SALES MEMO，然後按確定',
                okText: "確定",
                content: '',
                onOk() {
                    __this.setState({ isPrint: true }, () => {
                        window.Print(newPrintData, (data) => {
                            __this.printAfter(newPrintData, isACS, cashTotal, data, isSDYN, isPTFQ, octoZlzzNeedsPrint, octozzSalePrintData, octoZlzzOrgiRef, oldFphm)
                        });
                        console.log("普通分期打印")
                    })
                }
            })
        }, 3000)
    }
}


//更新收银机状态
export function updateSyjstate(syjcurinvbs, syjcurcashje, syjcurinvje, oldFphm = this.props.fphm) {
    let _this = this;
    localStorage.setItem('fphm', moment(new Date()).format('YYMMDD') + _this.props.syjh + oldFphm);
    const req = {
        command_id: "UPDATECASHIERSTATUSCERTIFY",
        mkt: _this.props.mkt,//门店号
        syjh: _this.props.syjh,//收银机号
        syjcursyyh: _this.props.operators,//收银机当前收银员
        syjcurinvje,//收银机当前交易金额
        syjcurstatus: "6",//收银机当前状态
        syjcurinvbs,//收银机当前交易笔数
        syjcurcashje,//收银机当前现金金额
        syjcurnum: oldFphm,//收银机当前小票号
        erpCode: _this.props.jygs,//经营公司
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

/** 取消付款 */
export function cancelPay() {
    let _this = this;
    let req = {
        command_id: "CANCELPAYCERTIFY",
        terminalOperator: _this.props.operators,
        shopCode: _this.props.mkt,
        terminalNo: _this.props.syjh,
        flowNo: _this.props.flowNo,
    };
    return Fetch({
        url: Url.base_url,
        type: "POST",
        data: req
    }).then(res => {
        if (res.returncode === "0") {
            _this.props.history.goBack();
        }else{
            message(res.data);
            return false
        }
    }).catch((error) => {
        console.error('error', error);
        // throw new Error(error);
    });
}

