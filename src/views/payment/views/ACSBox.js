//ACS支付
import React, { Component } from 'react';
import { Form, Input, Row } from 'antd';
import PayKeypad from '../../../common/components/showPaybox/payKeypad/views/payKeypad.js';
import EventEmitter from '@/eventemitter';
import message from '@/common/components/message';
import calculate from "../../../common/calculate";

let qxValue = false;//全选控制

const FormItem = Form.Item;
let name = ''; //转换输入框值
let fqtime = ["6", "9", "12", "18", "24", "30", "36"];
//无状态组件
class ACSBox extends Component {
    openKeypad = (key, state) => {
        name = key;
        qxValue = state;
    }

    onInput = (value) => {
        //第一次输入数字键盘，会覆盖输入款的值
        if (this.state.isFirst && name == "payValue") {
            this.setState({
                [name]: value,
                isFirst: false,
            });
            return
        }

        if (value == "." && name == "memoNum") {
            message("SALES MEMO只允許輸入數字");
            return;
        }
        if (this.state.memoNum.length === 7 && name == "memoNum") {
            message("請輸入7位數字的MEMO Number", 1)
            return;
        }

        let _value = this.state[name];
        if (qxValue == true) {
            _value = ""
        }
        if (value == "." && name == "fqtime") {
            message("請輸入正確分期期數【" + fqtime.join("，") + "】");
        } else {
            this.setState({
                [name]: name === "payValue" ? this.props.checkInputMoney(_value + value, _value) : _value + value
            });
        }
        qxValue = false
    }

    onBack = () => {
        let value = String(this.state[name]);
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
        if (name == "fqtime" && fqtime.indexOf(this.state.fqtime) == -1) {
            message("請輸入正確分期期數【" + fqtime.join("，") + "】")
            return;
        }
        if (name == 'refCode' && this.state.refCode === "") {
            message('請輸入合同編號');
        }
        if (this.state[name] == "") {
            return;
        } else if (this.state.fqtime !== "" && name == "fqtime") {
            if (this.props.extra.type !== "1") {
                this.refCode.input.select();
                this.openKeypad('refCode', true);
            } else {
                this.memoInput.input.select();
                this.openKeypad('memoNum', true);
            }
            return;
        } else if (this.state.refCode !== "" && name == "refCode") {
            this.memoInput.input.select();
            this.openKeypad('memoNum', true);
            return;
        } else if (this.state.fqtime !== "" && name == "cardId" && this.state.cardId !== "") {
            let input = this.memoInput.input;
            input.select();
            this.openKeypad('memoNum', true)
            return;
        } else if (this.state.memoNum == "" && name == "memoNum") {
            return;
        } else if (name == "memoNum") {
            this.handlesSubmit();
        }
    }

    searchCardId = (data) => {
        if (data) {
            this.setState({
                cardId: data.split('=')[0],
                ExpiryDate: data.split('=')[1].slice(0, 4),
                trackData: data
            })
        }
    }

    memoCode = (data) => {
        this.openKeypad('memoNum', true)
        if (data) {
            this.setState({
                memoNum: data
            })
        }
    }

    constructor(props) {
        super(props);
        let syyf = calculate.doubleConvert(this.props.syyf / this.props.payDialogData.pyhl, 2, 1)
        this.state = {
            cardId: '',
            payValue: this.props.syyf,//支付金额
            isFirst: true,//第一次点击数字键盘
            fqtime: "",
            syyf: this.accuracy(syyf, this.props.payDialogData.sswrfs),
            memoNum: this.props.extra.expressNumber || "",
            ExpiryDate: "",
            posEntryMode: "1",
            trackData: "",
            refCode: "",
        };
    }

    componentDidMount() {
        let input = this.fqInput.input;
        input.focus();
        EventEmitter.on('Card', this.searchCardId);
        EventEmitter.on('Scan', this.memoCode);
    }

    componentWillUnmount() {
        EventEmitter.off('Card', this.searchCardId);
        EventEmitter.off('Scan', this.memoCode);
    }

    accuracy(num, sswrfs) {
        switch (sswrfs) {
            case "0" || 0: {
                return (Math.round(num * 100) / 100).toFixed(2); // 精确到分
            }
            case "1" || 1: {
                return (Math.round(num * 10) / 10).toFixed(1); // 精确到角
            }
            case "2" || 2: {
                return (parseInt(num * 10) / 10).toFixed(1); // 截断到角
            }
            case "3" || 3: {
                return Math.round(num); // 精确到元
            }
            case "4" || 4: {
                return parseInt(num); // 截断到元
            }
            default: {
                return num;
            }
        }

    }

