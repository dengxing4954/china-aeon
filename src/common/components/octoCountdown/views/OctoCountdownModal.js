import React, { Component } from 'react';
import { Modal, Progress, Row, Col, Button, Table, Input, Form, message } from 'antd';
import '../style/OctoCountdown.less';
import intl from 'react-intl-universal';

class OctoCountdownModal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            secMax: 24000,
            secLeft: 24000,
            step: 1000,
            percent: 100,
            octoSuccessed: false
        }
    }

    componentDidMount() {
        let that = this;
        // this.setState({
        //     secMax: 24000,
        //     secLeft: 24000,
        //     step: 1000,
        //     percent: 100,
        //     octoSuccessed: false
        // }, () => {
        //     setTimeout(that.processorRefresh, this.state.step);
        //     setTimeout(this.props.data.octoAccess, 1000);
        // });
        setTimeout(this.props.data.octoAccess, 1000);
    }

    componentWillMount() {
    }

    handleOk = () => {
        if(this.props.callback) {
            // this.props.callback(this.state.num);
        }
        this.props.close();
    }

    handleCancel = () => {
        this.props.close();
    }

    handleSubmit = (e) =>{
        if(!!e){
            e.preventDefault();
        }
        if (!!this.props.callback) {
            // this.props.callback(this.state.saleMemoValue);
        }
        this.props.close();
    }

    processorRefresh = () => {
        // let that = this;
        // let _percent = (((this.state.secLeft - this.state.step)/this.state.secMax)*100);
        // this.setState({
        //     secLeft: this.state.secLeft - this.state.step,
        //     percent: _percent
        // }, () => {
        //     if ( that.state.secLeft > that.state.step ) {
        //         setTimeout(that.processorRefresh, that.state.step);            
        //     }else{
        //         if(!!that.props.data.octoRetryEnd){
        //             // that.props.data.octoRetryEnd();
        //         }
        //         that.props.close();
        //     }
        // });
    }

    render() {
        const { data } = this.props
        return (
            <Modal
                className = 'octoCountdown'
                visible = {true}
                width = {434}
                // title = {'剩余' + (this.state.secLeft/1000).toFixed(0) + "秒"}
                title = {intl.get("INFO_OCTOREADING")}
                okText={intl.get("INFO_CONFIRM")}
                footer = {null}
                maskClosable = {false}
                cancelText="取消"
                onOk={this.handleOk}
                onCancel={this.handleCancel}
            >   
                <Row>
                    <Col span={24}>
                        <ul>
                            {/* <li className="en">{data.enMsg}</li> */}
                            <li className="cn">{data.cnMsg}</li>
                            <li className="countdown">
                                {/* <Progress type="line" percent={this.state.percent} showInfo={false} strokeWidth={3} /> */}
                            </li>
                        </ul>
                    </Col>
                </Row>
            </Modal>
        )
    }
}

export default OctoCountdownModal;
