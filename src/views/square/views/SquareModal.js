import React, { Component } from 'react';
import {Modal, Radio, Switch} from 'antd';
import { Fetch } from '@/fetch/';
import message from '@/common/components/message';
import {init} from "../../returngoods/Actions";
const RadioGroup = Radio.Group;

class SquareModal extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            chooseGoodsKey:[],
            chooseList: [],
            chooseDetail: [], //选择套餐
            detaiList:[], //提交套餐
            chooseCategory: [], //选择属性
            chooseSmdid:'',
            key: undefined,
            smdKey: undefined,
            selectdetailId:'',
            categoryPropertys: [], //选择属性数组,
            changeColor: [],
            hasBackPrint: true, //后厨打印
            eatWay: this.props.eatWay, //就餐方式,
            mealGoods: []
        };
    }

    componentDidMount() {
        let {isPackageStatus} = this.props
        if(isPackageStatus){
            let mealGoods = JSON.parse(JSON.stringify(this.props.mealGoods))
            mealGoods.forEach(item => {
                item.isFlag = false 
                item.isClick = false
                item.detail.forEach((value, index) => {
                    value.isGoods = false
                    item.optionNum > 1 && value.categoryPropertys.push({propertyName:'多选', propertyCode: -1})
                    value.categoryPropertys.forEach(v => {
                        v.isProperty = false
                    })
                })
            })
            this.setState({
                mealGoods
            });
        }   
    }

    componentWillUnmount() {
    }
 
    selectedGoods =(id)=>{
        let {mealGoods} = this.state
        let isFlag = mealGoods.find(v => v.key === id).isFlag
        let isClick = mealGoods.find(v => v.key === id).isClick
        if(this.state.key === undefined){
            //首次点击
            if(isFlag === false){
                mealGoods.find(v => v.key === id).isFlag = true
                mealGoods.find(v => v.key === id).isClick = true
            }
        }
        if(this.state.key !== id && this.state.key !== undefined){
            //切换
            // let optionNum = mealGoods.find(v => v.key === this.state.key).optionNum
            // let length = mealGoods.find(v => v.key === this.state.key).detail.filter(v => v.isGoods === true).length
            // if(length !== optionNum){
            //     message(`選擇的商品必須為${optionNum}個!`)
            //     return false
            // }
            if(isFlag  === false){
                mealGoods.find(v => v.key === id).isFlag = true
                mealGoods.find(v => v.key === id).isClick = true
                mealGoods.find(v => v.key === this.state.key).isClick = false
            }else{
                mealGoods.find(v => v.key === this.state.key).isClick = false
                mealGoods.find(v => v.key === id).isClick = true 
            }
        }else{
            //点击取消后再次点击
            if(isFlag === false){
                mealGoods.find(v => v.key === id).isFlag = true
                mealGoods.find(v => v.key === id).isClick = true
            }
        }
        if(isFlag === true && isClick === true){
            // 取消
            mealGoods.find(v => v.key === id).isFlag = false
            mealGoods.find(v => v.key === id).isClick = false
            mealGoods.find(v => v.key === id).detail.forEach(item => {
                item.isGoods = false
                item.categoryPropertys.forEach(val => {
                    val.isProperty = false
                })
            })
        }
        this.setState({
            key: id,
            mealGoods: this.state.mealGoods
        });   
    }

    selectedSmdid =(smdid, idx)=>{
        let {mealGoods} = this.state
        let chooseDetail = mealGoods.find(v => v.key === this.state.key).detail
        let optionNum = this.state.mealGoods.find( v => v.key === this.state.key).optionNum;
        let flag = chooseDetail.filter(v => v.isGoods === true).length < optionNum;
        let isGoods = chooseDetail.find(v => v.smdid === smdid).isGoods
        if(mealGoods.find(v => v.key === this.state.key).isFlag === false){
            message('請先選擇套餐')
            return false
        }
        if(isGoods === false){
            if(flag){
                chooseDetail.find(v => v.smdid === smdid).isGoods = true
            }else{
                message(`只允許選擇${optionNum}個商品`)
            }
        }else if(isGoods === true ){
            chooseDetail.find(v => v.smdid === smdid).isGoods = false
            chooseDetail.find(v => v.smdid === smdid).categoryPropertys.forEach(item =>{
                item.isProperty = false
            })
        }
        this.setState({
            chooseSmdid: smdid,
            smdKey: idx,
            mealGoods: this.state.mealGoods,
            detaiList: this.state.detaiList
        })
    }

    //非套餐属性选择
    selectedCategory = (propertyCode, propertyName) => {
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
        this.setState({categoryPropertys: this.state.categoryPropertys,});
    }

    //套餐属性选择
    selectedProperty = (propertyCode, propertyName, smdid) => {
        let {mealGoods} = this.state
        let chooseDetail = mealGoods.find(v => v.key === this.state.key).detail
        if(chooseDetail.find(v => v.isGoods === true) ){
            if(chooseDetail.find(v => v.smdid === smdid).isGoods === true){
                let categoryPropertys = chooseDetail.find(v => v.smdid === smdid).categoryPropertys
                let flag = categoryPropertys.find(v => v.propertyCode === propertyCode).isProperty
                if(flag == false){
                    if(propertyCode == -1){
                        let addDetail = JSON.parse(JSON.stringify(chooseDetail.find(v => v.smdid === smdid)));
                        addDetail.isGoods = false;
                        addDetail.smdid = chooseDetail.length;
                        addDetail.addStatus = true
                        addDetail.categoryPropertys.forEach(v => {
                            v.isProperty = false;
                        })
                        chooseDetail.unshift(addDetail);
                    }else{
                        categoryPropertys.find(v => v.propertyCode === propertyCode).isProperty = true;
                    }
                }else{
                    categoryPropertys.find(v => v.propertyCode === propertyCode).isProperty = false 
                }
                this.setState({mealGoods: this.state.mealGoods});
            }else{
                message('請先選擇該屬性商品')
            }
        }else{
            message('請先選擇商品') 
        }
        this.setState({mealGoods})
    }

    //添加套餐
    addPackage = () => {
        let {mealGoods,chooseGoodsKey, chooseSmdid, categoryPropertys, eatWay, hasBackPrint} = this.state;
        let {goodsInfo, isPackageStatus, intl} = this.props;
        let  flag = true
        if(isPackageStatus){
            let length = mealGoods.filter(v => v.isFlag === true).length
            if(this.state.key == undefined){
                message('請先選擇套餐!')
                return false
            }
            if(length !== mealGoods.length){
                message('請選擇所有的套餐')
                return false
            }
            let meal = JSON.parse(JSON.stringify(mealGoods))
            let choice = meal.filter(v => v.isFlag === true)
            choice.forEach(item => {
                for(let i = 0 ; i < item.detail.length ; i++){
                    if(item.detail[i].isGoods === false){
                        item.detail.splice(i, 1)
                        i--
                    }
                }
            })
            choice.forEach(item => {
                item.detail.forEach(val => {
                    for(let i = 0 ; i < val.categoryPropertys.length ; i++){
                        if(val.categoryPropertys[i].isProperty === false){
                            val.categoryPropertys.splice(i, 1)
                            i--
                        }
                    }
                })
            })
            choice.forEach(item => {
                item.goodsCode = this.props.goodsCode;
                let detail = this.props.mealGoods.find(v => v.smtrid === item.smtrid).detail;
                item.detail.forEach(value => {
                    value.eatWay = this.state.eatWay;                          
                    value.hasBackPrint = this.state.hasBackPrint;
                    if(value.addStatus){
                        let list = detail.find(v => v.barNo === value.barNo);
                        if(!!list){
                            value.smdid = list.smdid;
                        };
                    }
                })
            })
            for(let i = 0 ; i < choice.length ; i++){
                if(choice[i].detail.length !== choice[i].optionNum){
                    message(`${choice[i].typeName}選擇商品數必須為${choice[i].optionNum}个`)
                    flag = false
                    break
                }
            }
            if(flag){
                this.props.addPackage(choice)
            }
            }else{  
                this.props.changeGoods(goodsInfo,categoryPropertys, eatWay, hasBackPrint, 1)
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

    render() {
        const {onDecreaseClick,onIncreaseClick,windowsControl, intl} = this.props;
        let {mealGoods, mealSalePrice, isPackageStatus} = this.props
        return (
            <div className={'square_modal'}>
                <div className={'square_modal_bg'}></div>  
                <div className={'square_modal_box'}>
                    <div className={'smodal_box_top'}>
                        {'商品修改'}
                        <div className={'smodal_box_close'}
                             onClick={windowsControl}>
                        </div>
                        {/* <img src={require('@/common/image/paytk_close.png')} alt="" onClick={this.onCancel}/> */}
                    </div>
                    <div className={'smodal_body'}>
                        <div className={'smodal_list'}>
                        {isPackageStatus ?
                                <div key={mealSalePrice}>
                                    <div className={'smd_list_detail'}>套餐</div>
                                    <ul className={'smd_list_food'}>
                                        {
                                            this.state.mealGoods.map((val, idx)=>{
                                                return <li
                                                    key={val.key}
                                                    onClick={()=> {this.selectedGoods(val.key)}}
                                                    className = {val.isClick && val.isFlag ? 'smd_list_food_son_click' : val.isFlag ? 'smd_list_food_son_package_change': 'smd_list_food_son'}
                                                >{`${val.typeName}[${mealGoods.find(v => v.key === val.key).detail.length}选${val.optionNum}]`}</li>
                                            })
                                        }
                                    </ul>
                                </div>
                            : null
                        }
                        {isPackageStatus ?
                            <div>
                                <div className={'smd_list_detail'}>商品</div>
                                <ul className={'smd_list_food'}  >
                                    {
                                        this.state.mealGoods.find( v => v.key === this.state.key) !== undefined &&  
                                            this.state.mealGoods.find( v => v.key === this.state.key).detail.map((val, idx) => 
                                            <li className = 'smd_list_food_li' key = {idx}>
                                                <div  
                                                    className={ val.isGoods === true ? 'food_li_goods_change' : 'food_li_goods'}
                                                    key = {val.smdid}
                                                    onClick = {()=> {this.selectedSmdid(val.smdid, idx)}}>
                                                    {val.goodsNameD}
                                                </div>
                                                {val.categoryPropertys.map((item, index) => 
                                                    <div 
                                                        onClick = {() => {this.selectedProperty(item.propertyCode,item.propertyName, val.smdid)}}
                                                        className={ item.isProperty === true ? 'food_li_property_change' : 'food_li_property'}
                                                        key = {index}>
                                                        {item.propertyName}
                                                    </div>
                                                )}
                                            </li> 
                                        )
                                    }
                                </ul>
                            </div> :null
                        }
                        {isPackageStatus ?
                            null :
                            <div>
                            <div className={'smd_list_detail'}>{intl("SQUARE_ATTRIBUTES")}</div>
                            <ul className={'smd_list_food'}>
                                {
                                    this.props.goodsInfo.originalCategoryPropertys.map((val, idx)=>{
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
                            <div className={'smd_list_detail'}>
                                {intl("SQUARE_MEALSTYLE")}:
                            <RadioGroup  style = {{marginLeft: '10px'}} onChange = {this.changeEatway} value = {this.state.eatWay}>
                                <Radio value={1}>堂食</Radio>
                                <Radio value={2}>外賣</Radio>
                            </RadioGroup>
                            </div>
                            {/* <div className={'smd_list_detail'}>
                                {intl("SQUARE_KITCHENPRINTING")}:
                                <Switch style = {{marginLeft: '10px'}} checkedChildren={intl("OPEAN")} unCheckedChildren={intl("SHUT")}  onChange = {this.changeHasBackPrint} checked = {this.state.hasBackPrint}/>
                            </div> */}
                        </div>
                    </div>
                    <div className={'smodal_bottom'}>
                        <div className={'smodal_bottom_detail'}>
                            {`${this.state.categoryPropertys.map((val ,idx) => val.propertyName)}  `}
                        </div>
                        <div className={'smodal_bottom_submit'} onClick = {this.addPackage}>
                            <div className={'smodal_bottom_submit_i'} ></div>
                            {intl("BTN_CONFIRM")}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

SquareModal.propTypes = {

}

export default SquareModal;