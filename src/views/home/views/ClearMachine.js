import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Fetch } from '@/fetch/';
import intl from 'react-intl-universal';
import Url from '@/config/url.js';
import EventEmitter from '@/eventemitter';
import message from '@/common/components/message';
import moment from 'moment';
import '../style/clear.less'
import { Modal, Button, Progress, Row, Col, Spin } from 'antd';
import { setState } from "../../initialize/Actions";
import withKeyBoard from '@/common/components/keyBoard';
import FundPay from './FundPay.js';

/**
 * 空格补齐，左对齐，右对齐
 * @param value
 * @param n
 * @returns {string}
 */
const fillLeft = (value, n) =>
    (value + '').length < n ? (Array(n).join(" ") + value).slice(-n) : value;
const fillRight = (value, n) =>
    (value + '').length < n ? (value + Array(n).join(" ")).substring(0, n) : value;
const previewLine = "=========================================";
const shorterForm = {
    '01': 'Jan',
    '02': 'Feb',
    '03': 'Mar',
    '04': 'Apr',
    '05': 'May',
    '06': 'Jun',
    '07': 'Jul',
    '08': 'Aug',
    '09': 'Sept',
    '10': 'Oct',
    '11': 'Nov',
    '12': 'Dec'
};

class ClearMachine extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sumDetail: [],
            payDetail: [],
            bankDetail: {},//bankInfo: [], bankDiff: [], bankStatus: []
            index: -1,
            doingEDC: false,
            edcMask: false,
            isClear: false,
            stamp: [],
            bankService: false,

            swipeModal: false,
            operators: '',//当前操作员

            percent: 0,
            progressModal: false,
            queue: [],
            isDone: false,
            uuid: 0,

            isfantasy: this.props.initialize.data.syjmain[0].isfantasy === 'Y',
            fantasyList: {},
            fantasyDate: '',

            monitorFunc: () => {
            },
        }
    }

    componentDidMount() {
        this.props.bind({
            "35": () => {
                this.props.onCancel("clearModal");
            }
        });
    }

    intlLocales = (key) => {
        return intl.get(key);
    }

    afterClose = () => {
        this.setState({
            sumDetail: [],
            payDetail: [],
            bankDetail: {},
            doingEDC: false,
            index: -1,
        });
    }

    closeSwipeModal = () => {
        EventEmitter.off('Com', this.state.monitorFunc);
    }

    closeProgressModal = () => {
        this.setState({ queue: [], uuid: 0 }, () => {
            if (this.state.index === 2) {
                let { ghtype } = this.props.operuser;
                let isClose = ghtype === '1' || ghtype === '2'; //1收银员2营业员3管理员4维护员
                const txt = `SHOP : ${this.props.initialize.mkt}/${this.props.initialize.syjh}  ${moment().format('DD/MM/YY HH:mm:ss')}\r\nSHUT DOWN`;
                window.Log(txt, '1');
                window.Shutdown(isClose);
            }
        });
    }

    render() {
        let { payDetail, index, isClear, bankDetail, stamp, swipeModal, operators, progressModal, percent, isDone, fantasyList, edcMask } = this.state;
        let { visible, onCancel } = this.props;
        let { mkt, syjh } = this.props.initialize;
        let { businesscode } = this.props.initialize.data.syjmain[0];
        return (
            <React.Fragment>
                <Modal
                    title={null}
                    visible={visible}
                    closable={false}
                    maskClosable={false}
                    footer={null}
                    mask={true}
                    zIndex={2}
                    wrapClassName="vertical-center-modal off_work"
                    bodyStyle={{ margin: 0, padding: 0 }}
                    afterClose={this.afterClose}
                    destroyOnClose={true}
                >
                    <div className="clear_machine">
                        <div className="head">
                            {this.intlLocales("CLEARMACHINE_TIP")}
                            <img
                                src={require("@/common/image/paytk_close.png")}
                                alt=""
                                onClick={() => onCancel("clearModal")} />
                        </div>
                        <div className="content">
                            <div className="btn_group">
                                <input type="button"
                                    className={index === 0 ? 'wBtn' : 'bBtn'}
                                    value={this.intlLocales("CLEARMACHINE_STAFFREPORT")}
                                    onClick={() => this.eventMethod('staffRp', 0)} />
                                <input type="button"
                                    className={index === 1 ? 'wBtn' : 'bBtn'}
                                    value={this.intlLocales("CLEARMACHINE_CASHIERREPORT")}
                                    onClick={() => this.eventMethod('cashierRp', 1)} />
                                <input type="button"
                                    className={index === 1 ? 'wBtn' : 'bBtn'}
                                    value="缴款"
                                    onClick={() => this.eventMethod('fundPay', 4)} />
                                {
                                    this.props.initialize.octopus &&
                                    <input type="button"
                                        className={index === 3 ? 'wBtn' : 'bBtn'}
                                        value="八達通清機"
                                        onClick={() => this.eventMethod('octopusRp', 3)} />
                                }
                                <input type="button"
                                    className={index === 2 ? 'wBtn' : 'bBtn'}
                                    value={this.intlLocales("CLEARMACHINE_SIGNOUT")}
                                    onClick={() => this.eventMethod('shutDown', 2)} />
                            </div>
                            {/* {
                                payDetail.length !== 0 ?
                                    <div className="report_preview">
                                        <div className="ticket_head">
                                            <div
                                                className="center"> {this.props.initialize.data.mktinfo.mktname}</div>
                                            <div className="subtitle">REGISTER
                                                TAKINGS & BANKING REPORT
                                            </div>
                                            <div> SHOP {mkt}/{syjh}&nbsp;&nbsp;{moment().format('DD/MM/YY')}&nbsp;&nbsp;{moment().format('HH:mm:ss')}</div>
                                        </div>
                                        <div style={{
                                            marginLeft: 20,
                                            fontSize: 17
                                        }}>OPERATOR
                                            : {this.props.operators}</div>
                                        {
                                            index === 0 &&
                                            <div style={{
                                                marginLeft: 20,
                                                fontSize: 17
                                            }}>BANKING LIST BY CASHIER
                                                = {operators || this.props.operators}</div>}
                                        {index === 1 &&
                                            <div style={{
                                                marginLeft: 20,
                                                fontSize: 17
                                            }}>BANKING LIST BY TERMINAL
                                            = {syjh}</div>
                                        }
                                        {this.repPreview(0, 4, '2')}
                                        <div className="separation">
                                            {previewLine}
                                        </div>
                                        {
                                            payDetail.map((item, key) =>
                                                item.amount ?
                                                    <div
                                                        className="ticket_content"
                                                        key={key}>
                                                        <div
                                                            className="item_title">{item.name}</div>
                                                        <div
                                                            className="item_content">
                                                            <div
                                                                className="cont_num">
                                                                {item.num}{item.minus || ' '}$
                                                            </div>
                                                            <div>
                                                                {parseFloat(item.amount).toFixed(2)}
                                                            </div>
                                                        </div>
                                                    </div> : null
                                            )
                                        }
                                        <div className="ticket_content">
                                            <div className="item_title"></div>
                                            <div className="item_content">
                                                ---------------------
                                            </div>
                                        </div>
                                        {this.repPreview(4, 12, '6')}
                                        <div className="separation">
                                            {previewLine}
                                        </div>
                                        {this.repPreview(12, 18, '2,4')}
                                        <div className="separation">
                                            {previewLine}
                                        </div>
                                        <div className="separation">
                                            STAMP
                                            {
                                                stamp.map((item, key) =>
                                                    <div
                                                        className="ticket_content"
                                                        key={key}>
                                                        <div
                                                            className="item_title">{item.name}</div>
                                                        <div
                                                            className="item_content">
                                                            <div
                                                                className="cont_num"></div>
                                                            <div>
                                                                {item.amount || 0}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            }
                                            {previewLine}
                                        </div>
                                        {this.bankPreview()}
                                        {
                                            this.state.doingEDC && this.state.bankService ?
                                                <React.Fragment>
                                                    <div className="separation">
                                                        {previewLine}
                                                    </div>
                                                    <div
                                                        className="ticket_content">
                                                        OCTOPUS SETTLEMENT
                                                    </div>
                                                    <div className="separation">
                                                        {previewLine}
                                                    </div>
                                                </React.Fragment>
                                                : null
                                        }
                                        {this.gmRoomPreview()}
                                        {this.props.authCard || this.props.operators}
                                        <div className="separation_center">
                                            {'*___________END OF MSTING PRINTING___________*'}
                                        </div>
                                    </div> :
                                    <div className="tip_msg">
                                        <div className="title">請選擇以上所需的打印報表
                                        </div>
                                        <img
                                            src={require("@/common/image/print_rep.png")}
                                            alt="" />
                                    </div>
                            } */}
                        </div>
                    </div>
                    <Modal
                        title={null}
                        visible={swipeModal}
                        closable={false}
                        maskClosable={false}
                        footer={
                            <Button onClick={() => {
                                this.setState({ swipeModal: false })
                            }}>
                                取消
                            </Button>
                        }
                        mask={true}
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
                        afterClose={this.closeSwipeModal}
                        destroyOnClose={true}
                    >
                        <div>
                            <div className="head">
                                {'員工清機'}
                            </div>
                            <div className="content">
                                <div className="msg">
                                    <div
                                        style={{ border: 'border:1px dashed #F00' }}>
                                        {`請刷員工卡`}
                                    </div>
                                </div>
                            </div>
                            <input type="text" style={{ visibility: 'hidden' }} />
                        </div>
                    </Modal>
                    <Modal
                        title={null}
                        visible={progressModal}
                        closable={false}
                        maskClosable={false}
                        footer={
                            percent >= 99.9 ?
                                <Button onClick={() => {
                                    this.setState({ progressModal: false })
                                }} key={1}>
                                    {'完成'}
                                </Button> : isDone ?
                                    <Button onClick={() => {
                                        this.setState({ progressModal: false })
                                    }} key={3}>
                                        {'取消'}
                                    </Button> :
                                    <Button onClick={this.finishProgress} key={4}>
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
                        afterClose={this.closeProgressModal}
                        destroyOnClose={true}
                    >
                        <div>
                            <div className="head">
                                {'數據同步'}
                            </div>
                            <div className="content">
                                <div className="msg">
                                    <div
                                        style={{ border: 'border:1px dashed #F00' }}>
                                        <Progress type="dashboard"
                                            percent={Math.round(percent)} />
                                    </div>
                                </div>
                            </div>
                            <input type="text" style={{ visibility: 'hidden' }} />
                        </div>
                    </Modal>
                </Modal>
                {
                    edcMask &&
                    <div className="loading_mask" onClick={(e) => {
                        e.stopPropagation()
                    }}>
                        <Spin size="large" tip={"清理EDC中，請耐心等待！ "} />
                    </div>
                }
            </React.Fragment>
        )
    }

    finishProgress = () => {
        let req = {
            uuid: this.state.uuid,
            command_id: "STOPSYNOFFLINEDATA",
        }
        return Fetch(
            {
                fetchFlag: true,
                url: Url.base_url,
                type: "POST",
                data: req,
            }
        ).then(res => {
            if (res.retflag === "0") {
                this.setState({ progressModal: false })
            } else {
                message(res.retmsg);
            }
        }).catch(err => {
            console.log(err);
        });
    }

    eventMethod = (methodName, index) => {
        let { presale, square } = this.props.initialize.bill, msg = '';
        presale = presale || [];
        square = square || [];
        if (index === 2) {
            msg = '退出';
        } else if (index === 3) {
            msg = '八達通清機';
        } else if (index === 4) {
            msg = '缴款';
        } else {
            msg = '清機';
        }
        if (methodName === 'cashierRp' && (presale.length > 0 || square.length > 0)) {
            message('有暫存收據，不允許' + msg + '！');
        } else {
            let that = this;
            Modal.confirm({
                cancelText: '否',
                okText: '是',
                title: `溫馨提示`,
                className: 'vla-confirm',
                content: `是否確定進行${msg}操作！`,
                onOk() {
                    if (index === 0 || index === 1) {
                        try {
                            if (index === 1) {
                                that.confirmEDC(that, () => {
                                    window['openCashbox']();
                                    that[methodName]();
                                });
                            } else if (index === 0) {
                                that.setState({
                                    swipeModal: true,
                                    monitorFunc: (operator) => {
                                        setTimeout(() => {
                                            that.setState({
                                                swipeModal: false,
                                                operators: operator,
                                            }, () => {
                                                window['openCashbox']();
                                                that[methodName]();
                                            });
                                        }, 50);
                                    },
                                }, () => {
                                    EventEmitter.on('Com', that.state.monitorFunc);
                                });
                            } else {
                                that[methodName]();
                            }

                        } catch (e) {
                            console.log('e', e);
                        }
                    } else {
                        that[methodName]();
                    }
                    that.setState({
                        index,
                        doingEDC: false,
                        sumDetail: [],
                        payDetail: [],
                        fantasyList: {},
                        bankDetail: {},
                    });
                },
            });
        }
    }

    //服务清机打印成功后调用
    beginSyn = () => {
        let queue = [{ name: 'promotionSyn' }, { name: 'orderSyn' }, { name: 'updatarenew' }],
            failQueue = [], title = '', len = queue.length;
        let getTitle = (key) => {
            switch (key) {
                case 'orderSyn':
                    return '訂單服務同步失敗';
                case 'promotionSyn':
                    return '營銷服務同步失敗';
                case 'updatarenew':
                    return '总部服務同步失败';
            }
        }
        if (this.state.queue.length) {
            queue = this.state.queue;
            len = queue.length;
        }

        let methodAction = (direaction = 0) => {
            let req = queue[direaction];
            if (this.state.progressModal) {
                if (req) {
                    if (req.status !== "0") {//判断接口状态
                        this[req.name]().then(({ retflag, retmsg }) => {
                            let status = retflag;
                            queue[direaction].status = status;
                            if (status !== "0") {
                                if (title) {
                                    title += ',' + getTitle(req.name);
                                } else {
                                    title = getTitle(req.name);
                                }
                                failQueue.push(req);
                                methodAction(++direaction);
                            } else {
                                if (retmsg) {
                                    this.setState({ progressModal: false });
                                    message("脫機狀態不支持上傳！");
                                    return;
                                }
                                this.setState({ percent: this.state.percent + 1 / len * 100 }, () => {
                                    methodAction(++direaction);
                                });
                            }
                        })
                    } else {
                        methodAction(++direaction);
                    }
                } else {
                    this.setState({ isDone: failQueue.length === 0 }, () => {
                        if (failQueue.length !== 0) {
                            this.renewSync(title, methodAction);
                        } else {
                            this.selctOrderData(() => {
                            }, 1);
                        }
                        //置空数据
                        title = '';
                        failQueue = [];
                    });
                }
            }
        }

        this.setState({
            isDone: false,
            progressModal: true,
            percent: this.state.queue.length ? this.state.percent : 0,
            uuid: (new Date()).valueOf(),
        }, methodAction);
    }

    //八达通清机
    octopusRp = () => {
        try {
            window.ClearOCT();
            this.octopusEjoural();
        } catch (e) {
            message('八達通清機失敗，清聯系工作人員！');
        }
    }

    //八达通日志记录
    octopusEjoural = () => {
        const dividingLine = '\r\n=====================================';
        let ejouralList = [], ejouralText = '';
        ejouralList.push(dividingLine);
        ejouralList.push('\r\nOCTOPUS SETTLEMENT');
        ejouralList.push(dividingLine);
        ejouralList.forEach(item => {
            ejouralText += item;
        });
        window.Log(ejouralText, '1');
    }

    //确认EDC清机
    confirmEDC = (_this, callBack) => {
        let finallyConfirm = () => {
            Modal.confirm({
                title: '溫馨提示:',
                cancelText: '否',
                okText: '是',
                width: 450,
                className: 'vla-confirm',
                content: '執行此操作後收銀機將清除八達通和EDC數據，請再次確定操作。',
                onOk() {
                    if (!_this.state.isClear && _this.state.doingEDC) {
                        _this.setState({
                            operators: '',
                            isClear: true
                        }, callBack)
                    } else {
                        callBack();
                    }
                },
                onCancel() {
                    _this.setState({
                        doingEDC: false,
                        index: -1,
                    })
                }
            });
        }

        Modal.confirm({
            title: '注意:',
            cancelText: '否',
            okText: '是',
            className: 'vla-confirm',
            content: '是否執行 E D C 和 八 達 通 清機',
            onOk() {
                _this.setState({
                    doingEDC: true,
                }, finallyConfirm)
            },
            onCancel() {
                _this.setState({
                    operators: '',
                    doingEDC: false,
                }, callBack)
            },
        });
    }

    //启动订单中心同步
    orderSyn = () => {
        let req = {
            uuid: this.state.uuid,
            command_id: "ORDERSYN",
        }
        return Fetch(
            {
                fetchFlag: true,
                url: Url.base_url,
                type: "POST",
                data: req,
            }
        ).then(res => {
            return res;
            // if (res.retflag === "0") {
            //     console.log('启动营销订单同步');
            // } else {
            //     console.log("啟動營銷訂單同步失敗");
            // }
        }).catch(err => {
            console.log(err);
        });
    }

    //启动营销订单同步
    promotionSyn = () => {
        let req = {
            command_id: "PROMOTIONSYN",
        }
        return Fetch(
            {
                fetchFlag: true,
                url: Url.base_url,
                type: "POST",
                data: req,
            }
        ).then(res => {
            return res;
            // if (res.retflag === "0") {
            //     console.log('启动营销订单同步');
            // } else {
            //     console.log("啟動營銷訂單同步失敗");
            // }
        }).catch(err => {
            console.log(err);
        });
    }

    //启动同步pos总部
    updatarenew = () => {
        let req = {
            "erpCode": this.props.initialize.erpCode,
            "mkt": this.props.initialize.mkt,
            "syjh": this.props.initialize.syjh,
            "syjcursyyh": this.state.operators || this.props.operators,
            "command_id": "SYNCPOSCENTERDATA",
            uuid: this.state.uuid,
        }
        return Fetch(
            {
                fetchFlag: true,
                url: Url.base_url,
                type: "POST",
                data: req,
            }
        ).then(res => {
            return res;
            // if (res.retflag === "0") {
            //     console.log('同步pos总部');
            // } else {
            //     console.log("啟動同步pos总部失败");
            // }
        }).catch(err => {
            console.log(err);
        });
    }

    renewSync(title, callBack) {
        let _this = this;
        Modal.confirm({
            title: '溫馨提示:',
            cancelText: '否',
            okText: '是',
            width: 450,
            zIndex: 10001,
            className: 'vla-confirm',
            content: title + '，是否重新同步?',
            onOk() {
                callBack();
            },
            onCancel() {
                _this.setState({ progressModal: false });
            }
        });
    }

    shutDown = () => {
        let req = {
            mkt: this.props.initialize.mkt,
            syjh: this.props.initialize.syjh,
            command_id: "POSCLOSE",
            //syjcurstatus: "5",
            erpCode: this.props.initialize.erpCode,
            syjcursyyh: this.props.operators,
        }
        Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then(res => {
            if (res.retflag === "0") {
                let { ghtype } = this.props.operuser;
                let isClose = ghtype === '1' || ghtype === '2'; //1收银员2营业员3管理员4维护员
                const titleTxt = `SHOP : ${this.props.initialize.mkt}/${this.props.initialize.syjh}  ${moment().format('DD/MM/YY HH:mm:ss')}\r\nOPERATOR ${this.props.operators}   LOGOUT`;
                window.Log(titleTxt, '1');
                const txt = `SHOP : ${this.props.initialize.mkt}/${this.props.initialize.syjh}  ${moment().format('DD/MM/YY HH:mm:ss')}\r\nSHUT DOWN`;
                if (this.props.initialize.online === '1') {
                    this.selctOrderData(() => {
                        window.Log(txt, '1');
                        window.Shutdown(isClose)
                    });
                } else {
                    this.isOnline().then(res => {
                        if (res) {
                            this.props.setState({ online: '1' });
                            this.selctOrderData(() => {
                                window.Log(txt, '1');
                                window.Shutdown(isClose)
                            });
                        } else {
                            window.Log(txt, '1');
                            window.Shutdown(isClose);
                        }
                    })
                }
            } else {
                message(res.retmsg);
            }
        }).catch(err => {
            console.log(err);
        })
    }

    isOnline = () => {
        let req = {
            command_id: "ONLINE",
        }
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then(res => {
            return res && res.online == 0;
        }).catch(err => {
            console.log(err);
        })
    }

    selctOrderData = (callBack = () => { }, mark = 0) => {
        let req = {
            command_id: "GETSYNCOUNT",
            mark,
        }
        Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then(res => {
            if (res.retflag === "0") {
                if (res.synflag === "0") {
                    if (mark === 1) {
                        this.props.setState({ uploadData: 1 });
                    } else {
                        this.beginSyn();
                    }
                } else {
                    mark === 1 && this.props.setState({ uploadData: 0 });
                    callBack();
                }
            } else {
                console.log(res.retmsg);
                callBack();
            }
        }).catch(err => {
            console.log(err);
        })
    }

    /**
     * 根据预览效果分割数据
     * @param start
     * @param end
     * @string flag 需要在那个位置插入虚线以逗号分割的字符串
     * @returns {any[]}
     */
    repPreview = (start, end, flag) => {
        let { sumDetail } = this.state;
        return sumDetail.slice(start, end).map((item, key) => {
            let sign;
            if (item.name === 'DELIVERY SALES') {
                if (item.amount < 0) {
                    item.amount *= -1;
                    item.minus = '-';
                }
            } else if (!item.minus && item.value && parseInt(item.value) < 0) {
                sign = true;
                item.value = (parseFloat(item.value) * -1).toFixed(2);
                item.minus = '-';
            }

            return (item.amount > 0 || item.value > 0) || (end === 4 && key < 4) ?
                <React.Fragment key={key}>
                    <div className="ticket_content">
                        <div className="item_title">{item.name}</div>
                        <div className="item_content">
                            <div className="cont_num">
                                {item.name !== 'NET CASH' ? item.amount : ''}{(item.minus || sign) ? '-' : ' '}$
                            </div>
                            <div className="cont_amount">
                                {item.value || 0.00}
                            </div>
                        </div>
                    </div>
                    {
                        (flag.includes(key) && this.isNullData(sumDetail, flag, key, end)) ?
                            <div className="ticket_content">
                                <div className="item_title"></div>
                                <div className="item_content">
                                    ---------------------
                                </div>
                            </div> : null
                    }
                </React.Fragment> : null
        })
    }

    isNullData = (data, range, index, end) => {
        let flag = false, sliceRange;
        sliceRange = range.split(',');
        end = parseInt(sliceRange[1]) === index ? parseInt(sliceRange[1]) : end;
        for (; index < end; index++) {
            if (data[index].amount > 0 || data[index].value > 0) {
                flag = true;
                break;
            }
        }
        return flag;
    }


    /**
     * 银行清机数据生成
     * @returns {Array}
     * @constructor
     */
    bankPreview = () => {
        let info = this.state.bankDetail, arrPreview = [], seq = 1;
        let getTitle = (key) => {
            switch (key) {
                case 'bankInfo':
                    return 'EDC TOTAL';
                    break;
                case 'bankDiff':
                    return 'DIFFERENCE';
                    break;
                case 'bankStatus':
                    return 'SETTLEMENT STATUS';
                    break;
            }
        }
        for (let key in info) {
            let preview =
                <div key={key}>
                    <div key={seq++}>
                        {getTitle(key)} <br />
                        {
                            info[key].map((item, index) =>
                                item.num !== 0 ?
                                    <div
                                        className="ticket_content" key={index}>
                                        <div
                                            className="item_title">{item.name}</div>
                                        <div
                                            className="item_content">
                                            {
                                                key === 'bankStatus' ?
                                                    <div
                                                        className="cont_num"
                                                        style={{ paddingLeft: 20 }}>
                                                        {item.status || 'F'}
                                                    </div> :
                                                    <React.Fragment>
                                                        <div
                                                            style={{
                                                                width: 45,
                                                                textAlign: 'right'
                                                            }}>
                                                            {item.num}{item.minus || ' '}$
                                                        </div>
                                                        <div>
                                                            {item.amount || '0.00'}
                                                        </div>
                                                    </React.Fragment>
                                            }
                                        </div>
                                    </div> : null
                            )
                        }
                    </div>
                    <div className="separation">
                        {previewLine}
                    </div>
                    {
                        key === 'bankStatus' && <div>EDC SETTLEMENT<span
                            style={{ marginLeft: 150 }}>{this.state.bankService ? 'S' : 'F'}</span>
                            <br /></div>
                    }
                </div>
            arrPreview.push(preview);
        }
        if (!this.state.doingEDC && this.state.bankService) {
            arrPreview.push(<div key={'998'} style={{ fontSize: 17 }}>EDC
                SETTLEMENT STATUS -NOT SELECT</div>)
            arrPreview.push(<div key={'999'}
                className="separation"> {previewLine}</div>);
        }
        return arrPreview;
    }

    //游戏币清机预览
    gmRoomPreview = () => {
        let { fantasyList, fantasyDate } = this.state, arrPreview = [], k = 0;
        const gmPreview = (item, desAlign = 'left') =>
            arrPreview.push(<Row className={'gm_room'} gutter={8} key={k++}>
                <Col span={8}>{item.item}</Col>
                <Col span={10}
                    style={{ textAlign: desAlign }}>{item.description}</Col>
                <Col span={3} style={{ textAlign: 'right' }}>{item.qty}</Col>
                <Col span={3} style={{ textAlign: 'right' }}>{item.tkn}</Col>
            </Row>);

        if (fantasyList && fantasyList.checkList && fantasyList.checkList.length > 0) {
            arrPreview.push(<div className={'gm_room'}
                style={{ textAlign: 'center' }}
                key={101}>**Fantasy Tokens Quantity
                Checklist**</div>)
            arrPreview.push(<div className="separation"
                key={102}>{previewLine}</div>);
            arrPreview.push(<div className={'gm_room'} key={106}
                style={{ paddingLeft: 30 }}>{'Cashier ID :'} &nbsp;&nbsp;{this.state.operators || this.props.operators}</div>);
            arrPreview.push(<div className={'gm_room'} key={104}
                style={{ paddingLeft: 30 }}>{'Date & Time  :'}&nbsp;&nbsp;{fantasyDate}</div>);
            arrPreview.push(<div className="separation"
                key={105}>{previewLine}</div>);
            gmPreview({
                item: 'Item',
                description: 'Description',
                qty: 'Qty',
                tkn: 'Tkn'
            });
            gmPreview({
                item: '-------------',
                description: '----------------',
                qty: '----',
                tkn: '----'
            });
            fantasyList.checkList.forEach((item) => gmPreview(item))
            gmPreview({
                item: '=============',
                description: '=================',
                qty: '====',
                tkn: '===='
            });
            gmPreview({
                item: '',
                description: 'Total ：',
                qty: fantasyList.totalQty,
                tkn: fantasyList.totalTkn
            }, 'right');
            arrPreview.push(<div className="separation"
                key={103}>{previewLine}</div>);
            return arrPreview;
        }
    }

    //员工清机
    staffRp = () => {
        let req = {
            mkt: this.props.initialize.mkt,
            syjh: this.props.initialize.syjh,
            erpCode: this.props.initialize.erpCode,
            syjcursyyh: this.state.operators || this.props.operators,
            command_id: "RYCLEARSYJ",
        };
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then(res => {
            if (res.retflag === "0") {
                res.module = 'EmpPrint';
                this.setState({ bankService: false });
                this.constructPrintParam(res);
            } else {
                message(res.retmsg);
            }
            return res.retflag;
        }).catch(err => {
            console.log(err);
        });
    }

    //收银机清机
    cashierRp = () => {
        let req = {
            mkt: this.props.initialize.mkt,
            syjh: this.props.initialize.syjh,
            erpCode: this.props.initialize.erpCode,
            command_id: "CLEARSYJ",
            syjcursyyh: this.props.operators,
        };
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then(res => {
            if (res.retflag === "0") {
                let that = this;
                let octStatus = false, payOctopus;
                that.props.initialize.Syspara.payObj.map((item) => {
                    if (item.split(',')[0] == "payOctopus") {
                        payOctopus = item.split(',')[1];
                    }
                });
                that.props.initialize.data.paymode.map((item) => {
                    if (payOctopus === item.code) {
                        octStatus = true;
                    }
                });
                res.module = 'ClearCashierPrint';
                that.setState({ bankService: true, edcMask: true });
                setTimeout(() => {
                    that.constructPrintParam(res, () => {
                        window['ClearMachine'](that.state.doingEDC);
                    });
                }, 100);
            } else {
                message(res.retmsg);
            }
            return res.retflag;
        }).catch(err => {
            console.log(err);
        });
    }

    fundPay = () => {
        let that = this;
        console.log("fund::: ", this.props)
        FundPay.open({
            data: {
                payinMode: this.props.initialize.data.payinmode,
                extra: {
                    terminalNo: this.props.initialize.syjh,
                    terminalOperator: this.props.operuser.gh,
                    shopCode: this.props.initialize.mkt,
                    erpCode: this.props.operuser.erpCode
                }
            },
            callback: (_data) => {
                // that.setState({
                // });
            }
        })
    }

    //开启银行清机
    getBankData = (allPay = []) => {//this.getBankData(allPay);
        let differenceData = [], bankInfo = {}, clearNull = [], paramStr = '',
            creditIndx = allPay.length - 1;
        if (this.state.doingEDC) {
            paramStr = '?#pwd=000000#isSettlement=true';
        } else {
            paramStr = '?#pwd=000000';
        }
        let dataDetail = window['PaymentBank'](JSON.stringify({ command: paramStr }));
        if (!dataDetail || !dataDetail.success) {
            templetData.map(data => {
                let obj = {};
                let info = allPay.find(item => item.name === data.name);
                obj.status = 'F';
                obj.num = info.num;
                obj.amount = info.amount ? info.amount.toFixed(2) : '0.00';
                obj.name = info.name;
                return differenceData.push(obj);
            }); //计算差异值
            bankInfo.bankInfo = templetData;
            bankInfo.bankDiff = differenceData;
            bankInfo.bankStatus = templetData;
        } else {
            dataDetail.object.cardTotals.forEach((item, indx) => {
                let data = templetData.find(temp => temp.cardCode === item.cardCode);
                if (data) {
                    item.name = data.name;
                    item.status = item.status || 'F';
                    item.index = data.index;
                } else {
                    delete dataDetail.object.cardTotals[indx];
                }
            });

            templetData.forEach((item, index) => {
                let data = dataDetail.object.cardTotals.find(temp => temp && temp.name === item.cardCode);
                if (!data) {
                    dataDetail.object.cardTotals.push(item);
                }
            })

            //补齐数据
            dataDetail.object.cardTotals.forEach(data => {//计算差异值
                let info = { ...allPay.find(item => item.name === data.name) };
                info.amount = info.amount - data.amount;
                info.num = info.num - data.num;
                info.index = data.index;
                info.amount = info.amount ? info.amount.toFixed(2) : '0.00';
                differenceData.push(info);
            });
            dataDetail.object.cardTotals.map(item => {
                item.amount = parseFloat(item.amount || 0).toFixed(2);
            });

            dataDetail.object.cardTotals = this.arraySort(dataDetail.object.cardTotals);
            //dataDetail.object.cardTotals.split(dataDetail.object.cardTotals.length - 1, dataDetail.object.cardTotals.length);
            dataDetail.object.cardTotals.forEach(item => item && clearNull.push(item));
            differenceData = this.arraySort(differenceData);
            bankInfo.bankInfo = clearNull;
            bankInfo.bankDiff = differenceData;
            bankInfo.bankStatus = clearNull;
        }
        if (creditIndx > -1) {
            let last = allPay.length - 1;
            let temp = allPay[creditIndx];
            allPay[creditIndx] = allPay[last];
            allPay[last] = temp;
        }
        return { allPay, bankInfo };
    }

    //上传离线数据
    offlineDataUp = () => {
        let req = {
            command_id: 'UPLOADPAYSTATISTICSINFO',
            mkt: this.props.initialize.mkt,
            syjh: this.props.initialize.syjh,
            erpCode: this.props.initialize.erpCode,
        };
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then(res => {
            return res.retflag === "0";
        }).catch(err => {
            console.log(err);
        });
    }

    //构造打印参数
    constructPrintParam = (params, callback) => {
        try {
            let entryItme = [], allPay = [], sameData = {}, bankData = {},
                sumDetail, payTemp, state, salesOnCredit, stamp, ascLast = 0,
                others = {},
                payAll = [...amountByPayAll],
                eCoupon = {
                    index: 27,
                    cardCode: '',
                    name: 'E COUPON',
                    amount: 0,
                    num: 0,
                };
            for (let key in params) {
                let obj = {}, convt = this.keyvalueConv(key);
                if (convt) {
                    obj.minus = convt.minus;
                    obj.value = params[key];
                    obj.index = convt.index;
                    obj.name = convt.name;
                    entryItme.push(obj);
                }
            }
            sumDetail = this.arraySort(entryItme);

            if (parseFloat(sumDetail[15].value) < 0) {
                sumDetail[15].value = (parseFloat(sumDetail[15].value) * -1) + '';
                sumDetail[15].minus = '-';
            }
            if (parseFloat(sumDetail[12].value) < 0) {
                sumDetail[12].value = (parseFloat(sumDetail[12].value) * -1) + '';
                sumDetail[12].minus = '-';
            }

            sumDetail.map(item => {
                item.value = parseFloat(item.value).toFixed(2);
            });
            sumDetail[0].amount = params.saleOrderCount;//saleOrderCount
            sumDetail[1].amount = params.returnOrderCount;//returnOrderCount
            sumDetail[2].amount = params.dcOrderCount;//dcOrderCount

            payTemp = params.amountByPayAll;
            sumDetail[12].amount = { ...sumDetail[12] }.value;
            allPay.push(sumDetail[12]);
            for (let key in payTemp) {
                let obj = {}, convt = this.mappingPayName(key);
                if (convt) {
                    obj.name = convt.name;
                    obj.index = convt.index;
                    obj.amount = payTemp[key].amount;
                    obj.num = payTemp[key].num;
                    obj.cardCode = key;
                    allPay.push(obj);
                }

                if (key.includes('ACS分期')) {
                    ascLast += payTemp[key].amount;
                }
            }
            sumDetail[5].value = parseFloat(sumDetail[5].value) + ascLast;
            sumDetail[5].value = sumDetail[5].value ? new Number(sumDetail[5].value).toFixed(2) : '0.00';

            //积分换购和积分折现 统计
            if (payTemp['0707']) {
                eCoupon.num += payTemp['0707'].num;
                eCoupon.amount += payTemp['0707'].amount;
            }
            if (payTemp['0800']) {
                eCoupon.num += payTemp['0800'].num;
                eCoupon.amount += payTemp['0800'].amount;
            }
            allPay.push(eCoupon);

            payAll.forEach((temp, index) => {
                let data = allPay.find(item => temp.name === item.name);
                if (data) {
                    payAll[index] = data;
                }
            });

            allPay = this.arraySort(payAll);

            let netCash = { name: 'NET CASH' };
            if (params.netCash < 0) {
                netCash.amount = params.netCash * -1;
                netCash.minus = '-';
            } else {
                netCash.amount = params.netCash;
            }

            allPay.unshift(netCash);
            allPay.push({
                name: 'SALES ON CREDIT',
                amount: params.salesOnCredit
            });

            stamp = this.constructStamp(params);

            //收银机清机获取银行清机数据
            if (this.state.index === 1) {
                bankData = this.getBankData(allPay);
                others.state = this.state.bankService ? 'S' : 'F';
                if (!this.state.doingEDC) {
                    others.bankStatus = undefined;
                    delete bankData.bankInfo['bankStatus'];
                }
            } else if (this.state.index === 0) {
                others.currentoperat = this.state.operators || this.props.operators;
            }

            if (stamp) { //按照正常数据格式给打印
                let printStamp = this.constructStamp(params);
                printStamp[1].amount = 0;//
                others.stamp = printStamp;
            }

            /**同步ejoural**/
            sumDetail.slice(4, 18).forEach(item => {
                if (item.minus) {
                    let value = item.value && parseInt(item.value);
                    value === 0 && delete item.minus;
                }
            })

            let py = bankData.allPay || allPay;
            for (let i = 0, len = py.length; i < len; i++) {
                if (py[i].amount < 0) {
                    py[i].minus = '-';
                    py[i].amount = parseFloat(py[i].amount) * -1;
                }
            }

            let bd = bankData.bankInfo || {};
            for (let key in bd) {
                if (key !== 'bankStatus') {
                    for (let i = 0, len = bd[key].length; i < len; i++) {
                        let item = bd[key][i];
                        item.minus = '';
                        if (item.num < 0) {
                            item.minus = '-';
                            item.num = item.num * -1;
                        }
                    }
                }
            }

            params.fantasyList = this.state.isfantasy ? params.fantasyList : {}; //判断当前收银机是否支持游戏币清机

            this.setState({
                stamp: stamp,
                sumDetail: sumDetail,
                payDetail: py,
                bankDetail: bd,
                fantasyList: params.fantasyList, //游戏币清机数据
                fantasyDate: moment().format('DD') + '-' + shorterForm[moment().format('MM')] + '-' + moment().format('YYYY') + ' ' + moment().format('HH:mm:ss'),
                edcMask: false,//预览关闭一切罩层
            }, () => {
                let head = {
                    syyh: this.props.operators,//登录收银员卡号
                    printtype: "0", //0代表热敏打印，1代表平推
                    rqsj: moment().format('DD/MM/YYYY HH:mm:ss'),//打印报表时间
                    mktname: this.props.initialize.data.mktinfo.mktname,//门店号名称
                    mkt: this.props.initialize.mkt,
                    titleDt: sumDetail.slice(0, 4),
                    midDt: sumDetail.slice(4, 12),
                    footDt: sumDetail.slice(12, 18),
                    payDetail: py,//支付方式明细
                    syjh: this.props.initialize.syjh,
                    authCard: this.props.authCard || this.props.operators,
                    isOtp: this.state.index === 1 && this.state.doingEDC ? 'Y' : 'N',
                    ...this.state.bankDetail,
                    ...others,
                    barcodeString: this.props.initialize.mkt + this.props.initialize.syjh + moment().format('YYMMDD') + this.props.initialize.syjh + this.props.initialize.fphm,//门店号+收银机号+小票号
                };
                window.Print({
                    Module: params.module,
                    head: [head],
                }, () => {
                    this.gamePrint({
                        fantasyList: params.fantasyList,
                        fantasyDate: this.state.fantasyDate, ...head
                    }, () => {
                        this.voucherPrint({ couponTotalMoney: payTemp['0506'].amount, ...head }, () => {
                            this.ejouralRecord(others.stamp);
                            callback && setTimeout(callback, 500);
                            // window.getCashboxStatus();
                            if (this.props.initialize.online === '1') {
                                if (this.state.index === 1) {
                                    this.offlineDataUp().then(success => {
                                        if (success) {
                                            this.selctOrderData();
                                        } else {
                                            this.offlineDataUp().then(res => {
                                                this.selctOrderData();
                                            })
                                        }
                                    }).catch(e => console.log(e));
                                } else {
                                    this.selctOrderData();
                                }
                            }
                        });
                    });
                });
            });
        } catch (e) {
            message(this.intlLocales("INFO_CLEARDATAERROR"));
            this.setState({ edcMask: false });
        }
    }

    //游戏币清机打印
    gamePrint = (params, callback) => {
        let { fantasyList, fantasyDate } = params;
        if (!(params.fantasyList && params.fantasyList.checkList && params.fantasyList.checkList.length > 0)) {
            callback();
            return;
        }
        window.Print({
            Module: 'GameRoomPrint',
            head: [{
                rqsj: fantasyDate,//打印报表时间
                syyh: this.state.operators || this.props.operators,//收银员
                fantasyList,
                printtype: '0',
            }],
        }, callback);
    }


    //券清机打印
    voucherPrint = (params, callback) => {
        if (this.state.index === 0) {
            let { mkt, rqsj, syyh, syjh, couponTotalMoney } = params;
            window.Print({
                Module: 'voucherPrint',
                head: [{
                    mkt,
                    rqsj,//打印报表时间
                    syyh: this.state.operators || this.props.operators,//收银员
                    syjh,
                    couponTotalMoney,
                    printtype: '0',
                }],
            }, callback);
        } else {
            callback();
        }
    }

    //印花数据构成
    constructStamp = (params) => {
        let stamp = [];
        stamp.push({ name: 'PAYOUT E', amount: parseInt(params.stampPayoutE) });
        stamp.push({ name: 'PAYOUT P', amount: '***' });//客户要求改成***
        stamp.push({ name: 'REDEEM E', amount: parseInt(params.stampRedeemE) });
        stamp.push({ name: 'REDEEM P', amount: parseInt(params.stampRedeemP) });
        return stamp;
    }


    //根据索引排序
    arraySort = (arr) => {
        arr.sort(function (x, y) {
            if (x.index < y.index) {
                return -1;
            }
            if (x.index > y.index) {
                return 1;
            }
            return 0;
        });
        return arr;
    }

    ejouralRecord = (stamp) => {
        const addTxt = (item, symbol = '$') =>
            `\r\n${fillRight(item.name, 20)}${fillLeft(item.num > -1 ? item.num : ' ', 5)}${item.minus || ' '}${symbol}${fillLeft(parseFloat(item.amount).toFixed(2), 10)}`;
        const dividingLine = '\r\n=====================================';
        let { payDetail, bankDetail, sumDetail, index, operators } = this.state;
        let { mkt, syjh } = this.props.initialize;
        let ejouralList = [], ejouralText = '', isBank = false;

        ejouralList.push(`\r\n  REGISTER TAKINGS & BANKING REPORT`);
        ejouralList.push(`\r\n  SHOP ${mkt}/${syjh}  ${moment().format('DD/MM/YY')}   ${moment().format('HH:mm:ss')} `);
        ejouralList.push(`\r\n  OPERATOR : ${this.props.operators}`);
        if (index === 0) {
            ejouralList.push(`\r\n  BANKING LIST BY CASHIER = ${operators || this.props.operators}`);
        } else {
            ejouralList.push(`\r\n  BANKING LIST BY TERMINAL = ${syjh}`);
        }
        ejouralList = [...ejouralList, ...this.dataCut(sumDetail.slice(0, 4), '2')];
        ejouralList.push(dividingLine);
        payDetail.forEach(item => {
            ejouralList.push(addTxt(item));
        });
        ejouralList.push(dividingLine);
        ejouralList = [...ejouralList, ...this.dataCut(sumDetail.slice(4, 12), '6')];
        ejouralList = [...ejouralList, ...this.dataCut(sumDetail.slice(12, 18), '2,4')];


        const addTxtStamp = (item, space) =>
            `\r\n${fillRight(item.name, 8)}${Array(space).join(" ")}${fillLeft(item.amount, (item.amount + '').length)}`;
        ejouralList.push(dividingLine);
        ejouralList.push('\r\nSTAMP');
        stamp.forEach(item => ejouralList.push(addTxtStamp(item, 36 - (item.name + item.amount).length)));


        for (var key in bankDetail) {
            isBank = true;
            ejouralList = [...ejouralList, ...this.bankDataCut(bankDetail[key], key)];
        }

        if (isBank) {
            if (this.state.doingEDC) {
                ejouralList.push(dividingLine);
                ejouralList.push(`\r\n${fillRight('EDC SETTLEMENT', 21)}${fillLeft(this.state.bankService ? 'S' : 'F', 1)}`);
                ejouralList.push(dividingLine);
                ejouralList.push('\r\nOCTOPUS SETTLEMENT');
                ejouralList.push(dividingLine);
            } else {
                ejouralList.push(dividingLine);
                ejouralList.push('\r\nEDC SETTLEMENT STATUS -NOT SELECT');
                ejouralList.push(dividingLine);
            }
            ejouralList.push(`\r\n${this.props.authCard || this.props.operators}`);
        } else {
            ejouralList.push(dividingLine);
            ejouralList.push(`\r\n${this.props.authCard || this.props.operators}`);
        }
        ejouralList.push(fillRight('\r\n*------ END OF LISTING ------*'));

        ejouralList.forEach(item => {
            ejouralText += item;
        });
        window.Log(ejouralText, '1');
    }

    //服务器数据清机
    dataCut = (data, flag) => {
        let ejouralList = [];
        data.forEach((item, key) => {
            let minu, sign;
            let isSp = item.name === 'AEON WALLET ADD VALUE'; //这个字段比较特殊长度22，并且永旺暂时不用
            let br = item.name === 'ACTUAL MEDIA';//遇见这个字符换行
            if (item.name === 'DELIVERY SALES') {
                minu = !!item.minus;
            } else {
                if (item.minus) {
                    let amount = item.value && parseInt(item.value);
                    minu = amount !== 0;
                }
                if (!item.minus && item.value && parseInt(item.value) < 0) {
                    sign = true;
                    item.value = parseInt(item.value) * -1;
                }
            }
            let ejouralText = `\r\n${fillRight(item.name, isSp ? 21 : 20)}${fillLeft((item.name !== 'NET CASH' ? (item.amount || typeof item.amount === 'number') ? item.amount : ' ' : ' '), isSp ? 4 : 5)}`;
            ejouralText += `${(minu || sign) ? '-' : ' '}$${fillLeft(item.value || 0.00, 10)}`;
            ejouralText += `${br ? '\r\n' : ''}`
            if (flag.includes(key)) {
                ejouralText += '\r\n                     ----------------';
            }
            ejouralList.push(ejouralText);
        });
        return ejouralList;
    }

    //银行POS数据清机
    bankDataCut = (data, key) => {
        let title = '', ejouralList = [];
        if (key === 'bankStatus' && !this.state.doingEDC) {
            return '';
        }
        switch (key) {
            case 'bankInfo':
                title = 'EDC TOTAL';
                break;
            case 'bankDiff':
                title = 'DIFFERENCE';
                break;
            case 'bankStatus':
                title = 'SETTLEMENT STATUS';
                break;
            default:
                break;
        }
        ejouralList.push(`\r\n${title}`);
        data.forEach(item => {
            //let ejouralText = '\r\n ';
            let status = key === 'bankStatus';
            let ejouralText = `\r\n${fillRight(item.name, status ? 21 : 20)}`;
            if (status) {
                ejouralText += `${fillLeft(item.status || 'F', 1)}`;
            } else {
                ejouralText += `${fillLeft(item.num, 5)}${item.minus || ' '}$${fillLeft(parseFloat(item.amount).toFixed(2) || 0.00, 10)}`;
            }
            ejouralList.push(ejouralText);
        });
        ejouralList.unshift('\r\n=====================================');
        return ejouralList;
    }


    keyvalueConv = (key) => {
        let obj = {};
        switch (key) {
            case 'difference':
                obj.index = 18;
                obj.name = 'DIFFERENCE';
                obj.minus = '-';
                return obj;//差异金额
                break;
            case 'preCommit':
                obj.index = 17;
                obj.name = 'PRE-COMMIT';
                obj.minus = '-';
                return obj;//已缴现金金额
                break;
            case 'cashOnBook':
                obj.index = 16;
                obj.name = 'REG. CASH ON BOOK';
                return obj;//已缴现金金额
                break;
            case 'middleCollection':
                obj.index = 15;
                obj.name = 'MIDDLE COLLECTION';
                obj.minus = '-';
                return obj;//中途交收金额
                break;
            case 'loan':
                obj.index = 14;
                obj.name = 'LOAN';
                return obj;//入金金额
                break;
            case 'netCash':
                obj.index = 13;
                obj.name = 'NET CASH';
                return obj;//净现金金额
                break;
            case 'mediaTotal':
                obj.index = 12;
                obj.name = 'MEDIA TOTAL';
                return obj;//按订单类型金额汇总
                break;
            case 'aeonWalletAddValue':
                obj.index = 11;
                obj.name = 'AEON WALLET ADD VALUE';
                return obj;//永旺钱包增值
                break;
            case 'octopusTopUp':
                obj.index = 10;
                obj.name = 'OCTOPUS TOP UP';
                obj.minus = '-';
                return obj;//找零八达通增值
                break;
            case 'octopusAddValue':
                obj.index = 9;
                obj.name = 'OCTOPUS ADD VALUE';
                obj.minus = '-';
                return obj;//八达通增值金额
                break;
            case 'hpBalance':
                obj.index = 8;
                obj.name = 'H/P BALANCE';
                obj.minus = '-';
                return obj;//分期付款中已支付金额
                break;
            case 'depositsAmount':
                obj.index = 7;
                obj.name = 'DEPOSITS AMOUNT';
                obj.minus = '-';
                return obj;//按金金额
                break;
            case 'accountPayment':
                obj.index = 6;
                obj.name = 'ACCOUNT PAYMENT';
                obj.minus = '-';
                return obj;//收尾款的金额
                break;
            case 'actualMedia':
                obj.index = 5;
                obj.name = 'ACTUAL MEDIA';
                return obj;//支付方式金额汇总
                break;
            case 'saleOrderMoney':
                obj.index = 1;
                obj.name = 'TOTAL SALES';
                return obj;
                break;
            // case 'saleOrderCount':
            //     obj.index = 1;
            //     obj.name = 'TOTAL SALES';
            //     return obj;
            case 'returnOrderMoney':
                obj.index = 2;
                obj.name = 'REFUNDS';
                return obj;
                break;
            // case 'returnOrderCount':
            //     obj.index = 2;
            //     obj.name = 'REFUNDS';
            //     return obj;
            //     break;
            case 'dcOrderMoney':
                obj.index = 3;
                obj.name = 'DELIVERY SALES';
                return obj;
                break;
            // case 'dcOrderCount':
            //     obj.index = 3;
            //     obj.name = 'DELIVERY SALES';
            //     return obj;
            //     break;
            case 'netSales':
                obj.index = 4;
                obj.name = "NET SALES";
                return obj;//净销售金额
                break;
            default:
                return null;
        }
    }

    mappingPayName = (key) => {
        let obj = {};
        //code需修改成总部的code
        switch (key) {
            case 'JCB':
                obj.index = 1;
                obj.name = 'JCB';
                return obj;
                break;
            case 'VISA CARD':
                obj.index = 2;
                obj.name = 'VISA CARD';
                return obj;
                break;
            case 'MASTER CARD':
                obj.index = 3;
                obj.name = 'MASTER CARD';
                return obj;
                break;
            case '0506':
                obj.index = 4;
                obj.name = 'GIFT VOUCHER';
                return obj;
                break;
            case 'AMERICAN EXPRESS':
                obj.index = 5;
                obj.name = 'AMERICAN EXPRESS';
                return obj;
                break;
            case 'JUSCO AMEX CARD':
                obj.index = 6;
                obj.name = 'JUSCO AMEX CARD';
                return obj;
                break;
            case 'JUSCO VISA':
                obj.index = 7;
                obj.name = 'JUSCO VISA';
                return obj;
                break;
            case 'JUSCO MASTER':
                obj.index = 8;
                obj.name = 'JUSCO MASTER';
                return obj;
            case 'EPS':
                obj.index = 9;
                obj.name = 'EPS';
                return obj;
                break;
            case 'SCB HP':
                obj.index = 10;
                obj.name = 'SCB HP';
                return obj;
                break;
            case 'CUP':
                obj.index = 11;
                obj.name = 'CUP CARD';
                return obj;
                break;
            case 'MANHATTAN HP':
                obj.index = 12;
                obj.name = 'MANHATTAN HP';
                return obj;
                break;
            case 'JUSCO CUP CARD':
                obj.index = 13;
                obj.name = 'JUSCO CUP CARD';
                return obj;
                break;
            case 'JUSCO JCB CARD':
                obj.index = 14;
                obj.name = 'JUSCO JCB CARD';
                return obj;
                break;
            case 'SCB HP 06':
                obj.index = 15;
                obj.name = 'SCB HP06';
                return obj;
                break;
            case 'SCB HP 12':
                obj.index = 16;
                obj.name = 'SCB HP12';
                return obj;
                break;
            case 'SCB HP 24':
                obj.index = 17;
                obj.name = 'SCB HP24';
                return obj;
                break;
            case 'MANHATTAN HP 06':
                obj.index = 18;
                obj.name = 'MANHATTAN HP06';
                return obj;
                break;
            case 'MANHATTAN HP 12':
                obj.index = 19;
                obj.name = 'MANHATTAN HP12';
                return obj;
                break;
            case 'MANHATTAN HP 24':
                obj.index = 20;
                obj.name = 'MANHATTAN HP24';
                return obj;
                break;
            case 'JUSCO TEMP CARD':
                obj.index = 21;
                obj.name = 'JUSCO TEMP CARD';
                return obj;
                break;
            case 'DCC VISA CARD':
                obj.index = 22;
                obj.name = 'DCC VISA CARD';
                return obj;
                break;
            case 'DCC MASTER CARD':
                obj.index = 23;
                obj.name = 'DCC MASTER CARD';
                return obj;
                break;
            case '0403':
                obj.index = 24;
                obj.name = 'OCTOPUS';
                return obj;
                break;
            case '0503':
                obj.index = 25;
                obj.name = 'HSBC COUPON';
                return obj;
                break;
            case 'ACSWEB':
                obj.index = 26;
                obj.name = 'ACSWEB';
                return obj;
                break;
            case '0504':
                obj.index = 28;
                obj.name = 'BOC COUPON';
                return obj;
                break;
            case 'WeChat 2':
                obj.index = 29;
                obj.name = 'WECHAT 2';
                return obj;
                break;
            case 'WeChat':
                obj.index = 30;
                obj.name = 'WECHAT';
                return obj;
                break;
            case 'Alipay'://
                obj.index = 31;
                obj.name = 'ALIPAY';
                return obj;
                break;
            case 'HIRE PURCHASE':
                obj.index = 32;
                obj.name = 'HIRE PURCHASE';
                return obj;
                break;
            default:
                //DINRES CLUB；MOTHER CARD；KIDS CARD；FREEHP；PAYPASS；PREPAID CARD ADD VALUE
                return obj;
        }
    }

}

