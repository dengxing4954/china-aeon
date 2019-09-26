import React, { Component } from 'react';
import moment from 'moment';
import EventEmitter from '@/eventemitter/';
import { Modal, Row, Col, Button, Form, DatePicker, Input, Select, Radio, message, Table } from 'antd';
import '../style/DeliveryModal.less';
import intl from 'react-intl-universal';

const FormItem = Form.Item;
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;


class DeliveryModal extends Component {

    state = {
        date: null,
        reserveLocationMkt: null, //"81",
        reserveLocation: null,
        customName: '',
        telephone: '',
        address: '',
        locationOut: null,
        otherTelephone: '',
        currentDate: null,
        currentDateStr: null,
        regionInfo: [], //配送信息
        regionList: [], //配送区域
        regionDate: null,
        showList: [],
        receiverDistrict: '', //区域id
        showReceiverStreet: '',
        receiverStreet: '', //街道id
        strDate: '',
        regionObject: {},
        chooseDateList: [],
        showDateList: [],
        chooseKey: '',
        finalDateValue:{},
        dateFormat: 'DD-MM-YYYY',
    }

    handleOk = () => {
        if (this.props.callback) {
            this.props.callback(this.state.num);
        }
        this.props.close();
    }

    handleCancel = () => {
        this.props.close();
    }

    handlePageChange = (pagination) => {
        this.setState({
            pagination: {
                ...pagination,
                current: pagination.current
            }
        })
    }


