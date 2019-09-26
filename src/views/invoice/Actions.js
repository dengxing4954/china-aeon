import * as ActionTypes from './ActionTypes.js';
import {Fetch} from '@/fetch/';
import Url from '@/config/url.js';
import message from '@/common/components/message';

export const trade = (operators, flow_no, mkt, syjh) => {
    return dispatch => {
        const req = {
            command_id: "REPULLENTIREMESSCERTIFY",
            operators,
            flow_no,
            mkt,
            syjh
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
            if ("0" === res.retflag) {
                let recycleSerInfo = {...res.recycleSerInfo}
                // switch(res.recycleSerInfo.sameDayReply){
                //     case 0: recycleSerInfo.sameDayReply = "選取法定除舊服務";
                //     case 1: recycleSerInfo.sameDayReply = "放棄並選用升級服務";
                //     case 3: recycleSerInfo.sameDayReply = "放棄所有除舊服務";
                //     case 4: recycleSerInfo.sameDayReply = "3日內回覆";
                //     default: recycleSerInfo.sameDayReply = "放棄所有除舊服務";
                // }
                let dcData = {date: res.deliveryTime,
                    reserveLocation: res.reserveLocation,
                    otherTelephone: res.receiverStandbyPhone,
                    telephone: res.receiverMobile,
                    customName: res.receiverName,
                    locationOut: res.outLocation}
                dispatch({
                    type: ActionTypes.TRADE,
                    goods: res.goodlist,
                    salePayments: [...res.salepayments],
                    zdsjtotal: res.zdyftotal,
                    zdyftotal: res.total,
                    zddsctotal: res.totaldsc,
                    sjtotal: res.sjtotal,
                    recycleSer: res.recycleSer,
                    recycleSerInfo,
                    expressNumber: res.expressNumber,
                    refundAuthzCardNo: res.refundAuthzCardNo,
                    terminalOperatorAuthzCardNo: res.terminalOperatorAuthzCardNo,
                    totalDiscAuthzCardNo: res.totalDiscAuthzCardNo,
                    staffCardNo: res.staffCardNo,
                    staffNo: res.staffNo,
                    staffType: res.staffType,
                    vipno: res.vipno,
                    tradeMemberInfo: res.memberInfo,
                    depositSale: res.depositSale,
                    consumersType: res.viptype,
                    realConsumersCard: res.realConsumersCard,
                    dcData
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
            if ("0" === res.retflag || "2002" === res.retflag) {
                if(res.retflag === "0"){
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
                    dispatch({
                        type: ActionTypes.SUBMIT,
                        coupon_gain: res.coupon_gain,
                        jf: res.jf,
                        curjf: res.curjf,
                        outSideGiftsInfo: res.outSideGiftsInfo,
                        popInfo: res.popInfo,
                        goods: res.goodsList,
                        saleDate: res.saleDate,
                        eleStamp: res.eleStamp,
                        sticker: res.sticker,
                        esystemStatus: res.esystemStatus,
                        consumersType: res.consumersType,
                        consumersCard: res.consumersCard,
                        expressNumber: res.expressNumber,
                        stamp: res.stamp,
                        stick: res.stick,
                        hasFastPay: res.hasFastPay,
                        saveStatus: res.saveStatus,
                        memberInfo
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

