import React, {Component} from 'react';
import moment from 'moment';
import '../style/easypay.less'
import {Modal, Button} from 'antd';
import intl from 'react-intl-universal';
import withKeyBoard from '@/common/components/keyBoard';
import EventEmitter from '@/eventemitter';

class EasyPay extends Component {

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.props.bind({
            //end
            "35": () => {this.props.close()},
            // //home
            // "36": () => {this.fastPay('11111')},
        });
    }

    componentDidMount() {
        EventEmitter.on('Scan', this.fastPay );
    }

    componentWillUnmount () {
        EventEmitter.off('Scan', this.fastPay );
    }

    componentWillReceiveProps(nextProps) {
        //打开
        /*if(this.props.visible === false && nextProps.visible === true ) {
            EventEmitter.on('Scan', this.fastPay );
        }*/
        /*if(this.props.visible === true && nextProps.visible === false ) {

        }*/
    }

    fastPay = (value) => {
        const { onOk, close} = this.props;
        if(onOk) {
            let onOkFn = onOk(value);
            if(onOkFn && onOkFn.constructor === Promise.prototype.constructor) {
                onOkFn.then((res) => {
                    if(res) {
                        close();
                    }
                })
            } else if(onOkFn === false) {
                return;
            } else {
                close();
            }
            return;
        }
        close();
    }

    onCancel = () => {
        if(this.props.onCancel) {
            this.props.onCancel()
        }
        this.props.close();
    }

    /*fastPay = (qrcode, flow_no) => {
        let {params, fastPay} = this.props;
        let parameter = {
            mkt: params.initialState.mkt,
            syjh: params.initialState.syjh,
            flow_no: flow_no,
            qrcode: '12345678901234560010060142290100000001092082201001399',
            search: "1",
            gz: "1",
            jygs: params.initialState.jygs,
            operators: params.operators && params.operators.cardno,
        };
        fastPay(parameter).then(res => {
            if(res) {
                let currentLocation = this.props.history.getCurrentLocation();
                if(currentLocation.pathname === "/home") {
                    this.props.history.push({
                        pathname: '/presale',
                        query: {djlb: 'fast', flow_no: flow_no}
                    });
                }
            }
        })
    }*/

    afterClose = () => {
        EventEmitter.off('Scan', this.fastPay );
        document.getElementById('codeInput').focus();
    }

    render() {
        const { title} = this.props;
        return (
            <Modal
                title={null}
                visible={true}
                closable={false}
                maskClosable={false}
                footer={
                    <Button onClick={this.onCancel}>取消</Button>
                }
                mask={true}
                width={400}
                style={{
                    position: 'absolute',
                    margin: 'auto',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    width: '50%',
                    height: '50%'
                }}
                bodyStyle={{margin: 0, padding: 0}}
                className="easypay"
                afterClose={this.afterClose}
                destroyOnClose={true}
            >
                <div>
                    <div className="head">
                        {/*intl.get("MENU_EASYPAY")*/}
                        {title}
                    </div>
                    <div className="content">
                        <div className="msg">
                            {intl.get("PLACEHOLDER_EASYPAY")}
                        </div>
                    </div>
                    <input type="text" style={{visibility: 'hidden'}}/>
                </div>
            </Modal>
        )
    }
}

export default withKeyBoard(EasyPay);