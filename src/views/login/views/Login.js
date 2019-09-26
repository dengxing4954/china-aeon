import React, { Component } from 'react';
import { Row, Col, Layout, Form, Icon, Input, Select, Button, Tabs, Modal, DatePicker } from 'antd';
import message from '@/common/components/message';
import EventEmitter from '@/eventemitter/';
import withKeypad from '@/common/components/keypad/';
import moment from 'moment';
import withKeyBoard from '@/common/components/keyBoard';

const TabPane = Tabs.TabPane;
const { Header, Content } = Layout;
const FormItem = Form.Item;
const Option = Select.Option;
const logo = require('@/common/image/logo.png');
// const logo = require('@/common/imageZB/logo.png');

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            key: 0,
            oldkey: 0,
            formitemArr: [
                ["cardNo"],
                ["userName", "passWord"]
            ],
            visible: false,
            mode: 'date',
            fphm: "",
            moment: moment()
        };
        this.workRound = React.createRef();
        this.cardNo = React.createRef();
        this.userName = React.createRef();
        this.passWord = React.createRef();
    }

    componentWillReceiveProps(nextprops) {
        if (nextprops.netType != this.props.netType && nextprops.netType) this.timeChange(true);
    }

    componentDidMount() {
        this.setState({ fphm: this.props.fphm });
        EventEmitter.on('Com', this.com);
        this.props.bind({
            "37": () => {
                if (!this.state.key) return;
                this.handleClear(0);
                this.TabClick(0);
            },
            "38": () => {
                if (this.state.key) {
                    this.userName.current.focus();
                } else {
                    this.cardNo.current.focus();
                }
            },
            "39": () => {
                if (this.state.key) return;
                this.handleClear(1);
                this.TabClick(1);
            },
            "40": () => {
                if (this.state.key) {
                    this.passWord.current.focus();
                } else {
                    // this.workRound.current.focus();
                }
            },
            "36": () => {
                this.handleSubmit();
            },
            "35": () => {
                this.props.shutdown();
            }
        });
    }

    componentWillUnmount() {
        EventEmitter.off('Com', this.com);
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        const { workRound, defaultWorkRound, version, serviceVersion, intlLocales, shutdown } = this.props;
        return (
            <div>
                <Icon type="poweroff" className="poweroff" onClick={shutdown} />
                <Layout className="layout">
                    <Header className="header">
                        <div className="logo">
                            <img src={logo} alt="" />
                        </div>
                    </Header>
                    <Content className="con">
                        <Row type="flex" justify="center" align="top" className="conbox">
                            <Col span={20} className="content">
                                <Form>
                                    <Tabs defaultActiveKey="0" activeKey={this.state.key.toString()} type="card" onTabClick={this.TabClick} onChange={this.handleClear}>
                                        <TabPane tab={intlLocales("LOGIN_BYCARD")} key="0" forceRender={true}>
                                            <FormItem>
                                                {getFieldDecorator('cardNo', {
                                                    rules: [{ required: true, message: intlLocales("INFO_IPTCARD") }],
                                                })(
                                                    <Input ref={this.cardNo} disabled={false} size="large"
                                                        placeholder="cardNo" className="item1" name="cardNo"
                                                        {...this.props.inputBind(this.setValue, 'right')}
                                                    />
                                                )}
                                            </FormItem>
                                        </TabPane>
                                        <TabPane tab={intlLocales("LOGIN_BYPWD")} key="1" forceRender={true}>
                                            <FormItem>
                                                {getFieldDecorator('userName', {
                                                    rules: [{ required: true, message: intlLocales("PLACEHOLDER_STAFFNUM") + '!' }],
                                                })(
                                                    <Input ref={this.userName} size="large" prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.3)', fontSize: "30px" }} />}
                                                        placeholder="Username" className="item1" name="userName"
                                                        {...this.props.inputBind(this.setValue, 'right')}
                                                    />
                                                )}
                                            </FormItem>
                                            <FormItem>
                                                {getFieldDecorator('passWord', {
                                                    rules: [{ required: true, message: intlLocales("LEAVE_PWDTIP") + '!' }],
                                                })(
                                                    <Input ref={this.passWord} size="large" prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.3)', fontSize: "30px" }} />}
                                                        type="password" placeholder="Password" className="item1" name="passWord"
                                                        {...this.props.inputBind(this.setValue, 'right')}
                                                    />
                                                )}
                                            </FormItem>
                                        </TabPane>
                                    </Tabs>
                                    <FormItem>
                                        {getFieldDecorator('workRound', defaultWorkRound ? {
                                            initialValue: defaultWorkRound,
                                            rules: [{ required: true, message: intlLocales("INFO_CLASSES") }]
                                        } : { rules: [{ required: true, message: intlLocales("INFO_CLASSES") }] })(
                                            <Select size="large" ref={this.workRound} name="workRound" placeholder="Select a workRound"
                                                dropdownClassName="login_select">
                                                {workRound.map(item => {
                                                    return <Option key={item.code}>{item.name}</Option>
                                                })}
                                            </Select>
                                        )}
                                        {/* <a className="cardbind" onClick={() => this.setState({ visible: true, key: 2 })}>{intlLocales("LOGN_TEMPCARD")}</a> */}
                                    </FormItem>
                                    <FormItem>
                                        <Button type="primary" htmlType="button" onClick={this.handleSubmit} className="subbtn">{intlLocales("LOGIN_LOGIN")}</Button>
                                    </FormItem>
                                </Form>
                            </Col>
                        </Row>
                    </Content>
                </Layout>
                <Modal
                    wrapClassName='vla-modal'
                    width={380}
                    title={intlLocales("LOGN_TEMPCARD")}
                    visible={this.state.visible}
                    footer={
                        <div>
                            <Button type="primary" onClick={this.cardBind}>{intlLocales("BTN_CONFIRM")}</Button>
                            <Button type="primary" onClick={this.closeModal}>{intlLocales("BTN_CANCEL")}</Button>
                        </div>
                    }>
                    <FormItem>
                        {getFieldDecorator("tempcode", {
                            rules: [{ required: true, message: intlLocales("INFO_IPTTEMPCARD") }],
                        })(
                            <Input
                                size="large"
                                placeholder={intlLocales("CARD_NUMBER")}
                                className="bindInput"
                                name="tempcode"
                                onBlur={this.props.blur}
                                onFocus={(event) => {
                                    this.props.focus(event, this.setValue, 'left');
                                }} />
                        )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator("gh", {
                            rules: [{ required: true, message: intlLocales("LEAVE_JOBNUMTIP") + '!' }],
                        })(
                            <Input
                                size="large"
                                placeholder={intlLocales("PLACEHOLDER_STAFFNUMBER")}
                                className="bindInput"
                                name="gh"
                                onBlur={this.props.blur}
                                onFocus={(event) => {
                                    this.props.focus(event, this.setValue, 'left');
                                }} />
                        )}
                    </FormItem>
                </Modal>
                <p className="ver">Version: {serviceVersion ? `${version}(${serviceVersion})` : version}</p>
                <Modal
                    wrapClassName='vla-modal'
                    width={380}
                    title='同步'
                    visible={this.props.netType}
                    footer={
                        <div>
                            <Button type="primary" onClick={() => this.handleCloseChange(false)}>確定</Button>
                            <Button type="primary" onClick={() => this.handleCloseChange(true)}>取消</Button>
                        </div>
                    }>
                    <DatePicker
                        allowClear={false}
                        size="40px"
                        mode={this.state.mode}
                        format="YYYY-MM-DD HH:mm:ss"
                        showTime
                        value={this.state.moment}
                        showToday={false}
                        onOpenChange={this.handleOpenChange}
                        onPanelChange={this.handlePanelChange}
                        onOk={value => {
                            console.log(value);
                        }}
                        onChange={moment => {
                            this.timeChange(false);
                            this.setState({ moment });
                        }}
                    />
                    <Input
                        readOnly
                        value={this.state.fphm}
                        style={{ marginTop: "20px", width: "246px" }}
                        name="fphm"
                        onBlur={this.props.blur}
                        onFocus={(event) => {
                            this.props.focus(event, this.setFPHM, 'right');
                        }} />
                </Modal>
            </div>
        );
    }

    timeChange = (flag) => {
        if (flag) {
            this.timeInterval = setInterval(() => {
                this.setState({ moment: moment() });
            }, 1000);
        } else {
            if (this.timeInterval) clearInterval(this.timeInterval);
        }
    }

    setFPHM = (value) => {
        if (value.fphm.length > 4) return;
        this.setState({ fphm: value.fphm });
    }

    changeSync = () => {
        this.timeChange(false);
        this.props.changeSync();
    }

    handleCloseChange = (flag) => {
        if (flag) return this.changeSync();
        if (!/^\d{4}$/.test(this.state.fphm)) {
            return message("請輸入4位小票號!");
        }
        this.changeSync();
        let data = [this.state.moment.format("YYYY-MM-DD HH:mm:ss"), this.state.fphm];
        this.props.sync(data);
        console.log(data);
    }

    handleOpenChange = (open) => {
        if (open) {
            this.setState({ mode: 'date' });
        }
    }

    handlePanelChange = (value, mode) => {
        this.setState({ mode });
    }

    com = (data) => {
        if (this.props.comflag) return;
        switch (this.state.key) {
            case 0:
                this.props.form.setFieldsValue({ cardNo: data });
                this.props.form.validateFields([...this.state.formitemArr[this.state.key], "workRound"], (err) => {
                    if (!err) {
                        let { cardNo = '', userName = '', passWord = '' } = this.props.form.getFieldsValue();
                        this.props.submit(cardNo, userName, passWord);
                    }
                });
                break;

            case 2:
                // this.props.form.setFieldsValue({ cardNo: data });
                // this.props.form.validateFields([...this.state.formitemArr[this.state.key], "workRound"], (err) => {
                //     if (!err) {
                //         let { cardNo = '', userName = '', passWord = '' } = this.props.form.getFieldsValue();
                //         this.props.submit(cardNo, userName, passWord);
                //     }
                // });

                this.props.form.setFieldsValue({ tempcode: data });

                // this.props.form.validateFields(["gh", data], (err) => {
                //     if (!err) {
                //         let { gh, tempcode } = this.props.form.getFieldsValue();
                //         this.props.cardBind({ gh, tempcode }).then(res => {
                //             if (res) {
                //                 this.closeModal();
                //             }
                //         })
                //     }
                // });


                break;
            default:
                break;
        }
    }

    cardBind = () => {
        this.props.form.validateFields(["gh", "tempcode"], (err) => {
            if (!err) {
                let { gh, tempcode } = this.props.form.getFieldsValue();
                this.props.cardBind({ gh, tempcode }).then(res => {
                    if (res) {
                        if (res.retflag === "N") {
                            EventEmitter.off('Com', this.com);
                            React.accredit(posrole => {
                                EventEmitter.on('Com', this.com);
                                let obj = {
                                    gh,
                                    tempcode,
                                    flag: "N",
                                    empowerCard: posrole.cardno
                                }
                                this.props.cardBind(obj).then(result => {
                                    if (result) {
                                        message(this.props.intlLocales("INFO_BINDSUCC"))
                                        this.closeModal();
                                    }
                                })
                            }, null)
                        } else {
                            message(this.props.intlLocales("INFO_BINDSUCC"))
                            this.closeModal();
                        }
                    }
                })
            }
        });
    }

    closeModal = () => {
        this.props.form.setFieldsValue({ gh: "", tempcode: "" });
        this.setState({ visible: false, key: this.state.oldkey });
    }

    setValue = (value) => {
        this.props.form.setFieldsValue(value);
    }

    handleSubmit = (event) => {
        event && event.preventDefault();
        this.props.form.validateFields([...this.state.formitemArr[this.state.key], "workRound"], (err) => {
            if (!err) {
                let { cardNo = '', userName = '', passWord = '', workRound = '' } = this.props.form.getFieldsValue();
                this.props.form.setFieldsValue({ cardNo: '', userName: '', passWord: '' });
                this.props.submit(cardNo, userName, passWord, workRound);
            }
        });
    }

    handleClear = (key) => {
        this.state.formitemArr[this.state.key].map(item => {
            this.setValue({ [item]: null });
        });
        this.setState({ key: parseInt(key, 10), oldkey: parseInt(key, 10) });
        this.props.keyPadClose();
    }

    TabClick = (key) => {
        if (parseInt(key, 10)) {
            setTimeout(() => {
                this.userName.current.focus();
            }, 300);
        } else {
            setTimeout(() => {
                this.cardNo.current.focus();
            }, 300);
        }
    }

}

Login = Form.create()(Login);

export default withKeyBoard(withKeypad(Login));
