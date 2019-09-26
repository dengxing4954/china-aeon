import * as ActionTypes from './ActionTypes.js';

const defaultstate = {}

export default (state = defaultstate, action) => {
    switch (action.type) {
        case ActionTypes.SUBMIT:
            return {
                ...state,
                ...action.data
            };
        case ActionTypes.CANCEL:
            return {
                ...state,
                ...action.data
            }
        default:
            return state;
    }
}