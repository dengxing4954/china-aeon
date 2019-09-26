import React, { Component } from 'react';
import { Modal, Row, Col, Button, Icon, Checkbox, Alert, Input, Form } from 'antd';
import message from '@/common/components/message';
import '../style/ExtraPay.less';
import NumberCount from '@/common/components/numberCount/index.js';
import ShowPaybox from '@//common/components/showPaybox';
import withKeypad from '@/common/components/keypad/';
import intl from 'react-intl-universal';
import withKeyBoard from '@/common/components/keyBoard';
import RechargeKeypad from '@/common/components/rechargeKeypad/index.js';
const FormItem = Form.Item;

class GiftGroupList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            giftList: []
        }
    }

    componentDidMount() {
        this.props.onRef(this);
    }

    selectGift = (checked, item) => {
        let { giftList } = this.state;
        if (checked) {
            let max = this.props.giftGroup.giftGroup[0].maxQty;
            let total = 0
            giftList.forEach(item => {
                total += item.qty;
            })
            if(total === max) {
                //当前分组可选赠品最大数量不超过${max}
                message(intl.get("EXTRA_INFO_GIFTMAX", {max: max}));
                return false;
            }

            item.qty = 1;
            giftList.push(item);
        } else {
            let index = giftList.indexOf(item);
            giftList.splice(index, 1);
        }
        this.setState({ giftList });
        this.props.callback(this.props.giftGroup.groupId, giftList);
    }

    giftNumberChange = (qty, item) => {
        let { giftList } = this.state;
        let index = giftList.indexOf(item);
        //增加数量是判断是否超过分组的最大数量
        if (giftList[index].qty < qty) {
            let max = this.props.giftGroup.giftGroup[0].maxQty;
            let total = 0
            giftList.forEach(item => {
                total += item.qty;
            })
            if(total === max) {
                //当前分组可选赠品最大数量不超过${max}
                message(intl.get("EXTRA_INFO_GIFTMAX", {max: max}));
                return false;
            }
        }
        giftList[index].qty = qty;
        this.setState({ giftList });
        this.props.callback(this.props.giftGroup.groupId, giftList);
    }

    render() {
        const { giftGroup, giftKey } = this.props;
        const { giftList } = this.state;
        return (
            <div>
                <div className="gift_group">
                    {/*`分组${giftGroup.groupId}（最多可选赠品数量：${giftGroup.giftGroup[0].maxQty}）`*/}
                    {intl.get("EXTRA_INFO_GIFTMAX2",
                        {group: giftGroup.groupId, max: giftGroup.giftGroup[0].maxQty})}
                </div>
                {giftGroup.giftGroup.map((item, index) =>
                    <Row className={`table_body ${giftKey === item ? 'hovered' : ''}`} key={index}>
                        <Col span={2}>
                            <Checkbox checked={giftList.indexOf(item) !== -1 ? true : false}
                                onChange={(e) => this.selectGift(e.target.checked, item)}></Checkbox>
                        </Col>
                        <Col span={4}>{item.code}</Col>
                        <Col span={10} className={item.mode === '1' ? 'gift_name' : ''}>
                            <span>{item.name}</span>
                            <br />
                            {item.mode === '1' && item.poplsj > 0 ?
                                <span style={{ color: '#f5222d' }}>
                                    <i>{intl.get("EXTRA_GIFTJJ")}</i>
                                    <i>{giftList[giftList.indexOf(item)] ?
                                        '$' + item.poplsj * giftList[giftList.indexOf(item)].qty : '$' + item.poplsj }</i>
                                </span> : null
                            }
                        </Col>
                        <Col span={5}>
                            {giftList.indexOf(item) !== -1 ?
                                <NumberCount num={giftList[giftList.indexOf(item)].qty}
                                             min={1}
                                             max={item.limit_qty}
                                             callback={(qty) => {this.giftNumberChange(qty, item)}}/> : '0'
                            }
                        </Col>
                        <Col span={3}>{item.maxQty}</Col>
                    </Row>
                )}
            </div>
        )
    }
}

