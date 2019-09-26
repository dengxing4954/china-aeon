import React from 'react';
import ReactDOM from 'react-dom';
import FundPayModal from './FundPayModal';

export default class FundPay {
    static instance;

    static open(params) {
        //this.close();
        FundPay.instance = document.createElement('div');
        document.body.appendChild(FundPay.instance);
        ReactDOM.render(
            <FundPayModal close={this.close}
                           callback = { params && params.callback}
                           payinMode = {params.data.payinMode}
                           extra = {params.data.extra}
                           />,
                           FundPay.instance
        )
    }

    static close() {
        if (FundPay.instance) {
            var unmountResult = ReactDOM.unmountComponentAtNode(FundPay.instance);
            if (unmountResult && FundPay.instance.parentNode) {
                FundPay.instance.parentNode.removeChild(FundPay.instance);
                FundPay.instance = null;
            }
        }
    }

    
}