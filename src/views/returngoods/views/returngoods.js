import React, { Component } from 'react';
import { Table, Button, Icon, Row, Col, Form, Input, Tabs, Modal, Checkbox, Select, Radio, Switch } from 'antd';
import withKeypad from '@/common/components/keypad/';
import moment from 'moment';
import RechargeKeypad from '@/common/components/rechargeKeypad/index.js';
import intl from 'react-intl-universal';
import message from '@/common/components/message';

const Option = Select.Option;
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;

//無狀態組件
class ReturnGoods extends Component {
    constructor(props) {
        super(props);
        this.state = {
            goodInfo: {},
            price: false,
            itemCode: false,
            index: 0,
            formitemArr: [
                // ["ymdNo", "ysyjNo", "yxpNo", "retCause"],
                // ["ymdNo", "retCause"],
                ["oldShopCode", "oldTerminalNo", "oldTerminalSno", "retCause"],
                ["spNo", "retCauseT", "salememo"]
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

    handleMenuRender = (type, key) => {
        let renderDom = null
        switch (type.code) {
            case '218':
            //行送
            renderDom =
            <Col className = 'operateCol' key = {key} span = {6} onClick={() => this.props.sdDelivery('isSd')}>
                <Icon type="shop" />
                <p>{type.name}</p>
            </Col>
            break;
            case '219':
            //DC送货
            renderDom =
            <Col className = 'operateCol' key = {key} span = {6} onClick={() => this.props.dcDelivery()}>
                <Icon type="inbox" />
                <p>{type.name}</p>
            </Col>
            break;
            case '230':
            //定金230
            renderDom =
            <Col className = 'operateCol'  key = {key} span = {6} onClick={() => this.props.sdDelivery('isDj')}>
                <Icon type="layout" />
                <p>{type.name}</p>
            </Col>
            break;
            case '208':
            //员工购物
            renderDom =
            <Col className = 'operateCol'  key = {key} span = {6} onClick={() => {this.props.staff ? this.props.exitStaff() :this.props.staffshopping()}}>
                <Icon type="user" />
                <p>{this.props.staff ? '取消员工购物' : '员工购物'}</p>
            </Col>
            break;
        }
        return renderDom;
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        const {onDeliveryCancel, isDc, isDj, isSd ,DC, staffCard, staff, smValue, radio, radioChange, threason, goodsList, switchEng, onSwitchEng, totalData, changeCount, pagination, onPageChange, fphm, operator, confirm, all, allHandle, onBack, pickArr, readOnly, status, confirmStatus, pickflag, pick, vip, orderType, depositRefund, cause, ymdNo, ysyjNo, yxpNo, 
            oldShopCode, oldTerminalNo, oldTerminalSno } = this.props;
        const columns = [{
            title: <div className='tabletitle'>{(readOnly || status) ? null : < Checkbox disabled={!goodsList.length || depositRefund} checked={all || depositRefund} onChange={event => {
                allHandle();
            }}></Checkbox >}<span>商品信息</span></div>,
            dataIndex: 'item',
            key: 'item',
            width: 210,
            render: (text, record, index) =>
                <Row style={{ height: 44 }}>
                    <Col span={4} style={{ height: 44, lineHeight: '44px' }}>
                        {readOnly ? null : <Checkbox disabled={!!((!record.allowReturnCopies && !status) || depositRefund || (status && goodsList.length == 1))} checked={pickArr[this.calculateDataIndex(index)]} onChange={(event) => {
                            pick(this.calculateDataIndex(index));
                        }}></Checkbox>}
                    </Col>
                    <Col span={16}>
                        <div style={{ lineHeight: '22px' }}>{record.goodsCode}</div>
                        <div className="info_name" style={{ lineHeight: '22px' }}>{switchEng ? record.engname : record.goodsName} {record.originQty && `*${record.originQty}`}</div>
                    </Col>
                    <Col span={4} style={{ height: 44, lineHeight: '44px' }}>
                        {status ? <Icon type="edit" onClick={() => this.editGood(this.calculateDataIndex(index))} /> : null}
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
                    <Icon style={{ visibility: !this.props.pickArr[index] || readOnly ? "hidden" : "visible" }} type="minus" onClick={() => changeCount(this.props.status, text, index, -1)} />
                    <span onClick={() => {
                        if (!readOnly) this.onNumClick(record.allowReturnCopies, this.calculateDataIndex(index));
                    }}>{text}</span>
                    <Icon style={{ visibility: !this.props.pickArr[index] || readOnly ? "hidden" : "visible" }} type="plus" onClick={() => changeCount(this.props.status, text, index, 1)} />
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
            <div className="return_goods">
                <div className="presale_le">
                    <div className="presale_le_top">
                        {isDj && <span className="presale_le_deliveryFlag" onClick={() => onDeliveryCancel("isDj")}><Icon type="poweroff" style={{marginRight:'5px'}} />
                            {'定金'}&nbsp;
                        </span>}
                        {isDc && (<span className="presale_le_deliveryFlag" onClick={() => onDeliveryCancel("isDc")}><Icon type="poweroff" style={{marginRight:'5px'}} />{'DC送货'}&nbsp;</span>)}
                        {isSd && (<span className="presale_le_deliveryFlag" onClick={() => onDeliveryCancel("isSd")}><Icon type="poweroff" style={{marginRight:'5px'}} />{'行送'}&nbsp;</span>)}
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
                            {staff ? <div><span>员工卡号码：{staff.staffCardNo}</span><span>员工卡类型：{staff.staffType == 1 ? "员工卡" : "亲属卡"}</span></div>
                                : <div><span>会员号码：{vip.consumersCard}</span>
                                    <span>会员积分：{(vip.bonusPointLastMonth - vip.bonusPointUsed) || null}</span>
                                    <span>会员等级：{vip.consumersLevel}</span></div>}
                        </div>
                        <div className="presale_le_button">
                            {confirmStatus === 0 ? <Button type="primary" disabled={!pickflag} onClick={confirm}>提交</Button> : <Button type="primary" disabled={!pickflag} onClick={this.submit}>退款</Button>}
                            {confirmStatus === 1 && goodsList.length > 0 ? <Button onClick={this.onCancel}>取消</Button> : <Button onClick={onBack}>返回</Button>}
                        </div>
                        <div className="presale_le_money">
                            <span>{totalData}</span>
                            <span>应退金额</span>
                        </div>
                    </div>
                </div>
                <div className="presale_ri">
                    <div className="presale_operator">收银员：{operator}<span className="clock_time">{this.state.clockTime}</span></div>
                    <Tabs className="tabs" activeKey={status.toString()} type="card" animated={true} tabBarStyle={{ width: "256px", margin: "38px auto" }} onChange={this.handleClear}>
                        <TabPane tab="有小票" key="0" forceRender={true}>
                            <Form className="retform" onSubmit={this.handleSubmit}>
                                <FormItem>
                                    <div className="inputItem">
                                        <span>退货原因:</span>
                                        {getFieldDecorator('retCause', cause && !status ? { initialValue: cause, rules: [{ required: true, message: '请选择退货原因!' }] } : { rules: [{ required: true, message: '请选择退货原因!' }] })
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
                                        <span>退貨編號:</span>
                                        {getFieldDecorator('ymdNo', {
                                            initialValue: ymdNo,
                                            rules: [{ required: true, message: '請輸入退貨編號!' }]
                                        })(
                                            <Input name="ymdNo"
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
                                {/* <FormItem>
                                    <div className="inputItem">
                                        <span>原收銀機號:</span>
                                        {getFieldDecorator('ysyjNo', {
                                            initialValue: ysyjNo,
                                            rules: [{ required: true, message: '請輸入原收銀機號!' }]
                                        })(
                                            <Input name="ysyjNo"
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
                                        <span>原小票號:</span>
                                        {getFieldDecorator('yxpNo', {
                                            initialValue: yxpNo,
                                            rules: [{ required: true, message: '請輸入原小票號!' }]
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
                                    <Button disabled={!!confirmStatus} htmlType="submit" className="submitBtn">查询</Button>
                                </FormItem>
                            </Form>
                        </TabPane>
                        <TabPane tab="无小票" key="1" forceRender={true}>
                            <FormItem>
                                <div className="inputItem">
                                    <span>退货原因:</span>
                                    {getFieldDecorator('retCauseT', cause && status ? { initialValue: cause, rules: [{ required: true, message: '请选择退货原因!' }] } : { rules: [{ required: true, message: '请选择退货原因!' }] })
                                        (
                                            <Select disabled={confirmStatus === 1 && goodsList.length > 0} name="retCauseT" defaultActiveFirstOption={false} placeholder="Select a cause">
                                                {threason.map((item, index) => {
                                                    return <Option key={item.code}>{item.cnName}</Option>
                                                })}
                                            </Select>
                                        )}
                                </div>
                            </FormItem>
                            <FormItem>
                                <div className="inputItem">
                                    <span>商品条码:</span>
                                    {getFieldDecorator('spNo', {
                                        rules: [{ required: true, message: '请输入商品条码!' }],
                                    })(
                                        <Input name="spNo"
                                            addonAfter={<Icon onClick={() => this.scan({ keyCode: 13 })} type="enter" />}
                                            ref={el => this.indexInput = el}
                                            onKeyDown={this.scan}
                                            onBlur={this.props.blur}
                                            onFocus={(event) => {
                                                this.props.focus(event, this.setValue);
                                            }} />
                                    )}
                                </div>
                            </FormItem>
                            <Row style = {{ marginTop: '100px'}}>
                                {this.props.operateList.map((val, idx) =>  this.handleMenuRender(val, idx))}
                            </Row>
                            {/* {DC ? <FormItem>
                                <div className="inputItem">
                                    <span>salesmemo:</span>
                                    {getFieldDecorator('salememo', {
                                        initialValue: smValue,
                                        rules: [{ required: false, len: 7, message: '請輸入7位salesmemo!' }]
                                    })(
                                        <Input name="salememo"
                                            // addonAfter={<Icon onClick={() => this.scan({ keyCode: 13 })} type="enter" />}
                                            onKeyDown={this.scan}
                                            onBlur={this.props.blur}
                                            onFocus={(event) => {
                                                this.props.focus(event, (value) => {
                                                    if (value.salememo.length > 7) return;
                                                    this.setValue(value);
                                                }, 'left');
                                            }} />
                                    )}
                                </div>
                                {
                                    this.props.form.getFieldsValue().salememo && this.props.form.getFieldsValue().salememo.length ? <div style={{ marginTop: 20, marginLeft: 42 }}>
                                        <Radio.Group value={radio} onChange={radioChange} buttonStyle="solid">
                                            <Radio.Button value={3}>行送</Radio.Button>
                                            <Radio.Button value={5}>DC送</Radio.Button>
                                            <Radio.Button value={99}>按金</Radio.Button>
                                        </Radio.Group>
                                    </div> : null
                                }
                            </FormItem> : null} */}
                            {/* <FormItem>
                                <div className="inputItem">
                                    <span>員工購物:</span>
                                    {getFieldDecorator('staff', {
                                       
                                    })( 
                                        <div>
                                        <Switch checkedChildren="开" unCheckedChildren="关" onChange = {this.changeStaff} />
                                        </div>
                                    )}
                                </div>
                            </FormItem> */}
                        </TabPane>
                    </Tabs>
                </div>
                <Modal
                    wrapClassName='vla-modal'
                    width={380}
                    title="修改单价"
                    visible={this.state.price}
                    footer={
                        <div>
                            <Button type="primary" onClick={this.updatePrice}>确定</Button>
                            <Button type="primary" onClick={() => this.closeModal("price")}>取消</Button>
                        </div>
                    }>
                    <FormItem>
                        {getFieldDecorator("price", {
                            rules: [{ required: true, message: '请输入单价!' }],
                        })(
                            <Input
                                placeholder="单价"
                                name="price"
                                onBlur={this.props.blur}
                                onFocus={(event) => {
                                    this.props.focus(event, this.setValue, 'left');
                                }} />
                        )}
                    </FormItem>
                </Modal>
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
            </div >
        );
    }

    onSalememo = () => {
        if (this.props.salememo) {
            this.props.form.setFieldsValue({ salememo: "" });
        }
        this.props.onSalememo();
    };

    onNumClick = (item, index) => {
        if (this.props.depositRefund || !this.props.pickArr[index]) return;
        RechargeKeypad.open({
            title: intl.get("INFO_CHANGEQTY"), //"修改商品數量",
            placeholder: intl.get("PLACEHOLDER_NUM"),    //"請輸入商品數量",
            errMessage: "请输入正确的整数",    //"請輸入1~99999之間的整數"
            rule: (num) => {
                /*if (/^((0\.\d{1,2})||([1-9]\d{0,2}(\.\d{1,2})?))$/.test(num)) {
                    return true;
                }*/
                if (this.props.status) {
                    if (/^([1-9]\d{0,4})$/.test(num)) {
                        return true;
                    }
                    return false;
                } else {
                    item = parseInt(item, 10);
                    if (num >= 1 && num <= item) {
                        return true;
                    }
                    return false;
                }
            },
            // keyboard: [     //可選的鍵盤
            //     { name: "10", value: "10" },
            //     { name: "15", value: "15" },
            //     { name: "20", value: "20" },
            //     { name: "50", value: "50" },
            // ],
            callback: (value) => this.props.editCount(this.props.status, value, index)
        })
    }

    changeStaff = (checked) => {
        if(checked) {
            this.props.staffshopping();
        }else{
            this.props.exitStaff();
        }
    }

    editGood = (index) => {
        this.setState({ price: true, index });
    }

    updatePrice = () => {
        this.props.form.validateFields(["price"], (err) => {
            if (!err) {
                let { price } = this.props.form.getFieldsValue();
                this.props.updatePrice(this.state.index, price, (clear) => {
                    if (clear) {
                        this.props.form.setFieldsValue({ price: "" });
                    } else {
                        this.closeModal("price");
                    }
                });
            }
        });
    }

    itemCode = () => {
        this.props.form.validateFields(["itemCode"], (err) => {
            if (!err) {
                let { itemCode } = this.props.form.getFieldsValue();
                this.props.itemCode(itemCode, () => {
                    this.closeModal("itemCode");
                    let { salememo } = this.props.form.getFieldsValue();
                    if (salememo) {
                        this.props.form.validateFields(["salememo"], (err) => {
                            if (!err) {
                                // let { ymdNo, ysyjNo, yxpNo, retCause } = this.props.form.getFieldsValue();
                                // this.props.select({ ymkt: ymdNo, ysyjh: ysyjNo, yfphm: yxpNo, retCause });
                                this.props.submit(salememo);
                            }
                        });
                    } else {
                        this.props.submit();
                    }
                });
            }
        });
    }

    closeModal = (key) => {
        this.props.form.setFieldsValue({ [key]: "" });
        this.setState({ [key]: false });
    }

    submit = () => {
        for (let item of this.props.goodsList) {
            if (item.controlFlag) {
                this.setState({ itemCode: true });
                return;
            }
        }
        let { salememo } = this.props.form.getFieldsValue();
        if (salememo) {
            this.props.form.validateFields(["salememo"], (err) => {
                if (!err) {
                    // let { ymdNo, ysyjNo, yxpNo, retCause } = this.props.form.getFieldsValue();
                    // this.props.select({ ymkt: ymdNo, ysyjh: ysyjNo, yfphm: yxpNo, retCause });
                    if (salememo == 0) { 
                        return message("非正常Sales Memo，请重新输入!");
                    }
                    this.props.submit(salememo);
                }
            });
        } else {
            this.props.submit();
        }
    }


    //antd的table組件的index是當前頁的，需要轉換成dataSource的index
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
        this.props.form.validateFields(this.state.formitemArr[this.props.status], (err) => {
            if (!err) {
                // let { ymdNo, ysyjNo, yxpNo, retCause } = this.props.form.getFieldsValue();
                // this.props.select({ ymkt: ymdNo, ysyjh: ysyjNo, yfphm: yxpNo, retCause });
                let { oldShopCode, oldTerminalNo, oldTerminalSno, retCause } = this.props.form.getFieldsValue();
                this.props.select({ retNO: oldShopCode + oldTerminalNo + oldTerminalSno, retCause, oldShopCode, oldTerminalNo, oldTerminalSno });
            }
        });
    }

    focus = () => {
        this.indexInput.focus();
    }

    handleClear = (key) => {
        if (key) {
            Modal.confirm({
                className: 'vla-confirm',
                title: '是否切换退货类型?',
                content: '切换将会清空现有数据！',
                okText: '确认',
                cancelText: '取消',
                onOk: () => {
                    this.state.formitemArr[this.props.status].map(item => {
                        this.setValue({ [item]: null });
                    });
                    // this.setState({ key: parseInt(key, 10) });
                    this.props.tabs(parseInt(key, 10));
                }
            });
        } else {
            this.state.formitemArr[this.props.status].map(item => {
                this.setValue({ [item]: null });
            });
        }
    }

    scan = (event) => {
        if (event.keyCode === 13) {
            this.props.form.validateFields(this.state.formitemArr[this.props.status], (err) => {
                if (!err) {
                    let { spNo, retCauseT } = this.props.form.getFieldsValue();
                    this.setValue({ spNo: '' });
                    this.props.scan({ spNo, retCause: retCauseT }, this.focus);
                }
            });
        }
    }

    onCancel = () => {
        if (this.props.status) this.handleClear();
        this.props.onCancel(this.props.status);
    }
}

ReturnGoods = Form.create()(ReturnGoods);

export default withKeypad(ReturnGoods);
