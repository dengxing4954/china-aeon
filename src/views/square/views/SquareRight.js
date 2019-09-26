import React, {Component} from 'react';
import moment from 'moment';
import StoreList from './StoreList';
import FoodList from './FoodList';
import OperateMenu from './OperateMenu'
import {Row, Col} from 'antd';


//无状态组件
class SquareRight extends Component {


    constructor(props) {
        super(props);
        this.state = {
            current: 1, //当前页码
            pageSize: 11, //每页显示的条数
            indexList: [],
            open: false,
            collapse: {siid: 'collapse',stallName: '收起'},
            more: {siid: 'more',stallName: '更多'},
            brandsData: [],//门店名称
            kindsData: [],//对应门店的商品条目
            brandsId: '',
            kindsId: '',
            sysTime: moment().format('YYYY-MM-DD HH:mm:ss'),
        };
    }

    componentWillMount() {
        this.Timing = setInterval(() => {
            this.setState({sysTime: moment().format('YYYY-MM-DD HH:mm:ss')})
        }, 1000)
        this.setBrandsData()
    }

    componentWillUnmount () {
        clearInterval(this.Timing);
    }

    setBrandsData = () => {
        let {stallGoods} = this.props
        let {more} = this.state
        let showNumber = 10
        let brandsData = JSON.parse(JSON.stringify(stallGoods));
        if(brandsData.length > showNumber){
            brandsData.splice(showNumber - 1, brandsData.length - (showNumber - 1))
            brandsData.push(more)
        }
        this.setState({
            brandsData
        })
    }

    setBrandsId = (brandsId) => {
        if(!!this.refs.OperateMenu.state.menuListShow.find(v => v.code === 'collapse')){
            this.refs.OperateMenu.handleMenuList('collapse')
        }
        if(brandsId === 'more'){
            let {stallGoods} = this.props
            let brandsData = stallGoods.slice(0)
            brandsData.push(this.state.collapse)
            this.setState({
                brandsData
            })        
        }else if(brandsId === 'collapse'){
            this.setBrandsData()
        }else{
            this.setState({
                kindsId: '',
                brandsId: brandsId,
                kindsData: this.state.brandsData.find(v => v.siid === brandsId).goodsDetail
            });
        }
    }

    setKindsId = (kindsId) => {
        // this.props.findPackage(kindsId)
        // this.props.windowsControl()
        if(!this.props.addGoodsVerify()){
            return false
        }
        this.setState({kindsId}, () => {
            // this.props.addGoods(kindsId);
            this.props.goodsfindsubmit(kindsId)
        });
    }

    render() {
        let {sysTime} = this.state;
        let {keyboardControl, accredit, cancelRecord, bill, onSwitchEng, switchEng, online, intl, goodsList, djlb, octozz} = this.props;
        let props ={online:this.props.onlineModel};
        return (
            <div className="square_right" id="codeInput">
                {/*<div className={this.props.onlineModel ? 'square_online_on' : 'square_online_off'}></div>*/}
                <div className="top">
                    {/*<div className={this.props.onlineModel ? 'square_online_model_on': 'square_online_model_off'}></div>*/}
                    <div className="systime">{sysTime}</div>
                    <div className={'square_online_model_'+this.props.onlineModel}></div>
                    {/* {
                        this.props.onlineModel == 1 ?
                            <div className='square_online_model_on'></div>
                            : 
                            <div> 
                                {
                                    this.props.onlineModel == 0 ?
                                        <div className='square_online_model_off'></div>
                                        :
                                        <div className='square_online_model_no'></div>
                                }
                            </div>
                    } */}
                    {djlb === 'Y7' ?
                        <div className="square_le_djlbFlag">{`[${intl("SALES_PRACTICE")}]`}</div> : null}
                    {octozz && octozz === 'Y10' ?
                        <div className="square_le_djlbFlag">{`[會員申請]`}</div> : null}
                    {octozz && octozz === 'Y11' ?
                        <div className="square_le_djlbFlag">{`[會員續費]`}</div> : null}
                    <div className="square_language"
                         onClick={onSwitchEng}>
                        <Col span={18}>{switchEng ? '中文' : 'English'}</Col>
                        <Col span={6}>
                            <span></span>
                            <span>{switchEng ? '中' : 'En'}</span>
                        </Col>
                    </div>
                </div>
                <div className={'square_right_list'}>
                    <StoreList
                        brandsData={this.state.brandsData}
                        setBrandsId={this.setBrandsId}
                        selectId={this.state.brandsId}
                        breadFlag = {this.props.breadFlag}
                    />
                    <div className={'square_fstyle'}>
                        <FoodList
                            kindsData={this.state.kindsData}
                            kindsId={this.state.kindsId}
                            setKindsId={this.setKindsId}
                            switchEng = {this.props.switchEng}
                            imgURL = {this.props.imgURL}
                            breadFlag = {this.props.breadFlag}
                        />
                        <div className={'square_fstyle_d'}>
                            <div className={'square_gf'}>
                                <div className={'square_gfun'} onClick={keyboardControl}>
                                    <div className={'square_gfind'}></div>
                                    <div className={'square_gfind_w'}>{intl("SQUARE_BARCODE")}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <OperateMenu
                    menuList={this.props.menuList}
                    menuEvents={this.props.menuEvents} bill={bill} online={online} goodsList={goodsList}
                    billList = {this.props.billList}
                    ref = 'OperateMenu'
                    authorize = {accredit} intl={intl}
                    eatWay = {this.props.eatWay}
                    {...props}
                />
            </div>
        );
    }

}


export default SquareRight;

