import React, { Component } from 'react';
import { Modal, Icon, Radio } from 'antd';
import '../style/callInfo.less';
import withKeyBoard from '@/common/components/keyBoard';
import message from '@/common/components/message';


class CallInfo extends Component {

    static defaultProps = {
    };

    constructor(props) {
        super(props)
        this.state = {
            callCode: undefined,
            index: undefined,
        }
    }

    componentDidMount() {
        this.props.bind({
            //pageUP
            "33": () => {
                
            },
            //pageDown
            "34": () => {
            },
            //end
            "35": this.handleCancel,
            //home
            "36": this.handleOk,
            //up
            "38": () => {
                const {callInfo} = this.props;
                let {index} = this.state;
                if(!index && index !== 0) {
                    index = callInfo.length - 1;
                } else {
                    if(index !== 0) index--;
                }
                this.setState({
                    callCode: callInfo[index].code,
                    index
                })
            },
            //down
            "40": () => {
                const {callInfo} = this.props;
                let {index} = this.state;
                if(!index && index !== 0) {
                    index = 0;
                } else {
                    if(index !== callInfo.length - 1) index++;
                }
                this.setState({
                    callCode: callInfo[index].code,
                    index
                })
            },
        });
    }

    componentWillUnmount() {
    }

    componentWillReceiveProps (nextProps) {
    }

    
    handleOk = () => {
        const { callback, close} = this.props;
        const {callCode} = this.state;
        if(!callCode) {
            message('请选择呼叫信息！');
            return;
        }
        callback(callCode).then((res) => {
            if(res) close();
        })
    }

    handleCancel = () => {
        this.props.close();
    }

    callChange = (callCode, index) => {
        this.setState({
            callCode,
            index
        })
    }

    render() {
        const { callInfo, callback } = this.props;
        const radioStyle = {
            display: 'block',
            height: '35px',
            lineHeight: '35px',
            fontSize: '18px'
        };
        return (
            <Modal wrapClassName="callInfo"
                   title="呼叫信息"
                   maskClosable={false}
                   width={500}
                   okText="确认"
                   cancelText="取消"
                   onOk={this.handleOk}
                   onCancel={this.handleCancel}
                   visible={true}>
                <Radio.Group 
                    value={this.state.callCode}>
                    {callInfo.map((item, index) =>
                        <Radio style={radioStyle} value={item.code}
                            className={index === this.state.index? 'selected' : ''}
                            onClick={() => this.callChange(item.code, index)}
                            key={item.code}>{item.text}</Radio>)
                    }
                </Radio.Group>
            </Modal>
        )
    }
}

export default withKeyBoard(CallInfo)