import * as ActionTypes from './ActionTypes.js';
import intl from 'react-intl-universal';
import {Fetch} from '@/fetch/';
import Url from '@/config/url.js';
import message from '@/common/components/message';
import {Modal} from 'antd';

const intlLocales = (key) => {
    return intl.get(key);
}

const init = () => {
    return dispatch => {
        dispatch({
            type: ActionTypes.INITSALE,
            flow_no: "",
            goodsList: [],
            totalData: {}
        });
    }
}

//添加vip
const vip = (params) => {
    return dispatch => {
        const req = {command_id: "AMCMEMBERLOGIN", ...params};
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then((res) => {
            const {retflag, retmsg} = res;
            if ("0" === retflag) {
                return res;
            } else {
                message(retmsg)
            }
        }).catch((error) => {
            console.error('error', error);
        });
    }
}

//会员入会
const applyVip = (params) => {
    return dispatch => {
        const req = {command_id: "AEONNEWJOIN", ...params}
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            const {retflag, retmsg} = res;
            if ("0" === retflag) {
                return res;
            } else {
                message(retmsg)
            }
        }).catch((error) => {
            console.error('error', error);
        });
    }
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
                //更新rudex数据
                /*dispatch({
                    type: ActionTypes.INITSALE,
                });*/
                return {flag: true, res:res};
            } else {
                return {flag: false, res:retmsg}
            }
        }).catch((error) => {
            console.error('error', error);
            throw new Error(error);
        });
    }
};

//小票复制
const copyBill = (params) => {
    return dispatch => {
        const req = { command_id: "COPYSNO", ...params };
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            if( res ) {
                const { retflag, retmsg } = res;
                if (retflag === "0") {
                    return res;
                } else {
                    message(`${intl.get("INFO_FPHMCOPYFAIL")}:${retmsg}`);
                    return false;
                }
            }
        }).catch((error) => {
            throw new Error(error);
        });
    };
}


//提交单据
const submit = (params, data) => {
    return dispatch => {
        const req = {command_id: "CXPAYREQUESTCERTIFY", ...params};
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
                    //更新rudex数据
                    // dispatch({
                    //     type: ActionTypes.SUBMIT,
                    //     ...data,//响应数据
                    //     consumers_id: res.consumers_id,
                    //     flow_no: params.flow_no,
                    //     uidlist: params.uidlist
                    // });
                    return res;
                } else {
                    message(retmsg)
                    return false;
                }
            }
        }).catch((error) => {
            throw new Error(error);
        });
    }
}

//提交单据
const clear = (goods, flow_no, count, qty, totalprice, calc_mode, uidlist) => {
    return dispatch => {
        dispatch({
            type: ActionTypes.CANCEL,
            flow_no: "",
        });
    };
}

//添加商品
const addGoods = (params) => {
    return (dispatch) => {
        const req = {command_id: "FINDGOODSTIFY", ...params};
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            if (res) {
                const {retflag, retmsg, goodslist} = res;
                if (retflag === "0") {
                    return res;
                } else {
                    message(retmsg)
                    return false;
                }
            }
        })
    }
}

//删除商品列表中的一行商品
const delGoods = (params) => {
    return (dispatch) => {
        const req = {command_id: "CANCELBARCODECERTIFY", ...params};
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            if (res) {
                const {retflag, retmsg} = res;
                if (retflag === "0") {
                    return res;
                } else {
                    message(retmsg)
                    return false;
                }
            }
        }).catch((error) => {
                throw new Error(error);
            }
        );
    }
}

//整单折扣
const discountReceipt = (params) => {
    return dispatch => {
        const req = {command_id: "INPUTALLREBATE", ...params};
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            if (res) {
                const {retflag, retmsg} = res;
                if (retflag === "0") {
                    return res;
                } else {
                    message(retmsg)
                    return false;
                }
            }
        }).catch((error) => {
            throw new Error(error);
        });
    };
}

//整单折让
const rebateReceipt = (params) => {
    return dispatch => {
        const req = {command_id: "INPUTALLREBATEPRICE", ...params};
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            console.log(res);
            if (res) {
                const {retflag, retmsg} = res;
                if (retflag === "0") {
                    return res;
                } else {  
                    message(retmsg)
                    return false;
                }
            }
        }).catch((error) => {
            throw new Error(error);
        });
    };
}

//单行折扣
const discountGoods = (params) => {
    return dispatch => {
        const req = {command_id: "DTDISCOUNTCERTIFY", ...params};
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            if (res) {
                const {retflag, retmsg} = res;
                if (retflag === "0") {
                    return res;
                } else {
                    message(retmsg)
                    return false;
                }
            }
        }).catch((error) => {
            throw new Error(error);
        });
    };
}

