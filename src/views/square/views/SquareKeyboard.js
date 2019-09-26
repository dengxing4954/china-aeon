import React, {Component} from 'react';
import {Fetch} from '@/fetch/';
import {Row, Col} from 'antd';

class SquareKeyboard extends React.Component {

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    constructor(props) {
        super(props);
        this.state = {
            goodsnumber: '',
        };
    }

    add = (num) => {
        this.setState({
            goodsnumber: this.state.goodsnumber + num,
        })
    }

    onInputKeyDown = (e) => {
        if(e.keyCode === 13) {
            this.props.goodsfindsubmit(this.state.goodsnumber)
        }
    }

    onInputChange = (e) => {
        this.setState({
            goodsnumber: e.target.value
        });
    }

    del = () => {
        var delN = this.state.goodsnumber;
        delN = delN.substr(0, delN.length - 1);
        this.setState({
            goodsnumber: delN,
        })
    }

    clear = () => {
        this.setState({
            goodsnumber: '',
        })
    }

    render() {
        let {goodsnumber} = this.state;
        const {keyboardControl, goodsfindsubmit, intl} = this.props;
        return (
            <div className={'square_modal'}>
                <div className={'square_modal_bg'}></div>
                <div className={'square_modal_box square_modal_boxk'}>
                    <div className={'smodal_box_top'}>
                        <div className={'smodal_box_close'}
                             onClick={keyboardControl}>
                        </div>
                    </div>
                    <div className={'square_keyboard'}>
                        <input className={'square_keyboard_input'} placeholder={intl("INFO_IPTGOODSNO")}
                               value={this.state.goodsnumber} 
                               autoFocus={true}
                               onKeyDown={this.onInputKeyDown}
                               onChange={this.onInputChange}/>
                        <div className={'square_keyboard_box'}>
                            <Row className={'square_keyboard_input_num'}>
                                <Row>
                                    <Col span={8} className={'square_keyboard_input_num_son'}
                                         onClick={this.add.bind(this, '7')}>7</Col>
                                    <Col span={8} className={'square_keyboard_input_num_son'}
                                         onClick={this.add.bind(this, '8')}>8</Col>
                                    <Col span={8} className={'square_keyboard_input_num_son'}
                                         onClick={this.add.bind(this, '9')}>9</Col>
                                </Row>
                                <Row>
                                    <Col span={8} className={'square_keyboard_input_num_son'}
                                         onClick={this.add.bind(this, '4')}>4</Col>
                                    <Col span={8} className={'square_keyboard_input_num_son'}
                                         onClick={this.add.bind(this, '5')}>5</Col>
                                    <Col span={8} className={'square_keyboard_input_num_son'}
                                         onClick={this.add.bind(this, '6')}>6</Col>
                                </Row>
                                <Row>
                                    <Col span={8} className={'square_keyboard_input_num_son'}
                                         onClick={this.add.bind(this, '1')}>1</Col>
                                    <Col span={8} className={'square_keyboard_input_num_son'}
                                         onClick={this.add.bind(this, '2')}>2</Col>
                                    <Col span={8} className={'square_keyboard_input_num_son'}
                                         onClick={this.add.bind(this, '3')}>3</Col>
                                </Row>
                                <Row>
                                    <Col span={16} className={'square_keyboard_input_num_son'}
                                         onClick={this.add.bind(this, '0')}>0</Col>
                                    <Col span={8} className={'square_keyboard_input_num_son'}
                                         onClick={this.add.bind(this, '00')}>00</Col>
                                </Row>
                            </Row>
                            <div className={'square_keyboard_input_num_fn'}>
                                <div className={'square_keyboard_input_num_fn_son'} onClick={this.del.bind(this)}>
                                    <div className={'square_keyboard_input_num_fn_i'}></div>
                                </div>
                                <div className={'square_keyboard_input_num_fn_son'} onClick={this.clear.bind(this)}>{intl("BTN_EMPTY")}
                                </div>
                                <div className={'square_keyboard_input_num_fn_son square_keyboard_input_num_fn_sonex'}
                                     onClick={() => goodsfindsubmit(goodsnumber)}>{intl("BTN_CONFIRM")}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}


export default SquareKeyboard;