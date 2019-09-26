/**
 * Created by Administrator on 2018/5/24.
 */
import React, {Component} from 'react';
import {
    Modal,
    Button,
    Row,
    Col,
    DatePicker,
    Pagination,
    Radio,
    Input,
    Spin
} from 'antd';
import {Fetch} from '@/fetch/';
import message from '@/common/components/message';
import withKeypad from '@/common/components/keypad/';
import intl from 'react-intl-universal';
import moment from 'moment';

const {RangePicker} = DatePicker;
const dateFormat = 'YYYY/MM/DD';
const RadioGroup = Radio.Group;

//商品明细
class printAgain extends Component {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.state = {
            title: '',

            // fphm: '',//小票编码
            //MANHATON 450639
            billList: [],
            pagination: {
                total: 0,
                pageSize: 6,
                current: 1,
            },


            selectKey: -1,
            startdate: moment().format('YYYY-MM-DD') + ' 00:00:00',
            enddate: moment().format('YYYY-MM-DD') + ' 23:59:59',
            codeACS: '',
            details: {},
            selectionData: {},
            isPrint: false,
            confirmPrit: false,
            hasDuplFlag: false, //副单标记

            //当前单据信息
            orderType: '',//退货 4 消单 2 尾款 depositSale
            tailTotal: 0,

