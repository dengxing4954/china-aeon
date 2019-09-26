import React, { Component } from 'react';
import moment from 'moment';
import NumberKeypad from '@/common/components/numberKeypad/index.js';
import { Form, Modal, Input, Button, Row, Icon, Tabs, Radio, Table } from 'antd';
import withKeypad from '@/common/components/keypad/';
import '../style/searchAMC.less'
import EventEmitter from '@/eventemitter';
import intl from 'react-intl-universal';
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;

//商品明细
class SearchAMC extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tabKey: "1",
            vip: {},
            vipCardNo: '',
            transactions: [],
            jfModalVisible: false,
        };
    }

    componentDidMount() {

    }

    componentWillMount() {
    }

    componentWillReceiveProps(nextProps) {
        if(this.props.visible === false && nextProps.visible === true ) {
            EventEmitter.on('Com', this.searchAMC);
            //EventEmitter.on('Scan', this.searchAMC);
            /*if(JSON.stringify(nextProps.defaultVip) !== '{}' ) {
                this.setState({
                    vip: nextProps.defaultVip,
                    vipCardNo: nextProps.defaultVipCardNo,
                })
                this.props.searchAMCJF({
                    memberId: nextProps.defaultVipCardNo
                }).then(res => {
                    if(res && res.transactions) {
                        this.setState({
                            transactions: res.transactions
                        })
                    }
                })
            }*/
            if(JSON.stringify(nextProps.defaultVip) !== '{}' && nextProps.defaultVipCardNo) {
                let params = {
                    idtype: "1",
                    memberId: nextProps.defaultVipCardNo
                }
                this.props.callback(params, (res) => {
                    this.setState({
                        vip: res.memberInfo || {}
                    })
                    if(res.memberInfo && res.memberInfo.memberId) {
                        this.searchAMCJF(nextProps.defaultVipCardNo);
                    }
                });
            }
        }
        if(this.props.visible === true && nextProps.visible === false ) {
            EventEmitter.off('Com', this.searchAMC);
            //EventEmitter.off('Scan', this.searchAMC);
            this.props.form.resetFields();
            this.setState({tabKey: "1", vip: {}})
        }
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
            console.log(values);
            if (!err && this.props.callback) {
                this.props.callback(values, (res) => {
                    console.log(res);
                    this.setState({
                        vip: res.memberInfo || {},
                        idtype: values.idtype
                    })
                    if(res.memberInfo && res.memberInfo.memberId) {
                        this.searchAMCJF(values.memberId);
                    }
                });
            }
        });
    }

    tabChange = (key) => {
        if(key === '1') {
            EventEmitter.on('Com', this.searchAMC);
            //EventEmitter.on('Scan', this.searchAMC);
            this.props.form.resetFields();
        } else {
            EventEmitter.off('Com', this.searchAMC);
            //EventEmitter.off('Scan', this.searchAMC);
        }
        this.setState({tabKey: key})
    }

    searchAMC = (data) => {
        console.log(111);
        this.props.callback({
            idtype: '1',
            memberId: data
        }, (res) => {
            if(res) {
                this.setState({
                    vip: res.memberInfo || {},
                    vipCardNo: data,
                })
                if(res.memberInfo && res.memberInfo.memberId) {
                    this.searchAMCJF(data);
                }
            }
        });
    }

    searchAMCJF = (memberId) => {
        this.props.searchAMCJF({
            memberId: memberId
        }).then(res => {
            if(res && res.transactions) {
                this.setState({
                    transactions: res.transactions.map((item, index) => ({key: index, ...item}))
                })
            }
            /*this.setState({
                transactions:[{"bonusPoint":5000,"description":"Mobile Kiosk Cancel Redeem","transactionDate":"20181108224712"},{"bonusPoint":5000,"description":"Mobile Kiosk Cancel Redeem","transactionDate":"20181108210425"},{"bonusPoint":5000,"description":"Mobile Kiosk Cancel Redeem","transactionDate":"20181108210424"},{"bonusPoint":5000,"description":"Mobile Kiosk Cancel Redeem","transactionDate":"20181108210423"},{"bonusPoint":5000,"description":"Mobile Kiosk Cancel Redeem","transactionDate":"20181108210422"},{"bonusPoint":5000,"description":"Mobile Kiosk Cancel Redeem","transactionDate":"20181108210421"},{"bonusPoint":5000,"description":"Mobile Kiosk Cancel Redeem","transactionDate":"20181108210420"},{"bonusPoint":5000,"description":"Mobile Kiosk Cancel Redeem","transactionDate":"20181108210419"},{"bonusPoint":5000,"description":"Mobile Kiosk Cancel Redeem","transactionDate":"20181108210418"},{"bonusPoint":5000,"description":"Mobile Kiosk Cancel Redeem","transactionDate":"20181108210417"}].map((item, index) => ({key: index, ...item}))
            })*/
        })
    }

    handleJfDetail = () => {
        this.setState({
            jfModalVisible: !this.state.jfModalVisible
        })
    }

    render() {
        const { visible } = this.props;
        const { getFieldDecorator } = this.props.form;
        const { vip } = this.state;
        const columns = [{
            title: '消費時間',
            dataIndex: 'transactionDate',
            width: 200,
            render: (text) =>
                text ? moment(text, 'YYYYMMDDHHmmss').format('YYYY-MM-DD HH:mm:ss') : ''
        }, {
            title: '消費積分',
            width: 100,
            dataIndex: 'bonusPoint',
        }, {
            title: '消費詳情',
            dataIndex: 'description',
        }];
        return (
            <Modal className="presale_vip_find"
                   width={880}
                   style={{ top: 35 }}
                   title={intl.get("MENU_AMC")}
                   visible={visible}
                   footer={
                        <Button onClick={this.closeModal}>取消</Button>
                   }
                   afterClose={() => {document.getElementById('codeInput').focus()}}
                   destroyOnClose={true}
                >
                <div className="vip_find">
                    <Tabs onChange={this.tabChange}
                          type="card"
                          activeKey={this.state.tabKey}>
                        <TabPane tab={intl.get("AMC_BYCARD")} key="1">
                            <div className="swipe_card">
                                {intl.get("AMC_TIPSWIPE")}
                            </div>
                            <Input style={{display:"none"}}></Input>
                        </TabPane>
                        {/*<TabPane tab={intl.get("AMC_BYPHONE")} key="2">*/}
                        <TabPane tab='輸入查詢' key="2">
                            <Form>
                                <Row>
                                    <FormItem>
                                        {getFieldDecorator('idtype', {initialValue: '1'})(
                                            <Radio.Group size="large">
                                                <Radio.Button value="1">卡號</Radio.Button>
                                                <Radio.Button value="2">手機號</Radio.Button>
                                            </Radio.Group>
                                        )}
                                    </FormItem>
                                </Row>
                                <Row>
                                    <FormItem required={false}>
                                        {getFieldDecorator('memberId', {
                                            rules: [{ required: true, message: '必須輸入卡號或手機號!'}],
                                        })(
                                            <Input
                                                name='memberId'
                                                placeholder='請輸入卡號或手機號'
                                                size="large"
                                                onBlur={this.props.blur}
                                                onFocus={(e) => {this.props.focus(e, this.setValue, 'right');}} />
                                        )}
                                    </FormItem>
                                </Row>
                                {/*<Row>
                                    <FormItem required={false}>
                                        {getFieldDecorator('memberId', {
                                            rules: [{ required: true, message: intl.get("AMC_MESSAGE_ERR")}],
                                        })(
                                            <Input
                                                name='memberId'
                                                placeholder={intl.get("AMC_PLACEHOLDER")}
                                                size="large"
                                                onBlur={this.props.blur}
                                                onFocus={(e) => {this.props.focus(e, this.setValue, 'right');}} />
                                        )}
                                    </FormItem>
                                </Row>*/}
                                <Row>
                                    <Button type="primary" onClick={this.submit}>{intl.get("BTN_CONFIRM")}</Button>
                                </Row>
                            </Form>
                        </TabPane>
                    </Tabs>
                </div>
                {vip && JSON.stringify(vip) !== '{}' ?
                    <div className="vip_detail">
                        <Row>{intl.get("AMC_CARD")}：{vip.memberId || ""}</Row>
                        {/*<Row>中文名：{vip.memberNameChinese || ""}</Row>
                        <Row>英文名：{vip.memberNameEnglish || ""}</Row>*/}
                        <Row>{intl.get("AMC_GRADE")}：{vip.viptype || ""}</Row>
                        <Row>{intl.get("AMC_LABEL")}：{vip.viplabel || ""}</Row>
                        <Row>{intl.get("AMC_MATURITY")}：{vip.membershipExpireDate ? moment(vip.membershipExpireDate, 'YYYYMMDD').format('YYYY-MM-DD') : ""}</Row>
                        <Row>有效積分：{Math.floor((vip.bonusPointLastMonth - vip.bonusPointUsed) || 0)}</Row>
                        <Row>積分過期日期：{vip.bonusPointExpireDate ? moment(vip.bonusPointExpireDate, 'YYYYMMDD').format('YYYY-MM-DD') : ""}</Row>
                        <Row>即將過期積分：{vip.bonusPointToBeExpired || ""}</Row>
                        <Row>積分更新時間：{vip.lastUpdateTime? moment(vip.lastUpdateTime, 'YYYYMMDDHHmmss').format('YYYY-MM-DD HH:mm:ss') : ""}</Row>
                        <Row className="vip_jf">
                            <span>積分使用記錄：</span>
                            {this.state.transactions.length > 0 ?
                                <div>
                                    <ul>
                                        {this.state.transactions.slice(0,2).map((item, index) =>
                                                <li key={index}>
                                                    <span>{item.transactionDate ? moment(item.transactionDate, 'YYYYMMDDHHmmss').format('YYYY-MM-DD HH:mm:ss') : ''}</span>
                                                    <span className="vip_bonusPoint">{item.bonusPoint}</span>
                                                    <span>{item.description}</span>
                                                </li>
                                        )}
                                    </ul>
                                    <Button onClick={this.handleJfDetail}>查看更多詳情</Button>
                                </div> : '暫無記錄'
                            }
                        </Row>
                        {vip.stampEnabled && vip.stampEnabled === 'TRUE' ?
                            <div>
                                <Row>電子印花所有者ID：{vip.stampOwnerID || ""}</Row>
                                <Row>電子印花餘額：{vip.stampBalance || ""}</Row>
                            </div> : null
                        }
                    </div> :
                    <div className="vip_empty">
                        <Icon type="frown-o" />
                        <span>{intl.get("AMC_TIPMSG")}</span>
                    </div>
                }
                <Modal visible={this.state.jfModalVisible}
                       className="presale_vip_jfDtail"
                       width={750}
                       destroyOnClose={true}
                       footer={
                        <Button onClick={this.handleJfDetail}>取消</Button>
                       }>
                    <Table columns={columns}
                           dataSource={this.state.transactions}
                           size="small"
                           pagination={{  //分页参数
                                pageSize: 6,
                                size: 'large'
                           }}/>
                </Modal>
            </Modal>
        );
    }
}

SearchAMC = Form.create()(SearchAMC);

export default withKeypad(SearchAMC);
