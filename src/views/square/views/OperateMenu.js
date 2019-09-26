import React, {Component} from 'react';
import message from '@/common/components/message';
import {Icon, Col, Row} from 'antd';

class OperateMenu extends Component {
    constructor(props) {
        super(props);
        this.state = {
            menuListShow: [],
        };
    }

    componentDidMount() {
        this.initMenuList();
    }

    componentWillMount() {
    }

    //菜单展开或收起
    handleMenuList = (type) => {
        let menuListShow = [];
        if (type === 'more') {
            menuListShow = [...this.props.menuList];
            if (menuListShow.length % 6 === 0) {
                menuListShow.push({code: 'blank'})
                menuListShow.push({code: 'collapse', name: '收起'})
            } else {
                menuListShow.push({code: 'collapse', name: '收起'})
            }
        } else {
            menuListShow = [...this.state.menuListShow];
            menuListShow.splice(5, menuListShow.length - 5);
            menuListShow.push({code: 'more', name: '更多'});
        }
        this.setState({menuListShow})
    }

    //初始化菜单列表
    initMenuList = () => {
        let menuListShow = [...this.props.menuList];
        if (menuListShow.length > 5) {
            menuListShow.splice(5, menuListShow.length - 5)
            menuListShow.push({code: 'more', name: '更多'})
        }
        this.setState({menuListShow})
    }

