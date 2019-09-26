import React, { Component } from 'react';
import '../style/selectgoods.less'
import withKeypad from '@/common/components/keypad';
import NumberKeypad from '@/common/components/numberKeypad/index.js';
import message from '@/common/components/message';
import intl from 'react-intl-universal';
import { Modal, Button, Icon, Input,DatePicker  } from 'antd';
import moment from 'moment';
import { Fetch } from '@/fetch/';
import Url from '@/config/url.js';
import withKeyBoard from '@/common/components/keyBoard';
const dateFormat = 'YYYY/MM/DD';
const { MonthPicker, RangePicker } = DatePicker;
class Report extends Component {

    constructor(props) {
        super(props);
        this.state = {
            // 商品信息
            goodsInfo: [],
            startdate: moment().format('YYYY-MM-DD') + ' 00:00:00',
            enddate: moment().format('YYYY-MM-DD') + ' 23:59:59',
        }
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
        this.props.onCancel("report");
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
    //时间选择改变
    onChange=(dates, dateStrings)=> {
        this.setState({
            startdate: dateStrings[0] + ' 00:00:00',
            enddate: dateStrings[1] + ' 23:59:59',
        })
    }
    componentDidMount() {
        // this.props.bind({
        //     "35": () => {
        //         this.onCancel();
        //     },
        //     "36": () => {
        //         this.selectGoods();
        //     }
        // });
        this.getGoods();
    }
    render() {
        let { visible, onCancel } = this.props;
        console.log(this.props);
        let { select, goodsInfo,startdate,enddate } = this.state;
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
                        {/*{this.intlLocales('MENU_SELECTPRICE')}*/}
                        统计报表
                        {/*<img src={require('@/common/image/paytk_close.png')} alt="" onClick={this.onCancel} />*/}
                    </div>
                    <div className="content">
                        <div className="entry_data">
                            <input type="button" className="btn" value={this.intlLocales('BTN_SELECT')} onClick={this.selectDate} />
                            <RangePicker
                                className="date_picker"
                                popupStyle={{width: 600}}
                                onChange={this.onChange}
                                defaultValue={[moment(startdate, dateFormat), moment(enddate, dateFormat)]}
                                ranges={{
                                    Today: [moment(), moment()]
                                }}
                            />
                            {/*<div style={{ position: 'relative' }}>*/}
                            {/*    <Icon type="search" style={{ position: 'absolute', top: '11px', left: '25px', fontSize: '20px', zIndex: '100' }}*/}
                            {/*          onClick={() => this.openKeypad('barcode', 200)} />*/}
                            {/*    <Input className="inp" name="barcode"*/}
                            {/*           value={this.state.barcode}*/}
                            {/*           autoFocus={true}*/}
                            {/*           onChange={this.onChange.bind(this)}*/}
                            {/*           onKeyDown={this.onInputKeyDown} />*/}
                            {/*</div>*/}
                            {/*<span>{this.intlLocales('SCAN_CODE')}</span>*/}
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
                                    <div className={'form_sel_son_name'}>销售笔数</div>
                                    <div className={'form_sel_son_detail'}>{goodsInfo?goodsInfo.lsxsCount:0}</div>
                                    <div className={'form_sel_son_name'} style={{borderLeft:"1px solid black"}}>销售金额</div>
                                    <div className={'form_sel_son_detail'}>{goodsInfo?goodsInfo.lsxsMoneySum:0}</div>
                                </div>
                                <div className={'form_sel_son'}>
                                    <div className={'form_sel_son_name'}>退款笔数</div>
                                    <div className={'form_sel_son_detail'}>{goodsInfo?goodsInfo.lsthCount:0}</div>
                                    <div className={'form_sel_son_name'} style={{borderLeft:"1px solid black"}}>退款金额</div>
                                    <div className={'form_sel_son_detail'}>{goodsInfo?goodsInfo.lsthMoneySum:0}</div>
                                </div>
                                <div className={'form_sel_son'}>
                                    <div className={'form_sel_son_name'}>红冲笔数</div>
                                    <div className={'form_sel_son_detail'}>{goodsInfo?goodsInfo.hcxsCount:0}</div>
                                    <div className={'form_sel_son_name'} style={{borderLeft:"1px solid black"}}>红冲金额</div>
                                    <div className={'form_sel_son_detail'}>{goodsInfo?goodsInfo.hcxsMoneySum:0}</div>
                                </div>
                                {/*<div className={'form_sel_son'}>*/}
                                {/*<div className={'form_sel_son_name'}>{this.intlLocales('SCAN_ORIGINALPRICE')}</div>*/}
                                {/*<div className={'form_sel_son_detail'}>{goodsInfo.unitprice}</div>*/}
                                {/*</div>*/}
                                <div className={'form_sel_son'}>
                                    <div className={'form_sel_son_name'}>取消笔数</div>
                                    <div className={'form_sel_son_detail'}>{goodsInfo?goodsInfo.hcthCount:0}</div>
                                    <div className={'form_sel_son_name'} style={{borderLeft:"1px solid black"}}>取消金额</div>
                                    <div className={'form_sel_son_detail'}>{goodsInfo?goodsInfo.hcthMoneySum:0}</div>
                                </div>
                                <div className={'form_sel_son'} style={{borderBottom:"none"}}>
                                    <div className={'form_sel_son_name'}>损益金额</div>
                                    <div className={'form_sel_son_detail'}>{goodsInfo?goodsInfo.overage:0}</div>
                                    <div className={'form_sel_son_name'} style={{borderLeft:"1px solid black"}}>找零金额</div>
                                    <div className={'form_sel_son_detail'}>{goodsInfo?goodsInfo.changeValue:0}</div>
                                </div>
                            </div>
                        </div>

                    </div>
                    {/*<div className={"foot"} style={{display:"flex",justifyContent:"space-around",marginTop:"30px"}}>*/}
                    {/*   <div >*/}
                    {/*       <span style={{marginRight:"50px"}}>应收金额:</span><span>20</span>*/}
                    {/*   </div>*/}
                    {/*    <div>*/}
                    {/*        <span style={{marginRight:"50px"}}>实收金额:</span><span>30</span>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                    <div className="foot">
                    </div>
                </div>
            </Modal>
        )
    }

    selectDate = () => {
        this.getGoods();
    }

    getInitialState = () => {
        console.log(1);
    }

    getGoods = () => {
        let req = {
            command_id: "SALESSTATISTICS",
            startTime: this.state.startdate, //开始时间
            endTime: this.state.enddate,  //结束时间
            terminalNo: this.props.initialState.syjh,  //收银机号
            terminalOperator: this.props.operators && this.props.operators.cardno, //操作员
            shopCode: this.props.initialState.mkt,//门店编号
            erpCode: this.props.initialState.jygs, //经营公司
            // erpCode: this.props.initialState.jygs,

        };
        Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then(res => {
            console.log(res);
            if (res.retflag === '0') {
                console.log(res)
                let goodsList = res.salesList[0];
                console.log(goodsList);
                this.setState({
                    goodsInfo: goodsList,
                })
            } else {
                message(res.retmsg);
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

export default withKeyBoard(Report);