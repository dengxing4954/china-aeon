import React, {Component} from 'react';
import FinalPayment from './finalpayment';
import message from '@/common/components/message';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import actions from "../Actions";
import moment from 'moment';
import '../style/finalpayment.less';


//状态组件
class FinalPaymentService extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pagination: {   //分页参数
                pageSize: 6,
                current: 1,
                size: 'large'
            },
            flow_no: "",//djlb Y6
            goodsList: [],
            submitParams: {},//单据提交构造参数
            switchEng: false,
            sjtotal: '',
            confirmStatus: 0,
            cause: null,
            type: !!this.props.state.receiptType ? this.props.state.receiptType : 'Y', //是否有小票
        };
    }

    componentWillMount() {
    }

    componentDidMount() {
        let {flow_no, goodsList, zdsjtotal, receiptType, cause} = this.props.state;
        if (flow_no) {
            this.setState({flow_no, goodsList, sjtotal: zdsjtotal, type: receiptType, cause});
        } else {
            if(this.props.location && this.props.location.pathname !== '/cancelFinalpayment') {
                this.createSale().then(response => {
                    if (response) {
                        this.setState({flow_no: response.flow_no});
                    }
                })
            }
        }
    }    

    tabs = (key) => {
        let controlFlagIndex = [-1, -1];
        this.setState({goodsList: []})
        if (key == '0') {
            //有小票
            this.setState({
                type: 'Y'
            })
        } else {
            //无小票
            this.setState({
                type: 'N'
            })
        }
    }

    render() {
        let props = {
            flowNo: this.state.flow_no,
            operator: this.props.operuser,
            pagination: this.state.pagination,
            select: this.select,
            onCancel: this.onCancel,
            onPageChange: this.onPageChange,
            goodsList: this.state.goodsList,
            sjtotal: this.state.sjtotal,
            submit: this.submit,
            switchEng: this.state.switchEng,
            onSwitchEng: this.onSwitchEng,
            fphm: this.props.initialState.fphm,
            type: this.state.type ,
            tabs: this.tabs,
            cause: this.state.cause,
            confirmStatus: this.state.confirmStatus,
            threason: this.props.initialState.data.threason || [],
            cancelFlag: this.props.location && this.props.location.pathname === '/cancelFinalpayment'
        };
        return (
            <FinalPayment {...props}></FinalPayment>
        );
    }

    createSale = (cause = null) => {
        let params = {
            operators: this.props.operuser && this.props.operuser.gh,
            mkt: this.props.initialState.mkt,
            mktid: this.props.initialState.mkt,
            syjh: this.props.initialState.syjh,
            vjzrq: moment().format('YYYY-MM-DD HH:mm:ss'),
            djlb: 'Y6',
            fphm: this.props.initialState.xph,
            yys: 'javapos',
            flag: '0',
            mktname: this.props.initialState.data.mktinfo && this.props.initialState.data.mktinfo.mktname,
            ent_id: this.props.initialState.entid,
            jygz: this.props.initialState.jygs,
            gz: '1',
            yyyh: this.props.operuser && this.props.operuser.gh,
            language: 'CHN',
            sswrfs: this.props.initialState.data.syjmain[0] && this.props.initialState.data.syjmain[0].sswrfs || '0',
        }
        if(this.props.location && this.props.location.pathname === '/cancelFinalpayment'){
            //取消尾单
            params.reasonId = cause;
            params.djlb = '4';
            params.sqkh = this.props.initialState.sqkh || this.props.operators.gh;
        };
        return this.props.actions.createSale(params).then(res => {
            if (res) {
                console.log('获取交易流水号', res);
                this.setState({
                    flow_no: res.flow_no,
                })
                return res;
            }
        })
    }

    select = (data) => {
        if(this.props.location && this.props.location.pathname === '/cancelFinalpayment') {
            this.createSale(data.retCause).then(response => {
                if (response) {
                    this.setState({flow_no: response.flow_no, cause: data.retCause}, () => {
                        this.dueQuery(data, response.flow_no);
                    });
                }
            })
        }else{
            this.dueQuery(data, this.state.flow_no);
        }
    }

    dueQuery = (data, flow_no) => {
        let req = {
            operators: this.props.operators,
            jygz: this.props.initialState.jygs,
            type: this.state.type,
            ...data, flow_no, //..."mkt", "syjh", "fphm"
        };
        let cancelReq = {
            operators: this.props.operators,
            mkt:this.props.initialState.mkt,
            syjh:this.props.initialState.syjh,
            jygz: this.props.initialState.jygs,
            jygs: this.props.initialState.jygs,
            terminalSno: data && data.fphm,
            flow_no, //..."mkt", "syjh", "fphm"
        };
        if(this.props.location && this.props.location.pathname === '/cancelFinalpayment') {
            this.props.actions.cancelDueQuery(cancelReq).then(res => {
                if (res) {
                    let goodsList = res.goodlist, uidlist = '';
                    for (let i = 0, len = goodsList.length; i < len; i++) {
                        uidlist = !uidlist ? goodsList[i].guid : uidlist + ',' + goodsList[i].guid;
                    }
                    res.djlb = '4';
                    res.uidlist = uidlist;
                    res.fphm = this.props.initialState.fphm;
                    res.language = this.state.switchEng ? 'en' : 'zh';
                    res.addGoodsTime = moment().format('DD/MM/YYYY HH:mm:ss');
                    this.setState({
                        goodsList: goodsList,
                        submitParams: Object.assign(res, {receiptType: this.state.type,goodsList: res.goodlist, zdsjtotal: res.remainje, cause: this.state.cause}),
                        sjtotal: res.remainje
                    });
                }
            })
        }else{
            this.props.actions.dueQuery(req).then(res => {
                if (res) {
                    let goodsList = res.goodsList, uidlist = '';
                    for (let i = 0, len = goodsList.length; i < len; i++) {
                        uidlist = !uidlist ? goodsList[i].guid : uidlist + ',' + goodsList[i].guid;
                    }
                    res.djlb = 'Y6';
                    res.uidlist = uidlist;
                    res.fphm = this.props.initialState.fphm;
                    res.language = this.state.switchEng ? 'en' : 'zh';
                    res.addGoodsTime = moment().format('DD/MM/YYYY HH:mm:ss');
                    this.setState({
                        goodsList: goodsList,
                        submitParams: Object.assign(res, {receiptType: this.state.type}),
                        sjtotal: res.sjtotal
                    });
                }
            })
        }
    }

    onPageChange = (e) => {
        this.setState({
            pagination: e
        })
    }

    pick = (index) => {
        let pickArr = [...this.state.pickArr];
        pickArr[index] = !pickArr[index];
        let pickflag = false;
        pickArr.forEach(ele => {
            if (ele === true) {
                pickflag = true;
            }
        });
        this.setState({pickflag, pickArr});
    }

    onCancel = () => {
        this.props.actions.init();
        this.props.history.push("/home");
    }

    submit = () => {
        if (this.props.initialState.online === 0) {
            message("脫機狀態不支持此功能");
            return;
        }
        if(JSON.stringify(this.state.submitParams) == '{}'){
            this.props.actions.submit(this.props.state).then(res => {
                this.goInvoice();
            }) 
        }else{
            this.props.actions.submit(this.state.submitParams).then(res => {
                this.goInvoice();
            })  
        }

    }

    goInvoice = () => {
        this.handleEjoural();
        let _target = {
            pathname: '/invoice',
            query: {
                djlb: this.props.location && this.props.location.pathname === '/cancelFinalpayment' ? '4' : 'Y6'
            },
            state: {
                type: "finalpayment",
                // flag: this.props.location && this.props.location.pathname === '/cancelFinalpayment' ? 'Y' : 'N'
            },
        }
        this.props.history.push(_target);
    }

    handleEjoural = () => {
        let ejouralTxt = `SHOP ${this.props.initialState.mkt}/${this.props.initialState.syjh}  REF ${this.props.initialState.syjh + this.props.initialState.fphm}  ${moment().format('DD/MM/YY')}\r\nOPERATOR ${this.props.operators}  ${moment().format('HH:mm:ss')}\r\n ***  ACCOUNT PAYMENT RECEIPT  ***`;
        window.Log(ejouralTxt, '1');
    }

    onSwitchEng = () => {
        this.setState({
            switchEng: !this.state.switchEng
        })
    }
}

const mapStateToProps = (state) => {
    return {
        operuser: state.login.operuser,
        state: state.finalpayment,
        initialState: state.initialize,
        operators: state.login.operuser && state.login.operuser.cardno
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        actions: bindActionCreators(actions, dispatch),
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(FinalPaymentService);