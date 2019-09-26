import React, {Component} from 'react';
import { Menu, Dropdown, Icon } from 'antd';

class GoodsDetail extends Component {
    
    render() {
        let {goods, delGoods, editorControl, index, switchEng, intl, lastOne, octozz} = this.props;
        let discount = (goods.ysje - goods.total).toFixed(2);
        let isPackage = goods.isPackage;
        let last = lastOne && (lastOne - 1 === index);
        const menu = (
            <Menu  className="presale_pop_dropdowm">
                {goods.pop_details && goods.pop_details.map((item, index) =>
                    <Menu.Item key={index}>
                        <span style={{fontSize: 16}}>
                            {`${item.pop_describe}(${item.staDate || " "}~${item.endDate || " "})`}
                        </span>
                    </Menu.Item>
                )}
            </Menu>
        );
        const packageMenu = (
            <Menu  className="presale_pop_dropdowm">
                {goods.categoryPropertys && goods.categoryPropertys.map((item, index) =>
                    <Menu.Item key={index}>
                        <span style={{fontSize: 16}}>
                            {`${item.propertyName}`}
                        </span>
                    </Menu.Item>
                )}
            </Menu>
        );
        return (
            <li className={'square_left_goods_list'}
                style={last ? {
                    backgroundColor: '#FEF2FA',
                    borderColor: '#FF77CD'
                } : {}}>
                <div className={'square_goods_dnds'}>
                    {octozz === 'Y10' || octozz === 'Y11' ? 
                        null : <div className={'square_goods_del'} onClick={() => delGoods(index, goods)}></div>}
                    <div className={'square_goods_detail'}>
                        <div className={'square_goods_numb square_goods_numb_select'} style = {octozz === 'Y10' || octozz === 'Y11' ? {marginLeft: '0.2rem'} : null}>{goods.goodsno}{'(' + goods.category + ')'}</div>
                        <div className={'square_goods_dis'}></div>
                        <div
                            className={'square_goods_sum'}>{goods.ysje !== goods.total? discount : ''}
                            &nbsp;&nbsp;&nbsp;&nbsp;
                            {goods.price.toFixed(2)}
                        </div>
                    </div>
                </div>
                <div className={'square_goods_nn'}>
                    <div
                        className={'square_goods_name'}>{switchEng ? goods.engname : goods.fname}{this.props.breadFlag || goods.goodsType === '98' ||  goods.goodsType === '99' ||  goods.goodsType === '16' || goods.goodsType === '13' ? null : goods.eatWay == 1 ? '(' + '堂食' + ')' : '(' + '外賣' + ')'}</div>
                    <div className={'square_goods_number'}>{'x ' + goods.qty}</div>
                </div>
                <div className={'square_goods_nn'}>
                        <div className={'square_goods_name'} style = {{fontSize: '0.16rem'}}>
                        { goods.pop_details && goods.pop_details.length > 0 &&
                                    (goods.pop_details.length > 1 ?
                                        <Dropdown overlay={menu} trigger={['click']}
                                                    >
                                            <span>
                                                {`${goods.pop_details[0].pop_describe}(${goods.pop_details[0].staDate || " "}~${goods.pop_details[0].endDate || " "})`}
                                                <Icon style={{marginLeft: 10}} type="down-circle-o"/>
                                            </span>
                                        </Dropdown> :
                                        <span>{`${goods.pop_details[0].pop_describe}(${goods.pop_details[0].staDate || " "}~${goods.pop_details[0].endDate || " "})`}</span>)
                        }
                        </div>
                </div>
                {goods.goodsType === '9' ? 
                        <div className={'square_goods_nn'}>
                        <div className={'square_goods_name'} style = {{fontSize: '0.16rem'}}>
                        { goods.goodsType === '9' && goods.categoryPropertys.length > 0 &&
                                    (goods.categoryPropertys.length > 1 ?
                                        <Dropdown overlay={packageMenu} trigger={['click']}
                                                    >
                                            <span>
                                                {`${goods.categoryPropertys[0].propertyName}`}
                                                <Icon style={{marginLeft: 10}} type="down-circle-o"/>
                                            </span>
                                        </Dropdown> :
                                        <span>{`${goods.categoryPropertys[0].propertyName}`}</span>)
                        }
                        </div>
                        {octozz === 'Y10' || octozz === 'Y11' ? null : <div className={'square_goods_change'} onClick={() => {
                            editorControl(index);
                        }}></div> }
                        </div>
                    : 
                        <div className={'square_goods_nn'}>
                        <div
                        className={'square_goods_name'}>{goods.categoryPropertys.length !== 0 ? `${goods.categoryPropertys.map((val, idx) => val.propertyName)}  ` : ''}</div>
                        {octozz === 'Y10' || octozz === 'Y11' ? null : <div className={'square_goods_change'} onClick={() => {
                            editorControl(index);
                        }}></div> }
                        </div>
                }
            </li>
        )
    }
}

export default GoodsDetail