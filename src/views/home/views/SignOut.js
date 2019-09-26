import React, { Component } from 'react';
import withKeyBoard from '@/common/components/keyBoard';
import { Modal } from 'antd';

class SignOut extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.bind({
            "35": () => {
                this.props.onCancel();
            },
            "36": () => {
                this.props.onOk();
            }
        })
        this.confirm = Modal.confirm({
            className: 'vla-confirm',
            title: '登出',
            content: '確認登出?',
            okText: '確認',
            cancelText: '取消',
            onOk: () => {
                this.props.onOk();
            },
            onCancel: () => {
                this.props.onCancel();
            }
        })
    }

    componentWillUnmount() {
        this.confirm && this.confirm.destroy();
    }

    render() {
        return (
            <div></div>
        )
    }
}

export default withKeyBoard(SignOut);