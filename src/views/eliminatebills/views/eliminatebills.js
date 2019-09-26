import React, { Component } from 'react';
import { Table, Button, Icon, Row, Col, Form, Input, Modal, Select } from 'antd';
import withKeypad from '@/common/components/keypad/';
import moment from 'moment';
import message from '@/common/components/message';

const Option = Select.Option;
const FormItem = Form.Item;

//无状态组件
class EliminateBills extends Component {
    constructor(props) {
        super(props);
        this.state = {
            goodInfo: {},
            itemCode: false,
            index: 0,
            formitemArr: [
                // ["ymdNo", "ysyjNo", "yxpNo", "retCause"]
                // ["yxpNo", "retCause"]                
                ["oldShopCode", "oldTerminalNo", "oldTerminalSno", "retCause"],
            ],
            clockTime: moment().format('YYYY-MM-DD HH:mm')
        };
    }

    componentDidMount() {
        this.timer = setInterval(() => {
            this.setState({ clockTime: moment().format('YYYY-MM-DD HH:mm') })
        }, 60000)
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        const { staff, threason, goodsList, switchEng, onSwitchEng, totalData, pagination, onPageChange, onBack, fphm, operator, submit, confirmStatus, vip, cause, yxpNo,
            oldShopCode, oldTerminalNo, oldTerminalSno } = this.props;
        const columns = [{
            title: '商品信息',
            dataIndex: 'item',
            key: 'item',
            width: 210,
            render: (text, record, index) =>
                <Row style={{ height: 44 }}>
                    <Col span={24}>
                        <div style={{ lineHeight: '22px' }}>{record.goodsCode}</div>
                        <div className="info_name" style={{ lineHeight: '22px' }}>{switchEng ? record.engname : record.goodsName}</div>
                    </Col>
                </Row >
        }, {
            title: '数量',
            dataIndex: 'qty',
            key: 'qty',
            width: 135,
            align: 'center',
            render: (text, record, index) =>
                <div className="number_count">
                    <Icon style={{ visibility: "hidden" }} type="minus" />
                    <span>{text}</span>
                    <Icon style={{ visibility: "hidden" }} type="plus" />
                </div>
        }, {
            title: '单价',
            dataIndex: 'salePrice',
            key: 'salePrice',
            width: 75,
            align: 'center',
        }, {
            title: '优惠',
            dataIndex: 'payDiscountValue',
            key: 'payDiscountValue',
            width: 75,
            align: 'center',
        }, {
            title: '总价',
            dataIndex: 'saleAmount',
            key: 'saleAmount',
            width: 75,
            align: 'center',
        }];

        return (
            <div className="eliminatebills">
                <div className="presale_le">
                    <div className="presale_le_top">
                        <span>单据编号: {fphm}</span>
                        <div className="presale_le_language"
                            onClick={onSwitchEng}>
                            <Col span={18}>{switchEng ? '中文' : 'English'}</Col>
                            <Col span={6}>
                                <span></span>
                                <span>{switchEng ? '中' : 'En'}</span>
                            </Col>
                        </div>
                    </div>
                    <div className="presale_le_table">
                        <Table
                            rowKey="guid"
                            size="small"
                            pagination={goodsList.length > pagination.pageSize ? pagination : false}
                            columns={columns}
                            dataSource={goodsList}
                            onChange={onPageChange} />
                    </div>
                    <div className="presale_le_foot">
                        <div className="presale_le_total">
                            {staff ? <div><span>员工卡号码：{staff.staffCardNo}</span><span>员工卡类型：{staff.staffType == 1 ? "員工卡" : "親屬卡"}</span></div>
                                : <div><span>会员号码：{vip.consumersCard}</span>
                                    <span>会员积分：{(vip.bonusPointLastMonth - vip.bonusPointUsed) || null}</span>
                                    <span>会员等级：{vip.consumersLevel}</span></div>}
                        </div>
                        <div className="presale_le_button">
                            <Button  type="primary" disabled={!goodsList.length} onClick={this.submit}>消单</Button>
                            {goodsList.length > 0 ? <Button onClick={this.onCancel}>取消</Button> : <Button onClick={onBack}>返回</Button>}
                        </div>
                        <div className="presale_le_money">
                            <span>{totalData}</span>
                            <span>应退金额</span>
                        </div>
                    </div>
                </div>
                <div className="presale_ri">
                    <div className="presale_operator">收银员：{operator}<span className="clock_time">{this.state.clockTime}</span></div>
                    <Form className="retform" onSubmit={this.handleSubmit}>
                        <FormItem>
                            <div className="inputItem">
                                <span>消单原因:</span>
                                {getFieldDecorator('retCause', cause ? { initialValue: cause, rules: [{ required: true, message: '請選擇消單原因!' }] } : { rules: [{ required: true, message: '請選擇消單原因!' }] })
                                    (
                                    <Select name="retCause" disabled={!!confirmStatus} defaultActiveFirstOption={false} placeholder="Select a cause">
                                        {threason.map((item, index) => {
                                            return <Option key={item.code}>{item.cnName}</Option>
                                        })}
                                    </Select>
                                    )}
                            </div>
                        </FormItem>
                        {/* <FormItem>
                            <div className="inputItem">
                                <span>原门店号:</span>
                                {getFieldDecorator('ymdNo', {
                                    initialValue: ymdNo,
                                    rules: [{ required: true, message: '请输入原门店号!' }]
                                })(
                                    <Input name="ymdNo"
                                        disabled={!!confirmStatus}
                                        onBlur={this.props.blur}
                                        onFocus={(event) => {
                                            this.props.focus(event, this.setValue, 'left');
                                        }} />
                                )}
                            </div>
                        </FormItem>
                        <FormItem>
                            <div className="inputItem">
                                <span>原收银机号:</span>
                                {getFieldDecorator('ysyjNo', {
                                    initialValue: ysyjNo,
                                    rules: [{ required: true, message: '请输入原收银机号!' }]
                                })(
                                    <Input name="ysyjNo"
                                        disabled={!!confirmStatus}
                                        onBlur={this.props.blur}
                                        onFocus={(event) => {
                                            this.props.focus(event, this.setValue, 'left');
                                        }} />
                                )}
                            </div>
                        </FormItem> */}
                        {/* <FormItem>
                            <div className="inputItem">
                                <span>消单编号:</span>
                                {getFieldDecorator('yxpNo', {
                                    initialValue: yxpNo,
                                    rules: [{ required: true, message: '请输入消单编号!' }]
                                })(
                                    <Input name="yxpNo"
                                        disabled={!!confirmStatus}
                                        onBlur={this.props.blur}
                                        onFocus={(event) => {
                                            this.props.focus(event, this.setValue, 'left');
                                        }} />
                                )}
                            </div>
                        </FormItem> */}
                                <FormItem>
                                    <div className="inputItem">
                                        <span>原门店号:</span>
                                        {getFieldDecorator('oldShopCode', {
                                            initialValue: oldShopCode,
                                            rules: [{ required: true, message: '请输入原门店号!' }]
                                        })(
                                            <Input name="oldShopCode"
                                                disabled={!!confirmStatus}
                                                onBlur={this.props.blur}
                                                onFocus={(event) => {
                                                    this.props.focus(event, this.setValue, 'left');
                                                }} />
                                        )}
                                    </div>
                                </FormItem>
                                <FormItem>
                                    <div className="inputItem">
                                        <span>原收银机号:</span>
                                        {getFieldDecorator('oldTerminalNo', {
                                            initialValue: oldTerminalNo,
                                            rules: [{ required: true, message: '请输入原收银机号!' }]
                                        })(
                                            <Input name="oldTerminalNo"
                                                disabled={!!confirmStatus}
                                                onBlur={this.props.blur}
                                                onFocus={(event) => {
                                                    this.props.focus(event, this.setValue, 'left');
                                                }} />
                                        )}
                                    </div>
                                </FormItem>
                                <FormItem>
                                    <div className="inputItem">
                                        <span>原小票号:</span>
                                        {getFieldDecorator('oldTerminalSno', {
                                            initialValue: oldTerminalSno,
                                            rules: [{ required: true, message: '请输入原小票号!' }]
                                        })(
                                            <Input name="oldTerminalSno"
                                                disabled={!!confirmStatus}
                                                onBlur={this.props.blur}
                                                onFocus={(event) => {
                                                    this.props.focus(event, this.setValue, 'bottomLeft');
                                                }} />
                                        )}
                                    </div>
                                </FormItem>
                        <FormItem>
                            <Button htmlType="submit" disabled={!!confirmStatus} className="submitBtn">查询</Button>
                        </FormItem>
                    </Form>
                </div>
                <Modal
                    wrapClassName='vla-modal'
                    width={380}
                    title="记录编号"
                    visible={this.state.itemCode}
                    footer={
                        <div>
                            <Button type="primary" onClick={this.itemCode}>确定</Button>
                            <Button type="primary" onClick={() => this.closeModal("itemCode")}>取消</Button>
                        </div>
                    }>
                    <FormItem>
                        {getFieldDecorator("itemCode", {
                            rules: [{ required: true, message: '请输入编号!' }],
                        })(
                            <Input
                                placeholder="编号"
                                name="itemCode"
                                onBlur={this.props.blur}
                                onFocus={(event) => {
                                    this.props.focus(event, this.setValue, 'left');
                                }} />
                        )}
                    </FormItem>
                </Modal>
            </div>
        );
    }

