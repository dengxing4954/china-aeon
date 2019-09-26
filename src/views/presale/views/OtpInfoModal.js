import React, { Component } from 'react';
import { Modal, Row, Col, Button, List, Spin } from 'antd';
import message from '@/common/components/message';
import OctoCountdown from '@/common/components/octoCountdown/index.js';
import '../style/OtpInfoModal.less';
import intl from 'react-intl-universal';

let octoWaitingModal = null;
// let octoClearTimer = null;

let octoClear = (sec) => {
    console.log("octoClear: ", sec);
    if (!!global.octoClearTimer) {
        clearTimeout(global.octoClearTimer);
    }
    global.octoClearTimer = setTimeout(()=>{window["Octopus"]({type:'06'})}, sec*1000);
}

class OtpInfoModal extends Component {

    state = {
        cardno: null,
        balance: '',
        cardLog: [],
        deviceID: "",
        octopusRetrying: false
    }

    handleOk = () => {
        if(this.props.callback) {
            this.props.callback();
        }
        this.props.close();
    }

    handleCancel = () => {        
        octoClear(10);
        this.props.close();
    }

    searchOctopus = () => {    
        let that = this;
        let octoWaitEnd = ()=>{
            if (!!octoWaitingModal) {
                octoWaitingModal.destroy()
            }
        }            
        let octoWaitStart = ()=>{
            octoWaitingModal = Modal.info({
                className: "octoWaiting",
                content: (<div><Spin/> &nbsp; {intl.get("INFO_OCTOSWIPE")}</div>)
            });
        }
        let pollRes = window["Octopus"]({type:'01'});
        // console.log("pollRes~~: ", pollRes, typeof pollRes);
        this.setState({
            cardno: null,
            balance: '',
            cardLog: [],
            deviceID: "",
            customerInfo: null
        }, ()=>{
            // let pollRes = window["Octopus"]({type:'04'});
            octoWaitEnd();
            if(pollRes.success){
                // octoClear(10);
                OctoCountdown.close();
                let _tempBalance = pollRes.object.balance;
                _tempBalance = (_tempBalance/10).toFixed(1);
                that.setState({
                    cardno: pollRes.object.cardID,
                    balance: _tempBalance,
                    cardLog: pollRes.object.cardLog,
                    deviceID: pollRes.object.deviceID,
                    customerInfo: pollRes.object.customerInfo
                });
            }else{
                let cnMsg = "";
                let enMsg = "";
                if (pollRes.code === "100022") {
                    if ( this.setState.octopusRetrying === true ) {
                        message(intl.get("INFO_OCTIPRETRY", {cardID: pollRes.object.cardID}));
                    } else {
                        this.setState({
                            octopusRetrying: true
                        }, () => {
                            cnMsg = (<ul>
                                <li>{intl.get("INFO_OCTO"+pollRes.errorCode+"TIP")}</li>
                                <li>{intl.get("INFO_OCTO"+pollRes.errorCode+"STT")}</li>
                                <li>{intl.get("INFO_OCTO"+pollRes.errorCode)}</li>
                            </ul>);
                            enMsg = (<ul>
                                <li>{pollRes.enMsgTit}</li>
                                <li>{pollRes.enMsgStt}</li>
                                <li>{pollRes.enMsg}</li>
                            </ul>);
                            OctoCountdown.open({
                                data: {
                                    cnMsg, enMsg,
                                    octoAccess: () => {
                                        that.searchOctopus();
                                    },
                                    octoRetryEnd: () => {
                                        that.state({ octopusRetring: false }, ()=>{                                    
                                            octoClear(10);
                                        });
                                    }
                                },
                            });
                        });
                    }
                    return false;
                } else if (pollRes.errorCode === "999999") {
                    cnMsg = intl.get("INFO_OCTO999999", {errorCode: pollRes.code});
                    enMsg = "Error " + pollRes.code;
                } else if (typeof pollRes === "string") {
                    cnMsg = intl.get("INFO_OCTOSOCKETERR");
                    // enMsg = pollRes.enMsg;
                } else {
                    cnMsg = intl.get("INFO_OCTO"+pollRes.code);
                    enMsg = pollRes.enMsg;
                }
                if(pollRes.retry>0){
                    let _modal = Modal.confirm({
                        className: "octoTipInfo",
                        title: intl.get("INFO_TIP"),   
                        content: (<ul>
                            <li className="en">{enMsg}</li>
                            <li className="cn">{cnMsg}</li>
                        </ul>),
                        okText: intl.get("BTN_RETRY"),   
                        cancelText: intl.get("BACKTRACK"),   
                        onOk() {
                            octoWaitStart();
                            setTimeout( ()=>{that.searchOctopus();}, 100);
                            _modal.destroy();
                        },
                        onCancel() {
                            // octoClear(10);
                            that.handleCancel();
                        },
                    });                    
                }else{
                    Modal.info({
                        className: "octoTipInfo",
                        title: intl.get("INFO_TIP"),   
                        content: (<ul>
                            <li className="en">{enMsg}</li>
                            <li className="cn">{cnMsg}</li>
                        </ul>),
                        okText: intl.get("BACKTRACK"),   
                        onOk() {
                            // octoClear(10);
                            that.handleCancel();
                        }
                    });
                }
                return;
            }
        });
    }

