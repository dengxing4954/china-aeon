/* eslint-disable default-case */
import React, { Component } from 'react';
import moment from 'moment'

const dlNoDataIcon = require('@/common/image/dlnodata.png');

class Displayline extends Component {
    constructor(props) {
        super(props);
        this.state = {
            time: moment().format('YYYY-MM-DD HH:mm:ss'),
        }
        this.timer = null;
    }
    componentDidMount() {
        this.timer = setInterval(() => {
            this.setState({
                time: moment().format('YYYY-MM-DD HH:mm:ss')
            })
        }, 1000)
    }
    componentWillUnmount() {
        this.timer && clearInterval(this.timer)
    }

    cardNo = () => {
        let memberData = {};
        if (this.props.order.consumersData && this.props.order.consumersData.consumersCard) {
            memberData = this.props.order.consumersCard;
        }
        if (JSON.stringify(memberData) === '{}') {
            memberData.consumersCard = '';
        }
        let cardNo = memberData.consumersCard;
        if (cardNo.length === 11) {
            return cardNo.substr(0, 3) + "****" + cardNo.substr(7, 4);
        } else {
            return cardNo;
        }
    }

    lastgoodsMoney = (type) => {
        let goodsList = this.props.order.goodsList || '';
        if (goodsList) {
            if (goodsList.length === 0) {
                return 0.00;
            } else {
                let goods = goodsList[goodsList.length - 1];
                return goods[type]
            }
        } else {
            return 0.00
        }
    }

