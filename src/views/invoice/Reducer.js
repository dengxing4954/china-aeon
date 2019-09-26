import * as ActionTypes from './ActionTypes.js';

//登录数据结构
const defaultstate = {
    goods: [],
    printDate:null
}

export default (state = defaultstate, action) => {

    switch (action.type) {
        case ActionTypes.SUBMIT:
            return {
                ...state,
                isInvoice: true,
                coupon_gain: action.coupon_gain,
                jf:action.jf,
                curjf: action.curjf,
                outSideGiftsInfo: action.outSideGiftsInfo,
                popInfo: action.popInfo,
                goods: action.goods,
                saleDate: action.saleDate,
                expressNumber: action.expressNumber,
                eleStamp: action.eleStamp,
                sticker: action.sticker,
                esystemStatus: action.esystemStatus,
                consumersType: action.consumersType,
                consumersCard: action.consumersCard,
                stamp: action.stamp,
                stick: action.stick,
                memberInfo: action.memberInfo,
                hasFastPay: action.hasFastPay,
                saveStatus: action.saveStatus
            };
        case ActionTypes.TRADE:
            return {
                ...state,
                goods: action.goods,
                zdsjtotal: action.zdsjtotal,
                zdyftotal: action.zdyftotal,
                zddsctotal: action.zddsctotal,
                salePayments: action.salePayments,
                sjtotal:action.sjtotal,
                recycleSer: action.recycleSer,
                recycleSerInfo: action.recycleSerInfo,
                expressNumber: action.expressNumber,
                refundAuthzCardNo: action.refundAuthzCardNo,
                terminalOperatorAuthzCardNo: action.terminalOperatorAuthzCardNo,
                totalDiscAuthzCardNo: action.totalDiscAuthzCardNo,
                staffCardNo: action.staffCardNo,
                staffNo: action.staffNo,
                staffType: action.staffType,
                vipno: action.vipno,
                dcData: action.dcData,
                tradeMemberInfo: action.tradeMemberInfo,
                depositSale: action.depositSale,
                consumersType: action.consumersType,
                realConsumersCard: action.realConsumersCard
            };
        case ActionTypes.RETURNSUBMIT:
            return {
                ...state,
                jf:action.jf,
                curjf: action.curjf,
                coupon_gain: action.coupon_gain,
                isInvoice: true,
                popInfo: action.popInfo,
                saleDate: action.saleDate,
                goods: action.goods,
                expressNumber: action.expressNumber,
                consumersType: action.consumersType,
                consumersCard: action.consumersCard,
                memberInfo: action.memberInfo,
                dcData: action.dcData,
                eleStamp: action.eleStamp,
                sticker: action.sticker,
                saveStatus: action.saveStatus
            };
        case ActionTypes.DEUSUBMIT:
            return {
                ...state,
                isInvoice: true,
                saleDate: action.saleDate
            };
        case ActionTypes.PRINT:
            return {
                ...state,
                printDate: action.printDate,
            };
        default:
            return state
    }
}