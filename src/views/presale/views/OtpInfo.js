import React from 'react';
import ReactDOM from 'react-dom';
import OtpInfoModal from './OtpInfoModal';

//查阅OTP
export default class OtpInfo {
    static instance;

    static open(params) {
        //this.close();
        OtpInfo.instance = document.createElement('div');
        document.body.appendChild(OtpInfo.instance);
        ReactDOM.render(
            <OtpInfoModal close={this.close}
                           callback = { params && params.callback}
                           data = {params.data}
                           />,
                            OtpInfo.instance
        )
    }

    static close() {
        if (OtpInfo.instance) {
            var unmountResult = ReactDOM.unmountComponentAtNode(OtpInfo.instance);
            if (unmountResult && OtpInfo.instance.parentNode) {
                OtpInfo.instance.parentNode.removeChild(OtpInfo.instance);
                OtpInfo.instance = null;
            }
        }
    }

}