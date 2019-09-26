import * as ActionTypes from './ActionTypes.js';
import { Fetch } from '@/fetch/';
import Url from '@/config/url.js';
// import { message } from 'antd';
import message from '@/common/components/message';

export const returnGoods = (req) => {
    return dispatch => {
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            const { returncode: retflag, data: retmsg } = res;
            if ("0" === retflag) {
                dispatch({
                    type: ActionTypes.RG,
                    data: {
                        goodsList: req.goodsList,
                        zdyftotal: res.data.order.oughtPay,  //res.zdyftotal,
                        zdsjtotal: res.data.order.remainValue,   //res.total,
                        zddsctotal: res.data.order.totalDiscountValue,   //res.zddsctotal,
                        uidlist: req.goodsList.map(item => item.guid).join(","),
                        status: 0,
                        originIdSheetNo: req.originIdSheetNo,
                        originLogisticsState: req.originLogisticsState,
                        originOrderState: req.originOrderState,
                        originTerminalNo: req.originTerminalNo,
                        originTerminalOperator: req.originTerminalOperator,
                        originTerminalSno: req.originTerminalSno
                    }
                });
                return res;
            } else {
                message(retmsg);
                return res;
            }
        }).catch((error) => {
            console.error('error', error);
            throw new Error(error);
        });
    }
};

export const init = (flow_no = "", params = {}) => {
    return dispatch => {
        dispatch({
            type: ActionTypes.INIT,
            data: {
                flow_no,
                ...params
            }
        })
    }
};

export const addGoods = (params) => {
    return (dispatch) => {
        const req = { command_id: "FINDGOODSTIFY", ...params };
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            if (res) {
                const { returncode, data } = res;
                if (returncode === "0") {
                    return {...data.order, returncode};
                } else {
                    message(data);
                    return false;
                }
            }
        })
    }
}

export const editGoods = (params) => {
    return dispatch => {
        const req = { command_id: "CHANGEGOODSTIFY", ...params };
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            if (res) {
                const { returncode, data } = res;
                if (returncode === "0") {
                    return {...data.order, returncode};
                } else {
                    message(data);
                    return false;
                }
            }
        }).catch((error) => {
            throw new Error(error);
        });
    };
}

export const delGoods = (params) => {
    return (dispatch) => {
        const req = { command_id: "CANCELBARCODECERTIFY", ...params };
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            if (res) {
                const { retflag, retmsg } = res;
                if (retflag === "0") {
                    return res;
                } else {
                    message(retmsg);
                    return false;
                }
            }
        }).catch((error) => {
            throw new Error(error);
        });
    }
}

export const submit = (params) => {
    return dispatch => {
        const req = { command_id: "CXPAYREQUESTCERTIFY", ...params };
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then((res) => {
            if (res) {
                const { returncode, data } = res;
                if (returncode === "0") {
                    dispatch({
                        type: ActionTypes.RG,
                        data: {
                            goodsList: req.goodsList,
                            zdyftotal: res.data.order.remainValue,
                            zdsjtotal: res.data.order.oughtPay,
                            zddsctotal: res.data.order.totalDiscountValue,
                            uidlist: req.guidList,
                            status: 1
                        }
                    });
                    return res;
                } else {
                    message(data);
                    return false;
                }
            }
        }).catch((error) => {
            throw new Error(error);
        });
    }
}

export const vip = (params) => {
    return dispatch => {
        const req = { command_id: "MEMBERLOGIN", ...params };
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then((res) => {
            const { returncode, data } = res;
            if ("0" === returncode) {
                return res;
            } else {
                message(data);
            }
        }).catch((error) => {
            console.error('error', error);
        });
    }
}

//查询套餐
export const findPackage = (params) => {
    return dispatch => {
        const req = {command_id: "GETMEALGOODSINFO", ...params}
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then((res) => {
            if (res) {
                const {retflag, retmsg} = res;
                if (retflag === "0") {
                    return res;
                } else {
                    message(retmsg)
                }
            }
        })
    }
}

//添加套餐
export const addPackage = (params) => {
    return dispatch => {
        const req = {command_id: "CHOICEMEALGOODS", ...params}
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then((res) => {
            if (res) {
                const {retflag, retmsg} = res;
                if (retflag === "0") {
                    return res;
                } else {
                    message(retmsg)
                }
            }
        })
    }
}
