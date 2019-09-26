import React, { Component } from 'react';
import {Modal, message} from 'antd';
import '../style/lock.less'

const info = () => {
    message.info('請進行工牌刷卡操作！');
};

const msgInfo = [
    {title: '收銀員編號', msg: '334123'},
    {title: '收銀機號', msg: '022'},
    {title: '今日成交量', msg: '133'}
]

class LockScreen extends Component {

    render() {
        let {lockVisible, lockConfirm, onCancelConfirm, openLock, onCancelLock} = this.props;
        return (
            <div>
                <Modal
                    title={null}
                    visible={lockVisible}
                    closable={false}
                    maskClosable={false}
                    footer={null}
                    mask={true}
                    zIndex={3}
                    width={400}
                    style={{
                        position: 'absolute',
                        margin: 'auto',
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        width: '50%',
                        height: '50%'
                    }}
                    bodyStyle={{margin: 0, padding: 0}}
                >
                    <div className="lock_screen">
                        <div className="head">
                            簽離
                        </div>
                        <div className="content">
                            {
                                msgInfo.map((item, key) =>
                                    <div className="msg" key={key}>
                                        {item.title}: {item.msg}
                                    </div>
                                )
                            }
                        </div>
                        <div className="foot">
                            <input type="button" className="btn" value="解 鎖" onClick={() => {
                                info();
                                setTimeout(function () {
                                    onCancelLock();
                                }, 1500);
                            }}/>
                        </div>
                    </div>
                </Modal>
                <Modal
                    title={null}
                    visible={lockConfirm}
                    closable={false}
                    maskClosable={false}
                    footer={null}
                    mask={true}
                    zIndex={2}
                    width={400}
                    style={{
                        position: 'absolute',
                        margin: 'auto',
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        width: '50%',
                        height: '50%'
                    }}
                    bodyStyle={{margin: 0, padding: 0}}
                >
                    <div className="confirm_screen">
                        <div className="head">
                            溫馨提示！
                            <img src={require("@/common/image/close.png")} alt=""  onClick={onCancelConfirm}/>
                        </div>
                        <div className="content">
                            <div className="msg">
                                請確認進行簽離操作.
                            </div>
                        </div>
                        <div className="foot">
                            <input type="button" className="btn" value="確 認"  onClick={openLock}/>
                        </div>
                    </div>
                </Modal>
            </div>
        )
    }
}

export default LockScreen;