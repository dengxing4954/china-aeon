import * as ActionTypes from './ActionTypes.js';

//登录数据结构
const defaultstate = {
    ishome: false,
    isOnline: 0,
    humanIntervention: false,
    cashier: {},
}


export default (state = defaultstate,action) =>{
     const {activeTicket} = action
     switch (action.type)
     {
        //点击销售界面跳转
        case ActionTypes.TOPRESALE:
            return{...state,
                ishome:true
                };

        case ActionTypes.ACTIVETICKET:
             return{
                ...state,
                activeTicket
             };
         case ActionTypes.TRANSFER:
             return Object.assign({}, state, {
                 cashier: action.cashier
             });
         case ActionTypes.CHENGEONLINEOFF:
             return{
                 ...state,
                 isOnline: 0,
             };
         case ActionTypes.CHENGEONLINEON:
             return{
                 ...state,
                 isOnline: 1,
             };
         case ActionTypes.CHENGEONLINENO:
             return{
                 ...state,
                 isOnline: 2,
             };
         case ActionTypes.HUMANINTERVENTIONTRUE:
             return{
                 ...state,
                 humanIntervention: true,
             }
         case ActionTypes.HUMANINTERVENTIONFALSE:
             return{
                 ...state,
                 humanIntervention: false,
             }
        default:
        return state
     }
}