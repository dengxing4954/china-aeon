//银行支付
import React, { Component } from 'react';
import { Form, Input, Tabs, Button } from 'antd';
import PayKeypad from '../../../common/components/showPaybox/payKeypad/views/payKeypad.js'
import EventEmitter from '@/eventemitter';
import message from '@/common/components/message';

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
let name = 'payValue'; //转换输入框值
let qxValue = false;//全选控制

class BankBox extends Component {

    //打开数字小键盘
    openKeypad = (key, state) => {
        name = key;
        qxValue = state;
    }

    onInput = (value) => {
        //第一次输入数字键盘，会覆盖输入款的值
        if (this.state.isFirst && name == "yxDate") {
            this.setState({
                isFirst: false,
            });
        } else if (this.state.isFirst && name !== "yxDate") {
            this.setState({
                [name]: value,
                isFirst: false,
            });
            qxValue = false
            return
        }

        let _value = this.state[name];
        if (qxValue == true && this.state[name] !== "") {
            _value = ""
        }

        if (name == "cardId" && this.state.cardId.length == 19) {
            message("手工輸入卡號須最多能夠接受19個數字位");
            return;
        }

        this.setState({
            [name]: this.props.checkInputMoney(_value + value, _value)
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
        console.log(this.props.payDialogData)
    }
    onOk = () => {
        console.log("bankclick first1");
        if (this.state[name] === '') {
            return false
        } else if (this.state.key == 1) {
            if (name == "traceNum") {
                let input = this.refs.yhInput.input;
                input.select();
                this.setState({ showcardlog: false }, () => {
                    this.openKeypad('payValue', true)
                })
                return;
            } else if (name == "cardId") {
                let input = this.refs.approvlInput.input;
                input.select();
                this.setState({ showcardlog: false }, () => {
                    this.openKeypad('traceNum', true)
                })
                return;
            } else if (name == "yxDate") {
                if (this.state.yxDate.length !== 4 && this.props.payDialogData.cardPayType !== "5") {
                    message("請輸入有效日期格式：MMYY,例如0918");
                    return;
                } else if (this.compareDate(this.state.yxDate) && this.props.payDialogData.cardPayType !== "5") {
                    message("日期已過期！");
                    return;
                } else if ((this.state.yxDate.length > 8 || !this.state.yxDate) && this.props.payDialogData.cardPayType === "5") {
                    message("請輸入TID,不超過八位數");
                    return;
                } else {
                    let input = this.acsInput.input;
                    input.select();
                    this.setState({ showcardlog: true }, () => {
                        this.openKeypad('cardId', true)
                    })
                    return;
                }
            } else if (name == "payValue") {
                this.handlesSubmit()
            }
        } else {
            this.handlesSubmit()
        }
    }

    handleClear = (key) => {
        // this.state.formitemArr[this.state.key].map(item => {
        //     this.setValue({ [item]: null });
        // });
        if (key == 0) {
            let input = this.refs.yhzfInput.input;
            input.select();
            this.openKeypad('payValue', true)
            this.setState({
                key: parseInt(key, 10),
                height: '550px'
            });
        } else {
            if (this.props.payDialogData.cardPayType === "5") {
                let input = this.acsInput.input;
                input.select();
                this.openKeypad('cardId', true)
                this.setState({
                    key: parseInt(key, 10),
                    height: '724px'
                });
            } else {
                let input = this.yxDateInput.input;
                input.select();
                this.openKeypad('yxDate', true)
                this.setState({
                    key: parseInt(key, 10),
                    height: '724px'
                });
            }
        }
    }

    compareDate = (cardDate) => {
        let myDate = new Date();
        let myYear = myDate.getFullYear();
        myYear = myYear.toString().slice(2, 4);
        let myMonth = myDate.getMonth() + 1;
        let cardMonyh = cardDate.slice(0, 2);
        let cardYear = cardDate.slice(2, 4);
        if (cardYear < myYear) {
            return true;
        } else if (cardYear == myYear && cardMonyh < myMonth) {
            return true;
        } else {
            return false;
        }
    }

    searchCardNum = (data) => {
        console.log(data)
        console.log(this.props.payDialogData)
        if (data) {
            if (!data.split('=')[1] || data.split('=')[1].length < 4) return message("错误，请重新刷卡！");
            if (this.compareDate(data.split('=')[1].slice(2, 4) + data.split('=')[1].slice(0, 2))) {
                message("日期已過期！");
            }
            if (this.props.payDialogData.cardPayType !== "5") {
                this.setState({
                    cardId: data.split('=')[0],
                    yxDate: data.split('=')[1].slice(2, 4) + data.split('=')[1].slice(0, 2),
                }, () => {
                    if (this.props.payDialogData.cardPayType === "0" && this.props.extra.staffCard) {
                        this.handlesjykhSubmit()
                    } else {
                        let input = this.refs.approvlInput.input;
                        input.select();
                        this.setState({ showcardlog: false }, () => {
                            this.openKeypad('traceNum', true)
                        })
                        return;
                    }
                })
            } else {
                this.setState({
                    cardId: data.split('=')[0]
                }, () => {
                    if (this.props.payDialogData.cardPayType === "0" && this.props.extra.staffCard) {
                        this.handlesjykhSubmit()
                    } else {
                        let input = this.refs.approvlInput.input;
                        input.select();
                        this.setState({ showcardlog: false }, () => {
                            this.openKeypad('traceNum', true)
                        })
                        return;
                    }
                })
            }
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            payValue: this.props.syyf,
            isFirst: true,//第一次点击数字键盘
            key: 0,
            height: '550px',
            traceNum: '',
            cardId: '',
            ischeckCardId: false,
            yxDate: '',
            showcardlog: false
        };
    }

    hidePayDialog = () => {
        name = 'payValue';
        this.props.hidePayDialog();
    }

    componentWillUnmount() {
        EventEmitter.off('Card', this.searchCardNum);
    }

    componentDidMount() {
        EventEmitter.on('Card', this.searchCardNum);
        console.log('check========' + this.props.payDialogData.cardPayType + this.props.extra.staffCard)
        if (this.props.payDialogData.cardPayType !== "0" || !this.props.extra.cardBin || null === this.props.extra.cardBin || '' === this.props.extra.cardBin) {
            this.setState({
                ischeckCardId: true
            })
        } else {
            // this.cardIdInput.input.focus();
        }
    }

    handleChange(e) {
        this.setState({ isTextChanged: true });
        this.setState({
            payValue: this.props.checkInputMoney(e.target.value)
        });
    }

    handleYXQChange(e) {
        this.setState({
            yxDate: e.target.value
        });
    }

    handleCardChange(e) {
        this.setState({
            cardId: e.target.value
        });
    }

    handleTRAChange(e) {
        this.setState({
            traceNum: e.target.value
        });
    }

    handlesSubmit(e) {
        if ('N' === this.props.payDialogData.isyy && this.state.payValue > this.props.syyf) {
            message('Not allow input over amount balance', 1);
            return
        } else if (this.state.payValue < this.props.payDialogData.minval || this.state.payValue > this.props.payDialogData.maxval) {
            message('超出付款金額範圍！' + this.props.payDialogData.minval + '~' + this.props.payDialogData.maxval, 1);
            return;
        }
        if (this.state.key == "1") {
            if (this.state.cardId === "" || (this.state.yxDate === "" && this.props.payDialogData.cardPayType !== "5") || this.state.traceNum === "") {
                message('請輸入完整數據');
                return;
            } else if (this.state.yxDate.length !== 4 && this.props.payDialogData.cardPayType !== "5") {
                message("請輸入有效日期格式：MMYY,例如0918");
                return;
            } else if (this.compareDate(this.state.yxDate) && this.props.payDialogData.cardPayType !== "5") {
                message("日期已過期！");
                return;
            } else if ((this.state.yxDate.length > 8 || !this.state.yxDate) && this.props.payDialogData.cardPayType === "5") {
                message("請輸入TID,不超过八位数");
                return;
            } else {
                console.log("bankclick first2");
                this.props.PaymentBankFunc(this.state.payValue, this.state.key, this.state.traceNum, this.state.cardId, this.state.yxDate);
            }
        } else {
            this.props.PaymentBankFunc(this.state.payValue, this.state.key, this.state.traceNum, this.state.cardId, this.state.yxDate);
        }
    }

    handlesjykhSubmit(e) {
        console.log('check' + this.state.cardId + this.props.extra.staffCard)
        console.log("cardBin: ", this.props.extra.cardBin);
        let cardExists = false;
        if (!!this.props.extra.cardBin) {
            let cbins = this.props.extra.cardBin.split(",");
            for (let i = 0; i < cbins.length; i++) {
                if (this.state.cardId.startsWith(cbins[i])) {
                    cardExists = true;
                    break;
                }
            }
        }
        // if (this.state.cardId && this.state.cardId === this.props.extra.staffCard) {
        if (this.state.cardId && cardExists) {
            this.setState({ ischeckCardId: true })
        } else {
            message('此卡不能使用員工購物', 1)
            this.setState({ cardId: '' });
            if (e) e.preventDefault();
        }
    }

    render() {
        const formItemLayout = {
            labelCol: { span: 7 },
            wrapperCol: { span: 17 },
        };
        let box = this.state.ischeckCardId ?
            <div>
                <div className="modal">
                </div>
                <div className="cashBox">
                    <div className="cashBoxCon" style={{ width: '603px', height: this.state.height }}>
                        <p className="title">
                            {this.props.payDialogData.name}
                            <img src={require('@/common/image/paytk_close.png')} alt="取消"
                                onClick={this.hidePayDialog} />
                        </p>
                        <Tabs defaultActiveKey="0" onChange={this.handleClear}>
                            <TabPane tab="online" key="0" forceRender={true}>
                                <div className="inputBox">
                                    <p style={{ textAlign: 'left', width: '360px', fontSize: '23px' }}>類型：<b>銷售</b></p>
                                    <Form onSubmit={this.handlesSubmit.bind(this)}>
                                        <FormItem className="xjzf">
                                            <Input className="xjzfInput"
                                                ref="yhzfInput"
                                                onFocus={() => {
                                                    let input = this.refs.yhzfInput.input;
                                                    input.select();
                                                    this.setState({ showcardlog: false }, () => {
                                                        this.openKeypad('payValue', true)
                                                    })
                                                }}
                                                value={this.state.payValue}
                                                onChange={this.handleChange.bind(this)}
                                            />
                                        </FormItem>
                                    </Form>
                                    <PayKeypad onInput={this.onInput} onBack={this.onBack} onClear={this.onClear}
                                        onOk={this.onOk} showcardlog={this.state.showcardlog} />
                                </div>
                            </TabPane>
                            <TabPane tab="offline" key="1" forceRender={true}>
                                <div className="inputBox">
                                    <div style={{
                                        textAlign: 'left',
                                        width: '360px',
                                        fontSize: '.18rem',
                                        lineHeight: '.40rem',
                                        color: 'rgba(0, 0, 0, 0.85)',
                                        display: 'flex'
                                    }}><p style={{ width: "29.16666667%" }}>類型：</p><b>銷售</b></div>
                                    <Form onSubmit={this.handlesSubmit.bind(this)}>
                                        <FormItem
                                            className="zkje"
                                            label={this.props.payDialogData.cardPayType !== "5" ? "卡有效日期：" : "TID："}
                                            {...formItemLayout}
                                            style={{ marginBottom: '15px' }}>
                                            <Input className="xjzfInput"
                                                size="large"
                                                readOnly
                                                ref={(input) => {
                                                    this.yxDateInput = input;
                                                }}
                                                onFocus={() => {
                                                    let input = this.yxDateInput.input;
                                                    input.select();
                                                    this.openKeypad('yxDate', true)
                                                }}
                                                value={this.state.yxDate}
                                                placeholder={this.props.payDialogData.cardPayType !== "5" ? "請輸入卡有效日期(MMYY)" : "請輸入TID"}
                                                onChange={this.handleYXQChange.bind(this)} />
                                        </FormItem>
                                        <FormItem
                                            className="zkje"
                                            label="卡号："
                                            {...formItemLayout}
                                            style={{ marginBottom: '15px' }}>
                                            <Input className="xjzfInput"
                                                readOnly
                                                placeholder="請輸入卡號"
                                                ref={(input) => {
                                                    this.acsInput = input;
                                                }}
                                                size="large"
                                                onFocus={() => {
                                                    let input = this.acsInput.input;
                                                    input.select();
                                                    this.setState({ showcardlog: true }, () => {
                                                        this.openKeypad('cardId', true)
                                                    })
                                                }}
                                                value={this.state.cardId}
                                                onChange={this.handleCardChange.bind(this)} />
                                        </FormItem>
                                        {
                                            this.props.payDialogData.cardPayType === "5" ? <FormItem
                                                className="zkje"
                                                label={"EPS ISN"}
                                                {...formItemLayout}
                                                style={{ marginBottom: '15px' }}>
                                                <Input className="xjzfInput"
                                                    ref="approvlInput"
                                                    size="large"
                                                    readOnly
                                                    onFocus={() => {
                                                        let input = this.refs.approvlInput.input;
                                                        input.select();
                                                        this.openKeypad('traceNum', true)
                                                    }}
                                                    value={this.state.traceNum}
                                                    placeholder={"請輸入EPS ISN"}
                                                    onChange={this.handleTRAChange.bind(this)}
                                                />
                                            </FormItem> : <FormItem
                                                className="zkje"
                                                label={"授權編號："}
                                                {...formItemLayout}
                                                style={{ marginBottom: '15px' }}>
                                                    <Input className="xjzfInput"
                                                        readOnly
                                                        ref="approvlInput"
                                                        size="large"
                                                        onFocus={() => {
                                                            let input = this.refs.approvlInput.input;
                                                            input.select();
                                                            this.openKeypad('traceNum', true)
                                                        }}
                                                        value={this.state.traceNum}
                                                        placeholder={"請輸入卡單的APP CODE"}
                                                        onChange={this.handleTRAChange.bind(this)}
                                                    />
                                                </FormItem>
                                        }
                                        <FormItem
                                            label="金額："
                                            {...formItemLayout}
                                            className="zkje">
                                            <Input className="xjzfInput"
                                                size="large"
                                                ref="yhInput"
                                                onFocus={() => {
                                                    let input = this.refs.yhInput.input;
                                                    input.select();
                                                    this.setState({ showcardlog: false }, () => {
                                                        this.openKeypad('payValue', true)
                                                    })
                                                }}
                                                value={this.state.payValue}
                                                onChange={this.handleChange.bind(this)}
                                            />
                                        </FormItem>
                                    </Form>
                                    <PayKeypad onInput={this.onInput} onBack={this.onBack} onClear={this.onClear}
                                        onOk={this.onOk} showcardlog={this.state.showcardlog} />
                                </div>
                            </TabPane>
                        </Tabs>
                    </div>
                </div>
            </div>
            : <div>
                <div className="modal">
                </div>
                <div className="cashBox">
                    <div className="jykh">
                        <p className="title">
                            {"此單為員工購物，請刷卡校驗卡號"}
                            <img src={require('@/common/image/paytk_close.png')} alt="取消"
                                onClick={this.props.hidePayDialog} />
                        </p>
                        <div className="inputBox">
                            <Form layout="inline">
                                <FormItem className="xjzf">
                                    <Input className="xjzfInput"
                                        placeholder="請刷卡"
                                        ref={(input) => {
                                            this.cardIdInput = input;
                                        }}
                                        value={this.state.cardId}
                                        // onChange={this.handleCardChange.bind(this)}
                                    />
                                </FormItem>
                                {/*<Button className="jybutton" onClick={() => {*/}
                                {/*console.log('check' + this.state.cardId + this.props.extra.staffCard)*/}
                                {/*if(this.state.cardId && this.state.cardId === this.props.extra.staffCard){*/}
                                {/*this.setState({ischeckCardId: true})*/}
                                {/*}*/}
                                {/*else*/}
                                {/*{*/}
                                {/*message('驗證失敗')*/}
                                {/*}*/}
                                {/*}}>確定</Button>*/}
                            </Form>
                            {/*<Button onClick={() => {
                            }}>取消</Button>*/}
                        </div>
                    </div>
                </div>
            </div>;
        return this.props.extra.type == "1" || "Y6" == this.props.extra.type ? box : (<div>
            <div className="modal">
            </div>
            <div className="cashBox">
                <div className="cashBoxCon" style={{ width: '603px', height: this.state.height }}>
                    <p className="title">
                        {this.props.payDialogData.name}
                        <img src={require('@/common/image/paytk_close.png')} alt="取消"
                            onClick={this.props.hidePayDialog} />
                    </p>
                    <Tabs defaultActiveKey="0" onChange={this.handleClear}>
                        <TabPane tab="online" key="0" forceRender={true}>
                            <div className="inputBox">
                                <p style={{ textAlign: 'left', width: '360px', fontSize: '23px' }}>類型：<b>退貨</b></p>
                                <Form onSubmit={this.handlesSubmit.bind(this)}>
                                    <FormItem className="xjzf">
                                        <Input className="xjzfInput"
                                            ref="yhzfInput"
                                            onFocus={() => {
                                                let input = this.refs.yhzfInput.input;
                                                input.select();
                                                this.setState({ showcardlog: false }, () => {
                                                    this.openKeypad('payValue', true)
                                                })
                                            }}
                                            value={this.state.payValue}
                                            onChange={this.handleChange.bind(this)}
                                        />
                                    </FormItem>
                                </Form>
                                <PayKeypad onInput={this.onInput} onBack={this.onBack} onClear={this.onClear}
                                    onOk={this.onOk} showcardlog={this.state.showcardlog} />
                            </div>
                        </TabPane>
                        <TabPane tab="offline" key="1" forceRender={true}>
                            <div className="inputBox">
                                <div style={{
                                    textAlign: 'left',
                                    width: '360px',
                                    fontSize: '.18rem',
                                    lineHeight: '.40rem',
                                    color: 'rgba(0, 0, 0, 0.85)',
                                    display: 'flex'
                                }}><p style={{ width: "29.16666667%" }}>類型：</p><b>退貨</b></div>
                                <Form onSubmit={this.handlesSubmit.bind(this)}>
                                    <FormItem
                                        className="zkje"
                                        label={this.props.payDialogData.cardPayType !== "5" ? "卡有效日期：" : "TID："}
                                        {...formItemLayout}
                                        style={{ marginBottom: '15px' }}>
                                        <Input className="xjzfInput"
                                            size="large"
                                            ref={(input) => {
                                                this.yxDateInput = input;
                                            }}
                                            onFocus={() => {
                                                let input = this.yxDateInput.input;
                                                input.select();
                                                this.openKeypad('yxDate', true)
                                            }}
                                            value={this.state.yxDate}
                                            placeholder={this.props.payDialogData.cardPayType !== "5" ? "請輸入卡有效日期(MMYY)" : "請輸入TID"}
                                            onChange={this.handleYXQChange.bind(this)} />
                                    </FormItem>
                                    <FormItem
                                        className="zkje"
                                        label="卡号："
                                        {...formItemLayout}
                                        style={{ marginBottom: '15px' }}>
                                        <Input className="xjzfInput"
                                            placeholder="請輸入卡號"
                                            ref={(input) => {
                                                this.acsInput = input;
                                            }}
                                            size="large"
                                            onFocus={() => {
                                                let input = this.acsInput.input;
                                                input.select();
                                                this.setState({ showcardlog: true }, () => {
                                                    this.openKeypad('cardId', true)
                                                })
                                            }}
                                            value={this.state.cardId}
                                            onChange={this.handleCardChange.bind(this)} />
                                    </FormItem>
                                    {
                                        this.props.payDialogData.cardPayType === "5" ? <FormItem
                                            className="zkje"
                                            label={"EPS ISN"}
                                            {...formItemLayout}
                                            style={{ marginBottom: '15px' }}>
                                            <Input className="xjzfInput"
                                                ref="approvlInput"
                                                size="large"
                                                onFocus={() => {
                                                    let input = this.refs.approvlInput.input;
                                                    input.select();
                                                    this.openKeypad('traceNum', true)
                                                }}
                                                value={this.state.traceNum}
                                                placeholder={"請輸入EPS ISN"}
                                                onChange={this.handleTRAChange.bind(this)}
                                            />
                                        </FormItem> : <FormItem
                                            className="zkje"
                                            label={"授權編號："}
                                            {...formItemLayout}
                                            style={{ marginBottom: '15px' }}>
                                                <Input className="xjzfInput"
                                                    ref="approvlInput"
                                                    size="large"
                                                    onFocus={() => {
                                                        let input = this.refs.approvlInput.input;
                                                        input.select();
                                                        this.openKeypad('traceNum', true)
                                                    }}
                                                    value={this.state.traceNum}
                                                    placeholder={"請輸入卡單的APP CODE"}
                                                    onChange={this.handleTRAChange.bind(this)}
                                                />
                                            </FormItem>
                                    }
                                    <FormItem
                                        label="金額："
                                        {...formItemLayout}
                                        className="zkje">
                                        <Input className="xjzfInput"
                                            size="large"
                                            ref="yhInput"
                                            onFocus={() => {
                                                let input = this.refs.yhInput.input;
                                                input.select();
                                                this.setState({ showcardlog: false }, () => {
                                                    this.openKeypad('payValue', true)
                                                })
                                            }}
                                            value={this.state.payValue}
                                            onChange={this.handleChange.bind(this)}
                                        />
                                    </FormItem>
                                </Form>
                                <PayKeypad onInput={this.onInput} onBack={this.onBack} onClear={this.onClear}
                                    onOk={this.onOk} showcardlog={this.state.showcardlog} />
                            </div>
                        </TabPane>
                    </Tabs>
                    {/* <div className="inputBox">
                        <p style={{ textAlign: 'left', width: '360px', fontSize: '23px' }}>類型：<b>退貨</b></p>
                        <Form onSubmit={this.handlesSubmit.bind(this)}>
                            <FormItem className="xjzf">
                                <Input className="xjzfInput"
                                    placeholder="請輸入Trace Number"
                                    ref="yhzfInput"
                                    onFocus={() => {
                                        let input = this.refs.yhzfInput.input;
                                        input.select();
                                        this.openKeypad('traceNum', true)
                                    }}
                                    value={this.state.traceNum}
                                    onChange={this.handleTRAChange.bind(this)}
                                />
                            </FormItem>
                        </Form>
                        <PayKeypad onInput={this.onInput} onBack={this.onBack} onClear={this.onClear}
                            onOk={this.onOk} showcardlog={this.state.showcardlog} />
                    </div> */}
                </div>
            </div>
        </div>)
    }

}

export default BankBox;