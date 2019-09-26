import React, { Component } from 'react';
import moment from 'moment';
import intl from 'react-intl-universal';
import '../style/reserve.less'
import { Button, Modal, Row, Col, Pagination, Spin } from 'antd';
import { Fetch } from '@/fetch/';
import Url from '@/config/url.js';
import { connect } from 'react-redux';
import message from '@/common/components/message';
import withKeyBoard from '@/common/components/keyBoard';

class ReserveFund extends Component {

    constructor(props) {
        super(props)
        this.state = {
            amountDisplay: "",
            numberType: "",
            dateTime: '',
            minus: false,
            totalinsertcash: 0,
            todayhistory: [],
            pagination: {
                current: 1,
                defaultPageSize: 12
            },
            isPrint: false,
            //2 3 4 5
            // customNumber: [
            //     {name: "3000元", value: "3000"},
            //     {name: "5000元", value: "5000"},
            //     {name: "8000元", value: "8000"},
            //     {name: "10000元", value: "10000"},
            //     {name: "20000元", value: "20000"},
            //     {name: "30000元", value: "30000"},
            //     {name: "40000元", value: "40000"},
            //     {name: "50000元", value: "50000"},
            // ],
        };
        this.amount = React.createRef();
    }

    componentDidMount() {
        window['openCashbox']();
        let req = {
            mkt: this.props.initialize.mkt,
            syjh: this.props.initialize.syjh,
            erpCode: this.props.initialize.jygs,
            syjcursyyh: this.props.login.operuser.gh,
            command_id: 'GETINSERTCASHLOG' //获取入金记录
        };
        Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then(res => {
            if (res.retflag === "0") {
                let totalinsertcash = res.todayhistory.reduce((prev, cur) =>
                    cur.syjcurpreje + prev,
                    0);
                this.setState({
                    totalinsertcash,
                    todayhistory: res.todayhistory
                });
            } else {
                message(res.retmsg);
            }
        }).catch(err => {
            console.log(err);
        });
        this.setState({ dateTime: moment().format('YYYY-MM-DD') });
        let { update, fallback } = this.props.bind({
            "35": () => {
                this.props.onCancel('reserveModal');
            },
            "36": () => {
                this.confirmSubmit();
            }
        });
        this.bind = { update, fallback };
    }

    onChange = (page, pageSize) => {
        let { pagination } = this.state;
        pagination.current = page;
        this.setState({ pagination });
    }

    render() {
        let { onCancel, visible } = this.props;
        let { todayhistory, dateTime, pagination, totalinsertcash, isPrint } = this.state;
        return (
            <React.Fragment>
                <Modal
                    title={null}
                    visible={visible}
                    closable={false}
                    maskClosable={false}
                    footer={null}
                    mask={true}
                    zIndex={3}
                    width={888}
                    wrapClassName="vertical-center-modal"
                    bodyStyle={{ margin: 0, padding: 0 }}
                >
                    <div className="reserve">
                        <div
                            className="head">{this.intlLocales("RESERVE_TITLE")} {this.props.closeable ? null :
                                <img src={require("@/common/image/paytk_close.png")}
                                    alt=""
                                    onClick={() => onCancel('reserveModal')} />}
                        </div>
                        <div className="date_time">
                            日期: {dateTime}
                            <span>總計：<strong
                                style={{
                                    color: '#333',
                                    fontSize: 24
                                }}>{totalinsertcash}</strong></span>
                        </div>
                        <div className="mian_content">
                            <LeftSection intlLocales={this.intlLocales}
                                todayhistory={todayhistory}
                                pagination={pagination}
                                onChange={this.onChange} />
                            <RightSection intlLocales={this.intlLocales}
                                numberHandler={this.numberHandler}
                                preMoney={this.confirmSubmit}
                                state={this.state} />
                        </div>
                    </div>
                </Modal>
                {
                    isPrint ?
                        <div className="loading_mask" onClick={(e) => {
                            e.stopPropagation()
                        }}>
                            <Spin size="large" tip="打印中..." />
                        </div> : null
                }
            </React.Fragment>
        )
    }

    intlLocales = (key) => {
        return intl.get(key);
    }

