import React, {Component} from 'react';
import GoodsDetail from './GoodsDetail'
import {Icon} from 'antd';
import RechargeKeypad from '@/common/components/rechargeKeypad/index.js';
import EventEmitter from '@/eventemitter';
import {init} from "../../returngoods/Actions";


//无状态组件
class SquareLeft extends Component {

    //会员卡登陆
    constructor(props) {
        super(props);
        this.state = {
            vipcardlogin: false,
            selected: '',
            indexList: [],
            num: 0,
        };
    }

    //选择商品
    selectedgoodseditor = (id) => {
        this.setState({
            selected: id
        })
    }

    vipInput = () => {
        // let intl = this.props.intl;
        // const com = (data) => {
        //     this.props.inputCode('vip', data, 13, () => {
        //     }, {idType: '1'});
        //     RechargeKeypad.close();
        // };
        // RechargeKeypad.open({
        //     title: intl("INFO_MEMBERLOGIN"),
        //     tabs: [{
        //         name: intl("CARD_NUMBER"),
        //         value: '1'
        //     }, {
        //         name: intl("PHONE_NUMBER"),
        //         value: '2'
        //     }],
        //     placeholder: '',
        //     callback: (value, idType) => this.props.inputCode('vip', value, 13, () => {
        //     }, {idType}),
        //     event: {
        //         tabValue: '1',
        //         chooseEvent: () => {
        //             EventEmitter.on('Com', com)
        //         },
        //         cancelEvent: () => {
        //             EventEmitter.off('Com', com)
        //         }
        //     }
        // })
        this.props.loginVip();
    }


    componentWillMount() {

    }

    vipExit = (e) => {
        // this.props.cancelVip();
        this.props.inputCode('vip', this.props.vipInfo.memberId, 13, () => {}, {certifytype: 'CANCEL'})
        e.stopPropagation();
    }

    staffExit = (e) => {
        this.props.exitStaff();
        e.stopPropagation();
    }

    generateStallInfo = (goods) => {
        let stallArr = [], stallInfo = [], newGoods = [],
            noExist = [];
        goods.forEach(item => item.stallCode ? stallArr.push(item.stallCode) : noExist.push(item)); //code数据目前有问题,所以这样写
        stallArr = new Set(stallArr); //去除重复code
        stallArr = Array.from(stallArr);

        stallArr.forEach(code => {
            let info = {}, goodsList, stall;
            stall = this.props.functioninitialState.data.stallhotkeytemplate.stallGoods.find(item => item.stallCode === code);
            info.stallName = stall ? stall.stallName : '';
            info.goods = [];

            goodsList = goods.filter(item => item.stallCode === code);//找到对应的档口下的商品信息
            goodsList.forEach((item, index) => {
                info.goods.push({
                    name: item.fname,
                    qty: item.qty,
                });
                item.idnum = index;
                newGoods.push(item);//根据档口信息对商品行重新排序
            });
            stallInfo.push(info);
        });
        newGoods = [...newGoods, ...noExist]; //后续需要调整
        return {stallInfo, newGoods};
    };

    changeGoods = (data) => {
        let oldData = [];
        let oldsData = JSON.parse(JSON.stringify(data));
        for (let key in oldsData) {
            oldData.push(oldsData[key]);
        }
        // oldData = oldData.filter(item => item.goodsType !== "99" && item.goodsType !== "98");//过滤券商品
        oldData.map((item, indexs) => {
            if(item.goodsType === '9'){
                let categoryPropertys = [], spliceData = '';
                item.categoryPropertys.forEach(data => { //合并商品属性
                    if (!data.isGoods && !categoryPropertys.length && !spliceData) { //判断是否是主商品属性
                        item.fname = item.fname + '|' + data.propertyName;
                    } else {
                        if (data.isGoods) {//判断是否是属性
                            if (spliceData) {
                                categoryPropertys.push(spliceData);
                                spliceData = '';
                            }
                            spliceData = data;
                        } else {
                            spliceData.propertyName = spliceData.propertyName + '|' + data.propertyName;
                        }
                    }
                });
                spliceData && categoryPropertys.push(spliceData); //上一行方法漏洞修复
                item.categoryPropertys = categoryPropertys;
            }
        })
        return oldData;
    }

