import React, { Component } from 'react';
import { Form, Input } from 'antd';
import moment from 'moment'
import calculate from '@/common/calculate'
import EventEmitter from '@/eventemitter';
import PayKeypad from '../payKeypad/views/payKeypad.js'
import message from '@/common/components/message';

const FormItem = Form.Item;

class StoreValueCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            payValue: this.props.syyf + '',
            isFirst: true,
            cardNo: '', //储值卡卡号,
            passwd: '', //储值卡密码
            isChangeName: false
        };
        
        this.name = '';
    }

    componentDidMount() {
        EventEmitter.on('Card', this.searchcardNo);
        EventEmitter.on('Scan', this.searchcardNo);
    }

    componentWillUnmount() {
        EventEmitter.on('Card', this.searchcardNo);
        EventEmitter.on('Scan', this.searchcardNo);
    }

    searchcardNo = data => {
        if (data) {
            this.setState({cardNo: data});
        }
    }
     
    //打开数字小键盘
    openKeypad = (key) => {
        if (key !== this.name) {
            this.setState({isChangeName: true});
        }
        this.name = key;
    }

    onOk = () => {
        let {orderType} = this.props.extra;
        if (this.state[this.name] === '') {
            return false
        }
        if (this.state.cardNo === '') {
            message('请输入卡号！');
            return false
        }
        if(this.state.passwd === '') {
            message('请输入密码！')
            return false
        }
        this.handleSubmit();
    }

    changeValue = (value) => {
        this.setState({
            [this.name]: value,
        });
    }

    handleChange(e) {
        this.setState({
            payValue: this.state.isFirst ? e.target.value.substr(e.target.value.length -1 , 1) : this.props.checkInputMoney(e.target.value, this.state.payValue),
            isFirst: false
        }); 
    }

    cardNoChange(e) {
        this.setState({cardNo: e.target.value})
    }

    passwdChange(e) {
        this.setState({passwd: e.target.value})
    }

    handleSubmit(e) {
        const {orderType} = this.props.extra;
        e && e.preventDefault();
        let cash;
        let bbje;
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
        } else {
            message('請輸入正確金額！');
            return;
        }
        bbje = calculate.doubleConvert(cash * this.props.payDialogData.pyhl, 2, 1)
        console.log(cash)
        console.log(bbje)
        let params = {
            cash: cash + '',
            bbje,
            cardNo: this.state.cardNo,
            passwd: this.state.passwd
        };
        switch (orderType) {
            case '4': 
                this.props.storeValuePay('return', params);
            break;
            case '2': 
                this.props.storeValuePay('return', params);
            break;
            default:
                this.props.storeValuePay('sale', params);
            break;              
        }
    }

    render () {
        const {orderType} = this.props.extra;
        const {refModal} = this.props.payDialogData;
        const formItemLayout = {
            labelCol: { span: 5 },
            wrapperCol: { span: 19 },
        };
        let modalHeight = '600px' 
        return (
            <div>
                <div className="modal">
                </div>
                <div className="cashBox">
                <div className="cashBoxCon" style={{width: '603px', height: modalHeight}}>
                        <p className="title">
                            {this.props.payDialogData.name}
                            <img src={require('@/common/image/paytk_close.png')} alt="取消"
                                 onClick={() => {
                                     this.props.onHidePay();
                                 }}/>
                        </p>
                        <div className="inputBox">
                            <p  className = 'BankP'style={{ textAlign: 'left', width: '360px', fontSize: '23px' }}>类型：<b>{orderType === '4' ? '退货' : (orderType === '2' ? '消单': '销售' )}</b></p>
                            <Form onSubmit={this.handleSubmit.bind(this)}>
                                <FormItem className="xjzf" label= "金额：" {...formItemLayout}>
                                    <Input className="xjzfInput"
                                           ref="xjzfInput"
                                           autoFocus
                                           placeholder = '请输入金额'
                                           style={{width: '360px',  marginLeft: this.state.style, marginBottom: '20px'}}
                                           value={this.state.payValue}
                                           onFocus = {() => {this.openKeypad('payValue')}}
                                           onChange={this.handleChange.bind(this)}
                                    />
                                </FormItem>
                                <FormItem className="xjzf" label='卡号：' {...formItemLayout}>
                                    <Input className="xjzfInput"
                                        ref="xjzfInput"
                                        placeholder = '请输入卡号'
                                        style={{width: '360px',  marginLeft: this.state.style, marginBottom: '20px'}}
                                        value={this.state.cardNo}
                                        onFocus = {() => {this.openKeypad('cardNo')}}
                                        onChange={this.cardNoChange.bind(this)}
                                    />
                                </FormItem>
                                <FormItem className="xjzf" label="密码：" {...formItemLayout}>
                                    <Input className="xjzfInput"
                                        ref="xjzfInput"
                                        placeholder = '请输入密码'                                            
                                        style={{width: '360px',  marginLeft: this.state.style, marginBottom: '20px'}}
                                        value={this.state.passwd}
                                        onFocus = {() => {this.openKeypad('passwd')}}
                                        onChange={this.passwdChange.bind(this)}
                                    />
                                </FormItem>
                            </Form>
                            <PayKeypad 
                            onOk={this.onOk}
                            style = {{'marginLeft': '100px'}}
                            keyboard= {this.state.keyboard} 
                            callback = {this.props.checkInputMoney}
                            name = {this.name}
                            oldValue = {this.state[this.name]} 
                            changeValue = {this.changeValue}/>
                        </div>
                </div>
                </div>
            </div>
        )
    }
}

export default StoreValueCard