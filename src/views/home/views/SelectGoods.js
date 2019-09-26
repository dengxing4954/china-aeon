import React, { Component } from 'react';
import '../style/selectprice.less'
import intl from 'react-intl-universal';
import NumberKeypad from '@/common/components/numberKeypad/index.js';
import { Modal, Button, Icon, Input } from 'antd';
import message from '@/common/components/message';
import withKeypad from '@/common/components/keypad';
import { Fetch } from '@/fetch/';
import withKeyBoard from '@/common/components/keyBoard';

class SelectGoods extends Component {

    state = {
        barcode: '',
        shopstocklist: [],
        select: false
    }

    setValue = (value) => {
        this.setState(value);
    }

    intlLocales = (key) => {
        return intl.get(key);
    }

    onCancel = () => {
        this.setState({
            shopstocklist: [],
            barcode: '',
            select: false
        });
        this.props.onCancel("goodsModal");
    }

    onChange = (e) => {
        e.preventDefault();
        this.setState({
            barcode: e.target.value
        })
    }

    afterClose = () => {
        if (this.props.focusInput) {
            document.getElementById('codeInput').focus();
        }
    }

    onInputKeyDown = (e) => {
        if (e.keyCode === 13) {
            const { barcode } = this.state;
            this.getInventory()
        }
    }

    openKeypad = (name, left) => {
        NumberKeypad.open({
            top: 120,
            left: left,
            autoClose: true,
            onInput: (value) => {
                let _value = this.state[name];
                this.setState({
                    [name]: _value + value
                });
            },
            onBack: () => {
                let value = this.state[name];
                this.setState({
                    [name]: value.substring(0, value.length - 1)
                });
            },
            onClear: () => {
                this.setState({
                    [name]: ''
                });
            },
            onCancel: () => {
                this.setState({
                    [name]: '',
                    //[name + 'Input']: false
                });
            },
            onOk: () => {
                if (this.state[name] === '') {
                    return false
                }
                return Promise.resolve(this.getInventory())
            },
        })
    }

    componentDidMount() {
        this.props.bind({
            "35": () => {
                this.onCancel();
            },
            "36": () => {
                this.getInventory();
            }
        });
    }


    render() {
        let { visible, onCancel } = this.props;
        return (
            <Modal
                className="selectgoods"
                title={null}
                visible={visible}
                closable={false}
                maskClosable={false}
                footer={<Button onClick={this.onCancel}>取消</Button>}
                mask={true}
                width={600}
                style={{
                    position: 'absolute',
                    margin: 'auto',
                    top: -350,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    width: '50%',
                    height: '50%'
                }}
                bodyStyle={{ margin: 0, padding: 0 }}
                destroyOnClose={true}
                afterClose={this.afterClose}
            >
                <div>
                    <div className="head">
                        {this.intlLocales('SELECTGOODS_FINDGOODS')}
                        {/*<img src={require('@/common/image/paytk_close.png')} alt="" onClick={this.onCancel}/>*/}
                    </div>
                    <div className="content">
                        <div className="entry_data">
                            <span>{this.intlLocales('SCAN_CODE')}:</span>
                            <div style={{ position: 'relative' }}>
                                <Icon type="search" style={{ position: 'absolute', top: '11px', left: '10px', fontSize: '20px', zIndex: '100' }}
                                    onClick={() => this.openKeypad('barcode', -80)} />
                                <Input className="inp" name="barcode"
                                    value={this.state.barcode}
                                    autoFocus={true}
                                    onChange={this.onChange.bind(this)}
                                    onKeyDown={this.onInputKeyDown} />
                            </div>
                            <input type="button" className="btn" value={this.intlLocales('BTN_SELECT')} onClick={this.getInventory} />
                        </div>
                        {
                            this.state.select ?
                                <div>
                                    <div style={{ margin: '10px 10px 0 10px', fontSize: '18px' }}>
                                        {this.intlLocales('PRODUCT_NAME')} : {this.state.shopstocklist.length !== 0 ? this.state.shopstocklist[0].fname : ''}
                                    </div>
                                    <div style={{ margin: '10px 10px 0 10px', fontSize: '18px' }}>
                                        {this.intlLocales('COMMODITY_CODE')} : {this.state.shopstocklist.length !== 0 ? this.state.shopstocklist[0].barcode : ''}
                                    </div>
                                </div> : null
                        }
                        <div className="list">
                            <table className="table">
                                <thead>
                                    <tr>
                                        {/* <th>{this.intlLocales('PRODUCT_NAME')}</th>
                                    <th>{this.intlLocales('COMMODITY_CODE')}</th> */}
                                        <th>{this.intlLocales('STORE')}</th>
                                        <th>{this.intlLocales('SELECTGOODS_ABBREVIATION')}</th>
                                        <th>{this.intlLocales('SELECTGOODS_STOCK')}</th>
                                        <th>{this.intlLocales('SELECTGOODS_TOTALSTOCK')}</th>
                                    </tr>
                                </thead>
                                {
                                    this.state.select ?
                                        <tbody>
                                            {this.state.shopstocklist.map((item, key) =>
                                                <tr className="td" key={key}>
                                                    {/* <td>{item.fname}</td>
                                                <td>{item.barcode}</td> */}
                                                    <td>{item.mkt}</td>
                                                    <td>{item.shopSName}</td>
                                                    <td>{item.salestock}</td>
                                                    <td>{item.totalstock}</td>
                                                </tr>
                                            )}
                                        </tbody> : null
                                }
                            </table>
                            {this.state.select ? null : <div className="no_data">暫無數據</div>}
                        </div>
                    </div>
                    <div className="foot">
                        {/*<input type="button" className="btn" value="關 閉" onClick={onCancel}/>*/}
                    </div>
                </div>
            </Modal>
        )
    }

    getInventory = () => {
        if (this.state.barcode == '') {
            message('请输入商品条码!');
            return false;
        }
        this.setState({
            select: true
        })

        let req = {
            "shopCode": this.props.initialState.mkt,
            "barNo": this.state.barcode,
            "gz": "1",
            "entId": this.props.initialState.entid,
            "terminalNo": this.props.initialState.syjh,
            "erpCode": this.props.initialState.jygs,
            "command_id": "MMBECERTIFY",
            "terminalOperator": this.props.operators && this.props.operators.gh 
        }
        this.props.findInventory(req).then(res => {
            if (res) {
                this.setState({
                    shopstocklist: res.shopstocklist,
                    barcode: ''
                })
                if (res.shopstocklist.length === 0) {
                    message('暫無此商品數據')
                }
            }
        })
        this.setState({ barcode: '' })
    }
}

export default withKeyBoard(SelectGoods);