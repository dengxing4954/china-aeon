import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import moment from 'moment';
import PreSaleLeft from './PreSaleLeft.js';
import PreSaleRight from './PreSaleRight.js';
import PreSaleTop from './PreSaleTop.js';
import actions from '../Actions.js';
import hActions from '../../home/Actions';
import { updateXPH } from '@/views/initialize/Actions.js'
import { bill } from '../../initialize/Actions.js';
import { connect } from 'react-redux';
import { Modal, Radio, Icon, Button, Progress } from 'antd';
import message from '@/common/components/message';
import posNewsNotify from '@/common/components/posnews';
import KeyBoard from '@/utils/keyboard.js';
import withKeyBoard from '@/common/components/keyBoard';
import '../style/presale.less';
import EditGood from './EditGood.js';
import PrintAgain from '@/common/components/printAgain/index.js';
import RechargeKeypad from '@/common/components/rechargeKeypad/index.js';
import ExtraPayModal from '@/common/components/extraPay/index.js';
import OperateMenu from './OperateMenu.js';
import OperateMenuKey from './OperateMenuKey.js';
import SearchBill from './SearchBill.js';
import Delivery from './Delivery.js';
import OtpInfo from './OtpInfo.js';
import SaleMemo from '@/common/components/saleMemo/index.js';
import EasyPay from './EasyPay.js';
import CopyBill from './CopyBill.js';
import ChangePassword from './ChangePassword.js';
import SearchAMC from './SearchAMC.js';
import ExceptOldModal from './ExceptOldModal.js';
import OneDayPassport from './OneDayPassport.js';
import QueryGameCoin from './QueryGameCoin.js';
import SelectGoods from '@/views/home/views/SelectGoods.js';
import SelectPrice from '@/views/home/views/SelectPrice.js';
import EventEmitter from '@/eventemitter';
import { setState } from "../../initialize/Actions";
import intl from 'react-intl-universal';
import StampChange from './StampChange.js';
import { Fetch } from '@/fetch/';
import Url from '@/config/url.js';
import Confirm from '@/common/components/confirm';
import CallInfo from '@/common/components/callInfo';
import Footer from '../../footer'

const confirm = Confirm;
const RadioGroup = Radio.Group;

//状态组件
class PreSaleService extends Component {

    constructor(props) {
        super(props);
        this.state = {
            //shopCode : mkt
            //terminalNo: syjh
            //terminalSno:fphm
            //selfGoods: [],快捷商品功能键
            goodsList: [],  //商品列表
            flow_no: '',  //小票号
            totalData: {    //合计数据
                num: 0,
                price: 0,
                discounts: 0,
                totalPrice: 0,
            },
            pagination: {   //分页参数
                pageSize: 4,
                current: 1,
                size: 'large'
            },
            vipInfo: {},
            vipCardNo: '',
            staffcard: '',
            tempVip: false,
            //goodsListId: 0,     临时代替小票号
            calcMode: 0,
            guidList: "",
            chooseGoodsList: [],
            chooseGoodsModal: false,
            exceptOldModal: false,  //除旧方式
            exceptOldGoodslist: [],
            billListModal: false,
            copyBillModal: false,   //小票复制
            searchAMCModal: false,   //查阅amc
            PrintModal: false, //重印窗口
            modalType: false, //false为重印true为副单
            tail: false, //尾款单按钮
            printInfo: false,
            oneDayPassportModal: false, //全日通窗口
            shaffshop: false,
            addGoodsTime: "", //首次添加商品的时间
            djlb: "", //单据类别y1-》券销售
            easyPay: false,
            easyPayModal: false,
            changePasswordModal: false,//修改密码状态
            octozz: null, //八达通增值/会员续费/入会
            online: '0',
            isDc: false,    //配送中心送货
            isSd: false,    //供应商送货
            isDj: false,    //定金支付
            dcData: {},
            salesMemo: '',
            deleteNum: 0,  //已删除商品行数
            switchEng: false,//是否切换英文单
            giftList: [],//是否切换英文单
            goodsModal: false,//查货
            priceModal: false,//查价
            callValue: undefined, //呼叫信息
            gameCoinModal: false,//游戏币活动查询
            coinEvents: [],//游戏币活动列表,
            //expressNumber: '', //送货单号
            stampChangeVisible: false, //印花换购
            stampGoodsInfo: {},//印花换购商品信息
            stampGoodsFlag: false, //印花换购Flag
            stampBarcode: '', //印花换购输入barcode
            stampFlowNo: '',
            stampGuid: '',
            ejouralList: [],
            tempZzk: 100,
            tempZzr: 0,
            //数据同步进度
            percent: 0,
            progressModal: false,
            // pause: false,
            havedata: 0,
            uuid: 0,
            isJFXH: false, //是否积分续会,
            djValue: "",

            //*************************************** */
            showLeftMenu: 'right',
            keyControl: true,
            selectedGoods: 0,
            brandsData: [],
            kindsData: [],
            editModalVisible: false,
            editGoodsIndex: null,
            menuList: [],
            showMoreMenu: false,
            selectedMenu: 0,
            menuLength: 0,
            rowMenuQty: 5
        };
        this.drawerRef = null;
        this.submitMessage = '';
        this.addGoodsList = [];
    }

    componentWillMount() {
        // this.props.setState({ drawer: '4' });
        // window.getCashboxStatus();
    }

