import React, {Component} from 'react';
import message from '@/common/components/message';
import {Form, Modal, Input, Button, Row, Radio, Switch} from 'antd';
import RechargeKeypad from '@/common/components/rechargeKeypad/index.js';
import intl from 'react-intl-universal';
import NumberKeypad from '@/common/components/numberKeypad/index.js';
import {Fetch} from '@/fetch/';
const RadioGroup = Radio.Group;

class GoodsEditor extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            qty: 0,
            zkl: '',//折扣率
            zrl: '',//折让率
            selectfoodId: '',
            isPackage: false , //是否为套餐商品
            selectdrinkId: '',
            selectdetailId: '',
            maxZkl: '',
            maxZrl: '',
            hasBackPrint: false, //后厨打印
            eatWay: 1, //就餐方式,
            initialCategory: [],
            categoryPropertys: [],// 选择的属性
            detailname: [
                {
                    id: 0,
                    set: '双人餐一份',
                    setfood: [
                        {id: 0, food: '烧鸡饭'},
                        {id: 1, food: '黑椒鸡肉杂粮饭'},
                        {id: 2, food: '龙利鱼杂粮饭'},
                        {id: 3, food: '烧鸡饭'},
                        {id: 4, food: '鸡肉杂粮饭'},
                        {id: 5, food: '鱼杂粮饭'},
                        {id: 6, food: '鱼鱼杂粮饭'},
                    ]
                },
            ],
            drinkdetail: [
                {
                    id: 0,
                    set: '饮品一',
                    setdrink: [
                        {id: 0, drink: '冰咖啡'},
                        {id: 1, drink: '可乐'},
                        {id: 2, drink: '果粒橙'},
                    ]
                },
            ],
            detailfd: [
                {id: 0, fc: '外卖'},
                {id: 1, fc: '软面'},
                {id: 2, fc: '少盐'},
                {id: 3, fc: '走油'},
                {id: 4, fc: '少油'},
                {id: 5, fc: '硬面'},
                {id: 6, fc: '硬面'},
                {id: 7, fc: '少饭'},
                {id: 8, fc: '走油'},
            ]
        };
    }

    componentWillMount() {
        let {maxZkl, maxZrl} = this.state;
        let {goodsList, editIndex, posrole} = this.props;///privdpzkl privzpzkl
        let {qty, ysje} = goodsList[editIndex];
        // if (posrole.privdpzkl === 0) {
        //     maxZkl = "折扣率无上限";
        //     maxZrl = "折让金额无上限";
        // } else {
        //     maxZkl = "折扣率" + posrole.privdpzkl;
        //     maxZrl = "折让金额" + (ysje * (100 - posrole.privdpzkl) / 100).toFixed(2);
        // }

        let goodInfo = goodsList[editIndex];
        if(goodInfo.isPackage){
            this.setState({isPackage: true})
        }else{
            this.setState({isPackage: false})
        }
        let zkl = parseInt((goodInfo.tempZkDiscount/goodInfo.total)*100) || 0;
        let zrl = goodsList[editIndex].tempZrDiscount || 0;
        let {eatWay, hasBackPrint, categoryPropertys, originalCategoryPropertys } = goodsList[editIndex]
        this.setState({maxZkl, maxZrl, qty, zrl, zkl,eatWay, hasBackPrint, categoryPropertys,initialCategory: originalCategoryPropertys});
        // if(!goodsList[editIndex].isPackage){
        //     this.props.goodsfindsubmit(goodsList[editIndex].goodsno,null,true)
        // }
    }

    componentWillUnmount() {
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.editorCategory.goodslist){
            this.setState({
                initialCategory: nextProps.editorCategory.goodslist[0].originalCategoryPropertys
            })
        }
    }

    selectedfood = (id) => {
        this.setState({
            selectfoodId: id
        })
    }

    selecteddrink = (id) => {
        this.setState({
            selectdrinkId: id
        })
    }

    selecteddetail = (id) => {
        this.setState({
            selectdetailId: id
        })
    }

    modifyQty = (flag) => {
        let {qty} = this.state;
        qty = Number(qty);
        let {modifyProperty} = this.props;
        if (flag) {
            if (this.props.totalData.num + (qty + 1 - this.props.goodsList[this.props.editIndex].qty) >
            this.props.maxSaleGoodsQuantity * 1) {
                message(`${intl.get("INFO_GOODSQTYMAX")}${this.props.maxSaleGoodsQuantity }`);
                return false;
            }
            ++qty;  
            this.setState({qty});

        } else {
            if (qty <= 1) return false;
            if (this.props.totalData.num + (qty - 1 - this.props.goodsList[this.props.editIndex].qty) >
            this.props.maxSaleGoodsQuantity * 1) {
                message(`${intl.get("INFO_GOODSQTYMAX")}${this.props.maxSaleGoodsQuantity }`);
                return false;
            }
            --qty;
            this.setState({qty});
            // modifyProperty('edit', --qty, () => {
            //     this.setState({qty});
            // },this.state.isPackage);
        }
    }

    changeEatway = (e) => {
        this.setState({
            eatWay : e.target.value
        })
    }

    changeHasBackPrint = (checked) => {
        this.setState({
            hasBackPrint: checked
        })
    }

    changeRedemption = (checked) => {
        let {qty} = this.state
        let {goodsList, editIndex} = this.props;///privdpzkl privzpzkl
        let goodsInfo = goodsList[editIndex]
        this.props.changeRedemption(goodsInfo, qty)
    }

    inputClick = (name, top) => {
        //刷卡授权
        switch (name) {
            case 'price':
                if(this.props.posrole.privgj === 'Y') {
                    this.openKeypad(name, top);
                    return;
                }
                break;
            default:
                if(this.props.posrole.privdpzkl > 0) {
                    this.openKeypad(name, top);
                    return;
                }
                break;
        }
        React.accredit(posrole => {
            let flag = false;
            if(name === 'price') {
                if(posrole.privgj === 'Y') {
                    flag = true;
                }
            } else {
                if(posrole.privdpzkl > 0) {
                    flag = true;
                }
            }
            if (flag) {
                this.openKeypad(name, top);
            } else {
                message(intl.get("INFO_AUTHFAIL"))   //'授权失败：无此权限'
            }
        }, null, {flow_no: this.props.flow_no})
    }


    openKeypad = (name, top) => {
        let temp = this.state[name];
        let intl = this.props.intl;
        let keyboard = [];
        switch (name) {
            case 'zkl':
                keyboard = [     //可选的键盘
                    {name: "5%", value: "5"},
                    {name: "10%", value: "10"},
                    {name: "15%", value: "15"},
                    {name: "20%", value: "20"},
                    {name: "25%", value: "25"},
                    {name: "30%", value: "30"},
                    {name: "40%", value: "40"},
                    {name: "50%", value: "50"},
                ];
                break;
            case 'zrl':
                keyboard = [     //可选的键盘
                    {name: "10", value: "10"},
                    {name: "20", value: "20"},
                    {name: "30", value: "30"},
                    {name: "50", value: "50"},
                    {name: "80", value: "80"},
                    {name: "100", value: "100"},
                    {name: "150", value: "150"},
                    {name: "200", value: "200"},
                ];
                break;
            default :
                break;
        }
        NumberKeypad.open({
            top: top,
            left: 80,
            keyboard: keyboard,
            onInput: (value, isReset) => {
                let _value = this.state[name];
                if (isReset || !_value) {
                    this.setState({[name]: value});
                } else {
                    this.setState({[name]: _value + value});
                }
            },
            onBack: () => {
                let value = this.state[name] + '';
                this.setState({[name]: value.substring(0, value.length - 1)});
            },
            onClear: () => {
                this.setState({[name]: ''});
            },
            onCancel: () => {
                this.setState({[name]: temp});
            },
            onOk: () => {
                if (!/^((0\.\d{1,2})||([1-9]\d{0,2}(\.\d{1,2})?))$/.test(this.state[name])
                    && name === 'qty') {
                    message(intl("INFO_QTYMAX"));
                    return false;
                }
                if(this.state[name] === "") {
                    message(intl("INFO_NOTEMPTY")); //'输入内同不允许为空！'
                    return false;
                }
                return Promise.resolve(
                    this.props.modifyProperty(name, this.state[name]).then(res => {
                        if (!res) {
                            this.setState({[name]: temp});
                        } else {
                            return true;
                        }
                    })
                );
            }
        })
    }

    selectedCategory = (propertyCode, propertyName,idx) =>{
        let obj = {
            propertyCode,
            propertyName
        }
        let flag = this.state.categoryPropertys.find(v => v.propertyCode === propertyCode)
        if(flag){
            let index = this.state.categoryPropertys.indexOf(flag)
            this.state.categoryPropertys.splice(index,1)
        }else{
            this.state.categoryPropertys.push(obj)
        }
        this.setState({
            categoryPropertys: this.state.categoryPropertys,
        })
    }

    detailSubmit =() => {
        let {goodsList, editIndex, pagination} = this.props;///privdpzkl privzpzkl
        let {categoryPropertys, eatWay, hasBackPrint, qty } = this.state
        let goodsInfo = goodsList[editIndex]
        goodsInfo.key = editIndex;
        goodsInfo.isPackage = this.state.isPackage
        this.props.changeGoods(goodsInfo,categoryPropertys, eatWay, hasBackPrint, qty, true);
        this.props.editorControl();
    }

    numberChange = () => {
        RechargeKeypad.open({
            title: intl.get("INFO_CHANGEQTY"), //"修改商品数量",
            placeholder: intl.get("PLACEHOLDER_NUM"),    //"请输入商品数量",
            errMessage: intl.get("INFO_QTYMAX"),    //"请输入1~99999之间的整数"
            rule: (num) => {
                /*if (/^((0\.\d{1,2})||([1-9]\d{0,2}(\.\d{1,2})?))$/.test(num)) {
                    return true;
                }*/
                if (/^([1-9]\d{0,4})$/.test(num)) {
                    return true;
                }
                return false;
            },
            keyboard: [     //可选的键盘
                {name: "10", value: "10"},
                {name: "15", value: "15"},
                {name: "20", value: "20"},
                {name: "50", value: "50"},
            ],
            callback: (value) => {
                // this.props.modifyProperty('edit', value, () => {
                //     this.setState({qty: value});
                // },this.state.isPackage)
                if (this.props.totalData.num + (value - this.props.goodsList[this.props.editIndex].qty) >
                this.props.maxSaleGoodsQuantity * 1) {
                    message(`${intl.get("INFO_GOODSQTYMAX")}${this.props.maxSaleGoodsQuantity }`);
                    return false;
                }
                this.setState({qty: value});
            }
        })
    }

    render() {
        let {goodssum, onDecreaseClick, onIncreaseClick, editorControl, goodsList, editIndex, intl, accredit} = this.props;
        let {detailname, selectfoodId, drinkdetail, selectdrinkId, detailfd, selectdetailId, qty, zkl, zrl, maxZrl, maxZkl} = this.state;
        let goodsInfo = goodsList[editIndex]
        return (
            <div className={'square_modal'}>
                <div className={'square_modal_bg'}></div>
                <div className={'square_modal_box'}>
                    {/* <div className={'smodal_box_top'}>
                        {intl("INFO_GOODSEDIT")}
                            <div className={'smodal_box_close'}
                                onClick={editorControl}>
                            </div>
                    </div> */}
                    <div className={'smodal_body'}>
                        <div className={'smodal_list'} style = {goodsInfo.goodsType === '9' ? null : {overflow: 'auto'}}>
                        {
                             this.props.breadFlag ? null : goodsInfo.isPackage || goodsInfo.goodsType === '9'? null :
                                    <div>
                                        <div className={'smd_list_detail'}>屬性</div>
                                        <ul className={'smd_list_food'}>
                                        {
                                           this.state.initialCategory.map((val, idx)=>{
                                                return <li
                                                    key={val.propertyCode}
                                                    onClick = {() => {this.selectedCategory(val.propertyCode, val.propertyName)}}
                                                    className={ this.state.categoryPropertys.find(v => v.propertyCode === val.propertyCode)?'smd_list_food_son_change' : 'smd_list_food_son'}
                                                >{val.propertyName}</li>
                                            })
                                        }
                                        </ul>
                                    </div>
                        }
                        {
                            // goodsInfo.isPackage ? null :
                            // this.state.drinkdetail.map(
                            //     u =>
                            //         <div key={u.id}>
                            //             <div className={'smd_list_detail'}>{u.set}</div>
                            //             <ul className={'smd_list_food'}>
                            //                 {
                            //                     u.setdrink.map((val, idx) => {
                            //                         return <li
                            //                             key={val.id}
                            //                             onClick={() => {
                            //                                 this.selecteddrink(val.id)
                            //                             }}
                            //                             className={val.id == this.state.selectdrinkId ? 'smd_list_food_son_change' : 'smd_list_food_son'}
                            //                         >{val.drink}</li>
                            //                     })
                            //                 }
                            //                 <li className={'smd_list_food_son smd_list_food_son_b'}>{intl("REMARKS")}</li>
                            //             </ul>
                            //         </div>
                            // )
                        }
                            <div>
                                <div className={'smd_list_detail'}>{intl("MODIFY_NUM")}</div>
                                <div className={'smd_list_inputnumb'}>
                                    <div className={'smd_list_ipnmb_min'} onClick={() => this.modifyQty(false)}
                                         type="button">
                                        <div className={'smd_list_ipnmb_min_i'}></div>
                                    </div>
                                    <div className={'smd_list_ipnmb_num'} onClick = {this.numberChange}>{qty}</div>
                                    <div className={'smd_list_ipnmb_add'} onClick={() => this.modifyQty(true)}
                                         type="button">
                                        <div className={'smd_list_ipnmb_add_i'}></div>
                                    </div>
                                </div>
                            </div>
                            {
                                goodsInfo.isPackage || goodsInfo.goodsType === '9' ? null :
                                    <div>
                                        <div className={'smd_list_detail'}>{`折扣/折讓`}</div>
                                        <div className={'smd_list_detail_disc'}>
                                            <div className={'smd_list_detail_disc_son'}>
                                                <div className={"smd_list_detail_disc_son_w"}>{'單行折%:'}</div>
                                                <input type="text" className={"smd_list_detail_disc_son_input"} value={zkl} onChange={() => {}}
                                                    onClick={ (event) => this.inputClick('zkl', event.target.getBoundingClientRect().bottom - event.target.clientHeight - 282)}/>
                                            </div>
                                            <div className={'smd_list_detail_disc_son'}>
                                                <div className={"smd_list_detail_disc_son_w"}>{'單行折$:'}</div>
                                                <input type="text" className={"smd_list_detail_disc_son_input"} value={zrl} onChange={() => {}}
                                                    onClick={(event) => this.inputClick('zrl', event.target.getBoundingClientRect().bottom - event.target.clientHeight - 282)}/>
                                            </div>
                                        </div>
                                {this.props.breadFlag || goodsInfo.goodsType === '13' ? null :
                                <div>
                                <div className={'smd_list_detail'}>
                                        {intl("SQUARE_MEALSTYLE")}
                                </div>
                                    <RadioGroup  style = {{marginLeft: '10px'}} onChange = {this.changeEatway} value = {this.state.eatWay}>
                                        <Radio value={1}>堂食</Radio>
                                        <Radio value={2}>外賣</Radio>
                                    </RadioGroup>
                                {/* <div className={'smd_list_detail'}>
                                        {intl("SQUARE_KITCHENPRINTING")}
                                </div> */}
                                    {/* <Switch style = {{marginLeft: '10px'}} checkedChildren={intl("OPEAN")} unCheckedChildren={intl("SHUT")}  onChange = {this.changeHasBackPrint} checked = {this.state.hasBackPrint}/> */}
                                </div>
                                }
                                {goodsInfo.flag === '1' || goodsInfo.flag === '7' ?
                                    <div>
                                    <div className={'smd_list_detail'}>
                                        {'積分換購'}
                                    </div>
                                    <div>
                                    <Switch style = {{marginLeft: '10px'}} checkedChildren={intl("OPEAN")} unCheckedChildren={intl("SHUT")}  onChange = {this.changeRedemption} checked = {goodsInfo.flag === '7' ? true : false}/>
                                    </div>
                                    </div>
                                 : null
                                }
                            </div>
                            }
                            {/* <div>
                                <div className={'smd_list_detail'}>{intl("SQUARE_SPECIAL")}</div>
                                <ul className={'smd_list_food'}>
                                    {
                                        this.state.detailfd.map(
                                            u =>
                                                <li
                                                    onClick={() => {
                                                        this.selecteddetail(u.id)
                                                    }}
                                                    className={u.id == this.state.selectdetailId ? 'smd_list_food_son_sp_change' : 'smd_list_food_son_sp'}
                                                    key={u.id}
                                                >{u.fc}</li>
                                        )
                                    }
                                </ul>
                            </div> */}
                        </div>
                    </div>
                    <div className={'smodal_bottom'}>
                        <div className={'smodal_bottom_detail'}>
                        {goodsInfo.isPackage || goodsInfo.goodsType === '9' ? '' : `${this.state.categoryPropertys.map((val ,idx) => val.propertyName)}  `}
                        </div>
                        <div className={'smodal_bottom_submit'} onClick={this.detailSubmit}>
                            <div className={'smodal_bottom_submit_i'}></div>
                            {intl("BTN_CONFIRM")}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

GoodsEditor.propTypes = {}

export default GoodsEditor;