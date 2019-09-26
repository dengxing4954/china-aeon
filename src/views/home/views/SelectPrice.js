import React, { Component } from 'react';
import '../style/selectgoods.less'
import withKeypad from '@/common/components/keypad';
import NumberKeypad from '@/common/components/numberKeypad/index.js';
import message from '@/common/components/message';
import intl from 'react-intl-universal';
import { Modal, Button, Icon, Input } from 'antd';
import { Fetch } from '@/fetch/';
import Url from '@/config/url.js';
import withKeyBoard from '@/common/components/keyBoard';

class SelectPrice extends Component {

    constructor(props) {
        super(props);
        this.state = {
            select: false,
            // 商品条码
            barcode: '',
            // 商品信息
            goodsInfo: []
        }
    }

    onChange = (e) => {
        e.preventDefault();
        this.setState({
            barcode: e.target.value
        })
    }

    intlLocales = (key) => {
        return intl.get(key);
    }

    setValue = (value) => {
        this.setState(value);
    }

    clearData = () => {
        this.setState({
            barcode: '',
            // 商品信息
            goodsInfo: []
        })
    }

    onCancel = () => {
        this.clearData();
        this.props.onCancel("priceModal");
    }

    onInputKeyDown = (e) => {
        if (e.keyCode === 13) {
            const { barcode } = this.state;
            this.getGoods()
        }
    }

    afterClose = () => {
        if (this.props.focusInput) {
            document.getElementById('codeInput').focus();
        }
    }

    openKeypad = (name, left) => {
        NumberKeypad.open({
            top: 200,
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
                return Promise.resolve(this.getGoods())
            },
        })
    }

    componentDidMount() {
        this.props.bind({
            "35": () => {
                this.onCancel();
            },
            "36": () => {
                this.selectGoods();
            }
        });
    }

    render() {
        let { visible, onCancel } = this.props;
        let { select, goodsInfo } = this.state;
        return (
            <Modal
                className="selectprice"
                title={null}
                visible={visible}
                closable={false}
                maskClosable={false}
                footer={<Button onClick={this.onCancel}>取消</Button>}
                mask={true}
                width={800}
                wrapClassName="vertical-center-modal"
                bodyStyle={{ margin: 0, padding: 0 }}
                destroyOnClose={true}
                afterClose={this.afterClose}
            >
                <div className="selectprice">
                    <div className="head">
                        {this.intlLocales('MENU_SELECTPRICE')}
                        {/*<img src={require('@/common/image/paytk_close.png')} alt="" onClick={this.onCancel} />*/}
                    </div>
                    <div className="content">
                        <div className="entry_data">
                            <input type="button" className="btn" value={this.intlLocales('BTN_SELECT')} onClick={this.selectGoods} />
                            <div style={{ position: 'relative' }}>
                                <Icon type="search" style={{ position: 'absolute', top: '11px', left: '25px', fontSize: '20px', zIndex: '100' }}
                                    onClick={() => this.openKeypad('barcode', 200)} />
                                <Input className="inp" name="barcode"
                                    value={this.state.barcode}
                                    autoFocus={true}
                                    onChange={this.onChange.bind(this)}
                                    onKeyDown={this.onInputKeyDown} />
                            </div>
                            <span>{this.intlLocales('SCAN_CODE')}</span>
                        </div>
                        {/*<div className="title">*/}
                        {/*<table>*/}
                        {/*<thead>*/}
                        {/*<tr>*/}
                        {/*<th>条码</th>*/}
                        {/*<th>商品名称</th>*/}
                        {/*<th>原零售价</th>*/}
                        {/*<th>应收金额</th>*/}
                        {/*<th>可售数量</th>*/}
                        {/*<th>活动</th>                                        */}
                        {/*</tr>*/}
                        {/*</thead>*/}
                        {/*</table>*/}
                        {/*</div>*/}
                        {/*<div className="list">*/}
                        {/*{*/}
                        {/*select ?*/}
                        {/*<table className="table">*/}
                        {/*<tbody>*/}
                        {/*{*/}
                        {/*this.state.goodsInfo.map((item, k) =>*/}
                        {/*<tr key={k}>*/}
                        {/*<td>{item.barcode}</td>*/}
                        {/*<td>{item.fname}</td>*/}
                        {/*<td>{item.unitprice}</td>*/}
                        {/*<td>{item.total}</td>*/}
                        {/*<td>{item.stock}</td>*/}
                        {/*<td>{item.pop_details.length !==0 ?  item.pop_details[0].pop_describe : ''}</td>                                                        */}
                        {/*</tr>*/}
                        {/*)*/}
                        {/*}*/}
                        {/*</tbody>*/}
                        {/*</table> :*/}
                        {/*<div className="tip">*/}
                        {/*<div>当前查询结果为空</div>*/}
                        {/*</div>*/}
                        {/*}*/}
                        {/*</div>*/}
                        <div className={'selectprice_select_from'}>
                            <div className={'form_sel'}>
                                <div className={'form_sel_son'}>
                                    <div className={'form_sel_son_name'}>{this.intlLocales('SCAN_GOODSCODE')}</div>
                                    <div className={'form_sel_son_detail'}>{goodsInfo.goodsCode}</div>
                                </div>
                                <div className={'form_sel_son'}>
                                    <div className={'form_sel_son_name'}>{this.intlLocales('SCAN_BARCODE')}</div>
                                    <div className={'form_sel_son_detail'}>{goodsInfo.barNo}</div>
                                </div>
                                <div className={'form_sel_son'}>
                                    <div className={'form_sel_son_name'}>{this.intlLocales('SCAN_GOODSNAME')}</div>
                                    <div className={'form_sel_son_detail'}>{goodsInfo.goodsName}</div>
                                </div>
                                {/*<div className={'form_sel_son'}>*/}
                                {/*<div className={'form_sel_son_name'}>{this.intlLocales('SCAN_ORIGINALPRICE')}</div>*/}
                                {/*<div className={'form_sel_son_detail'}>{goodsInfo.unitprice}</div>*/}
                                {/*</div>*/}
                                <div className={'form_sel_son'}>
                                    <div className={'form_sel_son_name'}>{this.intlLocales('SCAN_FINALPRICE')}</div>
                                    <div className={'form_sel_son_detail'}>{goodsInfo.salePrice}</div>
                                </div>
                                <div className={'form_sel_son'}>
                                    <div className={'form_sel_son_name'}>會員價</div>
                                    <div className={'form_sel_son_detail'}>{goodsInfo.length !== 0 ? goodsInfo.listPrice - goodsInfo.customDiscountValue : ''}</div>
                                </div>
                                <div className={'form_sel_son'}>
                                    <div className={'form_sel_son_name'}>非會員價</div>
                                    <div className={'form_sel_son_detail'}>{goodsInfo.listPrice}</div>
                                </div>
                                <div className={'form_sel_son form_sel_sonex'}>
                                    <div className={'form_sel_son_name form_sel_son_ex'}>{this.intlLocales('SCAN_DETAILS')}</div>
                                    <div className={'form_sel_son_detail_ex'}>{goodsInfo.length !== 0 && goodsInfo.popDetails ? goodsInfo.popDetails.map((val, idx) =>
                                        <p>{`${val.pop_describe} (${val.staDate}~${val.endDate})`}</p>
                                    ) : ''}</div>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="foot">
                    </div>
                </div>
            </Modal>
        )
    }

    selectGoods = () => {
        if (this.state.barcode == '') {
            message('请输入商品条码!');
            return false;
        }
        this.getGoods();
        this.setState({ select: true });
    }

    getInitialState = () => {
        console.log(1);
    }

    getGoods = () => {
        let req = {
            command_id: "REFCERTIFY",
            terminalOperator: this.props.operators && this.props.operators.cardno,
            shopCode: this.props.initialState.mkt,
            terminalNo: this.props.initialState.syjh,
            yyyh: "12313",
            barNo: this.state.barcode,
            // "2000009292985"
            entId: this.props.initialState.entid,
            gz: "",
            erpCode: this.props.initialState.jygs,
            precision: 1,
            isdzcm: "N",
            channel: 'javapos'
        };
        Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then(res => {
            if (res.returncode === '0') {
                let {goodsList} = res.data
                this.setState({
                    goodsInfo: goodsList[0],
                })
            } else {
                message(res.data);
            }
        })
        this.setState({ barcode: '' })
    }
}

