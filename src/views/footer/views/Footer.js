import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import '../styles/footer.less'

const offlineIcon = require('@/common/image/onlineicon.png');
const onlineIcon = require('@/common/image/onlineicon.png');

class Footer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            mkt: this.props.initialState.mkt,
            syjh: this.props.initialState.syjh,
            onlineImg: this.props.isOnline ? onlineIcon : offlineIcon,
            curTime: moment().format('YYYY-MM-DD HH:mm:ss'),
            loginData: this.props.loginData,
            guadan: 0,
            isExercise: false
        }
        this.timer = null;
    }
    componentWillReceiveProps(nextProp) {

    }
    componentDidMount() {
        this.timer = setInterval(() => {
            this.setState({ curTime: moment().format('YYYY-MM-DD HH:mm:ss') })
        }, 1000)

    }
    componentWillUnmount() {
        clearInterval(this.timer);
    }

    render() {
        return (
            <div className={`pos-footer ${this.state.isExercise ? 'pos-footer_exercise' : ''}`}>
                <div className="pos-footer-left">
                    {
                        this.state.isExercise ?
                            <div className="pos_exercise">
                                <span></span> 培训模式
                            </div> : null
                    }
                    <div className="pos-footer-mkt">
                        店号: &nbsp;&nbsp;{this.props.initialState.mkt}
                    </div>
                    {
                        this.props.loginData && this.props.loginData.operuser ?
                            (
                                <div className="pos-footer-operuser">
                                    收款员：&nbsp;&nbsp;{this.props.loginData.operuser.gh}
                                </div>)
                            : null

                    }
                    <div className="pos-footer-syjh">
                        收银台：&nbsp;&nbsp;{this.props.initialState.syjh}
                    </div>
                    {
                        this.state.guadan > 0 ?
                            (
                                <div className="pos-footer-guadan">
                                    当前挂单数：{this.state.guadan}
                                </div>) : null
                    }

                </div>
                <div className="pos-footer-right">
                    <div className="pos-footer-online">
                        {
                            this.state.isOnline ?
                                <img src={onlineIcon} alt="" />
                                :
                                <img src={offlineIcon} alt="" />
                        }
                        <span>{this.state.isOnline ? '已连接' : '断网'}</span>
                    </div>
                    <div className="pos-footer-time">
                        {this.state.curTime}
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    console.log('footer', state);
    return {
        initialState: state.initialize,
        isOnline: state.home.isOnline,
        loginData: state.login
    };
}

const mapDispatchToProps = (dispatch) => {
    return {
    }
};
export default connect(mapStateToProps, mapDispatchToProps)(Footer);