//劵支付
import React, {Component} from 'react';
import {Form, Input, Row} from 'antd';
import PayKeypad from '../../../common/components/showPaybox/payKeypad/views/payKeypad.js'
import message from '@/common/components/message';
const FormItem = Form.Item;
let name = ''; //转换输入框值
let payEleccoupons,payPapercoupons,payDircoupons,payZKcoupons,payMZcoupons;
//无状态组件
class StockBox extends Component {
    //键盘开始
    //打开数字小键盘
    openKeypad = (key) => {
        name = key
    }

    onInput = (value) => {
        let _value = this.state[name];
        if(name == "zjzfValue"){
            this.setState({
                [name]:  this.props.checkInputMoney(_value + value, _value, this.props.payDialogData.sswrfs)
            });
        }else{
            this.setState({
                [name]: _value + value
            });
        }
    }

    onBack = () => {
        let value = String(this.state[name]);
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
        if (this.state[name] === '' && payMZcoupons.indexOf(this.props.payDialogData.code) == -1) {
            return false
        } else if (name == "consumerId") {
            this.searchHK();
        }else if(name == "zjzfstockId" && (this.props.isMZValue || payDircoupons.indexOf(this.props.payDialogData.code) !== -1)){
            let input = this.refs.zjzfinput.input;
            input.focus();
            this.openKeypad('zjzfValue', true)
        } else if(payEleccoupons.indexOf(this.props.payDialogData.code) != -1){
            this.dzqhandlesSubmit();
        } else if(name == 'stockId'){
            this.zqhandlesSubmit();
        }else if(name == "zjzfValue" || (name == "zjzfstockId" && payMZcoupons.indexOf(this.props.payDialogData.code) !== -1)){
            this.yhqhandlesSubmit();
        }
    }

    //键盘结束

    constructor(props) {
        super(props);
        this.props.syspara.payObj.map((item) => {
            let str = item.split(',');
            if(str[0] == "payEleccoupons"){
                payEleccoupons = item
            }else if(str[0] == "payPapercoupons"){
                payPapercoupons = item
            }else if(str[0] == "payDircoupons"){
                payDircoupons = item
            }else if(str[0] == "payZKcoupons"){
                payZKcoupons = item
            }else if(str[0] == "payMZcoupons"){
                payMZcoupons = item
            }
        })
        this.state = {
            payValue: '',//支付金额
            consumerId: '',//会员号
            stockId: '',//券号
            stock: null,//选中券信息
            vip: null,//会员信息
            payValueInput: false,
            consumerIdInput: false,
            stockIdInput: false,
            zjzfstockId: '',//直接支付券号
            zjzfValue: '',
            QHmargin: payDircoupons.indexOf(this.props.payDialogData.code) !== -1? "10px" : "0px",
            tishitext:payDircoupons.indexOf(this.props.payDialogData.code) !== -1?"請輸入券抵扣金額":"請輸入券折扣金額",
        };
    }

    componentDidMount() {
    }

    componentWillReceiveProps(nextprops) {
        console.log()
        if(nextprops.isMZValue){
            this.setState({
                QHmargin:"10px"
            },()=>{
                let input = this.refs.zjzfinput.input;
                input.focus();
                this.openKeypad('zjzfValue', true)
            })
        }else{
            this.setState({
                QHmargin:"0px"
            })
        }
    }

    //选择劵
    selectCoupon = (id, item) => {
        this.setState({
            selected: id,
            stock: item
        })
        if (this.props.payDialogData.isyy === "N") {
            this.setState({
                payValue: this.props.syyf > item.balance ? item.balance : this.props.syyf
            })
        } else {
            this.setState({
                payValue: item.balance
            })
        }
    }

    // componentWillUpdate() {
    //     if (this.props.couponlist.length === 1) {
    //         this.setState = {
    //             payValue: this.props.couponlist[0].kye,//支付金额
    //         }
    //     }
    // }

    handleQHChange(e) {
        this.setState({
            stockId: e.target.value
        });
    }

    handleChangeHK(e) {
        this.setState({
            consumerId: e.target.value
        });
    }

    handleZJZFQHChange(e){
        this.setState({
            zjzfstockId: e.target.value
        });
    }

    handleZJZFQHkeyDown = (e) => {
        if(e.keyCode === 13) {
            this.refs.zjzfinput.input.focus();
        }
    }

