//面值卡支付
import React, {Component} from 'react';
import { Form, Input, Modal, Spin, Tabs, Row, Col } from 'antd';
import moment from 'moment';
import calculate from '@/common/calculate'
import { Fetch } from '@/fetch/'
import Url from '@/config/url.js'
import message from '@/common/components/message';
import PayKeypad from '@/common/components/showPaybox/payKeypad/views/payKeypad.js'
import { hidePayDialog, afterPayHandle } from '@/views/payment/utils'
import intl from 'react-intl-universal';
import './style/SvCard.less'
import { runInThisContext } from 'vm';


const TabPane = Tabs.TabPane;
const FormItem = Form.Item;

let name = 'payBarCode'; //转换输入框值
let qxValue = false

//无状态组件
class SvCard extends Component {

    //打开数字小键盘
    openKeypad = (key, state) => {
        name = key;
        qxValue = state;
        this.setState({
            inputName: key
        });
    }

    onInput = (value) => {
        if(!this.state.usePayCode || name != "payBarCode"){
            let _value = this.state[name];
            if(qxValue == true){
                _value = ""
            }
            if (value === '.') {
                if(name != "payValue"){
                    message('非数字键请重新输入');
                    return;
                } else if(_value.indexOf(".")!=-1){
                    message('非数字键请重新输入');
                    return;
                }
            }
            this.setState({
                [name]: _value + value
            });
            qxValue = false
        }
    }

    onBack = () => {
        if(!this.state.usePayCode || name != "payBarCode"){
            let value = "" + this.state[name];
            this.setState({
                [name]: value.substring(0, value.length - 1)
            });
        }
    }

    onClear = () => {
        if(!this.state.usePayCode || name != "payBarCode"){
            this.setState({
                [name]: ''
            });
        }
    }

    onOk = () => { 
        if (this.state.pendding===true) {
            return false
        } else {
            this.setState({pendding: true}, ()=>{
                if (name!="payValue" && this.state[name] === '') {
                    return false
                }
                if(this.state.key===0){
                    if (!!this.props.extra.orderType && this.props.extra.orderType==="4") {
                        this.handlesRefundSubmit();
                    } else {
                        this.handlesSubmit();
                    }
                }else if(this.state.key===1){
                    this.handlesQuerySubmit();
                }
            });
        }
    }

    handleClear = (key) => {
        if (key == 0) {
            if ( !!this.props.extra.orderType && this.props.extra.orderType==="4" ) {
                let input = this.refs.origOrderNoInput.input;
                input.select();
                // if(!this.props.discountPay) { 
                    this.openKeypad('origOrderNo', true)
                // }
                this.setState({
                    key: parseInt(key, 10),
                    height: '580px'
                });
            } else {
                let input = this.refs.payBarCodeInput.input;
                input.select();
                // if(!this.props.discountPay) { 
                    this.openKeypad('payBarCode', true)
                // }
                this.setState({
                    key: parseInt(key, 10),
                    height: '580px'
                });
            }
        } else {
            let input = this.queryCodeInput.input;
            input.select();
            this.openKeypad('queryCode', true)
            this.setState({
                key: parseInt(key, 10),
                height: '724px'
            });
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            payCode: "",
            payBarCode: "",
            queryCode: "",
            origOrderNo: "",
            usePayCode: true,
            pendding: false,
                 
            payValue: this.props.syyf,
            height: '580px',
            key: 0,
            isFirst: true,//第一次点击数字键盘
            isTextChanged: false,
            inputName: "payBarCode",

            payMoney: null,
            payOrderNo: null
        };
    }

    componentDidMount() {
        console.log("svCard componentDidMount, ", this.props, this.state)
        let { extra, payDialogData } = this.props;
        let { orderType, vip_info, origin } = extra;
        if(!!orderType && orderType==="4"){
            this.setState({ usePayCode: false });
            // let input = this.refs.origOrderNoInput.input;
            // input.focus();
        } else {
            if(!!vip_info.customerPaycode && !!vip_info.consumersType && vip_info.consumersType.indexOf("P")!=-1){
                this.setState({
                    payCode: vip_info.customerPaycode,
                    payBarCode: vip_info.customerPaycode,
                });
            } else {
                this.setState({ usePayCode: false });
            }
            let input = this.refs.payBarCodeInput.input;
            input.focus();
            this.setState({inputName: "payBarCode"})
        }
    }

    componentWillUnmount() {

    }

