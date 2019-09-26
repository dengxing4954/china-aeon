import React, { Component } from 'react';
import { Modal } from 'antd';
import withKeyBoard from '@/common/components/keyBoard';

class ConfirmView extends Component {
    componentDidMount() {
        this.props.bind(this.props.handler || {
            "35": () => {
                this.props.onCancel();
            },
            "36": () => {
                this.props.onOk();
            }
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

export default function modalBox(params) {
    const { onOk, onCancel, content, handler, type } = params;
    let model;
    const ok = () => {
        model.destroy();
        setTimeout(() => {
            onOk && typeof onOk == "function" && onOk();
        }, 350);
    };
    const cancel = () => {
        model.destroy();
        setTimeout(() => {
            onCancel && typeof onCancel == "function" && onCancel();
        }, 350);
    };
    let defaultProps = {
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
    }
    switch(type) {
        case 'confirm': 
            model = Modal.confirm({
               ...defaultProps
            });
        break;
        case 'success':
            model = Modal.success({
                ...defaultProps
            });
        break;
        default: 
            model = null;
        break;
    }

}