    handleChangeZJFK(e) {
        this.setState({
            zjzfValue: e.target.value
        });
    }

    handleChange(e) {
        //对payValue控制
        if (e.target.value <= this.state.payValue) {
            this.setState({
                payValue: e.target.value
            });
        } else {
            message("抵扣金额不得大于券值");
        }
    }

    searchHK() {
        if (this.state.consumerId) {
            this.props.vip(this.state.consumerId).then(res => {
                console.log(res)
                this.setState({
                    vip: res
                })
            });
        } else {
            message("請輸入會員號")
        }
    }

    //电子券核销
    dzqhandlesSubmit(e) {
        // e.preventDefault();
        if (this.props.payStock && this.state.payValue && this.state.stock) {
            if (this.state.payValue <= this.state.stock.balance) {
                this.props.payStock(this.state.payValue, this.state.stock, this.state.consumerId);
            } else {
                message("抵扣金額不得大於券值")
            }
        }
    }

    //纸券核销和折扣券
    zqhandlesSubmit(e) {
        if(payPapercoupons.indexOf(this.props.payDialogData.code) !== -1){
            if (this.state.stockId) {
                this.props.yhStock(this.state.stockId);
            }else{
                message("券號不能爲空")
            }
        }else {
            if (this.state.stockId) {
                this.props.zkStock(this.state.stockId);
            }else{
                message("券號不能爲空")
            }
        }
    }

    //银行优惠券核销和面值券
    yhqhandlesSubmit(e) {
        if (e) e.preventDefault();
        if ('N' === this.props.payDialogData.isyy && this.state.payValue > this.props.syyf) {
            message('不允許溢余！', 1);
            return
        } else if (this.state.payValue < this.props.payDialogData.minval || this.state.payValue > this.props.payDialogData.maxval) {
            message('超出付款金額範圍！ '+this.props.payDialogData.minval+'~'+this.props.payDialogData.maxval, 1);
            return;
        }
        if(payDircoupons.indexOf(this.props.payDialogData.code) !== -1){
            if(this.state.zjzfValue){
                if ( this.state.zjzfstockId) {
                    this.props.callback(this.state.zjzfValue, this.state.zjzfValue, this.state.zjzfstockId);
                }else{
                    message("券號不能爲空")
                }
            }else{
                message("抵扣金額不能爲空")
            }
        }else{
            // if(this.props.isMZValue){
            //     if(this.state.zjzfValue<0 || this.state.zjzfValue>100 || this.state.zjzfValue.indexOf(".")!==-1){
            //         message("请输入0——100的券折扣率")
            //     }else{
            //         this.props.mzStock(this.state.zjzfstockId, this.state.zjzfValue);
            //     }
            // }else{
                this.props.mzStock(this.state.zjzfstockId, this.state.zjzfValue);
            // }
        }
    }

