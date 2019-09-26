import * as ActionTypes from './ActionTypes.js';
import { Fetch } from '@/fetch/';
import Url from '@/config/url.js';
import message from '@/common/components/message';
import intl from 'react-intl-universal';
// const apiUrl = Url.base_url;

const init = () => {
    return dispatch => {
        dispatch({
            type: ActionTypes.INITSALE,
            flow_no: "",
            goodsList: [],
            totalData: {},
            salePayments: {},
            addGoodsTime: "",
            vipInfo: {},
            tempVip: false,
            easyPay: false,
            discountPayCode: "",
            discountPayDescribe: "",
            limitedPays: [],
            switchEng: '',
            deleteNum: 0,
            giftList: [],
            staffcard: '',
            ejouralList: [],
            tempZzk: 100,
            tempZzr: 0,
            isJFXH: false
        });
    }
}

//开始动作
const createSale = (params) => {
    return dispatch => {
        const req = { command_id: "POSCERTIFY", ...params }
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req,
            fetchFlag: params.fetchFlag
        }).then((res) => {
            const { returncode, data } = res;
            if ("0" === returncode) {
                //更新rudex数据
                /*dispatch({
                    type: ActionTypes.INITSALE,
                });*/
                return { flag: true, res: data };
            } else {
                return { flag: false, res: data }
                //message(`订单初始化失败:${data}`);
            }
        }).catch((error) => {
            console.error('error', error);
            throw new Error(error);
        });
    }
};

//添加vip
const vip = (params) => {
    return dispatch => {
        const req = { command_id: "MEMBERLOGIN", ...params };
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then((res) => {
            console.log("MEMBERLOGIN res: ", res)
            const { returncode: retflag, data: retmsg } = res;
            if ("0" === retflag) {
                return res.data;
            } else {
                message(retmsg);
            }
        }).catch((error) => {
            console.error('error', error);
        });
    }
}

//授权vip
const tempVip = (params) => {
    return dispatch => {
        const req = { command_id: "GRANTCRMAMOUT", ...params };
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then((res) => {
            const { returncode, data } = res;
            if ("0" === returncode) {
                return { ...data, returncode };
            } else {
                message(`授權會員失敗: ${data}`);
            }
        }).catch((error) => {
            console.error('error', error);
        });
    }
}


//添加staff
const staff = (params) => {
    return dispatch => {
        const req = { command_id: "FINDSTAFFCERTIFY", ...params };
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then((res) => {
            const { returncode, data } = res;
            if ("0" === returncode) {
                return { ...data, returncode };
            } else {
                message(data ? data : intl.get("INFO_STAFFLOGINFAIL"))
            }
        }).catch((error) => {
            console.error('error', error);
        });
    }
}

// 记录员工卡号信息
const addstaffcardno = (params) => {
    return dispatch => {
        return Promise.resolve(
            dispatch({
                type: ActionTypes.STAFF_DATA,
                staffcard: params,
            })
        )
    }
}


//取消单据
const cancel = (params) => {
    return dispatch => {
        const req = { command_id: "CANCELTRADECERTIFY", ...params };
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
                    message(intl.get("INFO_CANZSUCC"));
                    return true;
                } else {
                    message(`${intl.get("INFO_CANZFAIL")}${data}`);
                    return false;
                }
            }
        }).catch((error) => {
            throw new Error(error);
        });
    }
};

//计算整单
const beforeSubmit = (params) => {
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
                    return { ...data, returncode };
                } else if (returncode === "1005") {
                    return returncode
                } else {
                    message(`${intl.get("INFO_SMBITFAILA")}${data}`, 5);
                    return false;
                }
            }
        }).catch((error) => {
            throw new Error(error);
        });
    }
}

