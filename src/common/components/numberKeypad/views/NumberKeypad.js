import React, { Component } from 'react';
import { Modal, Button, Icon } from 'antd';
import '../style/NumberKeypad.less';

//小键盘
export default class RechargeKeypad extends Component {

    static defaultProps = {
        /*keyboard: [     //可选的键盘
            {name: "数量10", value: "10"},
            {name: "数量15", value: "15"},
            {name: "数量20", value: "20"},
            {name: "数量25", value: "25"},
            {name: "数量30", value: "30"},
            {name: "数量35", value: "35"},
            {name: "数量40", value: "40"},
            {name: "数量45", value: "45"},
        ],*/
        top: 0,
        left: 0,
        maskClosable: true,
    };

    constructor(props) {
        super(props)
        this.state = {
            hasErr: true,
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
                {name: ".", value: "."},
                //{name: <Icon type="arrow-left" />, value: "-1"},
                {name: "取消", value: "-1"},
            ],
        }
    }

    componentDidMount() {
        /*if(this.props.boundInput) {
            this.props.boundInput.onBlur =  () => {
                this.props.close();
            }
        }*/
        if(this.props.maskClosable) {
            setTimeout(() => {
                if(document.getElementById('numberKeypad')) {
                    window.addEventListener('click', this.autoClose);
                }
            }, 15)
        }
        if(this.props.boundInput) {
            setTimeout(() => {
                this.props.boundInput.focus();
            }, 300)
        }
    }

    componentWillUnmount() {
        if(this.props.maskClosable) {
            window.removeEventListener('click', this.autoClose);
        }
    }

    componentWillReceiveProps (nextProps) {
    }

    autoClose = () => {
        if(document.getElementsByClassName('vla-message-id').length > 0) {
            return;
        }
        this.props.close();
        window.removeEventListener('click', this.autoClose);
        /* if(this.props.onCancel) {
            this.props.onCancel();
        } */
        if(this.props.afterAutoClose) {
            this.props.afterAutoClose();
        }
    }

    handleOk = (e) => {
        e.stopPropagation()
        const { onOk, close, autoClose } = this.props;
        if(onOk) {
            let okFn = onOk();
            if (autoClose) {
                close();
                return;
            }
            if (okFn === false) {
                return;
            }
            if(okFn && okFn.constructor === Promise.prototype.constructor) {
                okFn.then((res) => {
                    console.log(res);
                    if(res) {
                        close();
                    }
                })
            } else {
                close();
            }
            return;
        }
        close();
    }

    handleCancel = (e) => {
        e.stopPropagation()
        this.props.close();
        if(this.props.onCancel) {
            this.props.onCancel();
        }
    }

    handleBack = (e) => {
        e.stopPropagation()
        const { onBack, boundInput } = this.props;
        if(onBack) {
            onBack();
        }
        if(boundInput) {
            boundInput.focus();
        }
    }

    //输入数字
    handleNumInput = (e,value) => {
        const { onInput, boundInput } = this.props;
        if(value === '-1') {
            this.handleCancel(e);
            return false;
        }
        e.stopPropagation()
        if (onInput) {
            let { type } = this.state;
            if (type === "choose") {
                onInput(value, true);
            } else {
                onInput(value);
            }
            this.setState({ type: "input" })
        }
        if(boundInput) {
            boundInput.focus();
        }
    }

    //选择固定内容
    handleNumChoose = (e,value) => {
        e.stopPropagation()
        const { onInput, boundInput } = this.props;
        if (onInput) {
            onInput(value, true)
            this.setState({ type: "choose" })
        }
        if(boundInput) {
            boundInput.focus();
        }
    }

    handleClear = (e) => {
        e.stopPropagation()
        const {onClear, boundInput} = this.props;
        if(onClear) {
            this.props.onClear();
        }
        if(boundInput) {
            this.props.boundInput.focus();
        }
    }

    keypadContent = () => {
        const { keyboard } = this.props;
        return (
            <div className="kaypad"  onClick={(e) => e.stopPropagation()}>
                {keyboard &&
                <div className="kaypad_self" span={8}>
                    {keyboard.map(item =>
                            <Button key={item.value}
                                    className="user_button"
                                    onClick={(e) => this.handleNumChoose(e,item.value)}>{item.name}</Button>
                    )}
                </div>}
                <div className="kaypad_le">
                    {this.state.fixedKeyboard.map((item) =>
                            <Button key={item.value}
                                    className="fixed_button"
                                    onClick={(e) => this.handleNumInput(e,item.value)}>{item.name}</Button>
                    )}
                </div>
                <div className="kaypad_ri">
                    <Button className="clear_button" onClick={this.handleClear}>清空</Button>
                    <Button className="back_button" onClick={this.handleBack}>后退</Button>
                    <Button className="ok_button" onClick={this.handleOk}>确定</Button>
                </div>
                <span className="clearfix"></span>
            </div>
        )
    }

    render() {
        const { keyboard, top, left, maskClosable } = this.props;
        if(maskClosable) {
            return (
                <div className="numberKeypad"
                     style={{top: top, left: left + 361 , width: keyboard? 420 : 348}}
                     width={keyboard? 514 : 348}>
                    {this.keypadContent()}
                </div>
            );
        } else {
            return (
                <Modal wrapClassName="numberKeypad_modal"
                       maskClosable={false}
                       mask={false}
                       footer={null}
                       style={{top: top, left: left + 31}}
                       width={keyboard? 514 : 348}
                       visible={true}>
                    {this.keypadContent()}
                </Modal>
            )
        }
    }
}