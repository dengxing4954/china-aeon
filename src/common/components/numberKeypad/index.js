import React from 'react';
import ReactDOM from 'react-dom';
import NumberKeypad from './views/NumberKeypad';

//小键盘
export default class KeyPad {
    static instance;

    static open(params) {
        if (NumberKeypad.instance) {
            //this.close();
            return;
        };
        NumberKeypad.instance = document.createElement('div');
        NumberKeypad.instance.id = "numberKeypad"
        document.body.appendChild(NumberKeypad.instance);
        ReactDOM.render(
            <NumberKeypad close={this.close}
                          top={params && params.top}
                          left={params && params.left}
                          boundInput={params && params.boundInput}
                          keyboard={params && params.keyboard}
                          onInput={params && params.onInput}
                          onBack={params && params.onBack}
                          onClear={params && params.onClear}
                          onCancel={params && params.onCancel}
                          onOk={params && params.onOk}
                          onOpen={params && params.onOpen}
                          autoClose={params && params.autoClose}  //确定回调之后 是否关闭键盘
                          afterAutoClose={params && params.afterAutoClose}  //自动关闭键盘后的回调
                          maskClosable={params && params.maskClosable} //点击空白处是否关闭键盘
                          callback = { params && params.callback}/>,
            NumberKeypad.instance
        )
    }

    static close(params) {
        if (NumberKeypad.instance) {
            var unmountResult = ReactDOM.unmountComponentAtNode(NumberKeypad.instance);
            if (unmountResult && NumberKeypad.instance.parentNode) {
                NumberKeypad.instance.parentNode.removeChild(NumberKeypad.instance);
                NumberKeypad.instance = null;
            }
        }
    }

}