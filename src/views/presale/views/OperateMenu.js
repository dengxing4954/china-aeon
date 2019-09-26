import React, { Component } from 'react';
import OperateMenuKey from './OperateMenuKey.js';
import withKeyBoard from '@/common/components/keyBoard';
import { Icon } from 'antd';
import intl from 'react-intl-universal';
import message from '@/common/components/message';

const homeIcon = require('@/common/image/home.png');
const lockIcon = require('@/common/image/lock.png');
const moreIcon = require('@/common/image/more.png');
const wholecancelIcon = require('@/common/image/wholecancel.png');
const callupIcon = require('@/common/image/menu_03.png')
const collapseIcon = require('@/common/image/collapse.png');

class OperateMenu extends Component {
    constructor(props) {
        super(props);
        this.state = {
            menuList: [],
            menuListShow: [],
            totalQty: 12,
            rowQty: 5,
            selectedMenu: 0,
            showMoreMenu: false,
            menuIndex: 0
        };
    }
    componentDidMount() {
        console.log("this.prop.initialState", this.props.initialState)
        this.props.onRef(this);
        let menuList = [];
        try {
            //获取menuList
            menuList = this.props.menuFilter(this.props.menuList.presskeys.find(item => item.sale).sale);
            this.setState({ menuList })
            this.initMenuList(menuList);
        } catch (err) {

        }
        this.props.bind({
            '37': () => {
                console.log('menu left', this.state.selectedMenu)
                this.handleKeyLeft()
            },
            "38": () => {
                console.log('menu up', this.state.selectedMenu)
                this.handleKeyUp()
            },
            "39": () => {
                console.log('menu right', this.state.selectedMenu)
                this.handleKeyRight()
            },
            "40": () => {
                console.log('menu down', this.state.selectedMenu)
                this.handleKeyDown()
            },
            "13": () => {
                console.log('enter')
            }
        })
    }

    componentWillMount() {
    }

    componentWillReceiveProps(nextProps) {
    }

    handleKeyLeft = () => {
        console.log("handleKeyLeft")
        if (this.state.selectedMenu > 0) {
            this.setState({
                selectedMenu: this.state.selectedMenu - 1
            })
        } else {
            this.setState({
                selectedMenu: 0
            })
        }
    }

    handleKeyUp = () => {
        if (this.state.selectedMenu > this.state.rowQty - 1) {
            this.setState({
                selectedMenu: this.state.selectedMenu - this.state.rowQty
            })
        }
    }

    handleKeyRight = () => {
        console.log("handleKeyRight")
        if (this.state.selectedMenu < this.state.menuListShow.length - 1) {
            this.setState({
                selectedMenu: this.state.selectedMenu + 1
            })
        }
    }

    handleKeyDown = () => {
        console.log("handleKeyDown")
        if (this.state.selectedMenu < this.state.menuListShow.length - this.state.rowQty) {
            this.setState({
                selectedMenu: this.state.selectedMenu + this.state.rowQty
            })
        }
    }

    handleKeySelect = () => {
        console.log('handleKeySelect')
        const { menuListShow, selectedMenu } = this.state;
        const code = menuListShow[selectedMenu].code;
        const key = this.keyEvents[menuListShow[selectedMenu].code]
        if (key) {
            if (key === 'more' || key === 'collapse') {
                this.handleMenuList(key);
            } else {
                this.props.menuEvents(key);
            }
        }
    }

    //菜单展开或收起
    handleMenuList = (type) => {
        const { totalQty, rowQty } = this.state;
        let menuListShow = [];
        if (type === 'more') {
            const { menuList } = this.state;
            if (menuList.length % rowQty === 0 && menuList.length > totalQty - 1) {
                menuListShow = [...menuList, { code: 'blank' }, { code: 'collapse' }];
            } else {
                menuListShow = [...menuList, { code: 'collapse' }];
            }
        } else {
            menuListShow = [...this.state.menuListShow];
            menuListShow.splice(totalQty - 1, menuListShow.length - (totalQty - 1));
            menuListShow.push({ code: 'more' });
            this.setState({
                selectedMenu: this.state.totalQty - 1
            })
        }
        this.setState({ menuListShow }, () => {
            if (type === 'more') {
                const menuRef = this.refs.presale_menu;
                menuRef.scrollTop = menuRef.scrollHeight;
            }
        })
    }

