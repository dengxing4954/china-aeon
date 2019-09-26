//微支付
import React, { Component } from 'react';
import { Form, Button, Input, Spin } from 'antd';
import { Fetch } from '@/fetch/';
import Url from '@/config/url.js';
import { Modal } from "antd/lib/index";
import PayKeypad from '@/common/components/showPaybox/payKeypad/views/payKeypad.js'
import calculate from '@/common/calculate'
import message from '@/common/components/message';
import moment from 'moment';
import '../style/invoice.less'
import intl from 'react-intl-universal';

const FormItem = Form.Item;
let name = ''; //转换输入框值
let qxValue = false;
let payWZF;
let octoWaitingModal = null;

//无状态组件
class AllVPayBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isTextChanged: false,
            payBarCode: "",
            isPay: true,
            isPayQuery: true,
            payQueryCount: 0,
            pendding: false
        };
    }

    componentDidMount() {
        let that = this;
        console.log('AllVPayBox----DidMount: ', this.state, this.props, this);
        let input = this.xjzfInput.input;
        input.focus();
        if (this.props.extraData.type === "1" && (this.props.syyf < this.props.payDialogData.minval || this.props.syyf > this.props.payDialogData.maxval)) {
            message('超出付款金額範圍！');
            this.props.hidePayDialog();
            return;
        }
        if (this.props.extraData.type === "4" || this.props.extraData.type === "2") {
            console.log('AllVPayBox----return: ', this.state, this.props.payDialogData, this.props.extraData);
            let _refcode = "";
            let _paylist = this.props.extraData.exceptPaycodes;
            if (!!_paylist && _paylist.length > 0) {
                for (let i = 0; i < _paylist.length; i++) {
                    if (payWZF.indexOf(_paylist[i].paycode) != -1
                        && !!_paylist[i].refCode
                        && _paylist[i] != "") {
                        _refcode = _paylist[i].refCode;
                        break;
                    }
                }
            }
            let _tradeNo = this.props.extraData.mkt + "0" + this.props.extraData.mkt + moment().format('YYYYMMDDHHmmss') + this.props.extraData.syjh + this.props.extraData.fphm;  // 支付单号: erpcode+门店号+收银机号+日期时间
            console.log('AllVPayBox----_refcode: ', _refcode, _tradeNo);
            const req = {
                "command_id": "AEONPAYREFUND",
                "flow_no": this.props.extraData.flow_no,  // 当前流水号
                "mkt": this.props.extraData.mkt,      // 门店号
                "operators": this.props.extraData.operators,
                "syjh": this.props.extraData.syjh,     // 终端号
                "fphm": this.props.extraData.fphm,     // 小票号
                "je": (this.props.syyf * 100).toFixed(),       // 支付金额（单位：分  int类型）
                "oldtradeno": _refcode,
                "tradeno": _tradeNo,
                "hl": this.props.payDialogData.pyhl,
                "sswrjd": this.props.payDialogData.sswrjd,
                "sswrfs": this.props.payDialogData.sswrfs,
                "paytype": this.props.payDialogData.paytype,
                "paycode": this.props.payDialogData.code,
                "apitype": "A",
                "opttype": "C"

            };
            Fetch(
                {
                    url: Url.base_url,
                    type: "POST",
                    data: req
                }
            ).then(res => {
                console.log('AllVPayBox----payQuery----canceled: ', res);
                if (res.retflag === "0") {
                    message('退款成功！');
                    console.log("退款成功: ", res);
                    that.octoWaitEnd();
                    that.props.hidePayDialog();
                    if (!!that.props.callback) {
                        that.props.callback(res);
                    }
                    return res;
                } else {
                    message('退款失敗');
                    that.octoWaitEnd();
                    that.props.hidePayDialog();
                    return null;
                }
            }).catch(err => {
                console.log('AllVPayBox----payQuery----err: ', err);
                message(that.props.payDialogData.name + '支付失敗');
                that.octoWaitEnd();
                that.props.hidePayDialog();
                return null;
            });
            return null;
        }
        console.log("AllVPayBox componentDidMount: ", this.props);
    }

    componentWillUnmount() {
    }

    //打开数字小键盘
    openKeypad = (key, state) => {
        name = key;
        qxValue = state;
    }

    onInput = (value) => {
        let _value = this.state[name];
        if (qxValue == true) {
            _value = ""
        }
        if (value === '.') {
            message('非數字鍵請重新輸入');
            return;
        }
        this.setState({
            [name]: _value + value
        });
        qxValue = false
    }

    onBack = () => {
        let value = this.state[name];
        this.setState({
            [name]: value.substring(0, value.length - 1)
        });
    }

    onClear = () => {
        this.setState({
            [name]: ''
        });
    }

    onOk = () => {
        if (this.state.pendding===true) {
            return false
        } else {
            this.setState({pendding: true}, ()=>{
                if (this.state[name] === '') {
                    return false
                }
                this.handlesSubmit()
            });
        }
    }

    handleChange(e) {
        this.setState({
            isTextChanged: true,
            payBarCode: e.target.value
        });
    }

    octoWaitEnd = () => {
        if (!!octoWaitingModal) {
            octoWaitingModal.destroy()
        }
    }

    octoWaitStart = () => {
        octoWaitingModal = Modal.info({
            className: "octoWaiting",
            content: (<div><Spin /> &nbsp; {"請稍候，正在付款..."}</div>)
        });
    }

    doPayQuery(_payReq, _payReqCcl) {
        let that = this;
        if (this.state.payQueryCount > 11) {
            Fetch(
                {
                    url: Url.base_url,
                    type: "POST",
                    data: _payReqCcl
                }
            ).then(res => {
                console.log('AllVPayBox----payQuery----canceled: ', res);
                message(this.props.payDialogData.name + '支付失敗');
                that.setState({pendding: false}, ()=>{
                    that.octoWaitEnd();
                });
                that.props.hidePayDialog();
                return null;
            }).catch(err => {
                message(that.props.payDialogData.name + '支付失敗');
                that.setState({pendding: false}, ()=>{
                    that.octoWaitEnd();
                });
                that.props.hidePayDialog();
                return null;
            });
            return null;
        } else {
            Fetch(
                {
                    url: Url.base_url,
                    type: "POST",
                    data: _payReq
                }
            ).then(res => {
                console.log('AllVPayBox----payQuery: ', res);
                if (res.retflag === "0") {
                    // 支付成功
                    console.log("payQuery 支付成功: ", res);
                    that.setState({pendding: false}, ()=>{
                        that.octoWaitEnd();
                    });
                    that.props.hidePayDialog();
                    if (!!that.props.callback) {
                        // that.props.callback(res.salePayments[0].je, calculate.doubleConvert(res.salePayments[0].je * this.props.payDialogData.props.payDialogData.zlhl, 2, 1), res)
                        if (res.salePayments[0].payname == undefined) {
                            res.salePayments[0].payname = that.props.payDialogData.name;
                        }
                        that.props.callback(res);
                    }
                    return res;
                } else {
                    // AEONPAYQUERY返回不为0时，走原4000流程，避免发生手机扣款成功，查询却无此单（19.5.8 by Sean）
                    // 每5秒轮询，持续30秒，直至成功
                    // 超询超时，撤销支付
                    that.setState({
                        payQueryCount: that.state.payQueryCount + 1
                    }, () => {
                        setTimeout(() => {
                            console.log("payQuery again: ", that.state.payQueryCount);
                            return that.doPayQuery(_payReq, _payReqCcl);
                        }, 5000);
                    })
                }
                // } else if (res.retflag === "4000") {
                //     // 每5秒轮询，持续30秒，直至成功
                //     // 超询超时，撤销支付
                //     that.setState({
                //         payQueryCount: that.state.payQueryCount + 1
                //     }, () => {
                //         setTimeout(() => {
                //             console.log("payQuery again: ", that.state.payQueryCount);
                //             return that.doPayQuery(_payReq, _payReqCcl);
                //         }, 5000);
                //     })
                // } else {
                //     Modal.error({
                //         title: this.props.payDialogData.name + '支付失敗',
                //         okText: '確定',
                //         content: res.retmsg,
                //     });
                //     that.setState({pendding: false}, ()=>{
                //         that.octoWaitEnd();
                //     });
                //     that.props.hidePayDialog();
                //     return null;
                // }
            }).catch(err => {
                Modal.error({
                    title: this.props.payDialogData.name + '支付失敗',
                    okText: '確定',
                    content: err,
                });
                that.setState({pendding: false}, ()=>{
                    that.octoWaitEnd();
                });
                that.props.hidePayDialog();
                return null;
            });
        }
    }

    handlesSubmit(e) {
        let that = this;
        console.log("付款金额范围: ", this.props)
        // console.log("付款金额范围: ", this.props.payDialogData.minval, " -- ", this.props.payDialogData.maxval)
        if (this.state.payBarCode == "") {
            message("請輸入付款碼");
            return false;
        }
        this.octoWaitStart();
        let _tradeNo = this.props.extraData.mkt + "0" + this.props.extraData.mkt + moment().format('YYYYMMDDHHmmss') + this.props.extraData.syjh + this.props.extraData.fphm;  // 支付单号: erpcode+门店号+收银机号+日期时间
        const req = {
            "command_id": "AEONPAY",
            "mkt": this.props.extraData.mkt,      // 门店号
            "flow_no": this.props.extraData.flow_no,
            "operators": this.props.extraData.operators,
            "syjh": this.props.extraData.syjh,     // 终端号
            "fphm": this.props.extraData.fphm,     // 小票号
            "qdtype": "A",
            "tradeno": _tradeNo,
            "je": (this.props.syyf * 100).toFixed(),    // this.props.syyf,       // 支付金额（单位：分  int类型）
            "paybarcode": this.state.payBarCode,   // 支付码     this.state.payBarCode
        };
        console.log('AEONPAY----req: ', req);
        Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then(res => {
            console.log('AllVPayBox----AEONPAY res: ', res);
            let payReq = {
                "command_id": "AEONPAYQUERY",
                "mkt": this.props.extraData.mkt,      // 门店号
                "flow_no": this.props.extraData.flow_no,  // 当前流水号
                "operators": this.props.extraData.operators,
                "fphm": this.props.extraData.fphm,     // 小票号
                "tradeno": _tradeNo,
                "opttype": "B",     //默认 B-支付
                "syjh": this.props.extraData.syjh,     // 终端号
                "paytype": this.props.payDialogData.paytype,
                "paycode": this.props.payDialogData.code,
                "payname": this.props.payDialogData.name,
                "je": (this.props.syyf * 100).toFixed(),    // this.props.syyf,       // 支付金额（单位：分  int类型）
                "hl": this.props.payDialogData.zlhl,
                "sswrjd": this.props.payDialogData.sswrjd,
                "sswrfs": this.props.payDialogData.sswrfs,
                "apitype": "A",     //默认 A-交易
                "querytype": 0
            };
            let payReqCcl = {
                "command_id": "AEONPAYREVOKE",
                "mkt": this.props.extraData.mkt,      // 门店号
                // "puid"
                "flow_no": this.props.extraData.flow_no,  // 当前流水号
                "fphm": this.props.extraData.fphm,     // 小票号
                "syjh": this.props.extraData.syjh,     // 终端号
                "operators": this.props.extraData.operators,
                "apitype": "A",     //默认 A-交易
                "querytype": 0,
                "oldtradeno": _tradeNo,
                "hl": this.props.payDialogData.zlhl,
                "sswrjd": this.props.payDialogData.sswrjd,
            };
            if (res.retflag === "0") {
                let payQueryRes = this.doPayQuery(payReq, payReqCcl);
                console.log("--0--[" + this.state.payQueryCount + "]--payQueryRes: ", payQueryRes);
            } else if (res.retflag === "4000") {
                // 每5秒轮询，持续30秒，直至成功
                // 超询超时，撤销支付
                let payQueryRes = this.doPayQuery(payReq, payReqCcl);
                console.log("--4000--[" + this.state.payQueryCount + "]--payQueryRes: ", payQueryRes);
            } else {
                Modal.error({
                    title: this.props.payDialogData.name + '支付失敗',
                    okText: '確定',
                    content: res.retmsg,
                });
                that.setState({pendding: false}, ()=>{
                    that.octoWaitEnd();
                });
            }
        }).catch(err => {
            Modal.error({
                title: this.props.payDialogData.name + '支付失敗',
                okText: '確定',
                content: err,
            });
            that.setState({pendding: false}, ()=>{
                that.octoWaitEnd();
            });
        })
        return false;
    }

    box() {
        this.props.syspara.payObj.map((item) => {
            let str = item.split(',');
            if (str[0] == "payWZF") {
                payWZF = item
            }
            // else if(str[0] == "payPapercoupons"){
            //     payPapercoupons = item
            // }else if(str[0] == "payDircoupons"){
            //     payDircoupons = item
            // }
        })
        if (payWZF.indexOf(this.props.payDialogData.code) != -1) {
            return (<div className="cashBoxCon" style={{ width: '603px', height: '262px' }}>
                <p className="title">
                    {this.props.payDialogData.name}
                    <img src={require('@/common/image/paytk_close.png')} alt="取消"
                        onClick={this.props.hidePayDialog} />
                </p>
                <div className="inputBox">
                    <p style={{
                        fontSize: '18px',
                        color: '#BE4C94',
                        width: '360px',
                        paddingBottom: '8px',
                        marginLeft: this.state.style
                    }}>应付金额：<span style={{ fontSize: '23px', fontWeight: '600' }}>{this.props.syyf}</span></p>
                    {/* <p style={{
                        fontSize: '18px',
                        color: '#BE4C94',
                        width: '360px',
                        paddingBottom: '8px',
                        marginLeft: this.state.style
                    }}>{this.props.payDialogData.name}支付汇率：{this.props.payDialogData.pyhl}</p> */}
                    <Form>
                        <FormItem className="xjzf">
                            <Input className="xjzfInput"
                                ref="xjzfInput"
                                ref={(input) => { this.xjzfInput = input; }}
                                onFocus={() => {
                                    let input = this.xjzfInput.input;
                                    input.select();
                                    this.openKeypad('payBarCode', true)
                                }}
                                placeholder="請掃描付款"
                                value={this.state.payBarCode}
                                onChange={this.handleChange.bind(this)}
                                onPressEnter={this.onOk}
                            />
                        </FormItem>
                    </Form>
                    {/*
                    <PayKeypad onInput={this.onInput} onBack={this.onBack} onClear={this.onClear}
                        onOk={this.onOk} />
                    */}
                </div>
            </div>);
        }
    }

    render() {
        return (
            <div>
                <div className="modal">
                </div>
                <div className="cashBox">
                    {this.box()}
                </div>
            </div>
        );
    }
}

export default AllVPayBox;