//提交单据
const submit = (params, data, salePayments) => {
    return dispatch => {
        return Promise.resolve(
            dispatch({
                type: ActionTypes.SUBMIT,
                ...data,
                //consumers_id: res.consumers_id,
                flow_no: params.flowNo,
                uidlist: params.uidlist,
                salePayments,
                discountPayCode: params.discountPayCode || ""
            })
        );
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
        const req = { command_id: "FINDGOODSTIFY", ...params };
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            if (res) {
                const { returncode, data } = res;
                if (returncode === "0") {
                    return { ...data, returncode };
                } else {
                    //message(`${intl.get("INFO_SELECTGOODSFAIL")}:${data}`);
                    message(`添加商品出错${data}`);
                    return false;
                }
            }
        })
    }
}

//预销售交易
const fastPay = (params) => {
    return (dispatch) => {
        const req = { "command_id": "BATCHADDGOODS", ...params };
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            if (res) {
                const { returncode, data } = res;
                if (returncode === "0") {
                    /*dispatch({
                        type: ActionTypes.FASTPAY,
                        fastData: res,
                        flow_no: params.flow_no
                    });*/
                    return { ...data, returncode };
                } else {
                    message(`${intl.get("INFO_EASYPAYSEL")}${data}`);
                    return false;
                }
            }
        })
    }
}

//获取整单
const getBillDetail = (params) => {
    return (dispatch) => {
        const req = { command_id: "REPULLENTIREMESSCERTIFY", ...params };
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            if (res) {
                const { returncode, data } = res;
                if (returncode === "0") {
                    res.goodslist = res.goodlist;
                    return { ...data, returncode };
                } else {
                    message(`${intl.get("INFO_SELECTINFOFAILE")}:${data}`);
                    return false;
                }
            }
        })
    }
}

//删除商品列表中的一行商品
const delGoods = (params) => {
    return (dispatch) => {
        const req = { command_id: "CANCELBARCODECERTIFY", ...params };
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            if (res) {
                const { returncode, data } = res;
                if (returncode === "0") {
                    return { ...data, returncode };
                } else {
                    message(`${intl.get("INFO_DELGOODSFAIL")}:${data}`);
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
const discountBill = (params) => {
    return dispatch => {
        const req = { command_id: "INPUTALLREBATE", ...params };
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            if (res) {
                const { returncode, data } = res;
                if (returncode === "0" || returncode === "1000") {
                    return { ...data, returncode };
                } else {
                    message(`${intl.get("INFO_ZZKFAIL")}:${data}`);
                    return false;
                }
            }
        }).catch((error) => {
            throw new Error(error);
        });
    };
}

//整单折让
const rebateBill = (params) => {
    return dispatch => {
        const req = { command_id: "INPUTALLREBATEPRICE", ...params };
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            console.log(res);
            if (res) {
                const { returncode, data } = res;
                if (returncode === "0" || returncode === "1000") {
                    return { ...data, returncode };
                } else {
                    message(`${intl.get("INFO_ZZRFAIL")}:${data}`);
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
        const req = { command_id: "DTDISCOUNTCERTIFY", ...params };
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            if (res) {
                const { returncode, data } = res;
                if (returncode === "0" || returncode === "1000") {
                    return { ...data, returncode };
                } else {
                    message(`${intl.get("INFO_DZKFAIL")}:${data}`);
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
    return dispatch => {
        const req = { command_id: "DTREBATECERTIFY", ...params };
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            if (res) {
                const { returncode, data } = res;
                if (returncode === "0" || returncode === "1000") {
                    return { ...data, returncode };
                } else {
                    message(`${intl.get("INFO_DZRFAIL")}:${data}`);
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
        const req = { command_id: "CHANGEGOODSTIFY", ...params };
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            if (res) {
                const { returncode, data } = res;
                if (returncode === "0") {
                    return { ...data, returncode };
                } else {
                    message(`${intl.get("INFO_EDITFAIL")}:${data}`);
                    return false;
                }
            }
        }).catch((error) => {
            throw new Error(error);
        });
    };
}

//删除付款
const payDelete = (params) => {
    return dispatch => {
        const req = { command_id: "DELPAYCERTIFY", ...params };
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            if (res) {
                const { returncode, data } = res;
                if (returncode === "0") {
                    return { ...data, returncode };
                } else {
                    message(`${intl.get("INFO_DELPAYFAIL")}:${data}`);
                    return false;
                }
            }
        }).catch((error) => {
            throw new Error(error);
        });
    };
}

//设置单据类别
const setDjlb = (params) => {
    return dispatch => {
        return Promise.resolve(
            dispatch({
                type: ActionTypes.SET_DJLB,
                djlb: params
            })
        )
    }
}

//删除付款
const copyBill = (params) => {
    return dispatch => {
        const req = { command_id: "COPYSNO", ...params };
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            if (res) {
                const { returncode, data } = res;
                if (returncode === "0") {
                    return { ...data, returncode };
                } else {
                    message(`${intl.get("INFO_FPHMCOPYFAIL")}:${data}`);
                    return false;
                }
            }
        }).catch((error) => {
            throw new Error(error);
        });
    };
}

//修改密码
const changepwd = (params) => {
    console.log('chengepwd');
    return dispatch => {
        const req = { command_id: "CHANGEPSDCERTIFY", ...params };
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            if (res) {
                const { returncode, data } = res;
                if (returncode === "0") {
                    message(`${intl.get("INFO_CHANGEPWDSUCC")}${data}`);
                    return { ...data, returncode };
                } else {
                    message(`${intl.get("INFO_CHANGEPWDFAIL")}${data}`);
                    return false;
                }
            }
        }).catch((error) => {
            throw new Error(error);
        });
    };
}

//取消整单
const cancelSubmit = (params) => {
    return dispatch => {
        const req = { command_id: "CANCELPAYCERTIFY", ...params }
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            if (res) {
                const { returncode, data } = res;
                if (returncode === "0") {
                    return { ...data, returncode };
                } else {
                    message(`${intl.get("INFO_CANFAIL")}${data}`);
                    return false;
                }
            }
        }).catch((error) => {
            throw new Error(error);
        });
    };
}

