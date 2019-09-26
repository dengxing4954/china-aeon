// import fetch from 'isomorphic-fetch';
import React from 'react';
import ReactDOM from 'react-dom';
import { Spin } from 'antd';

const code = ["E", "Q", "M", "U", "X", "A", "Y", "L", "D", "P"];
function enCode(string) {
    let retString = "";
    for (let x of string) {
        try {
            let i = parseInt(x);
            if (i < 10) {
                retString += code[i];
            } else if (x == "*") {
                retString += "C";
            } else {
                retString += x;
            }
        } catch (err) {
            retString += x;
            window.log(err);
        }
    }
    return retString;
}

function deCode(string) {
    let retString = "";
    for (let x of string) {
        if (x == "C") {
            retString += "*";
        } else {
            retString += code.indexOf(x) < 0 ? x : code.indexOf(x);
        }
    }
    return retString;
}

//@data 处理的数据 @type 0解密 1加密
function deepCode(obj, type) {
    for (let key in obj) {
        if (typeof obj[key] === 'object') {
            obj[key] = deepCode(obj[key], type);
        } else {
            if (['consumersCard', 'consumersId', 'memberId', 'payno', 'creditCardNo', 'cardNo', 'vipno', 'vipid', 'realConsumersCard', 'consumers_cardno', 'consumers_id'].indexOf(key) > -1) {
                type ? obj[key] = enCode(obj[key]) : obj[key] = deCode(obj[key]);
            }
        }
    }
    return obj;
}

//@data 处理的数据 @type 0解密 1加密
function coding(data, type) {
    const codeCommand_id = [
        'CXPAYREQUESTCERTIFY',
        'REGETORDERDETAIL',
        'ORDERLISTCERTIFY',
        'SALESCONFIRECERTIFY',
        'PAYCERTIFY',
        'QUERYSALESRETURN',
        'GETRETURNMESSCERTIFY',
        'RETURNCONFIRECERTIFY',
        'AMCMEMBERLOGIN',
        'AMCCXJFJY',
        'FINDSTAFFCERTIFY',
        'REPULLENTIREMESSCERTIFY',
        'GETORDERMESSCERTIFY',
        'FASTTENPAYCERTIFY',
        'AEONNEWJOIN',
        'AEONPAY',
        'AEONPAYQUERY',
        'AEONPAYREFUND',
        'AEONPAYREFUNDQUERY',
        'QUERYAEONOLDAMOUNTCOUPON',
        'CHANGEORDERTYPE',
        'QUERYAEONOLDCOUPON'
    ]
    if (codeCommand_id.indexOf(data.command_id) > -1) {
        return deepCode(data, type);
    }
    return data;
}

export function Fetch(options) {
    if (!window.fetchCount && window.fetchCount != 0) window.fetchCount = 0;
    const data = coding(options.data, 1);
    window["Log"](JSON.stringify(options));
    if (!options.fetchFlag && window.fetchFlag) {  //非阻塞请求传入@fetchFlag：true
        return Promise.resolve((() => false)());
    }
    if (!window.fetchCount) {
        window.loadDom = document.createElement('div');
        document.body.appendChild(window.loadDom);
        ReactDOM.render(
            <div className="loading_mask" onClick={(e) => { e.stopPropagation() }}>
                <Spin size="large" />
            </div>,
            window.loadDom
        )
    }
    window.fetchCount++;
    window.fetchFlag = true;
    let init = {
        headers: { "Content-Type": "application/json;charset=UTF-8" }
    };
    let url = options.url;
    let errorResponse = { retflag: "500", retmsg: "網絡異常，請求失敗。" };
    switch (options.type.toLocaleUpperCase()) {
        case "GET":
            init = {
                ...init,
                method: "GET",
            };
            let query = "";
            for (let x in data) {
                query += `${x}=${data[x]}&`;
            }
            if (query.length) {
                query = `?${query}`;
                url += query.slice(0, query.length - 1);
            }
            break;
        case "POST":
            // const searchParams = new URLSearchParams();
            // for (let x in data) {
            //     searchParams.set(x, data[x]);
            // }
            // console.log(searchParams.toString());
            init = {
                ...init,
                method: "POST",
                body: JSON.stringify(data)
            };
            break;
        default:
            break;
    }
    return fetch(url, init).then(res => {
        window.fetchFlag = false;
        window.fetchCount--;
        if (window.loadDom && !window.fetchCount) {
            document.body.removeChild(window.loadDom);
        }
        if (res.ok) {
            let response = res.json();
            response.then(res => {
                window["Log"](JSON.stringify(res));
                coding(res, 0);
            })
            return response;
        }else {
            console.log('response', res);
            window["Log"](JSON.stringify(errorResponse));
        }
        return errorResponse;
    }).catch(err => {
        window.fetchFlag = false;
        window.fetchCount--;
        if (window.loadDom && !window.fetchCount) {
            document.body.removeChild(window.loadDom);
        }
        console.log("Fetch失败" + err);
        window["Log"](err.toString());
        return errorResponse;
    });
}