    // 检查手输金额
    checkAccuracy = (cash, accuracy, yscash) => {
        switch (accuracy) {
            case "0":  // 四舍五入保留两位小数
                if (cash.split('.')[1] && cash.split('.')[1].length > 2) {
                    message('該支付方式精確到分！')
                    return yscash;
                } else {
                    return cash;
                }
                break;
            case "1": // 四舍五入保留一位小数
                if (cash.split('.')[1] && cash.split('.')[1].length > 1) {
                    message('該支付方式精確到角！')
                    return yscash;
                } else {
                    return cash;
                }
                break;
            case "2": // 保留一位小数
                if (cash.split('.')[1] && cash.split('.')[1].length > 1) {
                    message('該支付方式截斷到角！')
                    return yscash;
                } else {
                    return cash;
                }
                break;
            case "3": // 四舍五入保留整数
                if (cash.indexOf(".") !== -1) {
                    message('該支付方式精確到元！')
                    return yscash;
                } else {
                    return cash;
                }
                break;
            case "4":  // 保留整数
                if (cash.indexOf(".") !== -1) {
                    message('該支付方式截斷到元！')
                    return yscash;
                } else {
                    return cash;
                }
                break;
            default: 
                return cash;
        }
    };

    //计算精度0-精确到分、1-四舍五入到角、2-截断到角、3-四舍五入到元、4-截断到元、5-进位到角、6-进位到元7-5舍6入到角
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



    //onchange添加后可以直接input框输入
    handleChange(e) {
        if(!this.state.usePayCode){
            this.setState({
                payBarCode: e.target.value
            });
        }
    }

    handlePayValueChange(e) {
        this.setState({
            isTextChanged: true,
            payValue: this.state.isFirst ? e.target.value.substr(e.target.value.length -1 , 1) : this.props.checkInputMoney(e.target.value, this.state.payValue),
            isFirst: false
        }); 
    }

    handleQueryCodeChange(e) {
        this.setState({
            queryCode: e.target.value
        });
    }
    
    handleOrigOrderNoChange(e) {
        qxValue = false;
        this.setState({
            origOrderNo: e.target.value
        });
    }

    // hidePayDialog() {
    //     this.props.hidePayDialog();
    // }

    handlesSubmit() {
        let that = this;
        let amt;
        let bbje;
        let resetPendding = ()=>{            
            that.setState({ pendding: false });
        }
        if (this.state.payBarCode == "") {
            message("请输入付款码");
            resetPendding();
            return false;
        }
        if (!!this.state.payValue && this.state.payValue!="") {
            amt = Number(this.state.payValue);
            if (isNaN(Number(amt))) {
                message('请输入正确的金额！', 1);
                resetPendding();
                return;
            }
            else if (this.props.payDialogData.isyy === 'N' && amt > this.props.syyf) {
                message('不允许溢余！', 1);
                resetPendding();
                return;
            }
            else if (amt < this.props.payDialogData.minval || amt > this.props.payDialogData.maxval) {
                message('超出付款金额范围！ '+this.props.payDialogData.minval+'~'+this.props.payDialogData.maxval, 1);
                resetPendding();
                return;
            }
            else if( amt<=0 || amt>this.props.syyf ) {
                message('支付金额必须大于0且不超过剩余付款金额！', 1);
                resetPendding();
                return;
            }
        } else {
            message('请输入正确的金额！');
            resetPendding();
            return;
        }
        bbje = calculate.doubleConvert(amt * this.props.payDialogData.pyhl, 2, 1)
        const { extra, payDialogData, syyf } = this.props;
        let _orderNo = extra.erpCode + extra.mkt + extra.syjh + moment().format('YYYYMMDDHHmmss') + extra.fphm.substr(-2);   //商户号+门店号+款台号+YYYYMMDDHH24MISS+2位流水号
        const req = {
            command_id: "ZHONGBAIPAY",
            terminalOperator: extra.operators,     //操作员号
            terminalNo: extra.syjh, //终端号收银机号
            shopCode: extra.mkt,         //门店号
            flowNo: extra.flowNo, //当前流水号
            scene: extra.scene, //0普通， 1除外
            paytype: payDialogData.virtualPayType,  //paytype
            payCode: payDialogData.code,
            payName: payDialogData.name,     
            rate: payDialogData.pyhl,  
            chargeRate: payDialogData.zlhl,  
            amount: amt,  //付款金额         
            money: bbje, 
            flag: "1",
            isAllowCharge: payDialogData.iszl,     //是否找零
            isOverage: payDialogData.isyy,     //是否溢余
            payNo: this.state.payBarCode,   //this.state.usePayCode ? "666618086686808" : 
            minVal: payDialogData.minval,   //最小成交金额
            maxVal: payDialogData.maxval, //最大成交金额
            cutMode: payDialogData.sswrfs,  
            precision: payDialogData.sswrjd,    //四舍五入精度
            overage: 0, //收银损益
            authCode: "",
            orderNo: _orderNo
        };
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then(res => {
            // if(res.returncode!="FAIL"){
            //     res.returncode = "2001";
            // }
            if ("0" === res.returncode || "2001" === res.returncode) {
                message('支付成功');
                if ("2001" === res.returncode) {
                    //记录券平台冲正
                    let req2001 = {
                        command_id: "ZHONGBAIRESERVE",
                        shopCode: req.shopCode,
                        terminalNo: req.terminalNo,
                        terminalOperator: req.terminalOperator,
                        terminalSno: extra.fphm,
                        orderNo: _orderNo
                    };
                    console.log("券平台冲正记录: ", req2001)
                    window.ReversalLog({url: Url.base_url, params: req2001});    
                }
                that.setState({
                    pendding: false
                }, ()=>{    
                    this.props.onHidePay();
                    afterPayHandle.call(that.props._paymentBox, {res: res.data.order});
                });
            } else {
                that.setState({
                    pendding: false
                }, ()=>{
                    Modal.confirm({
                        className: 'confirm',
                        content: (<div>
                            <p className="content">消费失败</p>
                        </div>),
                        okText: "继续用券",
                        cancelText: "扫码支付",
                        icon: '',
                        onOk() {
                            let stt = {
                                payBarCode: that.state.payCode,
                                usePayCode: true
                            };
                            if(that.state.payCode==""){
                                stt.payCode = that.state.payBarCode;
                                stt.payBarCode = that.state.payBarCode;
                            }
                            that.setState(stt, ()=>{
                                that.handlesSubmit();
                            });
                        },
                        onCancel() {
                            that.setState({
                                payBarCode: '',
                                usePayCode: false
                            }, ()=>{                                                       
                                let input = that.refs.payBarCodeInput.input;
                                input.focus();
                            });
                        },
                    });
                });
            }
        }).catch((error) => {
            console.error('error', error);
            resetPendding();
        });
    }

