import React, { Component } from 'react';
import { HashRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './Store';
import { view as Login } from './views/login/';
import { view as Home } from './views/home/';
import { view as PreSale } from './views/presale/';
import { view as Invoice } from './views/invoice/';
import { view as Square } from './views/square/';
import { view as ReturnGoods } from './views/returngoods';
import { view as EliminateBills } from './views/eliminatebills';
import { view as FinalPayment } from './views/finalpayment';
import { view as cancelFinalPayment } from './views/finalpayment';
import { view as DisplayLine } from './views/displayline';
import Footer from './views/footer';
// import { view as DisplayLineTwo } from './views/displaylineTwo';
// import { view as DisplayLinePay } from './views/displaylinePay';
import {
    view4Sale as Pay4Sale,
    view4Final as Pay4Final,
    view4Return as Pay4Return,
    view4Eliminate as Pay4Eliminate,
} from './views/payment/';
import { setState } from '@/views/initialize/Actions';
import EventEmitter from '@/eventemitter/';
import message from '@/common/components/message';
import accredit from '@/common/components/accredit';
import antd from 'antd';
import intl from 'react-intl-universal';
import HK from '@/common/locales/zh-HK';
import CN from '@/common/locales/zh-CN';

antd.message.config({
    top: 250,
    duration: 1.5,
    maxCount: 1,
});

const locales = {
    "zh-HK": HK,
    "zh-CN": CN,
};

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            initDone: false,
        };
    }

    componentDidMount() {
        intl.init({
            currentLocale: 'zh-CN',
            locales,
        }).then(() => {
            this.setState({ initDone: true });
        });
    }

    render() {
        return this.state.initDone && (
            <Provider store={store}>
                <Router>
                    <div className="container">
                        <Switch>
                            <Redirect exact from="/" to={store.getState().initialize.BrowserWindowID == 4 ? "/displayLine" : "/login"}></Redirect>
                            <Route path="/login" component={Login} />
                            <Route path="/home" component={Home} />
                            <Route path="/presale" component={PreSale} />
                            <Route path="/invoice" component={Invoice} />
                            <Route path="/pay4Sale" component={Pay4Sale} />
                            <Route path="/pay4Final" component={Pay4Final} />
                            <Route path="/pay4Return" component={Pay4Return} />
                            <Route path="/pay4Eliminate" component={Pay4Eliminate} />
                            <Route path="/square" component={Square} />
                            <Route path="/finalpayment" component={FinalPayment} />
                            <Route path="/cancelFinalpayment" component={cancelFinalPayment} />
                            <Route path="/returngoods" component={ReturnGoods} />
                            <Route path="/eliminatebills" component={EliminateBills} />
                            <Route path="/displayLine" component={DisplayLine} />
                            {/*<Route path="/displayLineTwo" component={DisplayLineTwo} />*/}
                            {/*<Route path="/displayLinePay" component={DisplayLinePay} />*/}
                        </Switch>
                        {
                            store.getState().initialize.BrowserWindowID !== 4 ? <Footer /> : null
                        }

                    </div>
                </Router>
            </Provider >
        )
    }
}

const routerEnter = (nextState, replace, next, flag) => {
    if (flag && (store.getState().home.humanIntervention || store.getState().initialize.online == 0)) {
        return message("脫機狀態不支持此功能");
    }
    let { privth, cardno } = store.getState().login.posrole;
    if ((nextState.location.state && nextState.location.state.type == "invoice") || privth == "Y") {
        store.dispatch(setState({ sqkh: cardno }));
        next();
        return;
    }
    if (nextState.location.action === "PUSH") return;
    React.accredit(posrole => {
        if (posrole.privth == "Y") {
            store.dispatch(setState({ sqkh: posrole.cardno }));
            next();
        } else {
            message("此卡没有退貨權限！");
        }
    });
};

window.EventEmitter = EventEmitter;
window.PrintMessage = message;
React.accredit = accredit;
EventEmitter.on('Online', (online) => {
    store.dispatch(setState({ online }));
});

EventEmitter.on('Drawer', (drawer) => {
    store.dispatch(setState({ drawer }));
});

EventEmitter.on('amcNO', (amcNO) => {
    store.dispatch(setState({ amcNO }));
});

EventEmitter.on('pagerNO', (pagerNO) => {
    store.dispatch(setState({ pagerNO }));
});

EventEmitter.on('setInitializeState', (data) => {
    global.posNews = data.posNews;
    delete data.posNews;
    store.dispatch(setState(data));
});

EventEmitter.on('setFlowList', (flowNo) => {
    let flowNoList = [...store.getState().initialize.flowNoList];
    flowNoList.push(flowNo);
    store.dispatch(setState({ flowNoList }));
});

export default App;
