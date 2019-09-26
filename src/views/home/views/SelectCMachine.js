import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Fetch} from '@/fetch/';
import intl from 'react-intl-universal';
import Url from '@/config/url.js';
import message from '@/common/components/message';
import moment from 'moment';
import '../style/clear.less'
import {Modal} from 'antd';

class SelectCMachine extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sumDetail: [],
            payDetail: [],
            index: -1,
        }
    }

    componentDidMount() {

    }

    intlLocales = (key) => {
        return intl.get(key);
    }

    afterClose = () => {
        this.setState({
            sumDetail: [],
            payDetail: [],
            index: -1,
        });
    }

    render() {
        let {payDetail, index} = this.state;
        let {visible, onCancel} = this.props;
        let {mkt, syjh} = this.props.initialize;
        let {businesscode} = this.props.initialize.data.syjmain[0];
        return (
            <Modal
                title={null}
                visible={visible}
                closable={false}
                maskClosable={false}
                footer={null}
                mask={true}
                zIndex={2}
                wrapClassName="vertical-center-modal"
                bodyStyle={{margin: 0, padding: 0}}
                afterClose={this.afterClose}
                destroyOnClose={true}
            >
                <div className="clear_machine">
                    <div className="head">
                        {this.intlLocales("CLEARMACHINE_SELT")}
                        <img src={require("@/common/image/paytk_close.png")}
                             alt=""
                             onClick={() => onCancel("selectCMachine")}/>
                    </div>
                    <div className="content">
                        <div className="btn_group">
                            <input type="button"
                                   className={index === 0 ? 'wBtn' : 'bBtn'}
                                   value={this.intlLocales("CLEARMACHINE_STAFFREPORT")}
                                   onClick={() => this.eventMethod('staffRp', 0)}/>
                            <input type="button"
                                   className={index === 1 ? 'wBtn' : 'bBtn'}
                                   value={this.intlLocales("CLEARMACHINE_CASHIERREPORT")}
                                   onClick={() => this.eventMethod('cashierRp', 1)}/>
                        </div>
                        {
                            payDetail.length !== 0 ?
                                <div className="report_preview">
                                    <div className="ticket_head">
                                        <div
                                            className="center"> {this.props.initialize.data.mktinfo.mktname}</div>
                                        <div className="subtitle">REGISTER
                                            TAKINGS & BANKING REPORT
                                        </div>
                                        <div> SHOP {businesscode.substring(businesscode.length - 1, businesscode.length)}{mkt.substring(mkt.length - 2, mkt.length)}/{syjh.substring(syjh.length - 3, syjh.length)}&nbsp;&nbsp;{moment().format('DD/MM/YY')}&nbsp;&nbsp;{moment().format('HH:mm:ss')}</div>
                                        {/*<div> CASHIER : {this.props.operators}
                                    <div style={{display: 'inline-block'}}>{this.props.operators}</div>
                                </div>
                                <div> AMOUNT :&nbsp;&nbsp;{printData['604'] || 0}</div>*/}
                                    </div>
                                    <div style={{
                                        marginLeft: 20,
                                        fontSize: 17
                                    }}>OPERATOR : {this.props.operators}</div>
                                    <div style={{
                                        marginLeft: 20,
                                        fontSize: 17
                                    }}>BANKING LIST BY CASHIER
                                        = {this.props.operators}</div>
                                    {this.repPreview(0, 4, '2')}
                                    <div>
                                        ======================================
                                    </div>
                                    {
                                        payDetail.map((item, key) =>
                                            <div className="ticket_content"
                                                 key={key}>
                                                <div
                                                    className="item_title">{item.name}</div>
                                                <div className="item_content">
                                                    <div
                                                        style={{paddingLeft: 10}}>
                                                        {item.num} $
                                                    </div>
                                                    <div>
                                                        {item.amount}
                                                    </div>
                                                </div>
                                            </div>
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
                                        ======================================
                                    </div>
                                    {this.repPreview(12, 18, '2,4')}
                                    <div className="separation">
                                        ======================================
                                    </div>
                                    {this.props.operators}
                                    <div className="separation_center">
                                        {'*___________END OF MSTING PRINTING___________*'}
                                    </div>
                                </div> :
                                <div className="tip_msg">
                                    <div className="title">请选择以上所需的打印报表</div>
                                    <img
                                        src={require("@/common/image/print_rep.png")}
                                        alt=""/>
                                </div>
                        }
                    </div>
                </div>
            </Modal>
        )
    }

    eventMethod = (methodName, index) => {
        let {presale, square} = this.props.initialize.bill;
        presale = presale || [];
        square = square || [];
        let msg = index === 2 ? '退出' : '清机';
        if (this.state.index === index) {
            return;
        }
        this.setState({index}, () => {
            this[methodName]();
        });
    }

    /**
     * 根据预览效果分割数据
     * @param start
     * @param end
     * @string flag 需要在那个位置插入虚线以逗号分割的字符串
     * @returns {any[]}
     */
    repPreview = (start, end, flag) => {
        let {sumDetail} = this.state;
        return sumDetail.slice(start, end).map((item, key) =>
            <React.Fragment key={key}>
                <div className="ticket_content">
                    <div className="item_title">{item.name}</div>
                    <div className="item_content">
                        <div className="cont_num">
                            {item.name === "MIDDLE COLLECTION" || item.name === "PRE-COMMIT" || item.name === "DIFFERENCE" ? '-' : ''}{item.name !== 'NET CASH' ? item.amount : ''} $
                        </div>
                        <div className="cont_amount">
                            {item.value || 0}
                        </div>
                    </div>
                </div>
                {
                    flag.includes(key) ?
                        <div className="ticket_content">
                            <div className="item_title"></div>
                            <div className="item_content">
                                ---------------------
                            </div>
                        </div> : null
                }
            </React.Fragment>
        )
    }


    staffRp = () => {
        let req = {
            mkt: this.props.initialize.mkt,
            syjh: this.props.initialize.syjh,
            erpCode: this.props.initialize.erpCode,
            syjcursyyh: this.props.operators,
            command_id: "POSCLEARBYMANREPORT",
        };
        Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then(res => {
            if (res.retflag === "0") {
                this.constructPrintParam(res);
            } else {
                message(res.retmsg);
            }
        }).catch(err => {
            console.log(err);
        })
    }

    cashierRp = () => {
        let req = {
            mkt: this.props.initialize.mkt,
            syjh: this.props.initialize.syjh,
            erpCode: this.props.initialize.erpCode,
            syjcursyyh: this.props.operators,
            command_id: "POSCLEARREPORT",
        };
        Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then(res => {
            if (res.retflag === "0") {
                let octStatus = false, payOctopus;
                this.props.initialize.Syspara.payObj.map((item) => {
                    if (item.split(',')[0] == "payOctopus") {
                        payOctopus = item.split(',')[1];
                    }
                });
                this.props.initialize.data.paymode.map((item) => {
                    if (payOctopus === item.code) {
                        octStatus = true;
                    }
                });
                this.constructPrintParam(res);
            } else {
                message(res.retmsg);
            }
        }).catch(err => {
            console.log(err);
        })
    }

    constructPrintParam = (params) => {
        try {
            let entryItme = [], allPay = [], sameData = {}, sumDetail, payTemp;
            for (let key in params) {
                let obj = {}, convt = this.keyvalueConv(key);
                if (convt) {
                    obj.value = params[key];
                    obj.index = convt.index;
                    obj.name = convt.name;
                    entryItme.push(obj);
                }
            }
            sumDetail = this.arraySort(entryItme);
            sumDetail[0].amount = params.saleOrderCount;//saleOrderCount
            sumDetail[1].amount = params.returnOrderCount;//returnOrderCount
            sumDetail[2].amount = params.dcOrderCount;//dcOrderCount

            payTemp = params.amountByPayAll;
            sumDetail[12].amount = sumDetail[12].value;
            allPay.push(sumDetail[12]);
            for (let key in payTemp) {
                let obj = {}, convt = this.mappingPayName(key);
                if (convt) {
                    obj.name = convt;
                    obj.amount = payTemp[key].amount;
                    obj.num = payTemp[key].num;
                    allPay.push(obj);
                }
            }

            this.setState({sumDetail: sumDetail, payDetail: allPay});
        } catch (e) {
            message(this.intlLocales("INFO_CLEARDATAERROR"));
            console.log('构造打印数据异常', e);
        }
    }

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

    keyvalueConv = (key) => {
        let obj = {};
        switch (key) {
            case 'difference':
                obj.index = 18;
                obj.name = 'DIFFERENCE';
                return obj;//差异金额
                break;
            case 'preCommit':
                obj.index = 17;
                obj.name = 'PRE-COMMIT';
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
                obj.name = 'OCTOPUSTOPUP';
                return obj;//找零八达通增值
                break;
            case 'octopusAddValue':
                obj.index = 9;
                obj.name = 'OCTOPUS ADD VALUE';
                return obj;//八达通增值金额
                break;
            case 'hpBalance':
                obj.index = 8;
                obj.name = 'H/P BALANCE';
                return obj;//分期付款中已支付金额
                break;
            case 'depositsAmount':
                obj.index = 7;
                obj.name = 'DEPOSITS AMOUNT';
                return obj;//按金金额
                break;
            case 'accountPayment':
                obj.index = 6;
                obj.name = 'ACCOUNT PAYMENT';
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
        switch (key) {
            case '01':
                return 'HKD';
                break;
            case '02':
                return 'RMB';
                break;
            case '03':
                return 'USD';
                break;
            case '04':
                return 'JPY';
                break;
            case '0301':
                return 'AEON JUSCO VISA';
                break;
            case '0302':
                return 'UNIONPAY CREDIT CARD';
                break;
            case '0303':
                return 'STANDARD CREDIT CARD';
                break;
            case '0401':
                return 'DENOMINATION CARD';
                break;
            case '0403':
                return 'OCTOPUS';
                break;
            case '0500':
                return 'ELECTRONIC COUPON';
                break;
            case '0502':
                return 'PAPER COUPONS';
                break;
            case '0602':
                return 'ACCOUNT PAY';
                break;
            case '0666':
                return 'DISCOUNT';
                break;
            case '0800':
                return 'DISCOUNTED POINTS';
                break;
            case '0901':
                return 'WECHAT';
                break;
            case '0902':
                return 'ALIPAY';
                break;
            case '0903':
                return 'MOBILE PAYMENT';
                break;
            case '0503':
                return 'HSBC COUPON';
                break;
            case '0504':
                return 'CITIC COUPON';
                break;
            case 'AUD':
                return 'AUD';
                break;
            case '0306':
                return 'ASC';
                break;
            default:
                return null;
        }
    }
}


const mapStateToProps = (state) => {
    return {
        initialize: state.initialize,
        operators: state.login.operuser && state.login.operuser.gh,
    };
}

const mapDispatchToProps = (dispatch) => {
    return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectCMachine);