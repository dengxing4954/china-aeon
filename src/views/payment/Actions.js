import * as ActionTypes from './ActionTypes.js';
import {Fetch} from '@/fetch/';
import Url from '@/config/url.js';
import message from '@/common/components/message';

export const trade = (terminalOperator, flowNo, shopCode, terminalNo) => {
    return dispatch => {
        const req = {
            command_id: "REPULLENTIREMESSCERTIFY",
            terminalOperator,
            flowNo,
            shopCode,
            terminalNo
        };
        console.log(req)
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then((res) => {
            console.log(res);
            if ("0" === res.returncode) {
                // let recycleSerInfo = {...res.recycleSerInfo}
                // let dcData = {date: res.deliveryTime,
                //     reserveLocation: res.reserveLocation,
                //     otherTelephone: res.receiverStandbyPhone,
                //     telephone: res.receiverMobile,
                //     customName: res.receiverName,
                //     locationOut: res.outLocation}
                let {order} = res.data;
                dispatch({
                    type: ActionTypes.TRADE,
                    goods: order.goodsList,
                    salePayments: [...order.salePayments],
                    zdsjtotal: order.oughtPay, // 应收金额
                    zdyftotal: order.saleValue,//合计总金额
                    zddsctotal: order.totalDiscountValue,//总折扣
                    sjtotal: order.existPay,//实际付款
                    saleDate: order.saleDate
                    // recycleSer: res.recycleSer,
                    // recycleSerInfo,
                    // expressNumber: res.expressNumber,
                    // refundAuthzCardNo: res.refundAuthzCardNo,
                    // terminalOperatorAuthzCardNo: res.terminalOperatorAuthzCardNo,
                    // totalDiscAuthzCardNo: res.totalDiscAuthzCardNo,
                    // staffCardNo: res.staffCardNo,
                    // staffNo: res.staffNo,
                    // staffType: res.staffType,
                    // vipno: res.vipno,
                    // tradeMemberInfo: res.memberInfo,
                    // depositSale: res.depositSale,
                    // consumersType: res.viptype,
                    // realConsumersCard: res.realConsumersCard,
                    // dcData
                });
                return res.data;
            }
            else {
                message(res.data)
            }
        }).catch((error) => {
            console.error('error', error);
            throw new Error(error);
        });
    }
}

//销售确认成交
export const submit = (params) => {
    return dispatch => {
        const req = {command_id: "SALESCONFIRECERTIFY", ...params};
        console.log(req)
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req,
                fetchFlag: true
            }
        ).then((res) => {
            console.log(res)
            if ("0" === res.returncode || "2002" === res.returncode) {
                if(res.returncode === "0"){
                    // let memberInfo ={...res.memberInfo}
                    // let curDate = new Date();
                    // let preDate = new Date(curDate.getTime() - 24*60*60*1000);
                    // if(res.memberInfo && res.memberInfo.membershipExpireDate && res.memberInfo.bonusPointExpireDate){
                    //     memberInfo.membershipExpireDate = res.memberInfo.membershipExpireDate.slice(-2)+'/'+res.memberInfo.membershipExpireDate.slice(4,6)+'/'+res.memberInfo.membershipExpireDate.slice(0,4)
                    //     memberInfo.bonusPointExpireDate = res.memberInfo.bonusPointExpireDate.slice(-2)+'/'+res.memberInfo.bonusPointExpireDate.slice(4,6)+'/'+res.memberInfo.bonusPointExpireDate.slice(0,4)
                    //     memberInfo.ExpireDate = ('00'+(preDate.getMonth()+1)).slice(-2) +'月'+preDate.getDate()+'日';
                    //     if(res.memberInfo.lastUpdateTime){
                    //         memberInfo.lastUpdateTime = res.memberInfo.lastUpdateTime.slice(4,6)+'月'+res.memberInfo.lastUpdateTime.slice(6,8)+'日';
                    //     }
                    // }
                    let {order} = res.data;
                    dispatch({
                        type: ActionTypes.SUBMIT,
                        // coupon_gain: res.couponGain, //返券列表
                        jf: res.data.achievePoints, // 获取积分
                        // curjf: order.curjf,
                        // outSideGiftsInfo: order.outSideGiftsInfo,
                        popInfo: res.data.popInfo,
                        goods: order.goodsList,
                        saleDate: order.saleDate,
                        // eleStamp: order.electronicStamp,
                        // sticker: order.sticker,
                        // esystemStatus: order.esystemStatus,
                        // consumersType: order.consumersType,
                        // consumersCard: order.consumersCard,
                        // expressNumber: order.expressNumber,
                        // stamp: order.stamp,
                        // stick: order.stick,
                        // hasFastPay: order.hasFastPay,
                        saveStatus: order.saveStatus,
                        // memberInfo
                    });
                }
                return res 
                // if("2002" === res.retflag) {
                //     return res
                // }else{
                //     return res.data.order
                // }
            }
            else {
                message(res.data)
            }
        }).catch((error) => {
            console.error('error', error);
            throw new Error(error);
        });
    }
};

