import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal, Icon } from 'antd';
import moment from 'moment';
import Login from './PosLogin';
import message from '@/common/components/message';
import { loginsubmit } from '../Actions';
import '../style/login.less';
import ReserveFund from '@/views/home/views/ReserveFund.js';
import { Fetch } from '@/fetch/';
import Url from '@/config/url.js';
import intl from 'react-intl-universal';
import { setState } from '@/views/initialize/Actions';
import SystemConfig from './SystemConfig.js';
import confirm from '@/common/components/confirm';

//有状态组件
class LoginService extends Component {
    constructor(props) {
        super(props);
        this.state = {
            defaultWorkRound: null,
            reserveModal: false,
            loginFlag: false,
            comflag: false,
            //文件配置
            systemConfigModal: false,
        };
    }

    componentWillMount() {
        //文档 https://github.com/alibaba/react-intl-universal
        // init method will load CLDR locale data according to currentLocale
        // react-intl-universal is singleton, so you should init it only once in your app
        // intl.init({
        //     currentLocale: 'zh-CN',
        //     locales,
        // }).then(() => {
        //     // After loading CLDR locale data, start to render
        //     this.setState({ initDone: true });
        // });
    }

    componentDidMount() {
        let arr = this.props.initialize.data.postime;
        let date = new Date();
        let hour = date.getHours();
        let min = date.getMinutes();
        let time = (hour < 10 ? "0" + hour : hour) + ":" + (min < 10 ? "0" + min : min);
        let defaultWorkRound = null;
        for (let item of arr) {
            if (time >= item.btime && time < item.etime) {
                defaultWorkRound = item.code;
                break;
            }
        }
        // let curCash = window["SyncCASHIER"]({});
        // window["SyncCASHIER"]({ cash: -1 * parseFloat(curCash.cash) });//清空当前现金金额
        this.setState({ defaultWorkRound });
    }

    componentWillUnmount() {
    }

    render() {
        return (
            <div className={"login"}>
                <Login
                    comflag={this.state.comflag}
                    netType={this.props.initialize.syncTime == '0'}
                    changeSync={this.changeSync}
                    fphm={this.props.initialize.fphm}
                    sync={this.sync}
                    intlLocales={this.intlLocales}
                    version={this.props.initialize.version}
                    serviceVersion={this.props.initialize.serviceVersion}
                    ref='login'
                    workRound={this.props.initialize.data.postime}
                    defaultWorkRound={this.state.defaultWorkRound}
                    submit={this.login} cardBind={this.cardBind}
                    shutdown={this.shutdown}
                    BrowserWindowID={this.props.initialize.BrowserWindowID}
                />

                {
                    this.state.reserveModal ?
                        <ReserveFund closeable={true}
                            visible={this.state.reserveModal}
                            onCancel={this.closeReserve}></ReserveFund> : null
                }
                {/*修改配置*/}
                {/* <Icon className="systemConfig_icon"
                      type="setting"
                      onClick={() => this.systemConfigModal()}/>
                <SystemConfig
                    visible={this.state.systemConfigModal}
                    callback={this.systemConfigModal}
                    dataList={this.props.initialize.setting}/> */}
            </div>
        );
    }

    changeSync = () => {
        this.props.setState({ syncTime: -1 });
    }

    sync = (data) => {
        this.props.setState({ fphm: data[1] });
        window.offlineSync(data);
    }

    shutdown = () => {
        confirm({
            className: "vla-confirm",
            title: '註意！',
            content: `退出系統並關閉計算機！`,
            okText: '退出',
            cancelText: '取消',
            onOk: () => {
                const titleTxt = `SHOP : ${this.props.initialize.mkt}/${this.props.initialize.syjh}  ${moment().format('DD/MM/YY HH:mm:ss')}\r\nSHUT DOWN`;
                window.Log(titleTxt, '1');
                window.Shutdown(true);
            }
        });
    }

    intlLocales = (key) => {
        return intl.get(key);
    }

    cardBind = (data) => {
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: {
                    command_id: 'BINDTEMPORARYCARD',
                    erpCode: this.props.initialize.erpCode,
                    mkt: this.props.initialize.mkt,
                    ...data
                }
            }
        ).then((res) => {
            if ("0" === res.retflag) {
                // this.login(data.tempcode)
                this.props.history.push("/login");
                return res
            } else if ("N" === res.retflag) {
                return res
            }
            else {
                message(res.retmsg)
            }
        }).catch((error) => {

        });
    }

    closeReserve = () => {
        this.setState({ reserveModal: false });
        this.props.history.push("/home");
    }

    login = (cardno, gh, passwd, workRound) => {
        let { mkt, syjh, jygs, erpCode, Syspara } = this.props.initialize;
        this.props.submit({
            cardno,
            gh,
            passwd,
            mkt,
            syjh,
            erpCode,
            loginFlag: this.state.loginFlag ? "Y" : "N",
            workRound
        }).then(res => {
            if (res) {
                if (res.retflag == '100') {
                    Modal.confirm({
                        className: 'vla-confirm',
                        title: '登錄異常',
                        content: res.retmsg,
                        okText: '是',
                        cancelText: '否',
                        onOk: () => {
                            this.setState({ comflag: true });
                            React.accredit(posrole => {
                                this.setState({ loginFlag: true, comflag: false }, () => {
                                    this.login(cardno, gh, passwd, workRound);
                                });
                            }, () => {
                                this.setState({ comflag: false });
                            });
                        },
                        onCancel: () => { }
                    });
                } else {
                    Fetch(
                        {
                            url: Url.base_url,
                            type: "POST",
                            data: { command_id: "ONLINE" }
                        }
                    ).then((res) => {
                    }).catch((error) => {
                    });
                    if (Syspara.isinputpremoney === "Y") {
                        this.setState({ reserveModal: true });
                    } else {
                        this.props.history.push(this.props.initialize.BrowserWindowID == 2 ? "/home" : "/presale");
                        const titleTxt = `SHOP : ${this.props.initialize.mkt}/${this.props.initialize.syjh}    ${moment().format('DD/MM/YY')}   ${moment().format('HH:mm:ss')}\r\nOPERATOR : ${res.operuser.gh}   LOGIN `;
                        window.Log(titleTxt, '1')
                    }
                    let curCash = window["SyncCASHIER"]({}), cash = 0;
                    cash = parseFloat(curCash) * -1 + parseFloat(res.syjCashCurNum);
                    window["SyncCASHIER"]({ cash });//同步当前金额
                }
            }
        }).catch(err => {
            console.log(err);
        })
    }

    systemConfigModal = (params) => {
        if (!params) {
            this.setState({
                systemConfigModal: !this.state.systemConfigModal
            })
            return;
        }
    }
}

const mapStateToProps = (state) => {
    console.log('login', state)
    return {
        initialize: state["initialize"],
        isOnline: state.home.isOnline,
        loginData: state.login
    };
}

const mapDispatchToProps = (dispatch) => {
    return {
        submit: (data) => dispatch(loginsubmit(data)),
        setState: (data) => dispatch(setState(data))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginService);