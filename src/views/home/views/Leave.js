import React, { Component } from 'react';
import { Modal, Form, Input, Row, DatePicker, Button, Tabs } from 'antd';
import withKeypad from '@/common/components/keypad';
import { Fetch } from '@/fetch/';
import Url from '@/config/url.js';
import message from '@/common/components/message';
import EventEmitter from '@/eventemitter/';
import intl from 'react-intl-universal';
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;


class Leave extends Component {

    state = {
        cardno: '',
        gh: '',
        passwd: '',
        key: 0,
        formitemArr: [
            ["cardno"],
        ],
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.visible === false && nextProps.visible === true) {
            EventEmitter.on('Com', this.com);
        }
    }

    componentWillUnmount() {
        EventEmitter.off('Com', this.com);
    }

    afterClose = () => {
        EventEmitter.off('Com', this.com);
        this.props.keyPadClose()
    }

    setValue = (value) => {
        this.setState(value)
    }

    submit = (card) => {
        let cardno = this.state.cardno === '' ? null : this.state.cardno
        let req = {
            mkt: this.props.initialState.mkt,
            erpCode: this.props.initialState.erpCode,
            syjh: this.props.initialState.syjh,
            cardno: typeof (card) === 'string' ? card : cardno,
            syjcursyyh: this.state.gh === '' ? null : this.state.gh,
            passwd: this.state.passwd === '' ? null : this.state.passwd
        }
        Fetch({
            url: Url.base_url,
            type: "POST",
            data: { command_id: 'SYJUNLOCK', ...req }
        }).then(res => {
            if ('0' === res.retflag) {
                this.props.onCancel('leaveModal')
                this.setState({
                    gh: '',
                    passwd: '',
                    cardno: ''
                })
            } else {
                message(res.retmsg)
            }
        })
    }

    intlLocales = (key) => {
        return intl.get(key);
    }

    com = data => {
        this.setState({ cardno: data })
        this.submit(data)
    }

    tabChange = key => {
        if (key === '1') {
            this.setState({
                cardno: ''
            })
        } else {
            this.setState({
                gh: '',
                passwd: ''
            })
        }
    }

    handleChange = (e) => {
        this.setState({
            cardno: e.target.value
        })
    }

    render() {
        let { visible, onCancel } = this.props;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 6 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            },
        };
        return (
            <Modal
                title={null}
                visible={visible}
                closable={false}
                maskClosable={false}
                footer={null}
                mask={true}
                zIndex={2}
                width={500}
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
                bodyStyle={{ margin: 0, padding: 0 }}
                destroyOnClose={true}
                afterClose={this.afterClose}
            >
                <div className="easypay">
                    <div className="head">
                        {this.intlLocales('LEAVE_TITLE')}
                    </div>
                    <Form onSubmit={this.handleSubmit}>
                        {/* <div style = {{marginBottom : '10px',marginTop: '10px'}}>: </div> */}
                        <FormItem label={this.intlLocales('LEAVE_JOBNUMBER')} {...formItemLayout} style={{ marginTop: '5px', marginBottom: '14px' }}>
                            <span>{this.props.login.operuser.gh}</span>
                        </FormItem>
                        <FormItem label='員工卡' {...formItemLayout} style={{ paddingBottom: '24px' }}>
                            <Input placeholder='請刷員工卡'
                                readOnly
                                name="cardno"
                                // onChange = {this.handleChange}
                                autoFocus={true}
                                value={this.state.cardno}
                                size='large'
                            />
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        )
    }
}

export default withKeypad(Leave);