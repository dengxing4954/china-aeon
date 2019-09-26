import { Fetch } from '@/fetch/';
import Url from '@/config/url.js';
import message from '@/common/components/message';

export const UPDATE = 'UPDATE';
export const UPDATEAMC = 'UPDATEAMC';
export const UPDATEPAGERNO = 'UPDATEPAGERNO';
export const BILL = 'BILL';
export const SET = 'SET';
export const WARN = 'WARN';

export const updateXPH = () => {
    return dispatch => {
        dispatch({
            type: UPDATE
        });
        window["UpdateXPH"]();
    };
};

export const updateAMC = () => {
    return dispatch => {
        dispatch({
            type: UPDATEAMC
        });
        window["UpdateAMC"]();
    };
};

export const bill = (data, req, callback) => {
    return dispatch => {
        if(req) {
            return sendLog(req).then(res => {
                if(res) {
                    if(callback) {
                        callback();
                    }
                    dispatch({
                        type: BILL,
                        data
                    });
                    window["Bill"](data);
                    return true;
                } else {
                    return false;
                }
            })
        } else {
            dispatch({
                type: BILL,
                data
            });
            if(callback) {
                callback();
            }
            window["Bill"](data);
            return true;
        }
    }
};

export const setState = (data) => {
    return dispatch => {
        dispatch({
            type: SET,
            data
        });
    };
};

export const sendLog = (params) => {
    const req = { command_id: "SENDLOGCERTIFY", ...params};
    return Fetch({
        url: Url.base_url,
        type: "POST",
        data: req
    }).then((res) => {
        if( res ) {
            const { retflag, retmsg } = res;
            if (retflag === "0") {
                return true;
            } else {
                message(`同步日志失败:${retmsg}`);
                return false;
            }
        }
    })
};

export const isWarn = (interval) => {
    return dispatch => {
        dispatch({
            type: WARN,
            interval
        });
    };
};