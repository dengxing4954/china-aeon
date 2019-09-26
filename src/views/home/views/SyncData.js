import React, {Component} from 'react'
import Url from '@/config/url.js';
import {Fetch} from '@/fetch/';
import '../style/clear.less'; //主要使用上传窗口的CSS
import message from '@/common/components/message';
import {Modal, Button, Progress} from 'antd';


class SyncData extends Component {
    constructor(props) {
        super(props);
        this.state = {
            status: false,
            queue: [],
            percent: 0,
            uuid: 0,
        }
    }

    componentDidMount() {
    }

    render() {
        const {visible, onCancel} = this.props;
        const {percent, status} = this.state;
        return (
            <Modal
                title={null}
                visible={false}/*需要后续修改*/
                closable={false}
                maskClosable={false}
                footer={
                    status && percent > 0 ?
                        percent >= 99.9 ?
                            <Button onClick={() => onCancel('syncDataModal')}
                                    key={1}>
                                {'完成'}
                            </Button> :
                            <Button onClick={this.finishProgress} key={2}>
                                {'終止'}
                            </Button> :
                        <Button onClick={this.monitorCondt} key={3}>
                            {'开始'}
                        </Button>
                }
                mask={true}
                zIndex={10000}
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
                className="sortOutModal"
                destroyOnClose={true}
            >
                <div>
                    <div className="head">
                        {'數據同步'}
                    </div>
                    <div className="content">
                        <div className="msg">
                            <div style={{border: 'border:1px dashed #F00'}}>
                                <Progress type="dashboard"
                                          percent={parseFloat(percent.toFixed(1))}/>
                            </div>
                        </div>
                    </div>
                    <input type="text" style={{visibility: 'hidden'}}/>
                </div>
            </Modal>
        )
    }

    monitorCondt = () => {
        let req = {
            command_id: "GETSYNCOUNT",
        }
        let monitorAction = () => Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then(res => {
            if (res.retflag === "0" && res.synflag === "0") {
                this.beginSyn();
            }
        }).catch(err => {
            console.log(err);
        })

        if (this.props.initialize.online === '1') {
            monitorAction();
        } else {
            this.isOnline().then(res => {
                if (res) {
                    this.props.setState({online: '1'});
                } else {
                    this.props.onCancel('syncDataModal');
                    message("脫機狀態不支持上傳！");
                }
            })
        }
    }

    isOnline = () => {
        let req = {
            command_id: "ONLINE",
        }
        return Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then(res => {
            return res && res.online == 0;
        }).catch(err => {
            console.log(err);
        })
    }

    //服务清机打印成功后调用
    beginSyn = () => {
        let queue = [{name: 'promotionSyn'}, {name: 'orderSyn'}, {name: 'updatarenew'}],
            failQueue = [], title = '', len = queue.length;
        let getTitle = (key) => {
            switch (key) {
                case 'orderSyn':
                    return '訂單服務同步失敗';
                case 'promotionSyn':
                    return '營銷服務同步失敗';
                case 'updatarenew':
                    return '总部服務同步失败';
            }
        }
        if (this.state.queue.length) {
            queue = this.state.queue;
            len = queue.length;
        }

        let methodAction = (direaction = 0) => {
            let req = queue[direaction];
            if (this.props.visible) {
                if (req) {
                    if (req.status !== "0") {//判断接口状态
                        this[req.name]().then(({retflag, retmsg}) => {
                            let status = retflag;
                            queue[direaction].status = status;
                            if (status !== "0") {
                                if (title) {
                                    title += ',' + getTitle(req.name);
                                } else {
                                    title = getTitle(req.name);
                                }
                                failQueue.push(req);
                                methodAction(++direaction);
                            } else {
                                if (retmsg) {
                                    this.props.onCancel('syncDataModal');
                                    message("脫機狀態不支持上傳！");
                                    return;
                                }
                                this.setState({
                                    queue: queue,
                                    percent: this.state.percent + 1 / len * 100
                                }, () => {
                                    methodAction(++direaction);
                                });
                            }
                        })
                    } else {
                        methodAction(++direaction);
                    }
                } else {
                    failQueue.length !== 0 && this.renewSync(title, methodAction);
                    //置空数据
                    title = '';
                    failQueue = [];
                }
            }
        }

        this.setState({
            status: true,
            percent: this.state.queue.length ? this.state.percent : 0,
            uuid: (new Date()).valueOf(),
        }, methodAction);
    }

    renewSync(title, callBack) {
        let _this = this;
        Modal.confirm({
            title: '溫馨提示:',
            cancelText: '否',
            okText: '是',
            width: 450,
            zIndex: 10001,
            className: 'vla-confirm',
            content: title + '，是否重新同步?',
            onOk() {
                callBack();
            },
            onCancel() {
                _this.props.onCancel('syncDataModal');
            }
        });
    }

    finishProgress = () => {
        let req = {
            uuid: this.state.uuid,
            command_id: "STOPSYNOFFLINEDATA",
        }
        return Fetch(
            {
                fetchFlag: true,
                url: Url.base_url,
                type: "POST",
                data: req,
            }
        ).then(res => {
            if (res.retflag === "0") {
                this.props.onCancel('syncDataModal');
            } else {
                message(res.retmsg);
            }
        }).catch(err => {
            console.log(err);
        });
    }

    //启动订单中心同步
    orderSyn = () => {
        let req = {
            uuid: this.state.uuid,
            command_id: "ORDERSYN",
        }
        return Fetch(
            {
                fetchFlag: true,
                url: Url.base_url,
                type: "POST",
                data: req,
            }
        ).then(res => {
            return res;
        }).catch(err => {
            console.log(err);
        });
    }

    //启动营销订单同步
    promotionSyn = () => {
        let req = {
            command_id: "PROMOTIONSYN",
        }
        return Fetch(
            {
                fetchFlag: true,
                url: Url.base_url,
                type: "POST",
                data: req,
            }
        ).then(res => {
            return res;
        }).catch(err => {
            console.log(err);
        });
    }

    //启动同步pos总部
    updatarenew = () => {
        let req = {
            "erpCode": this.props.initialize.erpCode,
            "mkt": this.props.initialize.mkt,
            "syjh": this.props.initialize.syjh,
            "syjcursyyh": this.props.operators,
            "command_id": "SYNCPOSCENTERDATA",
            uuid: this.state.uuid,
        }
        return Fetch(
            {
                fetchFlag: true,
                url: Url.base_url,
                type: "POST",
                data: req,
            }
        ).then(res => {
            return res;
        }).catch(err => {
            console.log(err);
        });
    }
}

export default SyncData;