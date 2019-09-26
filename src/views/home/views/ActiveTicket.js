import React, {Component} from 'react';
import {Modal, Form, Input, Row,  DatePicker, Button } from 'antd';
import moment from 'moment';
import intl from 'react-intl-universal';
import withKeypad  from '@/common/components/keypad';
const FormItem = Form.Item;


class ActiveTicket extends Component {

    state = {
        //生效日期
        eff_date: '',
        //券号
        accnt_no: '',
        date: undefined,
    }

    onChange = (date, dateString) => {
        this.setState({
            eff_date: dateString,
            date: date
        })

    }

    intlLocales = (key) => {
        return intl.get(key);
    }

    submit = () => {
        let {accnt_no, eff_date} = this.state
        if(accnt_no === '' || eff_date === ''){
            Modal.error({
                title: '',
                okText: this.intlLocales("INFO_CONFIRMA"),
                content: '生效日期及券号不能为空',
            });
        }else{
            this.props.handleTicket(eff_date, accnt_no)
        }
        // console.log(accnt_no, eff_date, 1111);
    }

    setValue = (value) => {
        this.setState(value)
    }

    onCancel = () => {
        this.props.onCancel('ticketModal')
        this.setState({
            eff_date: '',
            accnt_no: '',
            date: undefined,
        })
    }

    disabledDate(current) {
        return current && current < moment().startOf('day');
    }

    render() {
        let {visible} = this.props;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 6},
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
                        {this.intlLocales('ACTIVE_TITLE')}
                        <img src={require("@/common/image/close.png")} alt="" onClick={this.onCancel}/>
                    </div>
                    <Form onSubmit={this.handleSubmit}>
                        <FormItem label={this.intlLocales('ACTIVE_VALIDITYPERIOD')} {...formItemLayout} style ={{marginBottom: '0px', marginTop: '10px'}}>
                            <DatePicker onChange={this.onChange}  placeholder={this.intlLocales('ACTIVE_JODATE')} style = {{width: '100%'}} value ={this.state.date} disabledDate={this.disabledDate}/>
                        </FormItem>
                        <FormItem label={this.intlLocales('ACTIVE_TICKETNUMBER')} {...formItemLayout} style ={{marginTop: '5px'}}>
                            <Input  placeholder={this.intlLocales('ACTIVE_TIP')}
                                    name = 'accnt_no'
                                    onFocus={(event) => {
                                        this.props.focus(event, this.setValue);
                                    }}
                                    onBlur={this.props.blur}
                                    value = {this.state.accnt_no}
                            />
                        </FormItem>
                        <Row>
                            <Button  onClick = {this.submit} type="primary" htmlType="submit" size="default" style = {{float: 'right', marginBottom: '10px', marginRight: '10px'}}>{this.intlLocales('ACTIVE_SUBMIT')}</Button>
                        </Row>
                    </Form>
                </div>
            </Modal>
        )
    }
}

export default withKeypad(ActiveTicket);
