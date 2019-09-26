import React from 'react';
import ReactDOM from 'react-dom';
import Keypad from './views/Keypad';

//小键盘
class KeyPad {
    static instance;
    static width = 348;

    static open({ key, target, postion }) {
        if (KeyPad.instance) return;
        KeyPad.instance = document.createElement('div');
        document.body.appendChild(KeyPad.instance);
        let rect = target.getBoundingClientRect();
        let style;
        switch (postion) {
            case "left":
                style = { top: (rect.top) + "px", left: (rect.left - KeyPad.width - 10) + "px" };
                break;
            case "right":
                style = { top: (rect.top) + "px", left: (rect.left + rect.width + 10) + "px" };
                break;
            case "bottomLeft":
                style = { top: (rect.top - 324 + rect.height) + "px", left: (rect.left - KeyPad.width - 10) + "px" };
                break;
            default:
                style = { top: (rect.top + rect.height + 25) + "px", left: rect.left + "px" };
                break;
        }
        ReactDOM.render(
            <Keypad style={style} keyEvent={(event) => {
                if (key) {
                    let value;
                    switch (event.target.value) {
                        case ",":
                            value = target.value.slice(0, target.value.length - 1);
                            break;
                        case "/":
                            value = '';
                            break;
                        case "+-":
                            if (!target.minus) {
                                target.minus = true;
                                value = "-" + target.value;
                            } else {
                                target.minus = false;
                                value = target.value.slice(1);
                            }
                            break;
                        case "?":
                            value = "close";
                            break;
                        default:
                            value = target.value + event.target.value;
                            break;
                    }
                    key(value);
                }
            }} cancel={KeyPad.close}></Keypad>,
            KeyPad.instance
        )
    }

    static close() {
        if (KeyPad.instance) {
            let unmountResult = ReactDOM.unmountComponentAtNode(KeyPad.instance);
            if (unmountResult && KeyPad.instance.parentNode) {
                KeyPad.instance.parentNode.removeChild(KeyPad.instance);
                KeyPad.instance = null;
            }
        }
    }

}

export default function withKeypad(Compont) {
    return class extends React.Component {
        constructor(props) {
            super(props);
            this.focusInstance = null;
            this.focusFlag = false;
        }
        componentDidMount() {
            if (KeyPad.instance) KeyPad.close();
        }
        componentWillUnmount() {
            KeyPad.close();
        }

        render() {
            return <Compont focus={this.focus} blur={this.blur} keyPadClose={this.keyPadClose} inputBind={this.inputBind} {...this.props}></Compont>
        }

        focus = ({ target }, setValue, postion) => {
            if (!target.value) {
                target.minus = false;
            }
            let key = target.name;
            KeyPad.open({
                key: (value) => {
                    if (value == "close") return;
                    this.keypadFlag = true;
                    setValue({ [key]: value });
                },
                target,
                postion
            });
        }

        blur = ({ target }) => {
            if (this.keypadFlag) {
                target.focus();
                this.keypadFlag = false;
                return;
            }
            KeyPad.close();
        }

        click = ({ target }, setValue, postion) => {
            if (this.focusInstance != target) {
                console.log(target);
                KeyPad.close();
                if (!target.value) {
                    target.minus = false;
                }
                let key = target.name;
                KeyPad.open({
                    key: (value) => {
                        if (value == "close") {
                            target.className = "";
                            return !this.focusFlag && this.keyPadClose();
                        }
                        this.keypadFlag = true;
                        setValue({ [key]: value });
                    },
                    target,
                    postion
                });
                this.focusInstance && (this.focusInstance.className = "");
                target.className = "focus";
                this.focusInstance = target;
            }
        }

        keyPadClose = () => {
            this.focusInstance && (this.focusInstance.className = "");
            this.focusInstance = null;
            KeyPad.close();
        }

        inputBind = (setValue, style, focusFlag = false) => {
            this.focusFlag = focusFlag;
            return this.focusFlag ? { onBlur: this.blur, onFocus: (event) => this.focus(event, setValue, style) } : { readOnly: true, onFocus: (event) => this.click(event, setValue, style) };
        }
    }
}
