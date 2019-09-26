import React, { Component } from 'react';
import moment from 'moment';
import intl from 'react-intl-universal';
import message from '@/common/components/message';
import withKeypad from '@/common/components/keypad/';
import { Table, Button, Icon, Row, Col, Form, Input, Tabs, Checkbox, Modal, Select } from 'antd';

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const Option = Select.Option;

//无状态组件
class FinalPayment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            goodInfo: {},
            key: 0,
            formitemArr: [
                //["mkt", "syjh", "fphm"],
                ["info", 'retCause'],
                ["info", "amount", "expressNumber", "mkt", 'retCause']
            ],
            clockTime: moment().format('YYYY-MM-DD HH:mm:ss')
        };
    }

    componentDidMount() {
        this.timer = setInterval(() => {
            this.setState({ clockTime: moment().format('YYYY-MM-DD HH:mm:ss') })
        }, 1000)
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    handleClear = (key) => {
        if (key) {
            Modal.confirm({
                className: 'vla-confirm',
                title: '是否切換尾款支付類型?',
                content: '切換將會清空現有數據！',
                okText: '確認',
                cancelText: '取消',
                onOk: () => {
                    let index = this.props.type === 'Y' ? 0 : 1
                    this.state.formitemArr[index].map(item => {
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


    render() {
        const { getFieldDecorator } = this.props.form;
        const { goodsList, pagination, onPageChange, fphm, operator, onCancel, sjtotal, submit, language, switchLanguage, switchEng, onSwitchEng, cause, confirmStatus, threason } = this.props;
        const columns = [{
            title: intl.get('GOODS_ITEM'),
            dataIndex: 'item',
            key: 'item',
            width: 210,
            render: (text, record, index) =>
                <Row style={{ height: 44 }}>
                    <Col span={18}>
                        <div style={{ lineHeight: '44px' }}>{record.fname}</div>
                    </Col>
                </Row>
        }, {
            title: intl.get('GOODS_NUM'),
            dataIndex: 'qty',
            key: 'qty',
            width: 75,
            align: 'center',
        }, {
            title: intl.get('GOODS_PRICE'),
            dataIndex: 'price',
            key: 'price',
            width: 135,
            align: 'center',
        }, {
            title: intl.get('GOODS_FAVORABLE'),
            dataIndex: 'dsctotal',
            key: 'dsctotal',
            width: 75,
            align: 'center',
        }, {
            title: intl.get('GOODS_TOTALPRICE'),
            dataIndex: 'ysje',
            key: 'ysje',
            width: 75,
            align: 'center',
        }];

        return (
            <div className="final_payment">
                <div className="presale_le">
                    <div className="presale_le_top">
                        <span> {intl.get('GOODS_NUMBER')}: {fphm}</span>
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
                        <div className="presale_le_button">
                            <Button
                                disabled={goodsList.length === 0 ? "disabled" : ""}
                                onClick={submit}>{this.props.cancelFlag? '提交': '付款'}</Button>
                            <Button
                                onClick={onCancel}>{intl.get('BACKTRACK')}</Button>
                        </div>
                        <div className="presale_le_money">
                            <span>{sjtotal || 0}</span>
                            <span>{this.props.cancelFlag ? '應退金額':'待支付金'}</span>
                        </div>
                    </div>
                </div>
                <div className="presale_ri">
                    <div
                        className="presale_operator">{intl.get('CASHIER')}：{operator.gh}<span
                            className="clock_time">{this.state.clockTime}</span>
                    </div>
                    {
                        this.props.cancelFlag 
                        ? 
                        <Form className="retform" onSubmit={this.handleSubmit}>
                        <FormItem>
                            <div className="inputItem">
                                <span>退貨原因:</span>
                                {getFieldDecorator('retCause', { rules: [{ required: true, message: '請選擇退貨原因!' }] })
                                    (
                                        <Select name="retCause" disabled={!!confirmStatus} size="large" defaultActiveFirstOption={false} placeholder="Select a cause">
                                            {threason.map((item, index) => {
                                                return <Option key={item.code}>{item.cnName}</Option>
                                            })}
                                        </Select>
                                    )}
                            </div>
                        </FormItem>
                        <FormItem>
                            <div className="inputItem">
                                <span>{'單據編號'}:</span>
                                {getFieldDecorator('info', {
                                    rules: [{
                                        required: true,
                                        message: '請輸入單據編號' + '!'
                                    }],
                                })(
                                    <Input name="info"
                                        onBlur={this.props.blur}
                                        onFocus={(event) => {
                                            this.props.focus(event, this.setValue, 'left');
                                        }}
                                        onKeyDown={(e) => {
                                            this.onInputKeyDown(e, this.props.keyPadClose);
                                        }}
                                        autoFocus={this.props.type === 'Y' ? true : false} />
                                )}
                            </div>
                        </FormItem>
                        <FormItem>
                            <Button htmlType="submit"
                                className="submitBtn">{intl.get('BTN_SELECT')}</Button>
                        </FormItem>
                    </Form>
                        :
                        <Tabs className="tabs" activeKey={this.props.type === 'Y' ? '0' : '1'} type="card" animated={true} tabBarStyle={{ overflow: "hidden", width: "256px", height: "44px", margin: "38px auto", border: "2px #363646 solid", borderRadius: "5px" }} onChange={this.handleClear} >
                        <TabPane tab="有小票" key="0" forceRender={true}>
                            <Form className="retform" onSubmit={this.handleSubmit}>
                                <FormItem>
                                    <div className="inputItem">
                                        <span>{'單據編號'}:</span>
                                        {getFieldDecorator('info', {
                                            rules: [{
                                                required: true,
                                                message: '請輸入單據編號' + '!'
                                            }],
                                        })(
                                            <Input name="info"
                                                onBlur={this.props.blur}
                                                onFocus={(event) => {
                                                    this.props.focus(event, this.setValue, 'left');
                                                }}
                                                onKeyDown={(e) => {
                                                    this.onInputKeyDown(e, this.props.keyPadClose);
                                                }}
                                                autoFocus={this.props.type === 'Y' ? true : false} />
                                        )}
                                    </div>
                                </FormItem>
                                {/*<FormItem>
                            <div className="inputItem">
                                <span>{intl.get('RETURNGOODS_CASHIERNUM')}:</span>
                                {getFieldDecorator('syjh', {
                                    rules: [{required: true, message: intl.get('PLACEHOLDER_OSYJH') + '!'}],
                                })(
                                    <Input name="syjh"
                                           onBlur={this.props.blur}
                                           onFocus={(event) => {
                                               this.props.focus(event, this.setValue, 'left');
                                           }}/>
                                )}
                            </div>
                        </FormItem>
                        <FormItem>
                            <div className="inputItem">
                                <span>{intl.get('RETURNGOODS_NUM')}:</span>
                                {getFieldDecorator('fphm', {
                                    rules: [{required: true, message: intl.get('PLACEHOLDER_OFPHM')+ '!'}],
                                })(
                                    <Input name="fphm"
                                           onBlur={this.props.blur}
                                           onFocus={(event) => {
                                               this.props.focus(event, this.setValue, 'left');
                                           }}/>
                                )}
                            </div>
                        </FormItem>*/}
                                <FormItem>
                                    <Button htmlType="submit"
                                        className="submitBtn">{intl.get('BTN_SELECT')}</Button>
                                </FormItem>
                            </Form>
                        </TabPane>
                        <TabPane tab="無小票" key="1" forceRender={true}>
                            <FormItem>
                                <div className="inputItem">
                                    <span>{'原單店鋪'}:</span>
                                    {getFieldDecorator('mkt', {
                                        rules: [{
                                            required: this.props.type === 'N' ? true : false,
                                            message: '請輸入門店號' + '!',
                                            pattern: /^\d{3}$/, max: 3, min: 3, message: '請輸入三位數字原單店鋪'
                                        }],
                                    })(
                                        <Input name="mkt"
                                            onBlur={this.props.blur}
                                            onFocus={(event) => {
                                                this.props.focus(event, value => {
                                                    if (value.mkt.length > 3) return;
                                                    this.setValue(value);
                                                }, 'left');
                                            }}
                                            onKeyDown={(e) => {
                                                this.onInputKeyDown(e, this.props.keyPadClose);
                                            }}
                                            autoFocus={false} />
                                    )}
                                </div>
                            </FormItem>
                            <FormItem>
                                <div className="inputItem">
                                    <span>{'單據編號'}:</span>
                                    {getFieldDecorator('info', {
                                        rules: [{
                                            required: true,
                                            message: '請輸入單據編號' + '!'
                                        }],
                                    })(
                                        <Input name="info"
                                            onBlur={this.props.blur}
                                            onFocus={(event) => {
                                                this.props.focus(event, this.setValue, 'left');
                                            }}
                                            onKeyDown={(e) => {
                                                this.onInputKeyDown(e, this.props.keyPadClose);
                                            }}
                                            autoFocus={false} />
                                    )}
                                </div>
                            </FormItem>
                            <FormItem>
                                <div className="inputItem">
                                    <span>{'SALES MEMO'}:</span>
                                    {getFieldDecorator('expressNumber', {
                                        rules: [{
                                            required: this.props.type === 'N' ? true : false,
                                            message: '請輸入SALES MEMO' + '!',
                                            pattern: /^\d{7}$/, max: 7, min: 7, message: '請輸入七位數字SALES MEMO'
                                        }],
                                    })(
                                        <Input name="expressNumber"
                                            onBlur={this.props.blur}
                                            onFocus={(event) => {
                                                this.props.focus(event, this.setValue, 'left');
                                            }}
                                            onKeyDown={(e) => {
                                                this.onInputKeyDown(e, this.props.keyPadClose);
                                            }}
                                            autoFocus={false} />
                                    )}
                                </div>
                            </FormItem>
                            <FormItem>
                                <div className="inputItem">
                                    <span>{'尾款金額'}:</span>
                                    {getFieldDecorator('amount', {
                                        rules: [{
                                            required: this.props.type === 'N' ? true : false,
                                            message: '請輸入尾款金額' + '!',
                                            pattern: /^(([1-9]{1}\d*)|(0{1}))(\.\d{0,1})?$/, message: '只允許輸入壹位小數'
                                        }],
                                    })(
                                        <Input name="amount"
                                            onBlur={this.props.blur}
                                            onFocus={(event) => {
                                                this.props.focus(event, this.setValue, 'left');
                                            }}
                                            onKeyDown={(e) => {
                                                this.onInputKeyDown(e, this.props.keyPadClose);
                                            }}
                                            autoFocus={false} />
                                    )}
                                </div>
                            </FormItem>
                            <FormItem>
                                <Button onClick={this.handleSubmit}
                                    className="submitBtn">確定</Button>
                            </FormItem>
                        </TabPane>
                    </Tabs>
                    }                  
                </div>
            </div>
        );
    }

    //antd的table组件的index是当前页的，需要转换成dataSource的index
    calculateDataIndex = (index) => {
        const { pageSize, current } = this.props.pagination;
        return pageSize * (current - 1) + index
    }

    setValue = (value) => {
        this.props.form.setFieldsValue(value);
    }

    onInputKeyDown = (e, closeKeyboard) => {
        if (e.keyCode === 13 && this.props.type === 'Y') {
            closeKeyboard();
            this.handleSubmit(e);
        } else {
            closeKeyboard();
        }
    }

    handleSubmit = (event) => {
        event.preventDefault();
        let index = this.props.type === 'Y' ? 0 : 1
        this.props.form.validateFields(this.state.formitemArr[index], (err) => {
            if (!err) {
                if (this.props.type === 'N') {
                    let { expressNumber, amount, mkt, info } = this.props.form.getFieldsValue();
                    if (mkt.length != 3) {
                        return message("請重新輸入3位原單店鋪號!");
                    }
                    if (expressNumber == 0) {
                        return message("非正常Sales Memo，請重新輸入!");
                    }
                    if (!/^(\d{7}|\d{19})$/.test(info)) {
                        return message("請輸入7位 / 19位的單據編號!");
                    }
                    this.props.select({ mkt, fphm: info, expressNumber, amount});
                } else {
                    let { info, retCause } = this.props.form.getFieldsValue();
                    let mkt = info.slice(0, 3);
                    let syjh = info.slice(3, 6);
                    let fphm = info.slice(6);
                    if (!(mkt && syjh && fphm)) {
                        message("訂單不存在！");
                        return;
                    }
                    this.props.select({ mkt, syjh, fphm, retCause });
                }
            }
        });
    }

    // handleClear = (key) => {
    //     this.state.formitemArr[this.state.key].map(item => {
    //         this.setValue({[item]: ''});
    //     });
    //     this.setState({key: parseInt(key, 10)});
    // }

}

FinalPayment = Form.create()(FinalPayment);
export default withKeypad(FinalPayment);