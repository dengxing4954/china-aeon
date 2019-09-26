import React, { Component } from 'react';
import EventEmitter from '@/eventemitter';
import { Fetch } from '@/fetch/';
import Url from '@/config/url.js';
import message from '@/common/components/message';
import store from '@/Store.js';
import withKeyBoard from '@/common/components/keyBoard';

//小鍵盤
class Accredit extends Component {
    componentDidMount() {
        EventEmitter.on('Com', this.com);
        this.props.bind({
            "35": () => {
                this.props.onCancel();
            }
        });
    }

    componentWillUnmount() {
        EventEmitter.off('Com', this.com);
    }

    com = (data) => {
        let { mkt, syjh, jygs } = store.getState().initialize;
        let operators = store.getState().login.operuser && store.getState().login.operuser.gh;
        let cardNo = store.getState().login.operuser && store.getState().login.operuser.cardno;
        let jygz = jygs;
        let reqParams = this.props.reqParams || {}
        if (!reqParams.flow_no && cardNo === data) {
            message('不能給自己授權！');
            return false;
        }
        Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: {
                    command_id: 'USERAUTHORIZATIONCERTIFY',
                    cardNo: data,
                    shopCode: mkt,
                    terminalOperator: operators,
                    terminalNo: syjh,
                    erpCode: jygz,
                    flowNo: reqParams.flow_no,
                    ...reqParams,
                }
            }
        ).then((res) => {
            if (!res) return;
            if ("0" === res.returncode) {
                this.props.destory(res.data);
                setTimeout(() => {
                    document.getElementsByTagName('input').length === 1 && document.getElementById('codeInput') && document.getElementById('codeInput').focus();
                }, 300)
            }
            else {
                message(res.data);
                // if ("1001" === res.retflag) {
                //     message('不能給自己授權！');
                // } else {
                //     message(res.retmsg);
                // }
            }
        }).catch((error) => {
            message('未能找到人員信息！');
        });
    }

    render() {
        return (
            <div>
                <p>
                    <span>{this.props.contentMsg || '請拉可授權之員工卡'}</span>
                </p>
                <input style={{ display: "none" }}></input>
            </div>
        );
    }
}

export default withKeyBoard(Accredit)