    componentDidMount() {
        this.searchOctopus();
    }

    render() {
        const { data } = this.props;        
        const ds = this.state.cardLog;
        const dsItems = ds.map( (xItem, ind) => {
            let res = null;
            if(ind<4){
                let mid = xItem.machineID || "";
                let indFix = mid.toUpperCase()===this.state.deviceID.toUpperCase().substring(2,6) ? "#" : "";
                let dtStr = xItem.transactionTime.split(" ");
                let amt = (xItem.transactionAmt/10).toFixed(1);
                let amtFix = amt>0?"+":(amt<0?"-":"");
                res = (
                    <li key={"oftInfo"+ind}>
                        <span className="index">{ind+1} {indFix}</span>
                        <span className="datetime">{dtStr[0]}<span className="dtsep"></span>{dtStr[1]}</span>
                        <span className="amount">{amtFix + "$" + Math.abs(amt).toFixed(1)}</span>
                        <span className="device">{mid.toUpperCase()}</span>
                    </li>
                );                
            }
            return res;
        } );

        let isSmartCard = false;
        if (!!this.state.customerInfo && !!this.state.customerInfo.octopusType){
            if( this.state.customerInfo.octopusType==="1"){
                isSmartCard = true;
            }
        }

        return !!this.state.cardno ? (<Modal
                className = 'otpInfo'
                visible = {true}
                width = {700}
                title = {intl.get("MENU_OTP")/* 查阅OTP */}
                okText={intl.get("INFO_CONFIRM")}
                footer = {null}
                maskClosable = {false}
                onOk={this.handleOk}
            >
                <Row>
                    <Col span={24}>
                        <ul className="cardInfo">
                            <li>Octopus no.: {this.state.cardno}</li>
                            {isSmartCard===true ? null : (<li>Octopus card Remaining Value: {this.state.balance>0? "" : (this.state.balance<0 ? "-" : "")}${Math.abs(this.state.balance).toFixed(1)}</li>)}
                        </ul>
                        {this.state.cardLog.length>0?
                            (<ul className="cardLog">
                                <li>
                                    <span className="index">No.</span>
                                    <span className="datetime">Transaction Date Time</span>
                                    <span className="amount">Amount</span>
                                    <span className="device">Device ID</span>
                                </li>
                                {dsItems}
                            </ul>)
                            :null}
                        <div style={{marginTop: "20px", width: "100%", float:"right"}}>
                            <Button type="primary" htmlType="submit" style={{marginLeft:'10px', float:"right"}}  onClick={this.handleCancel}>{intl.get("INFO_CONFIRM")}</Button>
                        </div>
                    </Col>
                </Row>
            </Modal>) : null;
    }
}

export default OtpInfoModal
