import React, { Component } from 'react';
import { Icon, Input, Col, Spin, Modal } from 'antd';
import message from '@/common/components/message';
import TableModal from '@/common/components/tablemodal/index.js';
import NumberKeypad from '@/common/components/numberKeypad/index.js';
import TagSelect from './TagSelect.js';
import RechargeKeypad from '@/common/components/rechargeKeypad/index.js';
import EventEmitter from '@/eventemitter';
import intl from 'react-intl-universal';
import moment from 'moment';

//输入与提交
class PreSaleRight extends Component {

    constructor(props) {
        super(props);
        this.state = {
            brandsData: [],//门店名称
            brandsId: '',
            kindsData: [],//对应门店的商品条目
            tempData: [],
            kindsId: '',
            selection: {
                brands: null,
                kinds: null,
            },
            kindsPage: 1,
            tempGoods: {
                'barNo': "22582904",
                'enFname': "20190903-25",
                'erpCode': "002",
                'goodProperty': [],
                'goodsCode': "258290",
                'goodsName': "20190903-25",
                'isExist': "1",
                'mainBarcodeFlag': true,
                'salePrice': 24
            }
        };
        this.timer = null;
    }

    componentDidMount() {
        try {
            if (this.props.selfgoodstemplate) {
                if (this.props.djlb === 'Y1') {
                    this.setState({
                        kindsData: this.props.selfgoodstemplate.filter(item => item.isExist !== '0')
                    })
                } else {
                    const selfGoods = JSON.parse(JSON.stringify(this.props.selfgoodstemplate.selfGoods[0].goodsDetail));
                    if (selfGoods) {
                        let brandsData = selfGoods.map((item, index) => {
                            if (item.goods) {
                                item.goods = item.goods.filter(item => item.isExist !== '0')
                            }
                            return {
                                ...item,
                                stallCode: index
                            }
                        })
                        this.setState({
                            brandsData: brandsData,
                            brandsId: 0,
                            kindsData: selfGoods[0].goods,
                            tempData: selfGoods[0].goods,
                        })
                    }
                }
            }
        } catch (err) {

        }
    }

    componentWillUnmount() {
    }

    setBrandsId = (brandsId, index) => {
        let goods = [];
        let temp = JSON.parse(JSON.stringify(this.state.tempData));
        if (index % 2 === 0) {
            for (let i = 0; i < 10; i++) {

                goods.push(...temp);
            }
        } else {
            for (let i = 0; i < 2; i++) {

                goods.push(...temp);
            }
        }
        this.setState({
            kindsId: '',
            brandsId: brandsId,
            kindsData: goods
        });
    }

    setKindsId = (kindsId) => {
        if (!this.props.addGoodsVerify()) {
            return false;
        }
        this.setState({ kindsId }, () => {
            this.props.addGoods(kindsId);
        });
    }

    kindsPageChange = (type) => {
        let { kindsPage, kindsData } = this.state;
        let totalPage = Math.ceil(kindsData.length / 23);
        if ((type === 'left' && kindsPage === 1) || (type === 'right' && kindsPage === totalPage)) {
            return false;
        }
        if (type === 'left') {
            kindsPage--;
        } else if (type === 'right') {
            kindsPage++;
        }
        this.setState({ kindsPage })
    }

    checkSelected = (barNo) => {
        let { goodsList } = this.props;
        return goodsList.some((item, index) => barNo === item.barNo || barNo === item.goodsCode)
    }

    render() {
        const { brandsData, kindsData, brandsId, showOperator, kindsId, clockTime, couponData } = this.state;
        const { vipInfo, tempVip, operator, disabled, staffcard, djlb } = this.props;
        return (
            <div className="presale_option">
                <Spin spinning={disabled} indicator={<span></span>}>
                    {djlb === 'Y1' ?
                        <div>
                            <TagSelect className="presale_kinds"
                                type="kinds"
                                selectId={kindsId}
                                dataList={kindsData}
                                onClickLabel={this.setKindsId}
                                pageSize={15} />
                        </div> :
                        <div>
                            <TagSelect className="presale_brands"
                                type="brands"
                                selectId={brandsId}
                                dataList={brandsData}
                                onClickLabel={this.setBrandsId}
                                pageSize={6} />
                            <div className="presale_kinds_goodslist">
                                <TagSelect className="presale_kinds"
                                    type="kinds"
                                    selectId={kindsId}
                                    dataList={kindsData}
                                    onClickLabel={this.setKindsId}
                                    checkSelectedGoods={this.checkSelected}
                                    pageSize={18} />
                            </div>

                        </div>
                    }
                </Spin>
            </div>
        );
    }
}
export default PreSaleRight;
