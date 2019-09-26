import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { Modal, Radio, Icon, Button, Progress } from 'antd';
import { bindActionCreators } from 'redux';
import actions from '../Actions.js';
import pActions from '../../presale/Actions';
import sActions from '../../square/Actions'
import message from '@/common/components/message';
import intl from 'react-intl-universal';

import { Fetch } from '@/fetch/';
import Url from '@/config/url.js';

import '../style/home.less';
import '../../login/style/systemConfig.less'
import Home from './Home';

import SignOut from './SignOut';
import MidwayTransfer from './MidwayTransfer';
import LockScreen from './LockScreen';
import ReserveFund from './ReserveFund';
import ClearMachine from './ClearMachine';
import ConfigPage from './ConfigPage';
import SelectGoods from './SelectGoods';
import SelectPrice from './SelectPrice';
import Report from './Report'; //统计报表
import ScanTest from './ScanTest';
import ActiveTicket from './ActiveTicket';
import Leave from './Leave';
import ResetTicket from './ResetTicket';
import OnlineOffline from './OnlineOffline';
import ChangePassword from './ChangePassword';
import SelectCMachine from './SelectCMachine';
import UploadLog from './UploadLog';
import SyncFphm from './SyncFphm.js';
import { setState } from "../../initialize/Actions";
import CallInfo from '@/common/components/callInfo';

const confirm = Modal.confirm;
const RadioGroup = Radio.Group;

//状态组件
class HomeService extends Component {
    constructor(props) {
        super(props);
        this.state = {
            //入银头
            reserveModal: false,
            //登出
            signOut: false,
            //清机
            clearModal: false,
            //清机报表查询
            selectCMachine: false,
            //菜单配置
            configModal: false,
            //查货
            goodsModal: false,
            //查价
            priceModal: false,
            //扫描测试
            scanModal: false,
            //快付通
            payModal: false,
            //会员日激活
            ticketModal: false,
            //离开
            leaveModal: false,
            //中途交款
            transferModal: false,
            // 重置小票
            resetTicket: false,
            //联网脱机
            onlineTypeModel: false,
            online: this.props.isOnline,
            //修改密码
            changePassword: false,
            //呼叫信息
            callInfo: [],
            callValue: undefined,
            //签离
            lock: {
                lockModal: false,
                lockConfirm: false,
            },
            //菜单
            menu: {
                tabIndex: 0,
                arrow: true,
                cls: '',
                subArr: []
            },
            //数据同步进度
            percent: 0,
            progressModal: false,
            // pause: false,
            havedata: 0,
            uuid: 0,
            //清机授权卡号
            authCard: '',
            //同步小票号
            syncFphmModal: false,
            //上传本地日志
            uploadLogModal: false,
            //显示统计报表
            report:false,
        };
        this.handleAnimationEnd = this.handleAnimationEnd.bind(this);
    }

    componentWillMount() {
        // this.props.setState({ drawer: '4' });
        // window.getCashboxStatus();
        console.log('componentWill', this.props.initialState);
        let arrayCut = [], routerPath = [], { menu } = this.state;
        let presskeys = this.props.initialState.data.touchpostemplate.presskeys[0].home;
        //presskeys.unshift({code: '123456'})
        console.log('presskeys', presskeys);
        // let reportStatics = {code:'224',name:'统计报表'}; //测试数据  统计报表的菜单
        // presskeys.push(reportStatics);
        console.log('presskeys', presskeys);
        //根据key值获取相应的path对象
        for (let i = 0, len = presskeys.length; i < len; i++) {
            let route = this.searchPath(presskeys[i]);
            if (route) {
                routerPath.push(route);
            }
        }
        //生成二位数组方便渲染
        for (let i = 0, j = 1, index = 0, len = routerPath.length; i < len; i += 4) {
            let slice = routerPath.slice(i, i + 4);
            if (j % 2 !== 0) {
                if(!arrayCut[index]) arrayCut[index] = [];
                arrayCut[index].push(slice);
                j++;
            } else {
                arrayCut[index].push(slice);
                index++;
                j = 1;
            }
        }
        menu.subArr = arrayCut;
        let callInfo = this.props.initialState.data.poscallinfo
        this.setState({ menu, callInfo });
    }

