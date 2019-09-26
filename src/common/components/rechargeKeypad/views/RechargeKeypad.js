import React, { Component } from 'react';
import { Modal, Col, Button, Icon, Radio, Alert, Input } from 'antd';
import '../style/RechargeKeypad.less';
import store from '@/Store.js';
import withKeyBoard from '@/common/components/keyBoard';

//小键盘
class RechargeKeypad extends Component {

    static defaultProps = {
        title: '',
        errMessage: '',
        placeholder: '请输入内容',
        hasKeyboard: true
    };

    constructor(props) {
        super(props)
        this.state = {
            num: props.defaultValue || '',
            hasErr: false,
            type: '',   //判断上次为固定金额（"choose"）还是数字（"input"）
            fixedKeyboard: [     //固定键盘
                {name: "7", value: "7"},
                {name: "8", value: "8"},
                {name: "9", value: "9"},
                {name: "4", value: "4"},
                {name: "5", value: "5"},
                {name: "6", value: "6"},
                {name: "1", value: "1"},
                {name: "2", value: "2"},
                {name: "3", value: "3"},
                {name: "0", value: "0"},
                {name: "00", value: "00"},
                {name: ".", value: "."},
                //{name: "删除", value: "-1"},
            ],
            tabValue: props.tabs ? props.tabs[0].value : null
        }
    }


    componentDidMount() {
        if(true || this.props.keyControl) {
            this.props.bind({
                //pageUP
                "33": () => {
                    
                },
                //pageDown
                "34": () => {
                },
                //end
                "35": this.handleCancel,
                //home
                "36": this.handleOk,
                //left
                "37": () => {
                    if(this.props.tabs) this.handleKeyTabs('left');
                },
                //right
                "39": () => {
                    if(this.props.tabs) this.handleKeyTabs('right');
                },
            });
        }
        if(this.props.event) {
            if(this.props.event.tabValue) {
                if(this.props.tabs[0].value === this.props.event.tabValue) {
                    this.props.event.chooseEvent();
                    return;
                } else {
                    return;
                }
            }
            this.props.event.chooseEvent();
        }
    }

    componentWillUnmount() {
        if(this.props.event) {
            this.props.event.cancelEvent();
        }
    }

    handleKeyTabs = (type) => {
        const {tabs} = this.props;
        let {tabValue} = this.state;
        let index = tabs.indexOf(tabs.find(item => item.value === tabValue));
        if(!tabs) return;
        switch (type) {
            case 'left': 
                if(tabValue !== tabs[0].value) {
                    tabValue = tabs[index - 1].value
                } 
                break;
            case 'right':
                if(tabValue !== tabs[tabs.length - 1].value) {
                    tabValue = tabs[index + 1].value
                }
                break;
            default:
                break;
        }
        this.setState({tabValue})
    }

    handleOk = () => {
        const { onOk, close } = this.props;
        if(onOk) {
            let okFn = onOk();
            if(okFn && okFn.constructor === Promise.prototype.constructor) {
                okFn.then(() => {
                    close();
                })
            } else {
                close();
            }
            return;
        }
        close();
    }

    handleOk = () => {
        const { callback, close} = this.props;
        if(this.state.hasErr || this.state.num === '') {
            return false;
        }
        if(callback) {
            let callbackFn = callback(this.state.num, this.state.tabValue);
            if(callbackFn && callbackFn.constructor === Promise.prototype.constructor) {
                callbackFn.then(() => {
                    close();
                })
            } else if(callbackFn === false) {
                return;
            } else {
                close();
            }
            return;
        }
        close();
    }

    handleCancel = () => {
        const { cancelCallback, close} = this.props;
        if(cancelCallback) {
            let callbackFn = cancelCallback();
            if(callbackFn && callbackFn.constructor === Promise.prototype.constructor) {
                callbackFn.then(() => {
                    close();
                })
            } else {
                close();
            }
            return;
        }
        close();
    }

