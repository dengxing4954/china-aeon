import { Modal, Radio, Form, Input, DatePicker,Button, Col } from 'antd';
import React, { Component } from 'react';
import message from '@/common/components/message';
import intl from 'react-intl-universal';
import EventEmitter from '@/eventemitter/';
import moment from 'moment';
import '../style/exceptOld.less'
const RadioGroup = Radio.Group;
const FormItem = Form.Item;

class ExceptOldModal extends Component{

    state = {
        flag: false,
        sameDayReply: undefined,
        expressNo: '',
        enterFlag: 0,
    }

    componentWillUnmount() {
        EventEmitter.off('Scan', this.scan);
    }

    componentWillReceiveProps(nextProps) {
        if(this.props.exceptOldModal === false && nextProps.exceptOldModal === true){
            EventEmitter.on('Scan', this.scan);
        };
        if(this.props.exceptOldModal === true && nextProps.exceptOldModal === false){
            EventEmitter.off('Scan', this.scan);
        };
    }
    
    scan = data => {
        if(!!data && data.indexOf('?') !== -1){
            let list = data.split('?');
            list.shift();
            this.props.form.setFieldsValue({
                catCode: !!list[0] ? decodeURI(list[0]) : null,
                // sameDayReply: !!list[1] ? Number(decodeURI(list[1])): null,
                appointTime: !!list[2] ? decodeURI(list[2]) : null,
                appointDate: !!list[3] ? moment(decodeURI(list[3])) : null,
                linkPhone: !!list[4] ? decodeURI(list[4]) : null,
                linkName: !!list[5] ? decodeURI(list[5]) : null,
                linkAddress: !!list[6] ? decodeURI(list[6]) : null,
            })
            this.setState({ sameDayReply: !!list[1] ? Number(decodeURI(list[1])) : null});
            if(!!list[1] && list[1] !== '1'){
                this.setState({flag: false});
            }else{
                this.setState({flag: true});
            };
        }
    }

    // componentWillReceiveProps(nextProps) {
    //     if(nextProps.expressNumber !== this.props.expressNumber){
    //         this.props.form.setFieldsValue({
    //             expressNo: nextProps.expressNumber
    //         })
    //     }
    // }
    
    onChange = (e) => {
        let sameDayReply = e.target.value
        this.props.form.setFields({
            appointTime:{},
            appointDate: {},
            linkName: {},
            linkPhone: {},
            linkAddress: {},
        })
        this.setState({
            sameDayReply
        })
        if(sameDayReply === 1){
            this.setState({flag: true})
        }else{
            this.setState({flag: false})
        }
    }

    expressNoKeyDown = (e) => {
        let {enterFlag} = this.state
        if(e.keyCode === 13) {
            enterFlag++
            this.setState({enterFlag})
            if(enterFlag > 1){
                message('請清空後重新掃描')
            }else{
                this.props.form.setFieldsValue({
                    expressNo: this.state.expressNo
                })
            }
        }
    }

    expressNoChange = (e) =>{
        this.props.form.setFieldsValue({
            expressNo: e.target.value
        })
        this.setState({
            expressNo: e.target.value
        })
        if(e.target.value == ''){
            this.setState({enterFlag: 0})
        }
    }

    handleOk = () =>{
        // this.props.changeExceptOldValue(this.state.checkValue)
        if(this.state.sameDayReply !== undefined){
            this.props.form.validateFieldsAndScroll((err, value)=>{
                if(!err){
                    value.appointDate  = value.appointDate !== undefined ? moment(value.appointDate).format('YYYY-MM-DD') : value.appointDate
                    let params = Object.assign(value,{sameDayReply: this.state.sameDayReply})
                    this.props.changeExceptOldValue(params)
                    this.setState({flag: false, sameDayReply: undefined})
                    this.props.form.resetFields()
                }
            })
        }else{
            message('請選擇除舊方式')
        }
    }

    handleCancel = () => {
        // this.props.closeExceptOldModal()
        // this.props.form.resetFields()
        // this.setState({sameDayReply: undefined, flag: false})
        let callbackAction = () => {
            this.props.closeExceptOldModal()
            this.props.form.resetFields()
            this.setState({sameDayReply: undefined, flag: false})
        }
        //商品列表大于一则删除, 为1则取消全单
        if(this.props.goodsList.length > 1){
            this.props.delGoods(this.props.exceptOldGoodslist[0], null, callbackAction)
        }else{
            this.props.delBill(callbackAction)
        }
    }

    disabledDate(current) {
        return current && current < moment().startOf('day');
    }