const amountByPayAll = [
    { "name": "JCB", index: 1, num: 0, amount: 0 },
    { "name": "VISA CARD", index: 2, num: 0, amount: 0 },
    { "name": "MASTER CARD", index: 3, num: 0, amount: 0 },
    { "name": "GIFT VOUCHER", index: 4, num: 0, amount: 0 },
    { "name": "AMERICAN EXPRESS", index: 5, num: 0, amount: 0 },
    { "name": "JUSCO AMEX CARD", index: 6, num: 0, amount: 0 },
    { "name": "JUSCO VISA", index: 7, num: 0, amount: 0 },
    { "name": "JUSCO MASTER", index: 8, num: 0, amount: 0 },
    { "name": "EPS", index: 9, num: 0, amount: 0 },
    { "name": "SCB HP", index: 10, num: 0, amount: 0 },
    { "name": "CUP CARD", index: 11, num: 0, amount: 0 },
    { "name": "MANHATTAN HP", index: 12, num: 0, amount: 0 },
    { "name": "JUSCO CUP CARD", index: 13, num: 0, amount: 0 },
    { "name": "JUSCO JCB CARD", index: 14, num: 0, amount: 0 },
    { "name": "SCB HP06", index: 15, num: 0, amount: 0 },
    { "name": "SCB HP12", index: 16, num: 0, amount: 0 },
    { "name": "SCB HP24", index: 17, num: 0, amount: 0 },
    { "name": "MANHATTAN HP06", index: 18, num: 0, amount: 0 },
    { "name": "MANHATTAN HP12", index: 19, num: 0, amount: 0 },
    { "name": "MANHATTAN HP24", index: 20, num: 0, amount: 0 },
    { "name": "JUSCO TEMP CARD", index: 21, num: 0, amount: 0 },
    { "name": "DCC VISA CARD", index: 22, num: 0, amount: 0 },
    { "name": "DCC MASTER CARD", index: 23, num: 0, amount: 0 },
    { "name": "OCTOPUS", index: 24, num: 0, amount: 0 },
    { "name": "HSBC COUPON", index: 25, num: 0, amount: 0 },
    { "name": "ACSWEB", index: 26, num: 0, amount: 0 },
    { "name": "E COUPON", index: 27, num: 0, amount: 0 },
    { "name": "BOC COUPON", index: 28, num: 0, amount: 0 },
    { "name": "WECHAT 2", index: 29, num: 0, amount: 0 },
    { "name": "WECHAT", index: 30, num: 0, amount: 0 },
    { "name": "ALIPAY", index: 31, num: 0, amount: 0 },
    { "name": "HIRE PURCHASE", index: 32, num: 0, amount: 0 },
];


