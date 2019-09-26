import React from 'react';
import ReactDOM from 'react-dom';
import TableModal from './views/TableModal';

//弹窗
export default class ModalTable {
    static instance;
    
    static open({callback, style, width, title, table, searchButton}) {
        ModalTable.instance = document.createElement('div');
        document.body.appendChild(ModalTable.instance);
        ReactDOM.render(
            <TableModal 
                open = {(params) => {
                    if(callback){
                        callback(params)
                    }
                }}
                table = {table}
                searchButton = {searchButton}
                style = {style}
                width = {width}
                title = {title}
                close = {this.close}
            ></TableModal>,
            ModalTable.instance                
        )
    }

    static close() {
        if (ModalTable.instance) {
            var unmountResult = ReactDOM.unmountComponentAtNode(ModalTable.instance);
            if (unmountResult && ModalTable.instance.parentNode) {
                ModalTable.instance.parentNode.removeChild(ModalTable.instance);
                ModalTable.instance = null;
            }
        }
    }
}