    formatDate = (fmt, dt) => {
        var o = {
            "M+": dt.getMonth() + 1, //月份 
            "d+": dt.getDate(), //日 
            "h+": dt.getHours(), //小时 
            "m+": dt.getMinutes(), //分 
            "s+": dt.getSeconds(), //秒 
            "q+": Math.floor((dt.getMonth() + 3) / 3), //季度 
            "S": dt.getMilliseconds() //毫秒 
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (dt.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }

    getShurtcutDates = (dsLen) => {
        let _ds = [];
        let _tm = new Date().getTime();
        let _tmOffsetBase = 24 * 60 * 60 * 1000;
        for (let i = 0; i < dsLen; i++) {
            // _ds.push(this.formatDate("dd-MM-yyyy", new Date(_tm + (0 * _tmOffsetBase) + i * _tmOffsetBase)));
            _ds.push(this.formatDate("dd-MM-yyyy", new Date(_tm + (2 * _tmOffsetBase) + i * _tmOffsetBase)));
        }
        return _ds;
    }

    handleDateChange = (dt, dtStr) => {
        this.setState({ date: dtStr.split(" ")[0] });
    }

    changeRegionDate = (dt, dtStr) => {
        let {regionObject} = this.state
        if(JSON.stringify(regionObject) !== '{}'){
            let chooseDateList = regionObject['others'].filter(v => v.strDate == dtStr);
            if(chooseDateList.length !== 0){
                this.state.showList.forEach(v => v.isChoose = false);
                this.setState({chooseDateList, regionDate: dtStr, date:dtStr, showList: this.state.showList, showDateList: []});
            }else{
                message.error('當前日期沒有Quota配額');
                this.setState({chooseDateList: [], regionDate: '',});
            }
        }else{
            message.error('當前日期沒有Quota配額');
        }
    }
   
    regionInfoChange = (value) => {
        this.setState({receiverDistrict: value});
    }

    regionListChange = (value, flag = true) => {
        let receiverStreet = this.state.regionList.find(v => v.csdrrid === value).regionId;
        this.setState({receiverStreet, showReceiverStreet: value});
        if(flag) {
            this.props.getQuotaInfo({regionId: receiverStreet}).then(res => {
                if(res) {
                    if(flag){
                        this.state.showList.forEach(item => item.isChoose = false)
                        this.setState({
                            regionObject: {
                                tod: res.tod || [],
                                tom: res.tom || [],
                                atom: res.atom || [],
                                others: res.others || []
                            },
                            chooseDateList: [],
                            regionDate: null,
                            showList: this.state.showList
                        });
                    }
                };
            });
        }else{
            return this.props.getQuotaInfo({regionId: receiverStreet})
        }

    }

    chooseDate = (value, key, chooseKey) => {
        let {showList} = this.state;
        let list = showList.find(v => v.date == value.strDate);
        this.setState({chooseKey, finalDateValue: value});
        if(!!list) {
            list.isChoose = true
        }
        if(key === 'others'){
            showList.forEach(item => {item.isChoose = false});
        }
        this.setState({showList});     
    }

    showDateClick = (value) => {
        let {regionObject, showList} = this.state;
        let item = showList.find(v => v.key === value.key);
        if(!!regionObject[item.key] && regionObject[item.key].length !== 0){
            item.isChoose = true;
            this.setState({strDate: value.date, date: value.date, showDateList: regionObject[item.key], chooseDateList: [], regionDate: ''});
        }else{
            message.error('當前日期沒有Quota配額');
        }
        this.setState({showList});
    }

    handleDateClick = (e) => {
        this.setState({
            date: e.target.value
        });
    }

    handleDateReset = (e) => {
        this.setState({
            date: "09-09-2009"
        });
    }

    handleResLocChoice = (e) => {
        this.setState({
            reserveLocationMkt: e,
            reserveLocation: e,
            //locationOut: e,
        });
    }

    handleLocOutChoice = (e) => {
        this.setState({
            // reserveLocationMkt: e,
            // reserveLocation: e,
            locationOut: e,
        });
    }

    handleResLocMktSelect = (value) => {
    }

    handleResLocChange = (e) => {
    }

    handleResLocBlur = (value) => {
        let val = this.trim(value) === '' ? null : value;
        if (val == null) {
            message.error(intl.get("PLACEHOLDER_ENTER") + "Reserve Location");
            return;
        }
        this.setState({
            reserveLocation: val,
            locationOut: val
        });
    }

    handleLocOutChange = (e) => {
        let val = this.trim(e.target.value) === '' ? null : e.target.value
        this.setState({
            locationOut: val
        });
    }

    handleLocOutBlur = (e) => {
        let val = this.trim(e.target.value) === '' ? null : e.target.value
        if (val == null) {
            message.error(intl.get("PLACEHOLDER_ENTER") + "Out Location");
            return;
        }
        this.setState({
            locationOut: val
        });
    }

    handleCusNamChange = (e) => {
        this.setState({
            customName: e.target.value
        });
    }

    handleCusNamBlur = (e) => {
        this.setState({
            customName: e.target.value
        });
    }

    handleTelChange = (e) => {
        this.setState({
            telephone: e.target.value
        });
    }

    handleTelBlur = (e) => {
        this.setState({
            telephone: e.target.value
        });
    }

    handleCusAddrChange = (e) => {
        this.setState({
            address: e.target.value
        });
    }

    handleCusAddrBlur = (e) => {
        this.setState({
            address: e.target.value
        });
    }

    trim = (str) => {
        return str.replace(/(^\s*)|(\s*$)/g, "");
    }

    handleOthTelChange = (e) => {
        let val = this.trim(e.target.value) === '' ? '' : e.target.value
        this.setState({
            otherTelephone: val
        });
    }

    handleOthTelBlur = (e) => {
        let val = this.trim(e.target.value) === '' ? '' : e.target.value
        this.setState({
            otherTelephone: val
        });
    }

    handleSubmit = (e) => {
        e.preventDefault();
        // if (this.state.date == null || this.state.date == "") {
        //     message.error(intl.get("PLACEHOLDER_ENTER") + "DC" + intl.get("PLACEHOLDER_DELIVERYDATE"));
        //     return;
        // }
        if (this.state.reserveLocation == null) {
            message.error(intl.get("PLACEHOLDER_ENTER") + "Reserve Location");
            return;
        }
        if (!!this.props.callback) {
            // let {finalDateValue} = this.state;
            // let deliveryStartTime = JSON.stringify(finalDateValue) !== '{}'? `${finalDateValue.strDate} ${finalDateValue.startTime}` : ''
            // let deliveryEndTime = JSON.stringify(finalDateValue) !== '{}' ? `${finalDateValue.strDate} ${finalDateValue.endTime}` : ''
            let {chooseDateList, showDateList} = this.state;
            let deliveryStartTime = '', deliveryEndTime = '', invoiceTitle = '';
            if(chooseDateList.length !==0 || showDateList.length !== 0){
                invoiceTitle = chooseDateList.length !== 0 ? chooseDateList[0].timeRangeCode : showDateList[0].timeRangeCode
                deliveryStartTime = chooseDateList.length !== 0 ? `${chooseDateList[0].strDate} ${chooseDateList[0].startTime}:00` : `${showDateList[0].strDate} ${showDateList[0].startTime}:00`;
                deliveryEndTime = chooseDateList.length !== 0 ? `${chooseDateList[0].strDate} ${chooseDateList[0].endTime}:00` : `${showDateList[0].strDate} ${showDateList[0].endTime}:00`;
            };
            this.props.callback({
                date: this.state.date  === '' || this.state.date  == null ? '2009-09-09' : this.state.date,
                reserveLocation: this.state.reserveLocation,
                customName: this.state.customName || '',
                telephone: this.state.telephone ||'',
                address: this.state.address || '',
                locationOut: this.state.locationOut,
                otherTelephone: this.state.otherTelephone || '',
                receiverDistrict: this.state.receiverDistrict + '',
                receiverStreet: this.state.receiverStreet,
                showReceiverStreet: this.state.showReceiverStreet,
                deliveryStartTime,
                invoiceTitle,
                deliveryEndTime,
                chooseDateList: this.state.chooseDateList,
                showDateList: this.state.showDateList,
            });
        }
        this.props.close();
    }

    componentDidMount() {
        let dt = null;
        let rlmv = null;    //"81";
        let weekdayList=["星期日","星期一","星期二","星期三","星期四","星期五","星期六"];
        let list = [{name: '今天',isChoose: false, key: 'tod', day:weekdayList[moment().format('d')], date: moment().format('YYYY-MM-DD')},
        {name: '翌日', isChoose: false, key:'tom', day:weekdayList[moment().add('days',1).format('d')], date: moment().add('days',1).format('YYYY-MM-DD')},
        {name: '後日', isChoose: false, key:'atom', day:weekdayList[moment().add('days',2).format('d')], date: moment().add('days',2).format('YYYY-MM-DD')},
        {name: 'other', key: 'others', data: ''}];
        this.setState({showList: list});
        // if (!!this.props.data.reserveLocation && this.props.data.reserveLocation === this.props.mkt) {
        if (!!this.props.data.reserveLocation) {
            rlmv = this.props.data.reserveLocation;
        }
        //DC送获取区域信息
        if(!!this.props.paravalue && Number(this.props.paravalue) > 0){
            this.props.getRegionInfo().then(res => {
                if(res){
                    let receiverDistrict = '';
                    if(this.props.data.receiverDistrict !== ''){
                        let filterList = res.regionInfo.find(v => v.regionId === this.props.data.receiverDistrict);
                        receiverDistrict = !!filterList ? filterList.regionId : '';      
                    }
                    this.setState({regionInfo: res.regionInfo, receiverDistrict});
                    this.props.getRegionList().then(res => {
                        if(res){
                            let receiverStreet = '', showReceiverStreet = '';
                            this.setState({regionList: res.regionRule,})
                            if(this.props.data.receiverStreet !== ''){
                                let filterList = res.regionRule.find(v => v.csdrrid === this.props.data.showReceiverStreet);
                                receiverStreet = !!filterList ? filterList.regionId : '';
                                showReceiverStreet = !!filterList ? filterList.csdrrid : '';
                                if(receiverStreet !== ''){
                                    let date = this.props.data.date;
                                    this.regionListChange(showReceiverStreet, false).then(res => {
                                        this.setState({
                                            regionObject: {
                                                tod: res.tod || [],
                                                tom: res.tom || [],
                                                atom: res.atom || [],
                                                others: res.others || []
                                            },
                                            chooseDateList: this.props.data.chooseDateList,
                                            showDateList: this.props.data.showDateList,
                                            regionDate: this.props.data.chooseDateList.length !== 0 ? this.props.data.chooseDateList[0].strDate : ''
                                        })
                                        let aimList = list.find(v => v.date === date);
                                        if(!!aimList){
                                            aimList.isChoose = true;
                                        }
                                        this.setState({showList: list,strDate: date});
                                    });    
                                }  
                            }
                            this.setState({receiverStreet, showReceiverStreet});              
                        };
                    });
                };
            });
        }
        console.log("++++componentDidMount : ", this.props.data);
        if (!!this.props.data.date) {
            var ps = this.props.data.date;
            var pd = ps.split("-");
            dt = new Date(pd[2], pd[1] - 1, pd[0]);
            this.setState({
                date: this.props.data.date,
                // reserveLocationMkt: rlmv,
                reserveLocationMkt: this.props.data.reserveLocation,
                reserveLocation: this.props.data.reserveLocation,
                customName: this.props.data.customName,
                telephone: this.props.data.telephone,
                address: this.props.data.address,
                locationOut: this.props.data.locationOut,
                otherTelephone: this.props.data.otherTelephone,
                currentDate: dt,
                currentDateStr: this.formatDate('dd-MM-yyyy', dt)
            });
        } else {
            dt = new Date();
            // let theDt = moment(dt).add(2, 'days')
            // dt = new Date("2004-04-04");
            let theDt = moment(dt).add(0, 'days')
            let dt2 = new Date(theDt.year(), theDt.month(), theDt.date())
            let dt2Str = this.formatDate('dd-MM-yyyy', dt2);
            this.setState({
                // date: dt2Str,
                reserveLocationMkt: this.props.data.reserveLocation,
                reserveLocation: this.props.data.reserveLocation,   //rlmv,
                customName: this.props.data.customName,
                telephone: this.props.data.telephone,
                address: this.props.data.address,
                locationOut: this.props.data.locationOut,  //rlmv,
                otherTelephone: this.props.data.otherTelephone,
                currentDate: dt2,
                currentDateStr: dt2Str
            });
        }
        EventEmitter.on('Scan', this.fillback);
    }

    componentWillUnmount() {
        EventEmitter.off('Scan', this.fillback);
    }

    fillback = (data) => {
        if (!!data && data.indexOf('?') !== -1){
            let list = data.split('?');
            list.shift();
            this.setState({
                telephone: !!list[0] ? decodeURI(list[0]) : '',
                customName: !!list[1] ? decodeURI(list[1]) : '',
                address: !!list[2] ? decodeURI(list[2]): '',
            });
        }else{
            if (!!data && data.length > 0) {
                let s1 = data.split(" ");
                if (s1.length == 2) {
                    let s2 = s1[1].split(",");
                    if (s2.length == 2) {
                        this.setState({
                            customName: s1[0],
                            telephone: s2[0],
                            address: s2[1]
                        });
                    }
                }
            }
        };
    }

    render() {
        let _that = this;
        let theWeekday = "";
        const { data } = this.props;
        const { getFieldDecorator, setFieldsValue, getFieldsValue } = this.props.form;
        const ds = this.getShurtcutDates(20);
        const dsItems = ds.map((xDate, ind) => {
            let res = null;
            let wdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
            let _y = xDate.substr(6, 4);
            let _m = xDate.substr(3, 2);
            let _d = xDate.substr(0, 2);
            let weekday = wdays[new Date(Number(_y), Number(_m) - 1, Number(_d)).getDay()];
            if (!!this.state.date && this.state.date === xDate) {
                theWeekday = weekday;
                res = (
                    <li className='item' key={ind}>
                        <RadioButton value={xDate} className='btn' style={{ color: '#1890ff', borderColor: '#1890ff' }}>{xDate} {weekday}</RadioButton>
                    </li>
                );
            } else {
                res = (
                    <li className='item' key={ind}>
                        <RadioButton value={xDate} className='btn' style={{ color: 'rgba(0, 0, 0, 0.65)', borderColor: '#d9d9d9' }}>{xDate} {weekday}</RadioButton>
                    </li>
                );
            }
            return res;
        });
        return (
            <Modal
                className='delivery'
                visible={true}
                width={860}
                title={intl.get("MENU_DC")/*DC送货*/}
                okText={intl.get("BTN_CONFIRM")/*确定*/}
                footer={null}
                maskClosable={false}
                cancelText={intl.get("BACKTRACK")/*返回*/}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                style = {{position: 'relative', top: '50px'}}
            >
                <Row>
                    <Form className="form">
                        <Col span={12}>
                            <FormItem
                                style={{ marginTop: '4px' }}
                                label={intl.get("PLACEHOLDER_DELIVERYDATE")}
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 16 }}
                            >
                             {this.props.paravalue == undefined || this.props.paravalue == 0 ? 
                                <div>
                                <DatePicker
                                    showToday={false}
                                    style={{ width: "190px" }}
                                    placeholder={intl.get("PLACEHOLDER_DCDATE")/*请选择送货日期*/}
                                    value={!!this.state.date ? (moment(this.state.date, this.state.dateFormat)) : null}
                                    // format={this.state.dateFormat+" ddd"} 
                                    format={this.state.dateFormat}
                                    disabled = {!!this.props.paravalue && Number(this.props.paravalue) > 0}
                                    disabledDate={(dt) => {
                                        let xz = new Date();
                                        let res = dt < moment(xz).add(1, 'days') || dt > moment(xz).add(90, 'days');
                                        return res;
                                    }}
                                    onChange={this.handleDateChange.bind(this)} />
                                <div style={{ display: "inline-block", marginLeft: "-86px", position: "relative", zIndex: 2000 }}>
                                    {theWeekday}
                                </div>
                                <div style={{display: "inline-block", marginRight: "20px", float: "right" }}>
                                    <Button onClick={this.handleDateReset.bind(this)} icon="sync"/>
                                </div> 
                                </div>
                                : 
                                <div>
                                    <DatePicker
                                    showToday={false}
                                    style={{ width: "190px" }}
                                    // placeholder={intl.get("PLACEHOLDER_DCDATE")/*请选择送货日期*/}
                                    placeholder = ''
                                    value={!!this.state.date ? (moment(this.state.date, 'YYYY-MM-DD')) : null}
                                    // format={this.state.dateFormat+" ddd"} 
                                    format={this.state.dateFormat}
                                    disabled
                                    // disabledDate={(dt) => {
                                    //     let xz = new Date();
                                    //     let res = dt < moment(xz).add(1, 'days') || dt > moment(xz).add(90, 'days');
                                    //     return res;
                                    // }}
                                     /> 
                                </div>
                             }
                            </FormItem>
                            <FormItem
                                label="Reserve Location"
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 15 }}
                            >
                                {getFieldDecorator('inputResLoc', {
                                    rules: [
                                        { required: true, message: intl.get("PLACEHOLDER_ENTER") + 'Reserve Location!' },
                                    ],
                                    initialValue: this.state.reserveLocationMkt
                                })(
                                    <Select
                                        // value={this.state.reserveLocationMkt}
                                        onChange={this.handleResLocChoice.bind(this)}
                                    >
                                        <Option value="081">{intl.get("PLACEHOLDER_DSCODE")}/81</Option>
                                        <Option value={this.props.mkt}>{intl.get("PLACEHOLDER_TSCODE")}/{this.props.mkt}</Option>
                                    </Select>
                                )}
                            </FormItem>
                            <FormItem
                                label="Location Out"
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 15 }}
                            >
                                {getFieldDecorator('inputOutLoc', {
                                    rules: [
                                        { required: true, message: intl.get("PLACEHOLDER_ENTER") + 'Out Location!' },
                                    ],
                                    initialValue: this.state.locationOut
                                })(
                                    //<Input placeholder="" size="large"
                                    //    disabled={false}
                                    // value={this.state.locationOut} 
                                    ///>
                                    <Select
                                        // value={this.state.reserveLocationMkt}
                                        onChange={this.handleLocOutChoice.bind(this)}
                                    >
                                        <Option value="081">{intl.get("PLACEHOLDER_DSCODE")}/81</Option>
                                        <Option value={this.props.mkt}>{intl.get("PLACEHOLDER_TSCODE")}/{this.props.mkt}</Option>
                                    </Select>
                                )}
                            </FormItem>
                            {this.props.paravalue == undefined || this.props.paravalue == 0 ?  null: 
                            <FormItem
                                label="送貨區域"
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 15 }}
                            >
                                <Select
                                    style = {{width: '70%', float:'left'}}
                                    onChange = {this.regionListChange}
                                    value = {this.state.showReceiverStreet}
                                    //receiverStreet 街道id
                                >
                                    {this.state.regionList.map(v => <Option  key = {v.csdrrid} value = {v.csdrrid}>{v.RuleRegionName}</Option>)}
                                </Select>
                                <Select
                                    style = {{width: '25%', float:'right'}}
                                    onChange = {this.regionInfoChange}
                                    value = {this.state.receiverDistrict}
                                    //receiverDistrict区域id
                                >
                                    {this.state.regionInfo.map(v => <Option  key = {v.regionId} value = {v.regionId}>{v.regionName}</Option>)}
                                </Select>
                            </FormItem>
                            }
                            <FormItem
                                label={intl.get("PLACEHOLDER_CUSTNAME")/*顾客姓名*/}
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 15 }}
                            >
                                <Input placeholder="" size="large"
                                    onChange={this.handleCusNamChange.bind(this)}
                                    onBlur={this.handleCusNamBlur.bind(this)}
                                    defaultValue={!!this.state.customName ? this.state.customName : ''} />
                            </FormItem>
                            <FormItem
                                label={intl.get("PLACEHOLDER_TELNUM")/*联络电话*/}
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 15 }}
                            >
                                <Input placeholder="" size="large"
                                    onChange={this.handleTelChange.bind(this)}
                                    onBlur={this.handleTelBlur.bind(this)}
                                    defaultValue={!!this.state.telephone ? this.state.telephone : ''} />
                            </FormItem>
                            <FormItem
                                label={intl.get("PLACEHOLDER_OTHERTEL")/*其它联络电话*/}
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 15 }}
                            >
                                <Input placeholder="" size="large"
                                    onChange={this.handleOthTelChange.bind(this)}
                                    onBlur={this.handleOthTelBlur.bind(this)}
                                    defaultValue={!!this.state.otherTelephone ? this.state.otherTelephone : ''} />
                            </FormItem>
                            <FormItem
                                label={intl.get("PLACEHOLDER_CUSTADDRESS")/*送货地址*/}
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 15 }}
                            >
                                {/* <Input placeholder="" size="large"
                                    onChange={this.handleCusAddrChange.bind(this)}
                                    onBlur={this.handleCusAddrBlur.bind(this)}
                                    defaultValue={!!this.state.address ? this.state.address : ''} /> */}
                                <Input.TextArea
                                placeholder="" 
                                size="large"
                                onChange={this.handleCusAddrChange.bind(this)}
                                onBlur={this.handleCusAddrBlur.bind(this)}
                                defaultValue={!!this.state.address ? this.state.address : ''}
                                autosize={{ minRows: 3 }}
                             />
                            </FormItem>
                            <div style={{ width: "100%", float: "right" }}>
                                <Button type="primary" onClick = {this.handleSubmit}  style={{ marginLeft: '10px', float: "right" }}>{intl.get("BTN_CONFIRM")/*确定*/}</Button>
                                <Button onClick={this.handleCancel} style={{ float: "right" }}>{intl.get("BACKTRACK")/*返回*/}</Button>
                            </div>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                label=""
                                labelCol={{ span: 0 }}
                                wrapperCol={{ span: 24 }}
                            >
                            {this.props.paravalue == undefined || this.props.paravalue == 0 ?  
                                <RadioGroup name="deliveryDateShortCut"
                                    onChange={this.handleDateClick.bind(this)}>
                                    <ul className='dateShortcut'>
                                        {dsItems}
                                    </ul>
                                </RadioGroup> : 
                                    <table className="table">
                                    <thead>
                                    <tr>
                                        <th>選擇日期</th>
                                        {/* <th>可選時段</th> */}
                                        <th>Quota配額</th>
                                    </tr>
                                    </thead>
                                        <tbody>
                                            {
                                                this.state.showList.map((item, idx) => 
                                                {   
                                                    return (
                                                    <tr key = {idx}>
                                                        <td>
                                                            {item.name === 'other' ? 
                                                            <DatePicker
                                                                showToday = {false}
                                                                value={!!this.state.regionDate ? (moment(this.state.regionDate, 'YYYY-MM-DD')) : null}
                                                                style = {{lineHeight: '78.4px', width: '130px'}}
                                                                placeholder = ''
                                                                format = 'YYYY-MM-DD'
                                                                disabledDate={(dt) => {
                                                                    let xz = new Date();
                                                                    let res = dt < moment(xz).add(2, 'days')
                                                                    return res;
                                                                }}
                                                                onChange={this.changeRegionDate}
                                                            />: 
                                                            <div className = 'showDate'  onClick = {() => {this.showDateClick(item)}} style = {item.date == this.state.strDate && item.isChoose ? {background: '#dddddd'} : null}>
                                                                <div>{`${item.name}(${item.day})`}</div>
                                                                <div>{item.date}</div>
                                                            </div>
                                                        } 
                                                        </td>
                                                        {/* <td>
                                                            {JSON.stringify(this.state.regionObject) !=='{}' && 
                                                            item.key !== 'others' ? 
                                                            this.state.regionObject[item.key].map( (v, idx)=> 
                                                                <div key = {idx} style = {`${v.timeRangeCode}${v.strDate}` == this.state.chooseKey ? {background: '#dddddd'} : null} onClick = {() => {this.chooseDate(v, item.key, `${v.timeRangeCode}${v.strDate}`)}}>{`${v.timeRangeName} ${v.startTime}-${v.endTime}`}</div>
                                                            ): this.state.chooseDateList.map((value, index) => 
                                                                <div key = {index}  style = {`${value.timeRangeCode}${value.strDate}` == this.state.chooseKey  ? {background: '#dddddd'} : null} onClick = {() => {this.chooseDate(value, item.key, `${value.timeRangeCode}${value.strDate}`)}}>{`${value.timeRangeName} ${value.startTime}-${value.endTime}`}</div>
                                                            )
                                                            }
                                                        </td> */}
                                                        <td>
                                                            {JSON.stringify(this.state.regionObject) !=='{}' && 
                                                            item.key !== 'others' ? 
                                                            this.state.regionObject[item.key].map( (v, idx) => 
                                                                <div key ={idx}>{v.avaliableQuota}</div>
                                                            ): this.state.chooseDateList.map((value, index) => 
                                                                <div  key = {index}>{value.avaliableQuota}</div>
                                                            )
                                                            }
                                                        </td>
                                                    </tr>
                                                    )
                                                }
                                                )
                                            }
                                        </tbody>
                                </table>
                            }
                            </FormItem>
                        </Col>
                    </Form>
                </Row>
            </Modal>
        )
    }
}

export default Form.create()(DeliveryModal)