    render() {
        let {
            goodsList,
            delGoods,
            totalData,
            submit,
            vipInfo,
            staffcard,
            functionControl,
            functionState,
            functioninitialState,
            functioninoperators,
            goBack,
            pagination,
            switchEng,
            intl,
            pageTurn
        } = this.props;
        let totalPage = Math.ceil(pagination.total / pagination.pageSize);
        return (
            <div className="square_left">
                <div className={'square_left_top'} onClick={functionControl}>
                    <div style = {{marginLeft: '-80px'}}>{intl('CASHIER')}：{functioninoperators.operuser.gh} 收銀機 : {functioninitialState.syjh}</div>
                    <div
                        className={functionState ? 'square_left_top_icon_open' : 'square_left_top_icon_close'}></div>
                    {
                        functionState ?
                            <div className={'square_left_function_detail'}>
                                <div
                                    className={'square_left_function_detial_son'}>
                                    <div>{intl('STORE_NUMBER')}：{functioninitialState.mkt}</div>
                                    <div>{intl('SALES_STROENAME')}：{functioninitialState.data.mktinfo.mktname}</div>
                                    <div>業態：{functioninitialState.data.mktinfo.shopForm}</div>
                                </div>
                                <div
                                    className={'square_left_function_detial_son'}>
                                    <div>{intl('SALES_NAME')}：{functioninoperators.operuser.name}</div>
                                    <div>{intl('SALES_JOBNUMBER')}：{functioninoperators.operuser.gh}</div>
                                </div>
                                <div>
                                    <div>{intl('SALES_CASHIERNUMBER')}：{functioninitialState.syjh}</div>
                                    <div>{intl('SALES_IP')}：{functioninitialState.ipAdress}</div>
                                </div>
                            </div>
                            : null
                    }
                </div>
                <div className={'square_left_vip'}>
                    <div className={'square_left_vipcard'}
                         onClick={this.props.vipcardlogin ? () => {
                         } : this.vipInput}>
                        {
                            this.props.vipcardlogin ?
                                <div className={'square_left_vpbox'}>
                                    <div className={'square_left_vpcw'} >
                                        <div style={{marginTop: !vipInfo.membershipUntilDate && 20}}
                                            className={'square_left_vipcardnumber'}>{vipInfo.memberId}</div>
                                    </div>
                                    {
                                        vipInfo.membershipUntilDate &&
                                            <div
                                            className={'square_left_vpcw square_left_vpcw2'}>{intl("INTEGRAL")}：{(vipInfo.bonusPointLastMonth - vipInfo.bonusPointUsed) || '0'}</div>
                                    }
                                </div>
                                :
                                <div>
                                    {
                                        this.props.staffcardlogin ?
                                            <div
                                                className={'square_left_vpbox'}>
                                                <div
                                                    className={'square_left_vpcw'}>
                                                    <div
                                                        className={'square_left_vipcardnumber'}>{intl("INFO_STAFFCARDNO")}:{staffcard.staffNo}</div>
                                                </div>
                                                <div
                                                    className={'square_left_vpcw square_left_vpcw2'}>{intl("THESHOPPINGOFSTAFF")}</div>

                                            </div>
                                            :
                                            <div
                                                className={'square_left_vip_login'}>
                                                {intl('LOGIN_MEMBER')}
                                            </div>
                                    }
                                </div>
                        }
                        {this.props.vipcardlogin ?
                            <div>
                                <div className={'square_vip_card_logout'}
                                     onClick={this.vipExit}></div>
                                {/*
                                    vipInfo.membershipUntilDate && <div
                                        className={'square_vip_card_type'}>{intl("SUPREMECARD")}</div>
                                */}
                            </div>
                            :
                            <div>
                                {this.props.staffcardlogin ?
                                    <div>
                                        <div
                                            className={'square_vip_card_logout'}
                                            onClick={this.staffExit}></div>
                                        {staffcard.cardType == 1 ?
                                            <div
                                                className={'square_vip_card_type'}>{intl("INFO_STAFFSTAFFNOSTA")}</div>
                                            :
                                            <div
                                                className={'square_vip_card_type'}>{intl("INFO_STAFFSTAFFNOFAM")}</div>
                                        }
                                    </div>
                                    :
                                    <div className={'square_vip_card'}></div>
                                }
                            </div>
                        }
                    </div>
                    <div className={'square_left_vipw'}>
                        <div className={'square_left_reload'}
                             onClick={this.props.repullSale}>
                            <Icon type="sync"/>
                        </div>
                        <div className={'square_left_vipt'}></div>
                        <div className={'square_left_viptw'} onClick={goBack}>
                            {intl('BACKTRACK')}
                        </div>
                    </div>
                </div>
                <ul className={'square_left_list'} style = {this.props.djlb === 'Y7' ? {background: '#363646'} : null}>
                    {
                        this.changeGoods(goodsList).slice((pagination.current - 1) * pagination.pageSize, pagination.current * pagination.pageSize).map((item, index) =>
                        {
                            return (
                                <GoodsDetail key={index}
                                index={(pagination.current - 1) * pagination.pageSize + index}
                                goods={item} switchEng={switchEng}
                                intl={intl}
                                octozz = {this.props.octozz}
                                delGoods={() => delGoods(index, item)} {...this.props}
                                lastOne={goodsList.length}/>
                            )
                        }
)
                    }
                </ul>
                {
                    pagination.total > pagination.pageSize ?
                        <div className={'square_left_page'}>
                            <div className={'square_left_page_box'}>
                                <div className={'square_left_last'}
                                     onClick={() => {
                                         pageTurn(false, this.refs.next);
                                     }}>
                                    <div ref={'next'}
                                         className={pagination.current == 1 ? 'square_left_last_i_no' : 'square_left_last_i'}></div>
                                </div>
                                <div
                                    className={'square_left_box_num'}>{pagination.current}/{totalPage}</div>
                                <div className={'square_left_next'}
                                     onClick={() => {
                                         pageTurn(true, this.refs.pre);
                                     }}>
                                    <div ref={'pre'}
                                         className={pagination.current == totalPage ? 'square_left_next_i_no' : 'square_left_next_i'}></div>
                                </div>
                            </div>
                        </div> : null
                }
                <div className={'square_left_sum'}>
                    <div className={'square_left_sum_detail'}>
                        <div
                            className={'square_left_sum_detail_w'}>{intl('TICKET_NUMBER')}：{functioninitialState.fphm}</div>
                        <div
                            className={'square_left_sum_detail_w'}>{intl('TOTAL_AMOUNT')}：{totalData.num}</div>
                        <div
                            className={'square_left_sum_detail_w'}>{intl('TOTAL_COST')}：{new Number(totalData.price).toFixed(2)}</div>
                        <div
                            className={'square_left_sum_detail_w'}>{intl('TOTAL_DISCOUNT')}：
                            {totalData.dsctotal === 0 || totalData.dsctotal === 0.00 ? '0.00' : new Number(totalData.dsctotal).toFixed(2)}
                        </div>
                    </div>
                    <div className={'square_left_sum_all'}>
                        <div className={'square_goods_sumpay'}>
                            <div
                                className={'square_sum'}>{new Number(totalData.sjtotal).toFixed(2)}</div>
                            <div
                                className={'square_sum_w'}>{intl("RECEIVABLE_AMOUNT")}</div>
                        </div>
                        <div className={'square_submit'}
                             onClick={submit}>{intl("BTN_CONFIRM")}</div>
                    </div>
                </div>
            </div>
        );
    }

}


export default SquareLeft;