class ExtraPay extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pagination: {
                showSizeChanger: false,
                current: 1,
                pageSize: 10
            },
            paidList: [],
            giftListGroup: {},
            noPriceGiftList: [],
            exceptPay: null,
            readOnly: true,
            paymodeCollapsed: true,
            delVisible: false,//删除付款
            cancellVisible: false,//取消支付
            payDialogData: {},//当前支付方式属性
            puid: "",
            sjys: props.data.total,
            sjfk: props.data.sjtotal,
            syyf: props.data.total,
            giftList: [],
            giftKey: null,
            noPriceGiftKey: null,
        }
    }

    componentDidMount() {
        if(this.props.keyControl) {
            let bindObj = {
                //pageUP
                "33": () => {
                    const boxEle = this.refs.extraPayScroll;
                    boxEle.scrollTop -= 50;
                },
                //pageDown
                "34": () => {
                    const boxEle = this.refs.extraPayScroll;
                    boxEle.scrollTop += 50;
                },
                //左箭头
                "37": () => {
                },
                //上箭头
                "38": () => {
                    // if(this.state.keyIndex > 0 ) {
                    //     let index = this.state.keyIndex - 1;
                    //     this.setState({keyIndex: index});
                    // }
                },
                //右键头
                "39": () => {
                },
                //下箭头
                "40":  () => {
                    // if(this.state.keyIndex < this.props.billList.length - 1 ) {
                    //     let index = this.state.keyIndex + 1;
                    //     this.setState({keyIndex: index});
                    // }
                },
                //f7
                "118": this.closeModal,
            }
            switch (this.props.type) {
                case 'exceptPays':
                    this.props.bind({
                        ...bindObj,
                        //上箭头
                        "38": () => {
                            const exceptPayList = this.props.data.exceptPays;
                            if(!this.state.exceptPay) {
                                this.setState({exceptPay: exceptPayList[0]});
                                return;
                            }
                            let index = exceptPayList.indexOf(this.state.exceptPay);
                            if(index > 0) {
                                this.setState({exceptPay: exceptPayList[index - 1]});
                            }
                        },
                        //下箭头
                        "40":  () => {
                            const exceptPayList = this.props.data.exceptPays;
                            if(!this.state.exceptPay) {
                                this.setState({exceptPay: this.exceptPayList[0]});
                                return;
                            }
                            let index = exceptPayList.indexOf(this.state.exceptPay);
                            if(index < exceptPayList.length - 1) {
                                this.setState({exceptPay: exceptPayList[index + 1]});
                            }
                        },
                        //f1
                        "112": () => {
                            this.setState({
                                exceptPay: null
                            })
                        },
                        //f2
                        "113": () => {
                            
                        },
                        //f6
                        "117": this.exceptOk,
                    })
                    break;
                case 'giftList':
                    let giftSelectList = [];
                    this.props.data.giftGroupList.forEach(item => {
                        item.giftGroup.forEach(ele => {
                            ele.groupKey = item.groupId;
                            giftSelectList.push(ele);
                        })
                    });
                    this.props.bind({
                        ...bindObj,
                        //上箭头
                        "38": () => {
                            if(!this.state.giftKey) {
                                this.setState({giftKey: giftSelectList[0]});
                                return;
                            }
                            let index = giftSelectList.indexOf(this.state.giftKey);
                            if(index > 0) {
                                this.setState({giftKey: giftSelectList[index - 1]});
                            }
                        },
                        //下箭头
                        "40":  () => {
                            if(!this.state.giftKey) {
                                this.setState({giftKey: giftSelectList[0]});
                                return;
                            }
                            let index = giftSelectList.indexOf(this.state.giftKey);
                            if(index < giftSelectList.length - 1) {
                                this.setState({giftKey: giftSelectList[index + 1]});
                            }
                        },
                        //f1
                        "112": () => {
                            const {giftKey} = this.state;
                            if(!giftKey) return;
                            this['giftGroupList' + giftKey.groupKey].selectGift(true, giftKey);
                        },
                        //f2
                        "113": () => {
                            const {giftKey} = this.state;
                            if(!giftKey) return;
                            this['giftGroupList' + giftKey.groupKey].selectGift(false, giftKey);
                        },
                        //f3
                        "114": () => {
                            const {giftKey} = this.state;
                            if(!giftKey) return;
                            if(this['giftGroupList' + giftKey.groupKey].state.giftList.indexOf(giftKey) === -1) return;
                            RechargeKeypad.open({
                                title: '修改赠品数量', //"修改商品数量",
                                placeholder: '请输入赠品数量',    //"请输入商品数量",
                                errMessage: `请输入1~${giftKey.limitQty}之间的整数`,
                                rule: (num) => {
                                    if (/^(\d+)$/.test(num) && num * 1 >= 1 && num * 1 <= giftKey.limitQty) {
                                        return true;
                                    }
                                    return false;
                                },
                                keyControl: true,
                                callback: (value) => this['giftGroupList' + giftKey.groupKey].giftNumberChange(value, giftKey)
                            })
                        },
                        //f6
                        "117": this.giftOk,
                    })
                    break;
                case 'noPriceGiftList':
                    this.props.bind({
                        ...bindObj,//上箭头
                        "38": () => {
                            const {noPriceGiftList} = this.props.data;
                            let {noPriceGiftKey} = this.state;
                            if(!noPriceGiftKey) {
                                noPriceGiftKey = noPriceGiftList[0];
                            } else {
                                let index = noPriceGiftList.indexOf(noPriceGiftKey);
                                if(index > 0) {
                                    noPriceGiftKey = noPriceGiftList[index - 1]
                                }
                            }
                            this.setState({noPriceGiftKey})
                            this.props.form.getFieldInstance(noPriceGiftKey.guid).focus();
                        },
                        //下箭头
                        "40":  () => {
                            const {noPriceGiftList} = this.props.data;
                            let {noPriceGiftKey} = this.state;
                            if(!noPriceGiftKey) {
                                noPriceGiftKey = noPriceGiftList[0];
                            } else {
                                let index = noPriceGiftList.indexOf(noPriceGiftKey);
                                if(index < noPriceGiftList.length - 1) {
                                    noPriceGiftKey = noPriceGiftList[index + 1]
                                }
                            }
                            this.setState({noPriceGiftKey})
                            this.props.form.getFieldInstance(noPriceGiftKey.guid).focus();
                        },
                        //f6
                        "117": this.giftPriceOk,
                    })
                    break;
                case 'limitedPays':
                    this.props.bind({
                        ...bindObj,
                        //f6
                        "117": this.limitedOk,
                        //f7
                        "118": this.limitedCancel,
                    })
                    break;
                case 'retGiftList':
                    this.props.bind({
                       ...bindObj,
                       //f6
                       "117": this.retOk,
                       //f7
                       "118": this.giftCancel,
                    })
                    break;
                
            }
        }
    }

    limitedOk = () => {
        if (this.props.callback) {
            this.props.callback(this.state.paidList.map(i => i.paycode));
        }
    }

    limitedCancel = () => {
        if (this.state.paidList.length > 0) {
            message(intl.get("EXTRA_INFO_CANCEL"));
            return false;
        }
        this.props.close();
    }

    limitedpay = (item) => {
        if (this.state.syyf <= 0) {
            message(intl.get("EXTRA_INFO_PAYDOWN"))
        } else {
            this.setState({
                payDialogData: { ...item }
            })
        }
    }

    limitedpayCancel = () => {
        this.setState({
            payDialogData: {},
            paymodeCollapsed: true,
        })
    }

    limitedpayDown = (isPaySuccessed, result, errMsg) => {
        /*let {paidList} = this.state;
        paidList.push(result.salePayments[0]);*/
        this.setState({
            paidList: result.salePayments,
            sjfk: result.sjfk,
            sjys: result.total,
            syyf: result.remainje
        })
    }

    limitedpayDelete = (puid) => {
        const { initialState } = this.props;
        this.props.payDelete({
            operators: initialState.operators,
            flow_no: initialState.flow_no,
            mkt: initialState.mkt,
            syjh: initialState.syjh,
            guid: puid
        }).then(res => {
            if (res) {
                this.setState({
                    paidList: res.salePayments,
                    sjfk: res.zdsjtotal,
                    sjys: res.zdyftotal,
                    syyf: res.remainje
                })
            }
        })
    }

    giftCallback = (groupId, giftList) => {
        let { giftListGroup } = this.state;
        if (giftList.length > 0) {
            giftListGroup[groupId] = giftList;
        } else {
            delete giftListGroup[groupId];
        }
        this.setState({ giftListGroup });
    }

    giftCancel = () => {
        if (this.props.callback) {
            this.props.callback();
        }
    }

    giftOk = () => {
        if (this.props.callback) {
            const { giftListGroup } = this.state;
            if (JSON.stringify(giftListGroup) === '{}') {
                /*message('请选择赠品，放弃选择赠品请点击取消！');*/
                this.props.callback();
                return false;
            }
            let giftList = [];
            for (let key in giftListGroup) {
                giftList = giftList.concat(giftListGroup[key].map(item => {
                    return { guid: item.code, qty: item.qty, groupId: key }
                }))
            }
            this.props.callback(giftList);
        }
    }

    setGiftPrice = (value) => {
        this.props.form.setFieldsValue(value);
    }

    giftPriceOk = () => {
        this.props.form.validateFields((err, values) => {
            if (!err && this.props.callback) {
                let noPriceGiftList = [];
                for (let key in values) {
                    noPriceGiftList.push({ guid: key, salePrice: values[key] });
                }
                this.props.callback(noPriceGiftList);
            }
        });
    }

    exceptPayChoose = (item) => {
        if (this.state.exceptPay && this.state.exceptPay.paycode === item.paycode) {
            this.setState({ exceptPay: null })
        } else {
            this.setState({ exceptPay: item })
        }
    }

    exceptOk = () => {
        const { exceptPay } = this.state;
        if (this.props.callback) {
            if (exceptPay) {
                /*if (!exceptPay.paycode) {
                    message('请选择支付方式');
                    return;
                }*/
                this.props.callback(exceptPay);
                return;
            }
            this.props.callback();
        }
    }

    closeModal = () => {
        if (this.props.cancel) {
            this.props.cancel().then(res => {
                if (res) {
                    this.props.close();
                }
            })
        } else {
            this.props.close();
        }
    }

    selectGift = (e, item) => {
        let { giftList } = this.state;
        if (e.target.checked) {
            giftList.push(item);
        } else {
            let index = giftList.indexOf(item);
            giftList.splice(index, 1);
        }
        this.setState({ giftList });
    }

    giftNumberChange = (qty, item) => {
        let { giftList } = this.state;
        let index = giftList.indexOf(item);
        giftList[index].qty = qty;
        this.setState({ giftList });
    }

    giftPriceValidator = (rule, value, callback) => {
        const {maxGiftPrice} = this.props;
        if (value && value !== '0' && ((maxGiftPrice && value*1 > maxGiftPrice *1) ||
            /^((0\.\d{1,2})||([1-9]\d{0,6}(\.\d{1,2})?))$/.test(value) === false)) {
            callback(intl.get("INFO_TIP9", {max: maxGiftPrice}))
        }
        callback()
    }

    retOk = () => {
        if (this.props.callback) {
            const { giftList } = this.state;
            let gifts = [] = giftList.map(item => {
                return { guid: item.guid, qty: item.qty };
            });
            this.props.callback(gifts);
        }
    }

    render() {
        const { data, type, paymodeList, initialState, form, syspara, maxGiftPrice, keyControl } = this.props;
        const { sjfk, sjys, syyf, exceptPay, giftList } = this.state;
        const modalTital = {
            limitedPays: intl.get("EXTRA_LIMITE"),
            giftList: intl.get("EXTRA_GIFT"),
            noPriceGiftList: intl.get("EXTRA_NOPRICEGIFT"),
            exceptPays: intl.get("EXTRA_EXCEPT"),
        }
        if (type === 'limitedPays') {
            data.limitedPays = data.limitedPays.map(item => {
                let _paymode = paymodeList.find(v => v.code === item.paycode);
                return { ...item, ..._paymode };
            })
        }
        if (type === 'exceptPays') {
            data.exceptPays = data.exceptPays.map(item => {
                let _paymode = paymodeList.find(v => v.code === item.paycode);
                return { ...item, ..._paymode };
            })
        }
        return (
            <Modal
                className='extrapay'
                visible={true}
                width={834}
                title={modalTital[type]}
                footer={null}
                maskClosable={false}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
            >
                {/*type !== 'retGiftList' ? <Icon type="close" onClick={this.closeModal} /> : null*/}
                {/*****除外支付*****/}
                {type === 'limitedPays' ?
                    <div className='limitedpay'>
                        <div className='limitedpay_le'>
                            <Row className="table_head">
                                <Col span={6}>{intl.get("PAY_TYPE")}</Col>
                                <Col span={10}>{intl.get("ACTIVE_TICKETNUMBER")}</Col>
                                <Col span={6}>{intl.get("EXTRA_PAYMENT")}</Col>
                                <Col span={2}></Col>
                            </Row>
                            {this.state.paidList.map((item, index) =>
                                <Row className="table_body" key={item.puid}>
                                    <Col span={6}>{item.payname}</Col>
                                    <Col span={10}>{item.payno}</Col>
                                    <Col span={6}>{item.total}</Col>
                                    <Col span={2}>
                                        <Icon type="close-circle-o"
                                            onClick={() => this.limitedpayDelete(item.puid)} />
                                    </Col>
                                </Row>
                            )}
                        </div>
                        <div className='limitedpay_ri'>
                            <p>{data.limitedPays[0].describe}</p>
                            <ul className='payUl'>
                                {data.limitedPays.map(item =>
                                    <li key={item.paycode}
                                        onClick={() => this.limitedpay(item)}>
                                        <span>{item.name}</span>
                                    </li>
                                )}
                                {/*<li>
                                    <span>电子券</span>
                                </li>
                                <li>
                                    <span>电子余额</span>
                                </li>
                                <li>
                                    <img src={require('@/common/image/xinyongka.png')} alt=""
                                         style= {{display:'inline-block',width:'34px',height: '22px',position:'absolute',left:'22px',top:'17px'}}/>
                                    <p>信用卡</p>
                                </li>
                                <li>
                                    <img src={require('@/common/image/zhaohangka.png')} alt=""
                                         style= {{display:'inline-block',width:'27px',height: '28px',position:'absolute',left:'25px',top:'11px'}}/>
                                    <p>招行卡</p>
                                </li>
                                <li>
                                    <img src={require('@/common/image/zhongxinka.png')} alt=""
                                         style= {{display:'inline-block',width:'28px',height: '28px',position:'absolute',left:'25px',top:'11px'}}/>
                                    <p>中信卡</p>
                                </li>
                                <li>
                                    <img src={require('@/common/image/alipay.png')} alt=""
                                         style= {{display:'inline-block',width:'28px',height: '34px',position:'absolute',left:'25px',top:'7px'}}/>
                                    <p>Alipay</p>
                                </li>
                                <li>
                                    <h3>Wechat</h3>
                                    <h4>Pay</h4>
                                </li>
                                <li>
                                    <span>抵消券</span>

                                </li>
                                <li>
                                    <span>买换券</span>
                                </li>
                                <li>
                                    <span>电子券WJ</span>
                                </li>
                                <li>
                                    <h1>惠GO</h1>
                                    <h2>手工券</h2>
                                </li>
                                <li>
                                    <h1>惠GO</h1>
                                    <h2>印花券</h2>
                                </li>
                                <li>
                                    <h1>惠GO</h1>
                                    <h2>电子券</h2>
                                </li>
                                <li>
                                    <img src={require('@/common/image/weixin.png')} alt=""
                                         style= {{display:'inline-block',width:'30px',height: '26px',position:'absolute',left:'24px',top:'10px'}}/>
                                    <p>微信支付</p>
                                </li>*/}
                            </ul>
                            <div className='payNumber'>
                                <div className='pay_le'>
                                    <h1>{/*总折扣: <span>{`¥ ${discount}`}</span>*/}</h1>
                                    <h1>{intl.get("EXTRA_SJYS")}: <span>{`¥ ${sjys}`}</span></h1>
                                    <h1>{intl.get("EXTRA_YFJE")}: <span>{`¥ ${sjfk}`}</span></h1>
                                </div>
                                <div className='pay_ri'>
                                    <h1>{intl.get("EXTRA_SYYF")}</h1>
                                    <h2>{`¥ ${syyf}`}</h2>
                                </div>
                            </div>
                            <div className='handleButton'>
                                <Button style={{ float: 'left' }} onClick={this.limitedCancel}>取消</Button>
                                <Button style={{ float: 'right' }} type='primary' onClick={this.limitedOk}>完成</Button>
                            </div>
                            <ShowPaybox
                                payModeData={this.state.payDialogData}
                                extra={initialState}
                                yfzje={data.yfzje}
                                sjzje={data.sjzje}
                                syspara={syspara}
                                onAfterPay={this.limitedpayDown}
                                onHidePay={this.limitedpayCancel}
                                sftotal={data.sftotal} />
                        </div>
                    </div> : null
                }
                {/*****支付追送（支付折扣）*****/}
                {type === 'exceptPays' ?
                    <div className='exceptPays'>
                        <Alert message={intl.get("EXTRA_INFO_ALERT")}
                            type="warning" />
                        <ul ref="extraPayScroll">
                            {data.exceptPays.map((item, index) =>
                                <li key={index}>
                                    <p>{item.describe}</p>
                                    {item.crdInfo && item.crdInfo.length > 0 ?
                                        item.crdInfo.map((_item, _index) =>
                                            /*<p key={_index}>{intl.get("EXTRA_INFO_CARDRANGE", {
                                                memo: item.memo || '',
                                                crdFrom: _item.crdLocation,
                                                crdTo: _item.crdLocation + _item.crdLength,
                                                crdBegin: _item.crdBegin,
                                                crdEnd: _item.crdEnd})}
                                            </p>*/
                                            <p key={_index}>
                                                {_item.memo ? <span style={{marginRight : 20}}>{_item.memo}</span> :null}
                                                {_item.crdBegin && _item.crdBegin ? `(${_item.crdBegin} - ${_item.crdEnd})` : null}
                                            </p>)
                                        :null
                                    }
                                    {/*item.crdBegin ?
                                        <p>{intl.get("EXTRA_INFO_CARDRANGE", {
                                                crdFrom: item.crdLocation,
                                                crdTo: item.crdLocation + item.crdLength,
                                                crdBegin: item.crdBegin,
                                                crdEnd: item.crdEnd})}
                                        </p> : null
                                    */}
                                    <div className={exceptPay === item ? "payUl payUl_select" : "payUl"}
                                        onClick={() => this.exceptPayChoose(item)}>{item.name}</div>
                                </li>
                            )}
                        </ul>
                        <div className='handleButton'>
                            <Button onClick={this.closeModal}>取消</Button>
                            <Button type='primary' onClick={this.exceptOk}>完成</Button>
                        </div>
                    </div> : null
                }
                {/*****赠品选择*****/}
                {type === 'giftList' ?
                    <div className="giftList">
                        <div ref="extraPayScroll" className='giftList_list'>
                            <Row className="table_head">
                                <Col span={2}></Col>
                                <Col span={4}>{intl.get("EXTRA_GIFTCODE")}</Col>
                                <Col span={10}>{intl.get("EXTRA_GIFTINFO")}</Col>
                                <Col span={5}>{intl.get("EXTRA_GIFTQTY")}</Col>
                                <Col span={3}>{intl.get("EXTRA_GIFTMAX")}</Col>
                            </Row>
                            {data.giftGroupList.map((item, index) =>
                                <GiftGroupList
                                    onRef={(ref) => {this['giftGroupList' + item.groupId] = ref}}
                                    key={index}
                                    giftGroup={item}
                                    giftKey={this.state.giftKey}
                                    callback={this.giftCallback} />
                            )}
                        </div>
                        <div className='handleButton'>
                            <Button onClick={this.closeModal}>取消</Button>
                            <Button type='primary' onClick={this.giftOk}>完成</Button>
                        </div>
                    </div> : null
                }
                {/*****退货赠品选择*****/}
                {type === 'retGiftList' ?
                    <div className="giftList">
                        <div ref="extraPayScroll" className='giftList_list'>
                            <Row className="table_head">
                                <Col span={3}></Col>
                                <Col span={5}>{intl.get("EXTRA_GIFTCODE")}</Col>
                                <Col span={10}>{intl.get("EXTRA_GIFTINFO")}</Col>
                                <Col span={6}>{intl.get("EXTRA_GIFTQTY")}</Col>
                            </Row>
                            {data.gifts.map((item, index) =>
                                <Row className="table_body" key={index}>
                                    <Col span={3}>
                                        <Checkbox checked={giftList.indexOf(item) !== -1 ? true : false}
                                            onChange={(e) => this.selectGift(e, item)}></Checkbox>
                                    </Col>
                                    <Col span={5}>{item.barcode}</Col>
                                    <Col span={10}>
                                        <span>{item.fname}</span>
                                    </Col>
                                    <Col span={6}>
                                        {giftList.indexOf(item) !== -1 ?
                                            <NumberCount num={giftList[giftList.indexOf(item)].qty}
                                                min={1}
                                                max={item.qty}
                                                callback={(qty) => { this.giftNumberChange(qty, item) }} /> : item.qty
                                        }
                                    </Col>
                                </Row>
                            )}
                        </div>
                        <div className='handleButton'>
                            <Button onClick={this.giftCancel}>取消</Button>
                            <Button type='primary' onClick={this.retOk}>完成</Button>
                        </div>
                    </div> : null
                }
                {/*****赠品定价*****/}
                {type === 'noPriceGiftList' ?
                    <div className="giftList noPriceGiftList">
                        <div ref="extraPayScroll" className='giftList_list'>
                            <Row className="table_head">
                                <Col span={4}>{intl.get("EXTRA_GIFTCODE")}</Col>
                                <Col span={10}>{intl.get("EXTRA_GIFTINFO")}</Col>
                                <Col span={10}>{intl.get("EXTRA_GIFTPRICE")}</Col>
                            </Row>
                            <Form>
                                {data.noPriceGiftList.map((item, index) =>
                                    <Row className="table_body" key={index}>
                                        <Col span={4}>{item.goodsno}</Col>
                                        <Col span={10}>{item.fname}</Col>
                                        <Col span={10}>
                                            <FormItem>
                                                {form.getFieldDecorator(item.guid, {
                                                    rules: [
                                                        { required: true, message: intl.get("PLACEHOLDER_IPRICE") },
                                                        {
                                                            validator: this.giftPriceValidator
                                                        }
                                                    ],
                                                })(
                                                    keyControl ? 
                                                        <Input /> : 
                                                        <Input
                                                            name={item.guid}
                                                            onBlur={this.props.blur}
                                                            onFocus={(e) => {
                                                                this.props.focus(e, this.setGiftPrice);
                                                            }} />
                                                )}
                                            </FormItem>
                                        </Col>
                                    </Row>
                                )}
                            </Form>
                        </div>
                        <div className='handleButton'>
                            <Button onClick={this.closeModal}>取消</Button>
                            <Button type='primary' onClick={this.giftPriceOk}>完成</Button>
                        </div>
                    </div> : null
                }
            </Modal>
        )
    }
}

ExtraPay = Form.create()(ExtraPay)

export default withKeyBoard(withKeypad(ExtraPay))