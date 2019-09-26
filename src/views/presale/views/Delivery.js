import React from 'react';
import ReactDOM from 'react-dom';
import DeliveryModal from './DeliveryModal';

//DC送
export default class Delivery {
    static instance;

    static open(params) {
        //this.close();
        Delivery.instance = document.createElement('div');
        document.body.appendChild(Delivery.instance);
        ReactDOM.render(
            <DeliveryModal close={this.close}
                           callback = { params && params.callback}
                           data = {params.data.dcData}
                           mkt = {params.data.mkt}
                           mktname = {params.data.mktname}
                           chooseDateList = {params.data.chooseDateList}
                           paravalue = {params.data.paravalue}
                           getRegionList = {params && params.getRegionList}
                           getRegionInfo = {params && params.getRegionInfo}
                           getQuotaInfo = {params && params.getQuotaInfo}
                           />,
                            Delivery.instance
        )
    }

    static close() {
        if (Delivery.instance) {
            var unmountResult = ReactDOM.unmountComponentAtNode(Delivery.instance);
            if (unmountResult && Delivery.instance.parentNode) {
                Delivery.instance.parentNode.removeChild(Delivery.instance);
                Delivery.instance = null;
            }
        }
    }

}