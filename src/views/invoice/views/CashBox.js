import React, {Component} from 'react';
import {Form, Input} from 'antd';
import calculate from '../../../common/calculate'
import PayKeypad from '../../../common/components/showPaybox/payKeypad/views/payKeypad.js'
import message from '@/common/components/message';

const FormItem = Form.Item;
let name = 'payValue'; //转换输入框值
let qxValue = false;

//无状态组件
class CashBox extends Component {

    //打开数字小键盘
    openKeypad = (key, state) => {
        name = key;
        qxValue = state;
    }

    onInput = (value, choose) => {
        //第一次输入数字键盘，会覆盖输入款的值
        if (this.state.isFirst) {
            this.setState({
                [name]: value,
                isFirst: false,
            });
            return
        }
        if(choose){
            this.setState({
                [name]: value,
            });
            return;
        }
        let _value = this.state[name];
        if (qxValue == true) {
            _value = ""
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
    }

    onOk = () => {
        if (this.state[name] === '') {
            return false
        }
        this.handlesSubmit()
    }


    componentWillUnmount() {

    }

    constructor(props) {
        super(props);
        let syyf = calculate.doubleConvert(this.props.syyf / this.props.payDialogData.pyhl, 2, 1)
        this.state = {
            isFirst: true,//第一次点击数字键盘
            payInput: false,
            payValue: this.accuracy(syyf, this.props.payDialogData.sswrfs),
            isTextChanged: false,
            syyf: this.accuracy(syyf, this.props.payDialogData.sswrfs),
            ybsyyf: this.accuracy(this.props.syyf, this.props.payDialogData.sswrfs),
            keyboard: [],
            style: this.props.payDialogData.code == this.props.syspara.bbcodeHBFH[0] ? '105px' : '0px'
        };
    }

    componentDidMount() {
        if (this.props.payDialogData.code == this.props.syspara.bbcodeHBFH[0]) {
            this.setState({
                keyboard: [     //可选的键盘
                    {name: this.props.syspara.bbcodeHBFH[1]+"20", value: "20"},
                    {name: this.props.syspara.bbcodeHBFH[1]+"50", value: "50"},
                    {name: this.props.syspara.bbcodeHBFH[1]+"100", value: "100"},
                    {name: this.props.syspara.bbcodeHBFH[1]+"500", value: "500"}
                ]
            })
        }
    }

    //计算精度0-精确到分、1-四舍五入到角、2-截断到角、3-四舍五入到元、4-截断到元、5-进位到角、6-进位到元7-5舍6入到角
    accuracy(num, sswrfs) {
        let syyf;
        switch (sswrfs) {
            case "0" || 0: {
                syyf = (Math.round(num * 100) / 100).toFixed(2); // 精确到分
                return syyf;
            }
            case "1" || 1: {
                syyf = (Math.round(num * 10) / 10).toFixed(1); // 精确到角
                return syyf;
            }
            case "2" || 2: {
                syyf = (parseInt(num * 10) / 10).toFixed(1); // 截断到角
                return syyf;
            }
            case "3" || 3: {
                syyf = Math.round(num); // 精确到元
                return syyf;
            }
            case "4" || 4: {
                syyf = parseInt(num); // 截断到元
                return syyf;
            }
            default: {
                syyf = num;
                return syyf;
            }
        }
    }

    //onchange添加后可以直接input框输入
    handleChange(e) {
        this.setState({isTextChanged: true});
        this.setState({
            payValue: this.props.checkInputMoney(e.target.value)
        });
    }

    handlesSubmit(e) {
        // e.preventDefault();
        let cash;
        let bbje;
        // if (this.state.isTextChanged) {
        if (this.state.payValue) {
            cash = Number(this.state.payValue);
            if (isNaN(Number(cash))) {
                message('請輸入正確金額！', 1);
                return;
            }
            else if (this.props.payDialogData.isyy === 'N' && cash > this.state.syyf) {
                message('不允許溢余！', 1);
                return;
            }
            else if (cash < this.props.payDialogData.minval || cash > this.props.payDialogData.maxval) {
                message('超出付款金額範圍！ '+this.props.payDialogData.minval+'~'+this.props.payDialogData.maxval, 1);
                return;
            }
            // else if (Number(cash) - Number(this.state.syyf) > Number(this.props.syspara.chglimit)) {//系统找零参数(还未定系统参数)
            //     message('找零金额超限！');
            //     return;
            // }
        } else {
            message('請輸入正確金額！');
            return;
        }
        bbje = calculate.doubleConvert(cash * this.props.payDialogData.pyhl, 2, 1)
        // } else {
        //     cash = this.state.syyf;
        //     bbje = this.state.ybsyyf;
        //     if (cash < this.props.payDialogData.minval || cash > this.props.payDialogData.maxval) {
        //         message('超出付款金额范围！');
        //         return;
        //     }
        // }
        console.log(cash)
        console.log(bbje)
        if (!!this.props.callback) {
            this.props.callback(cash, bbje);
        }
    }

    render() {
        return (
            <div>
                <div className="modal">
                </div>
                <div className="cashBox">
                    <div className="cashBoxCon" style={{width: '603px', height: '512px'}}>
                        <p className="title">
                            {this.props.payDialogData.name}
                            <img src={require('@/common/image/paytk_close.png')} alt="取消"
                                 onClick={() => {
                                     this.props.hidePayDialog();
                                 }}/>
                        </p>
                        <div className="inputBox">
                            <p style={{
                                fontSize: '18px',
                                color: '#BE4C94',
                                width: '360px',
                                paddingBottom: '8px',
                                marginLeft: this.state.style
                            }}>剩余應付{this.props.payDialogData.name}金額：<span style={{fontSize:'23px',fontWeight:'600'}}>{this.state.syyf}</span></p>
                            <p style={{
                                fontSize: '18px',
                                color: '#BE4C94',
                                width: '360px',
                                paddingBottom: '8px',
                                marginLeft: this.state.style
                            }}>{this.props.payDialogData.name}支付匯率：{this.props.payDialogData.pyhl}</p>
                            <Form onSubmit={this.handlesSubmit.bind(this)}>
                                <FormItem className="xjzf">
                                    <Input className="xjzfInput"
                                           ref="xjzfInput"
                                           style={{width: '360px',  marginLeft: this.state.style}}
                                           onFocus={() => {
                                               let input = this.refs.xjzfInput.input;
                                               input.select();
                                               this.openKeypad('payValue', true)
                                           }}
                                           value={this.state.payValue}
                                           onChange={this.handleChange.bind(this)}
                                    />
                                </FormItem>
                            </Form>
                            <PayKeypad onInput={this.onInput} onBack={this.onBack} onClear={this.onClear}
                                       onOk={this.onOk} keyboard={this.state.keyboard}/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}

export default CashBox;