    //渲染菜单列表
    handleMenuRender = (type, key) => {
        const {menuEvents, authorize, billList, online, intl, goodsList} = this.props;
        let renderDom = null
        switch (type.code) {
            case '201':
                renderDom =
                    // <Col className={'square_right_actlist_col'} span={4} key={key}
                    //      onClick={() => {
                    //          if(goodsList.length) {
                    //              authorize('privqx', () => menuEvents('cancelRecord'));
                    //          } else {
                    //              message(intl("INFO_EMPTYLIST"));
                    //          }
                    //      }}>
                    //     <div className={'square_right_actbox'}>
                    //         <img className={'square_right_actlist_i'} src={require('@/common/image/SQ_4.png')}
                    //              alt=""/>
                    //         <div>{type.name}</div>
                    //     </div>
                    // </Col>
                    <li key={key} onClick={() => {
                        if(goodsList.length) {
                            authorize('privqx', () => menuEvents('cancelRecord'));
                        } else {
                            message(intl("INFO_EMPTYLIST"));
                        }
                    }}>
                        <i className="iconfont icon-dingdanquxiao"></i>
                        <p>{type.name}</p>
                    </li>
                break;
            case '202':
                renderDom =
                    // <Col className={'square_right_actlist_col'} span={4} key={key}>
                    //     <div className={'square_right_actbox'} onClick={() => authorize('privzpzkl', () => menuEvents('discountReceipt'))}>
                    //         <img className={'square_right_actlist_i'} src={require('@/common/image/presale_01.png')}
                    //              alt=""/>
                    //         <div>{type.name}</div>
                    //     </div>
                    // </Col>
                    <li key={key} onClick={() => menuEvents('discountReceipt')}>
                        <i className="iconfont icon-quandanzhe"></i>
                        <p>{type.name}</p>
                    </li>
                break;
            case '203':
                renderDom =
                    // <Col className={'square_right_actlist_col'} span={4} key={key}>
                    //     <div className={'square_right_actbox'} onClick={() => authorize('privzpzkl', () => menuEvents('rebateReceipt'))}>
                    //         <img className={'square_right_actlist_i'} src={require('@/common/image/presale_02.png')}
                    //              alt=""/>
                    //         <div>{type.name}</div>
                    //     </div>
                    // </Col>
                    <li key={key} onClick={() => menuEvents('rebateReceipt')}>
                        <i className="iconfont icon-quandanzhe1"></i>
                        <p>{type.name}</p>
                    </li>
                break;
            case '204':
                //暂存
                renderDom =
                    // <Col className={'square_right_actlist_col'} span={4} key={key}>
                    //     <div className={'square_right_actbox'} onClick={() => menuEvents('saveBill')}>
                    //         <img className={'square_right_actlist_i'} src={require('@/common/image/presale_03.png')}
                    //              alt=""/>
                    //         <div>{type.name}</div>
                    //     </div>
                    // </Col>
                    <li key={key} onClick={() => menuEvents('saveBill')}>
                        <i className="iconfont icon-zancun"></i>
                        <p>{type.name}</p>
                    </li>
                break;
            case '205':
                //取消暂存
                renderDom =
                    // <Col className={'square_right_actlist_col'} span={4} key={key}>
                    //     <div className={'square_right_actbox'} onClick={() => menuEvents('searchBill')}>
                    //         <img className={'square_right_actlist_i'} src={require('@/common/image/SQ_5.png')}
                    //              alt=""/>
                    //         <span className="badge">{bill.length}</span>
                    //         <div>{type.name}</div>
                    //     </div>
                    // </Col>
                    <li key={key} onClick={() => menuEvents('searchBill')}>
                        <i className="iconfont icon-jiegua"></i>
                        <span className="badge">{billList.length}</span>
                        <p>{type.name}</p>
                    </li>
                break;
            case '208':
                //员工购物
                renderDom =
                    // <Col className={'square_right_actlist_col'} span={4} key={key}>
                    //     <div className={'square_right_actbox'} onClick={() => menuEvents('staffshopping')}>
                    //         <img className={'square_right_actlist_i'} src={require('@/common/image/SQ_7.png')}
                    //              alt=""/>
                    //         <div>{type.name}</div>
                    //     </div>
                    // </Col>
                    <li key={key} onClick={() => menuEvents('staffshopping')}>
                        <i className="iconfont icon-yuangonggouwu"></i>
                        <p>{type.name}</p>
                    </li>
                break;
            case '114':
                //查阅AMC
                renderDom =
                    // <Col className={'square_right_actlist_col'} span={4} key={key}>
                    //     <div className={'square_right_actbox'} onClick={() => menuEvents('AMCMon')}>
                    //         <img className={'square_right_actlist_i'} src={require('@/common/image/SQ_9.png')}
                    //              alt=""/>
                    //         <div>{type.name}</div>
                    //     </div>
                    // </Col>
                    <li key={key} onClick={() => menuEvents('AMCMon')}>
                        <Icon type="idcard" />
                        <p>{type.name}</p>
                    </li>
                break;
            case '220':
                //小票复制
                renderDom =
                    // <Col className={'square_right_actlist_col'} span={4} key={key}>
                    //     <div className={'square_right_actbox'} onClick={() => menuEvents('copyBill', 'open')}>
                    //         <Icon type="copy"  className={'square_right_actlist_i'} />
                    //         <div>{type.name}</div>
                    //     </div>
                    // </Col>
                    <li key={key} onClick={() => menuEvents('copyBill', 'open')}>
                        <Icon type="copy" />
                        <p>{type.name}</p>
                    </li>
                break;
            case '211':
                //增值
                renderDom =
                    // <Col className={'square_right_actlist_col'} span={4} key={key}>
                    //     <div className={'square_right_actbox'} onClick={() => menuEvents('rechargeCard')}>
                    //         <img className={'square_right_actlist_i'} src={require('@/common/image/SQ_6.png')}
                    //              alt=""/>
                    //         <div>{type.name}</div>
                    //     </div>
                    // </Col>
                    <li key={key} onClick={() => menuEvents('rechargeCard')}>
                        {/* <i className="iconfont icon-zengzhi"></i> */}
                        <i className="iconfont icon-zengzhi"></i>
                        <p>{type.name}</p>
                    </li>
                break;
            case '106':
                //打开钱箱
                renderDom =
                    // <Col className={'square_right_actlist_col'} span={4} key={key}>
                    //     <div className={'square_right_actbox'} onClick={() => menuEvents('openCashbox')}>
                    //         <Icon type="hdd" className={'square_right_actlist_i'}/>
                    //         <div>{type.name}</div>
                    //     </div>
                    // </Col>
                    <li key={key} onClick={() => menuEvents('openCashbox')}>
                        <Icon type="hdd" />
                        <p>{type.name}</p>
                    </li>
                break;
            case '223':
                //呼叫信息
                renderDom =
                    // <Col className={'square_right_actlist_col'} span={4} key={key}>
                    //     <div className={'square_right_actbox'} onClick={() => menuEvents('callConfirm')}>
                    //         <Icon type="phone" className={'square_right_actlist_i'}/>
                    //         <div>{type.name}</div>
                    //     </div>
                    // </Col>
                    <li key={key} onClick={() => menuEvents('callConfirm')} >
                        <Icon type="phone" />
                        <p>{type.name}</p>
                    </li>
                break;
            case '226':
                //会员入会 新申请
                renderDom =
                    // <Col className={'square_right_actlist_col'} span={4} key={key}>
                    //     <div className={'square_right_actbox'} onClick={() => menuEvents('applyVip', '1')}>
                    //         <Icon type="usergroup-add"  className={'square_right_actlist_i'} />
                    //         <div>{type.name}</div>
                    //     </div>
                    // </Col>
                    <li key={key} onClick={() => menuEvents('applyVip', '1')} >
                        <Icon type="usergroup-add" />
                        <p>{type.name}</p>
                    </li>
                break;
            case '229':
                //app入会
                renderDom =
                    // <Col className={'square_right_actlist_col'} span={4} key={key}>
                    //     <div className={'square_right_actbox'} onClick={() => menuEvents('applyVip', '2')}>
                    //         <Icon type="mobile"  className={'square_right_actlist_i'} />
                    //         <div>{type.name}</div>
                    //     </div>
                    // </Col>
                    <li key={key} onClick={() => menuEvents('applyVip', '2')} >
                        <Icon type="mobile" />
                        <p>{type.name}</p>
                    </li>
                break;
            case '228':
                //会员续费
                renderDom =
                    // <Col className={'square_right_actlist_col'} span={4} key={key}>
                    //     <div className={'square_right_actbox'} onClick={() => menuEvents('rechargeVip')}>
                    //         <Icon type="solution"  className={'square_right_actlist_i'} />
                    //         <div>{type.name}</div>
                    //     </div>
                    // </Col>
                    <li key={key} onClick={() => menuEvents('rechargeVip')} >
                        <Icon type="solution" />
                        <p>{type.name}</p>
                    </li>
                break;
            case '117':
                //查价
                renderDom =
                    // <Col className={'square_right_actlist_col'} span={4} key={key}
                    //      onClick={() => menuEvents('selectPrice')}>
                    //     <div className={'square_right_actbox'}>
                    //         <img className={'square_right_actlist_i'} src={require('@/common/image/presale_05.png')}
                    //              alt=""/>
                    //         <div>{type.name}</div>
                    //     </div>
                    // </Col>
                    <li key={key}
                        onClick={() => menuEvents('selectPrice')}>
                        <i className="iconfont icon-chajia"></i>
                        <p>{type.name}</p>
                    </li>
                break;
            case '221':
                //全日通
                renderDom =
                    // <Col className={'square_right_actlist_col'} span={4} key={key}
                    //     onClick={() => menuEvents('oneDayPassport')}>
                    //     <div className={'square_right_actbox'}>
                    //         <Icon type="wallet" className={'square_right_actlist_i'} />
                    //         <div>{type.name}</div>
                    //     </div>
                    // </Col>
                    <li key={key} onClick={() => menuEvents('oneDayPassport')} >
                        <Icon type="wallet" />
                        <p>{type.name}</p>
                    </li>
                break;
            case '212':
                //查阅OTP && 查阅八达通
                renderDom =
                    // <Col className={'square_right_actlist_col'} span={4} key={key}
                    //         onClick={() => menuEvents('readCard')}>
                    //         <div className={'square_right_actbox'}>
                    //         <img className={'square_right_actlist_i'} src={require('@/common/image/SQ_8.png')}
                    //              alt=""/>
                    //             <div>{type.name}</div>
                    //         </div>
                    // </Col>
                    <li key={key} onClick={() => menuEvents('readCard')}>
                        <Icon type="credit-card" />
                        <p>{type.name}</p>
                    </li>
                break;
            case '107':
                renderDom =
                    // <Col className={'square_right_actlist_col'} span={4} key={key}
                    //     onClick={() => menuEvents('onOffPrint')}>
                    //     <div className={'square_right_actbox'}>
                    //         <img className={'square_right_actlist_i'} src={require('@/common/image/presale_04.png')}
                    //              alt=""/>
                    //         <div>{type.name}</div>
                    //     </div>
                    // </Col>
                    <li key={key} onClick={() => menuEvents('onOffPrint')}>
                        <i className="iconfont icon-zhongyin"></i>
                        <p>{type.name}</p>
                    </li>
                break;
            case '121':
                //离线
                renderDom =
                    // <Col className={'square_right_actlist_col'} span={4} key={key}
                    //      onClick={() => menuEvents('onoffonline')}>
                    //     <div className={'square_right_actbox'}>
                    //         <Icon type={this.props.online == '0' ? "wifi" : "disconnect"} className={'square_right_actlist_i'}></Icon>
                    //         {this.props.online == '0' ? <div>{intl("MENU_ONLINE")}</div> : <div>{intl("MENU_OFFLINE")}</div>}
                    //     </div>
                    // </Col>
                    <li key={key} onClick={() => menuEvents('onlineofflineModel')}>
                        <Icon type={this.props.online != '1' ? "wifi" : "disconnect"}></Icon>
                        {this.props.online != '1' ? <p>{intl("MENU_ONLINE")}</p> : <p>{intl("MENU_OFFLINE")}</p>}
                    </li>
                break;
            case '116': 
                //查货
                renderDom =
                // <Col className={'square_right_actlist_col'} span={4} key={key}
                //      onClick={() => menuEvents('selectGoods')}>
                //     <div className={'square_right_actbox'}>
                //         <img className={'square_right_actlist_i'} src={require('@/common/image/02.png')}
                //                  alt=""/>
                //         <div>{type.name}</div>
                //     </div>
                // </Col>
                <li key={key}
                    onClick={() => menuEvents('selectGoods')}>
                    <i className="iconfont icon-chahuo"></i>
                    <p>{type.name}</p>
                </li>
                break;
            case '225': 
                //全单外卖
                renderDom =
                    // <Col className={'square_right_actlist_col'} span={4} key={key}
                    //      onClick={() => menuEvents('changeEatWay')}>
                    //     <div className={'square_right_actbox'}>
                    //         <img className={'square_right_actlist_i'}
                    //             src={require('@/common/image/changeEatWay.png')}
                    //              alt=""/>
                    //         <div>{type.name}</div>
                    //     </div>
                    // </Col>
                    <li key={key}
                        onClick={() => menuEvents('changeEatWay')}>
                        {/* <i className="iconfont icon-chahuo"></i> */}
                        <Icon type="bell" />
                        <p>{this.props.eatWay === 2 ? '全单堂食' : '全单外卖'}</p>
                    </li>
                break;
                case '217': 
                //传呼器
                renderDom =
                    <li key={key}
                        onClick={() => menuEvents('changePager')}>
                        <Icon type="printer" />
                        <p>{type.name}</p>
                    </li>
                break;
            case 'more':
                renderDom =
                    // <Col className={'square_right_actlist_col'} span={4} key={key}>
                    //     <div className={'square_right_actbox'} onClick={() => this.handleMenuList('more')}>
                    //         <img className={'square_right_actlist_i'} src={require('@/common/image/presale_0501.png')}
                    //              alt=""/>
                    //         <div>{type.name}</div>
                    //     </div>
                    // </Col>
                    <li key={key}
                        onClick={() => this.handleMenuList('more')}>
                        <i className=" iconfont icon-shouqi"></i>
                        <p>{type.name}</p>
                    </li>
                break;
            case 'blank':
                renderDom =
                // <Col className={'square_right_actlist_col'} span={4} key={key}>
                // </Col>
                <li key={key}></li>
                break;
            case 'collapse':
                renderDom =           
                    // <Col className={'square_right_actlist_col'} span={4} key={key} style = {{position: 'absolute', bottom: '0px', right: '29px'}}>
                    //     <div className={'square_right_actbox'} onClick={() => this.handleMenuList('collapse')}>
                    //         <img className={'square_right_actlist_i'} src={require('@/common/image/presale_0502.png')}
                    //              alt=""/>
                    //         <div>{type.name}</div>
                    //     </div>
                    // </Col>
                    <li key={key}
                        className="presale_menu_more"
                        onClick={() => this.handleMenuList('collapse')}>
                        <Icon type="up-circle-o" />
                        <p>{type.name}</p>
                    </li>
                break;
            default:
                renderDom =
                // <Col className={'square_right_actlist_col'} span={4} key={key}>
                //     <div className={'square_right_actbox'} style={{color: '#ccc'}}>
                //         <Icon type="frown-o"  className={'square_right_actlist_i'} />
                //         <div>{type.name}</div>
                //     </div>
                // </Col>
                <li key={key} style={{ color: '#ccc' }}>
                    <Icon type="frown-o" />
                    <p>{type.name}</p>
                </li>
            break;
        }
        return renderDom;
    }

    render() {
        return (
            // <div className={'square_right_action'}>
            //     {/* <Row className={'square_right_actlist'}>
            //         <div className={'square_right_actlist_boxs'}>
            //             {this.state.menuListShow.map((item, index) => this.handleMenuRender(item, index))}
            //         </div>
            //     </Row> */}
            // </div>
            <div className="presale_menu">
            <div className="presale_menu_content" ref="presale_menu">
                <ul>
                    {this.state.menuListShow.map((item, index) => this.handleMenuRender(item, index))}
                </ul>
            </div>
            <div></div>
        </div>
        );
    }
}

export default OperateMenu;