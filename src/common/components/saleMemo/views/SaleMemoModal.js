import React, { Component } from 'react';
import { Modal, Row, Col, Button, Table, Input, Form } from 'antd';
import '../style/SaleMemoModal.less';
import NumberKeypad from '@/common/components/numberKeypad/index.js';
import intl from 'react-intl-universal';
import message from '@/common/components/message';
const FormItem = Form.Item;

class SaleMemoModal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            saleMemoValue: "",
            djValue: "",
            replaceFlag: false,
            focused: false
        }
    }

    componentDidMount() {
        this.setState({
            saleMemoValue: !!this.props.data.salesMemo ? this.props.data.salesMemo : "",
            djValue: this.props.data.djValue,
            replaceFlag: false,
            focused: this.props.data.salesMemo !== undefined ? true : false
        })
    }

    componentWillMount() {
    }

    handleFocus = (top, left, target, key) => {
        let that = this;
        this.setState({
            focused: true
        });
        NumberKeypad.open({
            top: top,
            left: left || 94,
            keyboard: null,
            boundInput: target,
            onInput: (value, isReset) => {
                if (!!this.state[key]) {
                    if (this.state[key].length === 7) {
                        return false;
                    }
                }
                let _value = this.state[key];
                if (value === '.' && key == "saleMemoValue") {
                    message('非數字鍵請重新輸入');
                    return;
                }
                if (value === "0000000") {
                    message("非正常單號，請重新輸入");
                    return;
                }
                if (isReset || !_value) {
                    this.setState({ [key]: value });
                } else {
                    if (this.state.replaceFlag !== true) {
                        this.setState({ [key]: value });
                    } else {
                        this.setState({ [key]: _value + value });
                    }
                }
                this.setState({ replaceFlag: true });
            },
            onBack: () => {
                let value = this.state[key] + '';
                this.setState({
                    [key]: value.substring(0, value.length - 1),
                    replaceFlag: true
                });
            },
            onClear: () => {
                console.log("onClear: ", this.state[key]);
                this.setState({
                    [key]: "",
                    replaceFlag: true
                });
            },
            onCancel: () => {
                this.setState({
                    replaceFlag: false,
                    [key]: !!this.props.data[key == "saleMemoValue" ? "salesMemo" : "djValue"] ? this.props.data[key == "saleMemoValue" ? "salesMemo" : "djValue"] : null
                });
                target.focus();
            },
            onOk: () => {
                target.focus();
                if (this.state.saleMemoValue == null || this.state.saleMemoValue == "") {
                    message(intl.get("PLACEHOLDER_ENTER") + "Sales Memo");
                    return false;
                }
                if (this.state.saleMemoValue == 0 || this.state.saleMemoValue.length != 7) {
                    message("非正常單號，請重新輸入");
                    return false;
                }
                this.setState({ replaceFlag: false });
                !this.props.data.isDj && this.handleSubmit();
            }
        })
    }

    handleBlur = (e) => {
        console.log('handleBlur sales Memo Value: ', e, e.target.value);
        this.setState({
            saleMemoValue: e.target.value
        });
    }

    handleOk = () => {
        if (this.props.callback) {
            this.props.callback(this.state.num);
        }
        this.props.close();
    }

    handleValueChange = (e, key) => {
        console.log(e.target.value);
        this.setState({
            [key]: e.target.value
        })
    }

    handleInputKeyDown = (e) => {
        if (e.keyCode === 13) {
            !this.props.data.isDj && this.handleSubmit();
            // this.handleSubmit();
        }
    }

    handleCancel = () => {
        if (this.props.data.isSd === true && this.props.data.goodlistLen < 1 && !!this.props.data.deliveryCancel) {
            this.props.data.deliveryCancel();
        }
        this.props.close();
    }

    handleSubmit = (e) => {
        if (!!e) {
            e.preventDefault();
        }
        if (this.state.saleMemoValue == null) {
            this.setState({
                saleMemoValue: ''
            })
            return message(intl.get("PLACEHOLDER_ENTER") + "Sales Memo");
        }
        if (this.state.saleMemoValue == 0 || this.state.saleMemoValue.length != 7) {
            this.setState({
                saleMemoValue: ''
            })
            return message("非正常單號，請重新輸入");
        }
        if (this.props.data.isDj) {
            if (!this.state.djValue && this.state.djValue != 0) {
                return message(intl.get("PLACEHOLDER_ENTER") + "按金銀碼");
            } else if (!/^\d+(\.\d+)?$/.test(this.state.djValue)) {
                return message("非正常按金銀碼，請重新輸入");
            }
        }
        if (!!this.props.callback) {
            this.props.callback(this.state.saleMemoValue, this.state.djValue);
            this.setState({
                saleMemoValue: '',
                djValue: ''
            })
        }
        NumberKeypad.close();
        this.props.close();
    }

    render() {
        const { data } = this.props
        return (
            <Modal
                className='saleMemo'
                visible={true}
                width={484}
                title='SalesMemo'
                okText={intl.get("INFO_CONFIRM")}
                footer={null}
                maskClosable={false}
                cancelText="取消"
            >
                <Row>
                    <Form className="form">
                        <Col span={24}>
                            <FormItem
                                label="SalesMemo"
                                labelCol={{ span: 6 }}
                                wrapperCol={{ span: 18 }}
                            >
                                <Input placeholder={intl.get("INFO_SALESMEMOLENTIP")} size="large"
                                    autoFocus={true}
                                    value={this.state.saleMemoValue}
                                    onInput={e => this.handleValueChange(e, "saleMemoValue")}
                                    onChange={() => { }}
                                    onKeyDown={this.handleInputKeyDown}
                                    onClick={(e) => this.handleFocus(e.target.getBoundingClientRect().top + e.target.clientHeight + 2, 87, e.target, "saleMemoValue")} />
                            </FormItem>
                            {data.isDj ? <FormItem
                                label="按金銀碼"
                                labelCol={{ span: 6 }}
                                wrapperCol={{ span: 18 }}
                            >
                                <Input placeholder={'按金銀碼'} size="large"
                                    // autoFocus={true}
                                    value={this.state.djValue}
                                    onInput={e => this.handleValueChange(e, "djValue")}
                                    onChange={() => { }}
                                    // onKeyDown={this.handleInputKeyDown}
                                    onClick={(e) => this.handleFocus(e.target.getBoundingClientRect().top + e.target.clientHeight + 2, 87, e.target, "djValue")} />
                            </FormItem> : null}
                            <div style={{ width: "100%", float: "right" }}>
                                <Button type="primary"
                                    onClick={this.handleSubmit}
                                    style={{ marginLeft: '10px', float: "right" }} disabled={!this.state.focused}>{intl.get("INFO_CONFIRM")}</Button>
                                <Button onClick={this.handleCancel} style={{ float: "right" }}>取消</Button>
                            </div>
                        </Col>
                    </Form>
                </Row>
            </Modal>
        )
    }
}

export default SaleMemoModal;