    //输入价格
    handleNumInput = (value) => {
        let { num, type, hasErr } = this.state;
        if (type === "choose" && value !== "-1") {
            num = value
        } else {
            if (value === "-1") {
                if (num === "") {
                    return false;
                }
                if (num.length === 1) {
                    num = "";
                } else {
                    num = num.substring(0, num.length-1)
                }
            } else {
                if (num === "") {
                    /*if (value === '00' || value === '.') {
                        return false;
                    }*/
                    num = value;
                } else {
                    num = num + value;
                }
            }
        }
        hasErr = this.handleValidate(num);
        this.setState({num, hasErr, type: "input"})
    }

    handleClear = () => {
        this.setState({
            num: "",
            type: 'choose',
        })
    }

    handleBack = () => {
        this.handleNumInput("-1");
    }

    //选择价格
    handleNumChoose = (value) => {
        this.setState({
            num: value,
            hasErr: false,
            type: 'choose'
        })
    }

    handleValidate = (value) => {
        if (this.props.rule && !this.props.rule(value)) {
            return true;
        }
        return false;
    }

    handleTabChange = (e) => {
        this.setState({
            tabValue: e.target.value
        })
        if(this.props.event && this.props.event.tabValue) {
            if(e.target.value === this.props.event.tabValue) {
                this.props.event.chooseEvent();
            } else {
                this.props.event.cancelEvent();
            }
        }
    }

    inputChange = (e) => {
        let { hasErr } = this.state;
        hasErr = this.handleValidate(e.target.value);
        this.setState({
            hasErr,
            num: e.target.value
        })
    }

    render() {
        const { keyboard, title, errMessage, placeholder, tabs, info, hasKeyboard } = this.props;
        return (
            <Modal className={`rechargeKeypad ${this.props.keyControl && false? "rechargeKeypad_keyControl" : ""}`}
                   width={keyboard ? 431 : 348}
                   visible={true}
                   title={
                        <div>
                            <span>{title}</span>
                        </div>
                   }
                   footer={
                        this.props.keyControl && false ? null : <Button onClick={this.handleCancel}>取消</Button>
                   }>
                {info ?
                    <Alert message={info} type="warning" /> : null
                }
                {tabs ?
                    <Radio.Group  className="tabSelect"
                                  value={this.state.tabValue}
                                  onChange={this.handleTabChange}>
                        {tabs.map(item =>
                            <Radio.Button key={item.value}
                                          value={item.value}>{item.name}</Radio.Button>
                        )}
                    </Radio.Group> : null
                }
                <div className="numInput">
                    {/*<span>{this.state.num === '' ? placeholder : this.state.num}</span>*/}
                    <Input autoFocus={true}
                           type="text"
                           value={this.state.num}
                           onChange={this.inputChange}/>
                </div>
                {errMessage ?
                    <div className="errMessage">
                        {this.state.hasErr ? errMessage : ""}
                    </div> : null
                }
                {hasKeyboard && (!this.props.keyControl || true) ?
                <div className="kaypad">
                    {keyboard ?
                    <div  className="kaypad_self">
                        {keyboard.map(item =>
                                <Button key={item.value}
                                        onClick={() => this.handleNumChoose(item.value)}>{item.name}</Button>
                        )}
                    </div> : null}
                    <div className="kaypad_le">
                        {this.state.fixedKeyboard.map((item) =>
                            <Col span={8} key={item.value}>
                                <Button onClick={() => this.handleNumInput(item.value)}>{item.name}</Button>
                            </Col>
                        )}
                    </div>
                    <div  className="kaypad_ri">
                        <Button className="clear_button" onClick={this.handleClear}>清空</Button>
                        <Button className="back_button" onClick={this.handleBack}>退格</Button>
                        <Button className="ok_button" onClick={this.handleOk}>確定</Button>
                    </div>
                    <span className="clearfix"></span>
                </div> : <div className="kaypad"></div> }
                <input style={{display:"none"}}></input>
            </Modal>
        );
    }
}

export default withKeyBoard(RechargeKeypad)