            //重印选择
            selectVis: false,
            checkedValue: this.props.version === "Canteen" ? 0 : 1,
            //returnPrint 退货 deliveryprint 行送 singleprint 副单 cjprint 除旧 tailprint 尾款 pressPrint 按金
            //logisticsMode = 3，5 是DC送或者行送
            options: [
                {   //
                    label: '全部',
                    index: 0,
                    params: {
                        thermal: '1',
                        method: 'salePrint'
                    }
                },//平推 热敏一起主要应用  行送，ACS,消单，退货，除旧,按金
                {
                    label: '单据',
                    index: 1,
                    params: {method: 'salePrint'}
                },//热敏
                {
                    label: '留条',
                    index: 2,
                    params: {thermal: '1', method: ''}
                },//平推 行送，ACS,消单，退货，除旧
                // {
                //     label: '副單',//314245 399741
                //     index: 3,
                //     params: {method: 'accessoryPrint'}
                // },
                {
                    label: '英文单',
                    index: 4,
                    params: {english: true, method: 'salePrint'}
                },
                // {
                //     label: '黃色小票',
                //     index: 5,
                //     params: {method: 'yellowPrint'}
                // },
                // {
                //     label: 'AEON分期',//10132
                //     index: 6,
                //     params: {method: 'aCSFQPrint,aCSMEMOPrint,salePrint'}
                // },//AEON分期 ACSMEMOPrint
                // {
                //     label: '除舊計劃',
                //     index: 7,
                //     params: {method: 'equipmentPrint,salePrint'}
                // },//四电一脑 CJPrint
            ]//所有平推加了银行标志；尾款；bankTotal, notBankTotal,
        };
    }

    componentDidMount() {
        let {options} = this.state; //默认卖场数据
        let {paymode, version} = this.props, codeACS, title;
        if (this.props.modalType) {
            title = intl.get("DEP_ORDER");
        } else if (this.props.tail) {
            title = '尾款單';
        } else {
            title = intl.get("REPRINT_TITLE");
        }
        for (let i = 0, len = paymode.length; i < len; i++) {
            if (paymode[i].paysimplecode === 'ACS') {
                codeACS = paymode[i].code;
                break;
            }
        }

        if (this.props.version === "Sales") { //默认卖场版本不要修改

        } else if (this.props.version === "Canteen") {
            options.splice(0, 1);
            options = options.slice(0, 6);
            /*因为柜位和后厨模板一样*/
            options.push({
                label: '快餐-尾單',
                index: 8,
                params: {method: 'backPrint'}
            });
            options.push({
                label: '快餐-全部',
                index: 10,
                params: {method: 'backPrint'}
            });
        }

        this.setState({
            title,
            codeACS,
            options,
            hasDuplFlag: this.props.modalType || false
        });
    }


    /**
     *  获取订单列表
     * @param page_no
     * @param page_size
     */
    getOrder = (page_no = 1, page_size = 6) => {
        let info = this.refs.info.value;
        let {startdate, enddate, hasDuplFlag} = this.state;
        if (!info) {
            let command_id = this.props.tail ? 'getTailList' : 'getOrderList';
            this.props.callback(command_id, {
                page_no,
                page_size,
                startdate,
                enddate,
                hasDuplFlag: hasDuplFlag || undefined,
                title: this.state.title,
            }).then(res => {
                console.log("getOrderList```  ", res)
                if (res && res.returncode === "0") {
                    let pagination = this.state.pagination;
                    pagination.total = res.totalResults;
                    this.setState({
                        billList: res.orders,
                        selectKey: -1,
                        pagination,
                        selectionData: {},
                    });
                }
            })
        } else {
            let params = {
                mkt: info.slice(0, 3),
                syjh: info.slice(3, 6),
                fphm: info.slice(6)
            };
            this.refs.info.blur();//查询成功移除焦点
            this.getOrderInfo(params);
        }
    }

    //查询上一笔
    printLast = () => {
        this.getOrderInfo().then(() => {
            if (this.state.selectionData.returncode === '0') {
                this.printOrder();
            }
        });
    }

    onSelect = (item, key) => {
        let {selectKey} = this.state;
        if (key !== selectKey) {
            let params = {
                mkt: item.shopCode,
                fphm: item.terminalSno,
                syjh: item.terminalNo,
                flow_no: item.billno,
            };
            this.getOrderInfo(params, key);
        }
    }

    //0707支付方式合并
    combineIntegral = (salepayments) => {
        let indexArr = [], integralPay;
        salepayments.forEach((payment, index) => {
            if (payment.paycode === '0707') {
                indexArr.push(index);
                if (integralPay) {
                    integralPay.je += payment.je;
                    integralPay.total += payment.total;
                    integralPay.ybje += payment.ybje;
                } else {
                    integralPay = {...payment};
                }
            }
        });
        if (indexArr.length > 1) {
            for (let i = indexArr.length - 1; i >= 0; i--) {
                salepayments.splice(indexArr[i], 1);
            }
            integralPay.hl = (integralPay.total / integralPay.ybje).toFixed(4);//汇率可能不一样所以不共用
            salepayments.push(integralPay);
        }
        return salepayments;
    }

    getOrderInfo = (params, key) => {
        let command_id = this.props.tail ? 'getTailInfo' : 'getOrderInfo';
        return this.props.callback(command_id, params).then(res => {
            console.log("getOrderInfo~~: ", this.state, this.props, res)
            if (res && res.returncode === "0") {
                let auxiliary = false, newData, salepayments;
                if (this.props.modalType) {
                    auxiliary = this.isAuxiliary(res);
                    if (!auxiliary) { //没有副单商品不进行数据填充
                        return;
                    }
                }
                salepayments = res.data.order.salePayments.filter(item => !item.payName.includes('扣回'));
                salepayments = this.combineIntegral(salepayments);
                salepayments.forEach(item => {
                    if (!item.octopusCardno && item.octopusLastAddValType) {
                        item.misMerchantId = item.octopusLastAddValType;
                    }
                    if (item.flag === '2') {
                        return;
                    }
                    let mode = this.props.paymode.find((mode) => mode.code === item.payCode);
                    if (mode.virtualPayType === 3 || item.payCode === "0903") {
                        return;
                    }
                    item.payName = mode && (Number(mode.paysimplecode) ? item.payName : mode.paysimplecode);
                });
                res.data.order.salePayments = salepayments;
                let tailTotal = res.data.order.salePayments.reduce((preValue, curValue) => preValue + curValue.total, 0);
                res = res.data.order;
                if (typeof key !== 'undefined') {
                    this.setState({
                        tailTotal,
                        selectionData: res,
                        selectKey: key,
                    });
                } else {
                    this.setState({
                        tailTotal,
                        selectionData: res,
                        selectKey: 0,
                        billList: [res],

                        pagination: {
                            total: 0,
                            pageSize: 6,
                            current: 1,
                        }
                    });
                }
            } else {
                this.setState({
                    billList: [],
                    pagination: {
                        total: 0,
                        pageSize: 6,
                        current: 1,
                    },
                    selectKey: -1,
                    startdate: '',
                    enddate: '',
                    details: {},
                    selectionData: {},
                    tailTotal: 0,
                })
            }
        });
    }

    //判断副单窗口是否含有副单商品
    isAuxiliary = (response) => {
        let auxiliary = false;
        for (let i = 0, len = response.goodslist.length; i < len; i++) {
            if (response.goodslist[i].prtDuplFlag) {
                auxiliary = true;
                break;
            }
        }
        auxiliary || message('該單據中無副單商品！');
        return auxiliary;
    }

    //时间选择改变
    onChange(dates, dateStrings) {
        this.setState({
            startdate: dateStrings[0] + ' 00:00:00',
            enddate: dateStrings[1] + ' 23:59:59',
        })
    }

    changeRadio = (e) => {
        this.setState({
            checkedValue: e.target.value,
        });
    }

    printOrder = () => {
        let {selectKey, selectionData} = this.state;
        if (selectKey > -1) {
            if (this.props.modalType) { //判断入口是重印还是副单
                console.log("副单");
                if (this.props.version === "Sales") {
                    this.checkSalesPrint({params: {method: 'accessoryPrint'}});
                } else if (this.props.version === "Canteen") {
                    this.checkCanteenPrint({params: {method: 'accessoryPrint'}});
                }
            } else if (this.props.tail) {//尾款单调用入口
                let method = this.structSalesOrder(selectionData);
                let tailAction = () => this.checkSalesPrint({params: {method: `tailPrint,${method && method + ','}salePrint`}});
                this.props.callback('authorize', {}, tailAction);//尾单授权判断
            } else {
                console.log('重印');
                this.props.callback('authorize', {}, this.handle);//重印授权判断
            }
        } else {
            message(intl.get("INFO_REPRINT"));
        }
    }

    changePage = (page, pageSize) => {
        let start = (page - 1) * pageSize;
        let end = page * pageSize;
        let pagination = this.state.pagination;
        pagination.current = page;
        this.setState({selectKey: -1, tailTotal: 0, pagination}, () => {
            this.getOrder(page, pageSize);
        });
    }

    onChangeInpt = (value) => {
        this.refs.info.value = value.info;
        this.setState(value);
    }

    handleOk = () => {
        let {options, checkedValue} = this.state;
        let redioInfo = options[checkedValue];
        if (this.props.version === "Sales") {
            this.checkSalesPrint(redioInfo);
        } else if (this.props.version === "Canteen") {
            this.checkCanteenPrint(redioInfo);
        }
    }

    handle = () => {
        this.setState({selectVis: !this.state.selectVis});
    }

    afterClose = () => {
        this.setState({
            selectVis: false,
            checkedValue: 1,
            isPrint: false,
            confirmPrit: false,
        });
    }

    onInputKeyDown = (e, closeKeyboard) => {
        if (e.keyCode === 13) {
            closeKeyboard();
            this.getOrder();
        }
    }

    shield = (item) => {
        let temp = item.payNo;
        let payNo = '';
        if (item.payType === "3" && temp) {
            payNo = Array(temp.length - 4).join("*") + temp.slice(-4);
        }
        return payNo;
    }

    confirmPrit = (state) => {
        this.setState(state);
    }

    render() {
        const {visible, onCancel, ddlx, modalType, tail} = this.props;
        let start, end, goodsList, salepayments;
        let {selectKey, selectionData, billList, pagination, title, selectVis, checkedValue, options, isPrint, startdate, enddate, tailTotal, confirmPrit} = this.state;
        // let orderSelected = selectionData.data.order;
        goodsList = selectionData.goodsList;
        salepayments = selectionData.salePayments;
        let {total, pageSize, current} = pagination;
        start = (current - 1) * pageSize;
        end = current * pageSize;
        return (
            <React.Fragment>
                <Modal className="print_again"
                       width={880}
                       style={{top: 40}}
                       title={
                           <div>
                               <span>{title}</span>
                           </div>
                       }
                       visible={visible}
                       footer={
                           <div>
                               <Col span={13} className="pagination">
                                   <Pagination current={current}
                                               hideOnSinglePage={true}
                                               onChange={this.changePage}
                                               defaultPageSize={pageSize}
                                               total={total}/>,
                               </Col>
                               <Col span={11}>
                                   <Button className="cancel_button"
                                           onClick={onCancel}>{intl.get("CLOSE_WINDOW")}</Button>
                                   {
                                       !(modalType || tail) &&
                                       <Button type="primary"
                                               onClick={this.printLast}>{`重印上壹筆`}</Button>
                                   }
                                   <Button type="primary"
                                           onClick={this.printOrder}>{(modalType || tail) ? '打印' : title}</Button>
                               </Col>
                           </div>
                       }
                       destroyOnClose={true}
                >
                    <Modal
                        className="print_again"
                        title="请选择单据类型"
                        visible={selectVis}
                        cancelText={intl.get("CLOSE_WINDOW")}
                        okText={title}
                        onOk={this.handleOk}
                        onCancel={this.handle}
                        afterClose={this.afterClose}>
                        <div className={'radio_group'}>
                            <RadioGroup onChange={this.changeRadio}
                                        value={this.state.checkedValue}
                                        size={'large'}>
                                {
                                    options.map((item, index) => <Radio
                                        value={index}
                                        key={index}>{item.label}</Radio>)
                                }
                            </RadioGroup>
                        </div>
                    </Modal>
                    <Row className="scan_bill">
                        <div>
                            <span>{intl.get("REPRINT_DATE")}：</span>
                            <RangePicker
                                className="date_picker"
                                popupStyle={{width: 600}}
                                onChange={this.onChange}
                                defaultValue={[moment(startdate, dateFormat), moment(enddate, dateFormat)]}
                                ranges={{
                                    Today: [moment(), moment()]
                                }}
                            />
                        </div>
                        <div style={{marginLeft: 10}}>
                            <span>單據號： </span>
                            <input name="info"
                                   className="inp"
                                   ref={'info'}
                                   onBlur={this.props.blur}
                                   autoFocus={true}
                                   onFocus={(event) => {
                                       this.props.focus(event, this.onChangeInpt, 'left');
                                   }}
                                   onKeyDown={(e) => {
                                       this.onInputKeyDown(e, this.props.keyPadClose);
                                   }}/>
                        </div>
                        <Button type="primary"
                                onClick={() => this.getOrder()}> 查询</Button>
                    </Row>
                    <div className="content">
                        <div className="content_left">
                            <Row className="table_head">
                                <Col
                                    span={2}>{intl.get("TAKEOUT_SERIAL_NUMBER")}</Col>
                                <Col
                                    span={9}>{intl.get("TRANS_HOUR")}/{intl.get("TAKEOUT_FLOW_NO")}</Col>
                                <Col
                                    span={8}>單據類型/總金額</Col>
                                <Col span={5}>{intl.get("REPRINT_SYYH")}</Col>
                            </Row>
                            <div className="table_conent">
                                {billList.map((item, index) =>
                                    <Row key={index}
                                         className={selectKey === index ? 'selected' : ''}
                                         onClick={() => this.onSelect(item, index)}>
                                        <Col
                                            span={2}>&nbsp;&nbsp;&nbsp;&nbsp;{index + 1}</Col>
                                        <Col
                                            span={9}>{item.orderdatetime || item.saleDate}<br/>{item.terminalSno}
                                        </Col>
                                        <Col
                                            span={8}>{tail ? '尾款單據' : ddlx.find(dj => dj.code === item.orderType).cnName}
                                            <br/>{new Number(item.oughtPay).toFixed(2)}
                                        </Col>
                                        <Col
                                            span={5}>{item.terminalNo || item.terminalOperator}</Col>
                                    </Row>
                                )}
                            </div>
                        </div>
                        <div className="content_right">
                            <div className="content_top">
                                <Row className="table_head">
                                    <Col span={8}>{intl.get("GOODS_ITEM")}</Col>
                                    <Col span={2}>{intl.get("GOODS_NUM")}</Col>
                                    <Col
                                        span={4}>{intl.get("GOODS_PRICE")}</Col>
                                    <Col
                                        span={5}>{intl.get("GOODS_FAVORABLE")}</Col>
                                    <Col
                                        span={5}>{intl.get("GOODS_TOTALPRICE")}</Col>
                                </Row>
                                <div className="table_conent">
                                    {
                                        (selectKey > -1 && tail) &&
                                        <Row>
                                            <Col span={8}>{`尾款支付特定商品`}</Col>
                                            <Col span={2}>{`1`}</Col>
                                            <Col
                                                span={4}>{tailTotal}</Col>
                                            <Col
                                                span={5}>{`0.00`}</Col>
                                            <Col
                                                span={5}>{tailTotal}</Col>
                                        </Row>
                                    }
                                    {(goodsList || []).map((item, index) =>
                                        <Row key={index}>
                                            <Col span={8}>{item.goodsName}</Col>
                                            <Col span={2}>{item.qty}</Col>
                                            <Col
                                                span={4}>{item.salePrice.toFixed(2)}</Col>
                                            <Col
                                                span={5}>{item.customDiscountValue.toFixed(2)}</Col>
                                            <Col
                                                span={5}>{item.saleAmount.toFixed(2)}</Col>
                                        </Row>
                                    )}
                                </div>
                            </div>
                            <div className="content_bottom">
                                <Row className="table_head">
                                    <Col
                                        span={8}>{intl.get("REPRINT_PAYNAME")}</Col>
                                    {/*<Col*/}
                                    {/*span={5}>{intl.get("REPRINT_PAYTYPE")}</Col>*/}
                                    {/*<Col span={4}>{intl.get("REPRINT_HL")}</Col>*/}
                                    <Col span={10}>{'支付賬號'}</Col>
                                    <Col
                                        span={6}>{intl.get("EXTRA_PAYMENT")}</Col>
                                </Row>
                                <div className="table_conent">
                                    {(salepayments || []).map((item, index) =>
                                        <Row key={index}>
                                            <Col span={8}>{item.payName}</Col>
                                            {/*<Col*/}
                                            {/*span={5}>{this.getPaytypeName(item.paycode)}</Col>*/}
                                            {/*<Col span={4}>{item.hl}</Col>*/}
                                            <Col
                                                span={10}>{this.shield(item)}</Col>
                                            <Col span={6}>{item.money}</Col>
                                        </Row>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
                {
                    isPrint && !confirmPrit ?
                        <div className="loading_mask" onClick={(e) => {
                            e.stopPropagation()
                        }}>
                            <Spin size="large" tip="打印中..."/>
                        </div> : null
                }
            </React.Fragment>
        );
    }

    /****美食广场代码****/

    generateStallInfo = (extra, goods) => {//
        let stallArr = [], stallInfo = [], newGoods = [], noExist = [],
            idnum = 1;
        goods.forEach(item => item.stallCode ? stallArr.push(item.stallCode) : noExist.push(item)); //code数据目前有问题,所以这样写
        stallArr = new Set(stallArr); //去除重复code
        stallArr = Array.from(stallArr);
        for (let i = 0, len = stallArr.length; i < len; i++) {
            let code = stallArr[i], info = {}, goodsList, stall;
            stall = this.props.stall.find(item => item.stallCode === code);
            info.stallName = stall ? stall.stallName : '';
            info.goods = [];
            info.mealsNum = goods.find(item => item.stallCode === code).backPrintNo || '';

            goodsList = goods.filter(item => item.stallCode === code);//找到对应的档口下的商品信息
            goodsList.forEach(item => {
                info.goods.push({
                    name: item.fname,
                    qty: item.qty,
                    detail: item.categoryPropertys,
                    eatWay: item.eatWay,
                });
                newGoods.push(item);//根据档口信息对商品行重新排序
            });
            stallInfo.push(info);
        }
        newGoods = [...newGoods, ...noExist]; //后续需要调整
        newGoods.forEach((item, index) => item.idnum = index + 1);
        return {stallInfo, newGoods};
    }

    structCanteenOrder = (info) => {
        let sequence;
        if (info.djlb === '2' || info.djlb === '4') { //消单 //退货 消单 只打一个平推不需要判断其他条件
            sequence = 'returnPrint';
            return sequence;
        }
        return sequence;
    }

    checkCanteenPrint = (extra) => {
        let sequence, redirectMethod;
        let method = extra.params.method;
        let {selectionData} = this.state;
        switch (extra.index) {//拼接方法需要先调平推后热敏
            case 0:
            case 10:
                sequence = this.structCanteenOrder(selectionData);
                if (selectionData.djlb === '2') {//該單據無法進行熱敏
                    method = sequence;
                } else {
                    method = sequence ? sequence + ',' + method : method;
                }
                if (extra.index === 10) {
                    if (selectionData.djlb === '2') {
                        extra.params.method = 'backPrint,' + method;
                    } else {
                        extra.params.method = 'salePrint,' + method;
                    }
                } else {
                    extra.params.method = method;
                }
                this.setState({isPrint: true});
                this.orderCanteenStamp(extra, 'batchPrinting');
                break;
            case 2:
                extra.params.method = this.structCanteenOrder(selectionData);
                if (!extra.params.method) {
                    extra.params.method = 'slipPrint';
                }
                this.setState({isPrint: true});
                redirectMethod = extra.params.method.includes(',') ? 'batchPrinting' : 'forwardPrint';
                this.orderCanteenStamp(extra, redirectMethod);
                break;
            default:
                if (extra.index === 1 && selectionData.djlb === '2') {
                    message("消單無法打印單據，請打印留條！");
                    return;
                }
                if (extra.index === 5) {
                    let moments = moment(selectionData.saleDate);
                    let sameDay = moment().date() === moments.date();//判断是否当前的销售单
                    if (!(sameDay && (moments.date() == parseInt(this.props.syspara.dateHSXP)))) {
                        message("無黃色小票，無法重印!");
                        return;
                    }
                }
                this.orderCanteenStamp(extra, 'forwardPrint');
                break;
        }
    }

    orderCanteenStamp = (extra, method) => {
        try {
            let bankTotal = 0, notBankTotal = 0, hjzsl = 0, cashPay = 0,
                DirectMoney = 0,
                pointsInfo = {}, ArtcodeMoneyTotal = 0, ArtcodeMoney = [],
                subTotal, hykh, hykDeduct, hykDeductTotal, redemption, tradeno,
                ordered, shopInfo, moments, sameDay, otpZl;
            let {selectKey, billList} = this.state;
            let selectData = this.state.selectionData;
            let data = billList[selectKey];
            let mktinfo = this.props.mktinfo;

            moments = moment(selectData.saleDate);//几号销售的
            sameDay = moment().date() === moments.date();

            selectData.goodslist = selectData.goodslist.filter(item => item.goodsType !== "99" && item.goodsType !== "98");
            selectData.goodslist.forEach((item, index) => { //商品排序 添加索引 合并商品属性
                hjzsl += item.qty;

                let categoryPropertys = [], spliceData = '';
                item.categoryPropertys.forEach(data => { //合并商品属性
                    if (!data.isGoods && !categoryPropertys.length && !spliceData) { //判断是否是主商品属性
                        item.fname = item.fname + '|' + data.propertyName;
                    } else {
                        if (data.isGoods) {//判断是否是属性
                            if (spliceData) {
                                categoryPropertys.push(spliceData);
                                spliceData = '';
                            }
                            spliceData = data;
                        } else {
                            spliceData.propertyName = spliceData.propertyName + '|' + data.propertyName;
                        }
                    }
                });
                spliceData && categoryPropertys.push(spliceData); //上一行方法漏洞修复
                item.categoryPropertys = categoryPropertys;

                if (sameDay) {//满足黄色小票条件
                    if (item.license == 0) {
                        DirectMoney += parseFloat(item.ysje)
                    } else if (item.license == 1) {
                        let obj = {};
                        let hasArtcode = false
                        obj.artcode = item.category;
                        obj.total = item.ysje;
                        ArtcodeMoney.map((item, index) => {
                            if (item.artcode === obj.artcode) {
                                hasArtcode = true;
                                ArtcodeMoney[index].total = parseFloat(obj.total) + parseFloat(ArtcodeMoney[index].total)
                            }
                        })
                        if (!hasArtcode) {
                            ArtcodeMoney.push(obj);
                        }
                        ArtcodeMoneyTotal += parseFloat(item.ysje)
                    }
                }
            });
            shopInfo = this.generateStallInfo(extra, selectData.goodslist);
            selectData.goodslist = shopInfo.newGoods;

            let jfCode = this.props.syspara.payObj.find(item => item.split(',')[0] === 'payJFXF');//积分系统code
            if (jfCode) { //判断当前收银机是否支持积分付款
                pointsInfo = selectData.salepayments.find(item => item.paycode === jfCode.split(',')[1]) || {}; //积分付款信息
            }
            //积分消费
            if (!pointsInfo.ybje && selectData.popInfo) {
                redemption = selectData.popInfo.find(item => item.pop_describe.includes("积分换购"));
            }
            selectData.salepayments.forEach(item => {
                let mode = this.props.paymode.find((mode) => mode.code === item.paycode);

                if (item.flag !== "2" && item.flag != "3") {
                    if (mode.virtualPayType === 0) {
                        notBankTotal += item.total;
                        cashPay += item.total - item.overage; //计算现金类金额
                    } else {
                        bankTotal += item.total;
                        item.payno = item.printPayNo;//18.12.26后期需要删除 已废弃
                    }
                }

                if (item.paycode === '0707') {
                    hykDeduct = item.ybje;
                    hykDeductTotal = item.total;
                }

                item.virtualPayType = mode.virtualPayType;

                if ((item.paycode === '0301' || item.paycode === '0309') && item.trace === "0") {
                    item.trace = '';
                    item.misMerchantId = 'M';//银行卡类型
                }
                if (item.paycode === '0310' || (item.trace && (item.paycode === '0301' || item.paycode === '0309'))) {
                    item.trace = ("000000" + item.trace).substr(-6);
                }
                if (item.paycode === '0308') {
                    if (item.trace === "0") {
                        item.payno = item.payno.slice(0, 6) + "******" + item.payno.slice(12, item.payno.length);
                        item.trace = ("000000" + item.refCode).substr(-6);
                    } else {
                        item.trace = ("000000" + item.trace).substr(-6);
                    }
                }
                if (item.paycode === '0309') {
                    item.payno = item.payno.slice(0, 6) + "******" + item.payno.slice(12, item.payno.length);
                }
                if (item.printPayNo) {
                    item.payno = item.printPayNo;
                }
            });

            //合并现金支付行数据
            if (cashPay) {
                selectData.salepayments = selectData.salepayments.filter(item => item.virtualPayType !== 0);
                selectData.salepayments.push({payname: 'CASH', ybje: cashPay});
            }

            if (selectData.popInfo && selectData.popInfo.length > 0) {
                subTotal = selectData.zdyftotal;
            }

            if (selectData.consumersCard) {
                hykh = selectData.consumersCard;
            }

            //打印要求这样做
            if (selectData.memberInfo) {
                let timeFormat = (time) => moment(time).format('DD/MM/YYYY');
                let {bonusPointExpireDate, bonusPointLastUpdateDate, membershipExpireDate, membershipUntilDate, lastUpdateTime} = selectData.memberInfo;
                if (bonusPointExpireDate) {
                    bonusPointExpireDate = timeFormat(bonusPointExpireDate);
                    selectData.memberInfo.bonusPointExpireDate = bonusPointExpireDate === "Invalid date" ? bonusPointExpireDate.substring(6, 8) + '/' + bonusPointExpireDate.substring(4, 6) + '/' + bonusPointExpireDate.substring(0, 4) : bonusPointExpireDate;
                }
                if (bonusPointLastUpdateDate) {
                    bonusPointLastUpdateDate = timeFormat(bonusPointLastUpdateDate);
                    selectData.memberInfo.bonusPointLastUpdateDate = bonusPointLastUpdateDate === "Invalid date" ? bonusPointLastUpdateDate.substring(6, 8) + '/' + bonusPointLastUpdateDate.substring(4, 6) + '/' + bonusPointLastUpdateDate.substring(0, 4) : bonusPointLastUpdateDate;
                }
                if (membershipExpireDate) {
                    membershipExpireDate = timeFormat(membershipExpireDate);
                    selectData.memberInfo.membershipExpireDate = membershipExpireDate === "Invalid date" ? membershipExpireDate.substring(6, 8) + '/' + membershipExpireDate.substring(4, 6) + '/' + membershipExpireDate.substring(0, 4) : membershipExpireDate;
                }
                if (membershipUntilDate) {
                    membershipUntilDate = timeFormat(membershipUntilDate);
                    selectData.memberInfo.membershipUntilDate = membershipUntilDate === "Invalid date" ? membershipUntilDate.substring(6, 8) + '/' + membershipUntilDate.substring(4, 6) + '/' + membershipUntilDate.substring(0, 4) : membershipUntilDate;
                }
                if (lastUpdateTime) {
                    selectData.memberInfo.lastUpdateTime = lastUpdateTime.substring(4, 6) + '月' + lastUpdateTime.substring(6, 8) + '日';
                }
            }

            //判断是否支付宝支付
            let micropayment = selectData.salepayments.find(item => item.paycode === '0903');
            if (micropayment) {
                tradeno = "BARC#" + micropayment.refCode;
                ordered = "RRNO#" + micropayment.payno;
            }

            let commonData = {
                flow_no: data.billno, //流水号
                refno: selectData.syjh + selectData.fphm.substr(selectData.fphm.length - 4),  //ref值
                syyh: selectData.syyh,//收银员
                mkt: selectData.mktcode,//门店号
                syjh: selectData.syjh,//收银机号
                fphm: selectData.fphm,//小票号
                rqsj: moment(selectData.saleDate).format('DD/MM/YYYY HH:mm:ss'),//交易时间
                djlb: selectData.djlb,//单据类别1代表销售，4代表退货
                printnum: 1,//重打次数
                printtime: 1, //打印几张
                zl: selectData.change,//找零金额
                switchEng: extra.params.english || false,//是否是英文单

                isyellowPrint: (sameDay && (moments.date() == parseInt(this.props.syspara.dateHSXP))) ? 'Y' : 'N',//是否黄色小票
                ArtcodeMoney: ArtcodeMoney, //黄色小票非直营数组
                DirectMoney: DirectMoney.toFixed(2), //黄色小票直营金额
                ArtcodeMoneyTotal: ArtcodeMoneyTotal.toFixed(2),//黄色小票非直营金额

                hykh: hykh || (selectData.memberInfo && selectData.memberInfo.memberId), //会员卡号
                hykDeduct: hykDeduct || (pointsInfo.ybje || (redemption && redemption.freight_amount)), //使用积分
                hykDeductTotal: hykDeductTotal || (pointsInfo.total || (redemption && redemption.freight_mode.split(',')[1])), //抵扣金额
                memberInfo: selectData.memberInfo,   //会员信息
                printMode: selectData.printMode, //生日标识

                staffcard: selectData.staffCardNo || selectData.creditCardNo, //员工购物
                staffcardYGGH: selectData.staffNo,  //是员工工号
                staffcardType: selectData.staffType,  //1为员工购物  2为亲属购物
                cardtype: selectData.consumersCard, //consumersCard
                consumersType: selectData.consumersType,

                mktname: mktinfo && mktinfo.mktname,//门店号名称
                address: mktinfo && mktinfo.address,  //门店地址
                enAddress: mktinfo && mktinfo.enAddress,//英文地址
                phone: mktinfo && mktinfo.telephone, //门店联系电话
                shopEnName: mktinfo && mktinfo.shopEnName,//英文店名
                shopname: this.props.syspara.shopname,//商场名称
                mdjc: mktinfo && mktinfo.shopSName, //门店简称

                refundAuthzCardNo: selectData.refundAuthzCardNo, //退货授权卡号
                terminalOperatorAuthzCardNo: selectData.terminalOperatorAuthzCardNo || '',//员工授权卡号
                totalDiscAuthzCardNo: selectData.totalDiscAuthzCardNo || '',//总折扣授权卡号

                eleStamp: selectData.eleStamp, //印花券
                sticker: selectData.sticker, //印花券
                popInfo: selectData.popInfo,//整单折扣
                outSideGiftsInfo: selectData.outSideGiftsInfo,  //场外换购信息

                bankTotal: bankTotal, //银行支付
                notBankTotal: notBankTotal, //非银行支付

                stallInfo: shopInfo.stallInfo,
                sjfk: selectData.zdsjtotal,//实际付款 zdsjtotal
                ysje: selectData.zdyftotal - selectData.zddsctotal,//应收金额 zdyftotal

                hjzsl, //合计商品数
                subTotal,//全单折扣
                iscy: 'Y', //重印字段--用于Java 记录ejoural
                barcodeString: selectData.mktcode + selectData.syjh + moment(selectData.saleDate).format('YYMMDD') + selectData.syjh +
                selectData.fphm.substr(selectData.fphm.length - 4),//门店号+收银机号+小票号
            };
            this.props.callback(method, {commonData: commonData, ...selectData, ...extra.params}, this.confirmPrit);
        } catch (e) {
            message("打印單據失敗，請聯系工作人員！");
            this.setState({isPrint: false});
            console.log('e', e);
        }
    }

    /****美食广场结束****/

    /****卖场销售代码****/


    /**
     * 合并商品行的活动及交易金额
     * @param before 商品行信息
     * @returns {Array} 返回合并数据
     */
    mergeGoods = (before) => {
        let newGoods = [], barcodeArr = [];
        before.forEach(item => {
            barcodeArr.push(item.barcode);
        });

        //按条（1.条码2.价钱分类）
        let sortAction = (goods) => {
            let num = 0, total = 0, ysje = 0, pop_details = [], protot;
            protot = {...goods[0]};
            goods.forEach(goods => {//商品信息组合
                num += goods.qty;
                total += goods.total;
                ysje += goods.ysje;
                goods.pop_details.forEach(pop => pop_details.push(pop));
            });
            protot.qty = num;
            protot.total = total;
            protot.ysje = ysje;
            let hash = {};
            pop_details = pop_details.reduce((item, next) => {//合并活动ID
                if (hash[next.pop_event_billid]) {
                    let addition = item.find(item => item.pop_event_billid === next.pop_event_billid);
                    addition.discount_amount += next.discount_amount;
                } else {
                    hash[next.pop_event_billid] = true && item.push(next);
                }
                return item;
            }, []);
            protot.pop_details = pop_details;
            return protot;
        }

        barcodeArr = new Set(barcodeArr); //去除重复barcode
        barcodeArr = Array.from(barcodeArr);
        barcodeArr.forEach(barcode => {//找出对应code事件
            let sameGp = before.filter(item => item.barcode === barcode); //找出相同条码
            if (sameGp.length > 0) {
                let groupByPrice = [];
                sameGp.forEach(item => groupByPrice.push(item.price));// 按价钱分组（处理不定价商品）
                groupByPrice = new Set(groupByPrice);
                groupByPrice = Array.from(groupByPrice);
                for (let i = 0, len = groupByPrice.length; i < len; i++) {
                    let goods = sameGp.filter(item => item.price === groupByPrice[i]); //按价钱分组
                    newGoods.push(sortAction(goods));
                }
            } else {
                newGoods.push(sortAction(sameGp));
            }
        });
        return newGoods;
    }

    //构造打印序列方法
    structSalesOrder = (info) => {
        let sequence = '';
        if (info.djlb === '2' || info.djlb === '4') { //消单 //退货 消单 只打一个平推不需要判断其他条件
            sequence = 'returnPrint';
            return sequence;
        }
        if (info.logisticsMode === 3) { //行送
            sequence = sequence ? sequence + ',' + 'deliveryPrint' : 'deliveryPrint';
        } else if (info.logisticsMode === 5) { //DC送
            sequence = sequence ? sequence + ',' + 'dCPrint' : 'dCPrint';
        }
        if (info.recycleSer && info.recycleSer.recordNo) {//除旧//后期需要确认字段
            sequence = sequence ? sequence + ',' + 'equipmentPrint' : 'equipmentPrint';
        }
        if (!(info.recycleSer && info.recycleSer.recordNo && (info.logisticsMode === 3 || info.logisticsMode === 5)) && info.depositSale) {//按金
            sequence = sequence ? sequence + ',' + 'pressPrint' : 'pressPrint';
        }

        let transfer = '', pay = info.salePayments;
        for (let i = 0, len = pay.length; i < len; i++) {
            if (pay[i].payCode === this.state.codeACS) {
                transfer = 'aCSFQPrint,aCSMEMOPrint';
                break;
            }
            if (pay[i].payCode === '0303') {
                transfer = 'fQPrint';
                break;
            }
        }
        if (transfer) {
            sequence = (transfer && (sequence ? sequence + ',' + transfer : transfer)) || '';//wufapip
        } //ACS分期
        return sequence; //返回打印序列方法
    }

    //判断是否满足打印条件(正常销售入口)
    checkSalesPrint = (extra) => {
        let sequence, redirectMethod;
        let method = extra.params.method;
        if (this.props.tail) {
            extra.index = 0;
        }
        let {selectKey, billList, selectionData, codeACS} = this.state;
        switch (extra.index) {//拼接方法需要先调平推后热敏
            case 0:
                sequence = this.structSalesOrder(selectionData);
                if (selectionData.djlb === '2') {//該單據無法進行熱敏 需要处理特的副单打印
                    let auxiliary = false;
                    for (let i = 0, len = selectionData.goodslist.length; i < len; i++) {
                        if (selectionData.goodslist[i].prtDuplFlag) {
                            auxiliary = true;
                            break;
                        }
                    }
                    method = auxiliary ? 'accessoryPrint,' + sequence : sequence;
                } else {
                    method = sequence ? sequence + ',' + method : method;
                }

                if (method.includes('pressPrint') && (method.includes('dCPrint') || method.includes('deliveryPrint'))) {
                    let keyIndex;
                    method = method.split(',');
                    keyIndex = method.indexOf('pressPrint');
                    method.splice(keyIndex, 1);
                    method = method.join(',');
                }

                extra.params.method = method;
                this.setState({isPrint: true});
                this.orderSalesStamp(extra, 'batchPrinting');
                break;
            case 2:
                extra.params.method = this.structSalesOrder(selectionData);
                extra.params.method = extra.params.method ? extra.params.method + ',cySlipPrint' : 'cySlipPrint';
                this.setState({isPrint: true});
                redirectMethod = extra.params.method.includes(',') ? 'batchPrinting' : 'forwardPrint';
                this.orderSalesStamp(extra, redirectMethod);
                break;
            case 6:
                let flag = false, pay = selectionData.salepayments;
                for (let i = 0, len = pay.length; i < len; i++) {
                    if (pay[i].paycode === codeACS) {
                        flag = true;
                        break;
                    }
                }
                if (!flag) {
                    message("該單據沒有使用ACS分期！");
                    return;
                }
                this.setState({isPrint: true});
                this.orderSalesStamp(extra, 'batchPrinting');
                break;
            case 7:
                if (!selectionData.recycleSer || !selectionData.recycleSer.recordNo) {
                    message("該單據無四電壹腦商品！");
                    return;
                }
                this.setState({isPrint: true});
                this.orderSalesStamp(extra, 'batchPrinting');
                break;
            // case 8:
            //     if (!selectionData.depositSale) {
            //         message("該單據不是尾款單！");
            //         return;
            //     }
            //     this.setState({isPrint: true});
            //     break;
            default:
                if (selectionData.djlb === '2') {
                    message("消單無法打印單據，請打印留條！");
                    return;
                }
                if (extra.index === 5) {
                    let moments = moment(this.props.tail ? billList[selectKey].orderdatetime : selectionData.saleDate);
                    let sameDay = moment().date() === moments.date();//判断是否当前的销售单
                    if (!(sameDay && (moments.date() == parseInt(this.props.syspara.dateHSXP)))) {
                        message("無黃色小票，無法重印!");
                        return;
                    }
                }
                this.orderSalesStamp(extra, 'forwardPrint');
                break;
        }
    }


    //单据打印
    orderSalesStamp = (extra, method) => {
        try {
            let pointsInfo = {}, redemption, hykDeduct, hykDeductTotal, otpZl,
                subTotal, hykh, isTailTotal, isnotTailTotal, dzyh, swyh,
                tradeno,
                ordered, stamp, stick, moments, sameDay, DirectMoney = 0,
                ArtcodeMoneyTotal = 0, cashPay = 0, bankTotal = 0,
                notBankTotal = 0,
                hjzsl = 0, ArtcodeMoney = [];
            let mktinfo = this.props.mktinfo;
            let {selectKey, billList, selectionData} = this.state;
            let data = billList[selectKey];

            moments = moment(this.props.tail ? data.orderdatetime : selectionData.saleDate);
            sameDay = moment().date() === moments.date();//判断是否当前的销售单

            let jfCode = this.props.syspara.payObj.find(item => item.split(',')[0] === 'payJFXF');//积分系统code
            if (jfCode) { //判断当前收银机是否支持积分付款
                pointsInfo = selectionData.salepayments.find(item => item.paycode === jfCode.split(',')[1]) || {}; //积分付款信息
            }
            selectionData.salepayments.forEach(item => {
                let mode = this.props.paymode.find((mode) => mode.code === item.paycode);

                if (item.flag !== "2" && item.flag != "3" && item.paycode !== '0602') {
                    if (mode.virtualPayType === 0) {
                        notBankTotal += item.total;
                        cashPay += item.total - item.overage; //计算现金类金额
                    } else {
                        bankTotal += item.total;
                    }
                }

                if (item.paycode === '0707') {
                    hykDeduct = item.ybje;
                    hykDeductTotal = item.total;
                }

                item.virtualPayType = mode.virtualPayType;

                if ((item.paycode === '0301' || item.paycode === '0309') && item.trace === "0") {
                    item.trace = '';
                    item.misMerchantId = 'M';//银行卡类型
                }
                if (item.paycode === '0310' || (item.trace && (item.paycode === '0301' || item.paycode === '0309'))) {
                    item.trace = ("000000" + item.trace).substr(-6);
                }
                if (item.paycode === '0308') {
                    if (item.trace === "0") {
                        item.payno = item.payno.slice(0, 6) + "******" + item.payno.slice(12, item.payno.length);
                        item.trace = ("000000" + item.refCode).substr(-6);
                    } else {
                        item.trace = ("000000" + item.trace).substr(-6);
                    }
                }
                if (item.paycode === '0309') {
                    item.payno = item.payno.slice(0, 6) + "******" + item.payno.slice(12, item.payno.length);
                }
                if (item.printPayNo) {
                    item.payno = item.printPayNo;
                }
            });

            //合并现金支付行数据
            if (cashPay) {
                otpZl = !!selectionData.salepayments.find(item => item.payname.includes('octopus'));
                selectionData.salepayments = selectionData.salepayments.filter(item => item.virtualPayType !== 0 || item.paycode === '0602');
                selectionData.salepayments.push({
                    payname: 'CASH',
                    ybje: cashPay
                });
            }

            //打印要求这样做
            if (selectionData.memberInfo) {
                let timeFormat = (time) => moment(time).format('DD/MM/YYYY');
                let {bonusPointExpireDate, bonusPointLastUpdateDate, membershipExpireDate, membershipUntilDate, lastUpdateTime} = selectionData.memberInfo;
                if (bonusPointExpireDate) {
                    bonusPointExpireDate = timeFormat(bonusPointExpireDate);
                    selectionData.memberInfo.bonusPointExpireDate = bonusPointExpireDate === "Invalid date" ? bonusPointExpireDate.substring(6, 8) + '/' + bonusPointExpireDate.substring(4, 6) + '/' + bonusPointExpireDate.substring(0, 4) : bonusPointExpireDate;
                }
                if (bonusPointLastUpdateDate) {
                    bonusPointLastUpdateDate = timeFormat(bonusPointLastUpdateDate);
                    selectionData.memberInfo.bonusPointLastUpdateDate = bonusPointLastUpdateDate === "Invalid date" ? bonusPointLastUpdateDate.substring(6, 8) + '/' + bonusPointLastUpdateDate.substring(4, 6) + '/' + bonusPointLastUpdateDate.substring(0, 4) : bonusPointLastUpdateDate;
                }
                if (membershipExpireDate) {
                    membershipExpireDate = timeFormat(membershipExpireDate);
                    selectionData.memberInfo.membershipExpireDate = membershipExpireDate === "Invalid date" ? membershipExpireDate.substring(6, 8) + '/' + membershipExpireDate.substring(4, 6) + '/' + membershipExpireDate.substring(0, 4) : membershipExpireDate;
                }
                if (membershipUntilDate) {
                    membershipUntilDate = timeFormat(membershipUntilDate);
                    selectionData.memberInfo.membershipUntilDate = membershipUntilDate === "Invalid date" ? membershipUntilDate.substring(6, 8) + '/' + membershipUntilDate.substring(4, 6) + '/' + membershipUntilDate.substring(0, 4) : membershipUntilDate;
                }
                if (lastUpdateTime) {
                    selectionData.memberInfo.lastUpdateTime = lastUpdateTime.substring(4, 6) + '月' + lastUpdateTime.substring(6, 8) + '日';
                }
            }

            //积分消费
            if (!pointsInfo.ybje && selectionData.popInfo) {
                redemption = selectionData.popInfo.find(item => item.pop_describe.includes("积分换购"));
            }

            if (selectionData.popInfo && selectionData.popInfo.length > 0) {
                subTotal = selectionData.zdyftotal;
            }

            if (selectionData.consumersCard) {
                hykh = selectionData.consumersCard;
            }

            if (selectionData.depositSale && !selectionData.tailMoneyPay) {
                isnotTailTotal = selectionData.salepayments.find(item => item.paycode === '0602').total;
                isTailTotal = (selectionData.zdyftotal - isnotTailTotal - selectionData.zddsctotal).toFixed(2);
            }

            if (selectionData.djlb === '2' || selectionData.djlb === '4') {
                dzyh = selectionData.eleStamp;
                swyh = selectionData.sticker;
            }

            //屏蔽送货memo号
            // if (!(selectionData.logisticsMode === 3 || selectionData.logisticsMode === 5 || selectionData.depositSale)) {
            //     selectionData.expressNumber = undefined;
            // }
            selectionData.goodslist = selectionData.goodslist.filter(item => item.goodsType !== "99" && item.goodsType !== "98");
            //selectionData.goodslist = this.mergeGoods([...selectionData.goodslist]);
            selectionData.goodslist.forEach((item, index) => {
                item.idnum = index + 1; //商品序号
                hjzsl += item.qty;
                if (sameDay) {//满足黄色小票条件
                    if (item.license == 0) {
                        DirectMoney += parseFloat(item.ysje)
                    } else if (item.license == 1) {
                        let obj = {};
                        let hasArtcode = false
                        obj.artcode = item.category;
                        obj.total = item.ysje;
                        ArtcodeMoney.map((item, index) => {
                            if (item.artcode === obj.artcode) {
                                hasArtcode = true;
                                ArtcodeMoney[index].total = parseFloat(obj.total) + parseFloat(ArtcodeMoney[index].total)
                            }
                        })
                        if (!hasArtcode) {
                            ArtcodeMoney.push(obj);
                        }
                        ArtcodeMoneyTotal += parseFloat(item.ysje)
                    }
                }
            });

            selectionData.salepayments = selectionData.salepayments.filter(item => item.paycode !== '0602'); //过滤尾款支付行

            //判断是否支付宝支付
            let micropayment = selectionData.salepayments.find(item => item.paycode === '0903');
            if (micropayment) {
                tradeno = "BARC#" + micropayment.refCode;
                ordered = "RRNO#" + micropayment.payno;
            }

            let params = {
                mkt: data.mkt,
                fphm: data.fphm.substr(data.fphm.length - 4),
                syjh: data.syjh,
                flow_no: data.billno,
                syyh: data.syyh,
                commonData: {   //构造公共字段
                    rqsj: moments.format('DD/MM/YYYY HH:mm:ss'),//交易时间

                    hykh: (pointsInfo.payno || ((selectionData.memberInfo && (hykh || selectionData.memberInfo.memberId)) || (selectionData.memberInfo && selectionData.memberInfo.stampOwnerID)) || hykh), //会员卡号
                    hykDeduct: hykDeduct || (pointsInfo.ybje || (redemption && redemption.freight_amount)), //使用积分
                    hykDeductTotal: hykDeductTotal || (pointsInfo.total || (redemption && redemption.freight_mode.split(',')[1])), //抵扣金额
                    memberInfo: selectionData.memberInfo,   //会员信息
                    printMode: selectionData.printMode, //生日标识

                    staffcard: selectionData.staffCardNo || selectionData.creditCardNo, //员工购物
                    staffcardYGGH: selectionData.staffNo,  //是员工工号
                    staffcardType: selectionData.staffType,  //1为员工购物  2为亲属购物
                    cardtype: selectionData.consumersCard, //consumersCard
                    consumersType: selectionData.consumersType,

                    esystemStatus: selectionData.recycleSer && (selectionData.recycleSer.uploadFlag || 'P'),//上传状态
                    recycleSer: selectionData.recycleSer,//四电一脑基础信息
                    recycleSerInfo: selectionData.recycleSerInfo,//四电一脑详情
                    expressNumber: selectionData.expressNumber, //送货memo号

                    mktname: mktinfo && mktinfo.mktname,//门店号名称
                    address: mktinfo && mktinfo.address,  //门店地址
                    enAddress: mktinfo && mktinfo.enAddress,//英文地址
                    phone: mktinfo && mktinfo.telephone, //门店联系电话
                    shopname: this.props.syspara.shopname,//商场名称
                    shopEnName: mktinfo && mktinfo.shopEnName,//英文店名
                    mdjc: mktinfo && mktinfo.shopSName, //门店简称

                    refundAuthzCardNo: selectionData.refundAuthzCardNo, //退货授权卡号
                    terminalOperatorAuthzCardNo: selectionData.terminalOperatorAuthzCardNo || '',//员工授权卡号
                    totalDiscAuthzCardNo: selectionData.totalDiscAuthzCardNo || '',//总折扣授权卡号

                    dzyh: dzyh,//电子印花
                    swyh: swyh,//实物印花
                    eleStamp: selectionData.eleStamp, //印花券
                    sticker: selectionData.sticker, //印花券
                    popInfo: selectionData.popInfo,//整单折扣
                    outSideGiftsInfo: selectionData.outSideGiftsInfo,  //场外换购信息

                    bankTotal: bankTotal, //银行支付
                    notBankTotal: notBankTotal, //非银行支付 （废弃）
                    isnotTailTotal: isnotTailTotal, //尾款金额
                    isTailTotal: isTailTotal, //非尾款金额
                    sjfk: selectionData.zdsjtotal,//实际付款 zdsjtotal
                    ysje: selectionData.zdyftotal - selectionData.zddsctotal,//应收金额 zdyftotal

                    tradeno: tradeno, //支付微信流水信息
                    ordered: ordered,

                    hasFastPay: selectionData.hasFastPay,//快付通字段
                    isyellowPrint: (sameDay && (moments.date() == parseInt(this.props.syspara.dateHSXP))) ? 'Y' : 'N',//是否黄色小票
                    ArtcodeMoney: ArtcodeMoney, //黄色小票非直营数组
                    DirectMoney: DirectMoney.toFixed(2), //黄色小票直营金额
                    ArtcodeMoneyTotal: ArtcodeMoneyTotal.toFixed(2),//黄色小票非直营金额
                    switchEng: extra.params.english || false,//是否是英文单
                    barcodeString: selectionData.mktcode + selectionData.syjh + moment(selectionData.saleDate).format('YYMMDD') + selectionData.syjh +
                    selectionData.fphm.substr(selectionData.fphm.length - 4),//门店号+收银机号+小票号

                    hjzsl,//合计商品数量
                    subTotal,//全单折扣
                    iscy: 'Y', //重印字段--用于Java 记录ejoural
                    otpZl,
                },
            };


            if (selectionData.logisticsMode === 5) {
                //查询商品库存
                let goods = selectionData.goodslist, _code = "", status;
                for (let i = 0; i < goods.length; i++) {
                    i == goods.length - 1 ? _code += goods[i].goodsno : _code += (goods[i].goodsno + ",");
                }
                let paramS = {
                    mkt: selectionData.reserveLocation,
                    code: _code,
                    ent_id: this.props.entid,
                    jygs: this.props.jygs,
                    operators: data.syyh,
                };
                this.props.searchStocks(paramS).then(stocks => {
                    if (stocks) {
                        if (stocks.length > 0) {
                            goods.forEach(item => {
                                let stock = stocks.find(st => st.goodsCode === item.goodsno) || {};
                                item.saleStock = stock.salestock || 0;
                            });
                        } else {
                            goods.forEach(item => {
                                item.saleStock = 0;
                            });
                        }
                        this.props.callback(method, {...selectionData, ...params, ...extra.params}, this.confirmPrit);
                    } else {
                        message("查詢庫存失敗無法打印DC送單據！");
                        this.setState({isPrint: false});
                    }
                }).catch(e => {
                    message("查询库存失敗，請聯系工作人員！");
                    this.setState({isPrint: false});
                })
            } else {
                this.props.callback(method, {...selectionData, ...params, ...extra.params}, this.confirmPrit);
            }
        } catch (e) {
            message("打印單據失敗，請聯系工作人員！");
            this.setState({isPrint: false});
        }
    }

    /****卖场销售结束****/


        // virtualPayType
        // 0=现金 1=券 2=积分 3=银行卡 4=储值卡 5=其他类
    getPaytypeName = (code) => {
        let mode = this.props.paymode.find(item => code === item.code);
        if (mode) {
            switch (mode.virtualPayType) {
                case 0:
                    return '現金';
                    break;
                case 1:
                    return '禮券';
                    break;
                case 2:
                    return '積分';
                    break;
                case 3:
                    return '银行卡';
                    break;
                case 4:
                    return '儲值卡';
                    break;
                case 5:
                    return '其他類';
                    break;
                default:
                    return '其他類別';
                    break;
            }
        } else {
            return '其他類';
        }
    }
}

export default withKeypad(printAgain);
