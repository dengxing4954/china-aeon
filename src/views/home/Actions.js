import * as ActionTypes from './ActionTypes.js';
import { Fetch } from '@/fetch/';
import message from '@/common/components/message';
import intl from 'react-intl-universal';
import Url from '@/config/url.js';
import { Modal } from 'antd';

const intlLocales = (key) => {
    return intl.get(key);
}

//绑定动作
const topresale = (pageTag) => {
    return {
        type: ActionTypes.TOPRESALE,
    };
};

//重置小票
const resetticket = (param) => {
    return dispatch => {
        const req = { command_id: "UPDATECASHIERSTATUSCERTIFY", ...param }
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            const { retflag, retmsg } = res;
            if ("0" === retflag) {
                return res;
            } else {
                message(retmsg)
            }
        }).catch((error) => {
            console.error('error', error);
        });
    }
}

// 联网
const online = (params) => {
    return dispatch => {
        const req = { command_id: "ONLINE", ...params };
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then((res) => {
            const { retflag, retmsg } = res;
            console.log(res);
            if (retflag) {
                return new Promise((resolve, reject) => {
                    resolve(res)
                })
            } else {
                message('ONLINE ERROR');
                message(retmsg)
            }
        }).catch((error) => {
            message(error);
            console.error('error', error);
        });
    }
};
const chengeonlineoff = (pageTag) => {
    return {
        type: ActionTypes.CHENGEONLINEOFF,
    };
};

//脱机
const offline = (params) => {
    return dispatch => {
        const req = { command_id: "OFFLINE", ...params };
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then((res) => {
            const { retflag, retmsg } = res;
            console.log(res)
            if (retflag) {
                return new Promise((resolve, reject) => {
                    resolve(res)
                })
            } else {
                message('OFFLINE ERROR');
                message(retmsg)
            }
        }).catch((error) => {
            message(error);
            console.error('error', error);
        });
    }
}

const chengeonlineon = (pageTag) => {
    return {
        type: ActionTypes.CHENGEONLINEON,
    };
};

const chengeonlineno = (pageTag) => {
    return {
        type: ActionTypes.CHENGEONLINENO,
    };
};

//会员日激活
const activeTicket = (params) => {
    return dispatch => {
        const req = { ...params }
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            const { retflag, retmsg } = res;
            if ("0" === retflag) {
                return res;
            } else {
                message(retmsg)
            }
        }).catch((error) => {
            console.error('error', error);
        });
    }
}

//收银上缴
const syncCASH = (cashier) => {
    return dispatch => {
        let cash = window["SyncCASH"](cashier);
        dispatch({
            cashier: cashier,
            type: ActionTypes.TRANSFER
        });
        ;
    };
};

//登出
const signOut = (params) => {
    return dispatch => {
        const req = { ...params }
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            const { retflag, retmsg } = res;
            if ("0" === retflag) {
                return res;
            } else {
                message(retmsg)
            }
        }).catch((error) => {
            console.error('error', error);
        });
    }
}

//离开修改收银机状态
const changeLeaveStatus = (params) => {
    return dispatch => {
        const req = { ...params }
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            const { retflag, retmsg } = res;
            if ("0" === retflag) {
                return res;
            } else {
                message(retmsg)
            }
        }).catch((error) => {
            console.error('error', error);
        });
    }
}

//查货
const findInventory = (params) => {
    return dispatch => {
        const req = { ...params }
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
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

//呼叫信息
const callSubmit = (params) => {
    return dispatch => {
        const req = { ...params }
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            const { retflag, retmsg } = res;
            if ("0" === retflag) {
                return res;
            } else {
                message(retmsg)
            }
        }).catch((error) => {
            console.error('error', error);
        });
    }
}

//人为操作
// 确定为人为操作
const humanInterventiontrue = () => {
    return {
        type: ActionTypes.HUMANINTERVENTIONTRUE,
    };
}

// 注销人为操作
const humanInterventionfalse = () => {
    return {
        type: ActionTypes.HUMANINTERVENTIONFALSE,
    };
}

//跟新收银机状态
const renewstate = (params) => {
    return dispatch => {
        const req = { command_id: 'UPDATECASHIERSTATUSCERTIFY', ...params }
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            const { retflag, retmsg } = res;
            if ("0" === retflag) {
                return res;
            } else {
                message(retmsg)
            }
        }).catch((error) => {
            console.error('error', error);
        });
    }
}

// 联网上传数据更新
const updatarenew = (params) => {
    return dispatch => {
        const req = { command_id: 'SYNCPOSCENTERDATA', ...params };
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            return res;
        }).catch((error) => {
            return Promise.reject(error);
        });
    }
}

//联网小票号更新
const updatanumberrenew = (params, callback) => {
    return dispatch => {
        const req = { command_id: 'ORDERSYN', ...params };
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            return res;
        }).catch((error) => {
            return Promise.reject(error);
        });
    }
}

//有无需要同步数据
const needtoupdata = (params) => {
    return dispatch => {
        const req = { command_id: 'GETSYNCOUNT', ...params }
        return Fetch({
            url: Url.base_url,
            type: "POST",
            data: req
        }).then((res) => {
            return res
        }).catch((error) => {
            console.error('error', error);
        });
    }
}

export default {
    topresale,
    resetticket,
    online,
    offline,
    activeTicket,
    syncCASH,
    signOut,
    changeLeaveStatus,
    findInventory,
    chengeonlineon,
    chengeonlineoff,
    chengeonlineno,
    humanInterventiontrue,
    humanInterventionfalse,
    renewstate,
    updatarenew,
    updatanumberrenew,
    callSubmit,
    needtoupdata,

}