    handleKHChange(e) {
        this.setState({
            cardId: e.target.value
        });
    }

    handleChange(e) {
        this.setState({
            payValue: e.target.value
        });
    }

    handleFQChange(e) {
        this.setState({
            fqtime: e.target.value
        });
    }

    handleREFCODEChange(e) {
        this.setState({
            refCode: e.target.value
        });
    }

    handleMEMOChange(e) {
        this.setState({
            memoNum: e.target.value
        });
    }

    handlesSubmit() {
        if (this.props.callback && this.state.payValue && this.state.fqtime && this.state.memoNum) {
            let cash = Number(this.state.payValue);
            let fqtimecheck = fqtime.indexOf(this.state.fqtime);
            if (isNaN(Number(cash))) {
                message('請輸入正確金額！');
                return;
            } else if (this.props.payDialogData.isyy === 'N' && cash > this.state.syyf) {
                message('不允許溢余！');
                return;
            } else if (cash < this.props.payDialogData.minval || cash > this.props.payDialogData.maxval) {
                message('超出付款金額範圍！ ' + this.props.payDialogData.minval + '~' + this.props.payDialogData.maxval, 1);
                return;
            } else if (fqtimecheck == -1) {
                message("請輸入正確分期期數【" + fqtime.join("，") + "】")
                return;
            } else if (this.state.memoNum.length !== 7) {
                message("請輸入7位數字的MEMO Number")
            } else if (this.state.cardId === '' && this.props.extra.type == "1") {
                message("請刷卡")
            } else if (this.props.extra.type !== "1" && this.state.refCode === '') {
                message("請輸入合同編號")
            } else {
                this.props.callback(this.state.cardId, this.state.payValue, this.state.fqtime, this.state.memoNum, this.state.ExpiryDate, this.state.posEntryMode, this.state.trackData, this.state.refCode);
            }
        }
    }