const templetData = [
    {
        "amount": "0.00",
        "cardCode": "JCB",
        "name": "JCB",
        "hostName": "JCB",
        "num": 0,
        "index": 1,
        "status": "N",
    },
    {
        "amount": "0.00",
        "cardCode": "VISA CARD",
        "name": "VISA CARD",
        "hostName": "HKBANK",
        "num": 0,
        "index": 2,
        "status": "N",
    },
    {
        "amount": "0.00",
        "cardCode": "MASTER CARD",
        "name": "MASTER CARD",
        "hostName": "HKBANK",
        "num": 0,
        "index": 3,
        "status": "N",
    },
    {
        "amount": "0.00",
        "cardCode": "AMERICAN EXPRESS",
        "name": "AMERICAN EXPRESS",
        "hostName": "AMEX",
        "num": 0,
        "index": 4,
        "status": "N",
    },
    {
        "amount": "0.00",
        "cardCode": "JUSCO AMEX CARD",
        "name": "JUSCO AMEX CARD",
        "hostName": "AEON",
        "num": 0,
        "index": 5,
        "status": "N",
    },
    {
        "amount": "0.00",
        "cardCode": "JUSCO VISA",
        "name": "JUSCO VISA",
        "hostName": "AEON",
        "num": 0,
        "index": 6,
        "status": "N",
    },
    {
        "amount": "0.00",
        "cardCode": "JUSCO MASTER",
        "name": "JUSCO MASTER",
        "hostName": "AEON",
        "num": 0,
        "index": 7,
        "status": "N",
    },
    {
        "amount": "0.00",
        "cardCode": "EPS",
        "name": "EPS",
        "hostName": "EPS",
        "num": 0,
        "index": 8,
        "status": "N",
    },
    {
        "amount": "0.00",
        "cardCode": "CUP CARD",
        "name": "CUP CARD",
        "hostName": "CUP",
        "num": 0,
        "index": 9,
        "status": "N"
    },
    {
        "amount": "0.00",
        "cardCode": "JUSCO TEMP CARD",
        "name": "JUSCO TEMP CARD",
        "hostName": "AEON",
        "num": 0,
        "index": 10,
        "status": "N",
    },
    {
        "amount": "0.00",
        "cardCode": "DCC VISA CARD",
        "name": "DCC VISA CARD",
        "hostName": "HKBANK",
        "num": 0,
        "index": 11,
        "status": "N",
    },
    {
        "amount": "0.00",
        "cardCode": "DCC MASTER CARD",
        "name": "DCC MASTER CARD",
        "hostName": "HKBANK",
        "num": 0,
        "index": 12,
        "status": "N",
    },
    {
        "amount": "0.00",
        "cardCode": "JUSCO CUP CARD",
        "name": "JUSCO CUP CARD",
        "hostName": "AEON",
        "num": 0,
        "index": 13,
        "status": "N",
    },
    {
        "amount": "0.00",
        "cardCode": "JUSCO JCB CARD",
        "name": "JUSCO JCB CARD",
        "hostName": "AEON",
        "num": 0,
        "index": 14,
        "status": "N",
    }
    // {
    //     "amount": "0.00",
    //     "cardCode": "DINRES CLUB",
    //     "name": "DINRES CLUB",
    //     "hostName": "DINRES CLUB",
    //     "num": 0,
    //     "index": 7,
    //     "status": "N",
    // },
];

