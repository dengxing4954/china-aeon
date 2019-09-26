import React, { Component } from 'react';
import NumberKeypad from '@/common/components/numberKeypad/index.js';
import { Form, Modal, Input, Button, Row, Icon } from 'antd';
import withKeypad from '@/common/components/keypad/';
import intl from 'react-intl-universal';
const FormItem = Form.Item;

class SyncFphm extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    componentDidMount() {
    }

    componentWillMount() {
    }

    closeModal = () => {
        this.props.callback();
    }

    setValue = (value) => {
        this.props.form.setFieldsValue(value);
        this.props.form.validateFields();
    }

    onBlur = () => {
        console.log(123);
    }

    submit = () => {
        this.props.form.validateFields((err, values) => {
            console.log(values);
            if (!err && this.props.callback) {
                this.props.callback(values);
            }
        });
    }

    validateFphm = (rule, value, callback) => {
        if (value && (!/^(\d{4})$/.test(value)|| value === '0000')) {
            callback('請輸入正確的4位小票號')
        }
        callback()
    }

    render() {
        const { visible } = this.props;
        const { getFieldDecorator } = this.props.form;
        return (
            <Modal className="presale_copy_bill"
                   width={450}
                   style={{ top: 150 }}
                   title='更新小票號'
                   visible={visible}
                   footer={
                        <div>
                            <Button onClick={this.closeModal}>取消</Button>
                            <Button type="primary" onClick={this.submit}>{intl.get("BTN_CONFIRM")}</Button>
                        </div>
                   }
                   destroyOnClose={true}
                >
                <Form>
                    <Row>
                        <FormItem label='起始小票號' required={false}>
                            {getFieldDecorator('startFphm', {
                                rules: [{ validator: this.validateFphm}],
                            })(
                                <Input
                                    autoFocus={true}
                                    name='startFphm'
                                    placeholder='請輸入4位小票號'
                                    //onBlur={this.props.blur}
                                    //onFocus={(e) => {this.props.focus(e, this.setValue, 'right');}}
                                    onBlur={this.onBlur}
                                    {...this.props.inputBind(this.setValue, 'right')}/>
                            )}
                        </FormItem>
                        <FormItem label='結束小票號' required={false}>
                            {getFieldDecorator('endFphm', {
                                rules: [{ validator: this.validateFphm}],
                            })(
                                <Input
                                    name='endFphm'
                                    placeholder='請輸入4位小票號'
                                    onBlur={this.props.blur}
                                    onFocus={(e) => {this.props.focus(e, this.setValue, 'right');}}/>
                            )}
                        </FormItem>
                    </Row>
                </Form>
            </Modal>
        );
    }
}

SyncFphm = Form.create()(SyncFphm);

export default withKeypad(SyncFphm);