    handlesRefundSubmit() {
        let that = this;
        if (this.state.origOrderNo == "") {
            message("请输入退货单号");
            return false;
        }
        let { extra, payDialogData } = this.props;
        let { orderType, vip_info, origin } = extra;
        let amt;        
        let resetPendding = ()=>{            
            that.setState({ pendding: false });
        }
        if (!!this.state.payValue && this.state.payValue!="") {
            amt = Number(this.state.payValue);
            if (isNaN(Number(amt))) {
                message('请输入正确的金额！', 1);
                resetPendding();
                return;
            }
            else if (this.props.payDialogData.isyy === 'N' && amt > this.props.syyf) {
                message('不允许溢余！', 1);
                resetPendding();
                return;
            }
            else if (amt < this.props.payDialogData.minval || amt > this.props.payDialogData.maxval) {
                message('超出付款金额范围！ '+this.props.payDialogData.minval+'~'+this.props.payDialogData.maxval, 1);
                resetPendding();
                return;
            }
            else if( amt<=0 || amt>this.props.syyf ) {
                message('支付金额必须大于0且不超过剩余付款金额！', 1);
                resetPendding();
                return;
            }
        } else {
            message('请输入正确的金额！');
            resetPendding();
            return;
        }
        let _orderNo = extra.erpCode + extra.mkt + extra.syjh + moment().format('YYYYMMDDHHmmss') + extra.fphm.substr(-2);  //商户号+门店号+款台号+YYYYMMDDHH24MISS+2位流水号
        const req = {
            command_id: "ZHONGBAIPREFUND",
            shopCode: extra.mkt,         //门店号
            terminalNo: extra.syjh,     //终端号收银机号
            terminalOperator: extra.operators,     //操作员号
            flowNo: extra.flowNo, //当前流水号
            payCode: payDialogData.code,
            paytype: payDialogData.virtualPayType,  //paytype
            terminalSno: extra.fphm,
            refundNo: _orderNo,
            orgOrderNo: this.state.origOrderNo,
            refundMoney: amt,
            rate: payDialogData.pyhl,  
            precision: payDialogData.sswrjd,    //四舍五入精度
            cutMode: payDialogData.sswrfs
        };
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then(res => {
            // if(res.returncode!="FAIL"){
            //     res.returncode = "2001";
            // }
            if ("0" === res.returncode || "2001" === res.returncode) {
                message('退款成功');
                if ("2001" === res.returncode) {
                    //记录券平台冲正
                    let req2001 = {
                        command_id: "ZHONGBAIRESERVE",
                        shopCode: req.shopCode,
                        terminalNo: req.terminalNo,
                        terminalOperator: req.terminalOperator,
                        terminalSno: extra.fphm,
                        orderNo: req.orgOrderNo,
                        refundNo: req.refundNo
                    };
                    console.log("券平台冲正记录: ", req2001)
                    window.ReversalLog({url: Url.base_url, params: req2001});    
                }
                that.setState({
                    pendding: false
                }, ()=>{    
                    this.props.onHidePay();
                    afterPayHandle.call(that.props._paymentBox, {res: res.data.order});
                });
            } else {
                that.setState({
                    pendding: false
                }, ()=>{    
                    message(res.data)
                });
            }
        }).catch((error) => {
            resetPendding();
            console.error('error', error);
        });
    }

