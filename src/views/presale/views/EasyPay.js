import React from 'react';
import ReactDOM from 'react-dom';
import EasyPayModal from './EasyPayModal';

//DC送
export default class EasyPay {
    static instance;

    static open(params) {
        //this.close();
        EasyPay.instance = document.createElement('div');
        document.body.appendChild(EasyPay.instance);
        ReactDOM.render(
            <EasyPayModal close={this.close}
                          onCancel = { params && params.onCancel}
                          onOk = { params && params.onOk}
                          title = { params && params.title }
                />,
            EasyPay.instance
        )
    }

    static close() {
        if (EasyPay.instance) {
            var unmountResult = ReactDOM.unmountComponentAtNode(EasyPay.instance);
            if (unmountResult && EasyPay.instance.parentNode) {
                EasyPay.instance.parentNode.removeChild(EasyPay.instance);
                EasyPay.instance = null;
            }
        }
    }

}