import React, { Component } from 'react';
import { Row, Col, Button } from 'antd';
import '../style/Keypad.less';

//小键盘
export default class Keypad extends Component {
    componentDidMount() {

    }

    componentWillUnmount() {

    }

    render() {
        let { keyEvent, style } = this.props;
        return (
            <div style={style} className="keyPad">
                <div className="keyPad_le">
                    <Button value="7" onMouseDown={keyEvent}>7</Button>
                    <Button value="8" onMouseDown={keyEvent}>8</Button>
                    <Button value="9" onMouseDown={keyEvent}>9</Button>
                    <Button value="4" onMouseDown={keyEvent}>4</Button>
                    <Button value="5" onMouseDown={keyEvent}>5</Button>
                    <Button value="6" onMouseDown={keyEvent}>6</Button>
                    <Button value="1" onMouseDown={keyEvent}>1</Button>
                    <Button value="2" onMouseDown={keyEvent}>2</Button>
                    <Button value="3" onMouseDown={keyEvent}>3</Button>
                    <Button value="+-" onMouseDown={keyEvent}>+-</Button>
                    <Button value="0" onMouseDown={keyEvent}>0</Button>
                    <Button value="." onMouseDown={keyEvent}>.</Button>
                </div>
                <div className="keyPad_ri">
                    <Button className="clear_button" value="/" onMouseDown={keyEvent}>清空</Button>
                    <Button className="back_button" value="," onMouseDown={keyEvent}>后退</Button>
                    <Button className="ok_button" value="?" onMouseDown={keyEvent}>确定</Button>
                </div>
            </div>
        );
    }
}