    preMoney = () => {
        let { amountDisplay } = this.state;
        if (isNaN(parseFloat(amountDisplay))) {
            message(this.intlLocales("INFO_RESERVEMSG"));
            return;
        }
        let curCash = window["SyncCASHIER"]({});
        let req = {
            mkt: this.props.initialize.mkt,
            syjh: this.props.initialize.syjh,
            syjcurpreje: parseFloat(amountDisplay),
            syjcurcashje: parseFloat(amountDisplay) + parseFloat(curCash.cash), ///本地现金存量
            erpCode: this.props.initialize.erpCode,
            syjcursyyh: this.props.login.operuser.gh,
            command_id: 'PREMONEYCERTIFY',
        };
        this.setState({ isPrint: true });
        Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then(res => {
            if (res.retflag === "0") {
                this.ejouralRecord(res);
                window.Print({
                    Module: 'ReserveFundPrint',
                    head: [{
                        mkt: this.props.initialize.mkt,
                        syjh: this.props.initialize.syjh,//收银机号
                        syyh: this.props.login.operuser.gh || this.props.login.operuser.cardno,//收银员
                        printtype: "0", //0代表热敏打印，1代表平推
                        rqsj: moment().format('DD/MM/YYYY HH:mm:ss'),//交易时间
                        mktname: this.props.initialize.data.mktinfo.mktname,//门店号名称
                        cashLoanAmount: this.state.amountDisplay,//单笔金额
                        cashLoanNum: res.insertprecashcount,//交易笔数
                        cashLoanTotal: res.totalinsertcash || 0,//总金额
                        barcodeString: this.props.initialize.mkt + this.props.initialize.syjh + moment().format('YYMMDD') + this.props.initialize.syjh + this.props.initialize.fphm,//门店号+收银机号+小票号
                    }],
                }, () => {
                    let params = { cash: amountDisplay };
                    // window.getCashboxStatus();
                    window["SyncCASHIER"](params);
                    this.props.onCancel('reserveModal');
                });
            } else {
                this.setState({ isPrint: false });
                message(res.retmsg);
            }
        }).catch(err => {
            this.setState({ isPrint: false });
            console.log(err);
        })
    }

    ejouralRecord = ({ insertprecashcount, totalinsertcash }) => {
        const fillLeft = (value, n) =>
            (value + '').length < n ? (Array(n).join(" ") + value).slice(-n) : value;
        const fillRight = (value, n) =>
            (value + '').length < n ? (value + Array(n).join(" ")).substring(0, n) : value;
        const dividingLine = '\r\n-----------------------------------';

        let ejouralList = [], ejouralText = '';
        let { mkt, syjh } = this.props.initialize;
        let { amountDisplay } = this.state;
        let syyh = this.props.login.operuser.gh || this.props.login.operuser.cardno;//收银员
        ejouralList.push(`*** ENTER LOAN ***`);
        ejouralList.push(`\r\nSHOP ${mkt}/${syjh} ${moment().format('DD/MM/YY')} ${moment().format('HH:mm:ss')} `);
        ejouralList.push(`\r\n${fillRight(`OPERATOR : ${syyh}`, 21)} ${fillLeft('CASH LOAN', 12)}`);
        ejouralList.push(dividingLine);
        ejouralList.push(`\r\n${fillRight('CASH LOAN AMOUNT', 22)} $ ${fillLeft((totalinsertcash || 0), 9)}`);
        ejouralList.push(`\r\nTOTAL LOANS ${fillLeft('x ' + (insertprecashcount || 0), 6)}     $ ${fillLeft(amountDisplay, 9)}`);
        ejouralList.push(dividingLine);

        ejouralList.forEach(item => {
            ejouralText += item;
        });
        window.Log(ejouralText, '1');
    }

    numberHandler = (type, keyContent) => {
        switch (type) {
            case "customNumber":
                this.setState({
                    amountDisplay: keyContent,
                    numberType: "customNumber"
                });
                break;
            case "normalNumber":
                if (this.state.amountDisplay.length === 0 && keyContent === '0') {
                    return;
                }
                if ((Math.abs(this.state.amountDisplay) > 9999 || !this.state.amountDisplay) && keyContent === "+-") { //判断是否是四位数
                    return;
                }
                if (keyContent === "+-") {
                    this.setState({
                        minus: !this.state.minus,
                        amountDisplay: this.state.minus ? this.state.amountDisplay.slice(1) : "-" + this.state.amountDisplay,
                        numberType: "normalNumber"
                    });
                } else {
                    if (this.state.amountDisplay.length === 5) {
                        return;
                    }
                    if (keyContent === '.' && this.state.amountDisplay.includes('.')) {
                        return;
                    }
                    this.setState((prevState) => (
                        prevState.numberType === "customNumber" ? {
                            amountDisplay: keyContent,
                            numberType: "normalNumber"
                        } : {
                                amountDisplay: prevState.amountDisplay + keyContent,
                                numberType: "normalNumber"
                            }
                    ));
                }
                break;
            case "operationFunction":
                if (keyContent === "cancel") {
                    this.setState({
                        amountDisplay: "",
                        numberType: "operationFunction",
                        minus: false
                    });
                } else if (keyContent === "back") {
                    if (this.state.amountDisplay.length === 1 && this.state.minus) {
                        this.setState({ minus: false });
                    }
                    this.setState((prevState) => ({
                        amountDisplay: prevState.amountDisplay.slice(0, -1),
                        numberType: "operationFunction"
                    }));
                } else if (keyContent === "ok") {
                    this.setState({
                        amountDisplay: "",
                        numberType: "operationFunction"
                    });
                } else {

                }
                break;
            default:
                break;
        }
    }


