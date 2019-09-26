import React, { Component } from 'react';
import NumberKeypad from '@/common/components/numberKeypad/index.js';
import { Form, Modal, Input, Button, message, Row, Icon } from 'antd';
import withKeypad from '@/common/components/keypad/';
const FormItem = Form.Item;



class ResetTicket extends Component {

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
        this.props.form.resetFields();
        this.props.callback();
    }

    setValue = (value) => {
        this.props.form.setFieldsValue(value);
    }

    submit = () => {
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
            <Modal
                title={null}
                visible={visible}
                closable={false}
                maskClosable={false}
                footer={null}
                mask={true}
                zIndex={2}
                width={400}
                style={{
                    position: 'absolute',
                    margin: 'auto',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    width: '50%',
                    height: '50%'
                }}
                bodyStyle={{margin: 0, padding: 0}}
            >
                <div className="easypay">
                    <div className="head">
                        小票重置
                        <img src={require("@/common/image/close.png")} alt="" type='close' onClick={this.closeModal}/>
                    </div>
                    <Form onSubmit={this.handleSubmit}>
                        <FormItem label="当前小票号"  required={false} style={{margin:'0 20px 20px 20px'}}>
                            {getFieldDecorator('syjcurnum', {
                                rules: [{ required: true, message: '必须输入当前小票号!'}],
                            })(
                                <Input
                                    name='syjcurnum'
                                    placeholder='请输入当前小票号'
                                    onBlur={this.props.blur}
                                    onFocus={(e) => {this.props.focus(e, this.setValue, 'right');}} />
                            )}
                        </FormItem>
                        <Row>
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="default"
                                style = {{float: 'right', marginBottom: '10px', marginRight: '10px'}}
                                onClick = {this.submit}
                            >重置</Button>
                        </Row>
                    </Form>
                </div>
            </Modal>
        )
    }
}


ResetTicket = Form.create()(ResetTicket);
export default withKeypad(ResetTicket);