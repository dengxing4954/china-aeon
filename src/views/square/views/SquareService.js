import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import intl from 'react-intl-universal';
import { Modal, Radio, Button, Icon, Progress } from 'antd';
import ExtraPayModal from '@/common/components/extraPay/index.js';
import message from '@/common/components/message';
import { updateXPH } from '@/views/initialize/Actions.js'
import actions from '../Actions.js';
import pActions from '../../presale/Actions'
import hActions from '../../home/Actions'
import { bill } from '../../initialize/Actions.js';
import moment from 'moment';
import SquareLeft from './SquareLeft';
import SquareRight from './SquareRight';
import SelectGoods from '@/views/home/views/SelectGoods.js';
import SelectPrice from '@/views/home/views/SelectPrice.js';
import OtpInfo from '@/views/presale/views/OtpInfo.js';
import '../style/square.less';
import { increaseation, decreaseation } from '../Actions.js';
import RechargeKeypad from '@/common/components/rechargeKeypad/index.js';
import PrintAgain from '@/common/components/printAgain/index.js';
import SquareModal from './SquareModal';
import GoodsEditor from './GoodsEditor';
import Pager from './Pager';
import SquareKeyboard from './SquareKeyboard';
import SearchBill from '../../presale/views/SearchBill'
import SearchAMC from '../../presale/views/SearchAMC'
import CopyBill from '../../presale/views/CopyBill'
import EasyPay from '../../presale/views/EasyPay'
import OneDayPassport from '../../presale/views/OneDayPassport.js';
import { setState } from "../../initialize/Actions";
import { Fetch } from '@/fetch/';
import EventEmitter from '@/eventemitter';
import Url from '@/config/url.js';

const confirm = Modal.confirm;
const RadioGroup = Radio.Group;

//有状态组件
class SquareService extends Component {

    constructor(props) {
        super(props);
        this.state = {
            windowsState: false, //商品弹窗
            keyboardState: false, //键盘弹窗
            EditorState: false,    //商品编辑弹窗
            functionState: false,  //关于功能
            isPackageStatus: false, //查找商品是否为套餐,
            goodsInfo: [], //选择商品的属性
            goodssum: 0,
            goodsModal: false,
            priceModal: false,
            deleteNum: 0,//删除次数
            selectId: '',
            reprintModal: false,//查价
            editIndex: '',
            stallGoods: [], //快捷商品
            oneDayPassportModal: false, //全日通窗口
            editorCategory: {}, //选择商品的属性

            vipInfo: {}, //会员信息
            staffcard: '',//员工信息

            flow_no: '', //流水号
            calc_mode: 0,//默认传0。选择促销后重算传1。
            uidlist: '',
            goodsCode: '', //套餐编码
            goodsList: [],
            totalData: {    //合计数据
                num: 0.00,     //数量
                price: 0.00,   //价格 zdyftotal
                dsctotal: 0.00, //优惠金额 zddsctotal
                sjtotal: 0.00, //实际价格 zdsjtotal
            },
            pagination: {
                current: 1,//当前页数
                pageSize: 3,//每页条数
                total: 0,//数据总数
            },

            vipcardlogin: false, //会员登录
            staffcardlogin: false, //员工购物登录

            posrole: {},//操作员权限

            searchAMCModal: false,
            breadFlag: false, //面包店版本
            billListModal: false,
            PrintModal: false,//重印
            ejouralList: [],
            vipCardNo: '',
            octozz: null, //八达通增值/会员续费/入会
            copyBillModal: false,   //小票复制
            callValue: undefined, //呼叫信息

            switchEng: false,//是否切换英文单

            online: this.props.isOnline,//脱机联网
            tempZzk: 100,
            tempZzr: 0,

            //数据同步进度
            percent: 0,
            progressModal: false,
            // pause: false,
            havedata: 0,
            eatWay: 1,
            uuid: 0,
            isJFXH: false, //是否积分续会
            pagerVisible: false, //传呼器
            stallInfoList: [],//档口列表
        };
    }

