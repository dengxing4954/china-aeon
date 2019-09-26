import React, { Component } from 'react';
import { Icon, Input, Col, Spin, Modal } from 'antd';
import message from '@/common/components/message';
import TableModal from '@/common/components/tablemodal/index.js';
import NumberKeypad from '@/common/components/numberKeypad/index.js';
import TagSelect from './TagSelect.js';
import RechargeKeypad from '@/common/components/rechargeKeypad/index.js';
import EventEmitter from '@/eventemitter';
import intl from 'react-intl-universal';
import moment from 'moment';
const searchIcon = require('@/common/image/search3.png');
const scannerIcon = require('@/common/image/scanner.png');
const mamicardNo = require('@/common/image/mamicard-no.png')
const mamicardYes = require('@/common/image/mamicard-yes.png');
const pointNo = require('@/common/image/point-no.png');
const pointYes = require('@/common/image/point-yes.png');
const moneyNo = require('@/common/image/money-no.png');
const moneyYes = require('@/common/image/money-yes.png');

//输入与提交
class PreSaleRight extends Component {

    constructor(props) {
        super(props);
        this.state = {
            goodsValue: '',
            vipValue: '',
            vipInput: false,
            showOperator: false,
            clockTime: moment().format('YYYY-MM-DD HH:mm:ss'),
            inputFlag: false,
            member: {
            }
        };
        this.timer = null;
    }

    componentDidMount() {
        this.timer = setInterval(() => {
            this.setState({ clockTime: moment().format('YYYY-MM-DD HH:mm:ss') })
        }, 1000)
        window.addEventListener('click', this.autoHideOperator);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
        window.removeEventListener('click', this.autoHideOperator)
    }

    //输入商品编码、会员卡
    inputCode = (name) => {
        return this.props.inputCode(name, this.state[name + 'Value'], 13, () => { this.setState({ [name + 'Value']: '' }) })
        /*this.setState({
         [name + 'Input']: !this.state[name + 'Input']
         })*/
    }

    //打开数字小键盘
    openKeypad = (name, left) => {
        if (!this.props.addGoodsVerify()) {
            return false;
        }
        NumberKeypad.open({
            top: 45,
            left: left,
            autoClose: true,
            maskClosable: false,
            boundInput: document.getElementById('codeInput'),
            onInput: (value) => {
                let _value = this.state[name + 'Value'];
                if (_value.length >= 26) {
                    return false;
                }
                this.setState({
                    [name + 'Value']: _value + value
                });
            },
            onBack: () => {
                let value = this.state[name + 'Value'];
                this.setState({
                    [name + 'Value']: value.substring(0, value.length - 1)
                });
            },
            onClear: () => {
                this.setState({
                    [name + 'Value']: ''
                });
            },
            onCancel: () => {
                this.setState({
                    [name + 'Value']: '',
                    //[name + 'Input']: false
                });
                document.getElementById('codeInput').focus();
            },
            onOk: () => {
                document.getElementById('codeInput').focus();
                if (this.state[name + 'Value'] === '') {
                    return false
                }
                return Promise.resolve(this.inputCode(name))
            },
        })
    }

    onInput = (e, name) => {
        this.setState({
            [name + 'Value']: e.target.value
        })
    }

    onInputKeyDown = (e, name) => {
        if (document.getElementById("numberKeypad")) {
            NumberKeypad.close();
        }
        if (!this.state.inputFlag) {
            let value = e.target.value;
            this.setState({
                goodsValue: value.length > 1 ? e.target.value.substring(value.length) : value,
                inputFlag: true
            });
        }
        if (e.keyCode === 13) {
            this.props.inputCode(name, e.target.value, e.keyCode, () => { })
            this.setState({
                inputFlag: false,
                [name + 'Value']: ""
            });
        }
    }

    onInputClick = (e) => {
        e.stopPropagation();
        console.log(e.target.selectionStart);
    }

    vipInput = () => {
        /* const com = (data) => {
             this.props.inputCode(
                 'vip',
                 data,
                 13,
                 () => {
                     RechargeKeypad.close();
                     EventEmitter.off('Com', com);
                 },
                 {idType: '1'}
             )
         }
         RechargeKeypad.open({
             title: intl.get("INFO_MEMBERLOGIN"),
             tabs: [{
                 name: intl.get("CARD_NUMBER"),  //卡号
                 value: '1'
             }, {
                 name:  intl.get("PHONE_NUMBER"), //手机号
                 value: '2'
             }],
             placeholder: '',
             callback: (value, idType) => this.props.inputCode('vip', value, 13, () => {}, {idType}),
             event: {
                 tabValue: '1',
                 chooseEvent: () => {
                     EventEmitter.on('Com', com)
                 },
                 cancelEvent: () => {
                     EventEmitter.off('Com', com)
                 }
             }
         })*/
        this.props.loginVip();
    }

