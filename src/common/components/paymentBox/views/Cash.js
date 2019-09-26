import React, {Component} from 'react';
import moment from 'moment'
import {Form, Input} from 'antd';
import { Fetch } from '@/fetch/'
import Url from '@/config/url.js'
import calculate from '@/common/calculate'
import PayKeypad from '../payKeypad/views/payKeypad.js'
import message from '@/common/components/message';
import {
    afterPayHandle
} from '@/views/payment/utils'

const FormItem = Form.Item;
// let name = 'payValue'; //转换输入框值
// let qxValue = false;
let isFetching = false; 

//现金支付组件
class Cash extends Component {

    constructor(props) {
        super(props);
        let syyf = calculate.doubleConvert(this.props.syyf / this.props.payDialogData.pyhl, 2, 1)
        this.state = {
            isFirst: true,//第一次点击数字键盘
            isTextChanged: false,
            keyboard: [],
            payValue: this.accuracy(syyf, this.props.payDialogData.sswrfs),
            style: this.props.payDialogData.code == this.props.syspara.bbcodeHBFH[0] ? '105px' : '0px',
            syyf: this.accuracy(syyf, this.props.payDialogData.sswrfs),
            ybsyyf: this.accuracy(this.props.syyf, this.props.payDialogData.sswrfs),            
        };
        
        this.name = 'payValue';
        this.qxValue = false;
    }

    //打开数字小键盘
    openKeypad = (key, state) => {
        this.name = key;
        this.qxValue = state;
    }

    onOk = () => {
        if (this.state[this.name] === '') {
            return false
        }
        this.handleSubmit()
    }

    changeValue = (value) => {
        this.setState({
            [this.name]: value
        });
    }


    componentWillUnmount() {

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
            payValue: this.state.isFirst ? e.target.value.substr(e.target.value.length -1 , 1) : this.props.checkInputMoney(e.target.value, this.state.payValue),
            isFirst: false
        }); 
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
        }
        if(this.props.payDialogData.refModal === 'WuhanCard') {
            let syyf = calculate.doubleConvert(this.props.syyf / this.props.payDialogData.pyhl, 2, 1)
            if (Number(cash) > Number(syyf)) {
                message('该支付方式输入金额不允许超出剩余应付!');
                return false
            }
            let CLSReq = {
                amount: cash + ''
            }
            let CLSRes = window["CLS"](CLSReq);
            let sendLogReq = {
                je: cash,
                type: '0', //0是消费 2是退货
                rqsj: moment().format('YYYY-MM-DD HH:mm:ss'),
                cardno: CLSRes.logicCardNo, //卡号
                trace: CLSRes.carveNo, //流水号
                bankinfo: '武汉通', //银行名称
                retmsg: CLSRes.msg, //返回信息
                retbz: CLSRes.code == '00' ? 'Y': 'N' // 成功标识
            }
            this.props.sendBankLog(sendLogReq);
            console.log(CLSRes, 99999999)
            if(CLSRes.code === '0') {
                params = Object.assign(params, {
                    payNo: CLSRes.psamCardNo
                })
                this.props.doPayment(params);
            }
        }else{
            // let ICBCSaleReq = {
            //     TransAmount: '0.1' ,
            //     TransType: '05'
            // }
            // // let ICBCReturnReq = {
            // //     TransAmount: '0.1',
            // //     TransType: '04',
            // //     ReferNo : '80242268',
            // //     TerminalId: '32029999888804',
            // //     TransDate :'20190716'
            // // }
            // let ICBCRes = window["ICBC"](ICBCSaleReq);
            // console.log(ICBCRes, 6666666666)
            this.props.doPayment(params);
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
                                     this.props.onHidePay();
                                 }}/>
                        </p>
                        <div className="inputBox">
                            <p className = 'CashP'style={{
                                marginLeft: this.state.style
                            }}>剩余应付{this.props.payDialogData.name}金额：<span style={{fontSize:'23px',fontWeight:'600'}}>{this.state.syyf}</span></p>
                            <p className = 'CashP' style={{
                                marginLeft: this.state.style
                            }}>{this.props.payDialogData.name}支付汇率：{this.props.payDialogData.pyhl}</p>
                            <Form onSubmit={this.handleSubmit.bind(this)}>
                                <FormItem className="xjzf">
                                    <Input className="xjzfInput"
                                           ref="xjzfInput"
                                           autoFocus
                                           style={{width: '360px',  marginLeft: this.state.style}}
                                           value={this.state.payValue}
                                           onChange={this.handleChange.bind(this)}
                                    />
                                </FormItem>
                            </Form>
                            <PayKeypad 
                            onOk={this.onOk}
                            keyboard={this.state.keyboard} 
                            name = {this.name}
                            oldValue = {this.state[this.name]} 
                            callback = {this.props.checkInputMoney}
                            changeValue = {this.changeValue}/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}

export default Cash;