//更新订单配送信息
const refreshDelivery = (params) => {
    return dispatch => {
        const req = { command_id: "REFRESHDELIVERYINFO", ...params };
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            if (res) {
                const { returncode, data } = res;
                if (returncode === "0") {
                    return { ...data, returncode };
                } else {
                    message(`${intl.get("INFO_DISTRIBUTIONFAIL")}${data}`);
                    return false;
                }
            }
        }).catch((error) => {
            throw new Error(error);
        });
    };
}

//更新四电一脑信息
const saleControl = (params) => {
    return dispatch => {
        const req = { command_id: "REFRESHRECYCLESERINFO", ...params };
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            if (res) {
                const { returncode, data } = res;
                if (returncode === "0") {
                    return { ...data, returncode };
                } else {
                    message(`${intl.get("INFO_SDYNFAIL")}${data}`);
                    return false;
                }
            }
        }).catch((error) => {
            throw new Error(error);
        });
    };
}

//获取四电一脑商品标签
const getControlList = (params) => {
    return dispatch => {
        const req = { command_id: "SALECONTROLGOODS", ...params };
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            if (res) {
                const { returncode, data } = res;
                if (returncode === "0") {
                    return { ...data, returncode };
                } else {
                    message(`${intl.get("INFO_SDYNFAIL")}${data}`);
                    return false;
                }
            }
        }).catch((error) => {
            throw new Error(error);
        });
    };
}

//券支付
const addCoupon = (params) => {
    return dispatch => {
        const req = { command_id: "QUERYAEONOLDCOUPON", ...params };
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            if (res) {
                const { returncode, data } = res;
                if (returncode === "0") {
                    return { ...data, returncode };
                } else {
                    //message(`${intl.get("INFO_SDYNFAIL")}${data}`);
                    message(`折扣券查询失败：${data}`, 8);
                    return false;
                }
            }
        }).catch((error) => {
            throw new Error(error);
        });
    };
}

