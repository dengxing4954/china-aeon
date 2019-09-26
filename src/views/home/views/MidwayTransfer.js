import React, { Component } from 'react';
import moment from 'moment';
import intl from 'react-intl-universal';
import '../style/reserve.less'
import { isWarn } from '@/views/initialize/Actions.js'
import { Button, Modal, Row, Col, Pagination } from 'antd';
import { Fetch } from '@/fetch/';
import Url from '@/config/url.js';
import { connect } from 'react-redux';
import message from '@/common/components/message';
import withKeyBoard from '@/common/components/keyBoard';

//老版本视图查阅18/12/11提交日志
class MidwayTransfer extends Component {

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
        }
    }

    componentDidMount() {
        window['openCashbox']();
        let req = {
            mkt: this.props.initialize.mkt,
            syjh: this.props.initialize.syjh,
            erpCode: this.props.initialize.jygs,
            syjcursyyh: this.props.login.operuser.gh,
            command_id: 'GETTEMPORARYPAYLOG' //获取中途交收记录接口
        };
        Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then(res => {
            if (res.retflag === "0") {
                this.setState({ todayhistory: res.todayhistory });
            } else {
                message(res.retmsg);
            }
        }).catch(err => {
            console.log(err);
        })
        this.setState({ dateTime: moment().format('YYYY-MM-DD') });
        let { update, fallback } = this.props.bind({
            "35": () => {
                this.props.onCancel('transferModal');
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
        let { todayhistory, dateTime, pagination, totalinsertcash } = this.state;
        return (
            <Modal
                title={null}
                visible={visible}
                closable={false}
                maskClosable={false}
                footer={null}
                mask={true}
                zIndex={3}
                width={900}
                wrapClassName="vertical-center-modal"
                bodyStyle={{ margin: 0, padding: 0 }}
            >
                <div className="reserve">
                    <div
                        className="head">{this.intlLocales("MIDWAY_TRANSFER")} {this.props.closeable ? null :
                            <img src={require("@/common/image/paytk_close.png")}
                                alt=""
                                onClick={() => onCancel('transferModal')} />}
                    </div>
                    <div className="date_time">
                        日期: {dateTime}
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
        )
    }

    intlLocales = (key) => {
        return intl.get(key);
    }

    preMoney = () => {
        let { amountDisplay } = this.state,
            HKD = this.props.paymode.filter(item => item.paysimplecode === "HKD")[0];
        if (isNaN(parseFloat(amountDisplay))) {
            message(this.intlLocales("INFO_RESERVEMSG"));
            return;
        }
        let payindetail = {
            rowNo: 1,
            payInCode: HKD.code,
            payInName: HKD.name,
            number: 0,
            amountTotal: amountDisplay
        }
        let req = {
            command_id: "TEMPORARYPAYIN",
            payinhead: {
                cash: amountDisplay,
                cashier: this.props.login.operuser.gh,
                cheque: 0, //支票
                coupon: 0, //礼券
                ecard: 0, //电子卡
                mkt: this.props.initialize.mkt,
                other: 0,
                sellDate: moment().format('YYYY-MM-DD'),
                syjh: this.props.initialize.syjh,
                erpCode: this.props.initialize.jygs,
                syjcursyyh: this.props.login.operuser.gh,
            },
            payindetail: [payindetail],
            syjpaycashje: amountDisplay,
            syjcurcashje: parseFloat(window["SyncCASHIER"]({}).cash) - amountDisplay,
        };
        Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then(res => {
            if (res.retflag === "0") {
                let { cash } = req.payinhead;
                let params = { cash: req.payinhead.cash * -1 };
                let total = window["SyncCASHIER"]({ cash: req.payinhead.cash * -1 });
                console.log('params', total);
                window.Print({
                    Module: 'MidwayTransferPrint',
                    head: [{
                        syyh: this.props.login.operuser.gh || this.props.login.operuser.cardno,//收银员
                        printtype: "0", //0代表热敏打印，1代表平推
                        rqsj: moment().format('DD/MM/YYYY HH:mm:ss'),//交易时间
                        mktname: this.props.initialize.data.mktinfo.mktname,//门店号名称
                        cashLoanAmount: cash,//单笔金额
                        cashLoanNum: res.syjpaycount,//交易笔数
                        cashLoanTotal: res.syjtotalpaycash || 0,//总金额
                        mkt: this.props.initialize.mkt,
                        syjh: this.props.initialize.syjh,
                        barcodeString: this.props.initialize.mkt + this.props.initialize.syjh + moment().format('YYMMDD') + this.props.initialize.syjh + this.props.initialize.fphm,//门店号+收银机号+小票号
                    }],
                }, () => {
                    this.ejouralRecord(res);
                    window.getCashboxStatus(res);
                    this.props.clearWarn(0);
                });
                this.props.onCancel("transferModal");
            } else {
                message(res.retmsg);
            }
        }).catch(err => {
            console.log(err);
        });
    }

    ejouralRecord = ({ syjpaycount, syjtotalpaycash }) => {
        const fillLeft = (value, n) =>
            (value + '').length < n ? (Array(n).join(" ") + value).slice(-n) : value;
        const fillRight = (value, n) =>
            (value + '').length < n ? (value + Array(n).join(" ")).substring(0, n) : value;
        const dividingLine = '\r\n-----------------------------------';

        let ejouralList = [], ejouralText = '';
        let { mkt, syjh } = this.props.initialize;
        let { amountDisplay } = this.state;
        let syyh = this.props.login.operuser.gh || this.props.login.operuser.cardno;//收银员
        ejouralList.push(`*** ENTER DROP ***`);
        ejouralList.push(`\r\nSHOP ${mkt}/${syjh} ${moment().format('DD/MM/YY')} ${moment().format('HH:mm:ss')} `);
        ejouralList.push(`\r\n${fillRight(`OPERATOR : ${syyh}`, 21)} ${fillLeft('CASH DROP', 12)}`);
        ejouralList.push(dividingLine);
        ejouralList.push(`\r\n${fillRight('CASH DROP AMOUNT', 22)} $ ${fillLeft((syjtotalpaycash || 0), 9)}`);
        ejouralList.push(`\r\nTOTAL DROPS ${fillLeft('x ' + (syjpaycount || 0), 6)}     $ ${fillLeft(amountDisplay, 9)}`);
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
                if ((Math.abs(this.state.amountDisplay) > 99999 || !this.state.amountDisplay) && keyContent === "+-") { //判断是否是四位数
                    return;
                }
                if (keyContent === "+-") {
                    this.setState({
                        minus: !this.state.minus,
                        amountDisplay: this.state.minus ? this.state.amountDisplay.slice(1) : "-" + this.state.amountDisplay,
                        numberType: "normalNumber"
                    });
                } else {
                    if (this.state.amountDisplay.length === 6) {
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
            content: `是否確定$${this.state.amountDisplay}為交收的數量？`,
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
                <Col span={6}>交收金额</Col>
            </Row>
            <div className="table_conent">
                {
                    todayhistory.slice((pagination.current - 1) * pagination.defaultPageSize, pagination.current * pagination.defaultPageSize).map((item, key) =>
                        <Row key={key}>
                            <Col span={6}>{item.syjcurtime.slice(11)}</Col>
                            <Col
                                span={6}>{item.syjh}</Col>
                            <Col span={6}>{item.syjcursyyh}</Col>
                            <Col span={6}>{item.syjpaycashje}</Col>
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
            <input className="show" ref={this.amount} autoFocus={true} value={state.amountDisplay} onChange={(e) => {
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
                    onClick={() => numberHandler("operationFunction", "cancel")}>
                    {intlLocales("BTN_EMPTY")}</Button>
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
    return {
        clearWarn: (promptNum) => dispatch(isWarn(promptNum)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withKeyBoard(MidwayTransfer));