    //初始化菜单列表
    initMenuList = (menuList) => {
        const { totalQty } = this.state;
        let menuListShow = [...menuList];
        if (menuListShow.length > totalQty) {
            menuListShow.splice((totalQty - 1), menuListShow.length - (totalQty - 1))
            menuListShow.push({ code: 'more' })
        }
        console.log(menuListShow);
        this.setState({ menuListShow });
        this.props.setMenuLength(menuListShow.length);
    }

    //渲染菜单列表
    handleMenuRender = (type, key) => {
        const { menuEvents, billList } = this.props;
        let renderDom = null, event = null;
        switch (type.code) {
            case '201':
                //取消整单
                renderDom =
                    <div key={key} onClick={() => menuEvents('delBill')}>
                        <i className="iconfont icon-dingdanquxiao"></i>
                        <p>{type.name}</p>
                    </div>
                event = () => menuEvents('delBill')
                break;
            case '202':
                //整单折扣
                renderDom =
                    <div key={key} onClick={() => menuEvents('discountBill')}>
                        <i className="iconfont icon-quandanzhe"></i>
                        <p>{type.name}</p>
                    </div>
                event = () => menuEvents('discountBill')
                break;
            case '203':
                //整单折让
                renderDom =
                    <div key={key} onClick={() => menuEvents('rebateBill')}>
                        <i className="iconfont icon-quandanzhe1"></i>
                        <p>{type.name}</p>
                    </div>
                event = () => menuEvents('rebateBill')
                break;
            case '204':
                //暂存
                renderDom =
                    <div key={key} onClick={() => menuEvents('saveBill')}>
                        <i className="iconfont icon-zancun"></i>
                        <p>{type.name}</p>
                    </div>
                event = () => menuEvents('saveBill')
                break;
            case '205':
                //解挂
                renderDom =
                    <div key={key} onClick={() => menuEvents('searchBill')}>
                        <i className="iconfont icon-jiegua"></i>
                        <span className="badge">{this.props.billList.length}</span>
                        <p>{type.name}</p>
                    </div>
                event = () => menuEvents('searchBill')
                break;
            case '208':
                //员工购物
                renderDom =
                    <div key={key} onClick={() => menuEvents('staffshopping')}>
                        <i className="iconfont icon-yuangonggouwu"></i>
                        <p>{type.name}</p>
                    </div>
                event = () => menuEvents('staffshopping')
                break;
            case '220':
                //小票复制
                renderDom =
                    <div key={key} onClick={() => menuEvents('copyBill')}>
                        <Icon type="copy" />
                        <p>{type.name}</p>
                    </div>
                event = () => menuEvents('copyBill')
                break;
            case '121':
                //脱机 联网
                renderDom =
                    <div key={key} onClick={() => menuEvents('onlineofflineModel')}>
                        <Icon type={this.props.online != '1' ? "wifi" : "disconnect"}></Icon>
                        {this.props.online != '0' ? <p>{intl.get("MENU_OFFLINE")}</p> : <p>{intl.get("MENU_ONLINE")}</p>}
                    </div>
                event = () => menuEvents('onlineofflineModel')
                break;
            case '122':
                //修改密码
                renderDom =
                    <div key={key} onClick={() => menuEvents('changePassword')}>
                        <i className={"iconfont icon-bianji"}></i>
                        <p>{type.name}</p>
                    </div>
                event = () => menuEvents('changePassword')
                break;
            case '210':
                //预销售
                renderDom =
                    <div key={key} onClick={() => menuEvents('easyPay')}>
                        <Icon type="qrcode" />
                        <p>{type.name}</p>
                    </div>
                event = () => menuEvents('easyPay')
                break;
            case '211':
                //增值
                renderDom =
                    <div key={key} onClick={() => menuEvents('rechargeCard')}>
                        <i className="iconfont icon-zengzhi"></i>
                        <p>{type.name}</p>
                    </div>
                event = () => menuEvents('rechargeCard')
                break;
            case '212':
                //查阅OTP
                renderDom =
                    <div key={key} onClick={() => menuEvents('readCard')}>
                        <Icon type="credit-card" />
                        <p>{type.name}</p>
                    </div>
                event = () => menuEvents('readCard')
                break;
            case '218':
                //行送
                renderDom =
                    <div key={key} onClick={() => menuEvents('sdDelivery', 'isSd')}>
                        <Icon type="shop" />
                        <p>{type.name}</p>
                    </div>
                event = () => menuEvents('sdDelivery', 'isSd')
                break;
            case '219':
                //DC送货
                renderDom =
                    <div key={key} onClick={() => menuEvents('dcDelivery')}>
                        <Icon type="inbox" />
                        <p>{type.name}</p>
                    </div>
                event = () => menuEvents('dcDelivery')
                break;
            case '230':
                //定金230
                renderDom =
                    <div key={key} onClick={() => menuEvents('sdDelivery', 'isDj')}>
                        <Icon type="layout" />
                        <p>{type.name}</p>
                    </div>
                event = () => menuEvents('sdDelivery', 'isDj')
                break;
            case '114':
                //查询会员
                renderDom =
                    <div key={key} onClick={() => menuEvents('searchAMC')}>
                        <Icon type="idcard" />
                        <p>{type.name}</p>
                    </div>
                event = () => menuEvents('searchAMC')
                break;
            case '107':
                //重印
                renderDom =
                    <div key={key} onClick={() => menuEvents('onOffPrint')}>
                        <i className="iconfont icon-zhongyin"></i>
                        <p>{type.name}</p>
                    </div>
                event = () => menuEvents('onOffPrint')
                break;
            case '116':
                //查货
                renderDom =
                    <div key={key}
                        onClick={() => menuEvents('SelectGoodsPrice', 'goodsModal')}>
                        <i className="iconfont icon-chahuo"></i>
                        <p>{type.name}</p>
                    </div>
                event = () => menuEvents('SelectGoodsPrice', 'goodsModal')
                break;
            case '117':
                //查价
                renderDom =
                    <div key={key}
                        onClick={() => menuEvents('SelectGoodsPrice', 'priceModal')}>
                        <i className="iconfont icon-chajia"></i>
                        <p>{type.name}</p>
                    </div>
                event = () => menuEvents('SelectGoodsPrice', 'priceModal')
                break;
            case '221':
                //全日通
                renderDom =
                    <div key={key} onClick={() => menuEvents('oneDayPassport')} >
                        <Icon type="wallet" />
                        <p>{type.name}</p>
                    </div>
                event = () => menuEvents('oneDayPassport')
                break;
            case '222':
                //副单
                renderDom =
                    <div key={key} onClick={() => menuEvents('onOffPrint', 'A')} >
                        <Icon type="printer" />
                        <p>{type.name}</p>
                    </div>
                event = () => menuEvents('onOffPrint', 'A')
                break;
            case '223':
                //呼叫信息
                renderDom =
                    <div key={key} onClick={() => menuEvents('callConfirm')} >
                        <Icon type="phone" />
                        <p>{type.name}</p>
                    </div>
                event = () => menuEvents('callConfirm')
                break;
            case '224':
                //游戏币活动查询
                renderDom =
                    <div key={key} onClick={() => menuEvents('queryGameCoin', true)} >
                        <Icon type="pay-circle-o" />
                        <p>{type.name}</p>
                    </div>
                event = () => menuEvents('queryGameCoin', true)
                break;
            case '226':
                //会员入会
                renderDom =
                    <div key={key} onClick={() => menuEvents('applyVip', '1')} >
                        <Icon type="usergroup-add" />
                        <p>{type.name}</p>
                    </div>
                event = () => menuEvents('applyVip', '1')
                break;
            case '227':
                //优惠集
                renderDom =
                    <div key={key} onClick={() => menuEvents('addVipCoupon')} >
                        <Icon type="red-envelope" />
                        <p>{type.name}</p>
                    </div>
                event = () => menuEvents('addVipCoupon')
                break;
            case '228':
                //会员续费
                renderDom =
                    <div key={key} onClick={() => menuEvents('rechargeVip')} >
                        <Icon type="solution" />
                        <p>{type.name}</p>
                    </div>
                event = () => menuEvents('rechargeVip')
                break;
            case '229':
                //app入会
                renderDom =
                    <div key={key} onClick={() => menuEvents('applyVip', '2')} >
                        <Icon type="mobile" />
                        <p>{type.name}</p>
                    </div>
                event = () => menuEvents('applyVip', '2')
                break;
            case '106':
                //打开钱箱
                renderDom =
                    <div key={key} onClick={() => menuEvents('openCashbox')}>
                        <Icon type="hdd" />
                        <p>{type.name}</p>
                    </div>
                event = () => menuEvents('openCashbox')
                break;
            case '232':
                //尾款单232
                renderDom =
                    <div key={key} onClick={() => menuEvents('onOffPrint', 'T')}>
                        <Icon type="export" />
                        <p>{type.name}</p>
                    </div>
                event = () => menuEvents('onOffPrint', 'T')
                break;
            case '231':
                //印花换购
                renderDom =
                    <div key={key} onClick={() => menuEvents('stampChange')}>
                        <Icon type="gift" />
                        <p>{type.name}</p>
                    </div>
                event = () => menuEvents('stampChange')
                break;
            case '233':
                //授权会员
                renderDom =
                    <div key={key} onClick={() => menuEvents('tempVipLogin')}>
                        <Icon type="tags-o" />
                        <p>{type.name}</p>
                    </div>
                event = () => menuEvents('tempVipLogin')
                break;
            case '234':
                //換卡
                renderDom =
                    <div key={key} onClick={() => menuEvents('activateVip')}>
                        <Icon type="contacts" />
                        <p>{type.name}</p>
                    </div>
                event = () => menuEvents('activateVip')
                break;
            case 'more':
                renderDom =
                    <div key={key}
                        onClick={() => this.handleMenuList('more')}>
                        <i className="iconfont icon-gengduo"></i>
                        <p>更多</p>
                    </div>
                break;
            case 'collapse':
                renderDom =
                    <div key={key}
                        onClick={() => this.handleMenuList('collapse')}>
                        <i className="iconfont icon-shouqi"></i>
                        <p>收起</p>
                    </div>
                break;
            case 'blank':
                renderDom =
                    <div key={key}></div>
                break;
            default:
                renderDom =
                    <div key={key} style={{ color: '#ccc' }}>
                        <Icon type="frown-o" />
                        <p>{type.name}</p>
                    </div>
                break;
        }
        return { renderDom, event };
    }