    handlesQuerySubmit() {
        let that = this;
        let resetPendding = ()=>{            
            that.setState({ pendding: false });
        }
        if (this.state.queryCode == "") {
            message("请扫查询码");
            resetPendding();
            return false;
        }  
        let amt, bbje;
        let { extra, payDialogData } = this.props;
        let { orderType, vip_info, origin } = extra;
        amt = Number(this.state.payValue);
        bbje = calculate.doubleConvert(amt * this.props.payDialogData.pyhl, 2, 1)
        const req = {
            command_id: "ZHONGBAIQUERY",
            shopCode: extra.mkt,        //门店号
            terminalNo: extra.syjh,     //终端号收银机号
            terminalOperator: extra.operators,     //操作员号
            flowNo: extra.flowNo, //当前流水号
            queryType: orderType || "1",  //1 销售 2 消单  4 退货
            idSheetNo: extra.fphm,
            // orderNo: extra.erpCode + extra.mkt + extra.syjh + moment().format('YYYYMMDDHHmmss') + extra.fphm.substr(-2),   //商户号+门店号+款台号+YYYYMMDDHH24MISS+2位流水号
            orderNo: this.state.queryCode,
            money: amt,
            payType: payDialogData.virtualPayType,  //paytype
            payCode: payDialogData.code,
            // refundNo: extra.erpCode + extra.mkt + extra.syjh + moment().format('YYYYMMDDHHmmss') + extra.fphm.substr(-2),   //商户号+门店号+款台号+YYYYMMDDHH24MISS+2位流水号
            // orgOrderNo: this.state.origOrderNo,
            // refundMoney: 0.1,
            rate: payDialogData.pyhl,  
            precision: payDialogData.sswrjd,    //四舍五入精度
            cutMode: payDialogData.sswrfs
        };
        if ( orderType && orderType==="4" ) {
            req.refundNo = extra.erpCode + extra.mkt + extra.syjh + moment().format('YYYYMMDDHHmmss') + extra.fphm.substr(-2);
        }
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then(res => {
            if ("0" === res.returncode && !!res.data && !!res.data.order && !!res.data.order.salePayments[0]) {
                that.setState({
                    pendding: false,
                    payMoney: res.data.order.salePayments[0].money,
                    payOrderNo: res.data.order.salePayments[0].payNo
                }, ()=>{    
                    // message('查询成功');
                });
            } else {
                that.setState({
                    // queryCode: '',
                    pendding: false,
                    payMoney: null,
                    payOrderNo: null
                }, ()=>{                       
                    message('查询失败');                                
                    // let input = that.refs.queryCodeInput.input;
                    // input.focus();
                });
            }
        }).catch((error) => {
            console.error('error', error);
            resetPendding();
        });
    }