//退货确认成交
export const returnsubmit = (params) => {
    return dispatch => {
        const req = {command_id: "RETURNCONFIRECERTIFY",...params};
        console.log(req)
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then((res) => {
            console.log(res)
            if ("0" === res.retflag || "2002" === res.retflag) {
                if("0" === res.retflag){
                    let memberInfo ={...res.memberInfo}
                    let curDate = new Date();
                    let preDate = new Date(curDate.getTime() - 24*60*60*1000);
                    if(res.memberInfo && res.memberInfo.membershipExpireDate && res.memberInfo.bonusPointExpireDate){
                        memberInfo.membershipExpireDate = res.memberInfo.membershipExpireDate.slice(-2)+'/'+res.memberInfo.membershipExpireDate.slice(4,6)+'/'+res.memberInfo.membershipExpireDate.slice(0,4)
                        memberInfo.bonusPointExpireDate = res.memberInfo.bonusPointExpireDate.slice(-2)+'/'+res.memberInfo.bonusPointExpireDate.slice(4,6)+'/'+res.memberInfo.bonusPointExpireDate.slice(0,4)
                        memberInfo.ExpireDate = ('00'+(preDate.getMonth()+1)).slice(-2) +'月'+preDate.getDate()+'日';
                        if(res.memberInfo.lastUpdateTime){
                            memberInfo.lastUpdateTime = res.memberInfo.lastUpdateTime.slice(4,6)+'月'+res.memberInfo.lastUpdateTime.slice(6,8)+'日';
                        }
                    }
                    let dcData = null;
                    if(res.reserveLocation || res.receiverName){
                        let time = res.deliveryTime.split(' ')[0].split('-');
                        dcData = {date: time[2]+"-"+time[1]+"-"+time[0],
                            reserveLocation: res.reserveLocation,
                            otherTelephone: res.receiverStandbyPhone,
                            telephone: res.receiverMobile,
                            customName: res.receiverName,
                            locationOut: res.outLocation}
                    }
                    dispatch({
                        type: ActionTypes.RETURNSUBMIT,
                        coupon_gain: res.coupon_gain,
                        jf: res.jf,
                        popInfo: res.popInfo,
                        curjf: res.curjf,
                        saleDate: res.saleDate,
                        goods: res.goodsList,
                        expressNumber: res.expressNumber,
                        consumersType: res.consumersType,
                        consumersCard: res.consumersCard,
                        eleStamp: res.eleStamp,
                        sticker: res.sticker,
                        saveStatus: res.saveStatus,
                        memberInfo,
                        dcData
                    });
                }
                return res;
            }
            else {
                message(res.retmsg)
            }
        }).catch((error) => {
            console.error('error', error);
            throw new Error(error);
        });
    }
};

//按金确认成交
export const duesubmit = (params) => {
    return dispatch => {
        const req = {
            command_id: "DUE",
            ...params
        };
        console.log(req)
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then((res) => {
            console.log(res)
            if ("0" === res.retflag || "2002" === res.retflag) {
                dispatch({
                    type: ActionTypes.DEUSUBMIT,
                    saleDate: res.saleDate,
                });
                return res;
            }
            else {
                message(res.retmsg)
            }
        }).catch((error) => {
            console.error('error', error);
            throw new Error(error);
        });
    }
};


//打印数据
export const print = (printDate) => {
    return dispatch => {
        dispatch({
            type: ActionTypes.PRINT,
            printDate: printDate
        });
    }
};

//更新后厨打印单号
export const updateHasBackPrint = (params) => {
    return dispatch => {
        const req = {command_id: "REFRESHBACKPRINTINFO", ...params};
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
                // const {retflag, retmsg} = res;
                // if (retflag === "0") {
                //     return res;
                // } else {  
                //     message(retmsg)
                //     return false;
                // }
                return res
            }
        }).catch((error) => {
            console.error('error', error);
            throw new Error(error);
        });
    };
}

