import React from 'react';
import { Modal } from 'antd';
import './style/Message.less';

export default function message(content, time = 3, callback, mask = true) {
    let model = Modal.info({
        className: "vla-message vla-message-id",
        maskClosable: mask,
        zIndex: 10001,
        width: 500,
        title: "提示",
        content: content,
        okText: "OK",
        onOk: () => {
        }
    });
    setTimeout(() => {
        model.destroy();
        callback && callback();
    }, time * 1000);
}
