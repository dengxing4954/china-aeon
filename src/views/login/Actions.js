import * as ActionTypes from './ActionTypes.js';
import { Fetch } from '@/fetch/';
import Url from '@/config/url.js';
import message from '@/common/components/message';

//绑定动作
export const loginsubmit = (data) => {

    return dispatch => {
        //发送Http请求
        // let req = { gh, pwd, cardno, code, mkt };
        const {cardno, gh, passwd, mkt, syjh, erpCode, loginFlag} = data;
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: { command_id: 'LOGINCERTIFY', cardno, gh, passwd, mkt, syjh, erpCode, loginFlag }
            }
        ).then((responseData) => {
            if ("0" === responseData.retflag || "100" === responseData.retflag) {
                let { operuser, posrole, posrolefunc } = responseData;
                //更新rudex数据
                dispatch({
                    type: ActionTypes.SUBMIT,
                    data: { operuser, posrole, posrolefunc, data }
                });
                return responseData;
            }
            else {
                message(responseData.retmsg);
                return false;
            }
        }).catch((error) => {
            console.error('error', error);
            return Promise.reject(error);
            // throw new Error(error);
        });
    }

};
