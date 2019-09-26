import React from 'react';
import ReactDOM from 'react-dom';
import RechargeKeypad from './views/RechargeKeypad';

//小键盘
export default class KeyPad {
    static instance;

    static open(params) {
        this.close();
        RechargeKeypad.instance = document.createElement('div');
        document.body.appendChild(RechargeKeypad.instance);
        ReactDOM.render(
            <RechargeKeypad close={this.close}
                            title = { params && params.title}
                            rule = { params && params.rule}
                            placeholder = { params && params.placeholder}
                            defaultValue = { params && params.defaultValue}
                            errMessage = { params && params.errMessage}
                            info = { params && params.info}
                            keyboard = { params && params.keyboard}
                            hasKeyboard = { params && params.hasKeyboard}
                            tabs={ params && params.tabs }
                            event={ params && params.event }
                            cancelCallback = { params && params.cancelCallback}
                            callback = { params && params.callback}
                            keyControl = { params && params.keyControl}/>,
            RechargeKeypad.instance
        )
    }

    static close() {
        if (RechargeKeypad.instance) {
            var unmountResult = ReactDOM.unmountComponentAtNode(RechargeKeypad.instance);
            if (unmountResult && RechargeKeypad.instance.parentNode) {
                RechargeKeypad.instance.parentNode.removeChild(RechargeKeypad.instance);
                RechargeKeypad.instance = null;
                if(document.getElementById('codeInput')) {
                    document.getElementById('codeInput').focus();
                }
            }
        }
    }

}