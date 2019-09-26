import React, { Component } from 'react';
import NumberKeypad from '@/common/components/numberKeypad/index.js';
import '../style/oneDayPassport.less'
import { Form, Modal, Input, Button, Row, Icon } from 'antd';
import withKeypad from '@/common/components/keypad/';
import intl from 'react-intl-universal';
const FormItem = Form.Item;

//商品明细
class OneDayPassport extends Component {
    constructor(props) {
        super(props);
        this.state = {
            replaceFlag: false
        };
    }

    componentDidMount() {
    }

    componentWillMount() {
    }

    componentWillReceiveProps (nextProps) {
        if(nextProps.visible && !this.props.visible) {
            setTimeout(() => {
                this.openKeypad('code1', document.getElementById('code1'))
            }, 15)
        }
    }

    closeModal = () => {
       /* this.props.form.setFieldsValue({
            discounts: '',
            rebate: '',
            qty: '',
        });*/
        this.props.form.resetFields();
        this.props.callback('cancel');
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

    openKeypad = (name, target) => {
        const {setFieldsValue, getFieldValue} = this.props.form;
        NumberKeypad.open({
            top:  target.getBoundingClientRect().top,
            left: 300,
            boundInput: target,
            onInput: (value, isReset) => {
                let _value = getFieldValue(name);
                if(isReset || !_value) {
                    setFieldsValue({[name]: value});
                } else {
                    if(this.state.replaceFlag !== true) {
                        setFieldsValue({[name]: value});
                    } else {
                        setFieldsValue({[name]: _value + value});
                    }
                }
                this.setState({replaceFlag: true});
            },
            onBack: () => {
                let value = getFieldValue(name) + '';
                setFieldsValue({[name]: value.substring(0, value.length-1)});
                this.setState({replaceFlag: true});
            },
            onClear: () => {
                setFieldsValue({[name]: ''});
                this.setState({replaceFlag: true});
            },
            onCancel: () => {
                setFieldsValue({[name]: ''});
                this.setState({replaceFlag: false});
            },
            onOk: () => {
                if(name === 'code1') {
                    this.props.form.getFieldInstance('code2').focus();
                    setTimeout(() => {
                        this.openKeypad('code2', document.getElementById('code2'))
                    }, 15)
                }
                if(name === 'code2') {
                    this.props.form.getFieldInstance('couponCode').focus();
                    setTimeout(() => {
                        this.openKeypad('couponCode', document.getElementById('couponCode'))
                    }, 15)
                }
                this.setState({replaceFlag: false})
            },
            afterAutoClose: () => {
                this.setState({replaceFlag: false})
            }
        })
    }

    codeKeyDown = (e, type) => {
        if(e.keyCode === 13) {
            NumberKeypad.close();
            this.setState({replaceFlag: false})
            switch (type) {
                case 'code1':
                    this.props.form.getFieldInstance('code2').focus();
                    setTimeout(() => {
                        this.openKeypad('code2', document.getElementById('code2'))
                    }, 15)
                    break;
                case 'code2':
                    this.props.form.getFieldInstance('couponCode').focus();
                    setTimeout(() => {
                        this.openKeypad('code2', document.getElementById('couponCode'))
                    }, 15)
                    break;
                default :
                    break;
            }
        }
    }

    render() {
        const { visible, callback } = this.props;
        const { getFieldDecorator } = this.props.form;
        return (
            <Modal className="presale_oneday_passport"
                   width={450}
                   style={{ top: 80 }}
                   title={intl.get("MENU_ONEDAYPASSPORT")}
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
                    <Row>
                        <FormItem label={`${intl.get("ONEDAYPASSPORT_CODE")}1`} required={false}>
                            {getFieldDecorator('code1', {
                                rules: [
                                    { required: true, message: intl.get("ONEDAYPASSPORT_CODE_WARN")},
                                    { len: 6, message: '識別碼1長度必須為6位'}],
                            })(
                                <Input
                                    autoFocus={true}
                                    placeholder={intl.get("ONEDAYPASSPORT_CODE_INFO")}
                                    onKeyDown={(e) => this.codeKeyDown(e, 'code1')}
                                    onClick={(e) => this.openKeypad('code1', e.target)}/>
                            )}
                        </FormItem>
                    </Row>
                    <Row>
                        <FormItem label={`${intl.get("ONEDAYPASSPORT_CODE")}2`}  required={false}>
                            {getFieldDecorator('code2', {
                                rules: [
                                    { required: true, message: intl.get("ONEDAYPASSPORT_CODE2_WARN")},
                                    { len: 14, message: '識別碼2長度必須為14位'}],
                            })(
                                <Input
                                    placeholder={intl.get("ONEDAYPASSPORT_CODE2_INFO")}
                                    onClick={(e) => this.openKeypad('code2', e.target)}
                                    onKeyDown={(e) => this.codeKeyDown(e, 'code2')}/>
                            )}
                        </FormItem>
                    </Row>
                    <Row>
                        <FormItem label={intl.get("ONEDAYPASSPORT_NO")} required={false}>
                            {getFieldDecorator('couponCode', {
                                rules: [
                                    { required: true, message: intl.get("ONEDAYPASSPORT_NO_WARN")},
                                    { max: 16, message: '全日通券號不超過16位'}
                                ],
                            })(
                                <Input
                                    onClick={(e) => this.openKeypad('couponCode', e.target)}
                                    placeholder={intl.get("ONEDAYPASSPORT_NO_INFO")}
                                    onKeyDown={(e) => this.codeKeyDown(e, 'couponCode')}/>
                            )}
                        </FormItem>
                    </Row>
                </Form>
            </Modal>
        );
    }
}

OneDayPassport = Form.create()(OneDayPassport);

export default withKeypad(OneDayPassport);
