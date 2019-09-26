/**
 * Created by Administrator on 2018/5/24.
 */
import React, { Component } from 'react';
import intl from 'react-intl-universal';
import NumberKeypad from '@/common/components/numberKeypad/index.js';
import { Form, Modal, Input, Button, Row, Alert, Switch, Icon } from 'antd';
import message from '@/common/components/message';
import withKeyBoard from '@/common/components/keyBoard';
import Confirm from '@/common/components/confirm';
const FormItem = Form.Item;

//商品明细
class EditGood extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isPublicPrescription: false,
            replaceFlag: false,
            name: 'price',
        };
        this.editList = ['price', 'discounts', 'rebate'];
    }

    componentDidMount() {
        if(this.props.keyControl) {
            this.props.bind({
                //pageUP
                "33": () => {
                    
                },
                //pageDown
                "34": () => {
                },
                //end
                "35": () => {
                    this.props.onCancel();
                },
                //home
                "36": () => {
                    this.handleOk(this.state.name)
                },
                //左箭头
                "37": () => {
                },
                //上箭头
                "38": () => {
                    // let index = this.editList.indexOf(this.state.name);
                    // if(index === 0) {
                    //     index = this.editList.length - 1;
                    // } else {
                    //     index -= 1;
                    // }
                    // this.props.form.getFieldInstance(this.editList[index]).focus();
                    // this.props.form.setFieldsValue({[this.editList[index]]: ''})
                    // this.setState({
                    //     name: this.editList[index]
                    // })
                },
                //右键头
                "39": () => {
                },
                //下箭头
                "40":  () => {
                    // let index = this.editList.indexOf(this.state.name);
                    // if(index === this.editList.length - 1) {
                    //     index = 0;
                    // } else {
                    //     index += 1;
                    // }
                    // this.props.form.getFieldInstance(this.editList[index]).focus();
                    // this.props.form.setFieldsValue({[this.editList[index]]: ''});
                    // this.setState({
                    //     name: this.editList[index]
                    // })
                },
                //f1
                "112": () => {
                    // this.props.form.getFieldInstance('price').focus();
                    // this.props.form.setFieldsValue({price: ''});
                    // this.setState({
                    //     name: 'price'
                    // })
                    this.inputFocus('price')
                },
                //f2
                "113": () => {
                    // this.props.form.getFieldInstance('discounts').focus();
                    // this.props.form.setFieldsValue({discounts: ''});
                    // this.setState({
                    //     name: 'discounts'
                    // })
                    this.inputFocus('discounts')
                },
                //f3
                "114": () => {
                    // this.props.form.getFieldInstance('rebate').focus();
                    // this.props.form.setFieldsValue({rebate: ''});
                    // this.setState({
                    //     name: 'rebate'
                    // })
                    this.inputFocus('rebate')
                },
                //f4
                "115": this.changeRedemption
            });
        }
    }

    componentWillMount() {
    }

    componentWillReceiveProps(nextProps) {
        if(this.props.visible === true && nextProps.visible === false ) {
            this.setState({replaceFlag: false})
        }
    }

    componentWillUnmount() {
        document.getElementById('codeInput').focus();
    }

    inputFocus = (name) => {
        const actions = () => {
            this.props.form.getFieldInstance(name).focus();
            this.props.form.setFieldsValue({[name]: ''});
            this.setState({
                name
            })
        }
        //刷卡授权
        switch (name) {
            case 'price':
                if(this.props.posrole.privgj === 'Y') {
                    actions(name);
                    return;
                }
                break;
            default:
                if(this.props.posrole.privdpzkl > 0) {
                    actions(name);
                    return;
                }
                break;
        }
        React.accredit(posrole => {
            let flag = false;
            if(name === 'price') {
                if(posrole.privgj === 'Y') {
                    flag = true;
                }
            } else {
                if(posrole.privdpzkl > 0) {
                    flag = true;
                }
            }
            if (flag) {
                actions(name);
            } else {
                message(intl.get("INFO_AUTHFAIL"))   //'授权失败：无此权限'
            }
        }, null, {flowNo: this.props.flow_no})
    }

    inputClick = (name, top, left) => {
        //刷卡授权
        switch (name) {
            case 'price':
                if(this.props.posrole.privgj === 'Y') {
                    this.openKeypad(name, top, left);
                    return;
                }
                break;
            default:
                if(this.props.posrole.privdpzkl > 0) {
                    this.openKeypad(name, top, left);
                    return;
                }
                break;
        }
        React.accredit(posrole => {
            let flag = false;
            if(name === 'price') {
                if(posrole.privgj === 'Y') {
                    flag = true;
                }
            } else {
                if(posrole.privdpzkl > 0) {
                    flag = true;
                }
            }
            if (flag) {
                this.openKeypad(name, top, left);
            } else {
                message(intl.get("INFO_AUTHFAIL"))   //'授权失败：无此权限'
            }
        }, null, {flowNo: this.props.flow_no})
    }

    openKeypad = (name, top, left) => {
        const {setFieldsValue, getFieldValue} = this.props.form;
        let keyboard = [];
        switch (name) {
            case 'qty':
                keyboard = [     //可选的键盘
                    {name: `${intl.get("MODIFY_NUM")}10`, value: "10"},
                    {name: `${intl.get("MODIFY_NUM")}15`, value: "15"},
                    {name: `${intl.get("MODIFY_NUM")}20`, value: "20"},
                    {name: `${intl.get("MODIFY_NUM")}25`, value: "25"},
                    {name: `${intl.get("MODIFY_NUM")}30`, value: "30"},
                    {name: `${intl.get("MODIFY_NUM")}35`, value: "35"},
                    {name: `${intl.get("MODIFY_NUM")}40`, value: "40"},
                    {name: `${intl.get("MODIFY_NUM")}45`, value: "45"},
                ];
                break;
            case 'discounts':
                keyboard = [     //可选的键盘
                    {name: "5%", value: "5"},
                    {name: "10%", value: "10"},
                    {name: "15%", value: "15"},
                    {name: "20%", value: "20"},
                    {name: "25%", value: "25"},
                    {name: "30%", value: "30"},
                    {name: "40%", value: "40"},
                    {name: "50%", value: "50"},
                ];
                break;
            case 'rebate':
                keyboard = [     //可选的键盘
                    {name: "10", value: "10"},
                    {name: "20", value: "20"},
                    {name: "30", value: "30"},
                    {name: "50", value: "50"},
                    {name: "80", value: "80"},
                    {name: "100", value: "100"},
                    {name: "150", value: "150"},
                    {name: "200", value: "200"},
                ];
                break;
            case 'price':
                keyboard = null;
                break;
            default :
                break;
        }
        NumberKeypad.open({
            top: top,
            left: left || 94,
            keyboard: keyboard,
            maskClosable: false,
            onInput: (value, isReset) => {
                let _value = getFieldValue(name);
                if(isReset || !_value) {
                    setFieldsValue({[name]: value});
                } else {
                    if(this.state.replaceFlag !== true) {
                        setFieldsValue({[name]: value});
                    } else {
                        setFieldsValue({[name]: _value + value});
                    }
                }
                this.setState({replaceFlag: true});
            },
            onBack: () => {
                let value = getFieldValue(name) + '';
                setFieldsValue({[name]: value.substring(0, value.length-1)});
                this.setState({replaceFlag: true});
            },
            onClear: () => {
                setFieldsValue({[name]: ''});
                this.setState({replaceFlag: true});
            },
            onCancel: () => {
                this.recoverValue(name);
                this.setState({replaceFlag: false});
            },
            onOk: () => this.handleOk(name),
        })
    }

    handleOk = (name) => {
        const { getFieldValue} = this.props.form;
        if(getFieldValue(name) === "") {
            message(intl.get("INFO_NOTEMPTY")); //'输入内同不允许为空！'
            return false;
        }
        if(getFieldValue(name) === "0" && name === 'qty') {
            message(intl.get("INFO_QTYZO"));  //'数量不允许为0'
            return false;
        }
        if(name === 'price') {
            const unitprice = this.props.goodInfo.listPrice;
            const { privqtje1, privqtje2 } = this.props.posrole;
            let _price = getFieldValue(name);
            if(_price === "0"/* && this.props.octozz !== 'Y10' && this.props.octozz !== 'Y11'*/) {
                message(intl.get("INFO_PRICEZO"));    //'价格不允许为0'
                return false;
            }
            if(!/(^\d+$)|(^0+\.\d{1,2}$)|(^[1-9]\d*(\.\d{1,2})?$)/.test(_price)  ||
                _price * 1 > this.props.syspara.maxSaleGoodsMoney) {
                message(intl.get("INFO_TIP9", {max:this.props.syspara.maxSaleGoodsMoney}));
                //'请输入正确格式价格,且价格不超过max'
                return false;
            }
            if(unitprice !== 0 && (_price*1 >= unitprice*privqtje2/100 || _price*1 <= unitprice*privqtje1/100)) {
                const _this = this;
                Confirm({
                    className: "vla-confirm vla-message-id",
                    title: '注意！',
                    content: `請檢查已輸入之金額 $${_price} 是否正確`,
                    okText: '正確',
                    cancelText: '重新輸入',
                    onOk() {
                        _this.props.onOk(name, _price).then(res => {
                            if(res) {

                            } else {

                            }
                            _this.recoverValue(name);
                            _this.setState({replaceFlag: false})
                            NumberKeypad.close();
                            return true;
                        })

                    },
                    onCancel() {
                        _this.setState({replaceFlag: false});
                    },
                });
                return false;
            }
        }
        /*if(!/^((0\.\d{1,2})||([1-9]\d{0,2}(\.\d{1,2})?))$/.test(getFieldValue(name))
                && name === 'qty') {
            message('数量最大值不能超过999.99, 小数点后不超过两位！');
            return false;
        }*/
        if(name === 'discounts' && this.props.goodInfo.tempZrDiscount !== 0) {
            message(intl.get("INFO_CNOTZK")); //'商品已折让，不能进行折扣！'
            return false;
        }
        if(name === 'rebate' && this.props.goodInfo.tempZkDiscount !== 0) {
            message(intl.get("INFO_CNOTZR"));   //'商品已折扣，不能进行折让！'
            return false;
        }
        return Promise.resolve(
            this.props.onOk(name, getFieldValue(name)).then(res => {
                // if(res) {
                //     //this.closeModal();
                //     //return true;
                // } else {
                //     //return false;
                    
                // }
                this.recoverValue(name);
                this.setState({replaceFlag: false})
                return true;
            })
        );
    }

    //将输入框内容替换成初始值
    recoverValue = (name) => {
        const {setFieldsValue} = this.props.form;
        switch (name) {
            case 'discounts':
                //setFieldsValue({ discounts: parseInt((this.props.goodInfo.tempZkDiscount/this.props.goodInfo.total)*100) || 0} );
                setFieldsValue({ discounts: (100 - this.props.goodInfo.tempZkl) || 0} );
                break;
            case 'rebate':
                setFieldsValue({ rebate: this.props.goodInfo.tempZrDiscount});
                break;
            case 'price':
                setFieldsValue({ price: this.props.goodInfo.salePrice});
                break;
            default :
                setFieldsValue({ [name] : this.props.goodInfo[name]});
                break;
        }
    }

    closeModal = () => {
       /* this.props.form.setFieldsValue({
            discounts: '',
            rebate: '',
            qty: '',
        });*/
        this.props.form.resetFields();
        this.props.onCancel();
    }

    //公立价
    changePublic = (checked) => {
        this.setState({isPublicPrescription: checked})
        this.props.onOk('publicPrescription', checked, this.props.goodInfo.qty)
    }

    changeRedemption = (checked) => {
        this.props.onOk('redemption', checked, this.props.goodInfo.qty)
    }

    render() {
        const { visible, goodInfo, posrole, octozz, keyControl} = this.props;
        const { getFieldDecorator } = this.props.form;
        const privdpzkl = (posrole && posrole.privdpzkl) || 0;
        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 15},
        };
        const Layout = {
            labelCol: {span: 10},
            wrapperCol: {span: 12},
        };
        return (
            <Modal className="presale_edit_good"
                   width={518}
                   title={intl.get("MODIFY_GOODS")}  //"修改商品"
                   visible={visible}
                   style={{top: 30}}
                   footer={
                        <Button type="primary" onClick={this.closeModal}>{intl.get("BTN_CONFIRM")}</Button>
                   }
                   //afterClose={() => {document.getElementById('codeInput').focus()}}
                   destroyOnClose={true}
                >
                {/*<Alert message={`该商品大折扣率为${privdpzkl}，最大折让金额为${(1-privdpzkl)*goodInfo.total || ""}`}
                       type="warning" />*/}
                {/*<Icon type="close" onClick = {this.closeModal}/>*/}
                <Form>
                    <Row>
                        <FormItem label={intl.get("MODIFY_NUMBER")} {...formItemLayout}>
                            <span>{goodInfo.goodsCode}</span>
                        </FormItem>
                    </Row>
                    <Row>
                        <FormItem label={intl.get("MODIFY_NAME")} {...formItemLayout}>
                            <span>{goodInfo.goodsName}</span>
                        </FormItem>
                    </Row>
                    <Row>
                        <FormItem label={intl.get("MODIFY_NUM")}  {...formItemLayout} required={false}>
                            {/*getFieldDecorator('qty', {initialValue: goodInfo.qty})(
                                <Input onFocus={(e) => this.openKeypad('qty', e.target.getBoundingClientRect().top + e.target.clientHeight)}/>
                            )*/}
                            <span>{goodInfo.qty}</span>
                        </FormItem>
                    </Row>
                    <Row>
                        <FormItem label={intl.get("MODIFY_PRICE")} {...formItemLayout}>
                            {getFieldDecorator('price', {initialValue: goodInfo.salePrice})(
                                <Input 
                                    autoFocus={false && keyControl && this.state.name === 'price'}
                                    onClick={(e) => this.inputClick('price', e.target.getBoundingClientRect().top + e.target.clientHeight, 13)}
                                    onBlur={() => this.recoverValue('price')}/>
                            )}
                        </FormItem>
                    </Row>
                    {octozz !== 'Y10' && octozz !== 'Y11' &&
                    <Row>
                        <FormItem label={intl.get("MODIFY_DISCOUNTZK")} {...formItemLayout} required={false}>
                            {getFieldDecorator('discounts',
                                {initialValue: (100 - this.props.goodInfo.tempZkl) || 0})(
                                <Input addonAfter="%"
                                       onClick={(e) => this.inputClick('discounts', e.target.getBoundingClientRect().top + e.target.clientHeight)}
                                       onBlur={() => this.recoverValue('discounts')}/>
                            )}
                        </FormItem>
                    </Row>}
                    {octozz !== 'Y10' && octozz !== 'Y11' &&
                    <Row>
                        <FormItem label={intl.get("MODIFY_DISCOUNTZR")} {...formItemLayout} required={false}>
                            {getFieldDecorator('rebate', {initialValue: goodInfo.tempZrDiscount})(
                                <Input onClick={(e) => this.inputClick('rebate', e.target.getBoundingClientRect().top + e.target.clientHeight)}
                                       onBlur={() => this.recoverValue('rebate')}/>
                            )}
                        </FormItem>
                    </Row>}
                    {false && this.props.initialState.data.syjmain[0].privqt2 === 'Y' &&
                        octozz !== 'Y10' && octozz !== 'Y11' ?
                    <Row>
                        <FormItem label={intl.get("MODIFY_DRUG")} {...Layout} required={false}>
                            <Switch checkedChildren="是" unCheckedChildren="否"  onChange = {this.changePublic} checked = {goodInfo.isPublicPrescription === 'Y' ? true : false}/>
                        </FormItem>
                    </Row> : null}
                {(goodInfo.flag === '1' || goodInfo.flag === '7') && octozz !== 'Y10' && octozz !== 'Y11' ?
                    <Row>
                         <FormItem label={intl.get("MODIFY_JFHG")} {...Layout} required={false}>
                              <Switch checkedChildren="是" unCheckedChildren="否"
                                      onChange = {this.changeRedemption}
                                      checked = {goodInfo.flag === '7' ? true : false}/>
                         </FormItem>
                    </Row> : null}
                </Form>
            </Modal>
        );
    }
}

export default withKeyBoard(Form.create()(EditGood));
