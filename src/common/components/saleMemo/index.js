import React from 'react';
import ReactDOM from 'react-dom';
import SaleMemoModal from './views/SaleMemoModal';

//saleMemo
export default class SaleMemo {
    static instance;

    static open(params) {
        //this.close();
        SaleMemo.instance = document.createElement('div');
        document.body.appendChild(SaleMemo.instance);
        ReactDOM.render(
            <SaleMemoModal close={this.close}
                           callback = { params && params.callback}
                           data = {params.data}
                           />,
                            SaleMemo.instance
        )
    }

    static close() {
        if (SaleMemo.instance) {
            var unmountResult = ReactDOM.unmountComponentAtNode(SaleMemo.instance);
            if (unmountResult && SaleMemo.instance.parentNode) {
                SaleMemo.instance.parentNode.removeChild(SaleMemo.instance);
                SaleMemo.instance = null;
            }
        }
    }

}