    staffInput = () => {
        return
    }

    vipExit = () => {
        if (this.props.octozz === 'Y11') {
            message('會員續費單據不允許登出會員！');
            return false;
        }
        if (this.props.octozz === 'Y10') {
            message('會員入會單據不允許登出會員！');
            return false;
        }
        /*if(this.props.octozz === 'Y19') {
            message('換卡單據不允許登出會員！');
            return false;
        }*/
        this.props.addVip(this.props.vipInfo.consumersCard, { certifyType: 'CANCEL' }, () => { })
    }

    staffExit = () => {
        console.log('staff');
        this.props.inputStaffCode('staff', '', () => { }, { certifytype: 'CANCEL' });
    }

    showOperator = (e) => {
        if (!this.state.showOperator) {
            e.stopPropagation();
        }
        if (document.getElementById('numberKeypad')) {
            NumberKeypad.close();
        }
        this.setState({ showOperator: !this.state.showOperator });
    }

    autoHideOperator = () => {
        if (this.state.showOperator) {
            this.setState({ showOperator: false });
        }
    }

    showMenu = () => {
        const { showLeftMenu } = this.props;
        if (showLeftMenu === 'right') {
            this.props.handleLeftMenu(false)
        } else {
            this.props.handleLeftMenu('right')
        }
    }

    getMemberClass = () => {
        let classname = "member-info";
        if (JSON.stringify(this.state.member) !== '{}') {
            classname = 'member-info member-active'
        }
        return classname;
    }

    render() {
        const { goodsValue, brandsData, kindsData, brandsId, showOperator, kindsId, clockTime, couponData } = this.state;
        const { vipInfo, tempVip, operator, staffcard, djlb, fphm, octozz, isDc, isSd, onDeliveryCancel, onSwitchEng,
            switchEng, isDj, uploadData, loginVip } = this.props;
        return (
            <div className="presale_top">
                <div className="presale_top_le">

                    <div className="presale_le_language"
                        onClick={onSwitchEng}>
                        <span></span>
                        <span>{switchEng ? '中' : 'En'}</span>
                    </div>

                    <div className="presale_code" onClick={() => this.openKeypad('goods', 25)}>
                        <img src={searchIcon} alt="" />
                        <input id='codeInput'
                            placeholder={intl.get("SALES_TIPSELECT")}
                            autoFocus={true}
                            disabled={this.props.inputDisable}
                            type="text"
                            onInput={(e) => this.onInput(e, 'goods')}
                            value={goodsValue}
                            onKeyDown={(e) => this.onInputKeyDown(e, 'goods')}
                            onChange={(e) => { }}
                        />
                    </div>
                    <div className="presale_billno">
                        <span>{`单据号: ${fphm}`}</span>
                    </div>

                </div>
                <div className="presale_top_ri">
                    <div className="presale-top-ri-card">
                        <div className="member-card-left">
                            <div className="member-cardno">
                                <p>未登录</p>
                            </div>
                            <div className={this.getMemberClass()}>
                                <div>{this.state.member.memberName ? this.state.member.memberName : '提示顾客登录'}</div>
                                <div>
                                    <img src={this.state.member.point ? pointYes : pointNo} alt="" />
                                    <span>{this.state.member.point ? this.state.mmember.point : 0}</span>
                                </div>
                                <div>
                                    <img src={this.state.member.money ? moneyYes : moneyNo} alt="" />
                                    <span>{this.state.member.money ? this.state.member.money : 0.00}</span>
                                </div>
                            </div>
                        </div>
                        <div className={`member-card-right ${this.state.member.cardNo ? 'member-active' : ''}`}>
                            <img src={JSON.stringify(this.state.member) === '{}' ? mamicardNo : mamicardYes} alt="" />
                            <p>妈咪卡</p>
                        </div>
                    </div>
                    <div className="presale-top-ri-scan">
                        <img src={scannerIcon} alt="" onClick={() => loginVip()} />
                    </div>
                </div>
            </div>
        );
    }
}
export default PreSaleRight;
