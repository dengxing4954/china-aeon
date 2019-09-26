/**
 * Created by Administrator on 2018/5/24.
 */
import React, { Component } from 'react';
import { Modal, Button, Icon, Row, Col, Checkbox, Input } from 'antd';
import message from '@/common/components/message';
import intl from 'react-intl-universal';
import withKeyBoard from '@/common/components/keyBoard';

class ExpandList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            expanded: false
        };
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    expand = () => {
        this.props.onExpand();
    }

    render() {
        const { children, expandContent, expanded } = this.props;
        return (
             <div className="expand_list">
                 {children}
                 <Icon type={expanded ? "up-circle-o" : "down-circle-o"}
                       onClick={this.expand}/>
                 {expanded ?
                 <div className="expand_content">
                     <Row className='expand_detail expand_detail_title'>
                         <Col span={8}>{intl.get("GOODS_ITEM")}</Col>
                         <Col span={4}>{intl.get("GOODS_NUM")}</Col>
                         <Col span={4}>{intl.get("GOODS_PRICE")}</Col>
                         <Col span={4}>{intl.get("GOODS_FAVORABLE")}</Col>
                         <Col span={4}>{intl.get("GOODS_TOTALPRICE")}</Col>
                     </Row>
                     {expandContent && expandContent.map(item =>
                         <Row className='expand_detail' key={item.guid}>
                             <Col span={8}>{item.goodsName}</Col>
                             <Col span={4}>{item.qty}</Col>
                             <Col span={4}>{item.salePrice.toFixed(2)}</Col>
                             <Col span={4}>{item.totalDiscountValue.toFixed(2)}</Col>
                             <Col span={4}>{item.saleAmount.toFixed(2)}</Col>
                         </Row>
                     )}
                 </div> : null }
             </div>
        );
    }
}

