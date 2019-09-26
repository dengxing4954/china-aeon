import React, { Component } from 'react';
import moment from 'moment';
import EventEmitter from '@/eventemitter/';
import { Modal, Row, Col, Button, Form, DatePicker, Input, Select, Radio, Table } from 'antd';
import { Fetch } from '@/fetch/'
import Url from '@/config/url.js'
import PayKeypad from '@/common/components/showPaybox/payKeypad/views/payKeypad.js'
import message from '@/common/components/message';
import '../style/fundPay.less';

const FormItem = Form.Item;
let name = ''; //转换输入框值
let qxValue = false

class FundPayModal extends Component {

    state = {
        payinModeList: [],
        cashCount: "",
        cashAmount: "",
        totalCount: "",
        totalAmount: "",
        paymentList: null
    }

    //打开数字小键盘
    openKeypad = (key, state) => {
        name = key;
        qxValue = state;
        // this.setState({
        //     inputName: key
        // });
    }

    onInput = (value) => {
        if (value === '.') {
            message('非数字键请重新输入');
            return;
        }else{
            let _value = this.state[name]._count;
            if(qxValue == true){
                _value = ""
            }
            if(_value.length>=11){
                message("超出范围，请检查后重新输入");
                return;
            }
            let obj = {...this.state[name]};
            obj._count = _value + value;
            obj._amount = obj._count * obj.base;
            this.setState({
                [name]: obj
            });
            qxValue = false
        }
    }

    onBack = () => {
            let value = "" + this.state[name]._count;
            let obj = {...this.state[name]};
            obj._count = value.substring(0, value.length - 1);
            if (obj._count.length>0) {
                obj._amount = obj._count * obj.base;
            } else {
                obj._amount = "";
            }
            this.setState({
                [name]: obj
            });
    }

    onClear = () => {
        let obj = {...this.state[name]};
        obj._count = "";
        obj._amount = "";
        this.setState({
            [name]: obj
        });
    }

    onOk = () => { }


    componentDidMount() {
        console.log("++++componentDidMount : ", this.props);
        let _date = new Date();
        let _m = _date.getMonth()+1;
        // _m = _m > 9 ? _m : "0"+_m;
        let _d = _date.getDate();
        // _d = _d > 9 ? _d : "0"+_d;
        let _dateStr = _date.getFullYear() + "-" + _m + "-" + _d;
        const req = {
            command_id: "GETCLEARINFO",
            startTime: "2019-7-20 00:00:00",     //_dateStr + " 00:00:00", 
            endTime: "2019-8-22 23:59:59",       //_dateStr + " 23:59:59",
            terminalNo: this.props.extra.terminalNo,
            terminalOperator: this.props.extra.terminalOperator,
            shopCode: this.props.extra.shopCode,
            erpCode: this.props.extra.erpCode
        };
        let pms = [];
        let pmsObjects = {};
        this.props.payinMode.map( (pm, index) => {
            let _id = (pm.paySCode || "pm") + "_" + pm.base;
            let _obj = {
                _id, 
                _count: "", 
                _amount: "", 
                ...pm
            };
            pms.push(_obj);
            pmsObjects[_id] = {..._obj};
            if (index === 0) {
                name = _id;
            }
        });
        this.setState({
            ...pmsObjects,
            payinModeList: pms
        });
        Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then(res => {
            //{"commandId":"GETCLEARINFO","data":{"paymentList":[{"payCode":"3301","payName":"支付宝","payType":"5","sumAmount":4.63}]},"returncode":"0"}
            if(!!res && res.returncode==="0" && !!res.data && !!res.data.paymentList){
                this.setState({
                    paymentList: res.data.paymentList
                });
            }
        }).catch((error) => {
            console.error('error', error);
        });
    }

    componentWillUnmount() {
    }

    handleOk = () => {

    }

    handleChange(e){
        let obj = this.state[name];
        if(obj._count.length>=11){
            message("超出范围，请检查后重新输入");
            return;
        }
        obj._count = e.target.value;
        if (obj._count=="") {
            obj._amount = "";
        } else {
            obj._amount = obj.base * obj._count;
        }
        this.setState({
            [name]: {...obj}
        });
    }