    render() {
        const formItemLayout = {
            layout: "horizontal",
            labelCol: { span: 5 },
            wrapperCol: { span: 7 },
        };
        let pane = !!this.props.extra.orderType && this.props.extra.orderType==="4" ?                               
            (<Form onSubmit={this.handlesRefundSubmit.bind(this)}>
                <FormItem className="xjzf" style={{marginBottom: '10px'}}>
                    <Input className={this.state.inputName=="payValue"?"fc":"nfc"} placeholder="请扫退货单号"  
                        size="large" 
                        ref="origOrderNoInput"                   
                        value={this.state.origOrderNo}
                        onFocus={() =>{
                            try{
                                this.openKeypad('origOrderNo', true)
                                // let input = this.refs.origOrderNoInput.input;
                                // input.select();
                            }catch(e){}
                        }} 
                        onChange={
                            this.handleOrigOrderNoChange.bind(this)
                        }
                        onPressEnter={this.handlesRefundSubmit.bind(this)}
                    />
                </FormItem>
                <FormItem className="xjzf" style={{marginBottom: '10px'}}>
                    <Input className={this.state.inputName=="payValue"?"fc":"nfc"}
                        size="large" 
                        ref="payValueInput"
                        onFocus={() => {
                            this.openKeypad('payValue', true)
                            // let input = this.refs.payValueInput.input;
                            // input.select();
                        }} 
                        value={this.state.payValue}
                        onChange={this.handlePayValueChange.bind(this)}
                    />
                </FormItem>
            </Form>)
            : 
            (<Form onSubmit={this.handlesSubmit.bind(this)}>
                <FormItem className="xjzf" style={{marginBottom: '10px'}}>
                        <Input className={this.state.inputName=="payBarCode"?"fc":"nfc"} placeholder="请扫支付码"  
                            size="large" 
                            ref="payBarCodeInput"                   
                            value={this.state.payBarCode}
                            onFocus={() =>{
                                this.setState({
                                    inputName: "payBarCode"
                                }, ()=>{
                                    this.openKeypad('payBarCode', true)
                                    // let input = this.refs.payBarCodeInput.input;
                                    // input.focus();
                                })
                            }} 
                            onChange={
                                this.handleChange.bind(this)
                            }
                            onPressEnter={this.handlesSubmit.bind(this)}
                            disabled={this.state.usePayCode && !!this.props.extra.vip_info.customerPaycode? true:false}
                        />
                </FormItem>
                <FormItem className="xjzf" style={{marginBottom: '10px'}}>
                    <Input className={this.state.inputName=="payValue"?"fc":"nfc"}
                        size="large" 
                        ref="payValueInput"
                        onFocus={() => {
                            this.openKeypad('payValue', true)
                            // let input = this.refs.payValueInput.input;
                            // input.focus();
                        }} 
                        value={this.state.payValue}
                        onChange={this.handlePayValueChange.bind(this)}
                    />
                </FormItem>
            </Form>);
        return (
            <div>
                <div className="modal">
                </div>
                <div className="cashBox">
                    <div className="cashBoxCon" style={{ width: '603px', height: this.state.height }}>
                        <p className="title">
                            {this.props.payDialogData.name}
                            <img src={require('@/common/image/paytk_close.png')} alt="取消" 
                                onClick={() => { this.props.onHidePay(); }}/>
                        </p>
                        <Tabs defaultActiveKey="0" onChange={this.handleClear}>
                            <TabPane tab={!!this.props.extra.orderType && this.props.extra.orderType==="1" ? "支付" : "退款"} key="0" forceRender={true}>
                                <div className="inputBox">
                                    { pane }
                                    <div style={{ flex: 1 }}>
                                        <PayKeypad onInput={this.onInput} onBack={this.onBack} onClear={this.onClear}
                                            onOk={this.onOk} />
                                    </div>
                                </div>
                            </TabPane>
                            <TabPane tab="查询" key="1" forceRender={true}>
                                <div className="inputBox">
                                    <Form onSubmit={this.handlesSubmit.bind(this)}>
                                        <FormItem className="xjzf" style={{marginBottom: '10px'}}>
                                            <Input className={this.state.inputName=="payValue"?"fc":"nfc"} placeholder="请扫查询码" 
                                                size="large" 
                                                ref="queryCodeInput" 
                                                ref={(input) => { this.queryCodeInput = input; }}                      
                                                value={this.state.queryCode}
                                                onFocus={() =>{
                                                    try{
                                                        this.openKeypad('queryCode', true)
                                                        // let input = this.queryCodeInput.input;
                                                        // input.select();
                                                    }catch(e){}
                                                }} 
                                                onChange={
                                                    this.handleQueryCodeChange.bind(this)
                                                }
                                                onPressEnter={this.handlesSubmit.bind(this)}
                                            />
                                        </FormItem>
                            <FormItem className="xjzf" style={{marginBottom: '10px'}}>
                                <Input className="nfc"
                                    ref="payMoney"
                                    value={"金额:" + (this.state.payMoney || "----")}
                                    disabled={true}
                                />
                            </FormItem>    
                            <FormItem className="xjzf" style={{marginBottom: '10px'}}>
                                <Input className="nfc"
                                    ref="payOrderNo"
                                    value={"单号:" + (this.state.payOrderNo || "----")}
                                    disabled={true}
                                />
                            </FormItem>       
                                    </Form>
                                    <div style={{ flex: 1 }}>
                                        <PayKeypad onInput={this.onInput} onBack={this.onBack} onClear={this.onClear}
                                            onOk={this.onOk} />
                                    </div>
                                </div>
                            </TabPane>
                        </Tabs>




                    </div>
                </div>
            </div>
        );
    }

}


export default SvCard;
