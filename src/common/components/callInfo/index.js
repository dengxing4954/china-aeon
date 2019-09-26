import React from 'react';
import ReactDOM from 'react-dom';
import CallInfo from './views/CallInfo';

//小键盘
export default class KeyPad {
    static instance;

    static open(params) {
        if (CallInfo.instance) {
            //this.close();
            return;
        };
        CallInfo.instance = document.createElement('div');
        document.body.appendChild(CallInfo.instance);
        ReactDOM.render(
            <CallInfo close={this.close}
                      callInfo = { params && params.callInfo}
                      callback = { params && params.callback}/>,
            CallInfo.instance
        )
    }

    static close(params) {
        if (CallInfo.instance) {
            var unmountResult = ReactDOM.unmountComponentAtNode(CallInfo.instance);
            if (unmountResult && CallInfo.instance.parentNode) {
                CallInfo.instance.parentNode.removeChild(CallInfo.instance);
                CallInfo.instance = null;
                if(document.getElementById('codeInput')) {
                    document.getElementById('codeInput').focus();
                }
            }
        }
    }

}