//获取已完成订单列表
const getOrderList = (params) => {
    return dispatch => {
        const req = { command_id: "ORDERLISTCERTIFY", ...params }
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then((res) => {
            if (res) {
                const { returncode, data } = res;
                console.log('res', res)
                if (returncode === "0") {
                    return { ...data, returncode };
                } else {
                    message(`${intl.get("INFO_GETRPDATAFAIL", { title: params.title })}${data}`);
                }
            }
        })
    }
}

//获取订单详情
const getOrderInfo = (params) => {
    return dispatch => {
        const req = { command_id: "GETORDERMESSCERTIFY", ...params }
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then((res) => {
            if (res) {
                const { returncode, data } = res;
                console.log('res', res)
                if (returncode === "0") {
                    return { ...res, ...params };
                } else {
                    message(`${intl.get("INFO_GETRPDATAFAIL", { title: params.title })}${data}`);
                }
            }
        })
    }
}

//获取尾款单列表
const getTailList = (params) => {
    return dispatch => {
        const req = { command_id: "GETTAILPAYORDERS", ...params }
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then((res) => {
            if (res) {
                const { returncode, data } = res;
                console.log('res', res)
                if (returncode === "0") {
                    return { ...data, returncode };
                } else {
                    message(`${intl.get("INFO_GETRPDATAFAIL", { title: params.title })}${data}`);
                }
            }
        })
    }
}

//获取尾款单详情
const getTailInfo = (params) => {
    return dispatch => {
        const req = { command_id: "GETTAILPAYORDERDETAIL", ...params }
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then((res) => {
            if (res) {
                const { returncode, data } = res;
                console.log('res', res)
                if (returncode === "0") {
                    return { ...res, ...params };
                } else {
                    message(`${intl.get("INFO_GETRPDATAFAIL", { title: params.title })}${data}`);
                }
            }
        })
    }
}

//全日通查询
const addOneDayPassport = (params) => {
    return dispatch => {
        const req = { command_id: "QUERYAEONPRIVILEGECOUPON", ...params }
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then((res) => {
            if (res) {
                const { returncode, data } = res;
                console.log('全日通', res)
                if (returncode === "0") {
                    return { ...data, returncode };
                } else {
                    //message(`${intl.get("INFO_GETRPDATAFAIL")}${data}`);
                    message(`全日通查询失敗：${data}`);
                }
            }
        })
    }
}

//游戏币活动查询
const queryGameCoin = (params) => {
    return dispatch => {
        const req = { command_id: "QUERYGIVERULE", ...params }
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
                    return { ...data, returncode };
                } else {
                    //message(`${intl.get("INFO_GETRPDATAFAIL")}${data}`);
                    message(`活動査詢失敗：${data}`);
                }
            }
        })
    }
}

//呼叫信息
const callSubmit = (params) => {
    return dispatch => {
        const req = { ...params }
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            const { retflag, retmsg } = res;
            if ("0" === retflag) {
                return { ...retmsg, retflag };
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
        const req = { command_id: "AEONNEWJOIN", ...params }
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            const { returncode, data } = res;
            if ("0" === returncode) {
                return { ...data, returncode };
            } else {
                message(data)
            }
        }).catch((error) => {
            console.error('error', error);
        });
    }
}

//查询印花换购信息
const getStampGoods = (params) => {
    return dispatch => {
        const req = { command_id: "QUERYAEONSTAMPEXCHAGE", ...params }
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            const { returncode, data } = res;
            if ("0" === returncode) {
                return { ...data, returncode };
            } else {
                message(data)
            }
        }).catch((error) => {
            console.error('error', error);
        });
    }
}

