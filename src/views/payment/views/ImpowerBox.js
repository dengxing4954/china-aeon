//授权编码  渣打银行分期
// 脱机：输入授权号，刷卡取卡号，录入金额，成交。是通过“授权号码”键进入
import React, {Component} from 'react';
import {Form, Input, Button} from 'antd';
import PayKeypad from '../../../common/components/showPaybox/payKeypad/views/payKeypad.js'
import EventEmitter from '@/eventemitter';
import message from '@/common/components/message';
const FormItem = Form.Item;
let name = ''; //转换输入框值
let qxValue = false;//全选控制
let fqtime = ["6", "12", "24"];

class ImpowerBox extends Component {

    //打开数字小键盘
    openKeypad = (key, state) => {
        name = key;
        qxValue = state;
    }

    onInput = (value) => {
        //第一次输入数字键盘，会覆盖输入款的值
        // if(this.state.isFirst){
        //     this.setState({
        //         [name] : value,
        //         isFirst:false,
        //     });
        //     return
        // }

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
            message("請輸入數據",1);
            return false;
        }
        if(this.state.yxDate !== "" && this.state.fqtime!== "" && this.state.cardId !== "" && this.state.sqbmValue !== "" && this.state.memoNum !== ""){
            this.handlesSubmit();
            return;
        }
        if (this.props.payDialogData.code == this.props.payImpowerCode) {
            if (name == "sqbmValue") {
                let input = this.refs.yhzfInput.input;
                input.focus();
                this.openKeypad('payValue', true)
                return;
            } else if (name == "payValue") {
                this.handlesSubmit()
            }
        }else {
            if (name == "yxDate") {
                if(this.state.yxDate.length !== 4){
                    message("請輸入有效日期格式：MMYY,例如0918");
                    return;
                }else{
                    let input = this.fqInput.input;
                    input.select();
                    this.openKeypad('fqtime', true)
                    return;
                }
            }
            if (name == "fqtime") {
                if(name == "fqtime" && fqtime.indexOf(this.state.fqtime) == -1 ){
                    message("請輸入正確分期期數【"+fqtime.join("，")+"】")
                    return;
                }else{
                    let input = this.acsInput.input;
                    input.select();
                    this.openKeypad('cardId', true)
                    return;
                }
            } else if(name == "cardId"){
                if(this.props.extra.type === "4" && this.props.payDialogData.code !== this.props.payImpowerCode){
                    this.props.extra.exceptPaycodes.map((item)=>{
                        if(item.paycode === this.props.payDialogData.code){
                            if(item.payno !== this.state.cardId){
                                message("卡號不一致請重新輸入！");
                                return;
                            }
                        }
                    })
                }
                if(this.props.syspara.fqhdCheck.indexOf(this.state.cardId.slice(0,6)) > -1 || this.state.cardId.length !==16){
                    let input = this.sqbmInput.input;
                    input.select();
                    this.openKeypad('sqbmValue', true)
                    return;
                }else{
                    message("請重新輸入有效卡號！");
                    return;
                }
            } else if(name == "sqbmValue"){
                if(this.state.sqbmValue.length !== 7){
                    message("請輸入長度爲7的授權編碼");
                    return;
                }else{
                    let input = this.memoInput.input;
                    input.select();
                    this.openKeypad('memoNum', true)
                    return;
                }
            }else if(name == "memoNum"){
                this.handlesSubmit();
            }
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            payValue: this.props.syyf,
            sqbmValue: "", //授权编码
            isFirst: true,//第一次点击数字键盘
            fqtime:"",//分期
            cardId:"",//银行卡号
            yxDate:'',
            memoNum:  this.props.extra.expressNumber || "",
            zmqh: false
        };
    }

    searchCardNum = (data) => {
        console.log(data)
        if (data) {
            this.setState({
                cardId: data.split('=')[0],
                yxDate: data.split('=')[1].slice(0,4),
            })
        }
    }

    componentWillUnmount() {
        EventEmitter.off('Card', this.searchCardNum);
    }


    componentDidMount() {
        if (this.props.payDialogData.code == this.props.payImpowerCode) {
            let input = this.refs.sqbmInput.input;
            input.focus();
        }else{
            let input = this.yxDateInput.input;
            input.focus();
        }
        if (this.props.payDialogData.code !== this.props.payImpowerCode) {
            EventEmitter.on('Card', this.searchCardNum);
        }
    }

    handleChange(e) {
        this.setState({
            payValue: this.props.checkInputMoney(e.target.value)
        });
    }

    handleFQChange(e) {
        this.setState({
            fqtime: e.target.value
        });
    }

    handleKHChange(e) {
        this.setState({
            cardId: e.target.value
        });
    }

    handleSQBMChange(e) {
        this.setState({
            sqbmValue: e.target.value
        });
    }

    handleYXQChange(e) {
        this.setState({
            yxDate: e.target.value
        });
    }

    handleMEMOChange(e) {
        this.setState({
            memoNum: e.target.value
        });
    }

    changezmqh(){
        if(this.state.zmqh === false){
            this.setState({
                zmqh: true
            })
        }else{
            this.setState({
                zmqh: false
            })
        }
    }

    handlesSubmit(e) {
        let isCard = false;
        let cash = Number(this.state.payValue);
        if ('N' === this.props.payDialogData.isyy && cash > this.props.syyf) {
            message('不允許溢余！', 1);
            return
        } else if (cash < this.props.payDialogData.minval || cash > this.props.payDialogData.maxval) {
            message('超出付款金額範圍！ '+this.props.payDialogData.minval+'~'+this.props.payDialogData.maxval, 1);
            return;
        }
        if(this.props.extra.type === "4" && this.props.payDialogData.code !== this.props.payImpowerCode){
            this.props.extra.exceptPaycodes.map((item)=>{
                    if(item.paycode === this.props.payDialogData.code){
                        if(item.payno !== this.state.cardId){
                            isCard = true;
                        }
                    }
                })
        }
        if(this.props.payDialogData.code == this.props.payImpowerCode){
            if(this.state.sqbmValue.length == 6){
                this.props.PaymentBankSQBM(this.state.payValue, this.state.sqbmValue)
            }else{
                message("請輸入6位數字的授權編碼")
            }
        }else{
            if(this.state.yxDate === '') {
                message("卡有效期不允許爲空");
            }else if(this.state.yxDate.length !== 4){
                message("請輸入有效日期格式：MMYY,例如0918");
            }else if(this.props.syspara.fqhdCheck.indexOf(this.state.cardId.slice(0,6)) <= -1 && this.props.extra.type !== 4 || this.state.cardId.length !==16){
                message("請輸入有效卡號！");
            }else if(isCard){
                message("卡號不一致，請重新輸入！");
            }else if(this.state.sqbmValue.length !== 7){
                message("請輸入長度為7的授權編碼");
            }else if(this.state.memoNum.length !== 7){
                message("請輸入7位数字的MEMO Number")
            }else{
                let payname = "";
                if(this.props.syspara.fqhdSCB.indexOf(this.state.cardId.slice(0,6)) != -1){
                    payname = "MANHATTAN";
                }else{
                    payname = "SCB"
                }
                this.props.callback(this.state.payValue, this.state.sqbmValue,  this.state.fqtime, this.state.cardId, this.state.yxDate, this.state.memoNum, payname);
            }
        }
    }

    render() {
        const formItemLayout = {
            labelCol: { span: 7 },
            wrapperCol: { span: 17 },
        };
        return this.props.payDialogData.code == this.props.payImpowerCode ? (
            <div>
                <div className="modal">
                </div>
                <div className="cashBox">
                    <div className="cashBoxCon" style={{width: '603px', height: '522px'}}>
                        <p className="title">
                            {this.props.payDialogData.name}
                            <img src={require('@/common/image/paytk_close.png')} alt="取消"
                                 onClick={this.props.hidePayDialog}/>
                        </p>
                        <div className="inputBox">
                            <Form onSubmit={this.handlesSubmit.bind(this)}>
                                <FormItem className="xjzf" style={{marginBottom: '10px'}}>
                                    <Input className="xjzfInput"
                                           placeholder={"請輸入銀行授權編碼"}
                                           ref="sqbmInput"
                                           onFocus={() => {
                                               let input = this.refs.sqbmInput.input;
                                               input.select();
                                               this.openKeypad('sqbmValue', true)
                                           }}
                                           value={this.state.sqbmValue}
                                           onChange={this.handleSQBMChange.bind(this)}
                                    />
                                </FormItem>
                                {/*<FormItem className="xjzf" style={{marginBottom:'10px'}}>*/}
                                {/*<Input className="xjzfInput"*/}
                                {/*placeholder={"请刷银行卡获取卡号"}*/}
                                {/*ref="sqbmInput"*/}
                                {/*onFocus={() => {*/}
                                {/*let input = this.refs.yhkhInput.input;*/}
                                {/*input.select();*/}
                                {/*this.openKeypad('yhkhValue', true)*/}
                                {/*}}*/}
                                {/*value={this.state.sqbmValue}*/}
                                {/*onChange={this.handleSQBMChange.bind(this)}*/}
                                {/*/>*/}
                                {/*</FormItem>*/}
                                <FormItem className="xjzf">
                                    <Input className="xjzfInput"
                                           ref="yhzfInput"
                                           onFocus={() => {
                                               let input = this.refs.yhzfInput.input;
                                               input.select();
                                               this.openKeypad('payValue', true)
                                           }}
                                           value={this.state.payValue}
                                           onChange={this.handleChange.bind(this)}
                                    />
                                </FormItem>
                            </Form>
                            <PayKeypad onInput={this.onInput} onBack={this.onBack} onClear={this.onClear}
                                       onOk={this.onOk}/>
                        </div>
                    </div>
                </div>
            </div>
        ) : (<div>
            <div className="modal">
            </div>
            <div className="cashBox">
                <div className="cashBoxCon" style={{width: '850px', height: '520px'}}>
                    <p className="title">
                        {this.props.payDialogData.name}
                        <img src={require('@/common/image/paytk_close.png')} alt="取消"
                             onClick={() => {
                                 this.props.hidePayDialog();
                             }}/>
                    </p>
                    <div className="inputBox_quan">
                        <Form onSubmit={this.handlesSubmit.bind(this)} style={{flex: 1, padding: '0 32px'}}>
                            <FormItem
                                label="卡有效日期："
                                className="zkje"
                                {...formItemLayout}
                                style={{marginBottom: '15px'}}>
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
                                       placeholder="請輸入卡有效日期(MMYY)"
                                       onChange={this.handleYXQChange.bind(this)}/>
                            </FormItem>
                            <FormItem
                                label="分期期數："
                                className="zkje"
                                {...formItemLayout}
                                style={{marginBottom: '15px'}}>
                                <Input className="xjzfInput"
                                       size="large"
                                       ref={(input) => {
                                           this.fqInput = input;
                                       }}
                                       onFocus={() => {
                                           let input = this.fqInput.input;
                                           input.select();
                                           this.openKeypad('fqtime', true)
                                       }}
                                       value={this.state.fqtime}
                                       placeholder="請輸入分期期數"
                                       onChange={this.handleFQChange.bind(this)}/>
                            </FormItem>
                            <FormItem
                                className="zkje"
                                label="銀行卡號："
                                {...formItemLayout}
                                style={{marginBottom: '15px'}}>
                                <Input className="xjzfInput"
                                       placeholder="請輸入銀行卡號"
                                       ref={(input) => {
                                           this.acsInput = input;
                                       }}
                                       size="large"
                                       onFocus={() => {
                                           let input = this.acsInput.input;
                                           input.select();
                                           this.openKeypad('cardId', true)
                                       }}
                                       value={this.state.cardId}
                                       onChange={this.handleKHChange.bind(this)}/>
                            </FormItem>
                            <FormItem
                                className="zkje"
                                label="授權編碼："
                                {...formItemLayout}
                                style={{marginBottom: '15px'}}>
                                <Input className="xjzfInput"
                                       placeholder={"請輸入銀行授權編碼"}
                                       ref={(input) => {
                                           this.sqbmInput = input;
                                       }}
                                       size="large"
                                       onFocus={() => {
                                           let input = this.sqbmInput.input;
                                           input.select();
                                           this.openKeypad('sqbmValue', true)
                                       }}
                                       value={this.state.sqbmValue}
                                       onChange={this.handleSQBMChange.bind(this)}
                                />
                            </FormItem>
                            <FormItem
                                className="zkje"
                                label="Sales Memo："
                                {...formItemLayout}
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
                                {...formItemLayout}
                                label="支付金額：">
                                <Input className="xjzfInput"
                                       size="large"
                                       ref={(input) => {
                                           this.valueInput = input;
                                       }}
                                       disabled={true}
                                       onFocus={() => {
                                           let input = this.valueInput.input;
                                           input.select();
                                           this.openKeypad('payValue', true)
                                       }}
                                       value={this.state.payValue}
                                       onChange={this.handleChange.bind(this)}/>
                            </FormItem>
                        </Form>
                        <div style={{flex: 1}}>
                            <Button style={{fontSize:'22px',color:'#C6539B'}} onClick={() => {this.changezmqh()}}>文字轉換</Button>
                            <PayKeypad onInput={this.onInput} onBack={this.onBack} onClear={this.onClear}
                                       onOk={this.onOk} zmqh={this.state.zmqh}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>)
    }

}

export default ImpowerBox;