    handleMenuKey = (menuList) => {
        return menuList.map((item, index) => {
            let menu = this.handleMenuRender(item, index);
            return {
                ...item,
                render: () => menu.renderDom,
                event: menu.event,
            }
        })
    }

    toggleMoreMenu = () => {
        this.setState((state, props) => ({
            showMoreMenu: !state.showMoreMenu
        }))
    }

    getBillDetail = () => {
        if (this.props.initialState.flowNoList && this.props.initialState.flowNoList.length === 0) {
            message("当前没有待付款单据")
            return;
        }
        if (this.props.goodsList.length !== 0) {
            message("请先处理上一单")
            return
        }
        this.props.getBillDetail()
    }

    render() {
        const { menuEvents } = this.props;
        if (this.props.showLeftMenu === 'right') {
            return (
                <div className="presale_menu">
                    <div className="presale_menu_content">
                        <ul>
                            <li onClick={() => { this.getBillDetail() }}>
                                <img src={callupIcon} alt="" />
                                <p>调出</p>
                                <span className="badge">{this.props.initialState.flowNoList ? this.props.initialState.flowNoList.length : 0}</span>
                            </li>
                            <li>
                                <img src={wholecancelIcon} alt="" onClick={() => menuEvents('delBill')} />
                                <p>整单取消</p>
                            </li>
                            <li>
                                <img src={lockIcon} alt="" onClick={() => menuEvents('delBill')} />
                                <p>锁定POS</p>
                            </li>
                            <li>
                                <img src={homeIcon} alt="" onClick={() => menuEvents('goHome')} />
                                <p>HOME</p>
                            </li>
                            <li onClick={() => { this.props.toggleMoreMenu() }}>
                                <img src={this.props.showMoreMenu ? collapseIcon : moreIcon} alt="" />
                                <p>{this.state.showMoreMenu ? '收起' : '更多'}</p>
                            </li>
                        </ul>
                    </div>
                    <div className={`presale_menu_content_hide ${this.props.showMoreMenu ? 'show' : ''}`} ref="presale_menu">
                        <ul>
                            {this.state.menuListShow.map((item, index) =>
                                <li key={index}
                                    className={`${this.props.keyControl && index === this.props.selectedMenu ? 'selected' : ''} 
                                    ${item.code === 'more' || item.code === 'collapse' ? 'presale_menu_more' : ''}`}>
                                    {this.handleMenuRender(item, index).renderDom}
                                </li>
                            )}
                        </ul>
                    </div>
                    <div></div>
                </div>

            );
        } else if (this.props.showLeftMenu === 'menu') {
            return (
                <OperateMenuKey
                    billList={this.props.billList}
                    list={this.handleMenuKey(this.props.keyMenuList)}
                    className="presale_menu presale_menu_key"
                    rowQty={Math.ceil(this.props.keyMenuList.length / 7)}
                    rowWidth={100}
                    totalQty={this.props.keyMenuList.length}
                    onExit={this.props.onExit}
                    defaultKeys={this.props.defaultKeys} />
            )
        } else {
            return (
                <div></div>
            )
        }
    }
}

export default withKeyBoard(OperateMenu);
// export default OperateMenu;
