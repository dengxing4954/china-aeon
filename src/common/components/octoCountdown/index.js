import React from 'react';
import ReactDOM from 'react-dom';
import OctoCountdownModal from './views/OctoCountdownModal';

//Octopus强制重试
export default class OctoCountdown {
    static instance;

    static open(params) {
        //this.close();
        OctoCountdown.instance = document.createElement('div');
        document.body.appendChild(OctoCountdown.instance);
        ReactDOM.render(
            <OctoCountdownModal close={this.close}
                           callback = { params && params.callback}
                           data = {params.data}
                           />,
                           OctoCountdown.instance
        )
    }

    static close() {
        if (OctoCountdown.instance) {
            var unmountResult = ReactDOM.unmountComponentAtNode(OctoCountdown.instance);
            if (unmountResult && OctoCountdown.instance.parentNode) {
                OctoCountdown.instance.parentNode.removeChild(OctoCountdown.instance);
                OctoCountdown.instance = null;
            }
        }
    }

}