    render() {
        return this.props.extra.type == "1" ? (
            <div>
                <div className="modal">
                </div>
                <div className="cashBox">
                    <div className="cashBoxCon" style={{ width: '850px', height: '550px' }}>
                        <p className="title">
                            {this.props.payDialogData.name}
                            <img src={require('@/common/image/paytk_close.png')} alt="取消"
                                onClick={() => {
                                    this.props.hidePayDialog();
                                }} />
                        </p>
                        <div className="inputBox_quan">
                            <Form onSubmit={this.handlesSubmit.bind(this)} style={{ flex: 1, padding: '0 32px' }}>
                                <FormItem
                                    label="分期期數："
                                    className="zkje"
                                    style={{ marginBottom: '15px' }}>
                                    <Input className="xjzfInput"
                                        size="large"
                                        ref={(input) => { this.fqInput = input; }}
                                        onFocus={() => {
                                            let input = this.fqInput.input;
                                            input.select();
                                            this.openKeypad('fqtime', true)
                                        }}
                                        value={this.state.fqtime}
                                        placeholder="請輸入分期期數"
                                        onChange={this.handleFQChange.bind(this)}
                                        readOnly
                                    />
                                </FormItem>
                                <FormItem
                                    className="zkje"
                                    label="ACS卡號："
                                    style={{ marginBottom: '15px' }}>
                                    <Input className="xjzfInput"
                                        placeholder="請刷ACS會員卡"
                                        ref={(input) => { this.acsInput = input; }}
                                        size="large"
                                        onFocus={() => {
                                            let input = this.acsInput.input;
                                            input.select();
                                            this.openKeypad('cardId', true)
                                        }}
                                        value={this.state.cardId}
                                        onChange={this.handleKHChange.bind(this)}
                                        disabled={true} />
                                </FormItem>
                                <FormItem
                                    className="zkje"
                                    label="Sales Memo："
                                    style={{ marginBottom: '15px' }}>
                                    <Input className="xjzfInput"
                                        placeholder="請掃碼輸入Memo Number"
                                        ref={(input) => { this.memoInput = input; }}
                                        size="large"
                                        onFocus={() => {
                                            let input = this.memoInput.input;
                                            input.select();
                                            this.openKeypad('memoNum', true)
                                        }}
                                        value={this.state.memoNum}
                                        onChange={this.handleMEMOChange.bind(this)}
                                        readOnly
                                    />
                                </FormItem>
                                <FormItem
                                    className="zkje"
                                    label="支付金額：">
                                    <Input className="xjzfInput"
                                        size="large"
                                        ref={(input) => { this.valueInput = input; }}
                                        disabled={true}
                                        onFocus={() => {
                                            let input = this.valueInput.input;
                                            input.select();
                                            this.openKeypad('payValue', true)
                                        }}
                                        value={this.state.payValue}
                                        onChange={this.handleChange.bind(this)} />
                                </FormItem>
                            </Form>
                            <div style={{ flex: 1 }}>
                                <PayKeypad onInput={this.onInput} onBack={this.onBack} onClear={this.onClear}
                                    onOk={this.onOk} />
                            </div>
                        </div>
                        <p style={{ height: '50px', textAlign: 'center', fontSize: '22px' }}>{this.props.tishitext}</p>
                    </div>
                </div>
            </div>
        ) : (
                <div>
                    <div className="modal">
                    </div>
                    <div className="cashBox">
                        <div className="cashBoxCon" style={{ width: '850px', minHeight: '550px' }}>
                            <p className="title">
                                {this.props.payDialogData.name}
                                <img src={require('@/common/image/paytk_close.png')} alt="取消"
                                    onClick={() => {
                                        this.props.hidePayDialog();
                                    }} />
                            </p>
                            <div className="inputBox_quan">
                                <Form onSubmit={this.handlesSubmit.bind(this)} style={{ flex: 1, padding: '0 32px' }}>
                                    <FormItem
                                        label="分期期數："
                                        className="zkje"
                                        style={{ marginBottom: '15px' }}>
                                        <Input className="xjzfInput"
                                            size="large"
                                            ref={(input) => { this.fqInput = input; }}
                                            onFocus={() => {
                                                let input = this.fqInput.input;
                                                input.select();
                                                this.openKeypad('fqtime', true)
                                            }}
                                            value={this.state.fqtime}
                                            placeholder="請輸入分期期數"
                                            onChange={this.handleFQChange.bind(this)} />
                                    </FormItem>
                                    <FormItem
                                        className="zkje"
                                        label="ACS卡號："
                                        style={{ marginBottom: '15px', display: "none" }}>
                                        <Input className="xjzfInput"
                                            placeholder="請刷ACS會員卡"
                                            ref={(input) => { this.acsInput = input; }}
                                            size="large"
                                            onFocus={() => {
                                                let input = this.acsInput.input;
                                                input.select();
                                                this.openKeypad('cardId', true)
                                            }}
                                            value={this.state.cardId}
                                            onChange={this.handleKHChange.bind(this)}
                                            disabled={true}
                                        />
                                    </FormItem>
                                    <FormItem
                                        className="zkje"
                                        label="合同編號："
                                        style={{ marginBottom: '15px' }}>
                                        <Input className="xjzfInput"
                                            placeholder="請輸入合同編號"
                                            ref={(input) => { this.refCode = input; }}
                                            size="large"
                                            onFocus={() => {
                                                let input = this.refCode.input;
                                                input.select();
                                                this.openKeypad('refCode', true)
                                            }}
                                            value={this.state.refCode}
                                            onChange={this.handleREFCODEChange.bind(this)} />
                                    </FormItem>
                                    <FormItem
                                        className="zkje"
                                        label="Sales Memo："
                                        style={{ marginBottom: '15px' }}>
                                        <Input className="xjzfInput"
                                            placeholder="請掃碼輸入Memo Number"
                                            ref={(input) => { this.memoInput = input; }}
                                            size="large"
                                            onFocus={() => {
                                                let input = this.memoInput.input;
                                                input.select();
                                                this.openKeypad('memoNum', true)
                                            }}
                                            value={this.state.memoNum}
                                            onChange={this.handleMEMOChange.bind(this)} />
                                    </FormItem>
                                    <FormItem
                                        className="zkje"
                                        label="支付金額：">
                                        <Input className="xjzfInput"
                                            size="large"
                                            ref={(input) => { this.valueInput = input; }}
                                            disabled={true}
                                            onFocus={() => {
                                                let input = this.valueInput.input;
                                                input.select();
                                                this.openKeypad('payValue', true)
                                            }}
                                            value={this.state.payValue}
                                            onChange={this.handleChange.bind(this)} />
                                    </FormItem>
                                </Form>
                                <div style={{ flex: 1 }}>
                                    <PayKeypad onInput={this.onInput} onBack={this.onBack} onClear={this.onClear}
                                        onOk={this.onOk} />
                                </div>
                            </div>
                            <p style={{ height: '50px', textAlign: 'center', fontSize: '22px' }}>{this.props.tishitext}</p>
                        </div>
                    </div>
                </div>)
    }
}

export default ACSBox;
