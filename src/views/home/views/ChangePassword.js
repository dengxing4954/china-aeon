import React, {Component} from 'react';
import { Form, Modal, Input, Button, message, Row, Icon } from 'antd';
import withKeypad from '@/common/components/keypad/';
import {Fetch} from '@/fetch/';
import Url from '@/config/url.js';
import {connect} from 'react-redux';
const FormItem = Form.Item;



class ChangePassword extends Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    closeModal = () => {
        this.props.form.resetFields();
        this.props.callback();
        console.log('close');
    }

    setValue = (value) => {
        this.props.form.setFieldsValue(value);
    }

    submit = () => {
        console.log('sbm');
        this.props.form.validateFields((err, values) => {
            if (!err && this.props.callback) {
                this.props.callback(values, () => {this.props.form.resetFields();});
            }
        });
    }


    render() {
        const { visible } = this.props;
        const { getFieldDecorator } = this.props.form;
        return (
            <Modal className="presale_copy_bill"
                   width={450}
                   title="修改密碼"
                   visible={visible}
                   style={{
                       top:50
                   }}
                   footer={
                       <Button type="primary" style={{margin:0,padding:0}} onClick={this.submit}>確定</Button>
                   }
            >
                <Form>
                    <Icon type="close" onClick = {this.closeModal}/>
                    <Row>
                        <FormItem label="門店號" required={false} style={{margin:0}}>
                            {getFieldDecorator('mkt', {
                                rules: [{ required: true, message: '必須輸入原門店號!'}],
                            })(
                                <Input
                                    name='mkt'
                                    placeholder='請輸入門店號'
                                    onBlur={this.props.blur}
                                    onFocus={(e) => {this.props.focus(e, this.setValue, 'right');}} />
                            )}
                        </FormItem>
                    </Row>
                    <Row>
                        <FormItem label="工號"  required={false} style={{margin:0}}>
                            {getFieldDecorator('gh', {
                                rules: [{ required: true, message: '必須輸入工號!'}],
                            })(
                                <Input
                                    name='gh'
                                    placeholder='請輸入工號'
                                    onBlur={this.props.blur}
                                    onFocus={(e) => {this.props.focus(e, this.setValue, 'right');}} />
                            )}
                        </FormItem>
                    </Row>
                    <Row>
                        <FormItem label="原密碼" required={false} style={{margin:0}}>
                            {getFieldDecorator('passwd', {
                                rules: [{ required: true, message: '必須輸入原密碼!'}],
                            })(
                                <Input
                                    name='passwd'
                                    placeholder='請輸入原密碼'
                                    onBlur={this.props.blur}
                                    onFocus={(e) => {this.props.focus(e, this.setValue, 'right');}} />
                            )}
                        </FormItem>
                    </Row>
                    <Row>
                        <FormItem label="新密碼" required={false} style={{margin:0}}>
                            {getFieldDecorator('newpasswd', {
                                rules: [{ required: true, message: '必須輸入新密碼!'}],
                            })(
                                <Input
                                    name='newpasswd'
                                    placeholder='新密碼'
                                    onBlur={this.props.blur}
                                    onFocus={(e) => {this.props.focus(e, this.setValue, 'right');}} />
                            )}
                        </FormItem>
                    </Row>
                </Form>
            </Modal>
        )
    }
}

ChangePassword = Form.create()(ChangePassword);
export default withKeypad(ChangePassword);