    componentDidMount() {
        this.handleBrandsInit();
        this.commonKeys = {
            //f5
            "116": this.repullSale,
            //f6
            "117": this.submit,
            //f7
            "118": this.cancel,
        }
        if (this.state.keyControl) {
            this.props.bind({
                //pageUP
                "33": () => {
                    if (this.state.showLeftMenu && this.state.showLeftMenu !== 'right') {
                        this.operateMenuRef.handleKeyLeft();
                    } else {
                        this.handleGoodsSelect('left');
                        //this.delBill()
                    }
                },
                //pageDown
                "34": () => {
                    if (this.state.showLeftMenu && this.state.showLeftMenu !== 'right') {
                        this.operateMenuRef.handleKeyRight();
                    } else {
                        this.handleGoodsSelect('right');
                        //this.loginVip();
                    }
                },
                //end
                "35": () => {
                    if (this.state.showLeftMenu && this.state.showLeftMenu !== 'right') {
                        this.handleLeftMenu(false)
                    }
                },
                //home
                "36": () => {
                    if (this.state.showLeftMenu && this.state.showLeftMenu !== 'right') {
                        this.operateMenuRef.handleKeySelect();
                    } else {
                        if (document.getElementsByTagName('input').length === 1) {
                            document.getElementById('codeInput').focus();
                        }
                    }
                },
                //左箭头
                "37": () => {
                    if (this.state.showMoreMenu) {
                        if (this.state.selectedMenu !== 0) {
                            this.setState({
                                selectedMenu: this.state.selectedMenu - 1
                            })
                        }
                    }
                    console.log("left arrow")
                },
                //上箭头
                "38": () => {
                    console.log("up arrow")
                    if (this.state.showMoreMenu) {
                        if (this.state.selectedMenu > this.state.rowMenuQty - 1) {
                            this.setState({
                                selectedMenu: this.state.selectedMenu - this.state.rowMenuQty
                            })
                        }
                    }
                    if (this.state.showLeftMenu && this.state.showLeftMenu !== 'right') {
                        this.operateMenuRef.handleKeyUp();
                    } else {
                        this.handleGoodsSelect('up');
                        //this.repullSale()
                    }
                },
                //右键头
                "39": () => {
                    console.log('right arrow', this.state.selectedMenu, this.state.menuLength)
                    if (this.state.showMoreMenu) {
                        if (this.state.selectedMenu < this.state.menuLength - 1) {
                            this.setState({
                                selectedMenu: this.state.selectedMenu + 1
                            })
                            // this.setState(state => ({
                            //     selectedMenu: state.selectedMenu + 1
                            // }))
                        } else {
                            this.setState({
                                selectedMenu: 0
                            })
                        }
                    } else {
                        console.log("菜单未显示")
                    }
                    console.log("setSelectedMenu", this.state.selectedMenu, this.state.menuLength)
                },
                //下箭头
                "40": () => {
                    console.log('down arrow', this.state.menuLength, this.state.selectedMenu + this.state.rowMenuQty)
                    if (this.state.showMoreMenu) {
                        if (this.state.selectedMenu + this.state.rowMenuQty < this.state.menuLength) {
                            this.setState({
                                selectedMenu: this.state.selectedMenu + this.state.rowMenuQty
                            })
                        } else {
                            console.log("超出了")
                        }
                    }
                    console.log('down arrow', this.state.menuLength, this.state.selectedMenu)
                    if (this.state.showLeftMenu && this.state.showLeftMenu !== 'right') {
                        this.operateMenuRef.handleKeyDown();
                    } else {
                        this.handleGoodsSelect('down');
                    }
                },
                //f1
                '112': () => {
                    if (this.state.goodsList.length === 0) return;
                    this.handleEditGoods(this.state.selectedGoods)
                },
                //f2
                "113": () => {
                    if (this.state.goodsList.length === 0) return;
                    this.delGoods(this.state.goodsList[this.state.selectedGoods])
                },
                //f3
                '114': () => {
                    if (this.state.goodsList.length === 0) return;
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
                        keyControl: true,
                        callback: (value) => this.editGoods('qty', value, this.state.goodsList[this.state.selectedGoods], this.state.selectedGoods)
                    })
                },
                //f10
                '121': () => this.handleLeftMenu('brands'),
                //f11 '122'
                //f12
                '123': () => this.handleLeftMenu('menu'),
                '13': () => {
                    if (this.state.showMoreMenu) {
                        let menuListContainer = document.getElementsByClassName('presale_menu_content_hide');
                        let menuList = menuListContainer[0].firstChild.childNodes;
                        let selectedMenu = menuList[this.state.selectedMenu];
                        let divObj = selectedMenu.firstChild;
                        divObj.click();
                    }


                },
                ...this.commonKeys
            });
        }
        try {
            //绑定点击事件 input框自动聚焦
            window.addEventListener('click', this.autoFocusCodeInput);
            EventEmitter.on('Com', this.autoFocusCodeInput);
            //绑定键盘事件
            KeyBoard.bind(this.keyboard);
            //获取销售内容
            const { goodsList, totalData, calcMode, guidList, flow_no, addGoodsTime, vipInfo, vipCardNo, tempVip, easyPay, deleteNum, switchEng, isDc, isSd, isDj, dcData, salesMemo, djValue, octozz, staffcard, ejouralList, tempZzk, tempZzr, isJFXH } = this.props.state;
            if (flow_no === '' || goodsList.length === 0) {
                this.createSale();
            } else {
                this.setState({
                    goodsList: [...goodsList],
                    totalData: { ...totalData },
                    flow_no,
                    calcMode,
                    guidList,
                    addGoodsTime,
                    vipInfo: { ...vipInfo },
                    vipCardNo,
                    tempVip,
                    staffcard: staffcard ? { ...staffcard } : '',
                    easyPay,
                    deleteNum,
                    switchEng,
                    isDc,
                    isSd,
                    isDj,
                    dcData,
                    salesMemo,
                    djValue,
                    octozz,
                    staffcard,
                    ejouralList,
                    tempZzk,
                    tempZzr,
                    isJFXH
                }, this.props.actions.init())
            }
            let menuList = this.menuFilter(this.props.initialState.data.touchpostemplate.presskeys.find(item => item.sale).sale);
            this.setState({ menuList })
        } catch (err) {

        }
    }

    componentWillUnmount() {
        window.removeEventListener('click', this.autoFocusCodeInput)
        EventEmitter.off('Com', this.autoFocusCodeInput);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.initialState.drawer !== '4' && nextProps.initialState.drawer === '4') {
            setTimeout(() => {
                document.getElementById('codeInput').focus();
            }, 50)
        }
    }

    handleLeftMenu = (type) => {
        this.setState({
            showLeftMenu: type,
        })
    }

    handleBrandsInit = () => {
        try {
            const selfGoods = JSON.parse(JSON.stringify(this.props.initialState.data.selfgoodstemplate.selfGoods[0].goodsDetail));
            if (selfGoods) {
                let brandsData = selfGoods.map((item, index) => {
                    if (item.goods) {
                        item.goods = item.goods.filter(item => item.isExist !== '0')
                    }
                    item.event = index;
                    return {
                        ...item,
                        stallCode: index,
                        render: () =>
                            <div onClick={() => this.handleBrandsChoose(item.goods)}>
                                <p>{item.goodDisplayType}</p>
                            </div>,
                        event: () => this.handleBrandsChoose(item.goods)
                    }
                })
                this.setState({
                    brandsData: brandsData,
                })
            }
        } catch (err) { }
    }

    handleBrandsChoose = (goods) => {
        this.setState({
            kindsData: goods.map(item => ({
                ...item,
                render: () =>
                    <div onClick={() => this.handleKindsChoose(item.barNo)}>
                        <p>{item.goodsName}</p>
                    </div>,
                event: () => this.handleKindsChoose(item.barNo)
            })),
            showLeftMenu: 'kinds'
        })
    }

    handleBrandsExit = (goods) => {
        this.setState({
            kindsData: goods,
            showLeftMenu: false
        })
    }

    handleKindsChoose = (goods) => {
        this.addGoods(goods)
    }

    handleKindsExit = () => {
        this.setState({
            showLeftMenu: 'brands'
        })
    }

    autoFocusCodeInput = () => {
        if (document.getElementsByTagName('input').length === 1) {
            document.getElementById('codeInput').focus();
        }
    }

    handleGoodsSelect = (type) => {
        let { selectedGoods, pagination, goodsList } = this.state;
        let { pageSize, current } = pagination;
        switch (type) {
            case 'up':
                if (selectedGoods > 0) {
                    if (selectedGoods % pageSize === 0 && current > 1) {
                        pagination.current = current - 1;
                    }
                    selectedGoods -= 1;
                }
                break;
            case 'down':
                if (selectedGoods < goodsList.length - 1) {
                    if ((selectedGoods + 1) % pageSize === 0) {
                        pagination.current = current + 1;
                    }
                    selectedGoods += 1;
                }
                break;
            case 'left':
                if (selectedGoods + 1 > pageSize) {
                    pagination.current = current - 1;
                    selectedGoods = (pagination.current - 1) * pageSize;
                }
                break;
            case 'right':
                if (current != Math.ceil(goodsList.length / pageSize)) {
                    pagination.current = current + 1;
                    selectedGoods = (pagination.current - 1) * pageSize;
                }
            default:
                break;
        }
        this.setState({ selectedGoods, pagination })
    }

    handleEditGoods = (index) => {
        this.setState({
            editModalVisible: !this.state.editModalVisible,
            editGoodsIndex: index,
        })
    }

    handleEditGoodsOk = (name, value, qty) => {
        const { editGoodsIndex, goodsList } = this.state;
        return this.editGoods(name, value, goodsList[editGoodsIndex], editGoodsIndex, qty);
    }

    //清空state
    initState = () => {
        this.setState({
            goodsList: [],
            vipInfo: {},
            tempVip: false,
            flow_no: '232323',
            totalData: {
                num: 0,
                price: 0,
                discounts: 0,
                totalPrice: 0,
            },
            pagination: {
                pageSize: 4,
                current: 1,
                size: 'large'
            },
            addGoodsTime: '',
            easyPay: false,
            octozz: null,
            deleteNum: 0,
            isDc: false,
            isSd: false,
            isDj: false,
            dcData: {},
            salesMemo: '',
            djValue: '',
            staffcard: '',
            ejouralList: [],
            tempZzk: 100,
            tempZzr: 0,
            isJFXH: false,


            selectedGoods: 0,
            editModalVisible: false,
            editGoodsIndex: null,
            discountPayFilter: null
        })
        this.props.actions.init();
        window.welcome();
        this.addGoodsList = [];
    }

    //初始化获取订单编号请求
    createSaleReq = (djlb) => {
        let xph = this.props.initialState.xph;
        //如果存在商品 需要挂单 小票号+1
        if (djlb && this.state.goodsList.length > 0) {
            let fphm = xph.substring(xph.length - 6) * 1 + 1;
            if (fphm >= 1000000) fphm = '000001';
            xph = `${xph.substring(0, xph.length - 6)}${fphm}`
        }
        return this.props.actions.createSale({
            terminalOperator: this.props.operators && this.props.operators.gh,
            shopCode: this.props.initialState.mkt,
            shopID: this.props.initialState.mkt,
            terminalNo: this.props.initialState.syjh,
            saleDate: moment().format('YYYY-MM-DD HH:mm:ss'),
            orderType: this.props.initialState.BrowserWindowID == 3 ? "1" : djlb || this.props.state.djlb,
            terminalSno: this.props.initialState.xph,
            channel: 'javapos',
            flag: '0',
            shopName: this.props.initialState.data.mktinfo && this.props.initialState.data.mktinfo.mktname,
            entId: this.props.initialState.entid,
            erpCode: this.props.initialState.jygs,
            //gz: '1',
            //yyyh: "9527",
            language: 'CHN',
            precisionMode: this.props.initialState.data.syjmain[0] && this.props.initialState.data.syjmain[0].sswrfs || '0',
            maxSaleGoodsQuantity: this.props.syspara.maxSaleGoodsQuantity,
            maxSaleGoodsMoney: this.props.syspara.maxSaleGoodsMoney,
            maxSaleMoney: this.props.syspara.maxSaleMoney,
            stallCode: this.props.initialState.data.syjmain[0] && this.props.initialState.data.syjmain[0].stallcode,   //档口编码
            popMode: this.props.initialState.popMode,
            posType: '0',
            scheduleCode: this.props.loginData.workRound,
            fetchFlag: this.props.initialState.BrowserWindowID == 3
        })
    }

    //初始化获取订单编号
    createSale = (djlb, cb) => {
        if ([2].includes(this.props.initialState.BrowserWindowID) && this.props.initialState.flowNoList.length > 0) {
            this.getBillDetailFromFlowList();
        } else {
            this.createSaleReq(djlb).then(res => {
                if (res.flag) {
                    this.setState({
                        flow_no: res.res.flowNo,
                        fphm: res.res.terminalSno,
                        octozz: (djlb === '1' || djlb === 'Y1' || djlb === 'Y7') ? null : djlb
                    })
                    if (!!cb) {
                        cb();
                    }
                } else {
                    Confirm({
                        title: intl.get("INFO_ODERFAIL"),
                        content: res.res,
                        width: 500,
                        className: 'vla-confirm',
                        okText: intl.get("BTN_RETRY"),
                        cancelText: intl.get("BACKTRACK"),
                        onOk: () => {
                            this.createSale();
                        },
                        onCancel: () => {
                            this.props.history.push('/home');
                        }
                    });
                }
            })
        }
    }

    getBillDetailFromFlowList = async () => {
        let { flowNoList } = await this.props.initialState
        if (!flowNoList) return;
        if (flowNoList && flowNoList.length === 0) {
            message('请先添加商品');
            return;
        }
        console.log('getBillDetailFromFlowList', flowNoList)
        this.pullScanList(flowNoList[0]).then(res => {
            if (!res) {
                Confirm({
                    title: intl.get("INFO_ODERFAIL"),
                    content: res.res,
                    width: 500,
                    className: 'vla-confirm',
                    okText: "重试本单",
                    cancelText: "下一单",
                    onOk: () => {
                        this.createSale();
                    },
                    onCancel: () => {
                        let flowNoList = [...this.props.initialState.flowNoList];
                        flowNoList.shift();
                        this.props.setState({ flowNoList });
                        this.createSale();
                    }
                });
            } else {
                let flowNoList = [...this.props.initialState.flowNoList];
                flowNoList.shift();
                this.props.setState({ flowNoList });
            }
        });
    }

    //刷新商品列表 @res接口返回的数据 @index传入index只替换单行(取消这个参数),否则替换全部 @qty修改的数量
    replaceGoodsList = (res, qty) => {
        const { saleValue, totalDiscountValue, oughtPay } = res.order;
        let { goodsList, totalData } = this.state;
        let goodslist = res.order.goodsList;
        if (qty && qty !== 0) {
            totalData.num += qty;
            totalData.num = Math.round(totalData.num * 100) / 100;
        }
        if (goodslist) {
            let num = 0
            goodslist.forEach(item => {
                num += item.qty;
            })
            totalData.num = num
            goodsList = goodslist
        }
        totalData.num = res.order.qty;
        totalData.price = saleValue;
        totalData.discounts = totalDiscountValue;
        totalData.totalPrice = oughtPay;
        this.setState({ goodsList, totalData });
    }

    //@item商品信息 @type 0添加 1删除 2修改数量 3取消整单 4小票复制、快付通 5修改价格 6单行折扣 7单行折让
    // 8整单折扣 9整单折让 10挂单 11解挂 12会员登录、登出
    handleEjoural = (item, type) => {
        /* let titleTxt = '';
        if (type === 11) {
            //解挂
            titleTxt += `      【 取 消 暫 存 交 易 資 料 】\r\n`;
        }
        titleTxt += `SHOP ${this.props.initialState.mkt}/${this.props.initialState.syjh}  REF ${this.props.initialState.syjh + this.props.initialState.fphm}  ${moment().format('DD/MM/YY')}\r\nOPERATOR ${this.props.operators.gh}  ${moment().format('HH:mm:ss')}`;
        //联系模式
        if (this.props.state.djlb === 'Y7') {
            titleTxt += ' [練習模式]';
        }
        //补齐空位
        //const fillLength = (num, n) => (num + '').length < n ? (Array(n).join(" ") + num).slice(-n) : num
        const fillLength = (num, n) => (num + '').padStart(n, ' ')
        const addTxt = (item, index) => {
            let txt = `${fillLength(index, 3)}${item.goodsCode.length === 3 ? '   $$$' + item.goodsCode + ' ' : fillLength(item.goodsCode, 10)}${fillLength(item.qty, 4)}@${fillLength((item.salePrice * 1).toFixed(2), 9)}${fillLength((item.totalDiscountValue ? item.saleValue * 1 : item.saleAmount * 1).toFixed(2), 10)} (${item.artCode}) ${item.listPrice != item.price ? 'OVR' : ''}`
            let otherDisc = item.dsctotal - item.disc;
            //单行折让$
            if (item.tempZrDiscount) {
                txt += `\r\n       DISC. $        ${fillLength('-' + (item.tempZrDiscount * 1).toFixed(2), 15)}`
            }
            //单行折扣%
            if (item.tempZkl && item.tempZkl < 100) {
                txt += `\r\n       DISC. ${fillLength((100 - item.tempZkl).toFixed(2), 5)}%   ${fillLength('-' + (item.tempZkDiscount * 1).toFixed(2), 15)}`
            }
            //其他折扣
            if (otherDisc && otherDisc > 0) {
                txt += `\r\n       DISC           ${fillLength('-' + (otherDisc * 1).toFixed(2), 15)}`
            }
            return txt;
        }
        let { ejouralList } = this.state;
        let index;
        if (type === 1 || type === 2 || type === 5 || type === 6 || type === 7) {
            for (let i = 0; i <= ejouralList.length; i++) {
                if (ejouralList[i].guid === item.guid) {
                    index = i;
                    break;
                }
            }
            ejouralList.push({});
        }
        switch (type) {
            //添加
            case 0:
                let txt;
                if (item.incode === '12952701') {
                    txt = titleTxt;
                } else {
                    txt = addTxt(item, ejouralList.length + 1);
                    if (ejouralList.length === 0) {
                        //SHOP 121/206  REF 2060471  02/10/18
                        txt = `${titleTxt}\r\n${txt}`
                    }
                    ejouralList.push(item);
                }
                window.Log(txt, '1');
                break;
            //删除
            case 1:
                window.Log(`${fillLength(index + 1, 4)}  <-- THIS LINE VOID ${fillLength('-' + (ejouralList[index].ysje * 1).toFixed(2), 12)} ${this.props.operators.gh}`, '1');
                ejouralList[index] = {};
                break;
            //修改数量
            case 2:
                ejouralList.push(item);
                window.Log(`${fillLength(index + 1, 4)}  <-- THIS LINE QTY  ${fillLength('-' + (ejouralList[index].ysje * 1).toFixed(2), 12)} ${this.props.operators.gh}\r\n${addTxt(item, ejouralList.length, 3)}`, '1');
                ejouralList[index] = {};
                break;
            //取消整单
            case 3:
                let na = window.SyncCASHIER({}).na;
                window.Log(`CANCEL    ${this.state.octozz === 'Y3' ? '' : fillLength('-' + (item.totalPrice * 1).toFixed(2), 27)} \r\nN.A. : ${na.toFixed(2)}\r\n**************************************`, '1');
                break;
            //小票复制 快付通 解挂
            case 4:
            case 11:
                ejouralList = [...item];
                let ejouralTxt = titleTxt;
                item.forEach((_item, _index) => {
                    ejouralTxt += `\r\n${addTxt(_item, _index + 1, 3)}`
                })
                //if(tempZzk: 100,tempZzr: 0)
                if (this.state.tempZzk < 100) {
                    ejouralTxt += `\r\n  T. AMT DISC ${fillLength(((100 - this.state.tempZzk) * 1).toFixed(2), 10)} %`
                }
                if (this.state.tempZzr) {
                    ejouralTxt += `\r\n  T. AMT DISC ${fillLength((this.state.tempZzr * 1).toFixed(2), 10)} $`
                }
                window.Log(ejouralTxt, '1');
                break;
            //修改价格
            case 5:
                ejouralList.push(item);
                window.Log(`${fillLength(index + 1, 4)}  <-- THIS LINE PRICE${fillLength('-' + (ejouralList[index].ysje * 1).toFixed(2), 12)} ${this.props.operators.gh}\r\n${addTxt(item, ejouralList.length)}`, '1');
                ejouralList[index] = {};
                break;
            //单行折扣%
            case 6:
            //单行折让$
            case 7:
                ejouralList.push(item);
                window.Log(`${fillLength(index + 1, 4)}  <-- THIS LINE DISC ${fillLength('-' + (ejouralList[index].ysje * 1).toFixed(2), 12)} ${this.props.operators.gh}\r\n${addTxt(item, ejouralList.length)}`, '1');
                ejouralList[index] = {};
                break;
            //整单折扣
            case 8:
                window.Log(`  T. AMT DISC ${fillLength((item * 1).toFixed(2), 10)} %`, '1');
                break;
            //整单折让
            case 9:
                window.Log(`  T. AMT DISC ${fillLength((item * 1).toFixed(2), 10)} $`, '1');
                break;
            //挂单
            case 10:
                window.Log(`--------------------------------------\r\n         【 暫 存 交 易 資 料 】\r\n暫存總計:${fillLength((item.totalPrice * 1).toFixed(2), 10)}     件數:${fillLength(item.num, 10)}\r\n暫存日期:${fillLength(moment().format('DD/MM/YY'), 10)}     時間:${fillLength(item.time, 10)}\r\n可暫存至:${fillLength(moment().format('DD/MM/YY'), 10)}     時間:${fillLength(moment(item.time, 'HH:mm:ss').add('hours', 0.5).format('HH:mm:ss'), 10)}\r\n編號: ${this.props.initialState.syjh}-${this.props.initialState.fphm}\r\n--------------------------------------\r\n**************************************`, '1');
                break;
            //解挂
            //case 11:
            //window.Log(`--------------------------------------\r\n       【 取 消 暫 存 交 易 資 料 】\r\n暫存總計:${fillLength((item.totalPrice*1).toFixed(2),10)}     件數:${fillLength(item.num,10)}\r\n暫存日期:${fillLength(moment().format('DD/MM/YY'),10)}     時間:${fillLength(item.time,10)}\r\n編號:   ${item.flow_no}\r\n--------------------------------------`,'1');
            //break;
            //会员登录 登出
            case 12:
                if (ejouralList && ejouralList.length > 0) {
                    let vipTxt = "";
                    ejouralList.forEach((_item, _index) => {
                        if (_item.guid) {
                            vipTxt += `${fillLength(_index + 1, 4)}  <-- THIS LINE VOID ${fillLength('-' + (_item.ysje * 1).toFixed(2), 12)} ${this.props.operators.gh}\r\n`
                            ejouralList[_index] = {}
                        }
                    })
                    item.forEach((_item, _index) => {
                        vipTxt += `${addTxt(_item, ejouralList.length + _index + 1, 3)}`
                        if (_index < item.length - 1) {
                            vipTxt += '\r\n'
                        }
                    })
                    ejouralList = [...ejouralList, ...item]
                    console.log(ejouralList);
                    window.Log(vipTxt, '1')
                }
                break;
            default:
                break;
        }
        this.setState({ ejouralList });
        */
    }

    //添加会员 @flow_no 表示续费的会员登录djlb Y11、換卡会员登录djlb Y19
    addVip = (vipNo, vipOption, callback, flow_no, djlb) => {
        // console.log("-----addVip----: ", this.state, this.props);
        // console.log("---addVip---: ", vipNo, vipOption, callback, flow_no, djlb)
        let req = {
            transDate: moment().format('YYYYMMDDHHmmss'),
            terminalSno: this.props.initialState.xph,
            shopCode: this.props.initialState.mkt,
            terminalNo: this.props.initialState.syjh,
            terminalOperator: this.props.operators && this.props.operators.gh,
            flowNo: flow_no || this.state.flow_no,
            consumersCard: vipNo, //'83010113',
        };
        if (vipOption) {
            req = { ...req, ...vipOption }
        }
        // if (vipOption.idType) {
        //     req.idtype = vipOption.idType
        // }
        // if (vipOption.certifyType) {
        //     req.certifyType = vipOption.certifyType
        // }
        //会员续费单据
        // if (flow_no || this.state.octozz === 'Y10' || this.state.octozz === 'Y11' || this.state.octozz === 'Y19') {
        //     const { mkt, syjh, amcNO } = this.props.initialState;
        //     req.memberActionSno = mkt.substring(mkt.length - 2) + syjh + amcNO
        // }
        this.props.actions.vip(req).then(res => {
            console.log("addVip res: ", res)
            if (res) {
                const { consumersData } = res.order;
                //const vipInfo = { vipid, viptype, trgs, vipno, jfgrade };
                //this.setState({ vipInfo })
                // const { consumersData, promptMessage } = res;
                const promptMessage = "";
                consumersData.customerPaycode = req.consumersCard;
                this.setState({
                    vipInfo: consumersData || {},
                    vipCardNo: vipNo || '',
                    tempVip: false,
                })
                if (flow_no) {
                    //会员续费
                    if (djlb === 'Y11') {
                        // continueIntegral; 续费积分
                        // continueMoney; 续会金额
                        // continueBarCode; 续会商品码
                        // integralBarCode; 续会积分商品码
                        const { continueIntegral, continueMoney, continueBarCode, integralBarCode } = res;
                        if (callback && continueBarCode && integralBarCode) {
                            if (consumersData && continueIntegral && consumersData.bonusPointLastMonth - consumersData.bonusPointUsed > continueIntegral) {
                                Confirm({
                                    title: '提示',
                                    iconType: "exclamation-circle",
                                    content: '是否積分續會？',
                                    width: 500,
                                    className: 'vla-confirm',
                                    okText: '積分續會',
                                    cancelText: '現金續會',
                                    onOk: () => {
                                        callback({
                                            vipInfo: consumersData,
                                            barcode: integralBarCode,
                                            price: continueMoney,
                                            isJFXH: true
                                        });
                                    },
                                    onCancel: () => {
                                        callback({
                                            vipInfo: consumersData,
                                            barcode: continueBarCode,
                                            price: continueMoney,
                                            isJFXH: false
                                        });
                                    }
                                });
                            } else {
                                callback({
                                    vipInfo: consumersData,
                                    barcode: continueBarCode,
                                    price: continueMoney,
                                    isJFXH: false
                                });
                            }
                            //callback(consumersData);
                        } else {
                            message(res.retmsg);
                        }
                    }
                    if (djlb === 'Y19') {
                        callback({
                            vipNo,
                            vipInfo: consumersData
                        });
                    }
                } else {
                    if (res.returncode !== "1003" && res.returncode !== "1004") {
                        this.setState({
                            vipInfo: consumersData || {},
                            vipCardNo: vipNo || '',
                            tempVip: false,
                        })
                        if (res.order.goodsList && res.order.goodsList.length > 0) {
                            this.replaceGoodsList(res);
                            //this.handleEjoural(res.goodslist, 12)
                        }
                        if (promptMessage && res.returncode !== "1002") {
                            message(promptMessage);
                        }
                    }
                    if (callback) {
                        callback();
                    }
                }
                //非会员续费单据 过期会员提示续费
                if ((res.returncode === "1002" || res.returncode === "1003") && !flow_no && this.state.octozz !== 'Y10' && this.state.octozz !== 'Y11' && this.state.octozz !== 'Y19') {
                    let flag;
                    try {
                        flag = this.props.initialState.data.touchpostemplate.presskeys.find(item => item.sale).sale.find(item => item.code === '228')
                    } catch (err) {
                        console.log(err);
                    }
                    if (flag) {
                        Confirm({
                            title: '提示',
                            iconType: "exclamation-circle",
                            content: res.promptMessage || 'AEON MEMBER CARD會籍已過期，請續會以續享會員積分及其他會員優惠！',
                            width: 500,
                            className: 'vla-confirm',
                            okText: '不續會',
                            cancelText: '續會',
                            onOk: () => {
                            },
                            onCancel: () => {
                                this.rechargeVip(vipNo);
                            }
                        });
                    } else {
                        message(res.promptMessage || 'AEON MEMBER CARD會籍已過期，請續會以續享會員積分及其他會員優惠！', 5);
                    }
                }
                if (res.returncode === "1004") {
                    message(res.promptMessage, 5);
                }
            }
        })
    }


    //获取整单
    getBillDetail = (flow_no) => {
        return this.props.actions.getBillDetail({
            shopCode: this.props.initialState.mkt,
            terminalNo: this.props.initialState.syjh,
            terminalOperator: this.props.operators && this.props.operators.gh,
            flowNo: flow_no,
        })
    }

    getBill = async (flow_no) => {
        const result = await this.props.actions.getBillDetail({
            operators: this.props.operators && this.props.operators.gh,
            syjh: this.props.initialState.syjh,
            flow_no,
            mkt: this.props.initialState.mkt,
        })
        if (result) {
            return result.expressNumber
        }
    }

    changeExceptOldValue = (value) => {
        this.setState({
            exceptOldModal: false
        })
        let goodslist = this.state.exceptOldGoodslist
        let obj = {
            operators: this.props.operators && this.props.operators.gh,
            mkt: this.props.initialState.mkt,
            syjh: this.props.initialState.syjh,
            flow_no: this.state.flow_no,
            itemCode: goodslist[0].goodsno,
            terminalSno: this.state.terminalSno,
            recordNo: this.state.recordNo,
        }
        let params = Object.assign(obj, value)
        let item = {
            operators: this.props.operators && this.props.operators.gh,
            mkt: this.props.initialState.mkt,
            syjh: this.props.initialState.syjh,
            flow_no: this.state.flow_no,
            jygs: this.props.initialState.jygs,
            qty: 1,
            yyyh: "9527",
            barcode: goodslist[0].goodsno,
            precision: '2',
            calcMode: '0',
            price: goodslist[0].price,
            sameDayReply: value.sameDayReply,
            search: this.props.initialState.data.syjmain[0].issryyy === 'Y' ? '2' : '3'
        }
        this.props.actions.saleControl(params).then(res => {
            if (res) {
                this.setState({
                    salesMemo: value.expressNo
                })
                if (this.state.goodsList.find(item => item.goodsType === '15')) {
                    if (this.addGoodsList.length > 0) this.addGoods();
                    return false;
                }
                this.props.actions.getControlList(item).then(result => {
                    if (result) {
                        this.addGoodsCallback(result);
                        if (this.addGoodsList.length > 0) this.addGoods();
                        return true;
                    }
                })
            } else {
                if (this.addGoodsList.length > 0) this.addGoods();
            }
            return false;
        })
    }

    closeExceptOldModal = () => {
        this.setState({
            exceptOldModal: false
        })
    }

    //添加商品 @isPush是否添加到商品队列中
    addGoods = (barcode, price, flow_no, isCallback = true, isPush = true) => {
        console.log('start addGoods');
        if (!!this.state.octozz && this.state.octozz === 'Y3') {
            message(intl.get("INFO_ADDTYPELIMIT")); //'八达通增值商品不可与其它商品一同售卖！'
            window.audioPlay(false);
            return false;
        }
        if (!!this.state.octozz && this.state.octozz === 'Y10' && barcode !== '665') {
            message('會員申請不可與其它商品一同售賣'); //'会员申请不可与其它商品一同售卖！'
            window.audioPlay(false);
            return false;
        }
        if (!!this.state.octozz && this.state.octozz === 'Y11' && barcode !== '665') {
            message('會員續費不可與其它商品一同售賣'); //'会员续费不可与其它商品一同售卖！'
            window.audioPlay(false);
            return false;
        }
        if (!!this.state.octozz && this.state.octozz === 'Y19' && barcode !== '665') {
            message('換卡不可與其它商品一同售賣');
            window.audioPlay(false);
            return false;
        }
        if (!!this.state.octozz && this.state.octozz === 'Y12') {
            message('印花換購不可與其它商品一同售賣'); //'印花换购不可与其它商品一同售卖！'
            window.audioPlay(false);
            return false;
        }
        if ((this.state.isDc === true || this.state.isSd === true || this.state.isDj === true) && this.state.goodsList.length >= 6) {
            let msg = this.state.isDj ? '定金的訂單最多只可添加6件商品' : intl.get("INFO_DELIVERYMAX");
            message(msg); // 需送货的订单最多只可添加6件商品
            window.audioPlay(false);
            return false;
        }
        //判断是否为券码
        if (barcode && barcode.trim().length === 16) {
            return this.props.actions.addCoupon({
                couponCode: barcode.trim(),
                flow_no: this.state.flow_no,
                operators: this.props.operators && this.props.operators.gh,
                mkt: this.props.initialState.mkt,
                syjh: this.props.initialState.syjh,
                scene: 0,
            }).then(res => {
                if (res) {
                    //console.log(res);
                    this.addGoodsCallback(res);
                    //this.repullSale();
                    return true;
                }
                window.audioPlay(false);
                return false;
            })
        }
        //判断是否有整单折扣和整单折让
        if (!this.clearDiscountCertify()) return;
        /*if (this.state.totalData.price * 1 > 999999999.99) {
            message(intl.get("INFO_EXCESSNOT")); //'总金额超过限额，无法添加商品！'
            return false;
        }*/
        //判断是否电子秤商品
        /*identifier //标识符
        identifierLen   //标识符长度
        identifierPos   //标识符位置*/
        let isdzcm = 'N';
        const elecscalecoderule = this.props.initialState.data.elecscalecoderule;
        for (let i = 0; i < elecscalecoderule.length; i++) {
            let dzc = elecscalecoderule[i];
            let location = dzc.identifierPos - 1;
            if ((barcode && barcode.trim().length === dzc.barCodeLen) &&
                (barcode.substring(location, location + dzc.identifierLen).trim() === dzc.identifier)) {
                isdzcm = 'Y'
                break;
            }
        }
        //调用接口
        let req = {
            shopCode: this.props.initialState.mkt,
            terminalNo: this.props.initialState.syjh,
            terminalOperator: this.props.operators && this.props.operators.gh,
            flowNo: flow_no || this.state.flow_no,
            erpCode: this.props.initialState.jygs,
            barNo: barcode && barcode.trim(),
            assistantId: "9527", searchType: this.props.initialState.data.syjmain[0] && this.props.initialState.data.syjmain[0].issryyy === 'Y' ? '2' : '3',
            //orgCode: '1',
            calcMode: '0',
            //旧字段
            flag: "0",
            precision: '2',
            entid: this.props.initialState.entid,
            isdzcm: isdzcm,
        }
        if (price || price == 0) {
            req.refPrice = parseFloat(price);
            req.calcMode = '2';
        }
        //判断是否为优惠集商品
        if (barcode === '665') {
            if ((!this.state.vipInfo || JSON.stringify(this.state.vipInfo) === '{}') && !this.state.tempVip) {
                message('添加優惠集必須先登入會員');  //添加优惠集必须先登录会员
                window.audioPlay(false);
                return false;
            }
            req.calcMode = '2';
        }
        //向添加队列中写入待添加的商品
        if (barcode) {
            if (isPush) this.addGoodsList.push(barcode);
            if (this.addGoodsList.length > 1 && isPush) return false;
        }
        if (!barcode && this.addGoodsList.length > 0) {
            barcode = this.addGoodsList[0];
            req.barNo = this.addGoodsList[0];
        }
        return this.props.actions.addGoods(req).then(res => {
            //处理添加商品队列中的数据
            setTimeout(() => {
                if (isPush) this.addGoodsList.shift();
                if (this.addGoodsList.length > 0) {
                    if (!((res && res.goodslist) && res.saleGoodsType && res.saleGoodsType !== 'A')) {
                        this.addGoods();
                    }
                }
            }, 15)
            if (res) {
                const { goodsList } = res.order;
                /* 2019.5.5 因客户数据问题，暂屏蔽此控制 by Sean */
                // if (this.state.isSd === true) { 
                //     /* 2019.4.3 字段category改为venderCode， by Sean */
                //     let _artcode = goodslist[0].venderCode;
                //     for (let i = 0; i < this.state.goodsList.length; i++) {
                //         if (_artcode !== this.state.goodsList[i].venderCode) {
                //             message(intl.get("INFO_SDFROMSAME")); // 行送商品不可由不同供应商发货   
                //             return false;
                //         }
                //     }
                // }
                if (res.saleGoodsType === '3') {
                    this.setState({
                        chooseGoodsModal: true,
                        chooseGoodsList: goodsList,
                    })
                    return true;
                } else {
                    if (res.saleGoodsType === '0') {
                        RechargeKeypad.open({
                            title: intl.get("INFO_PRICING"), //"商品定价"
                            placeholder: intl.get("PLACEHOLDER_IPRICE"),  //"请输入商品价格",
                            errMessage: intl.get("INFO_TIP9", { max: this.props.syspara.maxSaleGoodsMoney }),
                            //"请输入正确格式价格,且价格不超过max",
                            rule: (num) => {
                                let numF = parseFloat(num);
                                console.log(numF);
                                if (/(^[0-9]\d*(\.\d{1,2})?$)/.test(num) && numF > 0 && numF <= this.props.syspara.maxSaleGoodsMoney) {
                                    return true;
                                }
                                return false;
                            },
                            cancelCallback: () => { if (this.addGoodsList.length > 0) this.addGoods() },
                            callback: (value) => this.addGoods(barcode, value, null, true, false)
                        })
                        return true;
                    } else {
                        if (isCallback) {
                            this.addGoodsCallback(res);
                        }
                    }
                }
                return res;
            }
            window.audioPlay(false);
            return false;
        })
    }

    //添加商品到商品列表
    addGoodsCallback = (res) => {
        //新增商品是自动翻页到最后一页
        const goodslist = res.order.goodsList;
        let { pagination, addGoodsTime } = this.state;
        pagination.current = Math.ceil(goodslist.length / pagination.pageSize);
        if (addGoodsTime === "") {
            addGoodsTime = moment().format('DD/MM/YYYY HH:mm:ss');
        }
        this.setState({ pagination, addGoodsTime, selectedGoods: goodslist.length - 1 });
        this.replaceGoodsList(res);
        console.log('end addGoodsCallback')
        res['optionType'] = '1';
        window['dlWindow'](res);
        window.audioPlay(true);
    }

    //根据系统参数判断是否添加商品
    addGoodsVerify = () => {
        if (this.state.goodsList.length === this.props.syspara.maxSaleGoodsCount * 1) {
            message(`${intl.get("INFO_ROWMAX")}${this.props.syspara.maxSaleGoodsCount}`);
            return false;
        }
        if (this.state.totalData.num + 1 > this.props.syspara.maxSaleGoodsQuantity * 1) {
            message(`${intl.get("INFO_GOODSQTYMAX")}${this.props.syspara.maxSaleGoodsQuantity}`);
            return false;
        }
        return true;
    }

    clearDiscountCertify = () => {
        //判断是否有整单折扣和整单折让
        if (this.state.tempZzk * 1 < 100 || this.state.tempZzr * 1 > 0) {
            Confirm({
                title: '添加商品失敗',
                content: '訂單已選擇整單折，無法添加商品，是否取消整單折？',
                className: 'vla-confirm',
                width: 500,
                okText: '是',
                cancelText: '否',
                onOk: () => {
                    if (this.state.tempZzk * 1 < 100 && this.state.tempZzr * 1 > 0) {
                        this.discountBill(0).then(res => {
                            if (res) {
                                this.rebateBill(0);
                            }
                        })
                        return;
                    }
                    if (this.state.tempZzk * 1 < 100) {
                        this.discountBill(0);
                    }
                    if (this.state.tempZzr * 1 > 0) {
                        this.rebateBill(0);
                    }
                }/*,
                onCancel() {
                }*/
            });
            return false;
        }
        return true;
    }

    //查找到多条商品后选择商品
    chooseGoods = (item) => {
        if (item) {
            this.addGoods(item.barNo, null, null, true, false);
        } else {
            if (this.addGoodsList.length > 0) this.addGoods();
        }
        this.setState({
            chooseGoodsModal: false,
            chooseGoodsList: [],
        })
    }

    //删除商品
    //@item当前商品信息 @index当前商品索引
    delGoods = (item, index, callback) => {
        let { goodsList, totalData, pagination, deleteNum } = this.state;
        if (goodsList.length <= 1 || (item.controlFlag && goodsList.length <= 2 && goodsList.find(_item => _item.goodsType === '15'))) {
            message(intl.get("INFO_CNOTDEL"))    //'最后一行商品无法删除！'
            return false;
        }
        let max = this.props.syspara.maxDelhs;
        if (max !== '0' && max - deleteNum <= 0) {
            //message(`当前单据最多可删除${max}行商品，已删除${deleteNum}行商品，无法删除商品！`)
            message(intl.get('INFO_DELERROR', { max: max, deleteNum: deleteNum }))
            return false;
        }
        //判断是否有整单折扣和整单折让
        if (!this.clearDiscountCertify()) return;
        let delGoodsAction = () => {
            this.props.actions.delGoods({
                barNo: item.barNo,
                guid: item.guid,
                shopCode: this.props.initialState.mkt,
                terminalNo: this.props.initialState.syjh,
                terminalOperator: this.props.operators && this.props.operators.gh,
                flowNo: this.state.flow_no,
            }).then(res => {
                if (res) {
                    let goodslist = res.order.goodsList;
                    if (goodslist) {
                        //原总页数
                        let totalPage = Math.ceil(goodsList.length / pagination.pageSize),
                            //新总页数
                            _totalPage = Math.ceil(goodslist.length / pagination.pageSize);
                        if (totalPage === pagination.current && _totalPage < pagination.current) {
                            pagination.current -= 1;
                        }
                        this.setState({ deleteNum: res.order.deleteNum })
                        this.handleEjoural(item, 1);
                        if (callback) {
                            callback()
                            if (this.addGoodsList.length > 0) this.addGoods();
                        }
                        if (!goodslist[this.state.selectedGoods]) {
                            this.setState({ selectedGoods: goodslist.length - 1 || 0 })
                        }
                        this.replaceGoodsList(res)
                        //更新客显屏
                        window.LineDisplay({
                            type: 1,
                            data: {
                                itemCode: goodslist[goodslist.length - 1].goodsCode,
                                qty: goodslist[goodslist.length - 1].qty,
                                price: (goodslist[goodslist.length - 1].ysje * 1).toFixed(2),
                                total: (res.oughtPay * 1).toFixed(2)
                            }
                        });
                        res.optionType = '1';
                        window['dlWindow'](res);
                    }
                    /*if(item.goodsType === '99' || item.goodsType === '98') {
                        this.repullSale();
                    } else {
                        const {zdyftotal, zddsctotal, zdsjtotal, deleteNum} = res;
                        if (goodsList.length % pagination.pageSize === 1 && goodsList.length === index + 1
                            && goodsList.length > pagination.pageSize) {
                            pagination.current -= 1;
                        }

                        goodsList.splice(index, 1);
                        totalData.num = totalData.num - item.qty;
                        totalData.price = zdyftotal;
                        totalData.discounts = zddsctotal;
                        totalData.totalPrice = zdsjtotal;
                        totalData.num = Math.round(totalData.num * 100) / 100;
                        this.setState({goodsList, totalData, pagination, deleteNum});
                    }*/
                }
            })
        }
        if (this.props.posrole.privqx === 'Y' || this.props.posrole.privqx === 'T') {
            delGoodsAction();
            return true;
        }
        React.accredit(posrole => {
            if (posrole.privqx === 'Y' || posrole.privqx === 'T') {
                delGoodsAction();
            } else {
                message(intl.get("INFO_AUTHFAIL"))   //'授权失败：无此权限'
            }
        }, null, { flowNo: this.state.flow_no })
    }

    //编辑商品
    //@name编辑类型 @value输入的值 @item当前商品信息 @index当前商品索引
    editGoods = (name, value, item, index, qty) => {
        const { discountGoods, rebateGoods, editGoods } = this.props.actions;
        let action;
        let req = {
            shopCode: this.props.initialState.mkt,
            terminalNo: this.props.initialState.syjh,
            terminalOperator: this.props.operators && this.props.operators.gh,
            flowNo: this.state.flow_no,
            barNo: item.barNo,
            guid: item.guid,
            assistantId: this.props.operators && this.props.operators.gh,
            isBreak: '1',
        };
        switch (name) {
            case 'qty':
                if (this.state.totalData.num + (value - this.state.goodsList[index].qty) >
                    this.props.syspara.maxSaleGoodsQuantity * 1) {
                    message(`${intl.get("INFO_GOODSQTYMAX")}${this.props.syspara.maxSaleGoodsQuantity}`);
                    return false;
                }
                //判断是否有整单折扣和整单折让
                if (!this.clearDiscountCertify()) return;
                //修改单行数量
                action = () => editGoods({
                    ...req,
                    qty: value,
                    calcMode: '0',
                    flag: '0',
                })
                break;
            case 'price':
                //修改单行价格
                action = () => editGoods({
                    ...req,
                    refPrice: value,
                    calcMode: '0',
                    flag: '1',
                })
                break;
            case 'discounts':
                //单行折扣
                action = () => discountGoods({
                    ...req,
                    discountRate: 100 - value * 1,
                }).then(res => {
                    if (res) {
                        if (res.returncode === "0") {
                            return res
                        }
                        if (res.returncode === "1000") {
                            React.accredit(posrole => {
                                if (posrole.privdpzkl > 0) {
                                    this.editGoods('rebate', value, item, index, qty);
                                } else {
                                    message(intl.get("INFO_AUTHFAIL"))   //'授权失败：无此权限'
                                }
                            }, null, { flowNo: this.state.flow_no }, `${res.retmsg}: 請拉可授權之員工卡`)
                            return false;
                        }
                    }
                    return false
                });
                break;
            case 'rebate':
                //单行折让
                action = () => rebateGoods({
                    ...req,
                    discountAmount: value,
                }).then(res => {
                    if (res) {
                        if (res.returncode === "0") {
                            return res
                        }
                        if (res.returncode === "1000") {
                            React.accredit(posrole => {
                                if (posrole.privdpzkl > 0) {
                                    this.editGoods('rebate', value, item, index, qty);
                                } else {
                                    message(intl.get("INFO_AUTHFAIL"))   //'授权失败：无此权限'
                                }
                            }, null, { flowNo: this.state.flow_no }, `${res.retmsg}: 请刷卡授权！`)
                            return false;
                        }
                    }
                    return false
                });
                break;
            case 'publicPrescription':
                //修改公立价
                action = () => editGoods({
                    ...req,
                    qty: qty,
                    isPublicPrescription: value === true ? 'Y' : 'N',
                    calcMode: '0',
                    flag: '0'
                })
                break;
            case 'redemption':
                //修改是否换购
                action = () => editGoods({
                    calcMode: '4',
                })
                break;
            default:
                return false;
        }
        return action().then(res => {
            if (res) {
                /*if (name === 'qty' && res.good && res.good.qty - this.state.goodsList[index].qty === 0) {
                    //message.error("商品已选择优惠，数量修改失败！");
                    return false;
                }*/
                const goodslist = res.order.goodsList;
                this.replaceGoodsList(res, name === 'qty' ? goodslist[index].qty - this.state.goodsList[index].qty : false);
                switch (name) {
                    case 'qty':
                        this.handleEjoural(goodslist[index], 2);
                        //更新客显屏
                        window.LineDisplay({
                            type: 1,
                            data: {
                                itemCode: goodslist[index].goodsCode,
                                qty: goodslist[index].qty,
                                price: (goodslist[index].saleAmount * 1).toFixed(2),
                                total: (res.oughtPay * 1).toFixed(2)
                            }
                        });

                        break;
                    case 'price':
                        this.handleEjoural(goodslist[index], 5);
                        window.LineDisplay({
                            type: 1,
                            data: {
                                itemCode: goodslist[index].goodsCode,
                                qty: goodslist[index].qty,
                                price: (goodslist[index].saleAmount * 1).toFixed(2),
                                total: (res.oughtPay * 1).toFixed(2)
                            }
                        });
                        break;
                    case 'discounts':
                        this.handleEjoural(goodslist[index], 6);
                        break;
                    case 'rebate':
                        this.handleEjoural(goodslist[index], 7);
                        break;
                    default:
                        break;
                }
                res.optionType = '1';
                window['dlWindow'](res);
                return true;
            }
        })
    }

    //精度计算
    /*handleSswrfs = (value) => {
        //收银截断方式，0-精确到分、1-四舍五入到角、2-截断到角、3-四舍五入到元、4-截断到元、5-进位到角、6-进位到元 7-5舍6入到角
        const sswrfs = this.props.initialState.data.paymode[0]
            && this.props.initialState.data.paymode[0] && this.props.initialState.data.paymode[0].sswrfs;
        switch (sswrfs) {
            case '0':
                return value.toFixed(2);
            case '1':
                return Math.round(value * 10) / 10;
            case '2':
                return value.toFixed(1);
            case '3':
                return value.toFixed(1);
            case '4':
                return value.toFixed(0);
            case '5':
                return Math.ceil(value * 10) / 10;
            case '6':
                return Math.ceil(value);
            case '7':
                return Math.round((value - 0.01)*10)/10;
            default :
                return value;
        }
    }*/

    //计算total
    //@total修改之前的total @item当前商品信息 @changeNum增加或减少的数量
    calculateTotal = (total, item, changeNum) => {
        total.num += changeNum;
        total.price += item.price * changeNum;
        total.discounts += item.dsctotal / item.qty * changeNum;
        total.totalPrice += item.total / item.qty * changeNum;
        total.num = Math.round(total.num * 100) / 100;
        total.price = Math.round(total.price * 100) / 100;
        total.discounts = Math.round(total.discounts * 100) / 100;
        total.totalPrice = this.handleSswrfs(total.totalPrice * 1) * 1;
    }

    //商品列表翻页
    tablePageChange = (e) => {
        this.setState({
            pagination: e
        })
    }

    //输入商品编码查询商品
    //@tag操作类型goods/vip @value输入框的内容 @whichEvent键盘事件
    inputCode = (tag, value, whichEvent, callback, vipOption) => {
        if (whichEvent === 13) {
            switch (tag) {
                case "goods":
                    if (!value) {
                        return false;
                    }
                    if (!this.addGoodsVerify()) {
                        if (callback) {
                            callback();
                        }
                        return false;
                    }
                    const addGoodsRes = this.addGoods(value);
                    if (addGoodsRes != false) {
                        return addGoodsRes.then(res => {
                            if (callback) {
                                callback();
                            }//键盘关闭
                            if (res === true) {
                                return true;
                            }
                            //键盘不关闭
                            return false;
                        });
                    } else {
                        return false;
                    }
                    break;
                case "vip":
                    if (!value && !vipOption.certifytype) {
                        message('會員卡號或手機號不能為空')
                        return false;
                    }
                    if (vipOption && vipOption.certifytype) {
                        if (this.state.easyPay) {
                            message('预销售訂單無法登出會員')
                            return false;
                        }
                        if (this.state.octozz && this.state.octozz === 'Y10') {
                            message('會員入會訂單無法登出會員');
                            return false;
                        }
                    }
                    this.addVip(value, vipOption, callback);
                    break;
                default:
                    break;
            }
        }
    }

    //点击操作菜单事件
    menuEvents = (type, prarm) => {
        this[type](prarm);
    }

    goHome = () => {
        if (this.state.goodsList.length !== 0) {
            message("有商品不允许返回")
            return;

        }
        this.props.history.push('/home');
    }

    //DC送&行送取消
    onDeliveryCancel = (key) => {
        if (this.state.goodsList.length === 0) {
            let state = { [key]: false };
            if (key == "isDj") {
                state = { ...state, djValue: '' };
                Fetch(
                    {
                        url: Url.base_url,
                        type: "POST",
                        data: {
                            command_id: "UPDATEORDERDEPOSIT",
                            operators: this.props.operators && this.props.operators.gh, //操作员号
                            flow_no: this.state.flow_no,
                            mkt: this.props.initialState.mkt,
                            syjh: this.props.initialState.syjh, //终端号
                            depositSale: false,
                            depositValue: 0
                        }
                    }
                ).then((res) => {
                    if ("0" === res.returncode) {

                    } else {
                        message(res.retmsg)
                    }
                }).catch((error) => {
                });
            }
            if (!(this.state.isDc && this.state.isDj) && !(this.state.isSd && this.state.isDj)) {
                state = { ...state, salesMemo: '', dcData: {} };
            }
            this.setState(state, () => {
                const req = {
                    command_id: "REFRESHDELIVERYINFO",
                    operators: this.props.operators && this.props.operators.gh, //操作员号
                    flow_no: this.state.flow_no,
                    mkt: this.props.initialState.mkt,
                    syjh: this.props.initialState.syjh, //终端号
                    logisticsMode: "7",
                    expressNumber: ""
                };
                return this.props.actions.refreshDelivery(req).then((res) => {
                    document.getElementById('codeInput').focus();
                })
            });
        } else {
            let msg = '';
            switch (key) {
                case "isDc":
                    msg = intl.get('MENU_DC');
                    break;
                case "isSd":
                    msg = intl.get('MENU_LOGISTICS');
                    break;
                case "isDj":
                    msg = '定金';
                    break;
                default:
                    break;
            }
            // if (this.state.isDc) {
            //     msg = intl.get('MENU_DC');
            // } else if (this.state.isSd) {
            //     msg = intl.get('MENU_LOGISTICS');
            // } else {
            //     msg = '定金';
            // }
            /*商品列表不为空时，不可取消*/
            message(intl.get('INFO_NOTEMPTYNOQX') + '【' + msg + '】！');
        }
        return false
    }

    //消单
    delBill = (callback) => {
        if (this.state.goodsList.length === 0) {
            message(intl.get("INFO_EMPTYLIST"));  //'商品列表为空时无法取消整单！'
            return false
        }
        const delBillAction = () => {
            this.props.actions.cancel({
                shopCode: this.props.initialState.mkt,
                terminalNo: this.props.initialState.syjh,
                terminalOperator: this.props.operators && this.props.operators.gh,
                flowNo: this.state.flow_no,
                flag: '0',
            }).then(res => {
                if (res) {
                    if (this.props.syspara.xdIsaddfphm === 'Y') {
                        this.props.updateXPH();
                    }
                    this.handleEjoural(this.state.totalData, 3);
                    this.createSale();
                    this.initState();
                    if (callback) {
                        callback();
                    }
                }
            })
        }
        if (this.props.posrole.privqx === 'Y') {
            delBillAction();
            return;
        }
        React.accredit(posrole => {
            if (posrole.privqx === 'Y') {
                delBillAction();
            } else {
                message(intl.get("INFO_AUTHFAIL"))   //'授权失败：无此权限'
            }
        }, null, { flowNo: this.state.flow_no })
    }

    //挂单
    saveBill = (callback) => {
        if (!!this.state.octozz && this.state.octozz === 'Y3') {
            message(intl.get("INFO_TOGETHER")); //'八达通增值商品不暂存！'
            return false;
        }
        if (!!this.state.octozz && this.state.octozz === 'Y10') {
            message('會員申請單據不能暫存'); //'会员申请单据不能暂存！'
            return false;
        }
        if (!!this.state.octozz && this.state.octozz === 'Y11') {
            message('會員續費單據不能暫存'); //'会员续费单据不能暂存！'
            return false;
        }
        if (!!this.state.octozz && this.state.octozz === 'Y19') {
            message('換卡單據不能暫存');
            return false;
        }
        if (!!this.state.octozz && this.state.octozz === 'Y12') {
            message('印花換購單據不能暫存'); //'印花换购单据不能暂存！'
            return false;
        }
        if (this.state.isDj === true) {
            message('定金訂單不允許掛單');  //'供应商送货订单不允许挂单'
            return false
        }
        if (this.state.isDc === true) {
            message(intl.get("INFO_DCCNOT"));  //'DC送货订单不允许挂单'
            return false
        }
        if (this.state.isSd === true) {
            message(intl.get("INFO_DELIVERYCNOT"));  //'供应商送货订单不允许挂单'
            return false
        }
        if (this.state.goodsList.length === 0) {
            message(intl.get("INFO_GOODSLISTCNOT"));  //'商品列表为空时无法保存单据'
            return false
        }
        return this.loseBill('save', {
            no: this.state.flow_no,
            time: moment().format('HH:mm:ss'),
        }, null, () => {
            if (callback) {
                callback();
            } else {
                this.createSale();
            }
        });
    }

    //解挂
    searchBill = (params) => {
        if (this.state.goodsList.length > 0) {
            message(intl.get("INFO_CNOTSELECTORDER"));  //'当前单据操作未完成，无法查单！'
            return false
        }
        this.setState({ billListModal: true })
    }

    //解挂同步fphm
    updateFPHM = (flow_no) => {
        return this.props.actions.updateFPHM({
            terminalOperator: this.props.operators && this.props.operators.gh,
            flowNo: flow_no,
            shopCode: this.props.initialState.mkt,
            terminalNo: this.props.initialState.syjh,
            terminalSno: this.props.initialState.xph,
        })
    }

    loseBill = (type, data, detail, callback) => {
        console.log(data);
        const { djlb } = this.props.state;
        let billKey = '';
        let sendLogReq = {
            cardno: this.props.operators && this.props.operators.gh,
            erpCode: this.props.initialState.erpCode,
            mkt: this.props.initialState.mkt,
            logdesc: '',
            syjh: this.props.initialState.syjh,
            syyh: this.props.operators && this.props.operators.gh,
            billno: this.props.initialState.fphm
        }
        switch (djlb) {
            case 'Y7':
                billKey = "practice";
                break;
            case 'Y1':
                billKey = "coupon";
                break;
            default:
                billKey = "presale";
                break;
        }
        switch (type) {
            //挂单
            case 'save':
                sendLogReq.logtype = 17;
                sendLogReq.rowno = this.state.flow_no;
                let saveBillAction = () => {
                    return this.props.billAction({
                        type: 0,
                        key: billKey,
                        data: data
                    }, djlb === 'Y7' ? null : sendLogReq, () => {
                        if (this.props.syspara.isPrintGd === 'Y') {
                            window.Print({
                                Module: 'SaveBillPrint',
                                head: [{
                                    mkt: this.props.initialState.mkt,//门店号
                                    syyh: this.props.operators && this.props.operators.gh,//收银员
                                    printtype: "0", //0代表热敏打印，1代表平推
                                    rqsj: moment().format('DD/MM/YYYY HH:mm:ss'),//交易时间
                                    mktname: this.props.initialState.data.mktinfo && this.props.initialState.data.mktinfo.mktname,//门店号名称
                                    address: this.props.initialState.data.mktinfo && this.props.initialState.data.mktinfo.address,  //门店地址
                                    phone: this.props.initialState.data.mktinfo && this.props.initialState.data.mktinfo.telephone,
                                    refno: this.props.initialState.syjh + this.props.initialState.fphm,
                                    sjfk: this.state.totalData.price,
                                    ysje: this.state.totalData.totalPrice,
                                    hjzsl: this.state.totalData.num - this.state.goodsList.filter(item => item.goodsType === '99' || item.goodsType === '98').length,
                                    endTime: '23:59:59',
                                    number: this.state.flow_no,
                                    syjh: this.props.initialState.syjh,
                                    barcodeString: this.props.initialState.mkt + this.props.initialState.syjh + moment().format('YYMMDD') + this.props.initialState.syjh + this.props.initialState.fphm,//门店号+收银机号+小票号
                                    djlb: djlb,
                                }],
                                goods: this.state.goodsList.map((item, key) => {
                                    item.idnum = key + 1;
                                    return item;
                                })
                            });
                        }
                        this.handleEjoural({
                            ...this.state.totalData,
                            time: data.time,
                            flow_no: this.state.flow_no
                        }, 10)
                        this.props.updateXPH();
                        message(intl.get("INFO_ORDERSAVESUCC"));  //'单据保存成功'
                        if (callback) {
                            this.initState();
                            callback();
                        }
                    })
                }
                //return saveBillAction();
                if (this.props.posrole.putbillqx === 'Y' || this.props.posrole.putbillqx === 'A') {
                    return saveBillAction();
                    //return;
                }
                React.accredit(posrole => {
                    if (posrole.putbillqx === 'Y' || posrole.putbillqx === 'A') {
                        saveBillAction();
                    } else {
                        message(intl.get("INFO_AUTHFAIL"))   //'授权失败：无此权限'
                    }
                })
                break;
            case 'cancel':
                this.setState({ billListModal: false });
                break;
            //删除
            case 'delete':
                sendLogReq.logtype = 20;
                sendLogReq.rowno = data.map(i => i.no).join(',');
                let deleteAction = () => {
                    this.props.billAction({
                        type: 1,
                        key: billKey,
                        data: data
                    }, djlb === 'Y7' ? null : sendLogReq, () => {
                        message(intl.get("INFO_DELSUCC"));  //'删除单据成功'
                        this.setState({ billListModal: false });
                    })
                }
                if (this.props.posrole.privqt3 === 'Y') {
                    deleteAction();
                    return true;
                }
                React.accredit(posrole => {
                    if (posrole.privqt3 === 'Y') {
                        deleteAction();
                    } else {
                        message(intl.get("INFO_AUTHFAIL"))   //'授权失败：无此权限'
                    }
                })
                break;
            //解挂
            case 'unlock':
                let unlockAction = () => {
                    sendLogReq.logtype = 18;
                    sendLogReq.rowno = data[0].no;
                    this.props.billAction({
                        type: 1,
                        key: billKey,
                        data: data
                    }, djlb === 'Y7' ? null : sendLogReq, () => {
                        let num = 0;
                        const { staffCardNo, staffNo, staffType } = detail;
                        //const vipInfo = { vipid, viptype, trgs, vipno };
                        // detail.goodList.forEach(v => {
                        //     num += v.qty
                        // })
                        this.setState({
                            goodsList: detail.goodsList,
                            totalData: {    //合计数据
                                num: detail.qty,
                                price: detail.saleValue,
                                discounts: detail.totalDiscountValue,
                                totalPrice: detail.oughtPay,
                            },
                            deleteNum: detail.deleteNum,
                            flow_no: detail.flowNo,
                            vipInfo: detail.viptype == '02' ? { memberId: detail.vipid } : (detail.consumersData || {}),
                            staffcard: staffCardNo ? { cardNo: staffCardNo, staffNo, cardType: staffType } : '',
                            addGoodsTime: moment().format('DD/MM/YYYY HH:mm:ss'),
                            salesMemo: detail.expressNumber || '',
                            djValue: detail.depositValue,
                            tempZzk: detail.tempZzk,
                            tempZzr: detail.tempZzr,
                            tempVip: detail.viptype == "04",
                            selectedGoods: 0,
                        }, () => this.handleEjoural(detail.goodsList, 11))
                        this.setState({ billListModal: false });
                        /*this.handleEjoural({
                         time: data[0].time,
                         num: num,
                         totalPrice: detail.total,
                         flow_no: detail.flow_no}, 11)*/
                    })
                }
                unlockAction();
                //解挂的授权放到组件内部了！！！
                /*if(this.props.posrole.putbillqx === 'Y' || this.props.posrole.putbillqx ==='B') {
                    unlockAction();
                    return true;
                }
                React.accredit(posrole => {
                    if (posrole.putbillqx === 'Y' || posrole.putbillqx ==='B') {
                        unlockAction();
                    } else {
                        message(intl.get("INFO_AUTHFAIL"))   //'授权失败：无此权限'
                    }
                })*/
                break;
            default:
                return false;
        }
    }

    otpTypeConver = (name) => {
        console.log('name', name);
        switch (name) {
            case '現金增值':
                return 'Cash';
                break;
            case '自動增值':
                return 'AAVS';
                break;
            case '網上增值':
                return 'Online';
                break;
            default:
                return '';
                break;
        }
    }

    /**
     * //重印/副单
     * @param type 映射方法
     * @param data 传递的数据
     * @param authCall 授权后回调方法
     * @returns {*}
     */
    printAgain = (type, data = {}, authCall = () => {
    }) => {
        let req, _this = this;
        try {
            switch (type) {
                case 'getOrderList'://获取订单已完成订单
                    req = {
                        shopCode: this.props.initialState.mkt,
                        orderState: '02',
                        entId: this.props.initialState.entid,
                        order_field: "createDate",
                        order_direction: "desc",
                        pageNo: data.page_no,
                        pageSize: data.page_size,
                        startDate: data.startdate,
                        endDate: data.enddate,
                        //...data
                    };
                    return this.props.actions.getOrderList(req);
                    break;
                case 'getOrderInfo'://获取单据详情
                    req = {
                        tradeno: '',
                        terminalOperator: this.props.operators && this.props.operators.gh,
                        shopCode: this.props.initialState.mkt,
                        terminalSno: data.fphm || localStorage.getItem("fphm"), //上一笔缓存号码
                        terminalNo: data.syjh || this.props.initialState.syjh,
                        flowNo: data.billno || '',
                    };
                    return this.props.actions.getOrderInfo(req);
                    break;
                case 'getTailList'://获取订单尾款订单
                    req = {
                        shopCode: this.props.initialState.mkt,
                        orderState: '02',
                        entId: this.props.initialState.entid,
                        order_field: "createDate",
                        order_direction: "desc",
                        terminalOperator: this.props.operators && this.props.operators.gh,
                        pageNo: data.page_no,
                        pageSize: data.page_size,
                        assistantId: this.props.operators && this.props.operators.gh,
                        startDate: data.startdate,
                        endDate: data.enddate,
                    };
                    return this.props.actions.getTailList(req);
                    break;
                case 'getTailInfo'://获取尾款单详情
                    req = {
                        terminalOperator: this.props.operators && this.props.operators.gh,
                        shopCode: data.mkt,
                        terminalNo: data.syjh,
                        assistantId: this.props.operators && this.props.operators.gh,
                        //flow_no: data.billno || '',
                        //tailPayNo: data.fphm, 目前列表没有返回尾单，直接用小票号查询
                        terminalSno: data.fphm,
                    };
                    return this.props.actions.getTailInfo(req);
                    break;
                case 'authorize'://重印授权
                    if (this.props.posrole.privdy === 'Y') {
                        authCall();
                        return;
                    }
                    React.accredit(posrole => {
                        if (posrole.privdy === 'Y') {
                            authCall();
                        } else {
                            message(intl.get("INFO_AUTHFAIL"))   //'授权失败：无此权限'
                        }
                        return;
                    });
                    break;
                // case 'accessory'://副单打印 922304 779365 10009 10132 44370 44404 44404 44412
                case 'forwardPrint'://转发打印请求(只打印一张)
                    let { method } = data,
                        printData = method === 'accessoryPrint' || this[method](data);
                    this.printAgEjoural(data);
                    if (method === 'accessoryPrint') {
                        this[method](data);//副单需要判断副单商品关闭窗口方法在里层
                    } else if (method !== 'yellowPrint' && method !== 'salePrint') {
                        if (!printData) {
                            _this.onOffPrint();
                            return;
                        }
                        let tip = '請放入平推紙，然後按確定';
                        if (method === 'pressPrint' || method === 'dCPrint' || method === 'deliveryPrint') {
                            tip = '請放入SALES MEMO，然後按確定';
                        } else if (method === 'equipmentPrint') {
                            tip = '請放入除舊計劃紙，然後按確定';
                        }
                        authCall({ confirmPrit: true });
                        Modal.success({
                            className: 'vla-confirm',
                            title: tip,
                            content: '',
                            okText: '確定',
                            onOk() {
                                authCall({ confirmPrit: false });
                                window.Print(printData, _this.onOffPrint);
                            }
                        });
                    } else {
                        printData && window.Print(printData);
                        this.onOffPrint();
                    }
                    break;
                case 'batchPrinting': //连续打印多种类型 方法顺序先平推后热敏
                    let methodName = data.method.split(',');//注意字符串逗号后边不能空格
                    let printAction = (times = 0, codeStr = '') => {
                        if (times < methodName.length) {
                            let method = methodName[times];
                            let constData = this[method](data);
                            if (constData) { //打印参数构造是否成功
                                if (method !== 'yellowPrint' && method !== 'accessoryPrint' && method !== 'salePrint') {
                                    let tip = '請放入平推紙，然後按確定';
                                    if (method === 'dCPrint' || method === 'deliveryPrint' || method === 'aCSMEMOPrint') {
                                        tip = '請放入SALES MEMO，然後按確定';
                                    } else if (method === 'equipmentPrint') {
                                        tip = '請放入除舊計劃紙，然後按確定';
                                    } else if (method === 'aCSFQPrint') {
                                        tip = '請放入AEON信貸財務分期批核表，然後按確定';
                                    } else if (method === 'pressPrint') {
                                        tip = '請放入按金單，然後按確定！';
                                    }
                                    authCall({ confirmPrit: true });
                                    Modal.success({
                                        className: 'vla-confirm',
                                        title: tip,
                                        content: '',
                                        okText: '確定',
                                        onOk() {
                                            authCall({ confirmPrit: false });
                                            window.Print(constData, (data) => {//打印回调
                                                printAction(++times, codeStr + data.code);
                                            });
                                        }
                                    });
                                } else {
                                    window.Print(constData, (data) => {//打印回调
                                        printAction(++times, codeStr + data.code);
                                    });
                                }
                            } else {
                                printAction(++times, codeStr);
                            }
                        } else {
                            let msg = (codeStr === '' || codeStr.includes('5')) ? '打印失敗' : '打印成功';
                            message(msg);
                            this.onOffPrint();
                        }
                    }
                    this.printAgEjoural(data);
                    printAction();
                    break;
                default:
                    return false;
            }
        } catch (e) {
            if (type === 'forwardPrint' || type === 'batchPrinting') {
                authCall({
                    isPrint: false,
                    confirmPrit: false,
                });
            }
            message("打印單據失敗，請聯系工作人員！");
        }
    }

    printAgEjoural = (data) => {
        const dividingLine = '\r\n---------------------------------------';
        let ejouralList = [], ejouralText = '';
        let titleTxt = `SHOP ${this.props.initialState.mkt}/${this.props.initialState.syjh}  REF ${this.props.initialState.syjh + this.props.initialState.fphm}  ${moment().format('DD/MM/YYYY')}\r\nOPERATOR ${this.props.operators.gh}  ${moment().format('HH:mm:ss')}`;
        ejouralList.push(titleTxt);
        ejouralList.push(dividingLine);
        ejouralList.push(`\r\nREPRINT RECEIPT ${data.syjh + data.fphm}  ${data.syyh}`);
        ejouralList.push(dividingLine);

        ejouralList.forEach(item => {
            ejouralText += item;
        });
        window.Log(ejouralText, '1');
    }

    //黄色小票打印
    yellowPrint = (data) => {
        console.log('黄色小票打印');
        let printTemplate;
        printTemplate = {
            Module: 'YellowPrint',
            head: [{
                ...data.commonData,
                refno: data.syjh + data.fphm,  //ref值
                syyh: data.syyh,//收银员
                mkt: data.mkt,//门店号
                syjh: data.syjh,//收银机号
                fphm: data.fphm,//小票号
                zl: data.change,//找零金额
                djlb: data.djlb,//单据类别1代表销售，4代表退货
                printtype: "0", //0代表热敏打印，1代表平推
                printnum: 1,//重打次数
                printtime: this.props.syspara.salebillnum || 1,//打印次数

                isfl: 'N',  //当值为Y时，复联打印
            }],
            goods: data.goodslist,
            pay: data.salepayments.filter(item => item.flag !== '2')
        };
        return printTemplate;
    }

    //曼哈顿；渣打
    fQPrint = (data) => {
        console.log('曼哈顿；渣打');
        let printTemplate;
        printTemplate = {
            Module: 'FQPrint',
            head: [{
                ...data.commonData,
                refno: data.syjh + data.fphm,  //ref值
                syyh: data.syyh,//收银员
                mkt: data.mkt,//门店号
                syjh: data.syjh,//收银机号
                fphm: data.fphm,//小票号
                zl: data.change,//找零金额
                djlb: data.djlb,//单据类别1代表销售，4代表退货
                printtype: "1", //0代表热敏打印，1代表平推

                printnum: 1,//重打次数
                printtime: this.props.syspara.salebillnum || 1,//打印次数
                iscoupon_gain: false, //是否打印券
                coupon_gain: data.coupon_gain,//返券
                jf: data.jf,  //本币获得积分
                curjf: data.curjf, //当前积分
                isfl: 'N',  //当值为Y时，复联打印
            }],
            goods: data.goodslist,
            pay: data.salepayments.filter(item => item.flag !== '2')
        };
        return printTemplate;
    }

    //ACS分期
    aCSFQPrint = (data) => {
        let printTemplate;
        printTemplate = {
            Module: 'ACSFQPrint',
            head: [{
                ...data.commonData,
                refno: data.syjh + data.fphm,  //ref值
                syyh: data.syyh,//收银员
                mkt: data.mkt,//门店号
                syjh: data.syjh,//收银机号
                fphm: data.fphm,//小票号
                zl: data.change,//找零金额
                djlb: data.djlb,//单据类别1代表销售，4代表退货
                printtype: "1", //0代表热敏打印，1代表平推

                printnum: 1,//重打次数
                printtime: this.props.syspara.salebillnum || 1,//打印次数
                iscoupon_gain: false, //是否打印券
                coupon_gain: data.coupon_gain,//返券
                jf: data.jf,  //本币获得积分
                curjf: data.curjf, //当前积分
                isfl: 'N',  //当值为Y时，复联打印

                expressNumber: undefined
            }],
            goods: data.goodslist,
            pay: data.salepayments.filter(item => item.flag !== '2')
        };
        return printTemplate;
    }

    aCSMEMOPrint = (data) => {
        let printTemplate;
        printTemplate = {
            Module: 'ACSMEMOPrint',
            head: [{
                ...data.commonData,
                refno: data.syjh + data.fphm,  //ref值
                syyh: data.syyh,//收银员
                mkt: data.mkt,//门店号
                syjh: data.syjh,//收银机号
                fphm: data.fphm,//小票号
                zl: data.change,//找零金额
                djlb: data.djlb,//单据类别1代表销售，4代表退货
                printtype: "1", //0代表热敏打印，1代表平推

                printnum: 1,//重打次数
                printtime: this.props.syspara.salebillnum || 1,//打印次数
                iscoupon_gain: false, //是否打印券
                coupon_gain: data.coupon_gain,//返券
                jf: data.jf,  //本币获得积分
                curjf: data.curjf, //当前积分
                isfl: 'N',  //当值为Y时，复联打印
            }],
            goods: data.goodslist,
            pay: data.salepayments.filter(item => item.flag !== '2')
        };
        return printTemplate;
    }

    //行送
    deliveryPrint = (data) => {
        console.log('行送');
        let printTemplate;
        printTemplate = {
            Module: 'DeliveryPrint',
            head: [{
                ...data.commonData,
                refno: data.syjh + data.fphm,  //ref值
                syyh: data.syyh,//收银员
                mkt: data.mkt,//门店号
                syjh: data.syjh,//收银机号
                fphm: data.fphm,//小票号
                djlb: data.djlb,//单据类别1代表销售，4代表退货
                printtype: "1", //0代表热敏打印，1代表平推
                ishs: "Y",  //行送标识

                zl: data.change,//找零金额

                printnum: 1,//重打次数
                printtime: 1,//打印次数
                //iscoupon_gain: isCoupon, //是否打印券

                coupon_gain: data.coupon_gain,//返券
                jf: data.jf,  //本币获得积分
                curjf: data.curjf, //当前积分
                //isfl: data.syjmain.issryyy,  //当值为Y时，复联打印
                dcData: data.dcData,

            }],
            goods: data.goodslist,
            pay: data.salepayments.filter(item => item.flag !== '2')
        };
        return printTemplate;
    }

    //DC送
    dCPrint = (data) => {
        console.log('DC送');
        let dcData = {}, others = {}, goods = data.goodslist, printTemplate;
        dcData.date = moment(data.deliveryTime).format("DD/MM/YYYY");
        dcData.reserveLocation = data.reserveLocation;
        dcData.customName = data.receiverName;
        dcData.telephone = data.receiverMobile || data.receiverPhone;
        dcData.address = data.address;
        dcData.locationOut = data.outLocation;
        dcData.otherTelephone = data.receiverStandbyPhone;

        if (new Date().getDay() === 3) {
            others.isYhrq = 'Y';
        }
        printTemplate = {
            Module: 'DCPrint',
            head: [{
                ...data.commonData,
                refno: data.syjh + data.fphm,  //ref值
                syyh: data.syyh,//收银员
                mkt: data.mkt,//门店号
                syjh: data.syjh,//收银机号
                fphm: data.fphm,//小票号
                zl: data.change,//找零金额
                djlb: data.djlb,//单据类别1代表销售，4代表退货
                printtype: "1", //0代表热敏打印，1代表平推


                zl: data.change,//找零金额
                printnum: 1,//重打次数
                printtime: this.props.syspara.salebillnum || 1,//打印次数
                //iscoupon_gain: isCoupon, //是否打印券
                // ArtcodeMoney: ArtcodeMoney, //黄色小票非直营金额
                // DirectMoney: DirectMoney, //黄色小票直营金额
                coupon_gain: data.coupon_gain,//返券
                jf: data.jf,  //本币获得积分
                curjf: data.curjf, //当前积分
                isfl: 'N',  //当值为Y时，复联打印

                isdc: "Y",
                dcData: dcData,
                ...others,
            }],
            goods,
            pay: data.salepayments.filter(item => item.flag !== '2')
        };
        return printTemplate;
    }

    //消单,退货
    returnPrint = (data) => {
        console.log('消单', data);//VoidPrint
        let dcData = {}, other = {}, Module;
        dcData.date = moment(data.deliveryTime).format("DD/MM/YYYY");
        dcData.reserveLocation = data.reserveLocation;
        dcData.customName = data.receiverName;
        dcData.telephone = data.receiverMobile || data.receiverPhone;
        dcData.address = data.address;
        dcData.locationOut = data.outLocation;
        dcData.otherTelephone = data.receiverStandbyPhone;

        if (data.djlb === '4') {
            Module = "ReturnPrint";
        } else {
            Module = "VoidPrint";
            data.commonData.mdjc = undefined;//消单屏蔽字段
            data.commonData.barcodeString = undefined;
        }

        if (data.logisticsMode === 3) { //行送
            other.ishs = 'Y';
        } else if (data.logisticsMode === 5) { //DC送
            other.isdc = 'Y';
        }
        data.goodslist.map(item => {
            item.total = item.ysje;//服务返回数据有问题；调整
        });
        other.yhNO = data.eleStamp == 0 ? data.sticker : data.eleStamp;//退货印花数
        other.ysyjNo = data.originTerminalNo; //原收银机号
        other.yxpNo = data.originTerminalSno; //原小票号
        other.ymdNo = data.originShopCode;  //原门店号
        let printTemplate;
        printTemplate = {
            Module: Module,
            head: [{
                ...data.commonData,
                refno: data.syjh + data.fphm,  //ref值
                syyh: data.syyh,//收银员
                mkt: data.mkt,//门店号
                syjh: data.syjh,//收银机号
                fphm: data.fphm,//小票号
                zl: data.change,//找零金额
                djlb: data.djlb,//单据类别1代表销售，4代表退货
                printtype: "1", //0代表热敏打印，1代表平推
                dcData: dcData, //DC退货信息

                printnum: 1,//重打次数
                printtime: 1,//打印次数

                //iscoupon_gain: isCoupon, //是否打印券
                coupon_gain: data.coupon_gain,//返券
                returnResaon: data.reason,//退货原因
                isFS: 'Y',

                ...other
            }],
            goods: data.goodslist,
            pay: data.salepayments.filter(item => item.flag !== '2')
        };
        return printTemplate;
    }

    //按金第一笔平推
    pressPrint = (data) => {
        console.log('按金交易', data);
        let printTemplate;
        printTemplate = {
            Module: 'PressPrint',
            head: [{
                ...data.commonData,
                refno: data.syjh + data.fphm,  //ref值
                syyh: data.syyh,//收银员
                mkt: data.mkt,//门店号
                syjh: data.syjh,//收银机号
                fphm: data.fphm,//小票号
                zl: data.change,//找零金额
                djlb: data.djlb,//单据类别1代表销售，4代表退货
                printtype: "1", //0代表热敏打印，1代表平推


                printnum: 1,//重打次数
                printtime: 1,//打印次数
                // iscoupon_gain: isCoupon, //是否打印券

                // coupon_gain: data.coupon_gain,//返券
                // jf: data.jf,  //本币获得积分
                // curjf: data.curjf, //当前积分

            }],
            goods: data.goodslist,
            pay: data.salepayments.filter(item => item.flag !== '2')
        };
        return printTemplate;
    }

    //尾款第二笔
    tailPrint = (data) => {
        console.log('尾款第二笔交易', data);
        let printTemplate;
        printTemplate = {
            Module: 'TailPrint',
            head: [{
                ...data.commonData,
                refno: data.syjh + data.fphm,  //ref值
                syyh: data.syyh,//收银员
                mkt: data.mkt,//门店号
                syjh: data.syjh,//收银机号
                fphm: data.fphm,//小票号
                zl: data.change,//找零金额
                djlb: data.djlb,//单据类别1代表销售，4代表退货
                printtype: "1", //0代表热敏打印，1代表平推

                isTailPrint: "Y",
                printnum: 1,//重打次数
                printtime: 1,//打印次数

            }],
            goods: data.goodslist,
            pay: data.salepayments.filter(item => item.flag !== '2')
        };
        return printTemplate;
    }

    // 副单打印
    accessoryPrint = (data) => {
        console.log('副单打印', data);
        let goodslist = data.goodslist, hjzsl = 0, depInfo,
            printTemplate, others = {};
        depInfo = goodslist.filter(item => item.prtDuplFlag);
        for (let i = 0, len = depInfo.length; i < len; i++) {
            //depInfo[i].idnum = i + 1;
            hjzsl = hjzsl + depInfo[i].qty;
        }
        if (hjzsl === 0) {
            message("該訂單中無副單商品無法打印");
            return;
        }

        if (data.djlb === '4') {//退货单
            others.isFS = 'Y';
            others.ysyjNo = data.originTerminalNo //原收银机号
            others.yxpNo = data.originTerminalSno //原小票号
            others.ymdNo = data.originShopCode  //原门店号
            others.returnResaon = data.reason,//退货原因
                others.yhNO = data.eleStamp == 0 ? data.sticker : data.eleStamp//退货印花数
            data.goodslist.map(item => {
                item.total = item.ysje;//服务返回数据有问题；调整
            });
        }
        printTemplate = {
            Module: 'SinglePrint',
            head: [{
                ...data.commonData,
                ...others,
                refno: data.syjh + data.fphm,
                syyh: data.syyh,//收银员
                mkt: data.mkt,//门店号
                zl: data.change,//找零金额
                djlb: data.djlb,//单据类别1代表销售，4代表退货
                printtype: "0", //0代表热敏打印，1代表平推
                printnum: 1,//重打次数
                printtime: 1,//打印次数
                syjh: data.syjh,
            }],
            goods: data.goodslist,
            pay: data.salepayments.filter(item => item.flag !== '2')
        }
        if (data.method.split(',').length > 1) {
            return printTemplate;
        } else {
            window.Print(printTemplate);
            this.onOffPrint();
        }
    }

    //热敏可以平推
    cySlipPrint = (data) => {
        return this.thermalFlatpush(data, 'CySlipPrint');
    }

    //重印打印（热敏, 部分平推）
    salePrint = (data) => {
        return this.thermalFlatpush(data);
    }

    thermalFlatpush = (data, module) => {
        let octopusInfo = {}, others = {}, ctpInfo, printTemplate,
            isflPrint = true;
        if (!module) {//判断副单
            let depInfo = data.goodslist.filter(item => item.prtDuplFlag);
            for (let i = 0, len = depInfo.length; i < len; i++) {
                if (depInfo[i].qty > 0) {
                    others.isflPrint = true;
                    break;
                }
            }
        }

        if (data.djlb === "Y3") { //现金增值
            octopusInfo.octopusBalance = new Number(data.octopusBalance).toFixed(2) || '';
            octopusInfo.octopusCardno = data.octopusCardno || '',
                octopusInfo.octopusDeviceId = data.octopusDeviceId || '';
            octopusInfo.octopusIsSmart = typeof data.octopusIsSmart === 'boolean' ? data.octopusIsSmart : '';

            octopusInfo.octopusLastAddValDate = data.octopusLastAddValDate || '';
            octopusInfo.octopusLastAddValType = (data.english ? this.otpTypeConver(data.octopusLastAddValType) : data.octopusLastAddValType) || '';//英文切换时候需要打印需要映射
            octopusInfo.octopusRechargeTotal = new Number(data.goodslist[0].ysje).toFixed(2) || '';
            octopusInfo.octopusTransactionTime = data.octopusTranscationTime || '';
            console.log('octopusInfo', octopusInfo);
            printTemplate = {
                Module: module || 'OctopusPrint',
                head: [{
                    ...data.commonData,
                    refno: data.syjh + data.fphm,
                    syjh: this.props.initialState.syjh,
                    syyh: data.syyh,//收银员
                    mkt: data.mkt,//门店号
                    zl: data.change,//找零金额
                    djlb: data.djlb,//单据类别1代表销售，4代表退货
                    printtype: module ? '1' : "0", //0代表热敏打印，1代表平推
                    printnum: 1,//重打次数
                    printtime: 1,//打印次数
                    ...octopusInfo
                }],
                goods: data.goodslist,
                pay: data.salepayments
            };
        } else if (data.djlb === "Y9") { //找零增值
            octopusInfo.octopusDeviceId = data.octopusDeviceId || '';
            octopusInfo.octopusCardno = data.octopusCardno || '';
            octopusInfo.octopusBalance = new Number(data.octopusBalance).toFixed(2) || '';
            octopusInfo.octopusIsSmart = typeof data.octopusIsSmart === 'boolean' ? data.octopusIsSmart : '';
            octopusInfo.octopusTransactionTime = data.octopusTranscationTime || '';
            octopusInfo.octopusRechargeTotal = new Number(data.goodslist[0].ysje).toFixed(2) || '';
            octopusInfo.orgiRefno = data.octopusRefNo.slice(6) || '';
            printTemplate = {
                Module: module || 'OctozzSalePrint',
                head: [{
                    ...data.commonData,
                    mkt: data.mkt,//门店号
                    refno: data.syjh + data.fphm,
                    syyh: data.syyh,//收银员
                    syjh: data.syjh,
                    zl: 0,
                    printnum: 1,//重打次数
                    printtype: module ? '1' : "0", //0代表热敏打印，1代表平推
                    ...octopusInfo,
                }],
            };
        } else {//支付类型打印
            let payData = data.salepayments.filter(item => !item.payname.includes('octopus'));
            ctpInfo = data.salepayments.find(item => item.paycode === '0403');
            if (ctpInfo) {
                octopusInfo.octopusDeviceId = ctpInfo.terminalid || '';//
                octopusInfo.octopusCardno = ctpInfo.payno || '';
                octopusInfo.octopusDedudeTotal = new Number(ctpInfo.ybje).toFixed(2) || '',
                    octopusInfo.octopusBalance = new Number(ctpInfo.couponBalance).toFixed(2) || '';
                octopusInfo.octopusTransactionTime = ctpInfo.octopusTranscationTime || '';
                octopusInfo.octopusLastAddValDate = ctpInfo.octopusLastAddValDate || '';
                octopusInfo.octopusLastAddValType = (data.english ? this.otpTypeConver(ctpInfo.octopusLastAddValType) : ctpInfo.octopusLastAddValType) || '';//英文切换时候需要打印需要映射
                octopusInfo.octopusIsSmart = typeof ctpInfo.octopusIsSmart === 'boolean' ? ctpInfo.octopusIsSmart : '';
                octopusInfo.zliszzoctopus = false; //是否找零
            } else {
                if (data.commonData.otpZl) {
                    octopusInfo.zliszzoctopus = true;
                    octopusInfo.octopusDeviceId = 999;//不传无法进入八达通信息判断，需要传个非空值
                } else {
                    octopusInfo.zliszzoctopus = false;
                    octopusInfo.octopusDeviceId = '';//不传无法进入八达通信息判断，需要传个非空值
                }
            }

            if (data.djlb === '4') {//退货单
                others.isFS = 'Y';
                others.ysyjNo = data.originTerminalNo //原收银机号
                others.yxpNo = data.originTerminalSno //原小票号
                others.ymdNo = data.originShopCode  //原门店号
                others.yhNO = data.eleStamp == 0 ? data.sticker : data.eleStamp//退货印花数
                data.goodslist.map(item => {
                    item.total = item.ysje;//服务返回数据有问题；调整
                });
            }

            if (data.logisticsMode === 5) {//DC送
                others.dcData = {};
                others.dcData.date = moment(data.deliveryTime).format("DD/MM/YYYY");
                others.dcData.reserveLocation = data.reserveLocation;
                others.dcData.customName = data.receiverName;
                others.dcData.telephone = data.receiverMobile || data.receiverPhone;
                others.dcData.address = data.address;
                others.dcData.locationOut = data.outLocation;
                others.dcData.otherTelephone = data.receiverStandbyPhone;
                others.isdc = 'Y';
            }

            if (data.logisticsMode === 3) {
                others.ishs = "Y";
            } else if (new Date().getDay() === 3) {
                others.isYhrq = 'Y';
            }

            //商品行中添加memberActionSno
            if (data.memberActionSno) {
                data.goodslist.forEach(item => {
                    if (item.goodsType === '13') {
                        item.amcNO = data.memberActionSno;
                    }
                })
            }

            if (this.state.tail) {
                others.isTailPrint = "Y";
            }

            printTemplate = {
                Module: module || 'SalePrint',
                head: [{
                    ...data.commonData,
                    refno: data.syjh + data.fphm,
                    syyh: data.syyh,//收银员
                    mkt: data.mkt,//门店号
                    zl: data.change,//找零金额
                    djlb: data.djlb,//单据类别1代表销售，4代表退货
                    printtype: module ? '1' : "0", //0代表热敏打印，1代表平推
                    printnum: 1,//重打次数
                    printtime: 1,//打印次数
                    syjh: data.syjh,

                    returnResaon: data.reason,//退货原因
                    ...octopusInfo,
                    ...others
                }],
                goods: data.goodslist,
                pay: payData.filter(item => item.flag !== '2')
            };
        }
        return printTemplate;
    }

    //DC送查询门店配送信息
    getRegionList = () => {
        let req = {
            operators: this.props.operators && this.props.operators.gh, //操作员号
            flow_no: this.state.flow_no,
            mkt: '081',
            syjh: this.props.initialState.syjh,
        };
        return this.props.actions.getRegionList(req);
    }

    //DC送查询区域信息
    getRegionInfo = () => {
        let req = {
            operators: this.props.operators && this.props.operators.gh, //操作员号
            flow_no: this.state.flow_no,
            mkt: '081',
            syjh: this.props.initialState.syjh,
        };
        return this.props.actions.getRegionInfo(req);
    }

    //DC送查询quota规则
    getQuotaInfo = (params) => {
        let req = {
            operators: this.props.operators && this.props.operators.gh, //操作员号
            flow_no: this.state.flow_no,
            mkt: '081',
            syjh: this.props.initialState.syjh,
            flag: '0',
            shopTypex: '3',
            ...params
        };
        return this.props.actions.getQuotaInfo(req);
    }

    //配送中心送货
    dcDelivery = () => {
        let _this = this;
        // if (this.state.isDj === true) {
        //     message('已選【定金】，請先取消');  //'已选【行送】，请先取消'
        //     return false;
        // }
        if (this.state.isSd === true) {
            message(intl.get("INFO_HSCNOT"));  //'已选【行送】，请先取消'
            return false;
        }
        if (this.state.goodsList.length > 6) {
            if (this.state.isDj === true) {
                message("定金的訂單最多只可添加6件商品");
            } else {
                message(intl.get("INFO_CANNOTDELIVERY")); // 需送货的订单最多只可添加6件商品
            }
            return false;
        }
        if (this.state.octozz === "Y3") {
            message(intl.get("INFO_ADDVALNODLVY"));  //八达通增值商品不可选择送货
            return false;
        }

        if (this.state.octozz === "Y10" || this.state.octozz === "Y11" || this.state.octozz === "Y19") {
            message("會員商品不可選擇送貨");  //会员商品不可选择送货
            return false;
        }
        Delivery.open({
            data: {
                dcData: this.state.dcData,
                mkt: this.props.initialState.mkt,
                mktname: this.props.initialState.data.mktinfo && this.props.initialState.data.mktinfo.mktname,
                paravalue: this.props.initialState.data.syspara.find(v => v.code === 'JYMS') && this.props.initialState.data.syspara.find(v => v.code === 'JYMS').paravalue,
            },
            getRegionInfo: this.getRegionInfo,
            getRegionList: this.getRegionList,
            getQuotaInfo: this.getQuotaInfo,
            callback: (_dcData) => {
                _this.setState({
                    isDc: true,
                    dcData: {
                        date: _dcData.date,
                        reserveLocation: _dcData.reserveLocation,
                        customName: _dcData.customName,
                        telephone: _dcData.telephone,
                        address: _dcData.address,
                        locationOut: _dcData.locationOut,
                        otherTelephone: _dcData.otherTelephone,
                        receiverDistrict: _dcData.receiverDistrict,
                        receiverStreet: _dcData.receiverStreet,
                        showReceiverStreet: _dcData.showReceiverStreet,
                        deliveryStartTime: _dcData.deliveryStartTime,
                        deliveryEndTime: _dcData.deliveryEndTime,
                        invoiceTitle: _dcData.invoiceTitle,
                        chooseDateList: _dcData.chooseDateList,
                        showDateList: _dcData.showDateList
                    }
                });
            }
        })
    }

    //供应商送货
    sdDelivery = async (key) => {
        let keyValue = key === 'isDj' ? 'isSd' : 'isDj';
        /* if (this.state[keyValue] === true) {
            let msg = key === 'isDj' ? intl.get("INFO_HSCNOT") : '已選【定金】，請先取消';
            message(msg);
            return false;
        }*/
        if (this.state.isDc === true && key == "isSd") {
            message(intl.get("INFO_DCCANOT"));  //'已选【DC送】，请先取消'
            return false;
        }
        if (this.state.goodsList.length > 6) {
            if (key === 'isDj') {
                message("定金的訂單最多只可添加6件商品");
            } else {
                message(intl.get("INFO_CANNOTDELIVERY")); // 需送货的订单最多只可添加6件商品
            }
            return false;
        }
        if (this.state.octozz === "Y3") {
            message(intl.get("INFO_ADDVALNODLVY"));  //八达通增值商品不可选择送货
            return false;
        }
        if (this.state.octozz === "Y10" || this.state.octozz === "Y11" || this.state.octozz === "Y19") {
            message("會員商品不可選擇送貨");  //会员商品不可选择送货
            return false;
        }
        if (key !== 'isDj' && this.state.goodsList.length > 0) {
            let _artcode = this.state.goodsList[0].venderCode;
            for (let i = 1; i < this.state.goodsList.length; i++) {
                if (_artcode !== this.state.goodsList[i].venderCode) {
                    message(intl.get("INFO_SDFROMSAME")); // 行送商品不可由不同供应商发货    /* 2019.4.3 字段category改为venderCode， by Sean */
                    return false;
                }
            }
        }
        //let expressNumber = await this.getBill(this.state.flow_no);
        SaleMemo.open({
            data: {
                isDj: key == "isDj",
                isSd: this.state.Sd,
                goodlistLen: this.state.goodsList.length,
                deliveryCancel: this.onDeliveryCancel,
                salesMemo: this.state.salesMemo,
                djValue: this.state.djValue
            },
            callback: (_salesMemo, djValue) => {
                let theDt = moment(new Date()).add(2, 'days'), sdInfo = {};
                const req = {
                    command_id: "REFRESHDELIVERYINFO",
                    operators: this.props.operators && this.props.operators.gh, //操作员号
                    flow_no: this.state.flow_no,
                    mkt: this.props.initialState.mkt,
                    syjh: this.props.initialState.syjh, //终端号
                    expressNumber: _salesMemo,
                    // logisticsMode: key === 'isDj' ? 5 : (key === 'isDj' ? )
                };
                if (key !== 'isDj') {//不是定金配置行送信息
                    sdInfo = {
                        logisticsMode: 3,
                        receiverName: this.state.dcData.customName,   // 收货人姓名
                        receiverMobile: this.state.dcData.telephone,    // 收货人手机
                        receiverPhone: this.state.dcData.telephone,	    // 收货人电话
                        receiverAddress: this.state.dcData.address,	    // 收货人地址
                        deliveryTime: theDt.format("YYYY-MM-DD"),	// 送货时间
                        receiverStandbyPhone: this.state.dcData.otherTelephone,	// 其它联系人电话
                        outLocation: this.state.dcData.locationOut,	// 出库位置
                        reserveLocation: this.state.dcData.reserveLocation,	// 服务地点
                    };
                    return this.props.actions.refreshDelivery({ ...req, ...sdInfo }).then((res) => {
                        document.getElementById('codeInput').focus();
                        this.setState({
                            [key]: true,
                            salesMemo: _salesMemo,
                            djValue
                        })
                    })
                } else {
                    let logicParams = {
                        logisticsMode: this.state.isDc ? 5 : (this.state.isSd ? 3 : 0)
                    };
                    Fetch(
                        {
                            url: Url.base_url,
                            type: "POST",
                            data: {
                                command_id: "UPDATEORDERDEPOSIT",
                                operators: this.props.operators && this.props.operators.gh, //操作员号
                                flow_no: this.state.flow_no,
                                mkt: this.props.initialState.mkt,
                                syjh: this.props.initialState.syjh, //终端号
                                depositSale: true,
                                depositValue: parseFloat(djValue)
                            }
                        }
                    ).then((res) => {
                        if ("0" === res.returncode) {
                            this.props.actions.refreshDelivery(Object.assign(req, logicParams)).then((res) => {
                                document.getElementById('codeInput').focus();
                                this.setState({
                                    [key]: true,
                                    salesMemo: _salesMemo,
                                    djValue
                                })
                            })
                        } else {
                            message(res.retmsg)
                        }
                    }).catch((error) => {
                    });
                }
            }
        })
        // this.setState({ isSd: true }, () => {
        // });
    }

    //八达通充值
    rechargeCard = () => {
        if (this.state.isDc === true) {
            message(intl.get("INFO_ADDVALNODLVY"));  //已选【DC送】，八达通增值商品不可选择送货
            return false;
        }
        if (this.state.isSd === true) {
            message(intl.get("INFO_ADDVALNODLVY"));  //'已选【行送】，八达通增值商品不可选择送货
            return false;
        }
        if (this.state.isDj === true) {
            message('已選【定金】，八達通增值商品不可選擇送貨');  //'已选【行送】，八达通增值商品不可选择送货
            return false;
        }
        if (this.state.octozz && this.state.octozz === 'Y11') {
            message('會員續費單據不能進行八達通增值操作'); // 会员续费单据不能进行八达通增值操作
            return false;
        }
        if (this.state.octozz && this.state.octozz === 'Y10') {
            message('會員入會單據不能進行八達通增值操作'); // 会员入会单据不能进行八达通增值操作
            return false;
        }
        if (this.state.octozz && this.state.octozz === 'Y12') {
            message('印花換購單據不能進行八達通增值操作'); // 印花换购单据不能进行八达通增值操作
            return false;
        }
        if (this.state.octozz && this.state.octozz === 'Y19') {
            message('換卡單據不能進行八達通增值操作');
            return false;
        }
        let that = this;
        let addValueDjlb = 'Y3';
        if (!!this.state.octozz && this.state.octozz === 'Y3') {
            message(intl.get('INFO_ADDVALUENODUP')); // 八达通增值商品不可重复添加
            return false;
        }
        RechargeKeypad.open({
            title: intl.get("INFO_OTPRECHARGE"),    //"八达通充值",
            placeholder: intl.get("PLACEHOLDER_AMOUNT"),  //"请输入充值金额",
            keyboard: [     //可选的键盘
                { name: "50", value: "50" },
                { name: "100", value: "100" },
                { name: "200", value: "200" },
                { name: "500", value: "500" }
            ],
            errMessage: intl.get("INFO_ADDVALUELIMIT"),  //"充值金额必须是50~1000，且为50的整数倍",
            rule: (num) => {
                if (num >= 50 && num <= 950 && num % 50 === 0 && num !== '0') {
                    return true;
                }
                return false;
            },
            callback: (num) => {
                return this.createSaleReq(addValueDjlb).then(res => {
                    if (res.flag) {
                        const addGoodsRes = this.addGoods('12952701', num, res.res.flow_no, false);
                        if (addGoodsRes) {
                            return addGoodsRes.then(res => {
                                if (res) {
                                    if (this.state.goodsList.length > 0) {
                                        this.saveBill(() => {
                                            this.addGoodsCallback(res);
                                            this.setState({
                                                flow_no: res.flow_no,
                                                octozz: addValueDjlb
                                            })
                                        });
                                    } else {
                                        this.initState();
                                        this.addGoodsCallback(res);
                                        this.setState({
                                            flow_no: res.flow_no,
                                            octozz: addValueDjlb
                                        })
                                    }
                                    return true
                                }
                            });
                        } else {
                            return false
                        }
                    }
                })
            }
        })
    }


    //查阅八达通
    readCard = () => {
        if (this.state.goodsList.length === 0) {
            message(intl.get("INFO_OCTOSWIPE"));    //请拍卡
            setTimeout(() => {
                OtpInfo.open({
                    data: {},
                    callback: (_dcData) => { }
                })
            }, 300);
        } else {
            message(intl.get("INFO_NOTEMPTYNOCY"));  //商品列表不为空，不可查阅八达通
            return false
        }
    }


    //整单折扣 flag === 0 取消整单折扣
    discountBill = (flag) => {
        if (this.state.goodsList.length === 0) {
            message(intl.get("INFO_EMPTYCANOTZK"));  //'商品列表为空时无法整单折扣！'
            return false
        }
        let discountBillAction = () => {
            let callback = (value) => {
                return this.props.actions.discountBill({
                    shopCode: this.props.initialState.mkt,
                    terminalNo: this.props.initialState.syjh,
                    terminalOperator: this.props.operators && this.props.operators.gh,
                    flowNo: this.state.flow_no,
                    discountRate: 100 - value * 1,
                }).then((res) => {
                    if (res) {
                        if (res) {
                            if (res.returncode === "0") {
                                this.replaceGoodsList(res);
                                this.handleEjoural(value, 8);
                                this.setState({
                                    tempZzk: 100 - value * 1
                                })
                                return true;
                            }
                            if (res.returncode === "1000") {
                                React.accredit(posrole => {
                                    if (posrole.privdpzkl > 0) {
                                        discountBillAction();
                                    } else {
                                        message(intl.get("INFO_AUTHFAIL"))   //'授权失败：无此权限'
                                    }
                                }, null, { flowNo: this.state.flow_no }, `${res.retmsg}: 請拉可授權之員工卡`)
                                return false;
                            }
                        }
                    }
                })
            }
            if (flag === 0) {
                return callback(0);
            }
            RechargeKeypad.open({
                title: intl.get("MENU_DISCOUNTZK"),   //"整单折扣",
                placeholder: intl.get("PLACEHOLDER_DISCONUTZK"), //"请输入折扣",
                //info: `当前账号最大折扣率为${this.props.posrole.privzpzkl}`,
                keyControl: this.state.keyControl,
                keyboard: [     //可选的键盘
                    { name: "5%", value: "5" },
                    { name: "10%", value: "10" },
                    { name: "15%", value: "15" },
                    { name: "20%", value: "20" }
                ],
                callback: (value) => callback(value)
            })
        }
        if (flag === 0) {
            return discountBillAction();
        }
        if (this.props.posrole.privzpzkl > 0) {
            discountBillAction();
            return true;
        }
        React.accredit(posrole => {
            if (posrole.privzpzkl > 0) {
                discountBillAction();
            } else {
                message(intl.get("INFO_AUTHFAIL"))   //'授权失败：无此权限'
            }
        }, null, { flowNo: this.state.flow_no })
    }

    //整单折让 flag === 0 取消整单让
    rebateBill = (flag) => {
        if (this.state.goodsList.length === 0) {
            message(intl.get("INFO_EMPTYCANOTZR"));  //'商品列表为空时无法整单折让！'
            return false
        }
        let rebateBillAction = () => {
            let callback = (value) => {
                return this.props.actions.rebateBill({
                    shopCode: this.props.initialState.mkt,
                    terminalNo: this.props.initialState.syjh,
                    terminalOperator: this.props.operators && this.props.operators.gh,
                    flowNo: this.state.flow_no,
                    discountAmount: value,
                }).then((res) => {
                    if (res) {
                        if (res) {
                            if (res.returncode === "0") {
                                this.replaceGoodsList(res);
                                this.handleEjoural(value, 9);
                                this.setState({
                                    tempZzr: value * 1
                                })
                                return true
                            }
                            if (res.returncode === "1000") {
                                React.accredit(posrole => {
                                    if (posrole.privdpzkl > 0) {
                                        rebateBillAction();
                                    } else {
                                        message(intl.get("INFO_AUTHFAIL"))   //'授权失败：无此权限'
                                    }
                                }, null, { flowNo: this.state.flow_no }, `${res.retmsg}: 請拉可授權之員工卡`)
                                return false;
                            }
                        }
                    }
                })
            }
            if (flag === 0) {
                return callback(0);
            }
            RechargeKeypad.open({
                title: intl.get("MENU_DISCOUNTZR"),  //"整单折让"
                placeholder: intl.get("PLACEHOLDER_DISCONUTZR"),  //"请输入折让金额",
                //info: `当前账号最大折让金额为${(1-this.props.posrole.privzpzkl)*this.state.totalData.price}`,
                keyControl: this.state.keyControl,
                keyboard: [     //可选的键盘
                    { name: "100", value: "100" },
                    { name: "50", value: "50" },
                    { name: "20", value: "20" },
                    { name: "10", value: "10" }
                ],
                callback: (value) => callback(value)
            })
        }
        if (flag === 0) {
            return rebateBillAction();
        }
        if (this.props.posrole.privzpzkl > 0) {
            rebateBillAction();
            return true;
        }
        React.accredit(posrole => {
            if (posrole.privzpzkl > 0) {
                rebateBillAction();
            } else {
                message(intl.get("INFO_AUTHFAIL"))   //'授权失败：无此权限'
            }
        }, null, { flowNo: this.state.flow_no })
    }

    //取消整单
    cancelSubmit = () => {
        return this.props.actions.cancelSubmit({
            shopCode: this.props.initialState.mkt,
            terminalNo: this.props.initialState.syjh,
            terminalOperator: this.props.operators && this.props.operators.gh,
            flowNo: this.state.flow_no,
            flag: 0,
            //sqkh: this.props.operators && this.props.operators.gh,
            octozz: null,
            isDc: false,
            isSd: false,
            isDj: false,
            dcData: {},
            salesMemo: ''
        }).then(res => {
            if (res) {
                this.setState({
                    discountPayFilter: null,
                    giftList: [],
                    exceptPayData: null,
                    limitedPays: null
                })
            }
            return res;
        })
    }

    //整单计算
    submitCalculate = async (params) => {
        let req = {
            shopCode: this.props.initialState.mkt,
            terminalNo: this.props.initialState.syjh,
            terminalOperator: this.props.operators && this.props.operators.gh,
            flowNo: this.state.flow_no,
            qty: params.qty,
            guidList: params.guidList,
            calcMode: params.calcMode,
            count: this.state.goodsList.length,
            ...params,
        }
        const paymodeList = this.props.initialState.data.paymode;
        this.props.actions.beforeSubmit(req).then(res => {
            if (res) {
                if (res === '1005') {
                    this.repullSale().then(_res => {
                        if (_res) {
                            this.submit();
                        }
                    })
                    return false;
                }
                const { limitedPays } = this.state;
                if (res.message) {
                    this.submitMessage = res.message;
                }
                //选择赠品后要重算guidList qty count
                if ((params.calcMode === 4 && params.giftList && params.giftList.length > 0
                    && (!res.noPriceGiftList || res.noPriceGiftList.length === 0)) || params.calcMode === -2) {
                    req.guidList = res.order.goodsList.map(item => item.guid);
                    req.qty = res.order.qty;
                    req.count = res.order.goodsList.length;
                } else {
                    req.guidList = res.order.goodsList.map(item => item.guid);
                    req.count = res.order.goodsList.length;
                }

                if (res.popFlag == '0' /* params.calcMode === -1 || params.calcMode === -3 || params.calcMode === 3 */) {
                    //支付追送(支付折扣)
                    // if (res.exceptPays && res.exceptPays.length > 0 && params.calcMode !== 3 && params.calcMode !== -3) {
                    //     res.exceptPays = res.exceptPays.filter(
                    //         item => paymodeList.find(_item => _item.code === item.paycode))
                    //     if (res.exceptPays.length > 0) {
                    //         ExtraPayModal.open({
                    //             type: 'exceptPays',
                    //             keyControl: this.state.keyControl,
                    //             paymodeList: paymodeList,
                    //             data: res,
                    //             cancel: this.cancelSubmit,
                    //             callback: (exceptPay) => {
                    //                 if (exceptPay) {
                    //                     this.setState({
                    //                         //discountPayDescribe,
                    //                         exceptPayData: exceptPay
                    //                     })
                    //                     this.submitCalculate({
                    //                         ...req,
                    //                         calcMode: 3,
                    //                         discountPayCode: exceptPay.paycode,
                    //                         discountPayType: exceptPay.paytype,
                    //                     })
                    //                 } else {
                    //                     this.setState({
                    //                         discountPayFilter: res.exceptPays
                    //                     })
                    //                     this.submitCalculate({
                    //                         ...req,
                    //                         calcMode: -3
                    //                     })
                    //                 }
                    //                 ExtraPayModal.close();
                    //             }
                    //         })
                    //     } else {
                    //         this.submitCalculate({
                    //             ...req,
                    //             calcMode: -1
                    //         })
                    //     }
                    //     return;
                    // }
                    // if (params.calcMode === 3) {
                    //     this.submitCalculate({
                    //         ...req,
                    //         calcMode: -3
                    //     })
                    //     return;
                    // }
                    ExtraPayModal.close();
                    if (this.submitMessage) {
                        Modal.info({
                            //title: this.submitMessage,
                            content: this.submitMessage.split('|').map(item => <p>{item}</p>),
                            className: 'vla-confirm',
                            width: 600,
                            okText: '確定',
                            onOk: () => {
                                this.submitMessage = '';
                                this.dispatchSubmit(req, res, this.state.octozz);
                            }
                        });
                    } else {
                        res.order.goodsList.forEach((item) => {
                            if (item.flag == "0") {
                                this.handleEjoural(item, 0);
                            }
                        });
                        this.dispatchSubmit(req, res, this.state.octozz);
                    }
                    return;
                }
                //if (res.popFlag == '0') {
                //选择赠品
                if (res.popFlag == '4' /* res.giftGroupList && res.giftGroupList.length > 0 && params.calcMode !== 4 */) {
                    ExtraPayModal.open({
                        type: 'giftList',
                        keyControl: this.state.keyControl,
                        //paymode: this.props.initialState.data.paymode,
                        data: res,
                        cancel: this.cancelSubmit,
                        callback: (giftList) => {
                            this.setState({ giftList })
                            this.submitCalculate({
                                ...req,
                                calcMode: giftList ? 4 : 7,
                                giftList
                            })
                        }
                    })
                } /* else if (res.exceptPays && res.exceptPays.length > 0 && params.calcMode !== 3 && params.calcMode !== -3) { */
                if (res.popFlag == '3') {
                    //支付追送(支付折扣)
                    res.exceptPays = res.exceptPays.filter(
                        item => paymodeList.find(_item => _item.code === item.paycode))
                    if (res.exceptPays.length > 0) {
                        ExtraPayModal.open({
                            type: 'exceptPays',
                            keyControl: this.state.keyControl,
                            paymodeList: paymodeList,
                            data: res,
                            cancel: this.cancelSubmit,
                            callback: (exceptPay) => {
                                if (exceptPay) {
                                    this.setState({
                                        //discountPayDescribe,
                                        exceptPayData: exceptPay
                                    })
                                    this.submitCalculate({
                                        ...req,
                                        calcMode: 3,
                                        discountPayCode: exceptPay.paycode,
                                        discountPayType: exceptPay.paytype,
                                    })
                                } else {
                                    this.setState({
                                        discountPayFilter: res.exceptPays
                                    })
                                    this.submitCalculate({
                                        ...req,
                                        calcMode: -1
                                    })
                                }
                                ExtraPayModal.close();
                            }
                        })
                    } else {
                        this.submitCalculate({
                            ...req,
                            calcMode: -1
                        })
                    }
                    return;
                }
                // if (params.calcMode === 3) {
                //     this.submitCalculate({
                //         ...req,
                //         calcMode: -3
                //     })
                //     return;
                // }else {
                //     this.submitCalculate({
                //         ...req,
                //         calcMode: -1
                //     })
                // }
                //}
                //除外付款
                if (res.popFlag == '2') {
                    this.setState({ limitedPays: res.limitedPays });
                    ExtraPayModal.open({
                        type: 'limitedPays',
                        keyControl: this.state.keyControl,
                        initialState: {
                            flow_no: this.state.flow_no,
                            operators: this.props.operators && this.props.operators.gh,
                            mkt: this.props.initialState.mkt,
                            syjh: this.props.initialState.syjh,
                            scene: '1'
                        },
                        paymodeList: this.props.initialState.data.paymode,
                        data: res,
                        syspara: this.props.syspara,
                        payDelete: this.props.actions.payDelete,
                        callback: (limitedpaycodes) => this.submitCalculate({
                            ...req,
                            calcMode: 2,
                            limitedpaycodes
                        })
                    })
                }
                //赠品定价
                if (res.popFlag == '100001') {
                    ExtraPayModal.open({
                        type: 'noPriceGiftList',
                        keyControl: this.state.keyControl,
                        data: res,
                        maxGiftPrice: this.props.syspara.maxSaleGoodsMoney,
                        cancel: this.cancelSubmit,
                        callback: (noPriceGiftList) => this.submitCalculate({
                            ...req,
                            calcMode: -2,
                            noPriceGiftList
                        })
                    })
                }
                // if (res.popFlag == '-3') {
                //     req.guidList = res.order.goodsList.map(item => item.guid);
                //     req.qty = res.order.qty;
                //     req.count = res.order.goodsList.length;
                //     this.submitCalculate({
                //         ...req,
                //         calcMode: -1
                //     })
                // }
            }
        })
    }

    //提交整单并跳转页面
    dispatchSubmit = (req, res, djlb) => {
        console.log(req);
        const { flow_no, goodsList, totalData, vipInfo, vipCardNo, tempVip, limitedPays, addGoodsTime, easyPay, deleteNum, switchEng, isDc, isSd, isDj, dcData, salesMemo, djValue, octozz, discountPayFilter, exceptPayData, giftList, staffcard, ejouralList, tempZzk, tempZzr, isJFXH } = this.state;
        console.log(flow_no);
        this.props.actions.submit(
            req,
            { flow_no, goodsList, totalData, vipInfo, vipCardNo, tempVip, limitedPays, addGoodsTime, easyPay, deleteNum, switchEng, isDc, isSd, isDj, dcData, salesMemo, djValue, octozz, discountPayFilter, exceptPayData, giftList, staffcard, ejouralList, tempZzk, tempZzr, isJFXH },
            res).then(() => {
                let _target = {
                    // pathname: '/invoice',
                    pathname: '/pay4Sale',
                    state: { type: "presale" },
                    query: {
                        djlb: this.state.octozz
                    },
                }
                this.props.history.push(_target);
            });
    }

    //修改密码
    changePassword = (values, callback) => {
        if (!values) {
            this.setState({ changePasswordModal: !this.state.changePasswordModal });
            return false;
        } this.props.actions.changepwd({
            ...values
        }).then(res => {
            //console.log(res)
            if (res) {
                this.setState({
                    changePasswordModal: false,
                })
            }
        })

    }

    //员工购物
    staffshopping = () => {
        if (this.props.initialState.JRRQ) {
            return message("吉日不容許使用此功能！");
        }
        if (this.state.vipInfo.memberId || this.state.staffcard || this.state.tempVip) {
            message(intl.get("INFO_STAFFANDVIPCARDERROR"));
            return
        } else {
            const com = (data) => {
                this.inputStaffCode(
                    'staff',
                    data,
                    () => {
                        RechargeKeypad.close();
                        EventEmitter.off('Com', com);
                        EventEmitter.off('Scan', com);
                    },
                    { idType: '1' }
                )
            }
            RechargeKeypad.open({
                title: intl.get("INFO_STAFFINPUTCARD"),
                placeholder: '',
                hasKeyboard: false,
                callback: (value, idType) => this.inputStaffCode('staff', value, () => { }, { idType }),
                event: {
                    chooseEvent: () => {
                        EventEmitter.on('Com', com)
                        EventEmitter.on('Scan', com)
                    },
                    cancelEvent: () => {
                        EventEmitter.off('Com', com)
                        EventEmitter.off('Scan', com)
                    },
                },
            })
        }
    }

    inputStaffCode = (tag, value, callback, vipOption) => {
        if (vipOption.certifytype == 'CANCEL') {
            this.exitStaff();
        }
        if (!value && !vipOption.idType) {
            return false;
        }
        if (vipOption.idType == 1 && value == this.props.operators.cardno) {
            message(intl.get("INFO_STAFFCARDCONFLICT")); //刷卡卡号不能和当前收银机卡号一致
            return false
        } else if (vipOption.idType == 2 && value == this.props.operators.gh) {
            message(intl.get("INFO_STAFFNUMBERCONFLICT")); //员工工号不能和当前收银员工号一致
            return false
        } else {
            switch (tag) {
                case "staff":
                    this.addStaff(value, vipOption, callback);
                    break;
                default:
                    break;
            }
        }
    }

    exitStaff = () => {
        console.log(this.props)
        let req = {
            mkt: this.props.initialState.mkt,
            staffNo: '',
            cardNo: '',
            flow_no: this.state.flow_no,
            erpCode: this.props.initialState.erpCode,
        };
        this.props.actions.staff(req).then(res => {
            console.log(res);
            const clear = {}
            this.props.actions.addstaffcardno(clear);
            this.setState({
                staffcard: '',
            })
        })
    }

    addStaff = (value, vipOption, callback) => {
        if (value.length > 0) { //7位员工卡 17位家属卡
            if (vipOption) {
                let req = {
                    mkt: this.props.initialState.mkt,
                    staffNo: '',
                    // cardNo: value.length == 7 ? value : value.slice(1),//9901976
                    cardNo: value.slice(0, 1) == 'J' ? value.slice(1) : value,
                    flow_no: this.state.flow_no,
                    erpCode: this.props.initialState.erpCode,
                };
                this.props.actions.staff(req).then(res => {
                    console.log(res)
                    if (res) {
                        if (res.cardType == 1 || res.cardType == 2) {
                            if (res.cardNo == this.props.operators.cardno) {
                                message(intl.get("INFO_STAFFCONFLICT")); //员工卡号与当前收银员冲突
                            } else if (res.cardNo || res.staffNo) {
                                this.props.actions.addstaffcardno(res);
                                this.setState({
                                    staffcard: res,
                                })
                            }
                        }
                    } else {

                    }
                    if (callback) {
                        callback();
                    }
                })
            }
        }
    }

    //更新收银机状态
    renewstateoffon = (syjcurstatus, onlinenumber) => {
        console.log('renew');
        let req = {
            "erpCode": this.props.initialState.erpCode,
            "mkt": this.props.initialState.mkt,
            "syjh": this.props.initialState.syjh,
            "syjcursyyh": this.props.operators.gh,
            "syjcurstatus": syjcurstatus,
        };
        this.props.hActions.renewstate(req).then(res => {
            console.log(res);
            Fetch(
                {
                    url: Url.base_url,
                    type: "POST",
                    data: {
                        command_id: 'HBCERTIFY',
                        erpCode: this.props.initialState.erpCode,
                        mkt: this.props.initialState.mkt,
                        syjh: this.props.initialState.syjh
                    }
                }
            ).then((res) => {
                if (res) {
                    this.props.setState({ online: res.netType });
                    if (onlinenumber == 1) {
                        this.promotionSyn();
                    } else if (onlinenumber == 2) {
                        this.promotionSyn();
                    } else {
                        console.log('...')
                    }
                }
            }).catch((error) => {
            });
        })
    };

    //联网更新小票号
    updatanumberonline = () => {
        let req = {
            "uuid": this.state.uuid,
            "erpCode": this.props.initialState.erpCode,
            "mkt": this.props.initialState.mkt,
            "syjh": this.props.initialState.syjh,
            "syjcursyyh": this.props.operators.gh,
        }
        this.props.hActions.updatanumberrenew(req).then(res => {
            if (res.returncode == 0) {
                if (res.retmsg) {
                    this.setState({ progressModal: false });
                    message("脫機狀態不支持上傳！");
                    return;
                }
                this.setState({
                    percent: this.state.percent + 1 / 3 * 100
                });
                this.updataonline();
            } else {
                Confirm({
                    title: '更新失敗，是否重新聯網小票號更新?',
                    className: 'vla-confirm',
                    zIndex: 10001,
                    okText: intl.get("BTN_CONFIRM"),
                    cancelText: intl.get("BACKTRACK"),
                    onOk: () => {
                        this.updatanumberonline();
                    },
                    onCancel: () => {
                        this.endCallback();
                    }
                });
            }
        }).catch((err) => {
            console.log(err);
            Confirm({
                title: '更新失敗，是否重新聯網小票號更新?',
                className: 'vla-confirm',
                zIndex: 10001,
                okText: intl.get("BTN_CONFIRM"),
                cancelText: intl.get("BACKTRACK"),
                onOk: () => {
                    this.updatanumberonline();
                },
                onCancel: () => {
                    this.endCallback();
                }
            });
        })
    }

    endCallback = () => {
        this.setState({ progressModal: false });
    }
    //启动营销订单同步
    promotionSyn = () => {
        this.setState({
            uuid: (new Date()).valueOf(),
        });
        var _this = this;
        let req = {
            command_id: "PROMOTIONSYN",
        }
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req,
            }
        ).then(res => {
            if (res.returncode === "0") {
                if (res.retmsg) {
                    this.setState({ progressModal: false });
                    message("脫機狀態不支持上傳！");
                    return;
                }
                console.log('启动营销订单同步');
                this.setState({
                    percent: this.state.percent + 1 / 3 * 100
                });
                this.updatanumberonline();
            } else {
                Confirm({
                    title: '更新失敗，是否重新啟動行銷訂單同步?',
                    className: 'vla-confirm',
                    okText: intl.get("BTN_CONFIRM"),
                    cancelText: intl.get("BACKTRACK"),
                    onOk() {
                        _this.promotionSyn();
                    },
                    onCancel() {
                        _this.endCallback();
                    }
                });
            }
        }).catch(err => {
            console.log(err);
            Confirm({
                title: '更新失敗，是否重新啟動行銷訂單同步?',
                className: 'vla-confirm',
                okText: intl.get("BTN_CONFIRM"),
                cancelText: intl.get("BACKTRACK"),
                onOk() {
                    _this.promotionSyn();
                },
                onCancel() {
                    _this.endCallback();
                }
            });
        });
    };

    // 联网更新数据
    updataonline = () => {
        let req = {
            "uuid": this.state.uuid,
            "erpCode": this.props.initialState.erpCode,
            "mkt": this.props.initialState.mkt,
            "syjh": this.props.initialState.syjh,
            "syjcursyyh": this.props.operators.gh,
        }
        this.props.hActions.updatarenew(req).then(res => {
            if (res.returncode == 0) {
                if (res.retmsg) {
                    this.setState({ progressModal: false });
                    message("脫機狀態不支持上傳！");
                    return;
                }
                this.setState({
                    percent: this.state.percent + 1 / 3 * 100
                });
                this.needToUpdata(1);
            } else {
                Confirm({
                    title: '更新失敗，是否重新聯網上傳數據?',
                    className: 'vla-confirm',
                    zIndex: 10001,
                    okText: intl.get("BTN_CONFIRM"),
                    cancelText: intl.get("BACKTRACK"),
                    onOk: () => {
                        this.updataonline();
                    },
                    onCancel: () => {
                        this.endCallback();
                    }
                });
            }

        }).catch((err) => {
            console.log(err);
            Confirm({
                title: '更新失敗，是否重新聯網上傳數據?',
                className: 'vla-confirm',
                zIndex: 10001,
                okText: intl.get("BTN_CONFIRM"),
                cancelText: intl.get("BACKTRACK"),
                onOk: () => {
                    this.updataonline();
                },
                onCancel: () => {
                    this.endCallback();
                }
            });
        })
    }
    //脱机联网弹窗
    onlineofflineModel = () => {
        var _this = this;
        Confirm({
            title: _this.props.initialState.online != 0 ? intl.get("MENU_OFFLINE") : intl.get("MENU_ONLINE"),
            className: 'vla-confirm',
            okText: intl.get("BTN_YES"),
            cancelText: intl.get("BTN_NO"),
            onOk() {
                _this.onlineoffline();
            },
            onCancel() {
                return
            }
        });
    };

    //有无需同步的数据
    needToUpdata = (mask = 0) => {
        this.props.hActions.needtoupdata({ mask }).then(res => {
            if (res.returncode === "0") {
                if (res.synflag == '0') {
                    this.setState({
                        havedata: 1,
                    })
                } else {
                    this.setState({
                        havedata: 0,
                    })
                }
                if (mask) {
                    this.props.setState({ uploadData: res.synflag == '0' ? 1 : 0 });
                }
            } else {
                console.log(res.retmsg);
            }
        }).catch((err) => {
            console.log(err)
        })
    }

    // 终止上传
    finishProgress = () => {
        let req = {
            "uuid": this.state.uuid,
            command_id: "STOPSYNOFFLINEDATA",
        }
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req,
                fetchFlag: true
            }
        ).then(res => {
            if (res.returncode === "0") {
                this.setState({ progressModal: false })
                this.needToUpdata(1);
            } else {
                message(res.retmsg);
            }
        }).catch(err => {
            console.log(err);
        });
    }

    //联网脱机
    onlineoffline = () => {
        if (this.state.goodsList.length > 0 || this.state.vipInfo.memberId || this.state.staffcard || this.state.salesMemo) {
            message(intl.get("INFO_ONLINEERROR"));
            return false
        } else {
            let req = {};
            let _this = this;
            if (this.props.humanIntervention) {
                this.props.hActions.online(req).then(
                    res => {
                        if (res) {
                            if (res.online == '0') {
                                this.needToUpdata();
                                Modal.success({
                                    title: '',
                                    okText: intl.get("BTN_CONFIRM"),
                                    content: intl.get("INFO_ONLINESUCC"),
                                    onOk: () => {
                                        _this.props.hActions.humanInterventionfalse();
                                        if (_this.state.havedata == 1 && res.centerFlag == 1) {
                                            Confirm({
                                                title: intl.get("INFO_UPDATAONLINE"),
                                                className: 'vla-confirm',
                                                okText: intl.get("BTN_YES"),
                                                cancelText: intl.get("BTN_NO"),
                                                onOk() {
                                                    _this.setState({
                                                        progressModal: true,
                                                        // pause: false,
                                                        percent: 0,
                                                    });
                                                    _this.renewstateoffon(1, 1);
                                                },
                                                onCancel() {
                                                    _this.renewstateoffon(1, 3);
                                                }
                                            });
                                        } else {
                                            message("IDC不通，本地數據無法上傳，稍後重試");
                                            _this.renewstateoffon(1, 3);
                                        }
                                    }
                                });
                            } else {
                                Modal.error({
                                    title: '',
                                    okText: intl.get("BTN_CONFIRM"),
                                    content: intl.get("INFO_ONLINEFAIL"),
                                });
                            }
                        }
                    }
                )
            } else if (!this.props.humanIntervention) {
                if (this.props.initialState.online != 0) {
                    this.props.hActions.offline(req).then(
                        res => {
                            if (res) {
                                if (res.offline == '0') {
                                    this.renewstateoffon(3, 3);
                                    this.props.hActions.humanInterventiontrue();
                                    Modal.success({
                                        title: '',
                                        okText: intl.get("BTN_CONFIRM"),
                                        content: intl.get("INFO_OFFLINEFAIL"),
                                        onOk: () => {
                                            return
                                        }
                                    });
                                } else {
                                    Modal.error({
                                        title: '',
                                        okText: intl.get("BTN_CONFIRM"),
                                        content: intl.get("INFO_OFFFAIL"),
                                    });
                                }
                            }
                        }
                    )
                } else {
                    this.props.hActions.online(req).then(
                        res => {
                            if (res) {
                                if (res.online == '0') {
                                    this.needToUpdata();
                                    _this.props.hActions.humanInterventionfalse();
                                    Modal.success({
                                        title: '',
                                        okText: intl.get("BTN_CONFIRM"),
                                        content: intl.get("INFO_ONLINESUCC"),
                                        onOk: () => {
                                            if (_this.state.havedata == 1 && res.centerFlag == 1) {
                                                Confirm({
                                                    title: intl.get("INFO_UPDATAONLINE"),
                                                    className: 'vla-confirm',
                                                    okText: intl.get("BTN_YES"),
                                                    cancelText: intl.get("BTN_NO"),
                                                    onOk() {
                                                        _this.setState({
                                                            progressModal: true,
                                                            // pause: false,
                                                            percent: 0,
                                                        });
                                                        _this.renewstateoffon(1, 1);
                                                    },
                                                    onCancel() {
                                                        _this.renewstateoffon(1, 3);
                                                    }
                                                });
                                            } else {
                                                message("IDC不通，本地數據無法上傳，稍後重試");
                                                _this.renewstateoffon(1, 3);
                                            }
                                        }
                                    });
                                } else {
                                    Modal.error({
                                        title: '',
                                        okText: intl.get("BTN_CONFIRM"),
                                        content: intl.get("INFO_ONLINEFAIL"),
                                    });
                                }
                            }
                        }
                    )
                }
            } else {
                Modal.error({
                    title: '',
                    okText: intl.get("BTN_CONFIRM"),
                    content: 'State Error',
                });
            }
        }
    }


    //快付通
    easyPay = () => {
        if (this.state.goodsList.length > 0) {
            message(intl.get("INFO_UNDONEEASYPAY"));  //'当前单据未完成，无法操作预销售！'
            return;
        }
        EasyPay.open({
            title: intl.get("MENU_EASYPAY"),
            onOk: (qrcode) => {
                //qrcode = '1234567890123456002006014229010000001028101741000010010281018208000100'
                if (qrcode.slice(16).substr(0, 3) !== this.props.initialState.mkt) {
                    let that = this;
                    Confirm({
                        title: intl.get("LOCK_TIP"),    //'温馨提示！'
                        content: intl.get("INFO_MKTDIFF"),  //'门店号不一致，商品价格可能有变。',
                        className: 'vla-confirm',
                        cancelText: '取消',
                        onOk() {
                            that.fastPay(qrcode);
                        },
                    });
                } else {
                    this.fastPay(qrcode);
                }
            }
        })
    }

    fastPay = (qrcode) => {
        this.props.actions.fastPay({
            shopCode: this.props.initialState.mkt,
            terminalNo: this.props.initialState.syjh,
            flowNo: this.state.flow_no,
            orgCode: '1',
            tradeno: qrcode,
            erpCode: this.props.initialState.erpCode,
            searchType: "1",
            //gz: "1",
            // jygs: this.props.initialState.jygs,
            terminalOperator: this.props.operators && this.props.operators.gh,
            assistantId: this.props.operators && this.props.operators.gh,
        }).then(res => {
            if (res) {
                let { order } = res;
                let goodsList = order.goodsList,
                    totalData,
                    vipInfo = {},
                    addGoodsTime = moment().format('DD/MM/YYYY HH:mm:ss');
                totalData = {
                    num: order.qty,
                    price: order.saleValue * 1,
                    discounts: order.totalDiscountValue * 1,
                    totalPrice: order.oughtPay * 1,
                };
                if (order.consumersData) {
                    vipInfo = order.consumersData;
                    //vipid, viptype, trgs, vipno, jfgrade
                }
                this.setState({
                    goodsList,
                    totalData,
                    addGoodsTime,
                    easyPay: true,
                    //easyPayModal: false,
                    vipInfo
                });
                this.handleEjoural(res.goodslist, 4)
            }
        })
    }

    //小票复制
    copyBill = (values, callback) => {
        if (!values) {
            if (!this.state.copyBillModal) {
                if (this.state.goodsList.length > 0) {
                    message(intl.get("INFO_UNDONEORDERCOPY"));  //'当前单据未完成，无法小票复制！'
                    return false;
                }
                if (this.props.posrole.privqt4 === 'Y') {
                    this.setState({ copyBillModal: !this.state.copyBillModal });
                    return false;
                }
                React.accredit(posrole => {
                    if (posrole.privqt4 === 'Y') {
                        this.setState({ copyBillModal: !this.state.copyBillModal });
                    } else {
                        message(intl.get("INFO_AUTHFAIL"))   //'授权失败：无此权限'
                    }
                }, null, { flowNo: this.state.flow_no })
            } else {
                this.setState({ copyBillModal: !this.state.copyBillModal });
            }
        } else {
            this.props.actions.copyBill({
                flowNo: this.state.flow_no,
                terminalOperator: this.props.operators && this.props.operators.gh,
                //mkt: this.props.initialState.mkt,
                //...values
                shopCode: values.substring(0, values.length - 9),
                terminalNo: values.substring(values.length - 9, values.length - 6),
                terminalSno: values.substring(values.length - 6),
            }).then(res => {
                if (res) {
                    let { addGoodsTime } = this.state
                    if (!addGoodsTime) {
                        addGoodsTime = moment().format('DD/MM/YYYY HH:mm:ss');
                    }
                    if (res.order.goodsList && res.order.goodsList.length > 0) {
                        this.replaceGoodsList(res);
                        this.handleEjoural(res.goodslist, 4)
                    }
                    this.setState({ copyBillModal: false, addGoodsTime });
                }
                if (callback) {
                    callback();
                }
            })
        }
    }

    //查阅AMC
    searchAMC = (values, callback) => {
        if (!values) {
            if (!this.state.searchAMCModal &&
                (this.props.home.humanIntervention || this.props.initialState.online == 0)) {
                message('脫機狀態下無法使用此功能！');
                return false;
            }
            this.setState({ searchAMCModal: !this.state.searchAMCModal });
            return false;
        }
        this.props.actions.vip({
            operators: this.props.operators && this.props.operators.gh,
            //vipno: values.vipno, //'83010113',
            certifytype: 'ERP',
            mkt: this.props.initialState.mkt,
            syjh: this.props.initialState.syjh,
            //idtype: values.idType, //会员ID类型 1-卡号 2-手机号 A-磁道 B-二维码 C-CID
            //channel: 'javapos',
            ...values
        }).then(res => {
            if (res && callback) {
                callback(res)
            }
        })
    }

    menuFilter = (menuList) => {
        switch (this.props.state.djlb) {
            //普通销售
            case '1':
                if (/*this.state.easyPay*/ false) {
                    return menuList.filter(i => i.code === '201');
                }
                return menuList;
            //买卷销售
            case 'Y1':
                return menuList.filter(i => i.code === '201' || i.code === '202' || i.code === '203' || i.code === '204' || i.code === '205' || i.code === '121' || i.code === '122' || i.code === '212' || i.code === '114' || i.code === '107' || i.code === '116' || i.code === '117' || i.code === '223' || i.code === '224' || i.code === '106');
            //练习销售
            case 'Y7':
                return menuList.filter(i => i.code === '201' || i.code === '202' || i.code === '203' || i.code === '204' || i.code === '205');
            default:
                return menuList
        }
    }

    //提交整单
    submit = async () => {
        console.log("BrowserWindowID", this.props.initialState.BrowserWindowID)
        if (this.props.initialState.BrowserWindowID == 3) {

            if (this.state.goodsList.length === 0) {
                this.getBillDetailFromFlowList();
                return;
            }
            await window["scanSubmit"](this.state.flow_no);
            this.props.updateXPH();
            return Promise.resolve().then(() => {
                this.createSale();
                this.initState();
                console.log('提交');
                window['dlWindow']({});
            });
        }
        console.log("付款", this.props.initialState.flowNoList);
        let guidList, qty = 0;
        const controlFlag = this.state.goodsList.find(v => v.controlFlag)
        const flag = this.state.goodsList.find(v => v.goodsType === '15')
        if (controlFlag && !flag) {
            message('未檢測管制商品標簽,請取消全單後重試')
            return false
        }
        if (this.state.goodsList.length === 0) {
            return false
        }
        if (this.state.octozz && this.state.octozz === 'Y11' &&
            (!this.state.vipInfo || JSON.stringify(this.state.vipInfo) === '{}')) {
            message('會員續費訂單必須登入會員')
            return false
        }
        if (this.state.octozz && this.state.octozz === 'Y19' &&
            (!this.state.vipInfo || JSON.stringify(this.state.vipInfo) === '{}')) {
            message('換卡訂單必須登入會員')
            return false
        }
        if (this.state.goodsList.find(item => item.barcode === '665') &&
            ((!this.state.vipInfo || JSON.stringify(this.state.vipInfo) === '{}') && !this.state.tempVip)) {
            message('訂單含有優惠集商品必須登入會員');    //订单含有优惠集商品 必须登录会员
            return false;
        }
        guidList = this.state.goodsList.map(item => {
            qty += item.qty;
            return item.guid;
        });
        if (this.state.isDc === true) {
            //let expressNumber = await this.getBill(this.state.flow_no);
            const fun = (_salesMemo) => {
                let _y = this.state.dcData.date.substr(6, 4);
                let _m = this.state.dcData.date.substr(3, 2);
                let _d = this.state.dcData.date.substr(0, 2);
                const dcReq = {
                    command_id: "REFRESHDELIVERYINFO",
                    operators: this.props.operators && this.props.operators.gh, //操作员号
                    flow_no: this.state.flow_no,
                    mkt: this.props.initialState.mkt,
                    syjh: this.props.initialState.syjh, //终端号
                    logisticsMode: 5,
                    receiverDistrict: this.state.dcData.receiverDistrict,
                    receiverStreet: this.state.dcData.receiverStreet,
                    deliveryStartTime: this.state.dcData.deliveryStartTime,
                    deliveryEndTime: this.state.dcData.deliveryEndTime,
                    invoiceTitle: this.state.dcData.invoiceTitle,
                    receiverName: this.state.dcData.customName,   // 收货人姓名
                    receiverMobile: this.state.dcData.telephone, // 收货人手机
                    receiverPhone: this.state.dcData.telephone,	// 收货人电话
                    receiverAddress: this.state.dcData.address, // 收货人地址
                    deliveryTime: this.props.initialState.data.syspara.find(v => v.code === 'JYMS') && this.props.initialState.data.syspara.find(v => v.code === 'JYMS').paravalue * 1 > 0 ? this.state.dcData.date : _y + "-" + _m + "-" + _d,	// 送货时间
                    receiverStandbyPhone: this.state.dcData.otherTelephone,	// 其它联系人电话
                    outLocation: this.state.dcData.locationOut,	// 出库位置
                    reserveLocation: this.state.dcData.reserveLocation,	// 服务地点
                    expressNumber: _salesMemo
                };
                console.log("+++++++ REFRESHDELIVERYINFO: ", this.state, dcReq);
                return this.props.actions.refreshDelivery(dcReq).then((res) => {
                    // console.log('DC送+++: ', res);
                    this.submitCalculate({
                        qty: qty,
                        calcMode: '0',
                        guidList: guidList,
                    })
                })
            };
            if (this.state.salesMemo) {
                fun(this.state.salesMemo);
            } else {
                SaleMemo.open({
                    data: {
                        isSd: false,
                        salesMemo: this.state.salesMemo
                    },
                    callback: (_salesMemo) => {
                        this.setState({
                            salesMemo: _salesMemo
                        }, () => fun(_salesMemo));
                    }
                })
            }
            return false;
        }
        this.submitCalculate({
            qty: qty,
            calcMode: '0',
            guidList: guidList,
        })

    }

    cancel = () => {
        if (this.state.goodsList.length > 0) {
            message(intl.get("INFO_CANNOTBACK"));  //'有商品不允许返回'
            return false;
        }
        this.props.actions.init();
        this.props.history.push('/home');
    }

    //从扫描队列获取单据
    pullScanList = (flowNo) => {
        return this.props.actions.getBillDetail({
            shopCode: this.props.initialState.mkt,
            terminalNo: this.props.initialState.syjh,
            terminalOperator: this.props.operators && this.props.operators.gh,
            flowNo,
        }).then(res => {
            if (res) {
                res.goodslist = res.goodlist;
                res.zddsctotal = res.totaldsc;
                res.zdsjtotal = res.total;
                if (res.order.consumersData) {
                    this.setState({
                        vipInfo: res.order.consumersData
                    })
                } else if (res.viptype == '02') {
                    let consumersData = {
                        memberId: res.vipid
                    }
                    this.setState({
                        vipInfo: consumersData
                    })
                }
                if (res.staffCardNo) {
                    const { staffCardNo, staffType, staffNo } = res;
                    this.setState({
                        staffcard: staffCardNo ? { cardNo: staffCardNo, staffNo, cardType: staffType } : ''
                    })
                } else {
                    this.setState({
                        staffcard: ''
                    })
                }
                this.setState({
                    tempZzk: res.tempZzk,
                    tempZzr: res.tempZzr,
                    flow_no: flowNo
                })
                this.replaceGoodsList(res);
                return res;
            }
        })
    }

    //重新获取整单
    repullSale = () => {
        return this.props.actions.getBillDetail({
            shopCode: this.props.initialState.mkt,
            terminalNo: this.props.initialState.syjh,
            terminalOperator: this.props.operators && this.props.operators.gh,
            flowNo: this.state.flow_no,
        }).then(res => {
            if (res) {
                res.goodslist = res.goodlist;
                res.zddsctotal = res.totaldsc;
                res.zdsjtotal = res.total;
                if (res.order.consumersData) {
                    this.setState({
                        vipInfo: res.order.consumersData
                    })
                } else if (res.viptype == '02') {
                    let consumersData = {
                        memberId: res.vipid
                    }
                    this.setState({
                        vipInfo: consumersData
                    })
                }
                // if(res.viptype == '02' && !!res.consumersData){
                //     let consumersData = {
                //         memberId: res.vipid
                //     }
                //     this.setState({
                //         vipInfo: consumersData
                //     })
                // }else{
                //     this.setState({
                //         vipInfo: {}
                //     })
                // }
                if (res.staffCardNo) {
                    const { staffCardNo, staffType, staffNo } = res;
                    this.setState({
                        staffcard: staffCardNo ? { cardNo: staffCardNo, staffNo, cardType: staffType } : ''
                    })
                } else {
                    this.setState({
                        staffcard: ''
                    })
                }
                this.setState({
                    tempZzk: res.tempZzk,
                    tempZzr: res.tempZzr
                })
                this.replaceGoodsList(res);
                return res;
            }
        })
    }

    //是否切换英文单
    onSwitchEng = () => {
        this.setState({
            switchEng: !this.state.switchEng
        })
    }

    /**
     * 重印窗口开关
     * @param symbol A(attached):副单 T(tail):尾款
     */
    onOffPrint = (symbol) => {
        if (this.state.goodsList.length !== 0) {
            let msg = symbol === 'A' ? '副单' : '重印';
            message(intl.get("INFO_PRINTTIP", { info: msg }));//
            return;
        }
        this.setState({
            PrintModal: !this.state.PrintModal,
            modalType: symbol === 'A',
            tail: symbol === 'T',
        });
    }

    //全日通
    oneDayPassport = (params) => {
        if (!params) {
            console.log(this.state.vipInfo);

            if ((!this.state.vipInfo || JSON.stringify(this.state.vipInfo) === '{}') && !this.state.tempVip) {
                message(intl.get("ONEDAYPASSPORT_VIP"))   //'全日通使用必须先登录会员'
                return false;
            }
        }
        if (params && params !== 'cancel') {
            this.props.actions.addOneDayPassport({
                mkt: this.props.initialState.mkt,
                syjh: this.props.initialState.syjh,
                flow_no: this.state.flow_no,
                operators: this.props.operators && this.props.operators.gh,
                ...params
            }).then(res => {
                //console.log(res);
                if (res) {
                    this.addGoodsCallback(res);
                    this.repullSale();
                }
            })
        }
        this.setState({
            oneDayPassportModal: !this.state.oneDayPassportModal
        })
    }

    //查货查价
    SelectGoodsPrice = (type) => {
        if (type == 'goodsModal' && type !== true && (this.props.humanIntervention || this.props.initialState.online == '0')) {
            message("脫機狀態不支持此功能");
            return false
        }
        this.setState({ [type]: !this.state[type] })
    }

    //游戏币活动查询
    queryGameCoin = (params) => {
        if (params) {
            this.props.actions.queryGameCoin({
                operators: this.props.operators && this.props.operators.gh,
                flow_no: this.state.flow_no,
                mkt: this.props.initialState.mkt,
                syjh: this.props.initialState.syjh,
                manaUnit: this.props.initialState.jygs,
                channel: 'javapos',
                saleDate: moment().format('YYYY-MM-DD HH:mm:ss'),
                etype: '90240',
            }).then(res => {
                if (res) {
                    this.setState({
                        coinEvents: res.events,
                        gameCoinModal: true
                    })
                }
            })
        } else {
            this.setState({
                gameCoinModal: false
            })
        }
    }

    //呼叫信息
    callConfirm = () => {
        CallInfo.open({
            callInfo: this.props.initialState.data.poscallinfo,
            callback: this.callHandle
        })
    }

    callHandle = (callValue) => {
        let callInfo = this.props.initialState.data.poscallinfo
        let text = callInfo.find(v => v.code === callValue).text
        let req = {
            code: callValue,
            text: text,
            caller: this.props.operators && this.props.operators.gh,
            mkt: this.props.initialState.mkt,
            erpCode: this.props.initialState.erpCode,
            command_id: 'RECEIVECALLINFO',
            syjh: this.props.initialState.syjh,
        }
        return this.props.actions.callSubmit(req).then(res => {
            if (res) {
                message('呼叫成功');
                return true
            } else {
                return false;
            }
        })
    }

    //打开钱箱
    openCashbox = () => {
        let openCashboxFn = (cardno) => {
            let ejoural = `Cashbox Open ${moment().format('HH:mm:ss')}`;
            if (cardno) {
                ejoural += ` AUTH. STAFF ${cardno}`
            }
            if (this.state.goodsList.length <= 0) {
                ejoural += `\r\n**************************************`
            }
            window.openCashbox();
            this.props.setState({ drawer: '0' });
            window.Log(ejoural, '1')
            // window.getCashboxStatus();
        }
        if (this.props.posrole.cashboxqx !== 'Y') {
            React.accredit(posrole => {
                if (posrole.cashboxqx === 'Y') {
                    openCashboxFn(posrole.cardno);
                } else {
                    message(intl.get("INFO_AUTHFAIL"))   //'授权失败：无此权限'
                }
            }/*, null, { flowNo: this.state.flow_no }*/)
            return
        }
        openCashboxFn();
    }

    //会员登录
    loginVip = (callback) => {
        if (this.state.easyPay) {
            message('预销售訂單無法修改會員');
            return false;
        }
        if (this.state.octozz && this.state.octozz === 'Y10' && JSON.stringify(this.state.vipInfo) !== '{}') {
            message('會員入會訂單無法修改會員');
            return false;
        }
        if (this.state.octozz && this.state.octozz === 'Y11' && JSON.stringify(this.state.vipInfo) !== '{}') {
            message('會員續費訂單無法修改會員');
            return false;
        }
        /*if (this.state.octozz && this.state.octozz === 'Y19' && JSON.stringify(this.state.vipInfo) !== '{}') {
            message('換卡訂單無法修改會員');
            return false;
        }*/
        if (this.state.octozz && this.state.octozz === 'Y12' && this.state.goodsList.length !== 0) {
            message('印花換購訂單無法修改會員');
            return false
        }
        this.loginVipModal();
    }

    //会员登录弹框
    loginVipModal = (createSale, addGoods, djlb) => {
        const com = (data) => {
            if (createSale) {
                /*return callback().then(res => {
                    if(res) {
                        this.addVip(data, {idType: '1'});
                    }
                    RechargeKeypad.close();
                })*/
                createSale().then(res => {
                    this.addVip(data, { idType: '1' }, (params) => addGoods({ ...params, flow_no: res.flow_no }), res.flow_no, djlb);
                })
                RechargeKeypad.close();
            } else {
                this.addVip(data, { idType: '1' });
                RechargeKeypad.close();
            }
        }
        RechargeKeypad.open({
            title: intl.get("INFO_MEMBERLOGIN"),
            // tabs: [{
            //     name: intl.get("CARD_NUMBER"),  //卡号
            //     value: '1'
            // }, {
            //     name: intl.get("PHONE_NUMBER"), //手机号
            //     value: '2'
            // }],
            placeholder: '',
            keyControl: this.state.keyControl,
            callback: (value, idType) => {
                if (createSale) {
                    /*return callback().then(res => {
                        if(res) {
                            return this.addVip(value, {idType: idType});
                        }
                    })*/
                    createSale().then(res => {
                        this.addVip(value, { idType: idType }, (params) => addGoods({ ...params, flow_no: res.flow_no }), res.flow_no, djlb);
                    })
                } else {
                    this.addVip(value, { idType: idType });
                }
            },
            event: {
                //tabValue: '1',
                chooseEvent: () => {
                    EventEmitter.on('Com', com)
                },
                cancelEvent: () => {
                    EventEmitter.off('Com', com)
                }
            }
        })
    }

    //授权会员
    tempVipLogin = () => {
        if (this.state.tempVip || JSON.stringify(this.state.vipInfo) !== '{}') {
            message('已登錄會員,不可使用該功能!')
            return false;
        }
        if (this.state.staffcard) {
            message('已登錄員工購物,不可使用該功能!')
            return false;
        }
        let tempVipAction = () => this.props.actions.tempVip({
            operators: this.props.operators && this.props.operators.gh,
            mkt: this.props.initialState.mkt,
            flow_no: this.state.flow_no,
            syjh: this.props.initialState.syjh,
        }).then(res => {
            if (res) {
                this.setState({
                    tempVip: true,
                })
                if (res.goodslist && res.goodslist.length > 0) {
                    this.replaceGoodsList(res);
                    this.handleEjoural(res.goodslist, 12)
                }
            }
        })
        if (this.props.posrole.privgj === 'Y') {
            tempVipAction();
            return true;
        }
        React.accredit(posrole => {
            if (posrole.privgj === 'Y') {
                tempVipAction();
            } else {
                message(intl.get("INFO_AUTHFAIL"))   //'授权失败：无此权限'
            }
        }, null, { flowNo: this.state.flow_no })
    }

    //会员入会 @type 1:普通会员入会 2:app会员入会
    applyVip = (type) => {
        if (this.state.octozz && this.state.octozz === 'Y10' && this.state.goodsList.length > 0) {
            //message(intl.get('INFO_ADDVALUENODUP')); // 八达通增值商品不可重复添加
            message('會員申請不可重複添加'); // 会员申请不可重复添加
            return false;
        }
        if (this.props.home.humanIntervention || this.props.initialState.online == 0) {
            message('脫機狀態下無法使用此功能！');
            return false;
        }
        if (this.state.octozz && this.state.octozz === 'Y11') {
            message('會員續費單據不能進行入會操作'); // 会员续费单据不能进行入会操作
            return false;
        }
        if (this.state.octozz && this.state.octozz === 'Y3') {
            message('八達通增值單據不能進行入會操作'); // 八达通增值单据不能进行入会操作
            return false;
        }
        if (this.state.octozz && this.state.octozz === 'Y19') {
            message('换卡單據不能進行入會操作');
            return false;
        }
        if (this.state.octozz && this.state.octozz === 'Y12') {
            message('印花換購單據不能進行入會操作'); // 印花换购单据不能进行入会操作
            return false;
        }
        let addValueDjlb = 'Y10',
            //price,
            memberId,
            barcode;
        let applyVipFunc = () => {
            this.createSaleReq(addValueDjlb).then(res => {
                if (res.flag) {
                    const { mkt, syjh, amcNO } = this.props.initialState;
                    this.props.actions.applyVip({
                        operators: this.props.operators && this.props.operators.gh,
                        flow_no: res.res.flow_no,
                        mkt: mkt,
                        syjh: syjh,
                        //price: price,
                        memberId: memberId,
                        joinCusType: type,
                        barcode: barcode,
                        memberActionSno: mkt.substring(mkt.length - 2) + syjh + amcNO
                    }).then(response => {
                        if (response) {
                            if (this.state.goodsList.length > 0) {
                                this.saveBill(() => {
                                    this.addGoodsCallback(response);
                                    this.setState({
                                        flow_no: res.res.flow_no,
                                        octozz: addValueDjlb,
                                        addGoodsTime: moment().format('DD/MM/YYYY HH:mm:ss'),
                                        vipInfo: {
                                            memberId: response.memberId || memberId
                                        }
                                    })
                                });
                            } else {
                                this.initState();
                                this.addGoodsCallback(response);
                                this.setState({
                                    flow_no: res.res.flow_no,
                                    octozz: addValueDjlb,
                                    addGoodsTime: moment().format('DD/MM/YYYY HH:mm:ss'),
                                    vipInfo: {
                                        memberId: response.memberId || memberId
                                    }
                                })
                            };
                        }
                    })
                }
            })
        }
        if (type === '1') {
            //barcode = '694';
            const com = (data) => {
                memberId = data;
                applyVipFunc();
                RechargeKeypad.close();
            }
            RechargeKeypad.open({
                title: '新申請會員',    //"新申请会员",
                placeholder: '請輸入會員卡號或刷會員卡',  //"请输入会员卡号或刷会员卡",
                keyControl: this.state.keyControl,
                callback: (num) => {
                    memberId = num;
                    applyVipFunc();
                },
                event: {
                    chooseEvent: () => {
                        EventEmitter.on('Com', com)
                    },
                    cancelEvent: () => {
                        EventEmitter.off('Com', com)
                    }
                }
            })
            return false;
        }
        if (type === '2') {
            EasyPay.open({
                title: 'APP入會',
                onOk: (qrcode) => {
                    console.log(qrcode.length);
                    qrcode = qrcode.trim();
                    memberId = qrcode.substring(0, 16);
                    barcode = qrcode.substring(qrcode.length - 7)
                    applyVipFunc();
                }
            })
        }
        /*RechargeKeypad.open({
            title: '會費金額',    //"新申请会员",
            placeholder: '請輸入會費金額',  //"请输入会费金额",
            errMessage: '會費金額必須大於0',  //"续费金额必须大于0",
            rule: (num) => {
                if (num * 1 > 0) {
                    return true;
                }
                return false;
            },
            callback: (num) => {
                price = num;
                if (type === '1') {
                    barcode = '694';
                    const com = (data) => {
                        memberId = data;
                        applyVipFunc();
                        RechargeKeypad.close();
                    }
                    RechargeKeypad.open({
                        title: '新申請會員',    //"新申请会员",
                        placeholder: '請輸入會員卡號或刷會員卡',  //"请输入会员卡号或刷会员卡",
                        callback: (num) => {
                            memberId = num;
                            applyVipFunc();
                        },
                        event: {
                            chooseEvent: () => {
                                EventEmitter.on('Com', com)
                            },
                            cancelEvent: () => {
                                EventEmitter.off('Com', com)
                            }
                        }
                    })
                    return false;
                }
                if (type === '2') {
                    EasyPay.open({
                        title: 'APP入會',
                        onOk: (qrcode) => {
                            console.log(qrcode.length);
                            qrcode = qrcode.trim();
                            memberId = qrcode.substring(0, 16);
                            barcode = qrcode.substring(qrcode.length - 7)
                            applyVipFunc();
                        }
                    })
                }
            }
        })*/
    }

    //換卡
    activateVip = () => {
        const { octozz } = this.state;
        const { JHSP } = this.props.syspara;
        if (!(JHSP && JHSP.length > 0)) {
            message('換卡系統參數錯誤');
            return false;
        }
        if (octozz && octozz === 'Y19' && this.state.goodsList.length > 0) {
            message('換卡不可重複添加'); // 会员申请不可重复添加
            return false;
        }
        if (octozz && (octozz === 'Y11' || octozz === 'Y3' || octozz === 'Y12' || octozz === 'Y10')) {
            message('當前單據無法使用此功能');
            return false;
        }
        let addValueDjlb = 'Y19';
        const createSaleAction = () => {
            return this.createSaleReq(addValueDjlb).then(res => {
                if (res.flag) {
                    return res.res;
                } else {
                    message('換卡訂單初始化失敗');
                }
            })
        }
        const addGoodsAction = (params) => {
            const { vipInfo, flow_no, vipNo } = params;
            let barcode, price;
            JHSP.forEach(item => {
                if (item.split(',') && item.split(',')[0] == vipNo[0]) {
                    barcode = item.split(',')[1];
                    price = item.split(',')[2];
                }
            });
            if (!barcode || !price) {
                message('換卡系統參數錯誤，找不到對應的商品');
                return false;
            }
            const addGoodsRes = this.addGoods(barcode, price, flow_no, false);
            if (addGoodsRes) {
                return addGoodsRes.then(res => {
                    if (res) {
                        if (this.state.goodsList.length > 0) {
                            return Promise.resolve(this.saveBill(() => {
                                this.addGoodsCallback(res);
                                this.setState({
                                    flow_no: flow_no,
                                    octozz: addValueDjlb,
                                    vipInfo
                                })
                            }))
                        } else {
                            this.initState();
                            this.addGoodsCallback(res);
                            this.setState({
                                flow_no: flow_no,
                                octozz: addValueDjlb,
                                vipInfo
                            })
                        }
                        return true
                    }
                })
            }
        }
        if (this.state.vipInfo && this.state.vipInfo.memberId) {
            const memberId = this.state.vipInfo && this.state.vipInfo.memberId;
            return createSaleAction().then(res => {
                if (res) {
                    this.addVip(memberId, { idType: '1' }, (params) => addGoodsAction({ ...params, flow_no: res.flow_no }), res.flow_no, addValueDjlb);
                }
            })
        } else {
            this.loginVipModal(createSaleAction, addGoodsAction, addValueDjlb)
        }
    }

    stampChange = () => {
        if (this.state.goodsList.length !== 0 && this.state.octozz !== 'Y12') {
            message('該單據有商品,請先清單或結算!')
        } else {
            this.setState({
                stampChangeVisible: true
            })
        }
    }

    stampChangeVisibleCancel = () => {
        if (this.state.octozz !== 'Y12') {
            this.initState()
            this.createSale()
        }
        this.setState({
            stampChangeVisible: !this.state.stampChangeVisible,
            stampGoodsInfo: {},
            stampFlowNo: '',
            stampGuid: '',
            stampGoodsFlag: false,
            stampBarcode: ''
        })
    }


    //优惠集
    addVipCoupon = () => {
        /*if(this.state.octozz && this.state.octozz === 'Y10') {
            if(this.state.goodsList.find(item => item.barcode === '665')) {
                message('優惠集不可重複添加');    //优惠集不可重复添加
                return false;
            }
            this.addGoods('665', '0');
        } else {
            message('非入會商品不可添加優惠集');  //非入会商品不可添加优惠集
        }*/
        if (this.props.home.humanIntervention || this.props.initialState.online == 0) {
            message('脫機狀態下無法使用此功能！');
            return false;
        }
        if ((!this.state.vipInfo || JSON.stringify(this.state.vipInfo) === '{}') && !this.state.tempVip) {
            message('添加優惠集必須先登入會員');  //添加优惠集必须先登录会员
            return false;
        }
        this.addGoods('665', '0');
    }

    //会员续费 @param传入的会员卡号
    rechargeVip = (param) => {
        if (this.state.octozz && this.state.octozz === 'Y11' && this.state.goodsList.length > 0) {
            message('會員續費不可重複添加'); // 会员续费不可重复添加
            return false;
        }
        if (this.props.home.humanIntervention || this.props.initialState.online == 0) {
            message('脫機狀態下無法使用此功能！');
            return false;
        }
        if (this.state.octozz && this.state.octozz === 'Y10') {
            message('會員入會單據不能進行續費操作'); // 会员入会单据不能进行续费操作
            return false;
        }
        if (this.state.octozz && this.state.octozz === 'Y3') {
            message('八達通增值單據不能進行續費操作'); // 八达通增值单据不能进行续费操作
            return false;
        }
        if (this.state.octozz && this.state.octozz === 'Y12') {
            message('印花換購單據不能進行續費操作'); // 印花换购单据不能进行续费操作
            return false;
        }
        if (this.state.octozz && this.state.octozz === 'Y19') {
            message('換卡單據不能進行續費操作');
            return false;
        }
        let addValueDjlb = 'Y11';
        const createSaleAction = () => {
            return this.createSaleReq(addValueDjlb).then(res => {
                if (res.flag) {
                    return res.res;
                } else {
                    message('會員續費訂單初始化失敗');
                }
            })
        }
        const addGoodsAction = (params) => {
            console.log(params);
            const { vipInfo, flow_no, barcode, isJFXH, price } = params;
            const addGoodsRes = this.addGoods(barcode, price, flow_no, false);
            if (addGoodsRes) {
                return addGoodsRes.then(res => {
                    if (res) {
                        if (this.state.goodsList.length > 0) {
                            return Promise.resolve(this.saveBill(() => {
                                this.addGoodsCallback(res);
                                this.setState({
                                    flow_no: flow_no,
                                    octozz: addValueDjlb,
                                    vipInfo,
                                    isJFXH: isJFXH
                                })
                            }))
                        } else {
                            this.initState();
                            this.addGoodsCallback(res);
                            this.setState({
                                flow_no: flow_no,
                                octozz: addValueDjlb,
                                vipInfo,
                                isJFXH: isJFXH
                            })
                        }
                        return true
                    }
                })
            }
        }
        if ((this.state.vipInfo && this.state.vipInfo.memberId) || param) {
            const memberId = (this.state.vipInfo && this.state.vipInfo.memberId) || param;
            return createSaleAction().then(res => {
                if (res) {
                    this.addVip(memberId, { idType: '1' }, (params) => addGoodsAction({ ...params, flow_no: res.flow_no }), res.flow_no, addValueDjlb);
                }
            })
        } else {
            this.loginVipModal(createSaleAction, addGoodsAction, addValueDjlb)
        }
        /*RechargeKeypad.open({
            title: '會員續費',    //"会员续费",
            placeholder: '請輸入續費金額',  //"请输入续费金额",
            errMessage: '續費金額必須大於0',  //"续费金额必须大于0",
            rule: (num) => {
                if (num * 1 > 0) {
                    return true;
                }
                return false;
            },
            callback: (num) => {
                let addValueDjlb = 'Y11';
                const createSaleAction = () => {
                    return this.createSaleReq(addValueDjlb).then(res => {
                        if (res.flag) {
                            return res.res;
                        } else {
                            message('會員續費訂單初始化失敗');
                        }
                    })
                }
                const addGoodsAction = (vipInfo, flow_no) => {
                    const addGoodsRes = this.addGoods('6014898', num, flow_no, false);
                    if (addGoodsRes) {
                        return addGoodsRes.then(res => {
                            if (res) {
                                if (this.state.goodsList.length > 0) {
                                    return Promise.resolve(this.saveBill(() => {
                                        this.addGoodsCallback(res);
                                        this.setState({
                                            flow_no: flow_no,
                                            octozz: addValueDjlb,
                                            vipInfo
                                        })
                                    }))
                                } else {
                                    this.initState();
                                    this.addGoodsCallback(res);
                                    this.setState({
                                        flow_no: flow_no,
                                        octozz: addValueDjlb,
                                        vipInfo
                                    })
                                }
                                return true
                            }
                        })
                    }
                }
                if (this.state.vipInfo && this.state.vipInfo.memberId) {
                    const memberId = this.state.vipInfo.memberId;
                    return createSaleAction().then(res => {
                        if (res) {
                            this.addVip(memberId, { idType: '1' }, (vipInfo) => addGoodsAction(vipInfo, res.flow_no), res.flow_no);
                        }
                    })
                } else {
                    this.loginVipModal(createSaleAction, addGoodsAction)
                }
                /!*let loginVipAction = () => {
                    return this.createSaleReq(addValueDjlb).then(res => {
                        if(res.flag) {
                            const addGoodsRes = this.addGoods('6014898', num, res.res.flow_no, false);
                            if(addGoodsRes) {
                                return addGoodsRes.then(res => {
                                    if (res) {
                                        if (this.state.goodsList.length > 0) {
                                            return Promise.resolve(this.saveBill(() => {
                                                this.addGoodsCallback(res);
                                                this.setState({
                                                    flow_no: res.flow_no,
                                                    octozz: addValueDjlb
                                                })
                                            }))
                                        } else {
                                            this.initState();
                                            this.addGoodsCallback(res);
                                            this.setState({
                                                flow_no: res.flow_no,
                                                octozz: addValueDjlb
                                            })
                                        }
                                        return true
                                    }
                                })
                            }
                            return false
                        }
                    })
                }
                if(this.state.vipInfo && this.state.vipInfo.memberId) {
                    const memberId = this.state.vipInfo.memberId;
                    return loginVipAction().then(res => {
                        if(res) {
                            return this.addVip(memberId, {idType: '1'});
                        }
                    })
                } else {
                    this.loginVipModal(() => {
                        return loginVipAction();
                    })
                }*!/
                return false;
            }
        })*/
    }

    // 印花换购修改单据类型
    changeStampOrder = (djlb) => {
        return this.props.actions.changeStampOrder({
            operators: this.props.operators && this.props.operators.gh,
            mkt: this.props.initialState.mkt,
            flow_no: this.state.flow_no,
            syjh: this.props.initialState.syjh,
            djlb
        })
    }

    //查询印花换购信息
    getStampGoods = (barcode) => {
        let getStampGoodsDjlb = 'Y12'
        let _this = this
        if (barcode) {
            this.changeStampOrder(getStampGoodsDjlb).then(res => {
                if (res) {
                    if (res.consumersData && res.consumersData.memberId) {
                        this.setState({
                            vipInfo: res.consumersData
                        })
                    }
                    let req = {
                        //code: barcode.trim(),
                        barcode: barcode.trim(),
                        jygs: _this.props.initialState.jygs,
                        //orgCode: "1",
                        //searchType: "1",
                        mkt: _this.props.initialState.mkt,
                        //terminalNo: "00200001",
                        flow_no: res.flow_no || this.state.flow_no,
                        yyyh: "9527",
                        operators: _this.props.operators && _this.props.operators.gh,
                        syjh: _this.props.initialState.syjh,
                        //gz: "1",
                        flag: "0",
                        calcMode: '0',
                        //consumers_id: this.state.vipInfo.vipid,
                        //consumers_type: this.state.vipInfo.viptype,
                        //consumers_trgs: this.state.vipInfo.trgs,
                        //consumers_cardno: this.state.vipInfo.vipno,
                        precision: '2',
                        entid: _this.props.initialState.entid,
                        isdzcm: 'N',
                        search: _this.props.initialState.data.syjmain[0] && _this.props.initialState.data.syjmain[0].issryyy === 'Y' ? '2' : '3'
                    }
                    _this.props.actions.addGoods(req).then(data => {
                        if (data) {
                            if (this.state.stampBarcode !== '') {
                                this.props.actions.delGoods({
                                    guid: this.state.stampGuid,
                                    flow_no: res.flow_no || this.state.flow_no,
                                    barcode: this.state.stampBarcode,
                                    //sqkh: '0015',
                                    operators: this.props.operators && this.props.operators.gh,
                                    mkt: this.props.initialState.mkt,
                                    syjh: this.props.initialState.syjh,
                                }).then(result => {
                                    if (result) {
                                        _this.props.actions.getStampGoods({
                                            operators: this.props.operators && this.props.operators.gh,
                                            flow_no: res.flow_no || this.state.flow_no,
                                            mkt: this.props.initialState.mkt,
                                            syjh: this.props.initialState.syjh,
                                            guid: data.goodslist[0].guid
                                        }).then(response => {
                                            if (response) {
                                                this.setState({
                                                    stampGoodsInfo: Object.assign({ fname: data.goodslist[0].fname }, response),
                                                    stampGoodsFlag: true,
                                                })
                                                // if( Object.keys(this.state.vipInfo).length !== 0 && response.allowElectronicStampFlag === 'N'){
                                                //     message('該商品不允許電子印花換購')
                                                // }
                                                // if(Object.keys(this.state.vipInfo).length == 0 && response.allowElectronicStampFlag === 'Y'){
                                                //     message(`可使用電子印花換購, 優惠價$:${response.memberAmount},所需印花數:${response.memberStamp}`)
                                                // }
                                            }
                                        })
                                    }
                                })
                            } else {
                                _this.props.actions.getStampGoods({
                                    operators: this.props.operators && this.props.operators.gh,
                                    flow_no: res.flow_no || this.state.flow_no,
                                    mkt: this.props.initialState.mkt,
                                    syjh: this.props.initialState.syjh,
                                    guid: data.goodslist[0].guid
                                }).then(response => {
                                    if (response) {
                                        this.setState({
                                            stampGoodsInfo: Object.assign({ fname: data.goodslist[0].fname }, response),
                                            stampGoodsFlag: true,
                                        })
                                        // if( Object.keys(this.state.vipInfo).length !== 0 && response.allowElectronicStampFlag === 'N'){
                                        //     message('該商品不允許電子印花換購')
                                        // }
                                        // if(Object.keys(this.state.vipInfo).length == 0 && response.allowElectronicStampFlag === 'Y'){
                                        //     message(`可使用電子印花換購, 優惠價$:${response.memberAmount},所需印花數:${response.memberStamp}`)
                                        // }
                                    }
                                })
                            }
                            this.setState({
                                stampFlowNo: res.flow_no || this.state.flow_no,
                                stampGuid: data.goodslist[0].guid,
                                stampBarcode: data.goodslist[0].goodsno
                            })
                        }
                    })

                }
            })
        }
    }

    //提交印花换购
    handleStampGoods = (params, vipFlag, stampNumber) => {
        const { stampFlowNo, stampGuid, totalData } = this.state
        let _this = this
        let req = Object.assign({
            operators: this.props.operators && this.props.operators.gh,
            flow_no: stampFlowNo,
            mkt: this.props.initialState.mkt,
            syjh: this.props.initialState.syjh,
            guid: stampGuid,
        }, params)
        this.props.actions.handleStampGoods(req).then(res => {
            if (res) {
                if (!vipFlag) {
                    //实物印花确认
                    Modal.warning({
                        title: `須回收${stampNumber}個印花`,
                        okText: '確定',
                        onOk() {
                            _this.handleEjoural(res.good, 0);
                            _this.state.goodsList.push(res.good)
                            totalData.num += res.good.qty;
                            totalData.price = res.zdyftotal;
                            totalData.discounts = res.zddsctotal;
                            totalData.totalPrice = res.zdsjtotal;
                            _this.setState({
                                goodslist: _this.state.goodsList,
                                totalData,
                                octozz: 'Y12',
                                flow_no: res.flow_no,
                                stampChangeVisible: false,
                                stampGoodsInfo: {},//印花换购商品信息
                                stampGoodsFlag: false, //印花换购Flag   
                                stampFlowNo: '',
                                stampGuid: '',
                                stampBarcode: ''
                            })
                            _this.refs.StampChange.clearData()
                        },
                    })
                } else {
                    _this.handleEjoural(res.good, 0);
                    _this.state.goodsList.push(res.good)
                    totalData.num += res.good.qty;
                    totalData.price = res.zdyftotal;
                    totalData.discounts = res.zddsctotal;
                    totalData.totalPrice = res.zdsjtotal;
                    message(`已使用${stampNumber}個電子印花`)
                    _this.setState({
                        goodslist: _this.state.goodsList,
                        octozz: 'Y12',
                        totalData,
                        flow_no: res.flow_no,
                        stampChangeVisible: false,
                        stampGoodsInfo: {},//印花换购商品信息
                        stampGoodsFlag: false, //印花换购Flag
                        stampFlowNo: '',
                        stampGuid: '',
                        stampBarcode: ''
                    })
                    _this.refs.StampChange.clearData()
                }
            }
        })
    }

    toggleMoreMenu = () => {
        this.setState({
            showMoreMenu: !this.state.showMoreMenu
        })
    }

    setMenuLength = length => {
        this.setState({
            menuLength: length
        })
    }

    render() {
        console.log(this.props)
        const { octozz } = this.state;
        const { djlb } = this.props.state;
        const operatorData = {
            mkt: this.props.initialState.mkt,
            mktName: this.props.initialState.data.mktinfo && this.props.initialState.data.mktinfo.mktname,
            shopForm: this.props.initialState.data.mktinfo && this.props.initialState.data.mktinfo.shopForm,
            syjh: this.props.initialState.syjh,
            gz: '',
            ip: this.props.initialState.ipAdress,
            ...this.props.operators,
        }
        let props = {
            online: this.props.humanIntervention ? "0" : this.props.initialState.online,
            uploadData: this.props.initialState.uploadData,
        }
        let billList;
        switch (djlb) {
            case 'Y7':
                billList = this.props.initialState.bill.practice;
                break;
            case 'Y1':
                billList = this.props.initialState.bill.coupon;
                break;
            default:
                billList = this.props.initialState.bill.presale;
                break;
        }
        posNewsNotify();
        return (
            <div className={this.state.showLeftMenu === 'right' ? "presale presale_showLeft" : "presale"}>
                <PreSaleTop
                    fphm={this.props.initialState.fphm}
                    initialState={this.props.initialState}
                    flow_no={this.state.flow_no}
                    octozz={this.state.octozz}
                    addVip={this.addVip}
                    inputDisable={this.props.initialState.drawer !== '4'}
                    loginVip={this.loginVip}
                    inputCode={this.inputCode}
                    inputStaffCode={this.inputStaffCode}
                    vipInfo={this.state.vipInfo || {}}
                    staffcard={this.state.staffcard || ''}
                    tempVip={this.state.tempVip || false}
                    djlb={djlb}
                    switchEng={this.state.switchEng}
                    onSwitchEng={this.onSwitchEng}
                    operator={operatorData}
                    addGoodsVerify={this.addGoodsVerify}
                    addGoods={this.addGoods}
                    handleLeftMenu={this.handleLeftMenu}
                    repullSale={this.repullSale}
                    showLeftMenu={this.state.showLeftMenu}
                    {...props} />
                <div className="presale_main">
                    <PreSaleLeft fphm={this.props.initialState.fphm}
                        flow_no={this.state.flow_no}
                        djlb={this.props.state.djlb}
                        octozz={this.state.octozz}
                        goodsList={this.state.goodsList}
                        pagination={this.state.pagination}
                        totalData={this.state.totalData}
                        chooseList={this.state.chooseGoodsList}
                        chooseModal={this.state.chooseGoodsModal}
                        disabled={octozz === 'Y3'}
                        onPageChange={this.tablePageChange}
                        addGoods={this.addGoods}
                        onGoodsChoose={this.chooseGoods}
                        editGoods={this.editGoods}
                        delGoods={this.delGoods}
                        onCancel={this.cancel}
                        onSubmit={this.submit}
                        onSwitchEng={this.onSwitchEng}
                        selectedGoods={this.state.selectedGoods}
                        handleEditGoods={this.handleEditGoods}
                        scanWindow={this.props.initialState.BrowserWindowID == 3}
                    />
                    {/**<div className={`presale_ri ${!this.state.showLeftMenu && this.state.keyControl ? 'presale_ri_hidden' : ''}`}>*/}
                    <div className="presale_ri">
                        {this.state.showLeftMenu === 'right' ?
                            <PreSaleRight
                                onRef={(ref) => { this.presaleRightRef = ref }}
                                inputCode={this.inputCode}
                                djlb={djlb}
                                octozz={this.state.octozz}
                                selfgoodstemplate={this.props.state.djlb === 'Y1' ? this.props.initialState.data.coupongoodsdetail : this.props.initialState.data.selfgoodstemplate}
                                addGoods={this.addGoods}
                                disabled={false}
                                goodsList={this.state.goodsList}
                                addGoodsVerify={this.addGoodsVerify} /> : null}
                        {this.state.keyControl && this.state.showLeftMenu === 'brands' ?
                            <OperateMenuKey
                                list={this.state.brandsData}
                                className="presale_menu presale_tag_key"
                                rowQty={Math.ceil(this.state.brandsData.length / 9)}
                                rowWidth={120}
                                totalQty={this.state.brandsData.length}
                                onExit={this.handleBrandsExit}
                                defaultKeys={this.commonKeys} /> : null}
                        {this.state.keyControl && this.state.showLeftMenu === 'kinds' ?
                            <OperateMenuKey
                                list={this.state.kindsData}
                                className="presale_menu presale_tag_key"
                                rowQty={Math.ceil(this.state.kindsData.length / 9)}
                                rowWidth={120}
                                totalQty={this.state.kindsData.length}
                                onExit={this.handleKindsExit}
                                defaultKeys={this.commonKeys} /> : null}
                        {/* {this.state.keyControl && this.state.showLeftMenu === 'menu'?
                            <OperateMenuKey 
                                billList={billList}
                                list={this.handleMenuKey(this.state.menuList)}
                                className="presale_menu presale_menu_key"
                                rowQty={Math.ceil(this.state.menuList.length/7)}
                                rowWidth={100}
                                totalQty={this.state.menuList.length}
                                onExit={() => this.handleLeftMenu(false)}
                                defaultKeys={this.commonKeys}/> : null} */}
                        <OperateMenu
                            showLeftMenu={this.state.showLeftMenu}
                            onRef={(ref) => { this.operateMenuRef = ref }}
                            keyMenuList={this.state.menuList}
                            defaultKeys={this.commonKeys}
                            onExit={() => this.handleLeftMenu(false)}
                            menuList={this.props.initialState.data.touchpostemplate}
                            menuFilter={this.menuFilter}
                            menuEvents={this.menuEvents}
                            billList={billList || []}
                            keyControl={this.state.keyControl}
                            getBillDetail={() => { this.getBillDetailFromFlowList() }}
                            initialState={this.props.initialState}
                            goodsList={this.state.goodsList}
                            selectedMenu={this.state.selectedMenu}
                            showMoreMenu={this.state.showMoreMenu}
                            toggleMoreMenu={this.toggleMoreMenu}
                            setMenuLength={(length) => this.setMenuLength(length)}
                            {...props} />
                    </div>
                    {this.state.editModalVisible ?
                        <EditGood visible={true}
                            flow_no={this.state.flow_no}
                            goodInfo={this.state.goodsList[this.state.editGoodsIndex] || {}}
                            posrole={this.props.posrole}
                            initialState={this.props.initialState}
                            syspara={this.props.syspara}
                            octozz={this.state.octozz}
                            keyControl={this.state.keyControl}
                            onOk={this.handleEditGoodsOk}
                            onCancel={this.handleEditGoods} /> : null}
                </div>
                {/*解挂*/}
                {this.state.billListModal ?
                    <SearchBill visible={this.state.billListModal}
                        billList={billList || []}
                        callback={this.loseBill}
                        updateFPHM={this.updateFPHM}
                        posrole={this.props.posrole}
                        getBillDetail={this.getBillDetail}
                        keyControl={this.state.keyControl} /> : null}
                {/*预销售*/}
                {this.state.easyPayModal ?
                    <EasyPay visible={this.state.easyPayModal}
                        onCancel={() => this.easyPay('0')}
                        fastPay={(qrcode) => this.easyPay('1', qrcode)} /> : null}
                {/*小票复制*/}
                {this.state.copyBillModal ? <CopyBill visible={true}
                    callback={this.copyBill} /> : null}
                {/*修改密码*/}
                {/* <ChangePassword visible={this.state.changePasswordModal}
                    callback={this.changePassword} /> */}
                {/*查询会员*/}
                {/* <SearchAMC visible={this.state.searchAMCModal}
                    defaultVip={this.state.vipInfo}
                    defaultVipCardNo={this.state.vipCardNo}
                    callback={this.searchAMC}
                    searchAMCJF={this.props.actions.searchAMCJF} /> */}
                {/*印花换购*/}
                {/* <StampChange visible={this.state.stampChangeVisible}
                    ref='StampChange'
                    handleCancel={this.stampChangeVisibleCancel}
                    getStampGoods={this.getStampGoods}
                    vipInfo={this.state.vipInfo || {}}
                    stampGoodsInfo={this.state.stampGoodsInfo}
                    handleStampGoods={this.handleStampGoods}
                    stampGoodsFlag={this.state.stampGoodsFlag} /> */}
                {/*除旧*/}
                {/* <ExceptOldModal
                    exceptOldModal={this.state.exceptOldModal}
                    expressNumber={this.state.salesMemo}
                    changeExceptOldValue={this.changeExceptOldValue}
                    closeExceptOldModal={this.closeExceptOldModal}
                    sdyncj={this.props.initialState.data.sdyncj}
                    terminalSno={this.state.terminalSno}
                    recordNo={this.state.recordNo}
                    delGoods={this.delGoods}
                    exceptOldGoodslist={this.state.exceptOldGoodslist}
                    goodsList={this.state.goodsList}
                    delBill={this.delBill}
                /> */}
                {/*重印 || 副单*/}
                {
                    this.state.PrintModal ?
                        <PrintAgain
                            visible={true}
                            version={"Sales"}
                            syspara={this.props.syspara}
                            ddlx={this.props.initialState.data.ddlx}
                            paymode={this.props.initialState.data.paymode}
                            mktinfo={this.props.initialState.data.mktinfo}
                            entid={this.props.initialState.entid}
                            jygs={this.props.initialState.jygs}
                            onCancel={this.onOffPrint}
                            modalType={this.state.modalType}
                            tail={this.state.tail}
                            searchStocks={this.props.actions.searchStocks}
                            callback={this.printAgain} /> : null
                }
                {/*全日通*/}
                {/* <OneDayPassport visible={this.state.oneDayPassportModal}
                    callback={this.oneDayPassport} /> */}
                {/*查货*/}
                {this.state.goodsModal && <SelectGoods visible={this.state.goodsModal}
                    onCancel={this.SelectGoodsPrice}
                    findInventory={this.props.hActions.findInventory}
                    initialState={this.props.initialState}
                    operators={this.props.operators}
                    focusInput={true} />}
                {/*查价*/}
                {this.state.priceModal && <SelectPrice visible={this.state.priceModal}
                    onCancel={this.SelectGoodsPrice}
                    initialState={this.props.initialState}
                    operators={this.props.operators}
                    focusInput={true} />}
                {/*查询游戏币活动*/}
                {/* <QueryGameCoin visible={this.state.gameCoinModal}
                    data={this.state.coinEvents}
                    callback={this.queryGameCoin} /> */}
                {/*钱箱提示框*/}
                {this.props.initialState.drawer !== '4' ?
                    <Modal
                        wrapClassName={`drawer-info-modal ${this.props.initialState.drawer !== '4' ? "vla-message-id" : ""}`}
                        style={{ top: 250 }}
                        title={null}
                        visible={true}
                        footer={
                            this.props.initialState.drawer !== '0' && this.props.initialState.drawer !== '4' ?
                                <Button type="primary"
                                    onClick={() => {
                                        // this.props.setState({ drawer: '4' });
                                        // setTimeout(() => {
                                        //     window.getCashboxStatus();
                                        // }, 500);
                                    }}>關閉</Button> : null
                        }
                        zIndex={1000000}
                        afterClose={() => { document.getElementById('codeInput').focus(); }}
                    >
                        <p>
                            <Icon type="info-circle-o" />
                            {this.props.initialState.drawer === '0' ?
                                <span>請關閉錢箱</span> :
                                null
                            }
                            {this.props.initialState.drawer !== '0' && this.props.initialState.drawer !== '4' ?
                                <span>打印機异常</span> : null
                            }
                        </p>
                    </Modal> : null}
                <Modal
                    title={null}
                    visible={this.state.progressModal}
                    closable={false}
                    maskClosable={false}
                    footer={
                        this.state.percent >= 99.9 ?
                            <Button onClick={() => {
                                this.setState({ progressModal: false })
                            }}>
                                {'完成'}
                            </Button>
                            // : !this.state.pause ?
                            // <React.Fragment>
                            //     <Button onClick={() => {
                            //         this.setState({progressModal: false})
                            //     }}>
                            //         {'取消'}
                            //     </Button>
                            //     <Button onClick={() => {
                            //         this.promotionSyn();
                            //     }}>
                            //         {'繼續'}
                            //     </Button>
                            // </React.Fragment>
                            :
                            <Button onClick={() => {
                                this.finishProgress()
                            }}>
                                {'終止'}
                            </Button>
                    }
                    mask={true}
                    zIndex={10000}
                    width={400}
                    style={{
                        position: 'absolute',
                        margin: 'auto',
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        width: '50%',
                        height: '50%'
                    }}
                    bodyStyle={{ margin: 0, padding: 0 }}
                    className="sortOutModal"
                    destroyOnClose={true}
                >
                    <div>
                        <div className="head">
                            {'數據同步'}
                        </div>
                        <div className="content">
                            <div className="msg">
                                <div style={{ border: 'border:1px dashed #F00' }}>
                                    <Progress type="dashboard"
                                        percent={parseFloat(this.state.percent.toFixed(1))} />
                                </div>
                            </div>
                        </div>
                        <input type="text" style={{ visibility: 'hidden' }} />
                    </div>
                </Modal>
            </div>
        );
    }

}

const mapStateToProps = (state) => {
    console.log('Presale', state);
    return {
        home: state['home'],
        state: state["presale"],
        initialState: state.initialize,
        operators: state.login.operuser,
        posrole: state.login.posrole,
        loginData: state.login.data,
        syspara: state.initialize.Syspara,
        isOnline: state.home.isOnline,
        humanIntervention: state.home.humanIntervention,
        initialize: state["initialize"],
        loginInfo: state.login,
    };
}

const mapDispatchToProps = (dispatch) => {
    return {
        actions: bindActionCreators(actions, dispatch),
        billAction: bindActionCreators(bill, dispatch),
        hActions: bindActionCreators(hActions, dispatch),
        updateXPH: bindActionCreators(updateXPH, dispatch),
        setState: (data) => dispatch(setState(data))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(withKeyBoard(PreSaleService));
