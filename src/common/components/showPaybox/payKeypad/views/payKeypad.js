import React, {Component} from 'react';
import {Button, Icon} from 'antd';
import '../style/payKeypad.less';
import intl from 'react-intl-universal';

//小键盘
export default class PayKeypad extends Component {

    intl = (key, params = {}) => {
        return intl.get(key, params);
    }

    //确定
    handleOk = () => {
        const {onOk} = this.props;
        if (onOk) {
            let okFn = onOk();
            if (!okFn) {
                return
            }
        }
    }

    //输入数字
    handleNumInput = (value) => {
        const {onInput, onBack} = this.props;
        if (value === '-1') {
            if (onBack) {
                onBack();
            }
            return false;
        }
        if (onInput) {
            let {type} = this.state;
            if (type === "choose") {
                onInput(value, true);

            } else {
                onInput(value);
            }
            this.setState({type: "input"})
        }
    }

    //选择固定内容
    handleNumChoose = (value) => {
        const {onInput} = this.props;
        if (onInput) {
            onInput(value, true)
            this.setState({type: "choose"})
        }
    }

    //清空
    handleClear = () => {
        if (this.props.onClear) {
            this.props.onClear();
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            type: '',   //判断上次为固定金额（"choose"）还是数字（"input"）
        }
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    render() {
        return (
            <div className="keypad">
                {this.props.keyboard ? <div className="right">
                    {this.props.keyboard.map(item =>
                        <Button key={item.value}
                                className="fixed_button rightbutton"
                                onClick={() => this.handleNumChoose(item.value)}>{item.name}</Button>
                    )}
                </div> : null}
                {this.props.zmqh === true ?
                    <div>
                        <div className="up">
                            <Button className="fixed_button" onClick={() => this.handleNumInput('A')}>A</Button>
                            <Button className="fixed_button" onClick={() => this.handleNumInput('B')}>B</Button>
                            <Button className="fixed_button" onClick={() => this.handleNumInput('C')}>C</Button>
                            <Button className="fixed_button clear" onClick={this.handleClear}>{this.intl("BTN_EMPTY")}</Button>                           
                            <Button className="fixed_button" onClick={() => this.handleNumInput('D')}>D</Button>
                            <Button className="fixed_button" onClick={() => this.handleNumInput('E')}>E</Button>
                            <Button className="fixed_button" onClick={() => this.handleNumInput('F')}>F</Button>
                            <Button className="fixed_button back" onClick={() => this.handleNumInput('-1')}>后退</Button>
                        </div>
                        <div className="down">
                            <div className="down_left">
                                <Button className="fixed_button" onClick={() => this.handleNumInput('G')}>G</Button>
                                <Button className="fixed_button" onClick={() => this.handleNumInput('H')}>H</Button>
                                <Button className="fixed_button" onClick={() => this.handleNumInput('I')}>I</Button>
                                <Button className="zero_button" onClick={() => this.handleNumInput('J')}>J</Button>
                                {this.props.showcardlog === true ?  <Button className="fixed_button dian" onClick={() => this.handleNumInput('*')}>*</Button>:
                                    <Button className="fixed_button dian" onClick={() => this.handleNumInput('.')}>.</Button>}
                            </div>
                            <Button className="ok_button" onClick={this.handleOk}>{this.intl("BTN_CONFIRM")}</Button>
                        </div>
                    </div> :
                    <div>
                    <div className="up">
                        <Button className="fixed_button" onClick={() => this.handleNumInput('7')}>7</Button>
                        <Button className="fixed_button" onClick={() => this.handleNumInput('8')}>8</Button>
                        <Button className="fixed_button" onClick={() => this.handleNumInput('9')}>9</Button>
                        <Button className="fixed_button clear" onClick={this.handleClear}>{this.intl("BTN_EMPTY")}</Button>
                        <Button className="fixed_button" onClick={() => this.handleNumInput('4')}>4</Button>
                        <Button className="fixed_button" onClick={() => this.handleNumInput('5')}>5</Button>
                        <Button className="fixed_button" onClick={() => this.handleNumInput('6')}>6</Button>
                        <Button className="fixed_button back" onClick={() => this.handleNumInput('-1')}>后退</Button>
                    </div>
                    <div className="down">
                    <div className="down_left">
                    <Button className="fixed_button" onClick={() => this.handleNumInput('1')}>1</Button>
                    <Button className="fixed_button" onClick={() => this.handleNumInput('2')}>2</Button>
                    <Button className="fixed_button" onClick={() => this.handleNumInput('3')}>3</Button>
                    <Button className="zero_button" onClick={() => this.handleNumInput('0')}>0</Button>
                        {this.props.showcardlog === true ?  <Button className="fixed_button dian" onClick={() => this.handleNumInput('*')}>*</Button>:
                            <Button className="fixed_button dian" onClick={() => this.handleNumInput('.')}>.</Button>}
                    </div>
                    {!!this.props.hideOk && this.props.hideOk===true ?
                        null :
                        <Button className="ok_button" onClick={this.handleOk}>{!!this.props.okText?this.props.okText:this.intl("BTN_CONFIRM")}</Button>
                    }
                    
                    </div>
                    </div>}
            </div>
        );
    }
}