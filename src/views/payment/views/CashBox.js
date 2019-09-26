import React, {Component} from 'react';
import moment from 'moment'
import {Form, Input} from 'antd';
import { Fetch } from '@/fetch/'
import Url from '@/config/url.js'
import calculate from '../../../common/calculate'
import PayKeypad from '../../../common/components/showPaybox/payKeypad/views/payKeypad.js'
import message from '@/common/components/message';

const FormItem = Form.Item;
let name = 'payValue'; //转换输入框值
let qxValue = false;
let isFetching = false;

//无状态组件
class CashBox extends Component {

    constructor(props) {
        super(props);
        let syyf = calculate.doubleConvert(this.props.syyf / this.props.payDialogData.pyhl, 2, 1)
        this.state = {
            isFirst: true,//第一次点击数字键盘
            isTextChanged: false,
            keyboard: [],
            payInput: false,
            payValue: this.accuracy(syyf, this.props.payDialogData.sswrfs),
            style: this.props.payDialogData.code == this.props.syspara.bbcodeHBFH[0] ? '105px' : '0px',
            syyf: this.accuracy(syyf, this.props.payDialogData.sswrfs),
            ybsyyf: this.accuracy(this.props.syyf, this.props.payDialogData.sswrfs),

            
            authCode: "",
            couponlist: [],//劵列表
            exDate: null,
            isLoading: false,
            isMZValue: false,
            merchantid: null,
            octopusBalance: null, //八达通余额
            octopusCardno: null, //八达通卡号
            octopusDedudeTotal: null,
            octopusDeviceId: null,
            octopusIsSmart: false,
            octopusLastAddValDate: null,    //最近增值日期
            octopusLastAddValType: null,    //最近增值类型
            octopusLastAddValTypeEn: null,  //最近增值类型(english)
            octopusTransDate: null,
            payid: null,
            points: null,//积分信息
            referenceNumber: null,
            tishitext: "",
            traceNumber: null,
        };
    }

    //支付pay
    doPayment = (cash, payModeData, extra, bbje, flag) => {
        if (isFetching) {
            return;
        }
        isFetching = true;
        //单品计算促销
        const req = {
            command_id: "PAYCERTIFY",
            authCode: this.state.referenceNumber,//授权编码
            batchno: this.state.exDate || '',//有效时间
            couponBalance: this.state.octopusBalance, //八达通余额
            flag: this.props.flag ? this.props.flag : '0',//是否立即支付 默认为0    1 除外付款方式
            flow_no: extra.flow_no,//当前流水号
            hl: payModeData.pyhl,//汇率
            isyy: payModeData.isyy,//是否溢余
            iszl: payModeData.iszl,//是否找零
            maxval: payModeData.maxval,//最大成交金额
            merchantid: this.state.realMerchantid || '',//机构号
            minval: payModeData.minval,//最小成交金额
            mkt: extra.mkt,//门店号
            // octopusDedudeTotal: this.state.octopusDedudeTotal, //八达通扣款金额
            // octopusIsSmart: this.state.octopusIsSmart,  //是否Smartcard
            // octopusLastAddValDate: this.state.octopusLastAddValDate,    //最近增值日期
            // octopusLastAddValType: this.state.octopusLastAddValType || this.state.merchantid || '',  //最近增值类型 || //刷卡类型
            // octopusLastAddValTypeEn: this.state.octopusLastAddValTypeEn,    //最近增值类型(english)
            // octopusTranscationTime: this.state.octopusTransDate,  //八达通交易时间
            operators: extra.operators,//操作员号
            paycode: payModeData.code,//付款方式代码
            payid: this.state.payid || '',//付款卡号（储值卡卡号或微信交易单号）
            payname: payModeData.cardPayType !== "a" ? payModeData.name : payModeData.paysimplecode,
            payno: '', //八达通卡号
            paytype: payModeData.paytype,//paytype
            payyhje: '',//支付渠道优惠金额
            reference: this.state.referenceNumber || '',//银行卡交易参考号
            scene: extra.scene,//0普通， 1除外
            shyhje: '',//商户优惠金额
            sswrfs: payModeData.sswrfs,//
            sswrjd: payModeData.sswrjd,//四舍五入精度
            syjh: extra.syjh,//终端号
            terminalid: null, //终端号
            total: bbje,//付款金额本币
            totalfrac: 0,//收银损益
            trace: null,//银联流水号
            ybje: cash,//原币金额
            yhje: '',//优惠金额
            zlhl: payModeData.pyhl,//找零汇率
        };
        if (flag && this.props.extra.type === "2") {
            req.flag = flag
        }
        if (payModeData.virtualPayType === 3 && payModeData.cardPayType === "0" || payModeData.cardPayType === "1") {
            req.needHidePayNo = "Y"
        }
        console.log("doPayment--> ", req)
        this.props.onHidePay();
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then(res => {
            console.log("doPayment==x ", res)
            isFetching = false;
            if (res.retflag === "0") {
                    this.props.onAfterPay(true, res, null, null);
            } else {
                message(res.retmsg)
            }
        }).catch((error) => {
            console.error('error', error);
            throw new Error(error);
        }).then(res => {
            this.setState({
                payid: '',          //付款卡号（储值卡卡号或微信交易单号）
                traceNumber: '',    //银联流水号
                merchantid: '',     //机构号
                realMerchantid: '', //机构号
                exDate: '',         //有效时间
                referenceNumber: '',//银行卡交易参考号
                octopusDeviceId: '',//终端号
                octopusCardno: ''   //八达通卡号
            });
        })
    }

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
                                     this.props.onHidePay();
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