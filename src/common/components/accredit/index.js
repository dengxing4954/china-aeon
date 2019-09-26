import React from 'react';
import { Modal } from 'antd';
import Accredit from './views/Accredit';
import './style/Accredit.less';

export default function accredit(callback, cancel, reqParams, contentMsg) {
    const ok = () => {
        cancel && cancel();
    }
    let model = Modal.info({
        className: "accredit",
        width: 350,
        icon: "null",
        title: "授權",
        okText: "取消",
        content:
            <Accredit destory={(value) => {
                model.destroy();
                callback && callback(value);
            }}
                contentMsg={contentMsg}
                reqParams={reqParams}
                onCancel={() => {
                    ok();
                    model.destroy();
                }}>
            </Accredit>,
        onOk: ok
    });
}
