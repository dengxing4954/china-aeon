import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { reducer as loginReducer } from './views/login';
import { reducer as homeReducer } from './views/home';
import { reducer as presaleReducer } from './views/presale';
import { reducer as invoiceReducer } from './views/payment';
import { reducer as returngoodsReducer } from './views/returngoods';
import { reducer as eliminatebillsReducer } from './views/eliminatebills';
import { reducer as squareReducer } from './views/square';
import { reducer as finalpaymentReducer } from './views/finalpayment';
import { routerReducer } from 'react-router-redux';
import thunkMiddleware from 'redux-thunk';
import risi from 'redux-immutable-state-invariant';
import Url from './config/url.js'
import initializeReducer from './views/initialize/Reducer.js';
import moment from 'moment';

const reducer = combineReducers({
    initialize: initializeReducer,
    routing: routerReducer,
    login: loginReducer,
    home: homeReducer,
    presale: presaleReducer,
    invoice: invoiceReducer,
    returngoods: returngoodsReducer,
    eliminatebills: eliminatebillsReducer,
    square: squareReducer,
    finalpayment: finalpaymentReducer
});

const middlewares = [thunkMiddleware];
if (process.env.NODE_ENV !== 'production') {
    middlewares.push(risi());
}

const win = window;
const storeEnhancers = compose(
    applyMiddleware(...middlewares),
    (win && win.devToolsExtension) ? win.devToolsExtension() : (f) => f,
);

// 判断是否清机
let initialize = window.Initialize();
initialize.datesyj = moment().format("YYYYMMDD").slice(2);
initialize.xph = initialize.datesyj + initialize.fphm;
initialize.drawer = "4";
initialize.uploadData = 0;
initialize.BrowserWindowID == 2 && (initialize.flowNoList = []);
const initialState = sessionStorage.store ? JSON.parse(sessionStorage.store) : { initialize };
console.log(initialState)
//增加统计报表菜单
let presskeys = initialState.initialize.data.touchpostemplate.presskeys[0].home;
let reportStatics = { code: '224', name: '统计报表' }; //测试数据  统计报表的菜单
presskeys.push(reportStatics);
console.log(presskeys);
Url.logic_url = initialize.ipath;
Url.ip = initialize.ip;
Url.base_url = initialize.dev ? Url.logic_url : Url.ip + Url.logic_url;
let store = createStore(reducer, initialState, storeEnhancers);

store.subscribe(() => {
    sessionStorage.setItem("store", JSON.stringify(store.getState()));
})

export default store;
