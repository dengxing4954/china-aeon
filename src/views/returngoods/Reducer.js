import * as ActionTypes from './ActionTypes.js';

const defaultstate = {
}

export default (state = defaultstate, action) => {

    switch (action.type) {
        case ActionTypes.RG:
            return {
                ...state,
                ...action.data
            };
        case ActionTypes.INIT:
            return action.data.flow_no ? {
                ...state,
                ...action.data
            } : {};
        default:
            return state
    }
}