    box() {
        if(payEleccoupons.indexOf(this.props.payDialogData.code) !== -1){
            return (<div className="cashBoxCon" style={{width: '850px', height: '560px'}}>
                <p className="title">
                    {this.props.payDialogData.name}
                    <img src={require('@/common/image/paytk_close.png')} alt="取消"
                         onClick={this.props.hidePayDialog}/>
                </p>
                <div className="inputBox_quan">
                    <Form onSubmit={this.dzqhandlesSubmit.bind(this)} style={{flex: 1, padding: '0 32px'}}>
                        <FormItem
                            label="會員卡號："
                            className="zkje"
                            style={{display: 'flex'}}
                        >
                            <Input className="xjzfInput" size="large" placeholder="請刷卡或輸入會員卡號"
                                   onChange={this.handleChangeHK.bind(this)}
                                   onFocus={() => this.openKeypad('consumerId')}
                                   value={this.state.consumerId}
                                   autoFocus={true}
                            />
                        </FormItem>
                        <Row className="stockBox">
                            <div style={{
                                display: 'flex',
                                fontSize: '.16rem',
                                background: '#C8C8C8',
                                color: '#2A2939',
                                padding: '.06rem 0'
                            }}><p>劵号</p><p>劵名</p><p>面值</p><p>账户余额</p></div>
                            <div style={{
                                height: '207px',
                                overflow: 'scroll',
                                marginBottom: '30px',
                                fontSize: '.18rem',
                                border: '1px solid #EAEAEA'
                            }}>
                                <ul>
                                    {this.props.couponlist.map((item, index) =>
                                        <li style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            flex: 1,
                                            height:'44px',
                                            lineHeight:'44px',
                                            border: '1px solid #EAEAEA',
                                            color: '#2A2939'
                                        }}
                                            key={index}
                                            className={index === this.state.selected ? "label_selected" : ""}
                                            onClick={() => this.selectCoupon(index, item)}
                                        >
                                            <p>{item.coupon_group}</p>
                                            <p>{item.coupon_name}</p>
                                            <p>￥{item.face_value}</p>
                                            <p>￥{item.balance}</p>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </Row>
                        <FormItem
                            className="zkje"
                            label="抵扣金额"
                            style={{display: 'flex'}}
                        >
                            <Input style={{flex: 1}}
                                   placeholder="请输入抵扣金额"
                                   size="large"
                                   onChange={this.handleChange.bind(this)}
                                   onFocus={() => this.openKeypad('payValue')}
                                   value={this.state.payValue}/>
                        </FormItem>
                    </Form>
                    <div style={{flex: 1}}>
                        <PayKeypad onInput={this.onInput} onBack={this.onBack} onClear={this.onClear} onOk={this.onOk}/>
                    </div>
                </div>
            </div>);
        }else if(payPapercoupons.indexOf(this.props.payDialogData.code) !== -1 || payZKcoupons.indexOf(this.props.payDialogData.code) !== -1){
            return (<div className="cashBoxCon" style={{width: '603px', height: '512px'}}>
                <p className="title">
                    {this.props.payDialogData.name}
                    <img src={require('@/common/image/paytk_close.png')} alt="取消"
                         onClick={this.props.hidePayDialog}/>
                </p>
                <div className="inputBox">
                    <Form onSubmit={this.zqhandlesSubmit.bind(this)}>
                        <FormItem className="xjzf">
                            <Input className="xjzfInput" placeholder={"請輸入" + this.props.payDialogData.name + "码"}
                                   onFocus={() => this.openKeypad('stockId')}
                                   value={this.state.stockId}
                                   autoFocus={true}
                                   onChange={this.handleQHChange.bind(this)}/>
                        </FormItem>
                    </Form>
                    <PayKeypad onInput={this.onInput} onBack={this.onBack} onClear={this.onClear} onOk={this.onOk}/>
                </div>
            </div>);
        }else if(payDircoupons.indexOf(this.props.payDialogData.code) !== -1 || payMZcoupons.indexOf(this.props.payDialogData.code) !== -1){
            return (<div className="cashBoxCon" style={{width: '603px', height: '532px'}}>
                <p className="title">
                    {this.props.payDialogData.name}
                    <img src={require('@/common/image/paytk_close.png')} alt="取消"
                         onClick={this.props.hidePayDialog}/>
                </p>
                <div className="inputBox">
                    <Form onSubmit={this.yhqhandlesSubmit.bind(this)}>
                        <FormItem className="xjzf" style={{marginBottom:this.state.QHmargin}}>
                            <Input className="xjzfInput" placeholder={"請輸入" + this.props.payDialogData.name + "码"}
                                   onFocus={() => this.openKeypad('zjzfstockId')}
                                   value={this.state.zjzfstockId}
                                   autoFocus={true}
                                   onChange={this.handleZJZFQHChange.bind(this)}
                                   onKeyDown={this.handleZJZFQHkeyDown}/>
                        </FormItem>
                        {this.props.isMZValue || payDircoupons.indexOf(this.props.payDialogData.code) !== -1 ?  <FormItem className="xjzf">
                            <Input className="xjzfInput" placeholder={this.state.tishitext}
                                   ref = "zjzfinput"
                                   onFocus={() => this.openKeypad('zjzfValue')}
                                   value={this.state.zjzfValue}
                                   onChange={this.handleChangeZJFK.bind(this)}/>
                        </FormItem>: null}
                    </Form>
                    <PayKeypad onInput={this.onInput} onBack={this.onBack} onClear={this.onClear} onOk={this.onOk}/>
                </div>
            </div>);
        }
    }


    render() {
        return (
            <div>
                <div className="modal">
                </div>
                <div className="cashBox">
                    {this.box()}
                </div>
            </div>
        );
    }
}

export default StockBox;