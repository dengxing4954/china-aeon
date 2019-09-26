import * as ActionTypes from './ActionTypes.js';

//销售数据结构
const defaultstate = {
    flow_no: '',
    goodsList: [],
    totalData: {},
    savedReceipt: [],   //暂存的单据
    searchReceipt: [],   //解挂的单据
    vipInfo: {},
    easyPay: false,
    giftList: [],
    staffcard: {},
};

export default (state = defaultstate, action) => {
    const { vip, language, staffcard} = action;

    switch (action.type) {
        case ActionTypes.INITSALE:
            return {
                ...state,
                ...action
            };
        case ActionTypes.VIP:
            return {
                ...state,
                vip
            }
        case ActionTypes.SUBMIT:
            return {
                ...state,
                ...action
            };
        case ActionTypes.SAVE_RECEIPT:
            let savedReceipt = [ ...state.savedReceipt ]
            savedReceipt.push({id: action.goodsListId, goodsList: action.goodsList})
            return {
                ...state,
                savedReceipt,
            };
        case ActionTypes.SEARCH_RECEIPT:
            let searchReceipt = state.savedReceipt.find(item => item.id + '' === action.receiptId + '')
            return {
                ...state,
                searchReceipt,
            };
        case ActionTypes.SET_DJLB:
            return {
                ...state,
                ...action,
            };
        case ActionTypes.STAFF_DATA:
            return {
                ...state,
                staffcard: staffcard,
            };
        default:
            return state
    }
}