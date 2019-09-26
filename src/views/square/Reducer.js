import * as ActionTypes from './ActionTypes.js';

//销售数据结构
const defaultstate = {
    flow_no: '',
    goodsList: [],
    totalDate: {},
    savedReceipt: [],   //暂存的单据
    searchReceipt: []   //解挂的单据
};

export default (state = defaultstate, action) => {
    const { vip } = action;

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
        case ActionTypes.CANCEL:
            return {
                ...state,
            }
        case ActionTypes.SUBMIT:
            return {
                ...state,
                ...action
            };
        default:
            return state
    }
}