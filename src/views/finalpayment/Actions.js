import * as ActionTypes from './ActionTypes.js';
import intl from 'react-intl-universal';
import {Fetch} from '@/fetch/';
import Url from '@/config/url.js';
import {Modal} from 'antd';

const intlLocales = (key) => {
    return intl.get(key);
}

//获取交易流水
const createSale = (params) => {
    return dispatch => {
        const req = {command_id: "POSCERTIFY", ...params}
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            const {retflag, retmsg} = res;
            if ("0" === retflag) {
                return res;
            } else {
                Modal.error({
                    title: intlLocales('INFO_FAILINIT'),
                    okText: intlLocales('INFO_CONFIRM'),
                    content: retmsg,
                });
            }
        }).catch((error) => {
            console.error('error', error);
            throw new Error(error);
        });
    }
};

//尾款查询
const dueQuery = (params) => {
    return (dispatch) => {
        const req = {command_id: "DUEQUERY", ...params};
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            if (res) {
                if (res.retflag === "0") {
                   return res;
                } else {
                    Modal.error({
                        title: '查找訂單失敗',
                        okText: intlLocales('INFO_CONFIRM'),
                        content: res.retmsg,
                    });
                    return false;
                }
            }
        }).catch((error) => {
            console.error('error', error);
            throw new Error(error);
        });
    }
}

//取消尾款查询
const cancelDueQuery = (params) => {
    return (dispatch) => {
        const req = {command_id: "GETTAILPAYFORCANCEL", ...params};
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            if (res) {
                if (res.retflag === "0") {
                   return res;
                } else {
                    Modal.error({
                        title: '查找訂單失敗',
                        okText: intlLocales('INFO_CONFIRM'),
                        content: res.retmsg,
                    });
                    return false;
                }
            }
        }).catch((error) => {
            console.error('error', error);
            throw new Error(error);
        });
    }
}

//尾单提交
const submit = (params) => {
    return dispatch => {
        return Promise.resolve(
            dispatch({
                type: ActionTypes.SUBMIT,
                data: {
                    goodsList: params.goodsList,
                    zdyftotal: !!params.total ? params.total : params.zdyftotal,//实际总金额
                    zdsjtotal: !!params.sjtotal ? params.sjtotal : params.zdsjtotal,//实际总金额
                    zddsctotal: !!params.totaldsc ? params.totaldsc : params.zddsctotal,//优惠金额
                    uidlist: params.uidlist,
                    flow_no: params.flow_no,
                    fphm: params.fphm,
                    djlb: params.djlb,
                    receiptType: params.receiptType,
                    cause:params.cause
                }
            })
        );
    }
}

//取消按金
const init = () => {
    return dispatch => {
        dispatch({
            type: ActionTypes.CANCEL,
            data: {
                goodsList: '',
                zdyftotal: '',//实际总金额
                zdsjtotal: '',//实际总金额
                zddsctotal: '',//优惠金额
                uidlist: '',
                flow_no: '',
                fphm: '',
                receiptType: 'Y'
            }
        })
    }
}

export default {
    createSale,
    dueQuery,
    submit,
    init,
    cancelDueQuery
}

