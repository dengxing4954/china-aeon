import React, { Component } from 'react';
import { Form, Input } from 'antd';
import moment from 'moment'
import calculate from '@/common/calculate'
import PayKeypad from '../payKeypad/views/payKeypad.js'
import message from '@/common/components/message';

const FormItem = Form.Item;

class Bank extends Component {
    constructor(props) {
        super(props);
        this.state = {
            payValue: this.props.syyf + '',
            isFirst: true,
            ReferNo: '', //退货参考号,
            TransDate: '', //退货交易日期
            isChangeName: false
        };
        
        this.name = '';
    }

    //打开数字小键盘
    openKeypad = (key) => {
        if (key !== this.name) {
            this.setState({isChangeName: true});
        }
        this.name = key;
    }

    onOk = () => {
        let {TransDate} = this.state;
        let {orderType} = this.props.extra;
        let reg =/^(19|20)\d\d(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])$/;
        if (this.state[this.name] === '') {
            return false
        }
        if (orderType === '4') {
            if (this.state.ReferNo === '') {
                message('请输入参考号！');
                return false
            }
            if(!reg.test(TransDate)) {
                message('请输入正确格式的日期！')
                return false
            }
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

    ReferNoChange(e) {
        this.setState({ReferNo: e.target.value})
    }

    TransDateChange(e) {
        this.setState({TransDate: e.target.value})
    }

    handleSubmit(e) {
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
            bbje
        };
        const ICBCFunc = () => {
            //工行
            if (cash == '0') {
                message('请输入正确金额!');
                return false
            }
            if (Number(cash) > Number(this.props.syyf)) {
                message('该支付方式输入金额不允许超出剩余应付!');
                return false
            }
            let ICBCReq = {
                TransAmount: cash ,
                TransType: '05'  //交易类型 05消费 04退货消单
            }
            if (this.props.extra.orderType === '4' || '2') {
                let {TransDate} = this.state;
                ICBCReq = {
                    TransAmount: cash,
                    TransType: '04',
                    ReferNo: this.state.ReferNo,
                    TerminalId: '32029999888804',
                    TransDate: this.props.extra.orderType === '2' ? moment().format('YYYY-MM-DD') : TransDate
                }
            }
            let ICBCRes = window["ICBC"](ICBCReq);
            let sendLogReq = {
                je: cash,
                type: this.props.extra.orderType === '4' ? '2' : '0', //0是消费 2是退货
                rqsj: moment().format('YYYY-MM-DD HH:mm:ss'),
                cardno: ICBCRes.CardNo, //卡号
                trace: ICBCRes.TerminalTraceNo, //流水号
                bankinfo: ICBCRes.BankName, //银行名称
                retmsg: ICBCRes.RspMessage, //返回信息
                retbz: ICBCRes.RspCode == '00' ? 'Y': 'N' // 成功标识
            }
            this.props.sendBankLog(sendLogReq);
            console.log(ICBCReq, ICBCRes, 5555555555)
            if (ICBCRes.RspCode == '00') {
                params = Object.assign(params,  {
                    ReferNo: ICBCRes.ReferNo,
                    TerminalId: ICBCRes.TerminalId,
                    payNo: !!ICBCRes.CardNo ? ICBCRes.CardNo : '',
                })
                this.props.doPayment(params);
            }else{
                message(ICBCRes.RspMessage);
            }
        }
        const GMCFunc = () => {
            //银联
            if (Number(cash) > Number(this.props.syyf)) {
                message('该支付方式输入金额不允许超出剩余应付!');
                return false
            }
            let GMCReq = {
                amount: cash ,
                appCode: this.props.payDialogData.code === '0299' ? '00' : '03',  //应用类型 00银行卡 03预付卡/汉卡
                tradeFlag: "00" //交易类型 00消费 01 消单 02退货
            }
            if (this.props.extra.orderType === '2') {
                //消单
                GMCReq = Object.assign(GMCReq, {
                    tradeFlag: "01" ,
                    originalVoucherCode: this.state.ReferNo
                })
            }
            // let GMCReturnReq = {
            //     //退货
            //     amount: '0.01',
            //     appCode: '00',
            //     tradeFlag: "02",
            //     originalTradeCode : "163145140699",
            //     originalTradeDate :"20190722"
            // }
            // let GMCReturnReq = {
            //     //撤销 
            //     amount: '0.01',
            //     appCode: '00',
            //     tradeFlag: "01",
            //     originalVoucherCode: '000037'  //trace
            // }
            let GMCRes = window["GMC"](GMCReq);
            let sendLogReq = {
                je: cash,
                type: this.props.extra.orderType === '4' ? '2' : '0', //0是消费 2是退货
                rqsj: moment().format('YYYY-MM-DD HH:mm:ss'),
                cardno: GMCRes.card_no, //卡号
                trace: GMCRes.trace, //流水号
                bankinfo: GMCRes.BankName, //银行名称
                retmsg: GMCRes.resp_chin, //返回信息
                retbz: GMCRes.resp_code == '00' ? 'Y': 'N' // 成功标识
            }
            this.props.sendBankLog(sendLogReq);
            console.log(GMCRes, 55555555555)
            if (GMCRes.resp_code === '00') {
                params = Object.assign(params,  {
                    ReferNo: GMCRes.refdata, //misReferenceNo   退货所需 originalTradeCode原交易参考号
                    TerminalId: GMCRes.trace,   //misTerminalId   结算 撤销所需要originalVoucherCode原凭证号
                    payNo: !!GMCRes.card_no ? GMCRes.card_no : ''
                })
                this.props.doPayment(params);
            }else{
                message(GMCRes.resp_chin);
            }
        }
        if (this.props.payDialogData.refModal === 'ICBCCard') {
            ICBCFunc();
        }else if(this.props.payDialogData.refModal === 'GMCCard'){
            GMCFunc();
        }
    }