    handleSubmit = () => {
        let resetPendding = ()=>{            
            this.setState({ pendding: false });
        }
        if (this.state.pendding===true) {
            return false
        } else {
            this.setState({pendding: true}, ()=>{
                console.log("DO SUBMIT", this.state, this.props)
                let _payDtl = [];
                let _no = 1;
                this.state.payinModeList.map( (pm, index) => {
                    if( this.state[pm._id]._count!=""){
                        _payDtl.push({
                            number: this.state[pm._id]._count,
                            amountTotal: this.state[pm._id]._amount,
                            rowNo: _no,
                            payInCode: this.state[pm._id].payCode,
                            payInName: this.state[pm._id].payName
                        });
                        _no++;
                    }
                });
                //{"paymentList":[{"payCode":"3301","payName":"支付宝","payType":"5","sumAmount":4.63}]}
                this.state.paymentList.map( (pm, index) => {
                    _payDtl.push({
                        // number: this.state[pm._id]._count,
                        amountTotal: pm.sumAmount,
                        rowNo: _no,
                        payInCode: pm.payCode,
                        payInName: pm.payName
                    });
                    _no++;
                });
                const req = {
                    command_id: "SENDPAYIN",
                    payinhead: {
                        // cash: ,
                        // cashier: ,
                        // cheque: ,
                        // coupon: ,
                        // ecard: ,
                        // other: ,
                        // sellDate: ,
                        mkt: this.props.extra.shopCode,
                        syjh: this.props.extra.terminalNo,
                        erpCode: this.props.extra.erpCode
                    },
                    payindetail: _payDtl
                };
                Fetch(
                    {
                        url: Url.base_url,
                        type: "POST",
                        data: req
                    }
                ).then(res => {
                    if(!!res && res.retflag==="0"){
                        message("缴款完成！");
                        this.props.close();
                    } else {
                        message("缴款失败！");
                        return;
                    }
                    console.log("SENDPAYIN res~~~~", res)
                    resetPendding();
                }).catch((error) => {
                    resetPendding();
                    console.error('error', error);
                });
            });

        }
    }

    handleCancel = () => {
        this.props.close();
    }

    render() {
        let _that = this;
        let items = this.state.payinModeList.map(m => {
            return (                     
                <FormItem
                    label={this.state[m._id].payName+"["+this.state[m._id].base+"]"}
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                >
                    <Input placeholder="" className={"count"}
                        ref={this.state[m._id]._id}
                        onFocus={ () => {
                            this.openKeypad(this.state[m._id]._id, true)
                        } }
                        onChange={
                            this.handleChange.bind(this)
                        }
                        value={this.state[m._id]._count==""? "" : this.state[m._id]._count} />
                    {this.state[m._id]._amount==""? null :(<div className="amount">金额：{this.state[m._id]._amount}</div>)}
                </FormItem>)
        });
        return (
            <Modal
                className='fundPay'
                visible={true}
                width={960}
                height={640}
                title="缴款"
                // okText="确定"
                // cancelText="返回"
                // onOk={this.handleSubmit}
                // onCancel={this.handleCancel}
                footer={[
                    <div className="totalAmount">
                        {!!this.state.totalAmount && this.state.totalAmount!="" ? "总金额：" + this.state.totalAmount : ""}
                    </div>,
                    <Button key="back" onClick={this.handleCancel}>
                      返回
                    </Button>,
                    <Button key="submit" type="primary" onClick={this.handleSubmit}>
                      确定
                    </Button>,
                  ]}
                style = {{position: 'relative', top: '50px'}}
            >
                <Row>
                    <Form className="form">
                        <Col span={14}>     
                            <div className="pmList">
                                {items}
                            </div>
                        </Col> 
                        <Col span={10}>
                            <div className="keypad">
                                <PayKeypad onInput={this.onInput} onBack={this.onBack} onClear={this.onClear}
                                    onOk={this.onOk} hideOk={true}/>
                            </div>
                        </Col>
                    </Form>
                </Row>
            </Modal>
        )
    }
}

export default Form.create()(FundPayModal)

