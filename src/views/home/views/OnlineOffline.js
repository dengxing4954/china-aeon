import React, {Component} from 'react';
import {Modal, Form, Input, Row,  Button } from 'antd';
import {Fetch} from '@/fetch/';
import Url from '@/config/url.js';
import {connect} from 'react-redux';
const FormItem = Form.Item;



class OnlineOffline extends Component {


    onCancel = () => {
        this.props.onCancel('onlineTypeModel')
    }

    submit = () =>{
        this.props.onoffonline()
        this.props.onCancel('onlineTypeModel')
    }

    render() {
        let {visible, onCancel} = this.props;
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
                        脱机与联网
                        <img src={require("@/common/image/paytk_close.png")} alt="" onClick={this.onCancel}/>
                    </div>
                    <Form>
                        <Row>
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="default"
                                style = {{float: 'right', marginBottom: '10px', marginRight: '10px',marginTop:'10px'}}
                                onClick = {this.submit}
                            >{this.props.onlineModel != 0 ? '脱机' : "联网"}</Button>
                        </Row>
                    </Form>
                </div>
            </Modal>
        )
    }
}

export default OnlineOffline;