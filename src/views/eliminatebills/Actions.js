import * as ActionTypes from './ActionTypes.js';
import { Fetch } from '@/fetch/';
import Url from '@/config/url.js';
// import { message } from 'antd';
import message from '@/common/components/message';

export const returnGoods = (req) => {
    return dispatch => {
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            const { returncode: retflag, data: retmsg } = res;
            if ("0" === retflag) {
                dispatch({
                    type: ActionTypes.RG,
                    data: {
                        goodsList: req.goodsList,
                        zdyftotal: res.zdyftotal,
                        zdsjtotal: res.total,
                        zddsctotal: res.zddsctotal,
                        uidlist: req.goodsList.map(item => item.guid).join(","),
                        status: 0
                    }
                });
                return res;
            } else {
                message(retmsg);
            }
        }).catch((error) => {
            console.error('error', error);
            throw new Error(error);
        });
    }
};

export const init = (flow_no = "", params = {}) => {
    return dispatch => {
        dispatch({
            type: ActionTypes.INIT,
            data: {
                flow_no,
                ...params
            }
        })
    }
};

export const vip = (params) => {
    return dispatch => {
        const req = { command_id: "MEMBERLOGIN", ...params };
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then((res) => {
            const { returncode, data } = res;
            if ("0" === returncode) {
                return res;
            } else {
                message(data);
            }
        }).catch((error) => {
            console.error('error', error);
        });
    }
}