    confirmSubmit = () => {
        let that = this;
        let modal = Modal.confirm({
            cancelText: '否',
            okText: '是',
            title: `溫馨提示`,
            className: 'vla-confirm',
            content: `是否確定$${this.state.amountDisplay}為入金的數量？`,
            onOk: () => {
                this.bind.fallback();
                that.preMoney();
            },
            onCancel: () => {
                this.bind.fallback();
                that.setState({
                    amountDisplay: ""
                });
            }
        });
        this.bind.update({
            "35": () => {
                this.bind.fallback();
                modal.destroy();
                this.setState({
                    amountDisplay: ""
                });
            },
            "36": () => {
                this.bind.fallback();
                modal.destroy();
                this.preMoney();
            }
        });
    }
}

const LeftSection = ({ intlLocales, todayhistory, pagination, onChange }) =>
    <div className="left_section">
        <div className="content">
            <Row className="table_head">
                <Col
                    span={6}>{intlLocales("TRANS_HOUR")}</Col>
                <Col
                    span={6}>收银机号</Col>
                <Col
                    span={6}>收银员号</Col>
                <Col span={6}>入金金额</Col>
            </Row>
            <div className="table_conent">
                {
                    todayhistory.slice((pagination.current - 1) * pagination.defaultPageSize, pagination.current * pagination.defaultPageSize).map((item, key) =>
                        <Row key={key}>
                            <Col span={6}>{item.syjcurtime.slice(11)}</Col>
                            <Col
                                span={6}>{item.syjh}</Col>
                            <Col span={6}>{item.syjcursyyh}</Col>
                            <Col span={6}>{item.syjcurpreje}</Col>
                        </Row>
                    )
                }
            </div>
        </div>
        <div className="table_foot">
            <Pagination simple hideOnSinglePage={true}
                current={pagination.current}
                onChange={onChange}
                defaultPageSize={pagination.defaultPageSize}
                total={todayhistory.length} />
        </div>
    </div>

const RightSection = ({ numberHandler, intlLocales, preMoney, state }) =>
    <div className="right_section">
        <div className="screen">
            <strong>￥:</strong>
            {/* <strong className="show">{state.amountDisplay}</strong> */}
            <input className="show" ref={this.amount} autoFocus value={state.amountDisplay} onChange={(e) => {
                numberHandler('customNumber', e.currentTarget.value);
            }}></input>
        </div>
        <div className="keyboard">
            <div className="up">
                <Button className="fixed_button"
                    onClick={() => numberHandler('customNumber', '2000')}>2000</Button>
                <Button className="fixed_button"
                    onClick={() => numberHandler('normalNumber', '7')}>7</Button>
                <Button className="fixed_button"
                    onClick={() => numberHandler('normalNumber', '8')}>8</Button>
                <Button className="fixed_button"
                    onClick={() => numberHandler('normalNumber', '9')}>9</Button>
                <Button className="fixed_button clear_button"
                    onClick={() => numberHandler("operationFunction", "cancel")}>{intlLocales("BTN_EMPTY")}</Button>
                <Button className="fixed_button"
                    onClick={() => numberHandler('customNumber', '3000')}>3000</Button>
                <Button className="fixed_button"
                    onClick={() => numberHandler('normalNumber', '4')}>4</Button>
                <Button className="fixed_button"
                    onClick={() => numberHandler('normalNumber', '5')}>5</Button>
                <Button className="fixed_button"
                    onClick={() => numberHandler('normalNumber', '6')}>6</Button>
                <Button className="fixed_button back_button"
                    onClick={() => numberHandler("operationFunction", "back")}>后退</Button>
            </div>
            <div className="down">
                <div className="down_left">
                    <Button className="fixed_button"
                        onClick={() => numberHandler('customNumber', '4000')}>4000</Button>
                    <Button className="fixed_button"
                        onClick={() => numberHandler('normalNumber', '1')}>1</Button>
                    <Button className="fixed_button"
                        onClick={() => numberHandler('normalNumber', '2')}>2</Button>
                    <Button className="fixed_button"
                        onClick={() => numberHandler('normalNumber', '3')}>3</Button>
                    <Button className="fixed_button"
                        onClick={() => numberHandler('customNumber', '5000')}>5000</Button>
                    <Button className="fixed_button big"
                        onClick={() => numberHandler('normalNumber', '0')}>0</Button>
                    <Button className="fixed_button"
                        onClick={() => numberHandler('normalNumber', '+-')}>+-</Button>
                </div>
                <Button className="ok_button"
                    onClick={preMoney}>{intlLocales("BTN_CONFIRM")}</Button>
            </div>
        </div>
    </div>

const mapStateToProps = (state) => {
    return {
        initialize: state["initialize"],
        login: state["login"]
    };
}

const mapDispatchToProps = (dispatch) => {
    return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(withKeyBoard(ReserveFund));