    componentWillMount() {
        console.log(this.props, 'isOnlinewww')
        // this.props.setState({ drawer: '4' });
        // window.getCashboxStatus();
        if (this.props.initialState.data.syjmain[0].isbreadpos === 'Y') {
            this.setState({ breadFlag: true })
        } else {
            this.setState({ breadFlag: false })
        }
        if (this.props.presale.djlb === 'Y7') {
            this.setState({ octozz: this.props.presale.djlb });
        }
        const { goodsList, totalData, calc_mode, octozz, uidlist, flow_no, switchEng, deleteNum, ejouralList, staffcard, vipInfo, tempZzk, tempZzr, isJFXH, eatWay } = this.props.presale;
        let { posrole } = this.props.data;
        let stallGoods = this.props.initialState.data.stallhotkeytemplate instanceof Object ? this.props.initialState.data.stallhotkeytemplate.stallGoods : [];
        if (flow_no === '' || goodsList.length === 0) {
            this.createSale();
        } else {
            let { pagination } = this.state, shoppingInfo = {}, newGoods = [];
            pagination.total = goodsList.length;
            goodsList.map(item => newGoods.push({ ...item }));

            if (vipInfo && vipInfo.memberId) { //员工会员信息
                shoppingInfo.vipInfo = { ...vipInfo };
                shoppingInfo.vipcardlogin = true;
            } else if (staffcard) {
                shoppingInfo.staffcard = staffcard,
                    shoppingInfo.staffcardlogin = true;
            }
            this.setState({
                goodsList: newGoods,
                totalData: { ...totalData },
                flow_no,
                calc_mode,
                uidlist,
                switchEng,
                pagination,
                deleteNum,
                ejouralList,
                octozz,
                ...shoppingInfo,
                tempZzk,
                tempZzr,
                isJFXH,
                eatWay
            }, this.props.pAction.init())
        }
        this.setState({ stallGoods, posrole });
        if (!this.props.humanIntervention) {
            if (this.props.initialState.online == '0') {
                this.props.hActions.chengeonlineoff();
            } else if (this.props.initialState.online == '1') {
                this.props.hActions.chengeonlineon();
            } else {
                this.props.hActions.chengeonlineno();
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        console.log(this.props, 'isOnlinewr')
    }

    componentDidMount() {
        EventEmitter.on('Scan', this.scan);
        console.log(this.props, 'isOnlinedd')
    }

    componentWillUnmount = () => {
        EventEmitter.off('Scan', this.scan);      
    }

    scan = (data) => {
        this.goodsfindsubmit(data);
    }
    
    //清空state
    initState = () => {
        this.setState({
            goodsList: [],
            vipInfo: {},
            flow_no: '',
            totalData: {    //合计数据
                num: 0.00,     //数量
                price: 0.00,   //价格 zdyftotal
                dsctotal: 0.00, //优惠金额 zddsctotal
                sjtotal: 0.00, //实际价格 zdsjtotal
            },
            pagination: {
                current: 1,//当前页数
                pageSize: 3,//每页条数
                total: 0,//数据总数
            },
            addGoodsTime: '',
            octozz: null,
            deleteNum: 0,
            dcData: {},
            staffcard: '',
            ejouralList: [],
            vipcardlogin: false, //会员登录
            staffcardlogin: false, //员工购物登录
            tempZzk: 100,
            tempZzr: 0,
            isJFXH: false,
            eatWay: 1
        })
        this.props.pAction.init();
    }

    // 商品弹窗
    windowsControl = (key) => {
        this.setState({
            editIndex: key,
            windowsState: !this.state.windowsState,
        });
    }

    // 键盘弹窗
    keyboardControl = () => {
        if (this.state.keyboardState == true) {
            this.setState({
                keyboardState: false,
            });
        } else {
            this.setState({
                keyboardState: true,
            });
        }
    }

    // 编辑弹窗
    editorControl = (key) => {
        this.setState({ EditorState: !this.state.EditorState, editIndex: key });
    }

    //关于功能
    functionControl = () => {
        this.setState({
            functionState: !this.state.functionState,
        })
    }

    // 商品数量减
    onDecreaseClick = () => {
        if (this.state.goodssum < 1) {
            this.setState({
                goodssum: 0,
            })
        } else {
            this.setState({
                goodssum: this.state.goodssum - 1,
            })
        }
    }

    // 商品数量加
    onIncreaseClick = () => {
        this.setState({
            goodssum: this.state.goodssum + 1,
        })
    }

    //传呼器显示
    changePager = () => {
        this.setState({
            pagerVisible: !this.state.pagerVisible
        }, () => {
            if (this.state.pagerVisible) {
                let pagerNo = Number(this.props.initialState.pagerNO) - 1
                this.refs.Pager.setState({ pagerNo: pagerNo + '' })
                let params = {
                    erpCode: this.props.initialState.jygs,
                    shopCode: this.props.initialState.mkt,
                    operators: this.props.operator && this.props.operator.gh,
                    mkt: this.props.initialState.mkt,
                    syjh: this.props.initialState.syjh,
                    flow_no: this.state.flow_no
                }
                this.props.actions.getStallInfoList(params).then(res => {
                    if (res) {
                        this.setState({ stallInfoList: res.stallinfo })
                    }
                })
            }
        });
    }

    //初始化获取订单编号
    createSale = () => {
        return this.props.actions.createSale({
            operators: this.props.operator && this.props.operator.gh,
            // operators: this.props.operators,
            mkt: this.props.initialState.mkt,
            mktid: "002",
            syjh: this.props.initialState.syjh,
            vjzrq: moment().format('YYYY-MM-DD HH:mm:ss'),
            djlb: this.props.presale.djlb,
            fphm: this.props.initialState.xph,
            yys: 'javapos',
            mktname: this.props.initialState.data.mktinfo.mktname,
            ent_id: '0',
            jygz: this.props.initialState.jygs,
            gz: '1',
            yyyh: "9527",
            language: 'CHN',
            stallCode: this.props.initialState.data.syjmain[0].stallcode,
            //expdate: '1',
            sswrfs: this.props.initialState.data.syjmain[0] && this.props.initialState.data.syjmain[0].sswrfs || '0'
        }).then(res => {
            if (res.flag) {
                console.log('获取交易流水号', res);
                let { pagination } = this.state;
                pagination.current = 1;
                pagination.total = 0;
                this.setState({
                    uidlist: '',
                    flow_no: res.res.flow_no,
                    fphm: res.res.fphm,
                    pagination,
                    deleteNum: 0,
                    vipInfo: {}, //会员信息
                    staffcard: '',//员工信息
                    vipcardlogin: false, //会员登录
                    staffcardlogin: false, //员工购物登录
                })
            } else {
                let _this = this;
                Modal.confirm({
                    title: intl.get("INFO_ODERFAIL"),
                    content: res.res,
                    className: 'vla-confirm',
                    okText: intl.get("BTN_RETRY"),
                    cancelText: intl.get("BACKTRACK"),
                    onOk() {
                        _this.createSale();
                    },
                    onCancel() {
                        _this.props.history.push('/home');
                    }
                });
            }
        })
    }

    //点击操作菜单事件
    menuEvents = (type, params) => {
        this[type](params);
    }

    reprint = () => {
        this.setState({
            reprintModal: true
        })
    }

    closeReprint = () => {
        this.setState({
            reprintModal: !this.state.reprintModal
        })
        // this.refs.SelectPrice.clearData()
    }

    priceGoodsAdd = (barcode, price, flow_no) => {
        let req = {
            //code: barcode.trim(),
            barcode: barcode.trim(),
            price: price,
            jygs: this.props.initialState.jygs,
            //orgCode: "1",
            //searchType: "1",
            mkt: this.props.initialState.mkt,
            //terminalNo: "00200001",
            flow_no: flow_no || this.state.flow_no,
            yyyh: "9527",
            operators: this.props.operators && this.props.operators.gh,
            syjh: this.props.initialState.syjh,
            //gz: "1",
            flag: "0",
            calc_mode: '2',
            operators: this.props.operators,
            //consumers_id: this.state.vipInfo.vipid,
            //consumers_type: this.state.vipInfo.viptype,
            //consumers_trgs: this.state.vipInfo.trgs,
            //consumers_cardno: this.state.vipInfo.vipno,
            precision: '2',
            entid: this.props.initialState.entid,
            search: this.props.initialState.data.syjmain[0] && this.props.initialState.data.syjmain[0].issryyy === 'Y' ? '2' : '3'
        }
        return this.props.actions.addGoods(req)
    }

    // 商品添加
    goodsfindsubmit = (barcode, price, editor, flow_no) => {
        //903159011   935677348 949858598
        let { goodsList, totalData, uidlist, pagination, breadFlag } = this.state;
        if (!this.addGoodsVerify()) {
            window.audioPlay(false);
            return false
        }
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
        if (barcode.trim().length === 16) {
            return this.props.pAction.addCoupon({
                couponCode: barcode.trim(),
                flow_no: this.state.flow_no,
                operators: this.props.operator && this.props.operator.gh,
                mkt: this.props.initialState.mkt,
                syjh: this.props.initialState.syjh,
                scene: 0,
            }).then(res => {
                if (res) {
                    //console.log(res);
                    this.addGoodsCallback(res);
                    // this.repullSale();
                    this.setState({ keyboardState: false });
                    return true;
                }
                window.audioPlay(false);
                return false;
            })
        }
        //判断是否有整单折扣和整单折让
        if (this.state.tempZzk * 1 < 100 || this.state.tempZzr * 1 > 0) {
            Modal.confirm({
                title: '添加商品失敗',
                content: '訂單已選擇整單折，無法添加商品，是否取消整單折？',
                className: 'vla-confirm',
                okText: '是',
                cancelText: '否',
                onOk: () => {
                    if (this.state.tempZzk * 1 < 100) {
                        this.discountReceipt(0);
                    }
                    if (this.state.tempZzr * 1 > 0) {
                        this.rebateReceipt(0);
                    }
                }/*,
                onCancel() {
                }*/
            });
            return false;
        }
        let params = {
            code: barcode,
            barcode: barcode,
            jygs: this.props.initialState.jygs,
            orgCode: "1",
            searchType: "1",
            mkt: this.props.initialState.mkt,
            terminalNo: "00200001",
            flow_no: flow_no || this.state.flow_no,
            yyyh: "9527",
            operators: this.props.operators,
            calc_mode: "3",
            eatWay: this.state.eatWay,
            hasBackPrint: true,
            stallCode: this.props.initialState.data.syjmain[0].stallcode,
            syjh: this.props.initialState.syjh,
            gz: "1",
            flag: "0",
            search: "1",
            consumers_id: this.state.vipInfo.vipid,
            consumers_type: this.state.vipInfo.viptype,
            consumers_trgs: this.state.vipInfo.trgs,
            consumers_cardno: this.state.vipInfo.vipno,
        };
        let req = {
            //code: barcode.trim(),
            barcode: barcode.trim(),
            jygs: this.props.initialState.jygs,
            //orgCode: "1",
            //searchType: "1",
            mkt: this.props.initialState.mkt,
            //terminalNo: "00200001",
            flow_no: flow_no || this.state.flow_no,
            yyyh: "9527",
            operators: this.props.operators && this.props.operators.gh,
            syjh: this.props.initialState.syjh,
            //gz: "1",
            flag: "0",
            calc_mode: '0',
            operators: this.props.operators,
            //consumers_id: this.state.vipInfo.vipid,
            //consumers_type: this.state.vipInfo.viptype,
            //consumers_trgs: this.state.vipInfo.trgs,
            //consumers_cardno: this.state.vipInfo.vipno,
            precision: '2',
            entid: this.props.initialState.entid,
            search: this.props.initialState.data.syjmain[0] && this.props.initialState.data.syjmain[0].issryyy === 'Y' ? '2' : '3'
        }
        if (price) {
            params.price = parseFloat(price);
            params.calc_mode = '2';
        }
        if (breadFlag) {
            this.props.actions.addGoods(req).then(res => {
                if (res) {
                    if (res.goodslist[0].price === 0 && res.goodslist[0].barcode !== '665') {
                        RechargeKeypad.open({
                            title: intl.get("INFO_PRICING"), //"商品定价"
                            placeholder: intl.get("PLACEHOLDER_IPRICE"),  //"请输入商品价格",
                            errMessage: intl.get("INFO_TIP9", { max: this.props.initialState.Syspara.maxSaleGoodsMoney }),
                            //"请输入正确格式价格,且价格不超过max",
                            rule: (num) => {
                                let numF = parseFloat(num);
                                if (/(^[0-9]\d*(\.\d{1,2})?$)/.test(num) && numF > 0 && numF <= this.props.initialState.Syspara.maxSaleGoodsMoney) {
                                    return true;
                                }
                                // if (/(^(0\.\d{1,2}$))|(^[1-9]\d*(\.\d{1,2})?$)/.test(num) &&
                                //     num * 1 <= this.props.initialState.Syspara.maxSaleGoodsMoney) {
                                //     return true;
                                // }
                                return false;
                            },
                            callback: (value) => this.priceGoodsAdd(res.goodslist[0].barcode, value).then(result => {
                                this.addGoodsCallback(result)
                                this.setState({ keyboardState: false })
                            })
                        })
                    } else {
                        this.addGoodsCallback(res)
                        this.setState({ keyboardState: false })
                    }
                    return
                }
            })
        }
        if (editor) {
            this.props.actions.addGoods(params).then(res => {
                if (res) {
                    if (res.goodslist[0].price === 0 && res.goodslist[0].barcode !== '665') {
                        RechargeKeypad.open({
                            title: intl.get("INFO_PRICING"), //"商品定价"
                            placeholder: intl.get("PLACEHOLDER_IPRICE"),  //"请输入商品价格",
                            errMessage: intl.get("INFO_TIP9", { max: this.props.initialState.Syspara.maxSaleGoodsMoney }),
                            //"请输入正确格式价格,且价格不超过max",
                            rule: (num) => {
                                let numF = parseFloat(num);
                                if (/(^[0-9]\d*(\.\d{1,2})?$)/.test(num) && numF > 0 && numF <= this.props.initialState.Syspara.maxSaleGoodsMoney) {
                                    return true;
                                }
                                return false;
                            },
                            callback: (value) => this.priceGoodsAdd(res.goodslist[0].barcode, value).then(result => {
                                if (result) {
                                    this.setState({
                                        editorCategory: result
                                    })
                                }
                            })
                        })
                    } else {
                        this.setState({
                            editorCategory: res
                        })
                    }
                } else {
                    this.setState({
                        keyboardState: false,
                    })
                }
            })
        }
        return this.props.actions.addGoods(params).then(res => {
            if (res) {
                let goodsInfo = res.goodslist[0];
                if (res.goodslist[0].price === 0 && res.goodslist[0].barcode !== '665') {
                    RechargeKeypad.open({
                        title: intl.get("INFO_PRICING"), //"商品定价"
                        placeholder: intl.get("PLACEHOLDER_IPRICE"),  //"请输入商品价格",
                        errMessage: intl.get("INFO_TIP9", { max: this.props.initialState.Syspara.maxSaleGoodsMoney }),
                        //"请输入正确格式价格,且价格不超过max",
                        rule: (num) => {
                            let numF = parseFloat(num);
                            if (/(^[0-9]\d*(\.\d{1,2})?$)/.test(num) && numF > 0 && numF <= this.props.initialState.Syspara.maxSaleGoodsMoney) {
                                return true;
                            }
                            return false;
                        },
                        callback: (value) => this.priceGoodsAdd(res.goodslist[0].barcode, value).then(result => {
                            if (result) {
                                if (result.type === '1') {
                                    let ssgId = result.goodlist[0].ssgid;
                                    this.findPackage(ssgId);
                                    this.setState({
                                        isPackageStatus: true,
                                        goodsInfo: result.goodslist[0]
                                    })
                                } else {
                                    // this.handleEjoural(result.goodslist[0], 0);
                                    this.addGoodsCallback(result)
                                    this.setState({
                                        windowsState: false,
                                        keyboardState: false,
                                        goodsInfo: result.goodslist[0],
                                        isPackageStatus: false
                                    })
                                }
                            }
                        })
                    })
                } else {
                    if (res.type === '1') {
                        let goodsId = goodsInfo.goodsId;
                        this.findPackage(goodsId)
                        this.setState({
                            isPackageStatus: true,
                            goodsInfo
                        })
                    } else {
                        // this.handleEjoural(goodsInfo, 0);
                        if (flow_no == undefined) {
                            this.addGoodsCallback(res)
                        }
                        this.setState({
                            // windowsState: res.goodslist[0].goodsType === '13' ? false : true,
                            windowsState: false,
                            keyboardState: false,
                            goodsInfo,
                            isPackageStatus: false
                        })
                    }
                }
                return res
            } else {
                this.setState({
                    keyboardState: false,
                })
            }
        })
    }

    //删除一行
    delGoods = (index, goods) => {
        let params = {
            guid: goods.guid,
            flow_no: this.state.flow_no,
            barcode: goods.barcode,
            sqkh: '0015',
            operators: this.props.operators,
            mkt: this.props.initialState.mkt,
            syjh: this.props.initialState.syjh,
        };
        let { goodsList, uidlist, totalData, pagination, deleteNum } = this.state;
        let max = this.props.initialState.Syspara.maxDelhs;
        if (max !== '0' && max - deleteNum <= 0) {
            //message(`当前单据最多可删除${max}行商品，已删除${deleteNum}行商品，无法删除商品！`)
            message(intl.get('INFO_DELERROR', { max: max, deleteNum: deleteNum }))
            return false;
        }
        if (goodsList.length !== 1) {
            let delGoodsAction = () => {
                console.log('index', index);
                this.props.actions.delGoods(params).then(res => {
                    if (res) {
                        goodsList = goodsList.filter((item, key) => key !== index);
                        uidlist = uidlist.indexOf(",") < 0 ? "" : (index === 0 ? uidlist.replace(goods.guid + ",", "") : uidlist.replace("," + goods.guid, ""));
                        this.calculateData(totalData, goodsList);
                        this.handleEjoural(goods, 1);
                        pagination.total = goodsList.length;
                        pagination.current = (pagination.current - 1) * pagination.pageSize === goodsList.length ? pagination.current - 1 : pagination.current;
                        this.setState({
                            goodsList,
                            uidlist,
                            totalData,
                            pagination,
                            keyboardState: false,
                            deleteNum: res.deleteNum
                        });
                    }
                })
            }
            if (this.state.posrole.privqx === 'Y' || this.state.posrole.privqx === 'T') {
                delGoodsAction();
                return true;
            }
            React.accredit(posrole => {
                if (posrole.privqx === 'Y' || posrole.privqx === 'T') {
                    delGoodsAction();
                } else {
                    message(this.intl("INFO_AUTHFAIL"));
                }
            }, null, { flow_no: this.state.flow_no })
        } else {
            message(this.intl("INFO_CNOTDEL"));
        }
    }

    //提交整单并跳转页面
    dispatchSubmit = (req, res, djlb) => {
        const { goodsList, totalData, eatWay, vipInfo, limitedPays, addGoodsTime, easyPay, deleteNum, switchEng, isDc, isSd, isDj, dcData, salesMemo, octozz, discountPayDescribe, giftList, staffcard,exceptPayData, ejouralList, tempZzk, tempZzr, isJFXH } = this.state;
        let isDiningHall = true;
        this.props.pAction.submit(
            req,
            {
                goodsList,
                totalData,
                vipInfo,
                limitedPays,
                addGoodsTime,
                easyPay,
                deleteNum,
                switchEng,
                isDc,
                isSd,
                isDj,
                dcData,
                salesMemo,
                octozz,
                discountPayDescribe,
                giftList,
                staffcard,
                ejouralList,
                isDiningHall,
                tempZzk,
                tempZzr,
                isJFXH,
                exceptPayData,
                eatWay
            },
            res).then(() => {
                let _target = {
                    pathname: '/invoice',
                    query: {
                        djlb: this.state.octozz
                    },
                }
                this.props.history.push(_target);
            });
    }

    //整单计算
    submitCalculate = async (params) => {
        let req = {
            flow_no: this.state.flow_no,
            count: this.state.goodsList.length,
            qty: params.qty,
            calc_mode: params.calc_mode,
            operators: this.props.operator && this.props.operator.gh,
            mkt: this.props.initialState.mkt,
            syjh: this.props.initialState.syjh,
            uidlist: params.uidlist,
            ...params,
        }
        const paymodeList = this.props.initialState.data.paymode;
        this.props.pAction.beforeSubmit(req).then(res => {
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
                //选择赠品后要重算uidlist qty count
                if ((params.calc_mode === 4 && params.giftList && params.giftList.length > 0
                    && (!res.noPriceGiftList || res.noPriceGiftList.length === 0)) || params.calc_mode === -2) {
                    req.uidlist = res.goodsList.map(item => item.guid).join(',');
                    req.qty = res.qty;
                    req.count = res.goodsList.length;
                } else {
                    req.uidlist = res.goodsList.map(item => item.guid).join(',');
                    req.count = res.goodsList.length;
                }

                // if (params.calc_mode === -1) {
                //     ExtraPayModal.close();
                //     if (this.submitMessage) {
                //         Modal.info({
                //             //title: this.submitMessage,
                //             content: this.submitMessage.split('|').map(item =>
                //                 <p>{item}</p>),
                //             className: 'vla-confirm',
                //             width: 600,
                //             okText: '確定',
                //             onOk: () => {
                //                 this.submitMessage = '';
                //                 this.dispatchSubmit(req, res, this.state.octozz);
                //             }
                //         });
                //     } else {
                //         this.dispatchSubmit(req, res, this.state.octozz);
                //     }
                //     return;
                // }
                if (params.calc_mode === -1 || params.calc_mode === -3 || params.calc_mode === 3) {
                    //支付追送(支付折扣)
                    if (res.exceptPays && res.exceptPays.length > 0 && params.calc_mode !== 3 && params.calc_mode !== -3) {
                        res.exceptPays = res.exceptPays.filter(
                            item => paymodeList.find(_item => _item.code === item.paycode))
                        if (res.exceptPays.length > 0) {
                            ExtraPayModal.open({
                                type: 'exceptPays',
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
                                            calc_mode: 3,
                                            discountPayCode: exceptPay.paycode,
                                            discountPayType: exceptPay.paytype,
                                        })
                                    } else {
                                        this.submitCalculate({
                                            ...req,
                                            calc_mode: -3
                                        })
                                    }
                                    ExtraPayModal.close();
                                }
                            })
                        } else {
                            this.submitCalculate({
                                ...req,
                                calc_mode: -1
                            })
                        }
                        return;
                    }
                    if (params.calc_mode === 3) {
                        this.submitCalculate({
                            ...req,
                            calc_mode: -3
                        })
                        return;
                    }
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
                        this.dispatchSubmit(req, res, this.state.octozz);
                    }
                    return;
                }
                if (res.popflag === '0') {
                    if (res.giftGroupList && res.giftGroupList.length > 0 && params.calc_mode !== 4) {
                        ExtraPayModal.open({
                            type: 'giftList',
                            //paymode: this.props.initialState.data.paymode,
                            data: res,
                            cancel: this.cancelSubmit,
                            callback: (giftList) => {
                                this.setState({ giftList })
                                this.submitCalculate({
                                    ...req,
                                    calc_mode: 4,
                                    giftList
                                })
                            }
                        })
                    } /*else if (res.exceptPays && res.exceptPays.length > 0 && params.calc_mode !== 3) {
                        res.exceptPays = res.exceptPays.filter(
                            item => paymodeList.find(_item => _item.code === item.paycode))
                        if (res.exceptPays.length > 0) {
                            ExtraPayModal.open({
                                type: 'exceptPays',
                                paymodeList: paymodeList,
                                data: res,
                                cancel: this.cancelSubmit,
                                callback: (exceptPay) => {
                                    if (exceptPay) {
                                        let discountPayDescribe = intl.get("EXTRA_INFO_CARDRANGE", {
                                            crdFrom: exceptPay.crdLocation,
                                            crdTo: exceptPay.crdLocation + exceptPay.crdLength,
                                            crdBegin: exceptPay.crdBegin,
                                            crdEnd: exceptPay.crdEnd
                                        });
                                        this.setState({
                                            discountPayDescribe
                                        })
                                        this.submitCalculate({
                                            ...req,
                                            calc_mode: 3,
                                            discountPayCode: exceptPay.paycode,
                                            discountPayType: exceptPay.paytype,
                                        })
                                    } else {
                                        this.submitCalculate({
                                            ...req,
                                            calc_mode: -1
                                        })
                                    }
                                    ExtraPayModal.close();
                                }
                            })
                        } else {
                            this.submitCalculate({
                                ...req,
                                calc_mode: -1
                            })
                        }
                    }*/ else {
                        this.submitCalculate({
                            ...req,
                            calc_mode: -1
                        })
                    }
                }
                if (res.popflag === '2') {
                    this.setState({ limitedPays: res.limitedPays });
                    ExtraPayModal.open({
                        type: 'limitedPays',
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
                            calc_mode: 2,
                            limitedpaycodes
                        })
                    })
                }
                if (res.popflag === '100001') {
                    ExtraPayModal.open({
                        type: 'noPriceGiftList',
                        data: res,
                        maxGiftPrice: this.props.syspara.maxSaleGoodsMoney,
                        cancel: this.cancelSubmit,
                        callback: (noPriceGiftList) => this.submitCalculate({
                            ...req,
                            calc_mode: -2,
                            noPriceGiftList
                        })
                    })
                }
                if (res.popflag === '-3') {
                    req.uidlist = res.goodsList.map(item => item.guid).join(',');
                    req.qty = res.qty;
                    req.count = res.goodsList.length;
                    this.submitCalculate({
                        ...req,
                        calc_mode: -1
                    })
                }
            }
        })
    }

    //整单计算
    submit = () => {
        let uidlist, qty = 0;
        if (this.state.goodsList.length === 0) {
            message(this.intl("INFO_CNOTCALCULATION"));
            return false
        }
        if (this.state.octozz && this.state.octozz === 'Y11' &&
            (!this.state.vipInfo || JSON.stringify(this.state.vipInfo) === '{}')) {
            message('會員續費訂單必須登入會員')
            return false
        }
        uidlist = this.state.goodsList.map(item => {
            qty += item.qty;
            return item.guid;
        }).join(',');
        this.submitCalculate({
            qty: qty,
            calc_mode: '0',
            uidlist: uidlist,
            isDiningHall: true,
            limitedPays: undefined
        })
        // const {goodsList, totalData, uidlist, vipInfo, staffcard, deleteNum, ejouralList, octozz} = this.state;
        // let qty = 0;
        // if (this.state.goodsList.length === 0) {
        //     return false
        // }
        // qty = this.state.goodsList.reduce((p, c) => p + c.qty, 0);
        // let params = {
        //     flow_no: this.state.flow_no,
        //     count: this.state.goodsList.length,
        //     qty: qty,
        //     calc_mode: '0',
        //     operators: this.props.operators,
        //     mkt: this.props.initialState.mkt,
        //     syjh: this.props.initialState.syjh,
        //     limitedpaycodes: '1',
        //     uidlist,
        // };
        // this.props.actions.submit(params, {goodsList, totalData}).then((res) => {
        //     if (res) {
        //         totalData.discounts = totalData.dsctotal;
        //         totalData.totalPrice = totalData.sjtotal;
        //         let newTotal = totalData;
        //         this.props.pAction.submit(params, {
        //             isDiningHall: true,
        //             totalData: newTotal,
        //             switchEng: this.state.switchEng,
        //             goodsList: this.state.goodsList,
        //             vipInfo,
        //             limitedPays: undefined,
        //             staffcard,
        //             octozz,
        //             ejouralList,
        //             deleteNum,
        //             addGoodsTime: moment().format('DD/MM/YYYY HH:mm:ss')
        //         }, res).then(() => {
        //             let _target = {
        //                 pathname: '/invoice',
        //                 query: {
        //                     djlb: this.state.octozz
        //                 },
        //             }
        //             this.props.history.push(_target);
        //         });
        //     }
        // })
    }

    //商品修改
    editGoods = (goods, qty, callback = () => {
    }, isPackage) => {
        if (qty * 1 === 0) {
            message('修改數量不能為0')
            return false
        }
        let params = {
            operators: this.props.operators,
            mkt: this.props.initialState.mkt,
            syjh: this.props.initialState.syjh,
            flow_no: this.state.flow_no,
            syyh: this.props.operators,
            barcode: goods.barcode,
            qty: qty,
            guid: goods.guid,
            consumers_id: this.state.vipInfo.vipid,
            consumers_type: this.state.vipInfo.viptype,
            consumers_trgs: this.state.vipInfo.trgs,
            consumers_cardno: this.state.vipInfo.vipno,
            calc_mode: '0',//修改价格传2
            isbreak: 'N',
            flag: '0'
        };
        this.props.actions.editGoods(params).then(res => {
            if (res) {
                callback();
                let { totalData, goodsList, pagination } = this.state;
                let list = res.goodslist.find(v => v.goodsno == goods.goodsno)
                list.isPackage = isPackage
                goodsList[this.state.editIndex] = list
                this.handleEjoural(list, 2)
                this.calculateData(totalData, goodsList);
                this.setState({ goodsList, totalData, keyboardState: false });
            }
        })
    }

    //修改积分换购
    changeRedemption = (goods, qty) => {
        let req = {
            operators: this.props.operator && this.props.operator.gh,
            mkt: this.props.initialState.mkt,
            syjh: this.props.initialState.syjh,
            flow_no: this.state.flow_no,
            syyh: this.props.operator && this.props.operator.gh,
            qty: qty,
            barcode: goods.barcode,
            guid: goods.guid,
            //consumers_id: this.state.vipInfo.vipid,
            //consumers_type: this.state.vipInfo.viptype,
            //consumers_trgs: this.state.vipInfo.trgs,
            //consumers_cardno: this.state.vipInfo.vipno,
            calc_mode: '4',
            isbreak: 'N',
            flag: '0'
        }
        this.props.actions.editGoods(req).then(res => {
            if (res) {
                let { totalData, goodsList, pagination } = this.state;
                let list = res.goodslist.find(v => v.goodsno == goods.goodsno)
                goodsList[this.state.editIndex] = list
                this.calculateData(totalData, goodsList);
                this.setState({ goodsList, totalData });
            }
        })
    }

    //修改商品属性
    changeGoods = (goods, categoryPropertys, eatWay, hasBackPrint, qty, editor) => {
        let params = {
            operators: this.props.operators,
            mkt: this.props.initialState.mkt,
            syjh: this.props.initialState.syjh,
            flow_no: this.state.flow_no,
            syyh: this.props.operators,
            barcode: goods.barcode,
            guid: goods.guid,
            consumers_id: this.state.vipInfo.vipid,
            consumers_type: this.state.vipInfo.viptype,
            consumers_trgs: this.state.vipInfo.trgs,
            consumers_cardno: this.state.vipInfo.vipno,
            calc_mode: '3',//修改价格传2
            flag: '0',
            qty: qty,
            isbreak: 'N',
            eatWay: eatWay,
            stallCode: this.props.initialState.data.syjmain[0].stallcode,
            hasBackPrint: hasBackPrint,
            categoryPropertys: categoryPropertys
        };
        if (!editor) {
            this.props.actions.editGoods(params).then(res => {
                let { goodsList, totalData, uidlist, pagination } = this.state;
                if (res) {
                    this.replaceGoodsList(res);
                    this.setState({
                        windowsState: false
                    });
                }
            })
        } else {
            let { editIndex } = this.state
            this.props.actions.editGoods(params).then(res => {
                if (res) {
                    let { totalData, goodsList, pagination } = this.state;
                    this.replaceGoodsList(res);
                    this.setState({windowsState: false });
                }
            })
        }
    }

    //取消整单
    cancelRecord = () => {
        //授权卡号
        if (this.state.goodsList.length === 0) {
            message(intl.get("INFO_EMPTYLIST"));
            return false
        }
        let params = {
            flow_no: this.state.flow_no,
            flag: 0,
            operators: this.props.operators,
            mkt: this.props.initialState.mkt,
            syjh: this.props.initialState.syjh,
            sqkh: '1',//授权卡号
        };
        this.props.actions.cancel(params).then(res => {
            if (res) {
                console.log('取消整单成功', res);
                this.handleEjoural(this.state.totalData, 3);      
                if (this.props.initialState.Syspara.xdIsaddfphm === 'Y') {
                    this.props.updateXPH();
                }
                // if (this.state.vipcardlogin) {
                //     this.cancelVip().then(this.createSale);
                // } else if (this.state.staffcardlogin) {
                //     this.exitStaff().then(this.createSale);
                // } else {
                //     this.createSale();
                // }
                this.createSale();
                this.initState();
                // this.props.pAction.init();
                
            }
        })
    }

    //整单折扣 flag === 0 取消整单让
    discountReceipt = (flag) => {
        let { goodsList } = this.state;
        if (goodsList.length === 0) {
            message(this.intl("INFO_EMPTYCANOTZK"));
            return false;
        }
        let discountBillAction = () => {
            let callback = (value) => {
                this.props.pAction.discountBill({
                    operators: this.props.operator && this.props.operator.gh,
                    flow_no: this.state.flow_no,
                    zkl: 100 - value * 1,
                    mkt: this.props.initialState.mkt,
                    syjh: this.props.initialState.syjh,
                    isbreak: '1'
                }).then((res) => {
                    if (res) {
                        if (res) {
                            if (res.retflag === "0") {
                                this.replaceGoodsList(res);
                                this.handleEjoural(value, 8);
                                this.setState({
                                    tempZzk: 100 - value * 1
                                })
                            }
                            if (res.retflag === "1000") {
                                React.accredit(posrole => {
                                    if (posrole.privdpzkl > 0) {
                                        discountBillAction();
                                    } else {
                                        message(this.intl("INFO_AUTHFAIL"))   //'授权失败：无此权限'
                                    }
                                }, null, { flow_no: this.state.flow_no }, `${res.retmsg}: 請拉可授權之員工卡`)
                                return false;
                            }
                        }
                    }
                })
            }
            if (flag === 0) {
                callback(0);
                return;
            }
            RechargeKeypad.open({
                title: intl.get("MENU_DISCOUNTZK"),   //"整单折扣",
                placeholder: intl.get("PLACEHOLDER_DISCONUTZK"), //"请输入折扣",
                //info: `当前账号最大折扣率为${this.props.posrole.privzpzkl}`,
                keyboard: [     //可选的键盘
                    { name: "5%", value: "5" },
                    { name: "10%", value: "10" },
                    { name: "15%", value: "15" },
                    { name: "20%", value: "20" }
                ],
                callback: (value) => callback(value)
            })
        }
        if (this.state.posrole.privzpzkl > 0 || flag === 0) {
            discountBillAction();
            return true;
        }
        React.accredit(posrole => {
            if (posrole.privzpzkl > 0) {
                discountBillAction();
            } else {
                message(intl.get("INFO_AUTHFAIL"))   //'授权失败：无此权限'
            }
        }, null, { flow_no: this.state.flow_no })
    }

    //整单折让 flag === 0 取消整单让
    rebateReceipt = (flag) => {
        let { goodsList } = this.state;
        if (goodsList.length === 0) {
            message(this.intl("INFO_EMPTYCANOTZR"));
            return false
        }
        let rebateBillAction = () => {
            let callback = (value) => {
                this.props.pAction.rebateBill({
                    operators: this.props.operator && this.props.operator.gh,
                    flow_no: this.state.flow_no,
                    zre: value,
                    mkt: this.props.initialState.mkt,
                    syjh: this.props.initialState.syjh,
                    isbreak: '1'
                }).then((res) => {
                    if (res) {
                        if (res) {
                            if (res.retflag === "0") {
                                this.replaceGoodsList(res);
                                this.handleEjoural(value, 9);
                                this.setState({
                                    tempZzr: value * 1
                                })
                            }
                            if (res.retflag === "1000") {
                                React.accredit(posrole => {
                                    if (posrole.privdpzkl > 0) {
                                        rebateBillAction();
                                    } else {
                                        message(intl.get("INFO_AUTHFAIL"))   //'授权失败：无此权限'
                                    }
                                }, null, { flow_no: this.state.flow_no }, `${res.retmsg}: 請拉可授權之員工卡`)
                                return false;
                            }
                        }
                    }
                })
            }
            if (flag === 0) {
                callback(0);
                return;
            }
            RechargeKeypad.open({
                title: intl.get("MENU_DISCOUNTZR"),  //"整单折让"
                placeholder: intl.get("PLACEHOLDER_DISCONUTZR"),  //"请输入折让金额",
                //info: `当前账号最大折让金额为${(1-this.props.posrole.privzpzkl)*this.state.totalData.price}`,
                keyboard: [     //可选的键盘
                    { name: "100", value: "100" },
                    { name: "50", value: "50" },
                    { name: "20", value: "20" },
                    { name: "10", value: "10" }
                ],
                callback: (value) => callback(value)
            })
        }
        if (this.state.posrole.privzpzkl > 0 || flag === 0) {
            rebateBillAction();
            return true;
        }
        React.accredit(posrole => {
            if (posrole.privzpzkl > 0) {
                rebateBillAction();
            } else {
                message(intl.get("INFO_AUTHFAIL"))   //'授权失败：无此权限'
            }
        }, null, { flow_no: this.state.flow_no })
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
                }
                if (res) {
                    this.props.setState({ online: res.netType });
                    if (onlinenumber == 1) {
                        this.promotionSyn();
                    } else if (onlinenumber == 2) {
                        this.updatanumberonline();
                    } else {
                        console.log('...')
                    }
                }
            }).catch((error) => {
            });
        })
    };
    ;

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
            console.log(res);
            this.setState({
                percent: this.state.percent + 1 / 3 * 100
            });
            this.updataonline();
        }).catch((err) => {
            console.log(err);
            this.setState({
                percent: this.state.percent + 1 / 3 * 100
            });
            this.updataonline();
        })
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
            if (res.retflag === "0") {
                console.log('启动营销订单同步');
                this.setState({
                    percent: this.state.percent + 1 / 3 * 100
                });
                this.updatanumberonline();
            } else {
                Modal.confirm({
                    title: '更新失敗，是否重新啟動行銷訂單同步?',
                    className: 'vla-confirm',
                    okText: intl.get("BTN_CONFIRM"),
                    cancelText: intl.get("BACKTRACK"),
                    onOk() {
                        _this.promotionSyn();
                    },
                    onCancel() {
                        _this.setState({
                            percent: _this.state.percent + 1 / 3 * 100
                        });
                        _this.updatanumberonline();
                        return
                    }
                });
            }
        }).catch(err => {
            console.log(err);
            Modal.confirm({
                title: '更新失敗，是否重新啟動行銷訂單同步?',
                className: 'vla-confirm',
                okText: intl.get("BTN_CONFIRM"),
                cancelText: intl.get("BACKTRACK"),
                onOk() {
                    _this.promotionSyn();
                },
                onCancel() {
                    _this.updatanumberonline();
                    _this.setState({
                        percent: _this.state.percent + 1 / 3 * 100
                    });
                    return;
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
            console.log(res);
            this.setState({
                percent: this.state.percent + 1 / 3 * 100
            });
        }).catch((err) => {
            console.log(err);
            this.setState({
                percent: this.state.percent + 1 / 3 * 100
            });
        })
    }

    //全单外卖
    changeEatWay = () => {
        let params = {
            operators: this.props.operators,
            flow_no: this.state.flow_no,
            mkt: this.props.initialState.mkt,
            syjh: this.props.initialState.syjh,
        }
        if (this.state.goodsList.length !== 0) {
            this.props.actions.changeEatWay(params).then(res => {
                if (res) {
                    if (res.orderEatWay == 2) {
                        message('全單外賣成功');
                    } else {
                        message('全單堂食成功')
                    }
                    this.state.goodsList.forEach(item => {
                        item.eatWay = res.orderEatWay;
                    })
                    this.setState({ goodsList: this.state.goodsList, eatWay: res.orderEatWay })
                }
            })
        } else {
            message('请先添加商品')
        }
    }

    //会员登录
    loginVip = (callback) => {
        if (this.state.octozz && this.state.octozz === 'Y10' && JSON.stringify(this.state.vipInfo) !== '{}') {
            message('會員入會訂單無法修改會員');
            return false;
        }
        if (this.state.octozz && this.state.octozz === 'Y11' && JSON.stringify(this.state.vipInfo) !== '{}') {
            message('會員續費訂單無法修改會員');
            return false;
        }
        this.loginVipModal();
    }

    //会员登录弹框
    loginVipModal = (createSale, addGoods) => {
        const com = (data) => {
            if (createSale) {
                /*return callback().then(res => {
                    if(res) {
                        this.addVip(data, {idType: '1'});
                    }
                    RechargeKeypad.close();
                })*/
                createSale().then(res => {
                    this.addVip(data, { idType: '1' }, (vipInfo) => addGoods(vipInfo, res.flow_no), res.flow_no);
                })
                RechargeKeypad.close();
            } else {
                this.addVip(data, { idType: '1' });
                RechargeKeypad.close();
            }
        }
        RechargeKeypad.open({
            title: this.intl("INFO_MEMBERLOGIN"),
            tabs: [{
                name: this.intl("CARD_NUMBER"),  //卡号
                value: '1'
            }, {
                name: this.intl("PHONE_NUMBER"), //手机号
                value: '2'
            }],
            placeholder: '',
            callback: (value, idType) => {
                if (createSale) {
                    /*return callback().then(res => {
                        if(res) {
                            return this.addVip(value, {idType: idType});
                        }
                    })*/
                    createSale().then(res => {
                        this.addVip(value, { idType: idType }, (vipInfo) => addGoods(vipInfo, res.flow_no), res.flow_no);
                    })
                } else {
                    this.addVip(value, { idType: idType });
                }
            },
            event: {
                tabValue: '1',
                chooseEvent: () => {
                    EventEmitter.on('Com', com)
                    EventEmitter.off('Scan', this.scan);
                },
                cancelEvent: () => {
                    EventEmitter.off('Com', com)
                    EventEmitter.on('Scan', this.scan);
                }
            }
        })
    }

    //小票复制
    copyBill = (values, callback) => {
        if (!values) {
            this.setState({ copyBillModal: !this.state.copyBillModal });
        } else if (values === 'open') {
            if (this.state.goodsList.length > 0) {
                message(this.intl("INFO_UNDONEORDERCOPY"));  //'当前单据未完成，无法小票复制！'
                return false;
            }
            if (this.state.posrole.privqt4 === 'Y') {
                this.setState({ copyBillModal: !this.state.copyBillModal });
                return false;
            }
            React.accredit(posrole => {
                if (posrole.privqt4 === 'Y') {
                    this.setState({ copyBillModal: !this.state.copyBillModal });
                } else {
                    message(this.intl("INFO_AUTHFAIL"))   //'授权失败：无此权限'
                }
            }, null, { flow_no: this.state.flow_no })
        } else {
            this.props.actions.copyBill({
                flow_no: this.state.flow_no,
                operators: this.props.operator && this.props.operator.gh,
                //mkt: this.props.initialState.mkt,
                //...values
                mkt: values.substring(0, 3),
                syjh: values.substring(3, 6),
                fphm: values.substring(6),
            }).then(res => {
                if (res) {
                    let { addGoodsTime } = this.state
                    if (!addGoodsTime) {
                        addGoodsTime = moment().format('DD/MM/YYYY HH:mm:ss');
                    }
                    if (res.goodslist && res.goodslist.length > 0) {
                        this.replaceGoodsList(res);
                        this.handleEjoural(res.goodslist, 4)
                        // 四电一脑商品添加
                        // let exceptGoods = res.goodslist.find(item => item.controlFlag === true);
                        // if(exceptGoods){
                        //     this.setState({exceptOldModal: true, exceptOldGoodslist: [exceptGoods], controlResult: res})
                        //     const mkt = this.props.initialState.mkt.substr(this.props.initialState.mkt.length-2)
                        //     let date = new Date
                        //     let month = date.getMonth()+1
                        //     const year = date.getFullYear()
                        //     month = month < 10 ? "0" + month : month
                        //     const syjh = this.props.initialState.syjh.substr(this.props.initialState.syjh.length-3)
                        //     const recordNo = `${mkt}${year}${month}${syjh}${this.state.fphm.substr(this.state.fphm.length-5)}`
                        //     this.setState({
                        //         terminalSno:`${this.props.initialState.syjh}${this.props.initialState.fphm}`,
                        //         recordNo
                        //     })
                        // }
                    }
                    this.setState({ copyBillModal: false, addGoodsTime });
                    if (callback) {
                        callback();
                    }
                }
            })
        }
    }

    //初始化获取订单编号请求
    createSaleReq = (djlb) => {
        return this.props.actions.createSale({
            operators: this.props.operator && this.props.operator.gh,
            mkt: this.props.initialState.mkt,
            mktid: this.props.initialState.mkt,
            syjh: this.props.initialState.syjh,
            vjzrq: moment().format('YYYY-MM-DD HH:mm:ss'),
            djlb: djlb || this.props.presale.djlb,
            fphm: this.props.initialState.xph,
            yys: 'javapos',
            flag: '0',
            mktname: this.props.initialState.data.mktinfo && this.props.initialState.data.mktinfo.mktname,
            ent_id: this.props.initialState.entid,
            jygz: this.props.initialState.jygs,
            gz: '1',
            yyyh: "9527",
            language: 'CHN',
            sswrfs: this.props.initialState.data.syjmain[0] && this.props.initialState.data.syjmain[0].sswrfs || '0',
            maxSaleGoodsQuantity: this.props.initialState.Syspara.maxSaleGoodsQuantity,
            // this.props.initialState.Syspara.maxSaleGoodsQuantity
            maxSaleGoodsMoney: this.props.initialState.Syspara.maxSaleGoodsMoney,
            maxSaleMoney: this.props.initialState.Syspara.maxSaleMoney,
            stallCode: this.props.initialState.data.syjmain[0] && this.props.initialState.data.syjmain[0].stallcode,   //档口编码
            popMode: this.props.initialState.popMode
        })
    }

    //会员续费
    rechargeVip = (param) => {
        if (this.state.octozz && this.state.octozz === 'Y11' && this.state.goodsList.length > 0) {
            message('會員續費不可重複添加'); // 会员续费不可重复添加
            return false;
        }
        if (this.props.humanIntervention || this.props.initialState.online == '0') {
            message("脫機狀態不支持此功能");
            return false
        }
        if (this.state.octozz && this.state.octozz === 'Y10') {
            message('會員入會單據不能進行續費操作'); // 会员入会单据不能进行续费操作
            return false;
        }
        if (this.state.octozz && this.state.octozz === 'Y3') {
            message('八達通增值單據不能進行續費操作'); // 八达通增值单据不能进行续费操作
            return false;
        }
        // if (this.state.octozz && this.state.octozz === 'Y12') {
        //     message('印花換購單據不能進行續費操作'); // 印花换购单据不能进行续费操作
        //     return false;
        // }
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
            const addGoodsRes = this.goodsfindsubmit(barcode, price, null, flow_no);
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
                                    vipcardlogin: true,
                                    isJFXH: isJFXH
                                })
                            }))
                        } else {
                            this.initState();
                            this.addGoodsCallback(res);
                            this.setState({
                                flow_no: flow_no,
                                octozz: addValueDjlb,
                                vipcardlogin: true,
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
                    this.addVip(memberId, { idType: '1' }, (params) => addGoodsAction({
                        ...params,
                        flow_no: res.flow_no
                    }), res.flow_no);
                }
            })
        } else {
            this.loginVipModal(createSaleAction, addGoodsAction)
        }
        // RechargeKeypad.open({
        //     title: '會員續費',    //"会员续费",
        //     placeholder: '請輸入續費金額',  //"请输入续费金额",
        //     errMessage: '續費金額必須大於0',  //"续费金额必须大于0",
        //     rule: (num) => {
        //     if (num *1 > 0) {
        //         return true;
        //     }
        //         return false;
        //     },
        //     callback: (num) => {
        //         let addValueDjlb = 'Y11';
        //         const createSaleAction = () => {
        //             return this.createSaleReq(addValueDjlb).then(res => {
        //                 if(res.flag) {
        //                     return res.res;
        //                 } else {
        //                     message('會員續費訂單初始化失敗');
        //                 }
        //             })
        //         }
        //         const addGoodsAction = (vipInfo, flow_no) => {
        //             const addGoodsRes = this.addGoods('6014898', num, flow_no, false);
        //             if(addGoodsRes) {
        //                 return addGoodsRes.then(res => {
        //                     if (res) {
        //                         if (this.state.goodsList.length > 0) {
        //                             return Promise.resolve(this.saveBill(() => {
        //                                 this.addGoodsCallback(res);
        //                                 this.setState({
        //                                     flow_no: flow_no,
        //                                     octozz: addValueDjlb,
        //                                     vipInfo
        //                                 })
        //                             }))
        //                         } else {
        //                             this.initState();
        //                             this.addGoodsCallback(res);
        //                             this.setState({
        //                                 flow_no: flow_no,
        //                                 octozz: addValueDjlb,
        //                                 vipInfo
        //                             })
        //                         }
        //                         return true
        //                     }
        //                 })
        //             }
        //         }
        //         if(this.state.vipInfo && this.state.vipInfo.memberId) {
        //             const memberId = this.state.vipInfo.memberId;
        //             return createSaleAction().then(res => {
        //                 if(res) {
        //                     this.addVip(memberId, {idType: '1'}, (vipInfo) => addGoodsAction(vipInfo, res.flow_no) , res.flow_no);
        //                 }
        //             })
        //         } else {
        //             this.loginVipModal(createSaleAction, addGoodsAction)
        //         }
        //         return false;
        //     }
        // })
    }

    //八达通充值
    rechargeCard = () => {
        if (this.state.octozz && this.state.octozz === 'Y11') {
            message('會員續費單據不能進行八達通增值操作'); // 会员续费单据不能进行八达通增值操作
            return false;
        }
        if (this.state.octozz && this.state.octozz === 'Y10') {
            message('會員入會單據不能進行八達通增值操作'); // 会员入会单据不能进行八达通增值操作
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
                        const addGoodsRes = this.priceGoodsAdd('12952701', num, res.res.flow_no);
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

    callChange = (e) => {
        this.setState({ callValue: e.target.value })
    }

    //呼叫信息
    callConfirm = () => {
        let callInfo = this.props.initialState.data.poscallinfo
        let that = this
        const radioStyle = {
            display: 'block',
            height: '30px',
            lineHeight: '30px',
        };
        confirm({
            title: '呼叫信息',
            content:
                <RadioGroup onChange={this.callChange}>
                    {callInfo.map(item =>
                        <Radio style={radioStyle} value={item.code}
                            key={item.code}>{item.text}</Radio>)
                    }
                </RadioGroup>,
            okText: '確認',
            cancelText: '取消',
            onOk() {
                that.callHandle()
            },
            onCancel() {
            },
        });
    }

    callHandle = () => {
        let { callValue } = this.state
        let callInfo = this.props.initialState.data.poscallinfo
        if (!!callValue) {
            let text = callInfo.find(v => v.code === callValue).text
            let req = {
                code: this.state.callValue,
                text: text,
                caller: this.props.operator && this.props.operator.gh,
                mkt: this.props.initialState.mkt,
                erpCode: this.props.initialState.erpCode,
                command_id: 'RECEIVECALLINFO',
                syjh: this.props.initialState.syjh,
            }
            this.props.pAction.callSubmit(req).then(res => {
                if (res) {
                    message('呼叫成功')
                }
            })
        } else {
            message('請選擇呼叫信息!')
        }
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
            window.Log(ejoural, '1')
        }
        if (this.state.posrole.cashboxqx !== 'Y') {
            React.accredit(posrole => {
                if (posrole.cashboxqx === 'Y') {
                    openCashboxFn(posrole.cardno);
                } else {
                    message(intl.get("INFO_AUTHFAIL"))   //'授权失败：无此权限'
                }
            }/*, null, { flow_no: this.state.flow_no }*/)
            return
        }
        openCashboxFn();
    }

    //会员入会 @type 1:普通会员入会 2:app会员入会
    applyVip = (type) => {
        if (this.state.octozz && this.state.octozz === 'Y10' && this.state.goodsList.length > 0) {
            //message(intl.get('INFO_ADDVALUENODUP')); // 八达通增值商品不可重复添加
            message('會員申請不可重複添加'); // 会员申请不可重复添加
            return false;
        }
        if (this.props.humanIntervention || this.props.initialState.online == '0') {
            message("脫機狀態不支持此功能");
            return false
        }
        if (this.state.octozz && this.state.octozz === 'Y11') {
            message('會員續費單據不能進行入會操作'); // 会员续费单据不能进行入会操作
            return false;
        }
        if (this.state.octozz && this.state.octozz === 'Y3') {
            message('八達通增值單據不能進行入會操作'); // 八达通增值单据不能进行入会操作
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
                        operators: this.props.operator && this.props.operator.gh,
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
                            }
                            ;
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
        // let addValueDjlb = 'Y10',
        //     price,
        //     memberId,
        //     barcode;
        // let applyVipFunc = () => {
        //     this.createSaleReq(addValueDjlb).then(res => {
        //         if(res.flag) {
        //             const {mkt, syjh, amcNO} = this.props.initialState;
        //             this.props.actions.applyVip({
        //                 operators: this.props.operator && this.props.operator.gh,
        //                 flow_no: res.res.flow_no,
        //                 mkt: mkt,
        //                 syjh: syjh,
        //                 price: price,
        //                 memberId: memberId,
        //                 joinCusType: type,
        //                 barcode: barcode,
        //                 memberActionSno: mkt.substring(mkt.length - 2) + syjh + amcNO
        //             }).then(response => {
        //                 if(response) {
        //                     if (this.state.goodsList.length > 0) {
        //                         this.saveBill(() => {
        //                             this.addGoodsCallback(response);
        //                             this.setState({
        //                                 flow_no: res.res.flow_no,
        //                                 octozz: addValueDjlb,
        //                                 addGoodsTime: moment().format('DD/MM/YYYY HH:mm:ss'),
        //                                 vipInfo: {
        //                                     memberId: response.memberId || memberId
        //                                 }
        //                             })
        //                         });
        //                     } else {
        //                         this.initState();
        //                         this.addGoodsCallback(response);
        //                         this.setState({
        //                             flow_no: res.res.flow_no,
        //                             octozz: addValueDjlb,
        //                             addGoodsTime: moment().format('DD/MM/YYYY HH:mm:ss'),
        //                             vipInfo: {
        //                                 memberId: response.memberId || memberId
        //                             }
        //                         })
        //                     };
        //                 }
        //             })
        //         }
        //     })
        // }
        // RechargeKeypad.open({
        //     title: '會費金額',    //"新申请会员",
        //     placeholder: '請輸入會費金額',  //"请输入会费金额",
        //     errMessage: '會費金額必須大於0',  //"续费金额必须大于0",
        //     rule: (num) => {
        //         if (num *1 > 0) {
        //             return true;
        //         }
        //         return false;
        //     },
        //     callback: (num) => {
        //         price = num;
        //         if(type === '1') {
        //             barcode = '694';
        //             const com = (data) => {
        //                 memberId = data;
        //                 applyVipFunc();
        //                 RechargeKeypad.close();
        //             }
        //             RechargeKeypad.open({
        //                 title: '新申請會員',    //"新申请会员",
        //                 placeholder: '請輸入會員卡號或刷會員卡',  //"请输入会员卡号或刷会员卡",
        //                 callback: (num) => {
        //                     memberId = num;
        //                     applyVipFunc();
        //                 },
        //                 event: {
        //                     chooseEvent: () => {
        //                         EventEmitter.on('Com', com)
        //                     },
        //                     cancelEvent: () => {
        //                         EventEmitter.off('Com', com)
        //                     }
        //                 }
        //             })
        //             return false;
        //         }
        //         if(type === '2') {
        //             EasyPay.open({
        //                 title: 'APP入會',
        //                 onOk: (qrcode) => {
        //                     console.log(qrcode.length);
        //                     qrcode = qrcode.trim();
        //                     memberId = qrcode.substring(0,16);
        //                     barcode = qrcode.substring(qrcode.length - 7)
        //                     applyVipFunc();
        //                 }
        //             })
        //         }
        //     }
        // })
    }

    //脱机联网弹窗
    onlineofflineModel = () => {
        var _this = this;
        Modal.confirm({
            title: _this.props.initialState.online == 1 ? intl.get("MENU_OFFLINE") : intl.get("MENU_ONLINE"),
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
            if (res.retflag === "0") {
                // this.setState({pause: true});
            } else {
                message(res.retmsg);
            }
        }).catch(err => {
            console.log(err);
        });
    }

    //脱网联机
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
                                        if (_this.state.havedata == 1) {
                                            Modal.confirm({
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
                if (this.props.initialState.online == 1) {
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
                    this.props.actions.online(req).then(
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
                                            if (_this.state.havedata == 1) {
                                                Modal.confirm({
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

    //重新获取整单
    repullSale = () => {
        this.props.pAction.getBillDetail({
            mkt: this.props.initialState.mkt,
            syjh: this.props.initialState.syjh,
            flow_no: this.state.flow_no,
            operators: this.props.operators
        }).then(res => {
            if (res) {
                res.goodslist = res.goodlist;
                res.zddsctotal = res.totaldsc;
                res.zdsjtotal = res.total;
                if (res.memberInfo && res.memberInfo.memberId) {
                    this.setState({
                        vipInfo: res.memberInfo,
                        vipcardlogin: true,
                    })
                } else if (res.viptype == '02') {
                    let memberInfo = {
                        memberId: res.vipid,
                        vipcardlogin: true,
                    }
                    this.setState({
                        vipInfo: memberInfo
                    })
                } else {
                    this.setState({
                        vipInfo: {}
                    })
                }
                if (res.staffCardNo) {
                    const { staffCardNo, staffType, staffNo } = res;
                    this.setState({
                        staffcard: staffCardNo ? {
                            cardNo: staffCardNo,
                            staffNo,
                            cardType: staffType
                        } : '',
                        staffcardlogin: true,
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
            }
        })
    }

    menuFilter = (menuList) => {
        switch (this.props.presale.djlb) {
            //普通销售
            case '1':
                if (/*this.state.easyPay*/ false) {
                    return menuList.filter(i => i.code === '201');
                }
                return menuList;
            //练习销售
            case 'Y7':
                return menuList.filter(i => i.code === '201' || i.code === '202' || i.code === '203' || i.code === '204' || i.code === '205');
            default:
                return menuList
        }
    }

    //刷新商品列表 @res接口返回的数据 @index传入index只替换单行(取消这个参数),否则替换全部 @qty修改的数量
    replaceGoodsList = (res, qty) => {
        let { goodsList, totalData, uidlist, pagination } = this.state;
        let { goodslist, good } = res;
        /*if (index !== undefined) {
            let newGood = {};
            if (goodslist) {
                newGood = goodslist[index];
            }
            if (good) {
                newGood = good;
            }
            goodsList[index] = newGood;
        } else {
            goodsList = goodslist
        }*/
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
        totalData.price = res.zdyftotal;
        totalData.dsctotal = res.zddsctotal;
        totalData.sjtotal = res.zdsjtotal; 
        pagination.total = goodsList.length;
        pagination.current = Math.ceil(goodsList.length / pagination.pageSize);
        uidlist = goodslist.map(item => item.guid).join(',');
        // console.log(goodsList, 9999999999);
        this.setState({ goodsList, totalData, uidlist, pagination });
    }

    addGoodsCallback = (res) => {
        console.log("addGoodsCallback======", res)
        const { goodslist, zdyftotal, zddsctotal, zdsjtotal } = res;
        let { goodsList, totalData, pagination, addGoodsTime, uidlist } = this.state;
        goodsList.push(goodslist[0]);
        //this.calculateTotal(totalData, res[0], res[0].qty * 1);
        totalData.num += goodslist[0].qty;
        totalData.price = zdyftotal;
        totalData.discounts = zddsctotal;
        totalData.sjtotal = zdsjtotal;
        uidlist === '' ? uidlist = goodslist[0].guid : uidlist = uidlist + ',' + goodslist[0].guid;
        pagination.total = goodsList.length;
        //新增商品是自动翻页到最后一页
        pagination.current = Math.ceil(goodsList.length / pagination.pageSize);
        if (addGoodsTime === "") {
            addGoodsTime = moment().format('DD/MM/YYYY HH:mm:ss');
        }
        this.setState({
            goodsList,
            totalData,
            pagination,
            addGoodsTime,
            uidlist
        });
        //新增商品是自动翻页到最后一页
        window.audioPlay(true);
        // window.LineDisplay({type:1, data:[(goodslist[0].ysje *1).toFixed(1), (zdsjtotal*1).toFixed(1)]});
        //window.Log(`  1 ${goodslist[0].incode}   ${goodslist[0].qty}@    ${(goodslist[0].price *1).toFixed(2)}     ${(goodslist[0].ysje *1).toFixed(2)} (${goodslist[0].category})`,'1')
        this.handleEjoural(goodslist[0], 0);
    }

    //全日通
    oneDayPassport = (params) => {
        if (!params) {
            console.log(this.state.vipInfo);
            if (!this.state.vipInfo || !this.state.vipInfo.memberId) {
                message(intl.get("ONEDAYPASSPORT_VIP"))   //'全日通使用必须先登录会员'
                return false;
            }
            if (this.state.staffcardlogin === true || this.state.staffcard !== '') {
                message('員工卡不允許使用全日通')
                return false;
            }
        }
        if(!this.state.oneDayPassportModal) {
            EventEmitter.off('Scan', this.scan);      
        }else{
            EventEmitter.on('Scan', this.scan);                  
        }
        if (params && params !== 'cancel') {
            // 2017432 2017457   
            this.props.pAction.addOneDayPassport({
                mkt: this.props.initialState.mkt,
                syjh: this.props.initialState.syjh,
                flow_no: this.state.flow_no,
                operators: this.props.operators,
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


    //单行折扣
    discountGoods = (zkl, guid, callback) => {
        zkl = 100 - zkl * 1;
        let params = {
            operators: this.props.operators,
            mkt: this.props.initialState.mkt,
            syjh: this.props.initialState.syjh,
            flow_no: this.state.flow_no,
            sqkh: '1',
            isbreak: '1',
            zkl, guid
        };
        this.props.actions.discountGoods(params).then(res => {
            if (res) {
                callback.resolve('success');
                let { totalData, goodsList, editIndex } = this.state;
                // goodsList[editIndex] = res.goodslist[editIndex];
                this.replaceGoodsList(res);
                this.handleEjoural(res.goodslist[editIndex], 6);
                this.calculateData(totalData, goodsList);
                this.setState({totalData, keyboardState: false });
            } else {
                callback.resolve();
            }
        }).catch(e => {
            callback.resolve();
        })
    }

    //单行折让
    rebateGoods = (zre, guid, callback) => {
        let params = {
            operators: this.props.operators,
            mkt: this.props.initialState.mkt,
            syjh: this.props.initialState.syjh,
            flow_no: this.state.flow_no,
            sqkh: '1',
            isbreak: '1',
            zre, guid
        };
        return this.props.actions.rebateGoods(params).then(res => {
            if (res) {
                callback.resolve('success');
                let { totalData, goodsList, editIndex } = this.state;
                // goodsList[editIndex] = res.goodslist[editIndex];
                this.replaceGoodsList(res);
                this.handleEjoural(res.goodslist[editIndex], 7);
                this.calculateData(totalData, goodsList);
                this.setState({ totalData, keyboardState: false });
            } else {
                callback.resolve();
            }
        }).catch(e => {
            callback.resolve();
        });
    }

    //美食修改
    modifyProperty = (methodName, value, callback = () => {
    }, isPackage) => {
        let { goodsList, editIndex } = this.state;
        let goods = goodsList[editIndex];
        console.log('goods', goods);
        let verify = new Promise((resolve, reject) => {
            resolve();
        });
        if (methodName === "zrl" && goods.tempZkDiscount !== 0) {
            message(this.intl("INFO_CNOTZK"));
            return verify;
        } else if (methodName === "zkl" && goods.tempZrDiscount !== 0) {
            message(this.intl("INFO_CNOTZR"));
            return verify;
        }
        switch (methodName) {
            case "edit":
                goods.key = editIndex;
                goods.isPackage = isPackage
                if (this.state.totalData.num + (value - this.state.goodsList[this.state.editIndex].qty) >
                    this.props.initialState.Syspara.maxSaleGoodsQuantity * 1) {
                    message(`${intl.get("INFO_GOODSQTYMAX")}${this.props.initialState.Syspara.maxSaleGoodsQuantity}`);
                    return false;
                }
                this.editGoods(goods, value, callback, isPackage);
                break;
            case "zkl":
                return new Promise((resolve, reject) => {
                    callback = { resolve, reject };
                    this.discountGoods(value, goods.guid, callback);
                });
            case "zrl":
                return new Promise((resolve, reject) => {
                    callback = { resolve, reject };
                    this.rebateGoods(value, goods.guid, callback);
                });
            default:
                console.log("没有找到匹配的");
        }
    }

    //数据重新计算
    calculateData = (totalData, goodsList) => {
        for (let key in totalData) {
            totalData[key] = 0;
        }
        goodsList.map(item => {
            totalData.num += item.qty;
            totalData.price += item.total;
            totalData.dsctotal += item.dsctotal;
            totalData.sjtotal += item.ysje;
        });
    }

    //@item商品信息 @type 0添加 1删除 2修改数量 3取消整单 4小票复制、快付通 5修改价格 6单行折扣 7单行折让
    // 8整单折扣 9整单折让 10挂单 11解挂 12会员登录、登出
    handleEjoural = (item, type) => {
        let titleTxt = '';
        if (type === 11) {
            //解挂
            titleTxt += `      【 取 消 暫 存 交 易 資 料 】\r\n`;
        }
        titleTxt += `SHOP ${this.props.initialState.mkt}/${this.props.initialState.syjh}  REF ${this.props.initialState.syjh + this.props.initialState.fphm}  ${moment().format('DD/MM/YY')}\r\nOPERATOR ${this.props.operator.gh}  ${moment().format('HH:mm:ss')}`;
        //联系模式
        if (this.props.presale.djlb === 'Y7') {
            titleTxt += ' [練習模式]';
        }
        //补齐空位
        const fillLength = (num, n) => (num + '').length < n ? (Array(n).join(" ") + num).slice(-n) : num
        const addTxt = (item, index) => {
            let txt = `${fillLength(index, 3)}${item.incode.length === 3 ? '   $$$' + item.incode + ' ' : fillLength(item.incode, 10)}${fillLength(item.qty, 4)}@${fillLength((item.price * 1).toFixed(2), 9)}${fillLength((item.dsctotal ? item.total * 1 : item.ysje * 1).toFixed(2), 10)} (${item.category})`
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
                window.Log(`${fillLength(index + 1, 4)}  <-- THIS LINE VOID ${fillLength('-' + (ejouralList[index].ysje * 1).toFixed(2), 12)} ${this.props.operator.gh}`, '1');
                ejouralList[index] = {};
                break;
            //修改数量
            case 2:
                ejouralList.push(item);
                window.Log(`${fillLength(index + 1, 4)}  <-- THIS LINE QTY  ${fillLength('-' + (ejouralList[index].ysje * 1).toFixed(2), 12)} ${this.props.operator.gh}\r\n${addTxt(item, ejouralList.length, 3)}`, '1');
                ejouralList[index] = {};
                break;
            //取消整单
            case 3:
                window.Log(`CANCEL    ${this.state.octozz === 'Y3' ? '' : fillLength('-' + (item.totalPrice * 1).toFixed(2), 27)} \r\n**************************************`, '1');
                break;
            //小票复制 快付通 解挂
            case 4:
            case 11:
                ejouralList = [...item];
                let ejouralTxt = titleTxt;
                item.forEach((_item, _index) => {
                    ejouralTxt += `\r\n${addTxt(_item, _index + 1, 3)}`
                })
                /*if(tempZzk: 100,
                tempZzr: 0)*/
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
                window.Log(`${fillLength(index + 1, 4)}  <-- THIS LINE PRICE${fillLength('-' + (ejouralList[index].ysje * 1).toFixed(2), 12)} ${this.props.operator.gh}\r\n${addTxt(item, ejouralList.length)}`, '1');
                ejouralList[index] = {};
                break;
            //单行折扣%
            case 6:
            //单行折让$
            case 7:
                ejouralList.push(item);
                window.Log(`${fillLength(index + 1, 4)}  <-- THIS LINE DISC ${fillLength('-' + (ejouralList[index].ysje * 1).toFixed(2), 12)} ${this.props.operator.gh}\r\n${addTxt(item, ejouralList.length)}`, '1');
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
            /*window.Log(`--------------------------------------\r\n       【 取 消 暫 存 交 易 資 料 】\r\n暫存總計:${fillLength((item.totalPrice*1).toFixed(2),10)}     件數:${fillLength(item.num,10)}\r\n暫存日期:${fillLength(moment().format('DD/MM/YY'),10)}     時間:${fillLength(item.time,10)}\r\n編號:   ${item.flow_no}\r\n--------------------------------------`,'1');*/
            //break;
            //会员登录 登出
            case 12:
                if (ejouralList && ejouralList.length > 0) {
                    let vipTxt = "";
                    ejouralList.forEach((_item, _index) => {
                        if (_item.guid) {
                            vipTxt += `${fillLength(_index + 1, 4)}  <-- THIS LINE VOID ${fillLength('-' + (_item.ysje * 1).toFixed(2), 12)} ${this.props.operator.gh}\r\n`
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
    }

    // //添加会员
    // addVip = (vipNo, vipOption, certifytype) => {
    //     let req = {
    //         // // operator: this.props.operator ,
    //         // operators: this.props.operators,
    //         // // flow_no: this.state.flow_no,
    //         // flow_no: this.state.flow_no,
    //         // vipno: vipNo, //'83010113',
    //         // certifytype: 'ERP',
    //         // mkt: this.props.initialState.mkt,
    //         // syjh: this.props.initialState.syjh,
    //         // idtype: vipOption.idType, //会员ID类型 1-卡号 2-手机号 A-磁道 B-二维码 C-CID
    //         // channel: 'javapos',
    //         operators: this.props.operators,
    //         flow_no: this.state.flow_no,
    //         memberId: vipNo || this.state.vipInfo.memberId,
    //         certifytype: certifytype || "ERP",
    //         mkt: this.props.initialState.mkt,
    //         syjh: this.props.initialState.syjh,
    //         idtype: !certifytype && vipOption.idType,
    //     };
    //     if (vipOption.idType) {
    //         req.idtype = vipOption.idType
    //     }
    //     if (vipOption.certifytype) {
    //         req.certifytype = vipOption.certifytype
    //     }
    //     return this.props.actions.vip(req).then(res => {
    //         if (res && res.memberInfo) {
    //             this.setState({vipInfo: res.memberInfo, vipcardlogin: true})
    //         }
    //         return res;
    //     });
    // }

    //添加会员 @flow_no 表示续费的会员登录
    addVip = (vipNo, vipOption, callback, flow_no) => {
        let req = {
            operators: this.props.operators && this.props.operators.gh,
            flow_no: flow_no || this.state.flow_no,
            memberId: vipNo, //'83010113',
            certifytype: 'ERP',
            mkt: this.props.initialState.mkt,
            syjh: this.props.initialState.syjh,
            //idtype: vipOption.idType, //会员ID类型 1-卡号 2-手机号 A-磁道 B-二维码 C-CID
            //channel: 'javapos',
            //authScene: 'PLACEORDER',
        };
        if (vipOption.idType) {
            req.idtype = vipOption.idType
        }
        if (vipOption.certifytype) {
            req.certifytype = vipOption.certifytype
        }
        //会员续费单据
        if (flow_no || this.state.octozz === 'Y10' || this.state.octozz === 'Y11') {
            const { mkt, syjh, amcNO } = this.props.initialState;
            req.memberActionSno = mkt.substring(mkt.length - 2) + syjh + amcNO
        }
        this.props.pAction.vip(req).then(res => {
            if (res) {
                //const { vipid, viptype, trgs, vipno, jfgrade } = res;
                //const vipInfo = { vipid, viptype, trgs, vipno, jfgrade };
                //this.setState({ vipInfo })
                const { memberInfo, promptMessage } = res;
                this.setState({ vipcardlogin: memberInfo ? true : false });
                if (flow_no) {
                    // continueIntegral; 续费积分
                    // continueMoney; 续会金额
                    // continueBarCode; 续会商品码
                    // integralBarCode; 续会积分商品码
                    const { continueIntegral, continueMoney, continueBarCode, integralBarCode } = res;
                    if (callback && continueBarCode && integralBarCode) {
                        if (memberInfo && continueIntegral && memberInfo.bonusPointLastMonth - memberInfo.bonusPointUsed > continueIntegral) {
                            Modal.confirm({
                                title: '提示',
                                iconType: "exclamation-circle",
                                content: '是否積分續會？',
                                width: 500,
                                className: 'vla-confirm',
                                okText: '積分續會',
                                cancelText: '現金續會',
                                onOk: () => {
                                    callback({
                                        vipInfo: memberInfo,
                                        barcode: integralBarCode,
                                        price: continueMoney,
                                        isJFXH: true
                                    });
                                },
                                onCancel: () => {
                                    callback({
                                        vipInfo: memberInfo,
                                        barcode: continueBarCode,
                                        price: continueMoney,
                                        isJFXH: false
                                    });
                                }
                            });
                        } else {
                            callback({
                                vipInfo: memberInfo,
                                barcode: continueBarCode,
                                price: continueMoney,
                                isJFXH: false
                            });
                        }
                        //callback(memberInfo);
                    } else {
                        message(res.retmsg);
                    }
                } else {
                    if (res.retflag !== "1003" && res.retflag !== "1004") {
                        this.setState({
                            vipInfo: memberInfo || {},
                            vipCardNo: vipNo || '',
                            tempVip: false,
                        })
                        if (res.goodslist && res.goodslist.length > 0) {
                            this.replaceGoodsList(res);
                            this.handleEjoural(res.goodslist, 12)
                        }
                        if (promptMessage && res.retflag !== "1002") {
                            message(promptMessage);
                        }
                    }
                    if (callback) {
                        callback();
                    }
                }
                //非会员续费单据 过期会员提示续费
                if ((res.retflag === "1002" || res.retflag === "1003") && !flow_no && this.state.octozz !== 'Y10' && this.state.octozz !== 'Y11') {
                    let flag;
                    try {
                        flag = this.props.initialState.data.touchpostemplate.presskeys.find(item => item.sale).sale.find(item => item.code === '228')
                    } catch (err) {
                        console.log(err);
                    }
                    if (flag) {
                        Modal.confirm({
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
                        message(res.promptMessage || 'AEON MEMBER CARD會籍已過期，請續會以續享會員積分及其他會員優惠！');
                    }
                }
                if (res.retflag === "1004") {
                    message(res.promptMessage);
                }
            }
        })
    }

    accredit = (roleKey, callback) => {
        let role = this.props.data.posrole[roleKey];
        console.log('role', role);
        if (!(role === "Y" || role >= 100)) {
            React.accredit(posrole => {
                console.log('posrole', typeof posrole, posrole, posrole[roleKey]);
                if (!(posrole[roleKey] !== "Y" || posrole[roleKey] < 100)) {
                    callback(posrole);
                } else {
                    message(this.intl("INFO_AUTHFAIL"));
                }
            }, null, { flow_no: this.state.flow_no });
        } else {
            callback(this.props.data.operuser.posrole);
        }
    }

    //退出会员
    cancelVip = () => {
        if (this.state.octozz && this.state.octozz === 'Y10') {
            message('會員入會訂單無法登出會員');
            return false;
        }
        return this.addVip('', {}, 'CANCEL').then((data) => {
            if (data.retflag === "0") {
                this.setState({
                    vipInfo: {},
                    vipcardlogin: false
                });
            } else {
                message("登出會員異常");
            }
        });
    }


    //员工购物
    staffshopping = () => {
        if (this.props.initialState.JRRQ) {
            return message("吉日不容許使用此功能！");
        }
        if (this.state.vipInfo.memberId || this.state.staffcard) {
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
                callback: (value, idType) => this.inputStaffCode('staff', value, () => {
                }, { idType }),
                event: {
                    chooseEvent: () => {
                        EventEmitter.on('Com', com)
                        EventEmitter.on('Scan', com)
                        EventEmitter.off('Scan', this.scan);                     
                    },
                    cancelEvent: () => {
                        EventEmitter.off('Com', com)
                        EventEmitter.off('Scan', com)
                        EventEmitter.on('Scan', this.scan);
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
        return this.props.pAction.staff(req).then(res => {
            console.log(res);
            const clear = {}
            this.props.pAction.addstaffcardno(clear);
            this.setState({
                staffcard: '',
                staffcardlogin: false,
            })
        });
    }

    addStaff = (value, vipOption, callback) => {
        if (value.length > 0) { //7位员工卡 17位家属卡
            if (vipOption) {
                let req = {
                    mkt: this.props.initialState.mkt,
                    staffNo: '',
                    // cardNo: value,//9901976
                    cardNo: value.slice(0, 1) == 'J' ? value.slice(1) : value,
                    flow_no: this.state.flow_no,
                    erpCode: this.props.initialState.erpCode,
                };
                this.props.pAction.staff(req).then(res => {
                    console.log(res)
                    if (res) {
                        if (res.cardType == 1 || res.cardType == 2) {
                            if (res.cardNo == this.props.operator.cardno) {
                                message(intl.get("INFO_STAFFCONFLICT")); //员工卡号与当前收银员冲突
                            } else if (res.cardNo || res.staffNo) {
                                this.props.pAction.addstaffcardno(res);
                                this.setState({
                                    staffcard: res,
                                    staffcardlogin: true,
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
        // else{
        //     message(intl.get("INFO_STAFFCARDERROR"))
        // }
    }


    //输入商品编码查询商品
    //@tag操作类型goods/vip @value输入框的内容 @whichEvent键盘事件
    inputCode = (tag, value, whichEvent, callback, vipOption) => {
        if (whichEvent === 13) {
            if (!value && !vipOption.certifytype) {
                return false;
            }
            if (tag === 'vip') {
                if (!value && !vipOption.certifytype) {
                    message('會員卡號或手機號不能為空')
                    return false;
                }
                if (vipOption && vipOption.certifytype) {
                    if (this.state.octozz && this.state.octozz === 'Y10') {
                        message('會員入會訂單無法登出會員');
                        return false;
                    }
                }
                this.addVip(value, vipOption, callback);
            }
        }
    }

    //返回首頁
    goBack = () => {
        let { goodsList } = this.state;
        if (goodsList.length === 0) {
            this.props.pAction.init();
            this.props.history.push("/home");
        } else {
            message(this.intl("INFO_CANNOTBACK"));
        }
    }

    //查询套餐
    findPackage = (sgsId) => {
        let req = {
            "operators": this.props.operators,
            "flow_no": this.state.flow_no,
            "syjh": this.props.initialState.syjh,
            "ssgId": sgsId,
            "mkt": this.props.initialState.mkt
        }
        this.props.actions.findPackage(req).then(res => {
            if (res) {
                res.mealGoods.forEach((item, idx) => {
                    item.key = idx
                })
                this.setState({
                    goodsCode: res.mealGoods[0].goodsCode,
                    mealGoods: res.mealGoods,
                    mealSalePrice: res.mealSalePrice,
                    windowsState: true,
                    keyboardState: false
                })
            }
        })
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
        if (this.state.goodsList.length === 0) {
            message(this.intl("INFO_GOODSLISTCNOT"));
            return false
        }
        const { djlb } = this.props.presale;
        let billKey = '';
        if (djlb === 'Y7') {
            billKey = "practice";
        } else {
            billKey = "square";
        }
        let saveBillAction = () => {
            this.props.billAction({
                type: 0,
                key: billKey,
                data: {
                    no: this.state.flow_no,
                    time: moment().format('HH:mm:ss'),
                }
            });
            this.handleEjoural({
                ...this.state.totalData,
                time: moment().format('HH:mm:ss'),
                flow_no: this.state.flow_no
            }, 10)
            if (this.props.initialState.Syspara.isPrintGd === 'Y') {
                let generateStallInfo = (goods) => {
                    let stallArr = [], stallInfo = [], newGoods = [],
                        noExist = [];
                    goods.forEach(item => item.stallCode ? stallArr.push(item.stallCode) : noExist.push(item)); //code数据目前有问题,所以这样写
                    stallArr = new Set(stallArr); //去除重复code
                    stallArr = Array.from(stallArr);

                    stallArr.forEach(code => {
                        let info = {}, goodsList, stall;
                        stall = this.props.initialState.data.stallhotkeytemplate.stallGoods.find(item => item.stallCode === code);
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
                    return { stallInfo, newGoods };
                };

                let stallInfo = generateStallInfo(this.state.goodsList);
                window.Print({
                    Module: 'MS_ZC',
                    head: [{
                        mkt: this.props.initialState.mkt,//门店号
                        syyh: this.props.operator && this.props.operator.gh,//收银员
                        printtype: "0", //0代表热敏打印，1代表平推
                        rqsj: moment().format('DD/MM/YYYY HH:mm:ss'),//交易时间
                        mktname: this.props.initialState.data.mktinfo && this.props.initialState.data.mktinfo.mktname,//门店号名称
                        address: this.props.initialState.data.mktinfo && this.props.initialState.data.mktinfo.address,  //门店地址
                        phone: this.props.initialState.data.mktinfo && this.props.initialState.data.mktinfo.telephone,
                        refno: this.props.initialState.syjh + this.props.initialState.fphm,
                        sjfk: this.state.totalData.price,
                        ysje: this.state.totalData.sjtotal,
                        hjzsl: this.state.totalData.num,
                        endTime: '23:59:59',
                        number: this.state.flow_no,
                        syjh: this.props.initialState.syjh,
                        stallInfo: stallInfo.stallInfo,
                        barcodeString: this.state.flow_no,
                        djlb: djlb,
                    }],
                    goods: stallInfo.newGoods.map((item, key) => {
                        item.idnum = key + 1;

                        let categoryPropertys = [], spliceData = '';
                        item.categoryPropertys.forEach(data => { //合并商品属性
                            if (!data.isGoods && categoryPropertys.length === 0 && !spliceData) { //判断是否是主商品属性
                                item.fname = item.fname + '  ' + data.propertyName;
                            } else {
                                if (data.isGoods) {//判断是否是属性
                                    if (spliceData) {
                                        categoryPropertys.push(spliceData);
                                        spliceData = '';
                                    }
                                    spliceData = data;
                                } else {
                                    spliceData.propertyName = spliceData.propertyName + '  ' + data.propertyName;
                                }
                            }
                        });
                        item.categoryPropertys = categoryPropertys;
                        return item;
                    })
                });

            }
            this.props.updateXPH();
            message(this.intl("INFO_ORDERSAVESUCC"));
            let { totalData } = this.state;
            for (let key in totalData) {
                totalData[key] = 0;
            }
            this.setState({ goodsList: [], totalData }, () => {
                if (callback) {
                    callback()
                } else {
                    this.createSale();
                }
            });
        }
        if (this.state.posrole.putbillqx === 'Y' || this.state.posrole.putbillqx === 'A') {
            saveBillAction();
            return;
        }
        React.accredit(posrole => {
            if (posrole.putbillqx === 'Y' || posrole.putbillqx === 'A') {
                saveBillAction();
            } else {
                message(intl.get("INFO_AUTHFAIL"))   //'授权失败：无此权限'
            }
        })
    }

    //获取整单
    getBillDetail = (flow_no) => {
        return this.props.actions.getBillDetail({
            operators: this.props.operator && this.props.operator.gh,
            syjh: this.props.initialState.syjh,
            flow_no,
            mkt: this.props.initialState.mkt,
        })
    }

    loseBill = (type, data, detail) => {
        let { djlb } = this.props.presale;
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
        if (djlb === 'Y7') {
            billKey = "practice";
        } else {
            billKey = "square";
        }
        switch (type) {
            case 'cancel':
                this.setState({ billListModal: false });
                break;
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
                if (this.state.posrole.privqt3 === 'Y') {
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
            case 'unlock':
                let unlockAction = () => {
                    sendLogReq.logtype = 18;
                    sendLogReq.rowno = data[0].no;
                    this.props.billAction({
                        type: 1,
                        key: billKey,
                        data: data
                    }, djlb === 'Y7' ? null : sendLogReq, () => {
                        let num = 0, uidlist = '', shoppingInfo = {};
                        if (detail.memberInfo && detail.memberInfo.memberId) {
                            shoppingInfo.vipInfo = detail.memberInfo;
                            shoppingInfo.vipcardlogin = true;
                        } else if (detail.viptype == '02') {
                            shoppingInfo.vipInfo = { memberId: detail.vipid };
                            shoppingInfo.vipcardlogin = true;
                        } else if (detail.staffCardNo) {
                            if (detail.cardNo) {
                                let { cardNo, cardType, creditCardNo } = detail;
                                shoppingInfo.staffcard = {
                                    cardNo,
                                    cardType,
                                    creditCardNo
                                };
                            } else {
                                let { staffCardNo: cardNo, staffType: cardType, staffNo: creditCardNo } = detail;
                                shoppingInfo.staffcard = {
                                    cardNo,
                                    cardType,
                                    creditCardNo
                                };
                            }
                            shoppingInfo.staffcardlogin = true;
                        }
                        detail.goodlist.forEach((v, k) => {
                            if (v.goodsType === '9') {
                                v.isPackage = true
                            }
                            num += v.qty;
                            uidlist = !uidlist ? detail.goodlist[k].guid : uidlist + ',' + detail.goodlist[k].guid;
                        })
                        let pagination = this.state.pagination;
                        pagination.total = detail.goodlist.length;
                        pagination.current = 1;
                        this.setState({
                            goodsList: detail.goodlist,
                            totalData: {    //合计数据
                                num: num,
                                sjtotal: detail.total,
                                dsctotal: detail.totaldsc,
                                price: detail.zdyftotal,
                            },
                            flow_no: detail.flow_no,
                            tempZzk: detail.tempZzk,
                            tempZzr: detail.tempZzr,
                            pagination,
                            addGoodsTime: moment().format('DD/MM/YYYY HH:mm:ss'),
                            uidlist,
                            ...shoppingInfo
                        })
                        this.handleEjoural(detail.goodlist, 11)
                        this.setState({ billListModal: false });
                    })

                }
                unlockAction();
                // if(this.state.posrole.putbillqx === 'Y' || this.state.posrole.putbillqx ==='B') {
                //     unlockAction();
                //     return true;
                // }
                // React.accredit(posrole => {
                //     if (posrole.putbillqx === 'Y' || posrole.putbillqx ==='B') {
                //         unlockAction();
                //     } else {
                //         message(intl.get("INFO_AUTHFAIL"))   //'授权失败：无此权限'
                //     }
                // })
                break;
            default:
                return false;
        }

    }

    //解挂
    searchBill = () => {
        if (this.state.goodsList.length > 0) {
            message(this.intl("INFO_CNOTSELECTORDER"));
            return false
        }
        this.setState({ billListModal: true })
    }

    //确认套餐
    addPackage = (choice) => {
        let req = {
            "operators": this.props.operators,
            "flow_no": this.state.flow_no,
            "syjh": this.props.initialState.syjh,
            "mkt": this.props.initialState.mkt,
            'type': '3',
            'addModel': '0',
            "choice": choice
        }
        let { goodsList, totalData, uidlist, pagination } = this.state;
        this.props.actions.addPackage(req).then(res => {
            if (res) {
                let goodsInfo = res.goodslist[0];
                // goodsInfo.barcode = goodsCode;
                goodsInfo.isPackage = true
                goodsList.push(goodsInfo);
                this.calculateData(totalData, goodsList);
                this.handleEjoural(goodsInfo, 0);
                uidlist === '' ? uidlist = goodsInfo.guid : uidlist = uidlist + ',' + goodsInfo.guid;
                pagination.total = goodsList.length;
                pagination.current = Math.ceil(goodsList.length / pagination.pageSize);
                window.audioPlay(true)
                this.setState({
                    goodsList,
                    uidlist,
                    totalData,
                    pagination,
                    keyboardState: false,
                    windowsState: false
                });
            }
        })
    }

    //查阅AMC
    searchAMC = (values, callback) => {
        if (!values) {
            this.setState({ searchAMCModal: !this.state.searchAMCModal });
            return false;
        }
        this.props.pAction.vip({
            operators: this.props.operators,
            //vipno: values.vipno, //'83010113',
            certifytype: 'ERP',
            mkt: this.props.initialState.mkt,
            syjh: this.props.initialState.syjh,
            //idtype: values.idType, //会员ID类型 1-卡号 2-手机号 A-磁道 B-二维码 C-CID
            channel: 'javapos',
            ...values
        }).then(res => {
            if (res && callback) {
                callback(res)
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
                    callback: (_dcData) => {
                    }
                })
            }, 300);
        } else {
            message(intl.get("INFO_NOTEMPTYNOCY"));  //商品列表不为空，不可查阅八达通
            return false
        }
    }

    //根据系统参数判断是否添加商品
    addGoodsVerify = () => {
        if (this.state.goodsList.length === this.props.initialState.Syspara.maxSaleGoodsCount * 1) {
            message(`${intl.get("INFO_ROWMAX")}${this.props.initialState.Syspara.maxSaleGoodsCount}`);
            return false;
        }
        if (this.state.totalData.num + 1 > this.props.initialState.Syspara.maxSaleGoodsQuantity * 1) {
            message(`${intl.get("INFO_GOODSQTYMAX")}${this.props.initialState.Syspara.maxSaleGoodsQuantity}`);
            return false;
        }
        return true;
    }

    //重印窗口开关
    onOffPrint = (auth) => {
        if (this.state.goodsList.length !== 0) {
            message(intl.get("INFO_PRINTTIP", { info: '重印' }));//
            return;
        }
        this.setState({
            PrintModal: !this.state.PrintModal
        });
    }

    /******重印代码******/

    /**
     * //重印/副单
     * @param type 映射方法
     * @param data 传递的数据
     * @param authCall 授权后回调方法
     * @returns {*}
     */
    printAgain = (type, data = {}, authCall = () => {
    }) => {
        console.log('printA', data);
        let flag, req;
        if (type === 'forwardPrint' || type === 'batchPrinting') {
            flag = data.goodslist.find(v => v.backPrintNo);
        }
        try {
            switch (type) {
                case 'getOrderList'://获取订单已完成订单
                    req = {
                        mkt: this.props.initialState.mkt,
                        operators: this.props.operators,
                        syyh: this.props.operators,
                        billstatus: '02',
                        ent_id: this.props.initialState.entid,
                        order_field: "createDate",
                        order_direction: "desc",
                        ...data
                    };
                    return this.props.actions.getOrderList(req);
                    break;
                case 'getOrderInfo'://获取单据详情
                    req = {
                        tradeno: '',
                        operators: this.props.operators,//需要废弃
                        mkt: this.props.initialState.mkt,
                        fphm: data.fphm || localStorage.getItem("fphm"), //上一笔缓存号码
                        syjh: data.syjh || this.props.initialState.syjh,
                        flow_no: data.billno || '',
                    };
                    return this.props.actions.getOrderInfo(req);
                    break;
                case 'authorize'://重印授权
                    if (this.state.posrole.privdy === 'Y') {
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
                case 'forwardPrint'://转发打印请求(只打印一张)
                    let { method } = data, _this = this;
                    this.printAgEjoural(data);
                    if (method === 'accessoryPrint') {
                        this[method](data);//副单需要判断副单商品关闭窗口方法在里层
                    } else {
                        if (method === 'slipPrint' || method === 'returnPrint') {
                            authCall({ confirmPrit: true });
                            Modal.success({
                                className: 'vla-confirm',
                                title: '請放入平推紙，然後按確定',
                                content: '',
                                okText: '確定',
                                onOk() {
                                    authCall({ confirmPrit: false });
                                    window.Print(_this[method](data), _this.onOffPrint);
                                }
                            });
                        } else {
                            if (this.props.initialState.data.syjmain[0].isbreadpos !== 'Y' && !!flag && method === 'backPrint') {
                                this.kitchenPrint(data, this.onOffPrint, authCall);
                            } else {
                                window.Print(this[method](data));
                                this.onOffPrint();
                            }
                        }
                    }
                    break;
                case 'batchPrinting': //连续打印多种类型 方法顺序先平推后热敏
                    let methodName = data.method.split(',');//注意字符串逗号后边不能空格
                    let printAction = (times = 0, codeStr = '') => {
                        if (times < methodName.length) {
                            let method = methodName[times];
                            let constData = this[method](data);
                            if (constData) { //打印参数构造是否成功
                                if (method === 'slipPrint' || method === 'returnPrint') {
                                    authCall({ confirmPrit: true });
                                    Modal.success({
                                        className: 'vla-confirm',
                                        title: '請放入平推紙，然後按確定',
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
                                    if (this.props.initialState.data.syjmain[0].isbreadpos !== 'Y' && !!flag && method === 'backPrint') {
                                        this.kitchenPrint(data, () => printAction(++times, codeStr + data.code), authCall);
                                    } else {
                                        window.Print(constData, (data) => {//打印回调
                                            printAction(++times, codeStr + data.code);
                                        });
                                    }
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
            console.log('重印单据失败', e);
        }
    }

    printAgEjoural = (data) => {
        const dividingLine = '\r\n---------------------------------------';
        let ejouralList = [], ejouralText = '';
        let gh = this.props.operator && this.props.operator.gh;
        let titleTxt = `SHOP ${this.props.initialState.mkt}/${this.props.initialState.syjh}  REF ${this.props.initialState.syjh + this.props.initialState.fphm}  ${moment().format('DD/MM/YYYY')}\r\nOPERATOR ${gh}  ${moment().format('HH:mm:ss')}`;
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

                printtype: "0", //0代表热敏打印，1代表平推
                printnum: 1,//重打次数
                printtime: 1,//打印次数
                switchEng: false,  //是否打印英文小票
                isfl: 'N',  //当值为Y时，复联打印
                barcodeString: data.mkt + data.syjh + moment().format('YYMMDD') + data.syjh + data.fphm,//门店号+收银机号+小票号
            }],
            goods: data.goodslist,
            pay: data.salepayments.filter(item => item.flag !== '2')
        };
        return printTemplate;
    }

    //后厨打印
    backPrint = (data, goodsList) => {
        let printTemplate, others = {};
        if (goodsList) {
            let index = -1;
            for (let i = 0, len = data.goodslist.length; i < len; i++) {
                if (data.goodslist[i].barcode === goodsList[0].barcode) {
                    index = i;
                    break
                }
            }
            others.stallInfo = [data.commonData.stallInfo[index]] || [];
            others.goodsList = goodsList;
        }
        if (data.djlb === '2') {
            others.isCancel = 'Y';
        }
        printTemplate = {
            Module: "MS_WD",
            head: [{
                ...data.commonData,
                ...others,
                printtype: '0',
            }]
        };
        return printTemplate;
    }

    //热敏可以平推
    slipPrint = (data) => {
        return this.thermalFlatpush(data, 'MS_SlipPrint');
    }

    //重印打印（热敏, 部分平推）
    salePrint = (data) => {
        return this.thermalFlatpush(data);
    }

    thermalFlatpush = (data, module) => {
        console.log('重印打印', data, data.english);
        let octopusInfo = {}, others = {}, ctpInfo, printTemplate;
        if (data.djlb === "Y9") { //找零增值
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
                    switchEng: data.english || false,  //是否打印英文小票
                    printtype: module ? "1" : "0", //0代表热敏打印，1代表平推
                    barcodeString: data.mkt + data.syjh + moment().format('YYMMDD') + data.syjh + data.fphm,//门店号+收银机号+小票号
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
                if (payData.length !== data.salepayments.length) {
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
                data.goodslist.map(item => item.total = item.ysje);
            } else {
                others.isFS = 'N';
            }

            if (new Date().getDay() === 3) {
                others.isYhrq = 'Y';
            }

            //判断是否支付宝支付
            let micropayment = payData.find(item => item.paycode === '0903');
            if (micropayment) {
                others.tradeno = "BARC#" + micropayment.refCode;
                others.ordered = "RRNO#" + micropayment.payno;
            }

            printTemplate = {
                Module: module || 'MS_SalePrint',
                head: [{
                    ...data.commonData,
                    switchEng: data.english || false,  //是否打印英文小票
                    printtype: module ? "1" : "0", //0代表热敏打印，1代表平推

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

    //消单,退货
    returnPrint = (data) => {
        console.log('消单', data);//VoidPrint
        let dcData = {}, other = {}, Module;
        dcData.date = moment(data.deliveryTime).format("DD/MM/YYYY");
        dcData.reserveLocation = data.reserveLocation;
        dcData.customName = data.receiverName;
        dcData.telephone = data.receiverMobile || data.receiverPhone;
        dcData.locationOut = data.outLocation;
        dcData.otherTelephone = data.receiverStandbyPhone;

        if (data.djlb === '4') {
            Module = "MS_TH";
            other.barcodeString = data.mkt + data.syjh + moment().format('YYMMDD') + data.syjh + data.fphm;//门店号+收银机号+小票号;
        } else {
            Module = "MS_XD";
            data.commonData.mdjc = undefined;//消单屏蔽字段
        }

        data.commonData.mdjc = undefined;//消单屏蔽字段

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
                printtype: "1", //0代表热敏打印，1代表平推
                dcData: dcData, //DC退货信息

                printnum: 1,//重打次数
                printtime: 1,//打印次数

                switchEng: false,  //是否打印英文小票
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

    //后厨打印相关

    //分类
    groupBy = (array, f) => {
        let groups = {}
        array.forEach(function (o) {
            let group = JSON.stringify(f(o))
            groups[group] = groups[group] || []
            groups[group].push(o)
        })
        return Object.keys(groups).map(function (group) {
            return groups[group]
        })
    }

    //获取后厨配置
    getBackPrintConfig = (data) => {
        let stallCodeList = []
        data.goodslist.forEach(item => {
            stallCodeList.push(item.stallCode)
        });
        let reqParams = {
            operators: this.props.operators,
            flow_no: data.flow_no || '00000',//流水必须赋值。。随便穿个
            mkt: this.props.initialState.mkt,
            syjh: data.syjh,
            shopCode: this.props.initialState.mkt,
            stallCode: stallCodeList.join(',')
        };
        return this.props.actions.getBackPrintConfig(reqParams);
    }

    //进行后厨打印条件判断
    kitchenPrint = (printData, callback, modelVis) => {
        this.getBackPrintConfig(printData).then((res) => {
            let backPrintStallInfo = res.stallinfo;
            let goodsList = printData.goodslist.filter(v => v.processFlag == 1);
            let groupByGoodsList = this.groupBy(goodsList, item => {
                return [item.stallCode]
            });
            let list = groupByGoodsList.filter(v => v[0].stallCode !== '');


            let handleXDPrintFunc = (data, idSheetNo, saleDate, callback) => {
                let _this = this
                if (data.length !== 0) {
                    let list = data[0], items = [],
                        backPrintNo = list[0].backPrintNo
                    list.forEach(item => {
                        let obj = {
                            name: item.fname,
                            extParams: item.categoryPropertys,
                            qty: item.qty,
                            eatWay: item.eatWay
                        }
                        items.push(obj)
                    })
                    let params = backPrintStallInfo.find(v => v.stallCode === list[0].stallCode)
                    if (!!params && params.printAddress !== '') {
                        //含有后厨打印档口
                        let { stallName, stallCode, printAddress, selfId } = params;
                        let others = {};
                        if (printData.djlb === '2') {
                            others.isCancel = 'Y';
                        }
                        let req = {
                            operators: this.props.operators,     // 操作员号
                            flow_no: printData.flow_no || '00000',
                            mkt: this.props.initialState.mkt,
                            syjh: printData.syjh,
                            shopCode: this.props.initialState.mkt,
                            items,
                            idSheetNo,
                            backPrintNo,
                            stallName,
                            stallCode,
                            printIp: printAddress,
                            erpCode: this.props.initialState.jygs,
                            ...others,
                        }
                        this.props.actions.handleBackPrint(req).then(res => {
                            if (res && res.retflag === "0") {
                                data.shift();
                                handleXDPrintFunc(data, idSheetNo, saleDate, callback)
                            } else {
                                modelVis({ confirmPrit: true });
                                Modal.confirm({
                                    title: `未能接通${stallName}廚房印表機`,
                                    content: `請選擇[重試] 或 [出票尾給客人交予櫃臺] `,
                                    width: 500,
                                    className: 'vla-confirm',
                                    okText: '出票尾',
                                    cancelText: '重試',
                                    onOk() {
                                        modelVis({ confirmPrit: false });
                                        if (data.length == 1) {
                                            window.Print(_this.backPrint(printData, data[0]), value => {
                                                if (!!value) {
                                                    callback();
                                                }
                                            });
                                        } else {
                                            window.Print(_this.backPrint(printData, data[0]), value => {
                                                if (!!value) {
                                                    data.shift()
                                                    handleXDPrintFunc(data, idSheetNo, saleDate, callback);
                                                }
                                            });
                                        }
                                    },
                                    onCancel() {
                                        handleXDPrintFunc(data, idSheetNo, saleDate, callback);
                                    }
                                });
                            }
                        })
                    } else {
                        modelVis({ confirmPrit: true });
                        if (data.length == 1) {
                            window.Print(_this.backPrint(printData, data[0]), value => {
                                if (!!value) {
                                    modelVis({ confirmPrit: false });
                                    if (callback) {
                                        callback();
                                    }
                                }
                            })
                        } else {
                            window.Print(_this.backPrint(printData, data[0]), value => {
                                if (!!value) {
                                    modelVis({ confirmPrit: false });
                                    data.shift();
                                    handleXDPrintFunc(data, idSheetNo, saleDate, callback);
                                }
                            })
                        }
                    }
                } else {
                    callback();
                }
            }
            handleXDPrintFunc(list, printData.fphm, printData.rqsj, callback);
        })
    }


    /******重印代码结束******/

    //是否切换英文单
    onSwitchEng = () => {
        this.setState({
            switchEng: !this.state.switchEng
        })
    }

    //解挂同步fphm
    updateFPHM = (flow_no) => {
        return this.props.pAction.updateFPHM({
            operators: this.props.operators,
            flow_no: flow_no,
            mkt: this.props.initialState.mkt,
            syjh: this.props.initialState.syjh,
            fphm: this.props.initialState.xph
        })
    }

    AMCMon = () => {
        if (this.props.humanIntervention || this.props.initialState.online == '0') {
            message("脫機狀態不支持此功能");
            return false
        }
        this.setState({
            searchAMCModal: true
        });
    }

    //修改查价查货
    SelectGoodsPrice = (type) => {
        this.setState({ [type]: !this.state[type] })
    }

    selectGoods = () => {
        if (this.props.humanIntervention || this.props.initialState.online == '0') {
            message("脫機狀態不支持此功能");
            return false
        }
        this.setState({ goodsModal: true });
    }

    selectPrice = () => {
        this.setState({ priceModal: true });
    }

    pageTurn = (flag, ref) => {
        if (ref.className.includes('no')) {
            return;
        }
        let { pagination } = this.state;
        if (flag) {
            pagination.current++;
        } else {
            pagination.current--;
        }
        this.setState({ pagination });
    }

    intl = (key, params = {}) => {
        return intl.get(key, params);
    }

    render() {
        const billKey = this.props.presale.djlb === 'Y7' ? 'practice' : 'square';
        let billList;
        switch (this.props.presale.djlb) {
            case 'Y7':
                billList = this.props.initialState.bill[billKey];
                break;
            default:
                billList = this.props.initialState.bill[billKey];
                break;
        }
        const props = {
            goBack: this.goBack,
            submit: this.submit,
            delGoods: this.delGoods,
            accredit: this.accredit,
            cancelRecord: this.cancelRecord,
            rebateReceipt: this.rebateReceipt,
            modifyProperty: this.modifyProperty,
            discountReceipt: this.discountReceipt,
            onDecreaseClick: this.onDecreaseClick,
            onIncreaseClick: this.onIncreaseClick,
            windowsControl: this.windowsControl,
            keyboardControl: this.keyboardControl,
            functionControl: this.functionControl,
            goodsfindsubmit: this.goodsfindsubmit,
            editorControl: this.editorControl,
            goodssum: this.state.goodssum,
            editorCategory: this.state.editorCategory,
            selectId: this.state.selectId,
            goodsList: this.state.goodsList,
            totalData: this.state.totalData,
            editIndex: this.state.editIndex,
            inputCode: this.inputCode,
            cancelVip: this.cancelVip,
            exitStaff: this.exitStaff,
            vipInfo: this.state.vipInfo,
            vipcardlogin: this.state.vipcardlogin,
            staffcard: this.state.staffcard,
            staffcardlogin: this.state.staffcardlogin,
            functionState: this.state.functionState,
            functioninitialState: this.props.initialState,
            functioninoperators: this.props.data,
            stallGoods: this.state.stallGoods,
            posrole: this.state.posrole,
            pagination: this.state.pagination,
            findPackage: this.findPackage,
            mealGoods: this.state.mealGoods,
            mealSalePrice: this.state.mealSalePrice,
            addPackage: this.addPackage,
            bill: this.props.initialState.bill[billKey],
            switchEng: this.state.switchEng,
            onSwitchEng: this.onSwitchEng,
            onlineModel: this.props.humanIntervention ? "0" : this.props.initialState.online,
            // onlineModel: this.props.isOnline,
            isPackageStatus: this.state.isPackageStatus,
            goodsInfo: this.state.goodsInfo,
            changeGoods: this.changeGoods,
            pageTurn: this.pageTurn,
            AMCMon: this.AMCMon,
            flow_no: this.state.flow_no,
            intl: this.intl,
            octozz: this.state.octozz,
            maxSaleGoodsQuantity: this.props.initialState.Syspara.maxSaleGoodsQuantity * 1,
            addGoodsVerify: this.addGoodsVerify,
            goodsCode: this.state.goodsCode,
            repullSale: this.repullSale,
            changeRedemption: this.changeRedemption,
            stallCode: this.props.initialState.data.syjmain[0].stallcode,
            breadFlag: this.state.breadFlag,
            djlb: this.props.presale.djlb,
            loginVip: this.loginVip,
            eatWay: this.state.eatWay,
            imgURL: this.props.initialState.imgURL,
            billList: billList || [],
            menuList: this.menuFilter(this.props.initialState.data.touchpostemplate.presskeys.find(item => item.sale).sale)
        }
        const { reprintModal } = this.state;
        return (
            <div className="square">
                <SquareLeft {...props} />
                <SquareRight {...props}
                    menuEvents={this.menuEvents} />
                {this.state.windowsState == false ? (null) :
                    <SquareModal{...props} />}
                {this.state.EditorState == false ? (null) :
                    <GoodsEditor{...props} />}
                {this.state.keyboardState == false ? (null) :
                    <SquareKeyboard{...props} />}
                <SearchAMC visible={this.state.searchAMCModal}
                    defaultVip={this.state.vipInfo}
                    defaultVipCardNo={this.state.vipCardNo}
                    callback={this.searchAMC}
                    searchAMCJF={this.props.pAction.searchAMCJF} />
                <SearchBill visible={this.state.billListModal}
                    billList={billList || []}
                    callback={this.loseBill}
                    posrole={this.state.posrole}
                    updateFPHM={this.updateFPHM}
                    getBillDetail={this.getBillDetail} />
                <SelectPrice visible={reprintModal} onCancel={this.closeReprint}
                    ref='SelectPrice' />
                {/*查货*/}
                <SelectGoods visible={this.state.goodsModal}
                    onCancel={this.SelectGoodsPrice}
                    findInventory={this.props.hActions.findInventory}
                    initialState={this.props.initialState}
                    operators={this.props.operators}
                    focusInput={true} />
                {/*全日通*/}
                <OneDayPassport visible={this.state.oneDayPassportModal}
                    callback={this.oneDayPassport} />
                {/*小票复制*/}
                <CopyBill visible={this.state.copyBillModal}
                    callback={this.copyBill} />
                {/*传呼器*/}
                <Pager visible={this.state.pagerVisible}
                    changePager={this.changePager}
                    ref='Pager'
                    stallInfoList={this.state.stallInfoList}
                    pagerNo={this.props.initialState.pagerNO}
                />
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
                {/*查价*/}
                <SelectPrice visible={this.state.priceModal}
                    onCancel={this.SelectGoodsPrice}
                    initialState={this.props.initialState}
                    operators={this.props.operators}
                    focusInput={true} />
                {
                    this.state.PrintModal &&
                    <PrintAgain
                        visible={true}
                        version={"Canteen"}
                        syspara={this.props.initialState.Syspara}
                        ddlx={this.props.initialState.data.ddlx}
                        paymode={this.props.initialState.data.paymode}
                        mktinfo={this.props.initialState.data.mktinfo}
                        stall={this.props.initialState.data.stallhotkeytemplate.stallGoods}
                        onCancel={this.onOffPrint}
                        modalType={this.state.modalType}
                        callback={this.printAgain} />
                }
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
    return {
        state: state['square'],
        initialState: state.initialize,
        operators: state.login.operuser && state.login.operuser.cardno,
        operator: state.login.operuser,
        data: state['login'],
        presale: state["presale"],
        isOnline: state.home.isOnline,
        humanIntervention: state.home.humanIntervention,
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        actions: bindActionCreators(actions, dispatch),
        billAction: bindActionCreators(bill, dispatch),
        pAction: bindActionCreators(pActions, dispatch),
        hActions: bindActionCreators(hActions, dispatch),
        updateXPH: bindActionCreators(updateXPH, dispatch),
        setState: (data) => dispatch(setState(data))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(SquareService);