// const goodsInfo = [{
//     barNo: '01525245526', goodsName: '可口可乐', listPrice: 3, qty: 220, storeName: '尖沙咀', flex: 1
// }, {
//     barNo: '01525245526', goodsName: '可口可乐', listPrice: 3, qty: 220, storeName: '尖沙咀', flex: 1
// }, {
//     barNo: '01525245526', goodsName: '可口可乐', listPrice: 3, qty: 220, storeName: '尖沙咀', flex: 1
// }, {
//     barNo: '01525245526', goodsName: '可口可乐', listPrice: 3, qty: 220, storeName: '尖沙咀', flex: 1
// },
//     {
//         barNo: '01525245526', goodsName: '可口可乐', listPrice: 3, qty: 220, storeName: '尖沙咀', flex: 1
//     }, {
//         barNo: '01525245526', goodsName: '可口可乐', listPrice: 3, qty: 220, storeName: '尖沙咀', flex: 1
//     }, {
//         barNo: '01525245526', goodsName: '可口可乐', listPrice: 3, qty: 220, storeName: '尖沙咀', flex: 1
//     }, {
//         barNo: '01525245526', goodsName: '可口可乐', listPrice: 3, qty: 220, storeName: '尖沙咀', flex: 1
//     },
//     {
//         barNo: '01525245526', goodsName: '可口可乐', listPrice: 3, qty: 220, storeName: '尖沙咀', flex: 1
//     }, {
//         barNo: '01525245526', goodsName: '可口可乐', listPrice: 3, qty: 220, storeName: '尖沙咀', flex: 1
//     }, {
//         barNo: '01525245526', goodsName: '可口可乐', listPrice: 3, qty: 220, storeName: '尖沙咀', flex: 1
//     }, {
//         barNo: '01525245526', goodsName: '可口可乐', listPrice: 3, qty: 220, storeName: '尖沙咀', flex: 1
//     }]

export default withKeyBoard(SelectPrice);