//商品明细
class SearchBill extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selection: [],
            details: {},
            expands: [],
            inputValue: '',
            keyIndex: 0,
        };
    }

    componentDidMount() {
        if(this.props.keyControl) {
            this.props.bind({
                //pageUP
                "33": () => {
                    const boxEle = this.refs.searchBillTable;
                    boxEle.scrollTop -= 50;
                },
                //pageDown
                "34": () => {
                    const boxEle = this.refs.searchBillTable;
                    boxEle.scrollTop += 50;
                },
                //end
                "35": () => {
                    
                },
                //home
                "36": () => {
                },
                //左箭头
                "37": () => {
                    
                },
                //上箭头
                "38": () => {
                    if(this.state.keyIndex > 0 ) {
                        let index = this.state.keyIndex - 1;
                        this.setState({keyIndex: index});
                    }
                },
                //右键头
                "39": () => {
                },
                //下箭头
                "40":  () => {
                    if(this.state.keyIndex < this.props.billList.length - 1 ) {
                        let index = this.state.keyIndex + 1;
                        this.setState({keyIndex: index});
                    }
                },
                //f1
                "112": () => {
                    const bill = this.props.billList[this.state.keyIndex];
                    if(this.state.selection.indexOf(bill) !== -1) {
                        this.selectBill(false, bill);
                    } else {
                        this.selectBill(true, bill);
                    }
                },
                //f2
                "113": () => {
                    this.selectAll();
                },
                //f3
                "114": () => {
                    this.refs.serchBillInput.focus();
                },
                //f4
                "115": () => {
                    this.setState({keyIndex: 0})
                    this.refs.searchBillTable.scrollTop = 0;
                },
                //f5
                "116": () => {
                    const bill = this.props.billList[this.state.keyIndex];
                    if(bill) this.onExpand(bill.no);
                },
                //f6
                "117": this.deleteBill,
                //f7
                "118": this.cancel,
                //f8
                "119": this.unlockBill,
            });
        }
    }

    componentWillMount() {
    }

    componentWillReceiveProps(nextProps) {
        /*console.log(111111);
        if(this.props.visible === false && nextProps.visible === true ) {
            //this.refs.billInput.focus();
            setTimeout(console.log(this.refs), 1000)
            //console.log(this.refs);
            console.log(document.getElementById('billInput'));
        }
        if(this.props.visible === true && nextProps.visible === false ) {

        }*/
    }

    unlockBillFn = (flowNo, data) => {
        const {details} = this.state;
        let unlockBillAction = () => {
            this.props.updateFPHM(flowNo).then(res => {
                if(res) {
                    if(!details[flowNo]) {
                        this.props.getBillDetail(flowNo).then(res => {
                            if(res.order.goodsList) {
                                //this.setState({selection: [], expands: []});
                                this.props.callback('unlock', data, res.order);
                            }
                        })
                    } else {
                        //this.setState({selection: [], expands: []});
                        this.props.callback('unlock', data, details[flowNo]);
                    }
                } else {
                    return false;
                }
            })
        }
        if(this.props.posrole.putbillqx === 'Y' || this.props.posrole.putbillqx ==='B') {
            unlockBillAction();
            return true;
        }
        React.accredit(posrole => {
            if (posrole.putbillqx === 'Y' || posrole.putbillqx ==='B') {
                unlockBillAction();
            } else {
                message(intl.get("INFO_AUTHFAIL"))   //'授权失败：无此权限'
            }
        })
    }

    unlockBill = () => {
        const {selection} = this.state;
        if (selection.length === 0 ) {
            message(intl.get("INFO_INFOSELECTOR"))    //'请选择单据'
            return false;
        }
        if (selection.length > 1 ) {
            message(intl.get("INFO_MUSTSELECTO"))    //'只能选择一条单据进行解挂'
            return false;
        }
        this.unlockBillFn(selection[0].no, selection);
    }

    selectBill = (checked, item) => {
        console.log(checked);
        let selection = [...this.state.selection];
        if (checked) {
            selection.push(item);
        } else {
            let index = selection.indexOf(item);
            selection.splice(index, 1);
        }
        this.setState({selection});
    }

    selectAll = () => {
        if (this.state.selection.length !== this.props.billList.length) {
            this.setState({
                selection : this.props.billList
            });
        } else {
            this.setState({
                selection : []
            });
        }
    }

    deleteBill = () => {
        if(this.state.selection.length === 0) {
            message(intl.get("INFO_INFOSLECTO"));      //'请选择订单！'
            return;
        }
        this.props.callback('delete', this.state.selection);
        //this.setState({selection: [], expands: []})
    }

    cancel = () => {
        this.props.callback('cancel');
        //this.setState({ selection: [], expands: [] });
    }

    onExpand = (flow_no) => {
        let {details, expands} = this.state;
        if(expands.indexOf(flow_no) !== -1) {
            expands.splice(expands.indexOf(flow_no), 1);
            this.setState({expands});
        } else {
            if (!details[flow_no]) {
                this.props.getBillDetail(flow_no).then(res => {
                    console.log(res);
                    if(res && res.order) {
                        details[flow_no] = res.order;
                        expands.push(flow_no);
                        this.setState({details, expands});
                    }
                })
            } else {
                expands.push(flow_no);
                this.setState({expands});
            }
        }
        return false;
    }

    onInputChange = (e) => {
        this.setState({inputValue: e.target.value})
    }

    onInputKeyDown = (e) => {
        if(e.keyCode === 13) {
            const {inputValue} = this.state;
            let bill = null;
            bill = this.props.billList.find(item => item.no === inputValue);
            if(bill) {
                this.unlockBillFn(inputValue, [bill]);
                /*this.props.updateFPHM(bill.no).then(res => {
                    if(res) {
                        this.props.getBillDetail(inputValue).then(res => {
                            if(res.goodlist) {
                                this.props.callback('unlock', [bill], res);
                                this.setState({selection: [], expands: [], inputValue: ''});
                            }
                        })
                    } else {
                        this.setState({inputValue: ''});
                    }
                })*/
            } else {
                message(intl.get("INFO_NOTFIND")) //'找不到单据！'
            }
            this.setState({inputValue: ''});
        }
    }

    afterClose = () => {
        this.setState({
            selection: [],
            expands: [],
            inputValue: '',
        })
        document.getElementById('codeInput').focus();
    }

    render() {
        const { billList, visible, keyControl } = this.props;
        const { selection, details, expands, inputValue, keyIndex } = this.state;
        return (
            <Modal className="presale_search_bill"
                   width={834}
                   style={{ top: 60 }}
                   title={
                        <div>
                            <span>{intl.get("MENU_TAKEOUT")}</span>
                        </div>
                   }
                   visible={visible}
                   footer={
                        <div>
                            <Col span={8} className="del_col">
                                <Button onClick={this.deleteBill}>
                                    <Icon type="delete" />
                                    <span>{intl.get("BTN_DELETE")}</span>
                                </Button>
                            </Col>
                            <Col span={16}>
                                <Button className="cancel_button"
                                        onClick={this.cancel}>取消</Button>
                                <Button type="primary" onClick={this.unlockBill}>{intl.get("BTN_CONFIRM")}</Button>
                            </Col>
                        </div>
                   }
                   afterClose={this.afterClose}
                   destroyOnClose={true}
                >
                <Row className="scan_bill">
                    <span>{intl.get("TAKEOUT_SACN")}：</span>
                    <Input ref = "serchBillInput"
                           value={inputValue}
                           autoFocus={true}
                           onChange={this.onInputChange}
                           onKeyDown={this.onInputKeyDown}/>
                </Row>
                <div className="content">
                    <Row className="table_head"
                         onClick={this.selectAll}>
                        <Col span={2}>
                            <Checkbox checked={selection.length === billList.length}
                                      onClick={(e) => e.stopPropagation()}></Checkbox>
                        </Col>
                        <Col span={2}>{intl.get("TAKEOUT_SERIAL_NUMBER")}</Col>
                        <Col span={3}>{intl.get("TAKEOUT_TIME")}</Col>
                        <Col span={17}>{intl.get("TAKEOUT_FLOW_NO")}</Col>
                    </Row>
                    <div ref="searchBillTable" name="searchBillTable" className="table_body">
                        {billList.map((item, index) =>
                                <ExpandList key={item.no}
                                            expanded={expands.indexOf(item.no) !== -1 ? true: false}
                                            expandContent={details[item.no] && details[item.no].goodsList}
                                            onExpand={() =>{this.onExpand(item.no)}}>
                                    <Row key={index}
                                         className={`${selection.indexOf(item) !== -1 ? 'selected' : ''} ${keyIndex === index && keyControl ? 'hovered' : ''}`}
                                         onClick={() => this.selectBill(selection.indexOf(item) === -1, item)}>
                                        <Col span={2}>
                                            <Checkbox checked={selection.indexOf(item) !== -1 }
                                                      onClick={(e) => e.stopPropagation()}></Checkbox>
                                        </Col>
                                        <Col span={2}>{index + 1}</Col>
                                        <Col span={3}>{item.time}</Col>
                                        <Col span={17}>{item.no}</Col>
                                    </Row>
                                </ExpandList>
                        )}
                    </div>
                </div>
            </Modal>
        );
    }
}

export default withKeyBoard(SearchBill);
