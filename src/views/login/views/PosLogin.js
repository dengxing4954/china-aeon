import React, { Component } from 'react';
import withKeypad from '@/common/components/keypad/';
import withKeyBoard from '@/common/components/keyBoard';
import '../style/posLogin.less';
import Key from '@/config/key';

const logoImg = require('@/common/image/logo.png');
const userIcon = require('@/common/image/user-login.png');
const pwdIcon = require('@/common/image/pwd-login.png');
const swipeIcon = require('@/common/image/swipe-login.png');
const usercardIcon = require('@/common/image/user-card.png');

class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loginType: 'account',   //account:帐号密码登录；swipe:刷卡登录
            loginChoice: 'both',    //both: 支持帐号密码和刷卡, swipe:仅支持刷卡
            cardNo: '',
            pwd: '',
            focusIndex: 0
        }
    }
    componentWillReceiveProps(nextProp) {

    }
    componentDidMount() {
        // window.addEventListener('keydown', this.handleKeydown, false);
        this.props.bind({
            [Key.enter]: () => {
                console.log(13)
            },
            "37": () => {
                console.log("left")
            },
            "39": () => {
                console.log('right')
            }
        })
        setTimeout(() => {
            this.cardNoInput.focus();
        }, 200);
    }
    componentWillUnmount() {
        // window.removeEventListener('keydown', this.handleKeydown);
    }

    changeLoginType = async () => {
        if (this.state.loginType === 'account') {
            this.cardNoInput && this.cardNoInput.blur();
            this.pwdInput && this.pwdInput.blur();
            this.props.keyPadClose();
        } else {
            setTimeout(() => {
                this.cardNoInput && this.cardNoInput.focus();
            }, 200);
        }
        this.setState((state, props) => ({
            loginType: state.loginType === 'account' ? 'swipe' : 'account'
        }))
    }

    handleKeydown = e => {
        let keycode = e.keyCode || e.which;
        if (keycode === 13) {
            this.login();
        } else if (keycode === 67) {
            this.changeLoginType();
        } else {
            if (this.state.loginType === 'swipe') {
                this.setState((state, props) => ({
                    cardNo: state.cardNo + e.key
                }))
            }
        }
    }

    setValue = value => {
        this.setState(value)
    }

    handleInputChange = (e, type) => {
        if (e.target) {
            let value = e.target.value;
            this.setState((state, props) => ({
                [type]: value
            }))
        } else {
            this.setValue(e);
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();
        if (!this.state.cardNo || !this.state.pwd) {
            return;
        }
        this.login();
    }

    login = () => {
        if (!this.state.cardNo || !this.state.pwd) {
            if (!this.state.cardNo) {
                this.cardNoInput.focus();
            } else {
                this.pwdInput.focus();
            }
            return;
        }
        let workRound = '0';
        let curTime = new Date().getHours();
        if (curTime >= 14) {
            workRound = '1';
        }
        this.props.submit(this.state.cardNo, "", this.state.pwd, workRound);
    }

    render() {
        return (
            <div>
                <div className={this.props.BrowserWindowID === 3 ? 'login-container login-scanner-background' : 'login-container'} >
                    <div className="login-box">
                        <div className="login-header">
                            <div>
                                <img src={logoImg} alt="logo" />
                            </div>
                            <p>{this.props.BrowserWindowID === 3 ? "扫描员登录" : "收银员登录"}</p>
                        </div>
                        <div className="login-body">
                            {
                                this.state.loginType === 'account' ?
                                    (<div className="login-account">
                                        <form onSubmit={this.handleSubmit}>
                                            <div className="login-form-item">
                                                <img src={userIcon} alt="" />
                                                <input ref={(input) => { this.cardNoInput = input }} type="number" name="cardNo" value={this.state.cardNo} onChange={async e => { e.persist(); this.handleInputChange(e, 'cardNo') }} placeholder="请输入员工帐号" {...this.props.inputBind(this.handleInputChange, 'right')} />
                                            </div>
                                            <div className="login-form-item">
                                                <img src={pwdIcon} alt="" />
                                                <input ref={(input) => { this.pwdInput = input }} type="password" name="pwd" value={this.state.pwd} onChange={e => { this.handleInputChange(e, 'pwd') }} placeholder="请输入密码" {...this.props.inputBind(this.handleInputChange, 'right')} />
                                            </div>
                                            <div className="login-form-item">
                                                <button type="submit" className={this.state.cardNo && this.state.pwd ? 'login-btn-active' : 'login-btn-disabled'}>登录</button>
                                            </div>
                                        </form>
                                    </div>) :
                                    (<div className="login-swipe">
                                        <div>
                                            <img src={swipeIcon} alt="" />
                                        </div>
                                        <button onClick={this.changeLoginType}>返回帐号密码登录</button>
                                    </div>)
                            }
                        </div>
                        {
                            this.state.loginType === 'account' ?
                                (
                                    <div className="login-card-tip" onClick={this.changeLoginType}>
                                        <img src={usercardIcon} alt="" />
                                        <span>支持直接刷员工卡登录</span>
                                    </div>
                                ) : null
                        }

                    </div>

                </div>

            </div>
        )
    }
}
export default withKeyBoard(withKeypad(Login));