    render (){
        const radioStyle = {
            display: 'block',
            height: '30px',
            lineHeight: '30px',
          };
        const { getFieldDecorator } = this.props.form
        const formItemLayout = {
            labelCol: {
              xs: { span: 24 },
              sm: { span: 6 },
            },
            wrapperCol: {
              xs: { span: 24 },
              sm: { span: 14 },
            },
          };
        // const {sdyncj} = this.props
        return (
            <Modal
            className="except_OldModal"
            visible = {this.props.exceptOldModal}
            width = {700}
            // title = {intl.get("SALES_EXPECTOLD")/*'选择除旧方式'*/}
            okText= {intl.get("BTN_CONFIRM")/*确定*/}
            footer = {
                <div>
                    <Button  onClick={this.handleCancel} >取消</Button>                
                    <Button type="primary" onClick={this.handleOk} >{intl.get("BTN_CONFIRM")/*确定*/}</Button> 
                </div>
            }
            cancelText= '取消'
            maskClosable = {false}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            afterClose={() => {document.getElementById('codeInput').focus()}}
            destroyOnClose={true}
            >
            <Form onSubmit={this.handleSubmit}>
                <FormItem  {...formItemLayout} label="收據編號" style ={{marginBottom: '5px'}}>
                        <span>{this.props.terminalSno}</span>
                </FormItem>
                <FormItem  {...formItemLayout} label="除舊服務記錄編號" style ={{marginBottom: '5px'}}>
                        <span>{this.props.recordNo}</span>
                </FormItem>
                {/* <FormItem  {...formItemLayout} label="送貨單編號" style ={{marginBottom: '5px'}}>
                    {getFieldDecorator('expressNo',{
                        rules:[{pattern:  /^\d{7}$/, max: 7, min: 7, message:'請輸入七位數字送貨單'}]             
                    })(
                            <Input
                                placeholder="輸入七位數字送貨單"
                                onKeyDown={this.expressNoKeyDown}
                                onChange = {this.expressNoChange}
                                maxLength = {7}
                             />
                        )}
                </FormItem> */}
                <FormItem  {...formItemLayout} label="商品類別" style ={{marginBottom: '5px'}}>
                    {getFieldDecorator('catCode', {
                         rules:[{required: true, message: '請選擇商品類別!' }] 
                    })(
                        <RadioGroup >
                              <Radio value='A'>空調機</Radio>
                              <Radio value='W'>洗衣機</Radio>
                              <Radio value='R'>電冰箱</Radio>
                              <Radio value='T'>電視機</Radio>
                              <Radio value='P'>列印機</Radio>
                              <Radio value='S'>掃描器</Radio>
                              <Radio value='M'>顯示器</Radio>
                              <Radio value='C'>電腦</Radio>
                        </RadioGroup>
                    )}
                </FormItem>
                <FormItem  {...formItemLayout} label="除舊方式" style ={{marginBottom: '5px'}}>      
                        <RadioGroup  onChange = {this.onChange}  value={this.state.sameDayReply}>
                              <Radio value={1}>選取法定除舊服務</Radio>
                              <Radio value={2}>放棄並選用升級服務</Radio>
                              <Radio value={3}>放棄所有除舊服務</Radio>
                              <Radio value={4}>3日內回覆</Radio>
                        </RadioGroup> 
                </FormItem>
                <FormItem  {...formItemLayout} label="預約時間" style ={{marginBottom: '5px'}}>
                    {getFieldDecorator('appointTime', {
                        rules: [{ required: this.state.flag, message: '請選擇預約時間!' }],
                        })(
                        <RadioGroup disabled = {!this.state.flag}>
                              <Radio value='AM'>(AM): 09:00 - 12:00</Radio>
                              <Radio value='PM'>(PM): 13:00 - 18:00</Radio>
                        </RadioGroup>
                    )}
                </FormItem>
                <FormItem  {...formItemLayout} label="預約日期" style ={{marginBottom: '5px'}}>
                {getFieldDecorator('appointDate', {
                        rules: [{ required: this.state.flag, message: '請輸入預約日期!' }],
                        })(
                            <DatePicker disabled = {!this.state.flag} placeholder= '請選擇預約日期' style = {{width: '100%'}}  disabledDate={this.disabledDate}/>
                        )}
                </FormItem>
                <FormItem  {...formItemLayout} label="聯系人姓名" style ={{marginBottom: '5px'}}>
                    {getFieldDecorator('linkName', {
                        rules: [{ required: this.state.flag, message: '請輸入聯系人姓名!' }],
                        })(
                            <Input
                                placeholder="請輸入聯系人姓名"  disabled = {!this.state.flag}
                             />
                        )}
                </FormItem>
                <FormItem  {...formItemLayout} label="聯系人電話" style ={{marginBottom: '5px'}}>
                    {getFieldDecorator('linkPhone', {
                        rules: [{ required: this.state.flag, message: '請輸入聯系人電話!' }],
                        })(
                            <Input
                                placeholder="請輸入聯系人電話" disabled = {!this.state.flag}
                             />
                        )}
                </FormItem>
                <FormItem  {...formItemLayout} label="聯系人地址" style ={{marginBottom: '0px'}}>
                    {getFieldDecorator('linkAddress', {
                        rules: [{ required: this.state.flag, message: '請輸入聯系人地址!' }, {max: 20, message:'聯系人地址最大不超過20'}],
                        })(
                            <Input.TextArea
                                placeholder="請輸入聯系人地址" disabled = {!this.state.flag} 
                                autosize={{ minRows: 2 }}
                                maxLength = {20}
                             />
                        )}
                </FormItem>
            </Form>
            </Modal>
        )
    }
}
ExceptOldModal = Form.create()(ExceptOldModal);
export default ExceptOldModal