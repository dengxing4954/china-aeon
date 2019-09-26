import { UPDATE,UPDATEAMC, BILL, SET, WARN } from './Actions';
import moment from 'moment';

export default (state = {}, action) => {
    switch (action.type) {
        //点击销售界面跳转
        case UPDATE:
            let xph = parseInt(state.fphm) + 1;
            if (xph >= 1000000) xph = 1;
            xph = xph + "";
            let fphm = `${'0'.repeat(6 - xph.length)}${xph}`;
            let datesyj = moment().format("YYYYMMDD").slice(2);
            xph = datesyj + fphm;
            return {
                ...state,
                fphm,
                xph,
            };
        case UPDATEAMC:
            let amcNO = parseInt(state.amcNO) + 1;
            amcNO = ("000000" + amcNO).substr(-6);
            return {
                ...state,
                amcNO
            };
        case BILL:
            let bill = JSON.parse(JSON.stringify(state.bill));
            if (action.data.type) {
                bill[action.data.key] = bill[action.data.key].filter(value => {
                    if (!action.data.data.find(item => item.no === value.no)) {
                        return true;
                    } else {
                        return false;
                    }
                });
            } else {
                for (let item of bill[action.data.key]) {
                    if (item.no === action.data.data.no) return;
                }
                bill[action.data.key].unshift(action.data.data);
            }
            console.log(bill);
            return {
                ...state,
                bill
            };
        case SET:
            return {
                ...state,
                ...action.data
            }
        case WARN: {
            return {
                ...state,
                interval: action.interval
            }
        }
        default:
            return state
    }
}