//单行折让
const rebateGoods = (params) => {
    console.log('+++++', JSON.stringify(params));
    return dispatch => {
        const req = {command_id: "DTREBATECERTIFY", ...params};
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            if (res) {
                const {retflag, retmsg} = res;
                if (retflag === "0") {
                    return res;
                } else {
                    message(retmsg)
                    return false;
                }
            }
        }).catch((error) => {
            throw new Error(error);
        });
    };
}

//修改一行商品信息
const editGoods = (params) => {
    return dispatch => {
        const req = {command_id: "CHANGEGOODSTIFY", ...params};
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            console.log(res);
            if (res) {
                const {retflag, retmsg} = res;
                if (retflag === "0") {
                    return res;
                } else {
                    message(retmsg)
                    return false;
                }
            }
        }).catch((error) => {
            throw new Error(error);
        });
    };
}

//取消单据
const cancel = (params) => {
    return dispatch => {
        const req = {command_id: "CANCELTRADECERTIFY", ...params};
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
                    //更新rudex数据
                    dispatch({
                        type: ActionTypes.CANCEL,
                        flow_no: null,
                    })
                    message('取消成功');
                    return true;
                } else {
                    message(retmsg)
                    return false;
                }
            }
        }).catch((error) => {
            throw new Error(error);
        });
    }
};

//查询套餐
const findPackage = (params) => {
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
const addPackage = (params) => {
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

//获取整单
const getBillDetail = (params) => {
    return (dispatch) => {
        const req = {command_id: "REPULLENTIREMESSCERTIFY", ...params};
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            if (res) {
                const {retflag, retmsg} = res;
                if (retflag === "0") {
                    res.goodslist = res.goodlist;
                    return res;
                } else {
                    message(retmsg)
                    return false;
                }
            }
        }).catch((error) => {
            throw new Error(error);
        });

    }
}

//获取已完成订单列表
const getOrderList = (params) => {
    return dispatch => {
        const req = {command_id: "ORDERLISTCERTIFY", ...params}
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then((res) => {
            if (res) {
                const {retflag, retmsg} = res;
                console.log('res',res)
                if (retflag === "0") {
                    return res;
                } else {
                    message(retmsg)
                }
            }
        })
    }
}

//获取订单详情
const getOrderInfo = (params) => {
    return dispatch => {
        const req = {command_id: "GETORDERMESSCERTIFY", ...params}
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then((res) => {
            if (res) {
                const {retflag, retmsg} = res;
                console.log('res',res)
                if (retflag === "0") {
                    return res;
                } else {
                    message(retmsg)
                }
            }
        })
    }
}

//全单外卖
const changeEatWay = (params) => {
    return dispatch => {
        const req = {command_id: "ORDERSETEATWAY", ...params}
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then((res) => {
            if (res) {
                const {retflag, retmsg} = res;
                console.log('res',res)
                if (retflag === "0") {
                    return res;
                } else {
                    message(retmsg)
                }
            }
        })
    }
}

//获取档口号
const getStallInfoList = (params) => {
    return dispatch => {
        const req = {command_id: "GETSTALLINFOLIST", ...params}
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then((res) => {
            if (res) {
                const {retflag, retmsg} = res;
                console.log('res',res)
                if (retflag === "0") {
                    return res;
                } else {
                    message(retmsg)
                }
            }
        })
    }
}

//获取后厨打印配置
export const getBackPrintConfig = (params) => {
    return dispatch => {
        const req = {command_id: "GETBACKPRINTCONFIG", ...params};
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            console.log(res);
            if (res) {
                const {retflag, retmsg} = res;
                if (retflag === "0") {
                    return res;
                } else {
                    message(retmsg)
                    return false;
                }
            }
        }).catch((error) => {
            console.error('error', error);
            throw new Error(error);
        });
    };
}

//后厨打印
export const handleBackPrint = (params) => {
    return dispatch => {
        const req = {command_id: "BACKPRINT", ...params};
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            console.log(res);
            if (res) {
                return res
            }
        }).catch((error) => {
            console.error('error', error);
            throw new Error(error);
        });
    };
}

export default {
    init,
    createSale,
    submit,
    clear,
    addGoods,
    delGoods,
    discountReceipt,
    rebateReceipt,
    discountGoods,
    rebateGoods,
    editGoods,
    cancel,
    vip,
    findPackage,
    getBillDetail,
    addPackage,
    getOrderList,
    getOrderInfo,
    changeEatWay,
    copyBill,
    applyVip,
    getStallInfoList,
    getBackPrintConfig,
    handleBackPrint
}
