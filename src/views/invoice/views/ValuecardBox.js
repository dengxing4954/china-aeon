//面值卡支付
//银行支付
import React, {Component} from 'react';
import { Form, Input, Modal, Spin} from 'antd';
import message from '@/common/components/message';
import OctoCountdown from '@/common/components/octoCountdown/index.js';
import PayKeypad from '@/common/components/showPaybox/payKeypad/views/payKeypad.js'
import intl from 'react-intl-universal';
import '../style/invoice.less'
const FormItem = Form.Item;

let name = 'payValue'; //转换输入框值
let qxValue = false
let octoWaitingModal = null;
// let octoClearTimer = null;

//无状态组件
class ValuecardBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            consumerId:'', //积分卡号
            canPay: false,
            payEnough: null,            
            payValue: this.props.syyf,
            payCardno:null,
            payYue:'',
            isTextChanged: false,
            isRetry: false,
            octopusRetrying: false,     //八达通100022错误重试中
            octopusTransBegin: false,   //八达通本次交易流程开始
            octopusTransCard: null,     //八达通本次交易首次拍卡(失败)信息
            jfxfConfig: null,
            jfxfBl: null,           // 积分支付倍率
            jfPayValue: null        //
        };
    }

    componentDidMount() {
        console.log("valuecarbox didmounted!!", this.state, this.props)
        if (this.props.payDialogData.virtualPayType=='4') {
            this.setState({isRetry: false, octopusRetrying: false, octopusTransBegin: true}, ()=>{
                message(intl.get("INFO_OCTOSWIPE"));    //请拍卡
                setTimeout(() => {
                    this.handlesSubmit();    
                }, 300);
            });
        } else if (this.props.payDialogData.virtualPayType=='2') {
            let _jfData = this.props.sysparaData.find((data)=>{return data.code==="JFXF"}); 
            let _jfbl = Number(_jfData.paravalue.split(",")[0]);
            let _jfPayValue = (this.state.payValue / _jfbl).toFixed(0);
            // console.log(this.props, this.state, this.props.vip_no);
            if (_jfPayValue < this.props.payDialogData.minval || _jfPayValue > this.props.payDialogData.maxval) {
                this.props.hidePayDialog();
                message('超出付款金額範圍！');
                return;
            }
            if( !!this.props.vip_no ) {
                this.setState({
                    consumerId: this.props.vip_no,
                    jfxfConfig: _jfData,
                    jfxfBl: _jfbl,
                    jfPayValue: _jfPayValue
                }, ()=>{
                   console.log("jfxfConfig: ", this.state);
                });
            }else{
                message('請先登錄會員');
                this.props.hidePayDialog();
                return;
            }
            // let input = this.xjzfInput.input;
            // input.focus();
            // let _jfData = this.props.sysparaData.find((data)=>{return data.code==="JFXF"}); 
            // let _jfbl = Number(_jfData.paravalue.split(",")[0]);
            // let _jfPayValue = this.state.payValue / _jfbl;
            // this.setState({
            //     jfxfConfig: _jfData,
            //     jfxfBl: _jfbl,
            //     jfPayValue: _jfPayValue
            // }, ()=>{
            //    console.log("jfxfConfig: ", this.state);
            // });
        }
    }

    componentWillUnmount() {
    }

    //打开数字小键盘
    openKeypad = (key, state) => {
        name = key;
        qxValue = state;
    }

    onInput = (value) => {
        let _value = this.state[name];
        if(qxValue == true){
            _value = ""
        }
        let _sswrValue = this.checkAccuracy(_value + value, this.props.payDialogData.sswrfs, _value);        
        if (this.props.payDialogData.virtualPayType=='4') {
            this.setState({
                [name]: _sswrValue
            });
        } else if (this.props.payDialogData.virtualPayType=='2') {
            if(value === '.') {
                message('非數字鍵請重新輸入');
                return;
            }
        }
        qxValue = false
    }

    onBack = () => {
        let value = this.state[name];
        let _value = value.substring(0, value.length - 1)
        // this.setState({
        //     [name]: value.substring(0, value.length - 1)
        // });
        let _sswrValue = this.checkAccuracy(_value, this.props.payDialogData.sswrfs, _value);        
        if (this.props.payDialogData.virtualPayType=='4') {
            this.setState({
                [name]: _sswrValue
            });
        } else if (this.props.payDialogData.virtualPayType=='2') {
            this.setState({
                [name]: _sswrValue,
                jfPayValue: _sswrValue/this.state.jfxfBl
            });
        }
    }

    onClear = () => {
        this.setState({
            [name]: ''
        });
    }

    onOk = () => { 
        this.handlesSubmit()
    }

    // 检查手输金额
    checkAccuracy = (cash, accuracy, yscash) => {
        switch (accuracy) {
            case "0": { // 四舍五入保留两位小数
                if (cash.split('.')[1] && cash.split('.')[1].length > 2) {
                    message('該支付方式精確到分！')
                    return yscash;
                } else {
                    return cash;
                }
            }
                break;
            case "1": { // 四舍五入保留一位小数
                if (cash.split('.')[1] && cash.split('.')[1].length > 1) {
                    message('該支付方式精確到角！')
                    return yscash;
                } else {
                    return cash;
                }
            }
                break;
            case "2": { // 保留一位小数
                if (cash.split('.')[1] && cash.split('.')[1].length > 1) {
                    message('該支付方式截斷到角！')
                    return yscash;
                } else {
                    return cash;
                }
            }
                break;
            case "3": { // 四舍五入保留整数
                if (cash.indexOf(".") !== -1) {
                    message('該支付方式精確到元！')
                    return yscash;
                } else {
                    return cash;
                }
            }
                break;
            case "4": { // 保留整数
                if (cash.indexOf(".") !== -1) {
                    message('該支付方式截斷到元！')
                    return yscash;
                } else {
                    return cash;
                }
            }
                break;
            default: {
                return cash;
            }
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
        this.setState({isTextChanged: true});
        this.setState({
            payValue: this.checkAccuracy(e.target.value, this.props.payDialogData.sswrfs)
        });
    }
    
    handleChangeKh(e){
        this.setState({
            consumerId: e.target.value
        });
    }

    hidePayDialog() {
        if (!!global.octoClearTimer) {
            clearTimeout(global.octoClearTimer);
        }
        global.octoClearTimer = setTimeout(()=>{window["OctopusClear"]({type:'06'})}, 10*1000);
        this.props.hidePayDialog();
    }

    handlesSubmit(octoRwType, octoRwCardId, octoPollTimes) {
        //八达通支付和面值卡支付同框
        let that = this;
        let total = this.state.payValue;
        if (this.props.payDialogData.virtualPayType=='4') {
            if (total < this.props.payDialogData.minval || total > this.props.payDialogData.maxval) {
                message('超出付款金額範圍！');
                return;
            }
            if (octoRwType === undefined) {
                octoRwType = "02";
            }    
            let octoClear = (sec) => {
                if (!!global.octoClearTimer) {
                    clearTimeout(global.octoClearTimer);
                }
                console.log("[valueCard] new octoClearTimer ["+sec+"sec]");
                global.octoClearTimer = setTimeout(()=>{window["OctopusClear"]({type:'06'})}, sec*1000);
            }
            let octoWaitEnd = ()=>{
                if (!!this.octoWaitingModal) {
                    this.octoWaitingModal.destroy()
                }
            }            
            let octoWaitStart = ()=>{
                this.octoWaitingModal = Modal.info({
                    className: "octoWaiting",
                    content: (<div><Spin/> &nbsp; {intl.get("INFO_OCTOSWIPE")}</div>)
                });
            }
            if (!!global.octoClearTimer) {
                clearTimeout(global.octoClearTimer);
            }
            let pollParam = {
                type:octoRwType, 
                receiptNum: this.props.extra.syjh+this.props.extra.fphm, 
                money: total*10, 
                cardNo: octoRwCardId, 
                pollTimes: octoPollTimes
            };
            console.log("pollParam: ", pollParam);
            let pollRes = window["Octopus"](pollParam);
            octoWaitEnd();
            if ( pollRes.success === true && !!pollRes.object && !!pollRes.object.customerInfo ) {
                octoClear(10);
                OctoCountdown.close();
                let isSmartCard = false;
                this.setState({
                    isRetry: false,            
                    octopusRetrying: false, 
                }, ()=>{
                    if (!!pollRes.object.customerInfo && !!pollRes.object.customerInfo.octopusType){
                        if( pollRes.object.customerInfo.octopusType==="1"){
                            isSmartCard = true;
                        }
                    }
                    let _tempBalance = pollRes.object.balance;
                    _tempBalance = (_tempBalance / 10).toFixed(1);
                    // 客户要求付款成功后不再弹出确认框
                    // Modal.info({
                    //     className: 'octoTipInfo',
                    //     title: intl.get("INFO_OCTOPAYSUCCESS"),   //提示
                    //     okText: intl.get("BTN_CONFIRM"),   //确定
                    //     content: (
                    //         <div className="octoAVDInfo ">
                    //             <ul className="en">
                    //                 <li>
                    //                     <span className="label">Amount Deducted</span>
                    //                     <span className="value">${(pollRes.object.deductValue/10).toFixed(1)}</span>
                    //                 </li>
                    //                 {isSmartCard===true ? null : (
                    //                     <li>
                    //                         <span className="label">Remaining value</span>
                    //                         <span className="value">{_tempBalance>0?"":(_tempBalance<0?"-":"")}${Math.abs(_tempBalance).toFixed(1)}</span>
                    //                     </li>
                    //                 )}
                    //             </ul>
                    //             <ul className="cn">
                    //                 <li>
                    //                     <span className="label">{intl.get("INFO_OCTODEDUTEAMOUT")}</span>
                    //                     <span className="value">${(pollRes.object.deductValue/10).toFixed(1)}</span>
                    //                 </li>
                    //                 {isSmartCard===true ? null : (
                    //                     <li>
                    //                         <span className="label">{intl.get("INFO_OCTOBALANCE")}</span>
                    //                         <span className="value">{_tempBalance>0?"":(_tempBalance<0?"-":"")}${Math.abs(_tempBalance).toFixed(1)}</span>
                    //                     </li>
                    //                 )}
                    //             </ul>
                    //         </div>
                    //     ),
                    //     onOk() {
                    //     }
                    // });
                    let lastAvt = "";
                    let lastAvtEn = "";
                    if (pollRes.object.lastAddValueType === "1") {
                        lastAvt = intl.get("INFO_OCTOATCASH");
                        lastAvtEn = "Cash";
                    } else if (pollRes.object.lastAddValueType === "2") {
                        lastAvt = intl.get("INFO_OCTOATONLINE");
                        lastAvtEn = "Online";
                    } else if (pollRes.object.lastAddValueType === "4") {
                        lastAvt = intl.get("INFO_OCTOATAAVS");
                        lastAvtEn = "AAVS";
                    }
                    let octoInfo = {
                        octopusDeviceId: !!pollRes.object.deviceID ? pollRes.object.deviceID.toUpperCase() : "",    //八达通设备号
                        octopusCardno: pollRes.object.cardID,    //八达通卡号
                        octopusBalance: (pollRes.object.balance/10).toFixed(2),  //八达通余额
                        octopusDedudeTotal: (pollRes.object.deductValue/10).toFixed(2), //八达通扣款金额
                        octopusLastAddValDate: pollRes.object.lastAddValueDate,  //最近一次增值日期
                        octopusLastAddValType: lastAvt,    //最近一次增值类型
                        octopusLastAddValTypeEn: lastAvtEn,
                        octopusIsSmartCard: isSmartCard,
                        octopusTransDate: pollRes.object.transDate
                    };
                    this.props.octoddRecord(octoInfo);
                    this.props.payOctopus(total, octoInfo);
                });
                return false;
            } else {
                let cnMsg = "";
                let enMsg = "";
                if (pollRes.code === "100022") {
                    // Octopus强制重试错误时
                    if ( this.state.octopusRetrying === true ) {
                        // 正处理强制重试流程中
                        OctoCountdown.close();
                        this.setState({
                            octopusRetrying: true
                        }, () => {
                            // 请重试（八达通号码{cardID}）
                            cnMsg = (<ul>
                                <li>{intl.get("INFO_OCTO"+pollRes.errorCode+"TIP")}</li>
                                <li>{pollRes.enMsgTit}</li>
                                <li><p>&nbsp;</p></li>
                                <li>{intl.get("INFO_OCTO"+pollRes.errorCode+"STT")}</li>
                                <li>{pollRes.enMsgStt}</li>
                                <li><p>&nbsp;</p></li>
                                <li>{intl.get("INFO_OCTO"+pollRes.errorCode)}</li>
                                <li>{pollRes.enMsg}</li>
                                <li><p>&nbsp;</p></li>
                                <li>{intl.get("INFO_OCTIPRETRY", {cardID: pollRes.object.cardID})}</li>
                                <li>Retry please (Octopus no. {pollRes.object.cardID})</li>
                            </ul>);
                            OctoCountdown.open({
                                data: {
                                    cnMsg, 
                                    octoAccess: () => {
                                        // 继续poll，并重置倒计时时间
                                        // that.handlesSubmit("07", pollRes.object.cardID, pollRes.object.retryMsg.pollTimes);
                                        that.handlesSubmit("07", pollRes.object.cardID, 200);
                                    }
                                },
                            });
                        });
                    } else {
                        // 未在强制重试流程中
                        this.setState({
                            octopusRetrying: true
                        }, ()=>{
                            // 请通知顾客用同一张卡再次拍卡，以确保交易无误
                            cnMsg = (<ul>
                                <li>{intl.get("INFO_OCTO"+pollRes.errorCode+"TIP")}</li>
                                <li>{pollRes.enMsgTit}</li>
                                <li><p>&nbsp;</p></li>
                                <li>{intl.get("INFO_OCTO"+pollRes.errorCode+"STT")}</li>
                                <li>{pollRes.enMsgStt}</li>
                                <li><p>&nbsp;</p></li>
                                <li>{intl.get("INFO_OCTO"+pollRes.errorCode)}</li>
                                <li>{pollRes.enMsg}</li>
                            </ul>);
                            OctoCountdown.open({
                                data: {
                                    cnMsg, 
                                    octoAccess: ()=>{
                                        // 开始持续poll，重置倒计时时间20秒
                                        that.handlesSubmit("07", pollRes.object.cardID, 200);
                                    }
                                },
                            });
                        });
                    }
                    return false;
                } else if (pollRes.code === "100032") {
                    // Octopus拍卡超时错误时
                    if ( this.state.octopusRetrying === true ) {
                        // 正处理强制重试流程中
                        // 结束强制重试
                        // that.setState({octopusRetrying: false}, ()=>{
                        //     OctoCountdown.close();
                        //     that.hidePayDialog();
                        // });
                        // that.setState({octopusRetrying: false}, ()=>{
                            OctoCountdown.close();
                            cnMsg = intl.get("INFO_OCTO"+pollRes.code);
                            enMsg = pollRes.enMsg;
                            // that.hidePayDialog();
                        // });
                        // return false;
                    } else {
                        // 普通100032错误时
                        cnMsg = intl.get("INFO_OCTO"+pollRes.code);
                        enMsg = pollRes.enMsg;
                    }
                } else if (pollRes.code === "-999999") {
                    // 强制重试流程中，拍非SameCard错误时
                    OctoCountdown.close();
                    this.setState({
                        octopusRetrying: true
                    }, () => {
                        // 请重试（八达通号码{cardID}）
                        cnMsg = (<ul>
                            <li>{intl.get("INFO_OCTIPRETRY", {cardID: pollRes.object.cardID})}</li>
                            <li>Retry please (Octopus no. {pollRes.object.cardID})</li>
                        </ul>);
                        OctoCountdown.open({
                            data: {
                                cnMsg, 
                                octoAccess: () => {
                                    // 继续poll，不重置倒计时时间
                                    that.handlesSubmit("07", pollRes.object.cardID, pollRes.object.retryMsg.pollTimes);
                                }
                            },
                        });
                    });
                    return false;
                } else if (pollRes.code === "") {
                    // Octopus文档不涉及的空错误号
                    cnMsg = intl.get("INFO_OCTO999999", {errorCode: "010317"});
                    enMsg = "Error " + "010317";
                } else if (pollRes.errorCode === "999999") {
                    // Octopus文档不涉及的普通错误时
                    cnMsg = intl.get("INFO_OCTO999999", {errorCode: pollRes.code});
                    enMsg = "Error " + pollRes.code;
                } else if (typeof pollRes === "string") {
                    cnMsg = intl.get("INFO_OCTOSOCKETERR");
                    // enMsg = pollRes.enMsg;
                } else {
                    // Octopus文档中涉及的普通错误时
                    cnMsg = intl.get("INFO_OCTO"+pollRes.code);
                    enMsg = pollRes.enMsg;
                } 
                // Octopus普通错误弹窗
                if (this.state.octopusRetrying===true) {
                    if(pollRes.code==="100032"){
                            let _modal = Modal.confirm({
                                className: 'octoTipInfo',
                                title: intl.get("INFO_TIP"),   //提示
                                content: (<ul>
                                    <li className="en">{enMsg}</li>
                                    <li className="cn">{cnMsg}</li>
                                </ul>),
                                okText: intl.get("BTN_RETRY"),   //重试
                                cancelText: intl.get("BACKTRACK"),   //返回
                                onOk() {
                                    octoWaitStart();
                                    setTimeout( ()=>{that.handlesSubmit("07", pollRes.object.cardID, 50);}, 100); 
                                    _modal.destroy();
                                },
                                onCancel() {
                                    that.setState({octopusRetrying: false}, ()=>{
                                        if( pollRes.code !== "100001" ){
                                            octoClear(10);
                                        }
                                        window.octLog();
                                        that.hidePayDialog();
                                    });
                                },
                        })
                    }else{
                        // 正处理强制重试流程中
                        OctoCountdown.close();
                        // Octopus普通需重试/不需重试错误
                        if ( pollRes.code==="100001" || pollRes.code==="100005") {
                            cnMsg = (<ul>
                                <li>{cnMsg}</li>
                                <li>{enMsg}</li>
                            </ul>);
                        } else {
                            cnMsg = (<ul>
                                <li>{cnMsg}</li>
                                <li>{enMsg}</li>
                                <li><p>&nbsp;</p></li>
                                <li>{intl.get("INFO_OCTIPRETRY", {cardID: pollRes.object.cardID})}</li>
                                <li>Retry please (Octopus no. {pollRes.object.cardID})</li>
                            </ul>);
                        }
                        OctoCountdown.open({
                            data: {
                                cnMsg, 
                                octoAccess: () => {
                                    // 继续poll，不重置倒计时时间
                                    setTimeout( ()=>{ that.handlesSubmit("07", pollRes.object.cardID, pollRes.object.retryMsg.pollTimes); }, 100); 
                                    // that.handlesSubmit("07", pollRes.object.cardID, pollRes.object.retryMsg.pollTimes);
                                }
                            },
                        });
                    }
                } else {
                    // 未在强制重试流程中
                    if (pollRes.retry > 0) {
                        // Octopus普通需重试错误
                        let _modal = Modal.confirm({
                            className: 'octoTipInfo',
                            title: intl.get("INFO_TIP"),   //提示
                            content: (<ul>
                                <li className="en">{enMsg}</li>
                                <li className="cn">{cnMsg}</li>
                            </ul>),
                            okText: intl.get("BTN_RETRY"),   //重试
                            cancelText: intl.get("BACKTRACK"),   //返回
                            onOk() {
                                octoWaitStart();
                                setTimeout( ()=>{that.handlesSubmit()}, 100); 
                                _modal.destroy();
                            },
                            onCancel() {
                                that.setState({octopusRetrying: false}, ()=>{
                                    if( pollRes.code !== "100001" ){
                                        octoClear(10);
                                    }
                                    window.octLog();
                                    that.hidePayDialog();
                                });
                            },
                        });
                    } else {
                        // Octopus普通不需重试错误
                        Modal.info({
                            className: 'octoTipInfo',
                            title: intl.get("INFO_TIP"),   //提示
                            content: (<ul>
                                <li className="en">{enMsg}</li>
                                <li className="cn">{cnMsg}</li>
                            </ul>),
                            okText: intl.get("BACKTRACK"),   //返回
                            onOk() {
                                that.setState({octopusRetrying: false}, ()=>{
                                    if( pollRes.code !== "100001" ){
                                        octoClear(10);
                                    }
                                    window.octLog();
                                    that.hidePayDialog();
                                });
                            }
                        });
                    }
                }
            }
        } else if (this.props.payDialogData.virtualPayType=='2') {
            if(!!this.state.consumerId && this.state.consumerId!=""){
                this.props.payPoints(this.state.jfPayValue, this.state.jfxfBl, this.state.consumerId);
            } else {
                message("請輸入會員卡號");
                return false;
            }
        }
    }

    /* 积分付款 START */
    // 剩余积分查询
    searchPoints(){
        if(this.state.consumerId){
            this.props.searchPoints(this.state.consumerId);
        }
    }
    /* 积分付款 END */

    render() {
        if (this.props.payDialogData.virtualPayType=='4' && this.state.isRetry===true) {
            return (
                <div>
                    <div className="modal">
                    </div>
                    <div className="cashBox">
                        <div className="cashBoxCon" style={{width: '603px', height: '512px'}}>
                            <p className="title">
                                {this.props.payDialogData.name}
                                <img src={require('@/common/image/paytk_close.png')} alt="取消" onClick={this.hidePayDialog.bind(this)}/>
                            </p>
                            <div className="inputBox">
                                <Form>
                                    <FormItem className="xjzf">
                                        <Input className="xjzfInput"
                                            ref="xjzfInput" 
                                            onFocus={() =>{
                                                let input = this.refs.xjzfInput.input;
                                                input.select();
                                                this.openKeypad('payValue', true)}}
                                            value={this.state.payValue}
                                            disabled
                                        />
                                    </FormItem>
                                </Form>
                                <PayKeypad onInput={this.onInput} onBack={this.onBack} onClear={this.onClear} onOk={this.onOk}/>
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else if (this.props.payDialogData.virtualPayType=='2') {
            return (
                <div>
                    <div className="modal">
                    </div>
                    <div className="cashBox">
                        <div className="cashBoxCon" style={{ width: '850px', height: '500px' }}>
                            <p className="title">
                                {this.props.payDialogData.name}
                                <img src={require('@/common/image/paytk_close.png')} alt="取消" onClick={this.props.hidePayDialog}/>
                            </p>
                            <div className="inputBox_quan">
                                <Form onSubmit={this.handlesSubmit.bind(this)} style={{ flex: 1, padding: '0 32px'}}>
                                    <FormItem
                                        label="會員卡號"
                                        className="xjzf payCard">
                                        <Input className="xjzfInput" placeholder="請刷卡或掃碼"  disabled
                                            size="large" 
                                            ref={(input) => { this.xjzfInput = input; }}                                            
                                            value={this.state.consumerId}
                                            onFocus={() =>{
                                                // let input = this.xjzfInput.input;
                                                // input.select();
                                            }}
                                            onChange={
                                                ()=>{}
                                                // this.handleChangeKh.bind(this)
                                            }
                                            onPressEnter={this.handlesSubmit.bind(this)}
                                            />
                                    </FormItem>
                                    <FormItem
                                        label="應付積分"
                                        className="xjzf">
                                        <Input className="xjzfInput" disabled 
                                            value={this.state.jfPayValue}
                                            // value={this.state.jfPayValue}
                                            size="large"/>
                                    </FormItem>
                                    <FormItem
                                        label="抵扣金額"
                                        className="xjzf"
                                    >
                                        <Input className="xjzfInput" 
                                            value={this.state.payValue}
                                            ref="jfzfInput"
                                            onChange={()=>{}}
                                            onFocus={() =>{
                                                let input = this.refs.jfzfInput.input;
                                                input.select();
                                                this.openKeypad('payValue', true)}}
                                            size="large"/>
                                    </FormItem>
                                    {/* <FormItem
                                        label="可用积分"
                                        className="xjzf"
                                    >
                                        <Input className="xjzfInput" disabled 
                                            size="large" value={this.state.payYue} />
                                    </FormItem> */}
                                </Form>
                                <div style={{ flex: 1 }}>
                                    <PayKeypad onInput={this.onInput} onBack={this.onBack} onClear={this.onClear}
                                        onOk={this.onOk} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }else{
            return null;
        }
    }

}

export default ValuecardBox;