//提交印花换购信息
const handleStampGoods = (params) => {
    return dispatch => {
        const req = { command_id: "AFFIRMAEONSTAMPEXCHAGE", ...params }
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            const { returncode, data } = res;
            if ("0" === returncode) {
                return { ...data, returncode };
            } else {
                message(data)
            }
        }).catch((error) => {
            console.error('error', error);
        });
    }
}

// 印花换购修改单据类型
const changeStampOrder = (params) => {
    return dispatch => {
        const req = { command_id: "CHANGEORDERTYPE", ...params }
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            const { returncode, data } = res;
            if ("0" === returncode) {
                return { ...data, returncode };
            } else {
                message(data)
            }
        }).catch((error) => {
            console.error('error', error);
        });
    }
}

// 印花换购修改单据类型
const updateFPHM = (params) => {
    return dispatch => {
        const req = { command_id: "CHANGEORDERFPHM", ...params }
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            const { returncode, data } = res;
            if ("0" === returncode) {
                return { ...data, returncode };
            } else {
                message(data)
            }
        }).catch((error) => {
            console.error('error', error);
        });
    }
}

// 多商品查询库存（单店）
const searchStocks = (params) => {
    return dispatch => {
        const req = { command_id: "SEARCHSTOCKS", ...params }
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            const { returncode, data } = res;
            if ("0" === returncode) {
                return { ...data, returncode }.shopstocklist;
            } else {
                console.log('多商品查询库存失败', data);
                return;
            }
        }).catch((error) => {
            console.error('error', error);
        });
    }
}

//查询积分交易
const searchAMCJF = (params) => {
    return dispatch => {
        const req = { command_id: "AMCCXJFJY", ...params }
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            const { returncode, data } = res;
            if ("0" === returncode) {
                return { ...data, returncode };
            } else {
                data && message(`積分記錄査詢失敗：${data}`);
                return;
            }
        }).catch((error) => {
            console.error('error', error);
        });
    }
}

//DC送查询区域信息
const getRegionInfo = (params) => {
    return dispatch => {
        const req = { command_id: "GETREGIONINFOLIST", ...params }
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            const { returncode, data } = res;
            if ("0" === returncode) {
                return { ...data, returncode };
            } else {
                message(data);
            }
        }).catch((error) => {
            console.error('error', error);
        });
    }
}

//DC送查询门店配送信息
const getRegionList = (params) => {
    return dispatch => {
        const req = { command_id: "REGIONRULENAMEINFO", ...params }
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            const { returncode, data } = res;
            if ("0" === returncode) {
                return { ...data, returncode };
            } else {
                message(data);
            }
        }).catch((error) => {
            console.error('error', error);
        });
    }
}

//DC送查询quota规则
const getQuotaInfo = (params) => {
    return dispatch => {
        const req = { command_id: "GETQUOTAINFOLIST", ...params }
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            const { returncode, data } = res;
            if ("0" === returncode) {
                return { ...data, returncode };
            } else {
                message(data);
            }
        }).catch((error) => {
            console.error('error', error);
        });
    }
}

export default {
    init,
    createSale,
    vip,
    tempVip,
    staff,
    cancel,
    beforeSubmit,
    submit,
    clear,
    addGoods,
    delGoods,
    discountBill,
    rebateBill,
    discountGoods,
    rebateGoods,
    editGoods,
    getBillDetail,
    payDelete,
    fastPay,
    setDjlb,
    copyBill,
    cancelSubmit,
    refreshDelivery,
    changepwd,
    saleControl,
    addCoupon,
    getOrderList,
    getOrderInfo,
    getTailList,
    getTailInfo,
    getControlList,
    addOneDayPassport,
    addstaffcardno,
    queryGameCoin,
    callSubmit,
    applyVip,
    getStampGoods,
    handleStampGoods,
    changeStampOrder,
    updateFPHM,
    searchStocks,
    searchAMCJF,
    getRegionInfo,
    getRegionList,
    getQuotaInfo
}