    itemCode = () => {
        this.props.form.validateFields(["itemCode"], (err) => {
            if (!err) {
                let { itemCode } = this.props.form.getFieldsValue();
                this.props.itemCode(itemCode, () => {
                    this.closeModal("itemCode");
                    this.props.submit();
                });
            }
        });
    }

    closeModal = (key) => {
        this.props.form.setFieldsValue({ [key]: "" });
        this.setState({ [key]: false });
    }

    submit = () => {
        let flag = true;
        for (let item of this.props.goodsList) {
            if (item.controlFlag) {
                this.setState({ itemCode: true });
                flag = false;
                break;
            }
        }
        this.props.payments.map((item) => {
            if (this.props.syspara.notxdPaycode.indexOf(item.paycode) !== -1) {
                message("该单存在不允许消单的支付方式");
                flag = false;
            }
        })
        flag && this.props.submit();
    }

    //antd的table组件的index是当前页的，需要转换成dataSource的index
    calculateDataIndex = (index) => {
        const { pageSize, current } = this.props.pagination;
        return pageSize * (current - 1) + index
    }

    setValue = (value) => {
        this.props.form.setFieldsValue(value);
    }

    handleSubmit = (event) => {
        event.preventDefault();
        this.props.keyPadClose();
        this.props.form.validateFields(this.state.formitemArr[0], (err) => {
            if (!err) {
                let { oldShopCode, oldTerminalNo, oldTerminalSno, retCause } = this.props.form.getFieldsValue();
                this.props.select({ yfphm: oldShopCode + oldTerminalNo + oldTerminalSno, retCause, oldShopCode, oldTerminalNo, oldTerminalSno });
            }
        });
    }

    onCancel = () => {
        this.state.formitemArr[0].map(item => {
            this.setValue({ [item]: null });
        });
        this.props.onCancel();
    }

}

EliminateBills = Form.create()(EliminateBills);

export default withKeypad(EliminateBills);