    renderDisplay = (data) => {
        switch (data) {
            case '1':
                return (
                    <div>
                        <div className="displayline_top">
                            <ul className="goods-list">
                                {
                                    this.props.order.goodsList ? this.props.order.goodsList.map((item, index) => {
                                        return (
                                            <li key={index} className="goods-list-item">
                                                <p>{item.goodsName}</p>
                                                <div className="goods-list-item-price-qty">
                                                    <span className="spanName">{item.saleSpec ? item.saleSpec : '500ml/瓶'}</span>
                                                    <span className="spanNum">x{item.qty}</span>
                                                    <span className="spanDiscount">{item.totalDiscountValue}</span>
                                                    <span className="spanPrice">￥{item.saleValue}</span>
                                                </div>
                                                <div className="goods-list-item-popdetails">
                                                    {
                                                        item.popDetails && item.popDetails.map((popdetails, index) => {
                                                            return (
                                                                <div>
                                                                    <span>
                                                                        {popdetails.popDescribe}
                                                                    </span>
                                                                </div>
                                                            )
                                                        })
                                                    }
                                                </div>

                                            </li>
                                        )
                                    }) :
                                        <li className="no-goods">
                                            <img src={dlNoDataIcon} alt="" />
                                        </li>

                                }

                            </ul>
                        </div>
                        <div className='displayline_bottom'>
                            <div className="displayline_info">
                                <div>
                                    <ul>
                                        <li><span>会员号：</span><span>{this.cardNo()}</span></li>
                                        <li><span>妈咪卡：</span><span>否</span></li>
                                        <li><span>会员积分：</span><span>{this.props.order.totalPoint ? this.props.order.totalPoint : 0}</span></li>
                                        <li><span>折现金额：</span><span>￥{this.props.order.memberDiscAmount ? this.props.order.memberDiscAmount : 0.00}</span></li>
                                    </ul>
                                </div>
                                <div>
                                    <ul>
                                        <li><span>小计：</span><span className="goods-item-saleValue">￥{this.lastgoodsMoney('saleValue')}</span></li>
                                        <li><span>优惠：</span><span className="goods-item-discountValue">￥{this.lastgoodsMoney('totalDiscountValue')}</span></li>
                                    </ul>
                                    <div>
                                        <span>合计：</span>
                                        <span>￥{this.props.order.saleValue ? this.props.order.saleValue : 0.00}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="displayline_date">
                                <span className="span1">收银台:&nbsp;&nbsp;&nbsp;{this.props.initialState.syjh}</span>
                                <span className="span2">{this.state.time}</span>
                            </div>
                        </div></div>
                )
            case '2':
                return <div>  <div className="displayline_top">
                    <div className="displayline_img"><img src={require("@/common/imageYW/peopel.png")} alt="" /></div>
                    <div className="displayline_text"><p>请至其他收银台</p></div>
                </div>
                    <div className='displayline_bottom'>
                        <div className="displayline_info">
                            <div className="displayline_info1">
                                <div className="div_info">
                                    <span className="span_info1">会员号：</span>
                                    {/*<span className="span_info2"></span>*/}
                                </div>
                                <div className="div_info">
                                    <span className="span_info1">妈咪卡：</span>
                                    {/*<span className="span_info2"></span>*/}
                                </div>
                                <div className="div_info">
                                    <span className="span_info1">会员积分：</span>
                                    {/*<span className="span_info2"></span>*/}
                                </div>
                                <div className="div_info">
                                    <span className="span_info1">折现金额：</span>
                                    {/*<span className="span_info2"></span>*/}
                                </div>
                            </div>
                            <div className="displayline_info2">
                                <div className="div_info">
                                    <span className="span_info1">小计：</span>
                                    <span className="span_info2" style={{ fontSize: '16px', }}>￥0.00</span>
                                </div>
                                <div className="div_info">
                                    <span className="span_info1" >优惠：</span>
                                    <span className="span_info2" style={{ color: '#E8541E', fontSize: '16px', }}>￥0.00</span>
                                </div>
                                <div className="info_dash">
                                    {/*<span className="span_info1">小计</span>*/}
                                    {/*<span className="span_info2">￥3</span>*/}
                                </div>
                                <div className="div_info" style={{ display: "flex", justifyContent: "space-around", alignItems: 'center', marginTop: '17px' }}>
                                    <span className="span_info1" style={{ width: '42px', marginTop: '1px' }}>合计：</span>
                                    <span className="span_info2" style={{ color: "#B13B89", fontSize: '24px', marginTop: '1px' }}>￥0.00</span>
                                </div>
                            </div>
                        </div>
                        <div className="displayline_date">
                            <span className="span1">收银台:&nbsp;&nbsp;&nbsp;{this.props.initialState.syjh}</span>
                            <span className="span2">{this.state.time}</span>
                        </div>
                    </div></div>
            case '3':
                return <div>  <div className="displayline_top">
                    <div className="displayline_amount">
                        <span className="amount_pay">剩余应付￥</span> <span className="amount_money">68.88</span>
                    </div>
                    <div className="displayline_total">
                        <div className="displayline_total_left">
                            <span className="displayline_total_left_text1">总金额</span>
                            <span className="displayline_total_left_text2">￥345.00</span>
                        </div>
                        <div className="displayline_total_right">
                            <span className="displayline_total_right_text1">优惠(元)</span>
                            <span className="displayline_total_right_text2">￥-76.20</span>
                        </div>
                    </div>
                    <div className="displayline_listgoods">
                        <ul className="listgoods_ul">
                            <li className="listgoods_li">
                                <p className="listgoods_li_left">商品9.5折+双倍积分</p>
                                <p className="listgoods_li_right">-￥30.00</p>
                            </li>
                            <li className="listgoods_li">
                                <p className="listgoods_li_left">商品9.5折+双倍积分</p>
                                <p className="listgoods_li_right">-￥30.00</p>
                            </li>
                            <li className="listgoods_li">
                                <p className="listgoods_li_left">商品9.5折+双倍积分</p>
                                <p className="listgoods_li_right">-￥30.00</p>
                            </li>
                            <li className="listgoods_li">
                                <p className="listgoods_li_left">商品9.5折+双倍积分</p>
                                <p className="listgoods_li_right">-￥30.00</p>
                            </li>
                        </ul>
                    </div>
                </div>
                    <div className='displayline_bottom'>
                        <div className="displayline_payType">
                            <div className="payType_title">
                                <span>已支付方式</span>
                                <span>支付账号</span>
                                <span>金额</span>
                            </div>
                            <ul className="payType_money">
                                <li className="payType_money_li">
                                    <span>第三方系统折扣</span>
                                    <span>3747****8374</span>
                                    <span>￥ 100.00</span>
                                </li>
                                <li className="payType_money_li">
                                    <span>第三方系统折扣</span>
                                    <span>3747****8374</span>
                                    <span>￥ 100.00</span>
                                </li>
                            </ul>
                        </div>
                        <div className="displayline_date">
                            <span className="span1">收银台:&nbsp;&nbsp;&nbsp;{this.props.initialState.syjh}</span>
                            <span className="span2">{this.state.time}</span>
                        </div>
                    </div></div>
        }
    }

    render() {
        // console.log(this.props.isDisplayline)
        return (
            <div className="dispayline_wrap">
                <div className='displayline_left'>
                    <img src={require("@/common/imageYW/guanggao_left.png")} alt="" />
                </div>
                <div className="displayline_right">
                    {
                        this.renderDisplay(this.props.isDisplayline)
                    }

                </div>
            </div>
        );
    }
}

export default Displayline;