    componentDidMount() {
        //this.isCashStock();
    }

    componentWillReceiveProps(nextProps) {
    }

    intl = (key, params = {}) => {
        return intl.get(key, params);
    }

    //登出
    signOut = () => {
        let req = {
            "erpCode": this.props.initialState.erpCode,
            "mkt": this.props.initialState.mkt,
            "syjh": this.props.initialState.syjh,
            "command_id": "SYJLOGOUT"
        }
        let _this = this
        this.props.actions.signOut(req).then(res => {
            if (res) {
                Fetch(
                    {
                        url: Url.base_url,
                        type: "POST",
                        data: { command_id: "ONLINE" }
                    }
                ).then((res) => {
                }).catch((error) => {
                });
                _this.props.history.push("/login");
                const titleTxt = `SHOP : ${this.props.initialState.mkt}/${this.props.initialState.syjh}    ${moment().format('DD/MM/YY')}   ${moment().format('HH:mm:ss')}\r\nOPERATOR : ${this.props.operators.gh}   LOGOUT `;
                window.Log(titleTxt, '1')
            }
        })
    }

    //更新收银机状态
    renewstateoffon = (syjcurstatus, onlinenumber) => {
        let req = {
            "erpCode": this.props.initialState.erpCode,
            "mkt": this.props.initialState.mkt,
            "syjh": this.props.initialState.syjh,
            "syjcursyyh": this.props.operators.gh,
            "syjcurstatus": syjcurstatus,
        }
        this.props.actions.renewstate(req).then(res => {
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
                console.log(res)
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
    }

    //联网更新小票号
    updatanumberonline = () => {
        if (!this.state.progressModal) return;
        let req = {
            "uuid": this.state.uuid,
            "erpCode": this.props.initialState.erpCode,
            "mkt": this.props.initialState.mkt,
            "syjh": this.props.initialState.syjh,
            "syjcursyyh": this.props.operators.gh,
        }
        this.props.actions.updatanumberrenew(req).then(res => {
            if (res.retflag == 0) {
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
                Modal.confirm({
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
            Modal.confirm({
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
                Modal.confirm({
                    title: '更新失敗，是否重新啟動营销訂單同步?',
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
            Modal.confirm({
                title: '更新失敗，是否重新啟動营销訂單同步?',
                className: 'vla-confirm',
                okText: intl.get("BTN_YES"),
                cancelText: intl.get("BTN_NO"),
                onOk() {
                    _this.promotionSyn();
                },
                onCancel() {
                    _this.endCallback();
                }
            });
        });
    }

    // 联网更新数据
    updataonline = () => {
        if (!this.state.progressModal) return;
        let req = {
            "uuid": this.state.uuid,
            "erpCode": this.props.initialState.erpCode,
            "mkt": this.props.initialState.mkt,
            "syjh": this.props.initialState.syjh,
            "syjcursyyh": this.props.operators.gh,
        }
        this.props.actions.updatarenew(req).then(res => {
            if (res.retflag == 0) {
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
                Modal.confirm({
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
            Modal.confirm({
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

    endCallback = () => {
        this.setState({ progressModal: false });
    }

    //有无需同步的数据
    needToUpdata = (mask = 0) => {
        this.props.actions.needtoupdata({ mask }).then(res => {
            if (res.retflag === "0") {
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
            if (res.retflag === "0") {
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
    onoffonline = () => {
        let req = {};
        let _this = this;
        if (this.props.humanIntervention) {
            _this.props.actions.online(req).then(
                res => {
                    if (res) {
                        if (res.online == '0') {
                            window.offlineSync([res.date]);
                            this.needToUpdata();
                            Modal.success({
                                title: '',
                                okText: intl.get("BTN_CONFIRM"),
                                content: intl.get("INFO_ONLINESUCC"),
                                onOk: () => {
                                    _this.props.actions.humanInterventionfalse();
                                    if (_this.state.havedata == 1 && res.centerFlag == 1) {
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
                                        message("IDC不通，本地數據無法上傳，稍後重試");
                                        _this.renewstateoffon(1, 3);
                                    }
                                },
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
                this.props.actions.offline(req).then(
                    res => {
                        if (res) {
                            if (res.offline == '0') {
                                this.renewstateoffon(3, 3);
                                this.props.actions.humanInterventiontrue();
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
                                window.offlineSync([res.date]);
                                this.needToUpdata();
                                _this.props.actions.humanInterventionfalse();
                                Modal.success({
                                    title: '',
                                    okText: intl.get("BTN_CONFIRM"),
                                    content: intl.get("INFO_ONLINESUCC"),
                                    onOk: () => {
                                        if (_this.state.havedata == 1 && res.centerFlag == 1) {
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
    };

    //修改密码
    changePassword = (values, callback) => {
        if (!values) {
            this.setState({ changePassword: !this.state.changePassword });
            return false;
        }
        this.props.pActions.changepwd({
            ...values
        }).then(res => {
            console.log(res)
            if (res) {
                this.setState({
                    changePassword: false,
                })
            }
        })

    };
    //重置小票
    resetTicket = (values, callback) => {
        if (!values) {
            this.setState({ resetTicket: !this.state.resetTicket });
            return false;
        }
        this.props.actions.resetticket({
            "command_id": "UPDATECASHIERSTATUSCERTIFY",
            "mkt": this.props.initialState.mkt,
            "syjh": this.props.initialState.syjh || "07910",
            "syjcursyyh": this.props.operators.gh,
            "erpCode": this.props.initialState.erpCode,
            ...values
        }).then(res => {
            if (res) {
                Modal.success({
                    title: '小票重置',
                    okText: '确认',
                    content: '重置成功',
                });
                this.setState({ resetTicket: false });
            }
        })

    };

    //查货
    findInventory = (barcode) => {
        let req = {
            "mkt": this.props.initialState.mkt,
            "barcode": barcode,
            "gz": "1",
            "ent_id": this.props.initialState.entid,
            "jygs": this.props.initialState.jygs,
            "command_id": "MMBECERTIFY",
            "operators": this.props.operators && this.props.operators.gh
        }
        this.props.actions.findInventory(req).then(res => {
            console.log(res, 1);
        })
    }

    //会员日激活
    handleTicket = (eff_date, accnt_no) => {
        let req = {
            // "channel_id": "POS",
            // "cid": "0",
            "mkt": this.props.initialState.mkt,
            "syjh": this.props.initialState.syjh,
            "operators": this.props.operators && this.props.operators.cardno,
            "channel": "POS",
            "consumers_id": "0",
            "accnt_no": accnt_no,
            "eff_date": eff_date,
            "exp_date": eff_date,
            "command_id": "COUPONACTIVATE"
        }
        this.props.actions.activeTicket(req).then(res => {
            console.log(this.refs)
            if (res) {
                message('激活成功')
                this.refs.ActiveTicket.onCancel()
            }
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

    clickTabs = (arrow, tabIndex) => {
        let { menu } = this.state;
        let { cls, subArr } = menu;
        let len = subArr.length - 1;
        if (cls) return;
        cls = arrow ? 'Menu_bounceInRight' : 'Menu_bounceInLeft';
        if (tabIndex < 0) {
            tabIndex = len;
        } else if (tabIndex > len) {
            tabIndex = 0;
        }
        menu.tabIndex = tabIndex;
        menu.cls = cls;
        this.setState({ menu });
    }

    handleAnimationEnd = () => {
        let { menu } = this.state;
        menu.cls = '';
        this.setState({ menu });
    }

    clickIcon = (item) => {
        let that = this
        const radioStyle = {
            display: 'block',
            height: '30px',
            lineHeight: '30px',
        };
        let { callInfo } = this.state
        if (item.name) {
            switch (item.name) {
                case "lockConfirm":
                    let { lock } = this.state;
                    lock.lockConfirm = true;
                    this.setState({ lock });
                    break;
                case "signoutConfirm":
                    let {presale, square} = this.props.initialState.bill;
                    if (presale.length > 0 || square.length > 0) {
                        message('有暂存单据，不允许登出！');
                        return;
                    }
                    this.setState({
                        signOut: true
                    });
                    // confirm({
                    //     className: 'vla-confirm',
                    //     title: '登出',
                    //     content: '確認登出?',
                    //     okText: '確認',
                    //     cancelText: '取消',
                    //     onOk() {
                    //         that.signOut();
                    //         that.props.actions.humanInterventionfalse();
                    //     },
                    //     onCancel() {
                    //     },
                    // });
                    break;
                case "callConfirm":
                    CallInfo.open({
                        callInfo: this.props.initialState.data.poscallinfo,
                        callback: this.callHandle
                    })
                    break;
                case "leaveModal":
                    this.changeLeaveStatus()
                    this.setState({ [item.name]: !this.state[item.name] });
                    break;
                case "clearModal":
                    this.accredit('privqt2', (authCard) => this.setState({ [item.name]: !this.state[item.name], authCard }));
                    break;
                case "goodsModal":
                    if (this.props.humanIntervention || this.props.initialState.online == '0') {
                        message("脫機狀態不支持此功能");
                        return false
                    } else {
                        this.setState({ [item.name]: !this.state[item.name] });
                    }
                    break;
                default:
                    this.setState({ [item.name]: !this.state[item.name] });
            }
        } else {
            //将销售界面单据类别存入store
            if (item.path === '/presale' || item.path === '/square') {
                if (this.isCashStock()) {
                    this.props.pActions.setDjlb(item.djlb).then(res => {
                        this.props.history.push(item.path);
                    });
                }
            } else if (item.path === '/cancelFinalpayment' && this.props.initialState.online == '0') {//尾款脱机
                message("脫機狀態不支持此功能");
            } else {
                this.props.history.push(item.path);
            }
        }
    }

    isCashStock = () => {
        let record = window["SyncCASHIER"]({ cash: 0, dealNumbers: 0 });
        let { cashsale, maxxj } = this.props.initialState.Syspara;
        let tranSales = cashsale.split(',');
        let overflow = parseFloat(record.cash) > parseFloat(tranSales[1]);
        if (overflow) {
            Modal.info({
                title: this.intl("LOCK_TIP"),
                okText: this.intl("INFO_CONFIRMA"),
                content: this.intl("INFO_CASHEXCESS"),
            });
            if (tranSales[0] === "N") return false;
        }
        return true;
    }

    accredit = (roleKey, callback) => {
        let role = this.props.posrole[roleKey];
        if (role !== "Y") {
            React.accredit(posrole => {
                if (posrole[roleKey] === "Y") {
                    callback(posrole.cardno);
                } else {
                    message('授权失败：无此权限');
                }
            });
        } else {
            callback();
        }
    }


    onCancel = (modal) => {
        this.setState({ [modal]: !this.state[modal] });
    }


    /**
     * 签离modal
     */
    closeConfirm = () => {
        let { lock } = this.state;
        lock.lockConfirm = false;
        this.setState({ lock });
    }

    /**
     *  锁屏modal
     */
    openLock = () => {
        let { lock } = this.state;
        lock.lockConfirm = false;
        lock.lockModal = true;
        this.setState({ lock });
    }

    /**
     * 锁屏关闭modal
     */
    closeLock = () => {
        let { lock } = this.state;
        lock.lockModal = false;
        this.setState({ lock });
    }
    searchPath = (presskeys) => {//114 查阅会员menu_acmMember.png
        console.log(presskeys.code)
        let path = '';
        let touchposmode = this.props.initialState.data.syjmain[0].touchposmode;
        switch (presskeys.code) {
            case '101':
                path = {
                    path: touchposmode === 1 ? "/presale" : "/square",
                    img: "common/image/menu_sales.png",//menu_01.png
                    dsc: presskeys.name,
                    djlb: "1", //销售
                    id: 101
                };
                break;
            case '118':
                path = {
                    path: touchposmode === 1 ? "/presale" : "/square",
                    img: "common/image/menu_practice.png",//menu_02.png
                    dsc: presskeys.name,
                    djlb: "Y7", //练习
                    id: 118
                };
                break;
            case '119':
                path = {
                    path: "/presale",
                    img: "common/image/menu_voucheract.png",
                    dsc: presskeys.name,
                    djlb: "Y1", //买券
                    id: 119
                };
                break;
            case '103':
                path = {
                    path: "/returngoods",
                    img: "common/image/menu_return.png",//menu_03.png
                    dsc: presskeys.name,//退货
                    id: 103
                };
                break;
            case '125':
                path = {
                    path: "/eliminatebills",
                    img: "common/image/menu_delOrder.png",
                    dsc: presskeys.name,//消单
                    id: 125
                };
                break;
            case '113':
                path = {
                    path: "",
                    img: "common/image/menu_clear.png",//menu_05.png
                    dsc: presskeys.name,
                    name: "clearModal",//清机
                    id: 113
                };
                break;
            // case '313':
            //     path = {
            //         path: "",
            //         img: "common/image/menu_smachine.png",//menu_05.png
            //         dsc: presskeys.name,
            //         name: "selectCMachine",//清机查询
            //         id: 313
            //     };
            //     break;
            case '111':
                path = {
                    path: "",
                    img: "common/image/menu_entry.png",//menu_06.png
                    dsc: presskeys.name,
                    name: 'reserveModal',//入金
                    id: 111
                };
                break;
            case '116':
                path = {
                    path: "",
                    img: "common/image/menu_queryproduct.png",//menu_07.png
                    dsc: presskeys.name,
                    name: 'goodsModal',//查货
                    id: 116
                };
                break;
            case '117':
                path = {
                    path: "",
                    img: "common/image/menu_pricechecking.png",//menu_07.png
                    dsc: presskeys.name,
                    name: "priceModal",//查价
                    id: 117
                };
                break;
            case '124':
                path = {
                    path: "",
                    img: "common/image/menu_scan.png",//menu_07.png
                    dsc: presskeys.name,
                    name: "scanModal",//扫描
                    id: 124
                };
                break;
            case '120':
                path = {
                    path: "",
                    img: "common/image/menu_signout.png",
                    dsc: presskeys.name,
                    name: "signoutConfirm",
                    id: 120
                };
                break;
            case '223':
                path = {
                    path: "",
                    img: "common/image/menu_call.png",
                    dsc: presskeys.name,
                    name: "callConfirm",  //呼叫信息
                    id: 223
                };
                break;
            case '224':
                path = {
                    path: "",
                    img: "common/image/menu_call.png",
                    dsc: presskeys.name,
                    name: "report",  //统计报表
                    id: 224
                };
                break;
            case '333':
                path = {
                    path: "",
                    img: "common/image/menu_leave.png",
                    dsc: presskeys.name,
                    name: 'lockConfirm',//签离
                    id: 333
                };
                break;
            case '334':
                path = {
                    path: "",
                    img: "common/image/menu_07.png",
                    dsc: presskeys.name,
                    name: "configPage",
                    id: 334
                };
                break;
            case '302':
                path = {
                    path: "/presale",
                    img: "common/image/menu_04.png",
                    dsc: presskeys.name,
                    id: 302
                };
                break;
            case '115':
                path = {
                    path: "",
                    img: 'common/image/menu_memberactivation.png',//menu_115.png
                    name: "ticketModal",
                    dsc: presskeys.name,//会员激活
                    id: 115
                };
                break;
            case '121':
                path = {
                    path: "",
                    img: 'common/image/menu_offline.png',
                    name: "onlineTypeModel",
                    dsc: presskeys.name,//脱机联网
                    id: 121
                };
                break;
            case '122':
                path = {
                    path: "",
                    img: 'common/image/menu_06.png',
                    name: "ChangePassword",
                    dsc: presskeys.name,//修改密码
                    id: 122
                };
                break;
            case '999':
                path = {
                    path: "",
                    img: 'common/image/menu_voucheract.png',//menu_115.png
                    name: "restTicket",
                    dsc: presskeys.name,//
                    id: 999
                };
                break;
            case '108':
                path = {
                    path: "",
                    img: 'common/image/menu_templeave.png',//menu_leave.png
                    name: "leaveModal",
                    dsc: presskeys.name,//离开
                    id: 108
                };
                break;
            case '112':
                path = {
                    path: "",
                    img: "common/image/menu_handove.png",//menu_04.png
                    dsc: presskeys.name,
                    name: "transferModal",//中途交收
                    id: 112
                };
                break;
            case '213':
                path = {
                    path: "/finalpayment",
                    img: "common/image/menu_finalpayment.png",//menu_04.png
                    dsc: presskeys.name,//尾单
                    id: 213
                };
                break;
            case '824':
                path = {
                    path: "/cancelFinalpayment",
                    img: "common/image/menu_08.png",//menu_04.png
                    dsc: presskeys.name,//取消尾单
                    id: 824
                };
                break;
                
            case '123456':
                path = {
                    path: "",
                    img: "common/image/menu_uploadlog.png",//menu_04.png
                    dsc: '上传本地日志',//取消尾单
                    name: "uploadLogModal",//中途交收
                    id: 123456
                };
                break;
            default:
                path = '';
        }
        return path;
    }

    //离开修改收银机状态
    changeLeaveStatus = () => {
        let req = {
            "mkt": this.props.initialState.mkt,
            "syjh": this.props.initialState.syjh,
            "command_id": "UPDATECASHIERSTATUSCERTIFY",
            "syjcurstatus": "4",
            erpCode: this.props.initialState.erpCode,
            "syjcursyyh": this.props.operators.gh,
        }
        this.props.actions.changeLeaveStatus(req).then(res => {
            console.log(res, 1)
        })
    }

    syncFphmModal = (params) => {
        if (!params) {
            this.setState({
                syncFphmModal: !this.state.syncFphmModal
            })
            return;
        }
        /*this.props.actions(params).then(res => {
             if(res) {
                this.setState({
                    syncFphmModal: false
                })
             }
        })*/
    }

    render() {
        console.log(this.props)
            let { signOut, reserveModal, menu, lock, configModal, goodsModal, priceModal,report, payModal, selectCMachine, clearModal, ticketModal, leaveModal, onlineTypeModel, resetTicket, changePassword, transferModal, scanModal, authCard } = this.state;
        let { subArr, tabIndex, cls } = menu;
        let { syncCASH, operators, initialState, } = this.props;
        let props = {
            onlineModel: this.props.humanIntervention ? "0" : this.props.initialState.online,
            tipBl: this.props.initialState.uploadData
        };
        return (
            <div className="home">
                {/*导航菜单*/}
                <Home list={subArr} tabIndex={tabIndex} cls={cls}
                    clickTabs={(arrw, tabIndex) => this.clickTabs(arrw, tabIndex)}
                    handleAnimationEnd={this.handleAnimationEnd}
                    clickIcon={this.clickIcon} {...props} />
                {/*入银头*/}
                {reserveModal ? <ReserveFund visible={true}
                    onCancel={this.onCancel} /> : null}
                {signOut && <SignOut onCancel={() => this.setState({ signOut: false })} onOk={() => {
                    this.setState({ signOut: false });
                    this.signOut();
                    this.props.actions.humanInterventionfalse();
                }}></SignOut>}
                {/*签离*/}
                <LockScreen lockVisible={lock.lockModal}
                    lockConfirm={lock.lockConfirm}
                    onCancelConfirm={this.closeConfirm}
                    openLock={this.openLock}
                    onCancelLock={this.closeLock} />
                {/*清机*/}
                {
                    clearModal &&
                    <ClearMachine visible={true} onCancel={this.onCancel} authCard={authCard} />
                }
                {/*清机报表查询(不做清机操作)*/}
                <SelectCMachine visible={selectCMachine}
                    onCancel={this.onCancel} />
                {/*配置界面修改参数*/}
                <ConfigPage visible={configModal} onCancel={this.onCancel} />
                {/*查货*/}
                {goodsModal && <SelectGoods visible={goodsModal} onCancel={this.onCancel}
                    findInventory={this.props.actions.findInventory}
                    initialState={this.props.initialState}
                    operators={this.props.operators}
                    isOnline={this.props.isOnline}
                />}
                {/*查价*/}
                {priceModal && <SelectPrice visible={priceModal} onCancel={this.onCancel}
                    initialState={this.props.initialState}
                    operators={this.props.operators} />}
                {/*统计报表*/}
                {report && <Report visible={report} onCancel={this.onCancel}
                                            initialState={this.props.initialState}
                                            operators={this.props.operators} />}
                {/*扫描测试*/}
                {scanModal && <ScanTest visible={scanModal} onCancel={this.onCancel}
                    operators={operators}
                    initialState={initialState} />}
                {/*会员日激活*/}
                <ActiveTicket visible={ticketModal} onCancel={this.onCancel}
                    handleTicket={this.handleTicket}
                    ref='ActiveTicket' />
                {/*重置小票*/}
                <ResetTicket visible={resetTicket} onCancel={this.onCancel}
                    resetticket={this.resetticket}
                    callback={this.resetTicket} ref='ResetTicket' />
                {/*脱机联网*/}
                <OnlineOffline visible={onlineTypeModel}
                    onCancel={this.onCancel}
                    onoffonline={this.onoffonline}
                    ref='OnlineOffline' {...props} />
                {/*修改密码*/}
                <ChangePassword visible={changePassword}
                    onCancel={this.onCancel}
                    changepassword={this.changepassword}
                    callback={this.changePassword}
                    ref='ChangePassword' />
                {/*离开*/}
                <Leave visible={leaveModal} onCancel={this.onCancel}
                    login={this.props.login}
                    initialState={this.props.initialState}
                    changeLeaveStatus={this.changeLeaveStatus} />
                {/*中途交收*/}
                {transferModal ? <MidwayTransfer visible={transferModal}
                    onCancel={this.onCancel}
                    paymode={this.props.initialState.data.paymode}
                    onOk={this.props.actions.syncCASH} /> : null}
                {initialState.drawer !== '4' && !reserveModal && !clearModal && !transferModal ?
                    <Modal wrapClassName={"drawer-info-modal"}
                        style={{ top: 250 }}
                        title={null}
                        visible={true}
                        footer={
                            initialState.drawer !== '0' && initialState.drawer !== '4' ?
                                <Button type="primary"
                                    onClick={() => {
                                        // this.props.setState({ drawer: '4' });
                                        // setTimeout(() => {
                                        //     window.getCashboxStatus();
                                        // }, 500);
                                    }}>關閉</Button> : null
                        }
                        zIndex={1000000}>
                        <p>
                            <Icon type="info-circle-o" />
                            {initialState.drawer === '0' &&
                                <span>請關閉錢箱</span>
                            }
                            {(initialState.drawer !== '0' && initialState.drawer !== '4') &&
                                <span>打印機异常</span>
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
                            /*: !this.state.pause ?
                            <React.Fragment>
                                <Button onClick={() => {
                                    this.setState({progressModal: false})
                                }}>
                                    {'取消'}
                                </Button>
                                <Button onClick={() => {
                                    return
                                }}>
                                    {'繼續'}
                                </Button>
                            </React.Fragment> */
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
                                        percent={Math.round(this.state.percent)} />
                                </div>
                            </div>
                        </div>
                        <input type="text" style={{ visibility: 'hidden' }} />
                    </div>
                </Modal>
                {/*同步小票号*/}
                {/*<Icon className="syncFphm_icon"
                      type="cloud-upload-o"
                      onClick={() => this.syncFphmModal()}/>*/}
                <SyncFphm
                    visible={this.state.syncFphmModal}
                    callback={this.syncFphmModal} />
                {this.state.uploadLogModal ? 
                    <UploadLog 
                        dirList={this.props.initialState.uploadSetting}
                        callback={()=> this.setState({uploadLogModal: false})}/> : null
                }
            </div>
        );
    }
}


const mapStateToProps = (state) => {
    return {
        state: state["home"],
        initialState: state.initialize,
        operators: state.login.operuser,
        login: state['login'],
        isOnline: state.home.isOnline,
        posrole: state.login.posrole,
        humanIntervention: state.home.humanIntervention,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        actions: bindActionCreators(actions, dispatch),
        pActions: bindActionCreators(pActions, dispatch),
        sActions: bindActionCreators(sActions, dispatch),
        setState: (data) => dispatch(setState(data))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeService);