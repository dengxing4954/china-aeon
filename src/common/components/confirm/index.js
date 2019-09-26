import React, { Component } from 'react';
import { Modal } from 'antd';
import withKeyBoard from '@/common/components/keyBoard';

class ConfirmView extends Component {
    componentDidMount() {
        this.props.bind({
            "35": () => {
                this.props.onCancel();
            },
            "36": () => {
                this.props.onOk();
            },
            ...this.props.handler
        });
    }

    render() {
        let { content } = this.props;
        return (
            <div>{content}</div>
        );
    }
}

const ConfirmViewContent = withKeyBoard(ConfirmView);

export default function confirm(params) {
    const { onOk, onCancel, content, handler = {} } = params;
    let flag = false;
    const ok = () => {
        if (flag) return;
        flag = true;
        model.destroy();
        setTimeout(() => {
            onOk && typeof onOk == "function" && onOk();
        }, 350);
    };
    const cancel = () => {
        if (flag) return;
        flag = true;
        model.destroy();
        setTimeout(() => {
            onCancel && typeof onCancel == "function" && onCancel();
        }, 350);
    };
    let model = Modal.confirm({
        cancelText: "否",
        okText: "是",
        title: "提示",
        className: 'vla-confirm',
        ...params,
        content: <ConfirmViewContent content={content} onOk={ok} onCancel={cancel} handler={handler}></ConfirmViewContent >,
        onOk: () => {
            ok();
        },
        onCancel: () => {
            cancel();
        }
    });

}
