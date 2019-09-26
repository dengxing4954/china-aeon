import * as ActionTypes from './ActionTypes.js';

//登录数据结构

export default (state = {}, action) => {
    switch (action.type) {
        //点击提交
        case ActionTypes.SUBMIT:
            return {
                ...state,
                ...action.data
            };
        default:
            return state
    }
}