    render () {
        const {orderType} = this.props.extra;
        const {refModal} = this.props.payDialogData;
        const formItemLayout = {
            labelCol: { span: 5 },
            wrapperCol: { span: 19 },
        };
        let modalHeight = orderType === '4' || orderType === '2' ? '600px' : '512px';
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
                                <FormItem className="xjzf" label={orderType === '4' || orderType === '2'?  "金额：" : null} {...formItemLayout}>
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
                                {
                                    orderType === '4' || orderType === '2' ?
                                    <div>
                                    <FormItem className="xjzf" label={orderType === '2' && refModal === 'GMCCard' ? '凭证号：' : "参考号："} {...formItemLayout}>
                                        <Input className="xjzfInput"
                                            ref="xjzfInput"
                                            placeholder = {orderType === '2' && refModal === 'GMCCard' ? '请输入凭证号' : '请输入参考号'}
                                            style={{width: '360px',  marginLeft: this.state.style, marginBottom: '20px'}}
                                            value={this.state.ReferNo}
                                            onFocus = {() => {this.openKeypad('ReferNo')}}
                                            onChange={this.ReferNoChange.bind(this)}
                                        />
                                    </FormItem>
                                    {
                                       orderType === '4' ? 
                                       <FormItem className="xjzf" label="交易日期：" {...formItemLayout}>
                                        <Input className="xjzfInput"
                                            ref="xjzfInput"
                                            placeholder = '请输入交易日期(YYYYMMDD)'                                            
                                            style={{width: '360px',  marginLeft: this.state.style, marginBottom: '20px'}}
                                            value={this.state.TransDate}
                                            onFocus = {() => {this.openKeypad('TransDate')}}
                                            onChange={this.TransDateChange.bind(this)}
                                        />
                                        </FormItem> : null 
                                    }
                                    </div> : null
                                }
                            </Form>
                            <PayKeypad 
                            onOk={this.onOk}
                            style = {this.props.extra.orderType === '4' || this.props.extra.orderType === '2' ? {'marginLeft': '100px'}: null}
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

export default Bank