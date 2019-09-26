import React from 'react';
import ReactDOM from 'react-dom';
import ExtraPayModal from './views/ExtraPay';

//除外支付
export default class ExtraPay {
    static instance;
    static open(params) {
        if (ExtraPay.instance) {
            this.close();
        };
        ExtraPay.instance = document.createElement('div');
        document.body.appendChild(ExtraPay.instance);
        ReactDOM.render(
            <ExtraPayModal close={this.close}
                           type={ params && params.type }
                           initialState={ params && params.initialState }
                           maxGiftPrice={ params && params.maxGiftPrice }
                           paymodeList={ params && params.paymodeList }
                           payDelete={ params && params.payDelete }
                           callback = { params && params.callback}
                           cancel = { params && params.cancel}
                           data = {params.data}
                           syspara = {params.syspara}
                           keyControl = {params && params.keyControl}
                           />,
                            ExtraPay.instance
        )
    }

    static close() {
        if (ExtraPay.instance) {
            var unmountResult = ReactDOM.unmountComponentAtNode(ExtraPay.instance);
            if (unmountResult && ExtraPay.instance.parentNode) {
                ExtraPay.instance.parentNode.removeChild(ExtraPay.instance);
                ExtraPay.instance = null;
            }
        }
    }

}