const mapStateToProps = (state) => {
    let initData = state.initialize;
    // let pms = [{"base":100,"cardPayType":"null","changeFlag":"Y","changeRate":1,"code":"1","currencyCode":"CNY","currencyFlag":"CNY","entId":2,"invoiceFlag":"N","lang":"CN","leafFlag":"Y","level":1,"maxAmount":999999,"minAmount":0,"name":"人民币","overflowFlag":"Y","parentCode":"1","parentId":"1603396626092033117","payCode":"01","payLevel":1,"payName":"人民币","paySCode":"RMB","payType":"1","pmid":"1616114226470927091","rate":1,"recordFlag":"N","returnPayFlag":"Y","roundPrecision":0.1,"roundType":"0","status":1,"virtualPayType":0},{"base":100,"cardPayType":"null","changeFlag":"Y","changeRate":1,"code":"1","currencyCode":"CNY","currencyFlag":"CNY","entId":2,"invoiceFlag":"N","lang":"CN","leafFlag":"Y","level":1,"maxAmount":999999,"minAmount":0,"name":"人民币","overflowFlag":"Y","parentCode":"1","parentId":"1603396626092033117","payCode":"01","payLevel":1,"payName":"人民币","paySCode":"RMB","payType":"1","pmid":"1616114226470927091","rate":1,"recordFlag":"N","returnPayFlag":"Y","roundPrecision":0.1,"roundType":"0","status":1,"virtualPayType":0},{"base":50,"cardPayType":"null","changeFlag":"Y","changeRate":1,"code":"2","currencyCode":"CNY","currencyFlag":"CNY","entId":2,"invoiceFlag":"N","lang":"CN","leafFlag":"Y","level":1,"maxAmount":999999,"minAmount":0,"name":"2","overflowFlag":"Y","parentCode":"1","parentId":"1603396626092033117","payCode":"01","payLevel":1,"payName":"人民币","paySCode":"RMB","payType":"1","pmid":"1616114226470927091","rate":1,"recordFlag":"N","returnPayFlag":"Y","roundPrecision":0.1,"roundType":"0","status":1,"virtualPayType":0},{"base":100,"cardPayType":"null","changeFlag":"Y","changeRate":1,"code":"1","currencyCode":"CNY","currencyFlag":"CNY","entId":2,"invoiceFlag":"N","lang":"CN","leafFlag":"Y","level":1,"maxAmount":999999,"minAmount":0,"name":"人民币","overflowFlag":"Y","parentCode":"1","parentId":"1603396626092033117","payCode":"01","payLevel":1,"payName":"人民币","paySCode":"RMB","payType":"1","pmid":"1616114226470927091","rate":1,"recordFlag":"N","returnPayFlag":"Y","roundPrecision":0.1,"roundType":"0","status":1,"virtualPayType":0},{"base":50,"cardPayType":"null","changeFlag":"Y","changeRate":1,"code":"2","currencyCode":"CNY","currencyFlag":"CNY","entId":2,"invoiceFlag":"N","lang":"CN","leafFlag":"Y","level":1,"maxAmount":999999,"minAmount":0,"name":"2","overflowFlag":"Y","parentCode":"1","parentId":"1603396626092033117","payCode":"01","payLevel":1,"payName":"人民币","paySCode":"RMB","payType":"1","pmid":"1616114226470927091","rate":1,"recordFlag":"N","returnPayFlag":"Y","roundPrecision":0.1,"roundType":"0","status":1,"virtualPayType":0},{"base":100,"cardPayType":"null","changeFlag":"Y","changeRate":1,"code":"1","currencyCode":"CNY","currencyFlag":"CNY","entId":2,"invoiceFlag":"N","lang":"CN","leafFlag":"Y","level":1,"maxAmount":999999,"minAmount":0,"name":"人民币","overflowFlag":"Y","parentCode":"1","parentId":"1603396626092033117","payCode":"01","payLevel":1,"payName":"人民币","paySCode":"RMB","payType":"1","pmid":"1616114226470927091","rate":1,"recordFlag":"N","returnPayFlag":"Y","roundPrecision":0.1,"roundType":"0","status":1,"virtualPayType":0},{"base":50,"cardPayType":"null","changeFlag":"Y","changeRate":1,"code":"2","currencyCode":"CNY","currencyFlag":"CNY","entId":2,"invoiceFlag":"N","lang":"CN","leafFlag":"Y","level":1,"maxAmount":999999,"minAmount":0,"name":"2","overflowFlag":"Y","parentCode":"1","parentId":"1603396626092033117","payCode":"01","payLevel":1,"payName":"人民币","paySCode":"RMB","payType":"1","pmid":"1616114226470927091","rate":1,"recordFlag":"N","returnPayFlag":"Y","roundPrecision":0.1,"roundType":"0","status":1,"virtualPayType":0},{"base":1,"cardPayType":"null","changeFlag":"N","changeRate":1,"code":"3","currencyCode":"CNY","currencyFlag":"CNY","entId":2,"invoiceFlag":"N","lang":"CN","leafFlag":"Y","level":1,"maxAmount":999999,"minAmount":0,"name":"3","overflowFlag":"N","parentCode":"4","parentId":"1603502395953162843","payCode":"3102","payLevel":1,"payName":"武汉通","payPattern":"A","paySCode":"wuhan tong","payType":"4","pmid":"1616113906655237478","rate":1,"recordFlag":"N","returnPayFlag":"N","roundPrecision":0.01,"roundType":"0","status":1,"virtualPayType":4},{"base":100,"cardPayType":"null","changeFlag":"Y","changeRate":1,"code":"1","currencyCode":"CNY","currencyFlag":"CNY","entId":2,"invoiceFlag":"N","lang":"CN","leafFlag":"Y","level":1,"maxAmount":999999,"minAmount":0,"name":"人民币","overflowFlag":"Y","parentCode":"1","parentId":"1603396626092033117","payCode":"01","payLevel":1,"payName":"人民币","paySCode":"RMB","payType":"1","pmid":"1616114226470927091","rate":1,"recordFlag":"N","returnPayFlag":"Y","roundPrecision":0.1,"roundType":"0","status":1,"virtualPayType":0},{"base":50,"cardPayType":"null","changeFlag":"Y","changeRate":1,"code":"2","currencyCode":"CNY","currencyFlag":"CNY","entId":2,"invoiceFlag":"N","lang":"CN","leafFlag":"Y","level":1,"maxAmount":999999,"minAmount":0,"name":"2","overflowFlag":"Y","parentCode":"1","parentId":"1603396626092033117","payCode":"01","payLevel":1,"payName":"人民币","paySCode":"RMB","payType":"1","pmid":"1616114226470927091","rate":1,"recordFlag":"N","returnPayFlag":"Y","roundPrecision":0.1,"roundType":"0","status":1,"virtualPayType":0},{"base":1,"cardPayType":"null","changeFlag":"N","changeRate":1,"code":"3","currencyCode":"CNY","currencyFlag":"CNY","entId":2,"invoiceFlag":"N","lang":"CN","leafFlag":"Y","level":1,"maxAmount":999999,"minAmount":0,"name":"3","overflowFlag":"N","parentCode":"4","parentId":"1603502395953162843","payCode":"3102","payLevel":1,"payName":"武汉通","payPattern":"A","paySCode":"wuhan tong","payType":"4","pmid":"1616113906655237478","rate":1,"recordFlag":"N","returnPayFlag":"N","roundPrecision":0.01,"roundType":"0","status":1,"virtualPayType":4},{"base":1,"cardPayType":"0","changeFlag":"N","changeRate":1,"code":"4","currencyCode":"CNY","currencyFlag":"CNY","entId":2,"invoiceFlag":"N","lang":"CN","leafFlag":"Y","level":1,"maxAmount":99999999.99,"minAmount":0,"name":"4","overflowFlag":"N","parentCode":"3","parentId":"1603502156877831422","payCode":"0301","payLevel":1,"payName":"信用卡","paySCode":"CNY","payType":"3","pmid":"1616114378514466781","rate":1,"recordFlag":"N","returnPayFlag":"Y","roundPrecision":0.01,"roundType":"0","status":1,"virtualPayType":3},{"base":100,"cardPayType":"null","changeFlag":"Y","changeRate":1,"code":"1","currencyCode":"CNY","currencyFlag":"CNY","entId":2,"invoiceFlag":"N","lang":"CN","leafFlag":"Y","level":1,"maxAmount":999999,"minAmount":0,"name":"人民币","overflowFlag":"Y","parentCode":"1","parentId":"1603396626092033117","payCode":"01","payLevel":1,"payName":"人民币","paySCode":"RMB","payType":"1","pmid":"1616114226470927091","rate":1,"recordFlag":"N","returnPayFlag":"Y","roundPrecision":0.1,"roundType":"0","status":1,"virtualPayType":0},{"base":50,"cardPayType":"null","changeFlag":"Y","changeRate":1,"code":"2","currencyCode":"CNY","currencyFlag":"CNY","entId":2,"invoiceFlag":"N","lang":"CN","leafFlag":"Y","level":1,"maxAmount":999999,"minAmount":0,"name":"2","overflowFlag":"Y","parentCode":"1","parentId":"1603396626092033117","payCode":"01","payLevel":1,"payName":"人民币","paySCode":"RMB","payType":"1","pmid":"1616114226470927091","rate":1,"recordFlag":"N","returnPayFlag":"Y","roundPrecision":0.1,"roundType":"0","status":1,"virtualPayType":0},{"base":1,"cardPayType":"null","changeFlag":"N","changeRate":1,"code":"3","currencyCode":"CNY","currencyFlag":"CNY","entId":2,"invoiceFlag":"N","lang":"CN","leafFlag":"Y","level":1,"maxAmount":999999,"minAmount":0,"name":"3","overflowFlag":"N","parentCode":"4","parentId":"1603502395953162843","payCode":"3102","payLevel":1,"payName":"武汉通","payPattern":"A","paySCode":"wuhan tong","payType":"4","pmid":"1616113906655237478","rate":1,"recordFlag":"N","returnPayFlag":"N","roundPrecision":0.01,"roundType":"0","status":1,"virtualPayType":4},{"base":1,"cardPayType":"0","changeFlag":"N","changeRate":1,"code":"4","currencyCode":"CNY","currencyFlag":"CNY","entId":2,"invoiceFlag":"N","lang":"CN","leafFlag":"Y","level":1,"maxAmount":99999999.99,"minAmount":0,"name":"4","overflowFlag":"N","parentCode":"3","parentId":"1603502156877831422","payCode":"0301","payLevel":1,"payName":"信用卡","paySCode":"CNY","payType":"3","pmid":"1616114378514466781","rate":1,"recordFlag":"N","returnPayFlag":"Y","roundPrecision":0.01,"roundType":"0","status":1,"virtualPayType":3},{"base":100,"cardPayType":"null","changeFlag":"Y","changeRate":1,"code":"1","currencyCode":"CNY","currencyFlag":"CNY","entId":2,"invoiceFlag":"N","lang":"CN","leafFlag":"Y","level":1,"maxAmount":999999,"minAmount":0,"name":"人民币","overflowFlag":"Y","parentCode":"1","parentId":"1603396626092033117","payCode":"01","payLevel":1,"payName":"人民币","paySCode":"RMB","payType":"1","pmid":"1616114226470927091","rate":1,"recordFlag":"N","returnPayFlag":"Y","roundPrecision":0.1,"roundType":"0","status":1,"virtualPayType":0},{"base":50,"cardPayType":"null","changeFlag":"Y","changeRate":1,"code":"2","currencyCode":"CNY","currencyFlag":"CNY","entId":2,"invoiceFlag":"N","lang":"CN","leafFlag":"Y","level":1,"maxAmount":999999,"minAmount":0,"name":"2","overflowFlag":"Y","parentCode":"1","parentId":"1603396626092033117","payCode":"01","payLevel":1,"payName":"人民币","paySCode":"RMB","payType":"1","pmid":"1616114226470927091","rate":1,"recordFlag":"N","returnPayFlag":"Y","roundPrecision":0.1,"roundType":"0","status":1,"virtualPayType":0},{"base":1,"cardPayType":"null","changeFlag":"N","changeRate":1,"code":"3","currencyCode":"CNY","currencyFlag":"CNY","entId":2,"invoiceFlag":"N","lang":"CN","leafFlag":"Y","level":1,"maxAmount":999999,"minAmount":0,"name":"3","overflowFlag":"N","parentCode":"4","parentId":"1603502395953162843","payCode":"3102","payLevel":1,"payName":"武汉通","payPattern":"A","paySCode":"wuhan tong","payType":"4","pmid":"1616113906655237478","rate":1,"recordFlag":"N","returnPayFlag":"N","roundPrecision":0.01,"roundType":"0","status":1,"virtualPayType":4},{"base":1,"cardPayType":"0","changeFlag":"N","changeRate":1,"code":"4","currencyCode":"CNY","currencyFlag":"CNY","entId":2,"invoiceFlag":"N","lang":"CN","leafFlag":"Y","level":1,"maxAmount":99999999.99,"minAmount":0,"name":"4","overflowFlag":"N","parentCode":"3","parentId":"1603502156877831422","payCode":"0301","payLevel":1,"payName":"信用卡","paySCode":"CNY","payType":"3","pmid":"1616114378514466781","rate":1,"recordFlag":"N","returnPayFlag":"Y","roundPrecision":0.01,"roundType":"0","status":1,"virtualPayType":3},{"base":1,"cardPayType":"a","changeFlag":"N","changeRate":1.00002,"code":"5","currencyCode":"CNY","currencyFlag":"ICBC","entId":2,"invoiceFlag":"N","lang":"CN","leafFlag":"Y","level":1,"maxAmount":99999,"minAmount":0,"name":"5","overflowFlag":"N","parentCode":"3","parentId":"1603502156877831422","payCode":"3114","payLevel":1,"payName":"ICBC","paySCode":"ICBC","payType":"3","pmid":"1639729915232307278","rate":1.00002,"recordFlag":"N","returnPayFlag":"Y","roundPrecision":0.01,"roundType":"0","status":1,"virtualPayType":0},{"base":1,"cardPayType":"a","changeFlag":"N","changeRate":1,"code":"6","currencyCode":"CNY","currencyFlag":"CNY","entId":2,"invoiceFlag":"N","lang":"CN","leafFlag":"Y","level":1,"maxAmount":999999.99,"minAmount":0,"name":"6","overflowFlag":"N","parentCode":"3","parentId":"1603502156877831422","payCode":"0299","payLevel":1,"payName":"银联","paySCode":"CUP","payType":"3","pmid":"1618118388654092814","rate":1,"recordFlag":"N","returnPayFlag":"Y","roundPrecision":0.01,"roundType":"0","status":1,"virtualPayType":3}];
    // initData.data.payinmode = pms;
    return {
        // initialize: initData,
        initialize: state.initialize,
        operuser: state.login.operuser,
        operators: state.login.operuser && state.login.operuser.gh,
    };
}

const mapDispatchToProps = (dispatch) => {
    return { setState: (data) => dispatch(setState(data)) }
}

export default connect(mapStateToProps, mapDispatchToProps)(withKeyBoard(ClearMachine));