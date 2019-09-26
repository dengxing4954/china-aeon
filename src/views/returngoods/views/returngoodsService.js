import React, { Component } from 'react';
import ReturnGoods from './returngoods.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { returnGoods, init, addGoods, editGoods, vip, delGoods, submit, findPackage, addPackage } from '../Actions';
import '../style/returngoods.less';
import moment from 'moment';
import { Fetch } from '@/fetch/';
import Url from '@/config/url.js';
import SaleMemo from '@/common/components/saleMemo/index.js';
import message from '@/common/components/message';
import posNewsNotify from '@/common/components/posnews';
import RechargeKeypad from '@/common/components/rechargeKeypad/index.js';
import EventEmitter from '@/eventemitter/';
import pActions from '../../presale/Actions';
import ExtraPayModal from '@/common/components/extraPay/index.js';
import { Modal, Switch } from 'antd';
import Delivery from '@/views/presale/views/Delivery.js';

//状态组件
class ReturnGoodsService extends Component {
    constructor(props) {
        super(props);
        this.state = {
            readOnly: false,
            all: true,
            pickflag: false,
            pickArr: [],
            qtyArr: [],
            preGoodsList: [],
            goodsList: [],
            totalData: 0,
            pagination: {   //分页参数
                pageSize: 6,
                current: 1,
                size: 'large'
            },
            flowNo: "",
            fphm: "",
            confirmStatus: 0,
            status: 0,
            vipInfo: {},
            djlb: 4,
            orderType: "4",
            payments: [],
            switchEng: false,
            cause: null,
            ymdNo: "",
            ysyjNo: "",
            yxpNo: "",
            oldShopCode: "",
            oldTerminalNo: "",
            oldTerminalSno: "",
            depositRefund: false,
            addGoodsTime: "",
            salememo: false,
            smValue: "",
            smType: null,
            controlFlagIndex: [-1, -1],
            dzyh: null,
            swyh: null,
            staff: null,
            dcData: {},
            isDC: false,
            isDc: false,    //Dc送
            isSd: false,    //行送
            isDj: false,    //定金
            djValue: '',    //定金金额
            salesMemo: '',
            DCflag: false,
            staffcard: null,
        };
    }

    componentWillMount() {
        let { goodsList, preGoodsList, zdyftotal, status, flow_no, pickArr, qtyArr, orderType, payments, switchEng, cause, ymdNo, ysyjNo, yxpNo, vip, salememo, smValue, smType, controlFlagIndex, addGoodsTime, staff, isDC, isDc, isDj, isSd, salesMemo,
            oldShopCode, oldTerminalNo, oldTerminalSno   } = this.props.returngoods;
        if (status) {
            EventEmitter.on('Com', this.com);
        }
        if (flow_no) {
            let data = { flowNo: flow_no, pickflag: true, pickArr, qtyArr, goodsList, preGoodsList, switchEng, totalData: zdyftotal, confirmStatus: 1, status, readOnly: status === 0, orderType, payments, cause, vipInfo: vip, salememo, smValue, smType, controlFlagIndex, addGoodsTime, staff, isDC, isDc, isDj, isSd, salesMemo,
                oldShopCode, oldTerminalNo, oldTerminalSno  };
        !status && (data = { ...data, ymdNo, ysyjNo, yxpNo, oldShopCode, oldTerminalNo, oldTerminalSno });
            this.setState(data);
        }
        let arr = this.props.initialState.data.touchpostemplate.presskeys[1].sale;
        for (let x in arr) {
            if (arr[x].code == 218 || arr[x].code == 219) {
                this.setState({ DCflag: true });
            }
        }
    }

    componentWillUnmount() {
        EventEmitter.off('Com', this.com);
    }

    render() {
        let props = {
            goodsList: this.state.goodsList,
            totalData: this.state.totalData,
            pick: this.pick,
            all: this.state.all,
            allHandle: this.allHandle,
            readOnly: this.state.readOnly,
            pickArr: this.state.pickArr,
            changeCount: this.changeCount,
            editCount: this.editCount,
            pagination: this.state.pagination,
            select: this.select,
            confirm: this.confirm,
            submit: this.submit,
            onCancel: this.onCancel,
            onBack: this.onBack,
            onPageChange: this.onPageChange,
            status: this.state.status,
            confirmStatus: this.state.confirmStatus,
            pickflag: this.state.pickflag,
            fphm: this.props.initialState.fphm,
            operator: this.props.operators && this.props.operators.gh,
            tabs: this.tabs,
            scan: this.scan,
            vip: this.state.vipInfo,
            updatePrice: this.updatePrice,
            itemCode: this.itemCode,
            orderType: this.state.orderType,
            switchEng: this.state.switchEng,
            onSwitchEng: this.onSwitchEng,
            threason: this.props.initialState.data.threason || [],
            depositRefund: this.state.depositRefund,
            cause: this.state.cause,
            ymdNo: this.state.ymdNo,
            ysyjNo: this.state.ysyjNo,
            yxpNo: this.state.yxpNo,
            oldShopCode: this.state.oldShopCode, 
            oldTerminalNo: this.state.oldTerminalNo, 
            oldTerminalSno: this.state.oldTerminalSno,
            salememo: this.state.salememo,
            onSalememo: this.onSalememo,
            smValue: this.state.smValue,
            radio: this.state.smType,
            radioChange: this.radioChange,
            staff: this.state.staff,
            operateList: this.props.initialState.data.touchpostemplate.presskeys[1].sale,
            sdDelivery: this.sdDelivery,
            DC: this.state.DCflag,
            staffshopping: this.staffshopping,
            staffcard: this.state.staffcard,
            exitStaff: this.exitStaff,
            isDc: this.state.isDc,
            isDj: this.state.isDj,
            isSd: this.state.isSd,
            onDeliveryCancel: this.onDeliveryCancel,
            dcDelivery: this.dcDelivery
        };
        posNewsNotify();
        return (
            <ReturnGoods {...props}></ReturnGoods>
        );
    }

    tabs = (key) => {
        let controlFlagIndex = [-1, -1];
        if (key) {
            //无小票
            EventEmitter.on('Com', this.com);
            this.setState({ flowNo: "", goodsList: [], qtyArr: [], pickArr: [], pickflag: false, readOnly: false, status: 1, confirmStatus: 1, orderType: '4', cause: null, totalData: 0, vipInfo: {}, controlFlagIndex, staff: null, smType: null });
        } else {
            //有小票
            EventEmitter.off('Com', this.com);
            this.setState({ flowNo: "", goodsList: [], qtyArr: [], pickArr: [], pickflag: false, readOnly: false, status: 0, confirmStatus: 0, orderType: '4', cause: null, totalData: 0, vipInfo: {}, controlFlagIndex, staff: null });
        }
    }

    onSalememo = () => {
        if (this.state.salememo) {
            this.setState({ smType: 3, salememo: !this.state.salememo });
        } else {
            this.setState({ salememo: !this.state.salememo });
        }
    }

    radioChange = (e) => {
        this.setState({ smType: e.target.value });
    }

    com = (cardNo) => {
        if (!this.state.flowNo) {
            message("请先录入商品！");
            return;
        }
        let req;
        switch (cardNo.length) {
            case 11:
            case 15:
            case 16:
                req = {
                    terminalOperator: this.props.operators && this.props.operators.gh,
                    terminalSno: this.props.initialState.xph,
                    flowNo: this.state.flowNo,
                    consumersCard: cardNo,
                    //certifytype: 'ERP',
                    shopCode: this.props.initialState.mkt,
                    terminalNo: this.props.initialState.syjh,
                    //idtype: '1',
                    transDate: moment().format('YYYYMMDDHHmmss'),
                };
                this.props.vip(req).then(res => {
                    if (res) {
                        const { consumersData, promptMessage, goodsList, oughtPay } = res.data.order;
                        this.setState({ vipInfo: consumersData })
                        if (goodsList && goodsList.length > 0) {
                            this.setState({ goodsList, totalData: oughtPay });
                        }
                        if (promptMessage) {
                            message(promptMessage);
                        }
                    }
                })
                break;
            case 7:
            case 17:
                req = {
                    command_id: "FINDSTAFFCERTIFY",
                    operators: this.props.operators && this.props.operators.gh,
                    flow_no: this.state.flowNo,
                    mkt: this.props.initialState.mkt,
                    syjh: this.props.initialState.syjh,
                    erpCode: this.props.initialState.erpCode,
                    staffNo: "",
                    cardNo: cardNo.length == 7 ? cardNo : cardNo.slice(1)
                };
                Fetch({
                    url: Url.base_url,
                    type: "POST",
                    data: req
                }).then((res) => {
                    const { retflag, retmsg, cardNo, cardType } = res;
                    if ("0" === retflag) {
                        let staff = { staffCardNo: cardNo, staffCardType: cardType };
                        this.setState({ staff });
                    } else {
                        message(retmsg);
                    }
                }).catch((error) => {
                    console.error('error', error);
                });
                break;
            default:
                break;
        }

    }

    scan = ({ spNo, retCause }, callback) => {
        if (!this.state.flowNo) {
            this.init(retCause).then(no => {
                if (no) {
                    this.setState({
                        flowNo: no,
                        cause: retCause
                    });
                    this.addGoods(spNo);
                }
            });
        } else {
            this.addGoods(spNo);
        }
        callback();
    }

    onSwitchEng = () => {
        this.setState({
            switchEng: !this.state.switchEng
        })
    }

    onDeliveryCancel = (key) => {
        let state = { [key]: false, smType: null };
        if (key == "isDj") {
            state = { ...state, djValue: '' };
            Fetch(
                {
                    url: Url.base_url,
                    type: "POST",
                    data: {
                        command_id: "UPDATEORDERDEPOSIT",
                        operators: this.props.operators && this.props.operators.gh, //操作员号
                        flow_no: this.state.flowNo,
                        mkt: this.props.initialState.mkt,
                        syjh: this.props.initialState.syjh, //终端号
                        depositSale: false,
                        depositValue: 0
                    }
                }
            ).then((res) => {
                if ("0" === res.retflag) {

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
                flow_no: this.state.flowNo,
                mkt: this.props.initialState.mkt,
                syjh: this.props.initialState.syjh, //终端号
                logisticsMode: "7",
                expressNumber: ""
            };
            return this.props.pActions.refreshDelivery(req).then((res) => {
                // document.getElementById('codeInput').focus();
            })
        });
    }

    //Dc送
    dcDelivery = () => {
        let _this = this
        if (this.state.flowNo === '') {
            message('請先添加商品');
            return false;
        }
        if (this.state.isSd === true) {
            message('已選【行送】，請先取消');  //'已选【行送】，请先取消'
            return false;
        }
        if (this.state.goodsList.length > 6) {
            if (this.state.isDj === true) {
                message("定金的订单最多只可添加6件商品");
            } else {
                message('已添加商品多于6件，不可选择送货'); // 需送货的订单最多只可添加6件商品
            }
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
                        deliveryStartTime: _dcData.deliveryStartTime,
                        deliveryEndTime: _dcData.deliveryEndTime,
                        invoiceTitle: _dcData.invoiceTitle,
                        chooseDateList: _dcData.chooseDateList
                    }
                });
            }
        });
    }
    //行送或者按金
    sdDelivery = (key) => {
        if (this.state.flowNo === '') {
            message('请先添加商品');
            return false;
        }
        if (this.state.isDc === true && key == "isSd") {
            message('已选【DC送】，请先取消');  //'已选【DC送】，请先取消'
            return false;
        }
        if (this.state.goodsList.length > 6) {
            if (key === 'isDj') {
                message("定金的订单最多只可添加6件商品");
            } else {
                message('已添加商品多于6件，不可选择送货'); // 需送货的订单最多只可添加6件商品
            }
            return false;
        }
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
                    flow_no: this.state.flowNo,
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
                    return this.props.pActions.refreshDelivery({ ...req, ...sdInfo }).then((res) => {
                        // document.getElementById('codeInput').focus();
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
                                flow_no: this.state.flowNo,
                                mkt: this.props.initialState.mkt,
                                syjh: this.props.initialState.syjh, //终端号
                                depositSale: true,
                                depositValue: parseFloat(djValue)
                            }
                        }
                    ).then((res) => {
                        if ("0" === res.retflag) {
                            this.props.pActions.refreshDelivery(Object.assign(req, logicParams)).then((res) => {
                                // document.getElementById('codeInput').focus();
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

    //DC送查询quota规则
    getQuotaInfo = (params) => {
        let req = {
            operators: this.props.operators && this.props.operators.gh, //操作员号
            flow_no: this.state.flowNo,
            mkt: '081',
            syjh: this.props.initialState.syjh,
            flag: '0',
            shopTypex: '3',
            ...params
        };
        return this.props.pActions.getQuotaInfo(req);
    }

    //DC送查询门店配送信息
    getRegionList = () => {
        let req = {
            operators: this.props.operators && this.props.operators.gh, //操作员号
            flow_no: this.state.flowNo,
            mkt: '081',
            syjh: this.props.initialState.syjh,
        };
        return this.props.pActions.getRegionList(req);
    }

    //DC送查询区域信息
    getRegionInfo = () => {
        let req = {
            operators: this.props.operators && this.props.operators.gh, //操作员号
            flow_no: this.state.flowNo,
            mkt: '081',
            syjh: this.props.initialState.syjh,
        };
        return this.props.pActions.getRegionInfo(req);
    }

    //查询套餐
    findPackage = (sgsId) => {
        let req = {
            "operators": this.props.operators && this.props.operators.gh,
            "flow_no": this.state.flowNo,
            "syjh": this.props.initialState.syjh,
            "ssgId": sgsId,
            "mkt": this.props.initialState.mkt
        }
        return this.props.findPackage(req);
    }

    //添加套餐
    addPackage = (choice) => {
        let req = {
            "operators": this.props.operators && this.props.operators.gh,
            "flow_no": this.state.flowNo,
            "syjh": this.props.initialState.syjh,
            "mkt": this.props.initialState.mkt,
            'type': '3',
            'addModel': '0',
            "choice": choice
        }
        return this.props.addPackage(req);
    }

    //添加商品
    addGoods = (barcode, price) => {
        if (this.state.totalData * 1 > 999999999.99) {
            message('总金额超过限额，无法添加商品！');
            return false;
        }
        //判断是否电子秤商品
        /*identifier //标识符
         identifierLen   //标识符长度
         identifierPos   //标识符位置*/
        let isdzcm = 'N';
        const elecscalecoderule = this.props.initialState.data.elecscalecoderule;
        for (let i = 0; i < elecscalecoderule.length; i++) {
            let dzc = elecscalecoderule[i];
            let location = dzc.identifierPos - 1;
            if ((barcode.trim().length === dzc.barCodeLen) && (barcode.substring(location, location + dzc.identifierLen).trim() === dzc.identifier)) {
                isdzcm = 'Y'
                break;
            }
        }
        //调用接口
        let req = {
            //code: barcode.trim(),
            shopCode: this.props.initialState.mkt,
            terminalNo: this.props.initialState.syjh,        //"00200001",
            terminalOperator: this.props.operators && this.props.operators.gh,
            flowNo: this.state.flowNo,
            erpCode: this.props.initialState.jygs,
            barNo: barcode.trim(),
            orgCode: "1",
            searchType: "1",
            assistantId: "9527",
            calcMode: '0',
            
            // orgCode: "1",
            // search: "1",
            // calcMode: '0',
            // consumers_id: this.state.vipInfo.vipid,
            // consumers_type: this.state.vipInfo.viptype,
            // consumers_trgs: this.state.vipInfo.trgs,
            // consumers_cardno: this.state.vipInfo.vipno,
            // precision: '2',
            // entid: this.props.initialState.entid,
            // isdzcm: isdzcm
        }
        if (price) {
            req.price = parseFloat(price);
            req.calc_mode = '2';
        }
        this.props.addGoods(req).then(res => {
            if (res) {
                let { goodsList: goodslist, zdyftotal, zddsctotal, zdsjtotal ,oughtPay } = res;
                if (goodslist[0].salePrice === 0) {
                    RechargeKeypad.open({
                        title: "商品定价",
                        placeholder: "请输入商品价格",
                        errMessage: "请输入正确格式的价格,且价格不超过9999999.99",
                        rule: (num) => {
                            let numF = parseFloat(num);
                            if (/(^[0-9]\d*(\.\d{1,2})?$)/.test(num) && numF > 0 && numF <= this.props.initialState.Syspara.maxSaleGoodsMoney) {
                                return true;
                            }
                            return false;
                        },
                        callback: (value) => this.addGoods(barcode, value)
                    })
                } else {
                    if (res.type === '1') {
                        //套餐退货
                        let ssgId = res.goodslist[0].ssgid;
                        this.findPackage(ssgId).then(res => {
                            if (res) {
                                let { mealGoods } = res;
                                let choice = JSON.parse(JSON.stringify(mealGoods));
                                let choiceList = [];
                                choice.forEach(item => {
                                    let optionNum = item.optionNum;
                                    item.detail.splice(optionNum, item.detail.length);
                                });
                                this.addPackage(choice).then(result => {
                                    if (result) {
                                        let { goodsList, totalData, pagination } = this.state;
                                        let goods = [...goodsList];
                                        goods.push(result.goodslist[0]);
                                        totalData = result.zdsjtotal;
                                        //新增商品是自动翻页到最后一页
                                        pagination.current = Math.ceil(goods.length / pagination.pageSize);
                                        let pickArr = [...this.state.pickArr];
                                        pickArr.push(true);
                                        this.setState({ goodsList: goods, totalData, pickArr, pickflag: true, pagination });
                                    }
                                });
                            }
                        })
                        return true;
                    }
                    let { goodsList, totalData, pagination } = this.state;
                    let goods = [...goodsList];
                    goods.push(goodslist[0]);
                    totalData = oughtPay;   //zdsjtotal;
                    //新增商品是自动翻页到最后一页
                    pagination.current = Math.ceil(goods.length / pagination.pageSize);
                    let pickArr = [...this.state.pickArr];
                    pickArr.push(true);
                    this.setState({ goodsList: goods, totalData, pickArr, pickflag: true, pagination });
                    if (goodslist[0].controlFlag) {
                        let controlFlagIndex = [pickArr.length - 1, pickArr.length];
                        const req = {
                            command_id: "SALECONTROLGOODS",
                            calc_mode: "0",
                            barcode: barcode.trim(),
                            jygs: this.props.initialState.jygs,
                            mkt: this.props.initialState.mkt,
                            flow_no: this.state.flowNo,
                            operators: this.props.operators && this.props.operators.gh,
                            syjh: this.props.initialState.syjh,
                            qty: 1,
                            price: goodslist[0].price,
                            yyyh: "9527",
                            precision: "2",
                            search: "3"
                        }
                        Fetch({
                            url: Url.base_url,
                            type: "POST",
                            data: req
                        }).then((res) => {
                            if (res) {
                                const { retflag, retmsg } = res;
                                if (retflag === "0") {
                                    let { goodsList, totalData, pagination } = this.state;
                                    let goods = [...goodsList];
                                    goods.push(res.goodslist[0]);
                                    totalData = res.zdsjtotal;
                                    //新增商品是自动翻页到最后一页
                                    pagination.current = Math.ceil(goods.length / pagination.pageSize);
                                    let pickArr = [...this.state.pickArr];
                                    pickArr.push(true);
                                    this.setState({ goodsList: goods, totalData, pickArr, pickflag: true, pagination, controlFlagIndex });
                                } else {
                                    message(`${retmsg}`);
                                    return false;
                                }
                            }
                        }).catch((error) => {
                            throw new Error(error);
                        });
                    }
                }
            }
        });
    }

    // updatePrice = (index, price, callback) => {
    //     EventEmitter.off('Com', this.com);
    //     let goodsList = [...this.state.goodsList];
    //     let sqkh = "";
    //     React.accredit(posrole => {
    //         sqkh = posrole.cardno;
    //         this.props.editGoods({
    //             operators: this.props.operators && this.props.operators.gh,
    //             mkt: this.props.initialState.mkt,
    //             syjh: this.props.initialState.syjh,
    //             flow_no: this.state.flowNo,
    //             syyh: '0117',
    //             barcode: goodsList[index].barcode,
    //             je: price,
    //             guid: goodsList[index].guid,
    //             consumers_id: this.state.vipInfo.vipid,
    //             consumers_type: this.state.vipInfo.viptype,
    //             consumers_trgs: this.state.vipInfo.trgs,
    //             consumers_cardno: this.state.vipInfo.vipno,
    //             calc_mode: '0',
    //             isbreak: 'N',
    //             flag: '1',
    //             sqkh
    //         }).then(res => {
    //             EventEmitter.on('Com', this.com);
    //             callback();
    //             if (res) {
    //                 goodsList[index] = res.good;
    //                 this.setState({ goodsList, totalData: res.zdyftotal });
    //             }
    //         });
    //     });
    // }

    updatePrice = (index, price, callback) => {
        let unitprice = this.state.goodsList[index].unitprice;
        const { privqtje1, privqtje2 } = this.props.login.posrole;
        if (unitprice !== 0 && (price * 1 >= unitprice * privqtje2 / 100 || price * 1 <= unitprice * privqtje1 / 100)) {
            Modal.confirm({
                className: "vla-confirm",
                title: '注意！',
                content: `请检查已输入的金额 $${price} 是否正确`,
                okText: '正确',
                cancelText: '重新输入',
                onOk: () => {
                    let goodsList = [...this.state.goodsList];
                    this.props.editGoods({
                        shopCode: this.props.initialState.mkt,
                        terminalNo: this.props.initialState.syjh,
                        terminalOperator: this.props.operators && this.props.operators.gh,
                        flowNo: this.state.flowNo,
                        barNo: goodsList[index].barNo,
                        guid: goodsList[index].guid,
                        assistantId: '9527',
                        isbreak: 'N',
                        refPrice: price,
                        flag: '1',
                        calcMode: '0',
                        // // terminalOperator: '0117',
                        // syyh: '0117',
                        // je: price,
                        // consumers_id: this.state.vipInfo.vipid,
                        // consumers_type: this.state.vipInfo.viptype,
                        // consumers_trgs: this.state.vipInfo.trgs,
                        // consumers_cardno: this.state.vipInfo.vipno,
                        // sqkh: this.props.operators && this.props.operators.gh
                    }).then(res => {
                        debugger;
                        callback();
                        if (res) {
                            //goodsList[index] = res.good;
                            goodsList = res.goodsList;
                            this.setState({ goodsList, totalData: res.oughtPay });
                        }
                    });
                },
                onCancel() {
                    callback("clear");
                },
            });
        } else {
            let goodsList = [...this.state.goodsList];
            this.props.editGoods({
                shopCode: this.props.initialState.mkt,
                terminalNo: this.props.initialState.syjh,
                terminalOperator: this.props.operators && this.props.operators.gh,
                flowNo: this.state.flowNo,
                barNo: goodsList[index].barNo,
                guid: goodsList[index].guid,
                assistantId: '9527',
                isbreak: 'N',
                refPrice: price,
                flag: '1',
                calcMode: '0',
                // syyh: '0117',
                // je: price,
                // guid: goodsList[index].guid,
                // consumers_id: this.state.vipInfo.vipid,
                // consumers_type: this.state.vipInfo.viptype,
                // consumers_trgs: this.state.vipInfo.trgs,
                // consumers_cardno: this.state.vipInfo.vipno,
                // calc_mode: '0',
                // isbreak: 'N',
                // flag: '1',
                // sqkh: this.props.operators && this.props.operators.gh
            }).then(res => {
                callback();
                if (res) {
                    //goodsList[index] = res.good;
                    goodsList = res.goodsList;
                    this.setState({ goodsList, totalData: res.oughtPay });
                }
            });
        }
    }

    itemCode = (recordNo, callback) => {
        const req = {
            command_id: "REFRESHRECYCLESERINFO",
            recordNo,
            flow_no: this.state.flowNo,
            operators: this.props.operators && this.props.operators.gh,
            mkt: this.props.initialState.mkt,
            syjh: this.props.initialState.syjh,
        };
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            const { retflag, retmsg } = res;
            if ("0" === retflag) {
                callback();
            } else if ("3002" === retflag) {
                Modal.confirm({
                    className: "vla-confirm",
                    title: '注意！',
                    content: `请检查已输入的 ${recordNo} 是否正确`,
                    okText: '正确',
                    cancelText: '重新输入',
                    onOk: () => callback()
                });
            } else {
                message(retmsg);
            }
        }).catch((error) => {
            console.error('error', error);
            throw new Error(error);
        });
    }

    //初始化退货
    init = (reasonId) => {
        let reason;
        this.props.initialState.data.threason.forEach(item => {
            if (item.code == reasonId) reason = item.cnName;
        })
        let params = {
            terminalOperator: this.props.operators && this.props.operators.gh,
            shopCode: this.props.initialState.mkt,
            shopID: this.props.initialState.mkt,
            terminalNo: this.props.initialState.syjh,
            // vjzrq: moment().format('YYYY-MM-DD HH:MM:SS'),
            saleDate: moment().format('YYYY-MM-DD HH:MM:SS'),
            orderType: this.state.djlb,
            terminalSno: this.props.initialState.xph,
            channel: 'javapos',
            flag: '0',
            shopName: this.props.initialState.data.mktinfo.mktname,
            entId: this.props.initialState.entid,
            erpCode: this.props.initialState.jygs,
            // orgCode: '1',
            // assistantId: "9527",
            language: 'CHN',
            //expdate: '1',
            precisionMode: this.props.initialState.data.syjmain[0] && this.props.initialState.data.syjmain[0].sswrfs || '0',
            reasonId,
            reason,
            accreditNo: this.props.initialState.sqkh || this.props.operators.gh,
            popMode: this.props.initialState.popMode,
            scheduleCode: this.props.login.data.workRound
        };
        const req = { command_id: "POSCERTIFY", ...params };
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            const { returncode, data } = res;
            if ("0" === returncode) {
                let { addGoodsTime } = this.state;
                if (addGoodsTime === "") {
                    addGoodsTime = moment().format('DD/MM/YYYY HH:mm:ss');
                }
                this.setState({ addGoodsTime });
                return res.data.flowNo;
            } else {
                message(data);
            }
        }).catch((error) => {
            console.error('error', error);
            throw new Error(error);
        });
    }

    select = ({ retNO, retCause, oldShopCode, oldTerminalNo, oldTerminalSno }) => {
        if (this.props.humanIntervention || this.props.initialState.online == 0) {
            return message("脱机状态不支持此功能");
        }
        this.setState({ goodsList: [], totalData: 0 });
        this.init(retCause).then(flowNo => {
            if (flowNo) {
                const req = {
                    oldShopCode,
                    oldTerminalNo,
                    oldTerminalSno,
                    command_id: "GETRETURNMESSCERTIFY",
                    flowNo,
                    terminalOperator: this.props.operators && this.props.operators.gh,
                    shopCode: this.props.initialState.mkt,
                    terminalNo: this.props.initialState.syjh,
                    accreditNo: this.props.initialState.sqkh,
                    type: "1"
                };
                return Fetch({
                    url: Url.base_url,
                    type: "POST",
                    data: req
                }).then((res) => {
                    const { 
                        returncode: retflag, 
                        data: retmsg, 
                    } = res;
                    if ("0" === retflag) {
                        const { 
                            goodsList, 
                            orderType, 
                            salePayments: payments, 
                            consumers_cardno, 
                            depositRefund, 
                            staffCardNo, 
                            staffType, 
                            logisticsMode,
                            originFlowNo,
                            originIdSheetNo,
                            originLogisticsState,
                            originOrderState,
                            originTerminalNo,
                            originTerminalOperator,
                            originTerminalSno,
                            consumersData,
                        } = res.data.order;
                        let qtyArr = [];
                        let pickArr = [];
                        //会员
                        this.setState({ vipInfo: consumersData});
                        // if (consumers_cardno) {
                        //     this.props.vip({
                        //         operators: this.props.operators && this.props.operators.gh,
                        //         fphm: this.props.initialState.fphm,
                        //         flowNo,
                        //         memberId: consumers_cardno,
                        //         certifytype: 'ERP',
                        //         mkt: this.props.initialState.mkt,
                        //         syjh: this.props.initialState.syjh,
                        //         idtype: '1',
                        //     }).then(res => {
                        //         if (res) {
                        //             const { memberInfo, promptMessage } = res;
                        //             const vipInfo = memberInfo;
                        //             this.setState({ vipInfo });
                        //             if (promptMessage) {
                        //                 message(promptMessage);
                        //             }
                        //         }
                        //     })
                        // }

                        let staff;
                        if (staffCardNo) {
                            staff = { staffCardNo, staffType };
                        }
                        goodsList.forEach((item, index) => {
                            qtyArr.push(item.allowReturnCopies);
                            item.originQty = item.qty;
                            item.qty = item.allowReturnCopies;
                            pickArr.push(!!item.allowReturnCopies);
                            if (item.controlFlag && item.goodsType == "0") {
                                let controlFlagIndex = [...this.state.controlFlagIndex];
                                controlFlagIndex[0] = index;
                                this.setState({ controlFlagIndex });
                            }
                            if (item.goodsType == "15") {
                                let controlFlagIndex = [...this.state.controlFlagIndex];
                                controlFlagIndex[1] = index;
                                this.setState({ controlFlagIndex });
                            }
                        })
                        let pickflag = false;
                        pickArr.forEach(ele => {
                            if (ele === true) {
                                pickflag = true;
                            }
                        });
                        let state = { 
                            flowNo: flowNo, goodsList, preGoodsList: goodsList, qtyArr, pickArr, 
                            pickflag, readOnly: false, status: 0, confirmStatus: 0, totalData: 0, 
                            orderType, payments, staff, depositRefund, cause: retCause, ymdNo: retNO, 
                            ysyjNo: oldTerminalNo, yxpNo: oldTerminalSno, all: true,
                            originFlowNo, originIdSheetNo, originLogisticsState, originOrderState,
                            originTerminalNo, originTerminalOperator, originTerminalSno
                         };
                        this.setState(logisticsMode == 5 ? { ...state, isDC: true } : state);
                    } else {
                        message(retmsg);
                    }
                }).catch((error) => {
                    console.error('error', error);
                    throw new Error(error);
                });
            }
        });
    }

    allHandle = () => {
        let all = !this.state.all;
        this.setState({ all });
        let arr = [];
        this.state.goodsList.forEach((ele, index) => {
            if (!!ele.allowReturnCopies) {
                arr.push(all);
            } else {
                arr.push(this.state.pickArr[index]);
            }
        });
        this.setState({ pickflag: all, pickArr: arr });
    }

    pick = (index) => {
        let pickArr = [...this.state.pickArr];
        if (index == this.state.controlFlagIndex[0] && pickArr[index]) {
            pickArr[this.state.controlFlagIndex[1]] = false;
        }
        if (index == this.state.controlFlagIndex[1] && !pickArr[index]) {
            pickArr[this.state.controlFlagIndex[0]] = true;
        }
        pickArr[index] = !pickArr[index];
        if (!pickArr[index] && this.state.status === 1) {
            let item = this.state.goodsList[index];
            this.props.delGoods({
                guid: item.guid,
                flow_no: this.state.flowNo,
                barcode: item.barcode,
                sqkh: this.props.initialState.sqkh,
                operators: this.props.operators && this.props.operators.gh,
                mkt: this.props.initialState.mkt,
                syjh: this.props.initialState.syjh,
            }).then(res => {
                if (res) {
                    let goodsList = [...this.state.goodsList];
                    goodsList.splice(index, 1);
                    pickArr.splice(index, 1);
                    if (index == this.state.controlFlagIndex[0]) {
                        goodsList.splice(this.state.controlFlagIndex[1] - 1, 1);
                        pickArr.splice(this.state.controlFlagIndex[1] - 1, 1);
                    }
                    this.setState({ goodsList, totalData: res.oughtPay });
                } else {
                    pickArr[index] = !pickArr[index];
                    let pickflag = false;
                    pickArr.forEach(ele => {
                        if (ele === true) {
                            pickflag = true;
                        }
                    });
                    this.setState({ pickflag, pickArr });
                }
            });
            return;
        }
        let pickflag = false;
        pickArr.forEach(ele => {
            if (ele === true) {
                pickflag = true;
            }
        });
        let all;
        let allflag = true;
        if (pickArr[index]) {
            this.state.goodsList.forEach((ele, index) => {
                if (!!ele.allowReturnCopies && !pickArr[index]) {
                    allflag = false;
                }
            });
            all = allflag;
        } else {
            all = pickArr[index];
        }
        this.setState({ pickflag, pickArr, all });
    }

    changeCount = (key, qty, index, action) => {
        if (this.state.depositRefund) return;
        let goodsList = [...this.state.goodsList];
        let success = false;
        qty += action;
        if (action > 0) {
            if (key) {
                success = true;
            } else {
                (qty <= this.state.qtyArr[index]) && (success = true);
            }
        } else {
            (qty >= 1) && (success = true);
        }
        if (success) {
            goodsList[index].qty = qty;
            if (!key) return this.setState({ goodsList });;
            this.props.editGoods({
                terminalOperator: this.props.operators && this.props.operators.gh,
                shopCode: this.props.initialState.mkt,
                terminalNo: this.props.initialState.syjh,
                flowNo: this.state.flowNo,
                assistantId: '0117',
                barNo: goodsList[index].barNo,
                qty,
                guid: goodsList[index].guid,
                consumersId: this.state.vipInfo.vipid,
                consumersType: this.state.vipInfo.viptype,
                consumersTrags: this.state.vipInfo.trgs,
                consumersCard: this.state.vipInfo.vipno,
                calcMode: '0',
                isBreak: 'N',
                flag: '0'
            }).then(res => {
                if (res) {
                    //goodsList[index] = res.good;
                    goodsList = res.goodsList;
                    this.setState({ goodsList, totalData: res.oughtPay });
                }
            });
        }
    }

    editCount = (key, qty, index) => {
        let goodsList = [...this.state.goodsList];
        goodsList[index].qty = parseInt(qty);
        if (!key) return this.setState({ goodsList });;
        this.props.editGoods({
            terminalOperator: this.props.operators && this.props.operators.gh,
            shopCode: this.props.initialState.mkt,
            terminalNo: this.props.initialState.syjh,
            flowNo: this.state.flowNo,
            assistantId: '0117',
            barNo: goodsList[index].barNo,
            qty,
            guid: goodsList[index].guid,
            consumersId: this.state.vipInfo.vipid,
            consumersType: this.state.vipInfo.viptype,
            consumersTrags: this.state.vipInfo.trgs,
            consumersCard: this.state.vipInfo.vipno,
            calcMode: '0',
            isBreak: 'N',
            flag: '0'
        }).then(res => {
            if (res) {
                //goodsList[index] = res.good;
                goodsList = res.goodsList;
                this.setState({ goodsList, totalData: res.oughtPay });
            }
        });
    }

    //确认退货商品
    finishback = (goodslist, orderType) => {
        const req = {
            command_id: "FINISHBACKSALEGOODS",
            flowNo: this.state.flowNo,
            terminalOperator: this.props.operators && this.props.operators.gh,
            shopCode: this.props.initialState.mkt,
            terminalNo: this.props.initialState.syjh,
            goodslist,
            orderType
        }
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            const { returncode: retflag, data: retmsg } = res;
            if ("0" === retflag) {
                let { goodsList, oughtPay } = res.data.order;
                this.setState({ goodsList, totalData: oughtPay });
                return goodsList;
            } else {
                message(retmsg);
            }
        }).catch((error) => {
            console.error('error', error);
            throw new Error(error);
        });
    }

    confirm = () => {
        let goodslist = [];
        let orderType = "";
        let flag = false;
        this.state.pickArr.forEach((item, index) => {
            if (item) {
                let { guid, qty, originQty } = this.state.goodsList[index];
                if (qty !== originQty) {
                    flag = true;
                }
                goodslist.push({ guid, qty });
            } else {
                flag = true;
            }
        });
        if (this.state.orderType == "4" || this.state.orderType == "Y2") {
            orderType = this.state.orderType;
        } else {
            orderType = flag ? "4" : this.state.orderType;
        }
        if (orderType != '4' && orderType != "Y2") {
            return message('此单非退货类型！');
        }
        this.finishback(goodslist, orderType).then(res => {
            if (res) {
                this.setState({ readOnly: true, confirmStatus: 1, orderType });
            }
        });
    }

    dateFormat = (date) => {
        let arr = date.split("-");
        let temp = arr[0];
        arr[0] = arr[2];
        arr[2] = temp;
        return arr.join("-");
    }

    submit = (smcode) => {
        if (this.state.status) {
            let uidlist, qty = 0;
            if (this.state.goodsList.length === 0) {
                return false
            }
            uidlist = this.state.goodsList.map(item => {
                qty += item.qty;
                return item.guid;
            }).join(',');
            const req = {
                flowNo: this.state.flowNo,
                count: this.state.goodsList.length,
                qty,
                calcMode: "0",
                terminalOperator: this.props.operators && this.props.operators.gh,
                shopCode: this.props.initialState.mkt,
                terminalNo: this.props.initialState.syjh,
                guidList: uidlist.split(","),
                goodsList: this.state.goodsList
            };
            if (this.state.isDc === true) {
                //let expressNumber = await this.getBill(this.state.flow_no);
                this.setState({ smType: 5 })
                const fun = (_salesMemo) => {
                    let _y = this.state.dcData.date.substr(6, 4);
                    let _m = this.state.dcData.date.substr(3, 2);
                    let _d = this.state.dcData.date.substr(0, 2);
                    const dcReq = {
                        command_id: "REFRESHDELIVERYINFO",
                        operators: this.props.operators && this.props.operators.gh, //操作员号
                        flow_no: this.state.flowNo,
                        mkt: this.props.initialState.mkt,
                        syjh: this.props.initialState.syjh,
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
                    return this.props.pActions.refreshDelivery(dcReq).then((res) => {
                        if ("0" === res.returncode) {
                            this.props.submit(req).then(res => {
                                this.toInvoice();
                            });
                        } else {
                            message(res.data);
                        }
                    })
                };
                if (this.state.salesMemo !== '') {
                    fun(this.state.salesMemo);
                } else {
                    SaleMemo.open({
                        data: {
                            isSd: false,
                            salesMemo: this.state.salesMemo
                        },
                        callback: (_salesMemo) => {
                            this.setState({
                                salesMemo: _salesMemo,
                            }, () => fun(_salesMemo));
                        }
                    })
                }
                return false;
            } else {
                this.props.submit(req).then(res => {
                    if (res) {
                        if (this.state.isSd) {
                            this.setState({ smType: 3 });
                        }
                        this.toInvoice();
                    }
                });
            }
        } else {
            const req = {
                command_id: "CALCULATERETURNCERTIFY",
                flowNo: this.state.flowNo,
                terminalOperator: this.props.operators && this.props.operators.gh,
                shopCode: this.props.initialState.mkt,
                terminalNo: this.props.initialState.syjh,
                notYpopPayCodes: "",
                autoBackPayCode: "0666",
                calcMode: "0",
                goodsList: this.state.goodsList,
                originFlowNo: this.state.originFlowNo,
                originIdSheetNo: this.state.originIdSheetNo,
                originLogisticsState: this.state.originLogisticsState,
                originOrderState: this.state.originOrderState,
                originTerminalNo: this.state.originTerminalNo,
                originTerminalOperator: this.state.originTerminalOperator,
                originTerminalSno: this.state.originTerminalSno
            };
            this.props.rg(req).then(res => {
                let { returncode: retflag, data: retmsg } = res;
                if (retflag == "0") {
                    this.calcreturn(res.data);
                } else {
                    message(retmsg);
                }
            })
        }
    }

    calcreturn = (res) => {
        switch (res.resultMode) {
            case "1":
                ExtraPayModal.open({
                    type: 'retGiftList',
                    data: res,
                    callback: (params) => {
                        if (params) {
                            let giftMode = "0";
                            if (params.length != res.gifts.length) {
                                Modal.confirm({
                                    className: 'vla-confirm',
                                    title: '扣回模式',
                                    content: '不退的赠品是否需要扣回？',
                                    okText: '是',
                                    cancelText: '否',
                                    onOk: () => {
                                        const req = {
                                            command_id: "CALCULATERETURNCERTIFY",
                                            flow_no: this.state.flowNo,
                                            operators: this.props.operators && this.props.operators.gh,
                                            mkt: this.props.initialState.mkt,
                                            syjh: this.props.initialState.syjh,
                                            notypoppaycodes: "",
                                            autobackpaycode: "0666",
                                            calc_mode: "1",
                                            goodsList: this.state.goodsList,
                                            gifts: params,
                                            giftMode,
                                            originFlowNo: this.state.originFlowNo,
                                            originIdSheetNo: this.state.originIdSheetNo,
                                            originLogisticsState: this.state.originLogisticsState,
                                            originOrderState: this.state.originOrderState,
                                            originTerminalNo: this.state.originTerminalNo,
                                            originTerminalOperator: this.state.originTerminalOperator,
                                            originTerminalSno: this.state.originTerminalSno
                                        };
                                        this.props.rg(req).then(res => {
                                            let { retflag, retmsg, goodsList } = res;
                                            if (retflag == "0") {
                                                ExtraPayModal.close();
                                                this.setState({ goodsList });
                                                this.calcreturn(res);
                                            } else {
                                                message(retmsg);
                                            }
                                        });
                                    },
                                    onCancel: () => {
                                        giftMode = "1";
                                        const req = {
                                            command_id: "CALCULATERETURNCERTIFY",
                                            flow_no: this.state.flowNo,
                                            operators: this.props.operators && this.props.operators.gh,
                                            mkt: this.props.initialState.mkt,
                                            syjh: this.props.initialState.syjh,
                                            notypoppaycodes: "",
                                            autobackpaycode: "0666",
                                            calc_mode: "1",
                                            goodsList: this.state.goodsList,
                                            gifts: params,
                                            giftMode,
                                            originFlowNo: this.state.originFlowNo,
                                            originIdSheetNo: this.state.originIdSheetNo,
                                            originLogisticsState: this.state.originLogisticsState,
                                            originOrderState: this.state.originOrderState,
                                            originTerminalNo: this.state.originTerminalNo,
                                            originTerminalOperator: this.state.originTerminalOperator,
                                            originTerminalSno: this.state.originTerminalSno
                                        };
                                        this.props.rg(req).then(res => {
                                            let { retflag, retmsg } = res;
                                            if (retflag == "0") {
                                                ExtraPayModal.close();
                                                this.calcreturn(res);
                                            } else {
                                                message(retmsg);
                                            }
                                        });
                                    }
                                });
                            } else {
                                const req = {
                                    command_id: "CALCULATERETURNCERTIFY",
                                    flow_no: this.state.flowNo,
                                    operators: this.props.operators && this.props.operators.gh,
                                    mkt: this.props.initialState.mkt,
                                    syjh: this.props.initialState.syjh,
                                    notypoppaycodes: "",
                                    autobackpaycode: "0666",
                                    calc_mode: "1",
                                    goodsList: this.state.goodsList,
                                    gifts: params,
                                    giftMode,
                                    originFlowNo: this.state.originFlowNo,
                                    originIdSheetNo: this.state.originIdSheetNo,
                                    originLogisticsState: this.state.originLogisticsState,
                                    originOrderState: this.state.originOrderState,
                                    originTerminalNo: this.state.originTerminalNo,
                                    originTerminalOperator: this.state.originTerminalOperator,
                                    originTerminalSno: this.state.originTerminalSno
                                };
                                this.props.rg(req).then(res => {
                                    let { retflag, retmsg } = res;
                                    if (retflag == "0") {
                                        ExtraPayModal.close();
                                        this.calcreturn(res);
                                    } else {
                                        message(retmsg);
                                    }
                                });
                            }
                        }
                    }
                });
                break;
            case "0":
                let electronicStamp = res.electronicStamp;
                if (electronicStamp) {
                    this.setState({ dzyh: electronicStamp });
                    message(`「已于电子会员帐户扣除${electronicStamp}个印花」`, 2, this.toInvoice);
                } else {
                    this.toInvoice();
                }
                break;
            case "99":
                RechargeKeypad.open({
                    title: `「须回收${res.tempPhysicalStamp}个印花」`,
                    defaultValue: res.tempPhysicalStamp,
                    errMessage: "请输入正确的数量",
                    rule: (num) => {
                        res.tempPhysicalStamp = parseInt(res.tempPhysicalStamp, 10);
                        if (/^[0-9]*$/.test(num) && num >= 0 && num <= res.tempPhysicalStamp) {
                            return true;
                        }
                        return false;
                    },
                    callback: (value) => {
                        const req = {
                            command_id: "CALCULATERETURNCERTIFY",
                            flow_no: this.state.flowNo,
                            operators: this.props.operators && this.props.operators.gh,
                            mkt: this.props.initialState.mkt,
                            syjh: this.props.initialState.syjh,
                            notypoppaycodes: "",
                            autobackpaycode: "0666",
                            calc_mode: "99",
                            goodsList: this.state.goodsList,
                            physicalStamp: parseInt(value),
                            originFlowNo: this.state.originFlowNo,
                            originIdSheetNo: this.state.originIdSheetNo,
                            originLogisticsState: this.state.originLogisticsState,
                            originOrderState: this.state.originOrderState,
                            originTerminalNo: this.state.originTerminalNo,
                            originTerminalOperator: this.state.originTerminalOperator,
                            originTerminalSno: this.state.originTerminalSno
                        };
                        this.props.rg(req).then(res => {
                            let { retflag, retmsg } = res;
                            if (retflag == "0") {
                                this.setState({ swyh: parseInt(value) });
                                this.toInvoice();
                                if (req.physicalStamp) window.openCashbox();
                            } else {
                                message(retmsg);
                            }
                        });
                    }
                })
                break;
            default:
                this.toInvoice();
                break;
        }
    }

    //员工购物
    staffshopping = () => {
        if (this.state.flowNo === '') {
            message('请先添加商品');
            return false;
        }
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
            title: '请刷啼工卡或家属卡登入',
            placeholder: '',
            hasKeyboard: false,
            callback: (value, idType) => this.inputStaffCode('staff', value, () => { }, { idType }),
            event: {
                chooseEvent: () => {
                    EventEmitter.on('Com', com)
                    EventEmitter.on('Scan', com)
                    EventEmitter.off('Com', this.com)
                },
                cancelEvent: () => {
                    EventEmitter.off('Com', com)
                    EventEmitter.off('Scan', com)
                    EventEmitter.on('Com', this.com)
                },
            },
        })
    }

    inputStaffCode = (tag, value, callback, vipOption) => {
        if (!value && !vipOption.idType) {
            return false;
        }
        if (vipOption.idType == 1 && value == this.props.operators.cardno) {
            message('刷卡卡号不能和当前收银员卡号一致'); //刷卡卡号不能和当前收银机卡号一致
            return false
        } else if (vipOption.idType == 2 && value == this.props.operators.gh) {
            message('员工工号不能和当前收银员工号一致'); //员工工号不能和当前收银员工号一致
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
        let req = {
            mkt: this.props.initialState.mkt,
            staffNo: '',
            // cardNo: value.length == 7 ? value : value.slice(1),//9901976
            cardNo: '',
            flow_no: this.state.flowNo,
            erpCode: this.props.initialState.erpCode,
        };
        this.props.pActions.staff(req).then(res => {
            if (res) {
                this.setState({ staff: null });
            }
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
                    flow_no: this.state.flowNo,
                    erpCode: this.props.initialState.erpCode,
                };
                this.props.pActions.staff(req).then(res => {
                    if (res) {
                        if (res.cardType == 1 || res.cardType == 2) {
                            if (res.cardNo == this.props.operators.cardno) {
                                message('员工卡号与当前收银号冲突'); //员工卡号与当前收银员冲突
                            } else if (res.cardNo || res.staffNo) {
                                this.setState({
                                    staff: { staffCardNo: res.staffNo, staffType: 1 },
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

    toInvoice = () => {
        let { flowNo, pickArr, qtyArr, orderType, payments, switchEng, cause, vipInfo, status, ymdNo, ysyjNo, yxpNo, addGoodsTime, preGoodsList, salememo, smValue, smType, controlFlagIndex, dzyh, swyh, staff, isDC, isDc, isDj, isSd, salesMemo, 
            shopCode, terminalNo, terminalOperator } = this.state;
        let { flow_no } = this.props.returngoods;
        if (status) {
            EventEmitter.off('Com', this.com);
        }
        let data = { pickArr, qtyArr, fphm: this.props.initialState.fphm, orderType, payments, switchEng, cause, vip: vipInfo, addGoodsTime, preGoodsList, salememo, smValue, smType, controlFlagIndex, dzyh, swyh, staff, isDC, isDc, isDj, isSd, salesMemo };
        let isDiningHall = this.props.initialState.data.syjmain[0] && this.props.initialState.data.syjmain[0].touchposmode === 3;//美食广场版本
        !status && (data = { ...data, ymdNo, ysyjNo, yxpNo, isDiningHall, shopCode, terminalNo, terminalOperator });
        if (flowNo !== flow_no) {
            // this.handleEjoural(this.state.goodsList);
        }
        this.props.init(flowNo, data);
        let path = {
            // pathname: '/invoice',
            pathname: 'pay4Sale',
            state: { type: "returnGoods" },
        }
        this.props.history.push(path);
    }

    onCancel = (status) => {
        if (status) {
            this.setState({ flowNo: "", goodsList: [], qtyArr: [], pickArr: [], pickflag: false, readOnly: false, confirmStatus: this.state.status ? 1 : 0, totalData: 0, vipInfo: {}, staff: null });
        } else {
            this.setState({ readOnly: false, goodsList: this.state.preGoodsList, totalData: 0, confirmStatus: this.state.status ? 1 : 0 });
        }
    }

    onBack = () => {
        this.props.init();
        this.props.history.push("/home");
    }

    onPageChange = (e) => {
        this.setState({
            pagination: e
        })
    }

    handleEjoural = (item) => {
        let ejouralTxt = `     R E F U N D    R E C E I P T\r\nSHOP ${this.props.initialState.mkt}/${this.props.initialState.syjh}  REF ${this.props.initialState.syjh + this.props.initialState.fphm}  ${moment().format('DD/MM/YY')}\r\nOPERATOR ${this.props.operators.gh}  ${moment().format('HH:mm:ss')}`;
        const fillLength = (num, n) => (num + '').length < n ? (Array(n).join(" ") + num).slice(-n) : num
        const addTxt = (item, index) => {
            //let txt = `${fillLength(index, 3)}   ${item.incode.length === 3 ? '$$$' + item.incode + ' ' : fillLength(item.incode, 7)} ${fillLength("-" + item.qty, 3)}@${fillLength((item.price * 1).toFixed(2), 9)} ${fillLength("-" + (item.dsctotal ? item.total * 1 : item.ysje * 1).toFixed(2), 9)} (${item.category})`
            let txt = `${fillLength(index, 3)}   ${item.incode.length === 3 ? '$$$' + item.incode + ' ' : fillLength(item.incode, 7)} ${fillLength("-" + item.qty, 3)}@${fillLength((item.price * 1).toFixed(2), 9)} ${fillLength("-" + (item.dsctotal ? item.total * 1 : item.ysje * 1).toFixed(2), 9)} (${item.category})`
            if (item.dsctotal) {
                txt += `\r\n       DISC            ${fillLength('-' + (item.dsctotal * 1).toFixed(2), 15)}`
            }
            return txt;
        }
        item.forEach((_item, _index) => {
            ejouralTxt += `\r\n${addTxt(_item, _index + 1, 3)}`
        })
        window.Log(ejouralTxt, '1');
    }
}

const mapStateToProps = (state) => {
    return {
        returngoods: state.returngoods,
        initialState: state.initialize,
        operators: state.login.operuser,
        login: state.login,
        humanIntervention: state.home.humanIntervention
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        rg: (req) => dispatch(returnGoods(req)),
        init: (no, params) => dispatch(init(no, params)),
        addGoods: (params) => dispatch(addGoods(params)),
        vip: (params) => dispatch(vip(params)),
        editGoods: (params) => dispatch(editGoods(params)),
        delGoods: (params) => dispatch(delGoods(params)),
        submit: (params) => dispatch(submit(params)),
        findPackage: (params) => dispatch(findPackage(params)),
        addPackage: (params) => dispatch(addPackage(params)),
        pActions: bindActionCreators(pActions, dispatch),
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(ReturnGoodsService);
