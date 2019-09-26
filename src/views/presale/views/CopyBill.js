import React, { Component } from 'react';
import NumberKeypad from '@/common/components/numberKeypad/index.js';
import { Form, Modal, Input, Button, Row, Icon } from 'antd';
import withKeypad from '@/common/components/keypad/';
import withKeyBoard from '@/common/components/keyBoard';
import intl from 'react-intl-universal';
const FormItem = Form.Item;

//商品明细
class CopyBill extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    componentDidMount() {
        this.props.bind({
            //pageUP
            "33": () => {
                
            },
            //pageDown
            "34": () => {
            },
            //end
            "35": () => {
                this.closeModal();
            },
            //home
            "36": () => {
                this.submit();
            },
        });
    }

    componentWillMount() {
    }

    closeModal = () => {
       /* this.props.form.setFieldsValue({
            discounts: '',
            rebate: '',
            qty: '',
        });*/
        this.props.form.resetFields();
        this.props.callback();
    }

    setValue = (value) => {
        this.props.form.setFieldsValue(value);
    }

    submit = () => {
        this.props.form.validateFields((err, values) => {
            if (!err && this.props.callback) {
                this.props.callback(values.fphm, () => {this.props.form.resetFields();});
            }
        });
    }

    onInputKeyDown = (e) => {
        if(e.keyCode === 13) {
            let value = this.props.form.getFieldValue('fphm');
            this.props.callback(value);
            this.props.form.resetFields();
            this.props.blur({});
        }
    }

    render() {
        const { visible } = this.props;
        const { getFieldDecorator } = this.props.form;
        return (
            <Modal className="presale_copy_bill"
                   width={450}
                   style={{ top: 150 }}
                   title={intl.get("MENU_TICKET COPY")}
                   visible={visible}
                   footer={
                        <div>
                            <Button onClick={this.closeModal}>取消</Button>
                            <Button type="primary" onClick={this.submit}>{intl.get("BTN_CONFIRM")}</Button>
                        </div>
                   }
                   afterClose={() => {document.getElementById('codeInput').focus()}}
                   destroyOnClose={true}
                >
                <Form>
                    {/*<Icon type="close" onClick = {this.closeModal}/>*/}
                    {/*<Row>
                        <FormItem label="原门店号" required={false}>
                            {getFieldDecorator('mkt', {
                                rules: [{ required: true, message: '必须输入原门店号!'}],
                            })(
                                <Input
                                    name='mkt'
                                    placeholder='请输入原门店号'
                                    onBlur={this.props.blur}
                                    onFocus={(e) => {this.props.focus(e, this.setValue, 'right');}} />
                            )}
                        </FormItem>
                    </Row>*/}
                    {/*<Row>
                        <FormItem label={intl.get("RETURNGOODS_CASHIERNUM")}  required={false}>
                            {getFieldDecorator('syjh', {
                                rules: [{ required: true, message: intl.get("INFO_CASHIERNUM")}],
                            })(
                                <Input
                                    name='syjh'
                                    placeholder={intl.get("PLACEHOLDER_OSYJH")}
                                    onBlur={this.props.blur}
                                    onFocus={(e) => {this.props.focus(e, this.setValue, 'right');}} />
                            )}
                        </FormItem>
                    </Row>*/}
                    <Row>
                        <FormItem label={intl.get("RETURNGOODS_NUM")} required={false}>
                            {getFieldDecorator('fphm', {
                                rules: [{ required: true, message: intl.get("INFO_NUM")}],
                            })(
                                <Input
                                    autoFocus={true}
                                    name='fphm'
                                    placeholder={intl.get("PLACEHOLDER_OFPHM")}
                                    onBlur={this.props.blur}
                                    onFocus={(e) => {this.props.focus(e, this.setValue);}}
                                    onKeyDown={this.onInputKeyDown}/>
                            )}
                        </FormItem>
                    </Row>
                </Form>
            </Modal>
        );
    }
}

CopyBill = Form.create()(CopyBill);

export default withKeyBoard(withKeypad(CopyBill));
