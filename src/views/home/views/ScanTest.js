import React, { Component } from 'react';
import '../style/sacntest.less'
import moment from 'moment';
import NumberKeypad from '@/common/components/numberKeypad/index.js';
import { Modal ,Button, Icon} from 'antd';
import intl from 'react-intl-universal';
import { Fetch } from '@/fetch/';
import Url from '@/config/url.js';
import message from '@/common/components/message';
import withKeyBoard from '@/common/components/keyBoard';

class ScanTest extends Component {

    barcodeChange = (e) => {
        e.preventDefault();
        this.setState({
            barcode: e.target.value
        })
    }
    setValue = (value) => {
        this.setState(value);
    }
    getGoods = () => {
        let req = {
            command_id: "REFCERTIFY",
            terminalOperator: this.props.operators.gh,//操作员号
            shopCode: this.props.initialState.mkt,
            terminalNo: this.props.initialState.syjh,
            terminalOperator: this.props.operators.gh,//营业员号
            barNo:this.state.barcode,
            entId: this.props.initialState.data.postime[0].entId || '0',//企业ID
            orgCode: this.props.initialState.data.syjgrouprange[0].sourceitem,//柜组号
            erpCode:this.props.initialState.jygs,
            precisionMode: this.props.initialState.data.syjmain[0].sswrfs,//价格精度,收银机精度
            channel: 'javapos'//渠道
        };
        Fetch(
            {
                url: Url.base_url,
                type: "POST",
                data: req
            }
        ).then(res => {
            if (res.returncode === '0') {
                let goods = this.state.goodsInfo;
                const {goodsList} = res.data;
                if(goodsList.length !== 0){
                    let cxxx = "";
                    if(goodsList[0].popDetails && goodsList[0].popDetails.length !== 0){
                        goodsList[0].popDetails.map((item)=>{
                            cxxx += item.popDescribe +" "
                        });
                    }
                    goodsList[0].cxxx = cxxx || '无';
                    //goodsList[0].hyPrice =  goodsList[0].unitprice -  goodsList[0].customDiscountValue;
                    goods.push(goodsList[0])
                }else{
                    message("查询商品列表为空")
                }
                this.setState({
                    goodsInfo: goods,
                    barcode: ''
                })
                document.getElementsByClassName("inp")[0].focus();
            } else {
                message(res.data)
            }
        }).catch(err => {
            throw new Error(err)
        })
        this.setState({ barcode: ''})
    }
    //打印商品
    goodsPrint=() =>{
        if(this.state.goodsInfo.length !== 0){
            // let ScannerPrintData = {
            //     Module: 'ScannerPrint',
            //     head: [{
            //         syjh: this.props.initialState.syjh,
            //         syyh: this.props.operators.gh || this.props.operators.cardno,//收银员
            //         mkt: this.props.initialState.mkt,//门店号
            //         printtype: "0", //0代表热敏打印，1代表平推
            //         rqsj: moment().format('DD/MM/YYYY HH:mm:ss'),//交易时间
            //     }],
            //     goods:this.state.goodsInfo
            // }
            // window.Print(ScannerPrintData);
            // console.log(ScannerPrintData)
            window.Print(this.state.goodsInfo, data => {
                console.log('scan test print return data:', data);
            })
            this.props.onCancel("scanModal");
            this.setState({
                goodsInfo: [],
            })
        }else{
            message("暂无打印数据，请先查询")
        }
    }

    onInputKeyDown = (e) => {
        if(e.keyCode === 13) {
            const {barcode} = this.state;
            this.getGoods()
        }
    }

    openKeypad = (name, left) => {
        NumberKeypad.open({
            top: 200,
            left: left,
            autoClose: true,
            onInput: (value) => {
                let _value = this.state[name];
                this.setState({
                    [name]: _value + value
                });
            },
            onBack: () => {
                let value = this.state[name];
                this.setState({
                    [name]: value.substring(0, value.length-1)
                });
            },
            onClear: () => {
                this.setState({
                    [name]: ''
                });
            },
            onCancel: () => {
                this.setState({
                    [name]: '',
                    //[name + 'Input']: false
                });
            },
            onOk: () => {
                if(this.state[name] === '') {
                    return false
                }
                return Promise.resolve(this.getGoods())
            },
        })
    }

    intlLocales = (key) => {
        return intl.get(key);
    }

    constructor(props) {
        super(props);
        this.state = {
            barcode: '', // 商品信息
            goodsInfo: []
        }
    }

    componentDidMount() {
        this.props.bind({
            "35": () => {
                this.props.onCancel("scanModal"); 
                this.setState({goodsInfo: [],})
            },
            "36": () => {
                this.getGoods();
            },
            //f1
            '112': () => {
                this.goodsPrint();
            },
        });
    }

    render() {
        let { visible, onCancel } = this.props;
        return (
            <Modal
                title={null}
                visible={visible}
                closable={false}
                maskClosable={false}
                footer={null}
                mask={true}
                zIndex={2}
                width={800}
                wrapClassName="vertical-center-modal"
                bodyStyle={{ margin: 0, padding: 0 }}
                destroyOnClose={true}
            >
                <div className="sacntest">
                    <div className="head">
                        扫描测试
                        <img src={require('@/common/image/paytk_close.png')} alt="" onClick={() => {onCancel("scanModal"); this.setState({goodsInfo: [],})}} />
                    </div>
                    <div className="content">
                        <div className="entry_data">
                            <input type="button" className="btn" value="查询" onClick={this.getGoods} style={{color:"white"}}/>
                            <div style = {{position: 'relative'}}>
                                <Icon type="search" style = {{position:'absolute', top:'11px', left:'25px', fontSize: '20px'}}
                                      onClick={() => this.openKeypad('barcode', 230)}/>
                                <input
                                    className="inp"
                                    name="barcode"
                                    autoFocus={true}
                                    placeholder={"请输入商品编码"}
                                    onChange={this.barcodeChange.bind(this)}
                                    value={this.state.barcode}
                                    onKeyDown={this.onInputKeyDown} />
                            </div>
                            <span>{this.intlLocales('SCAN_CODE')}</span>
                        </div>
                        <div className="title">
                            <table align="center">
                                <thead>
                                <tr>
                                    <th>编码</th>
                                    <th>条码</th>
                                    <th>商品名称</th>
                                    <th>会员价</th>
                                    <th>非会员价</th>
                                    <th>实际售价</th>
                                    <th>优惠</th>
                                </tr>
                                </thead>
                            </table>
                        </div>
                        <div className="list">
                            {
                                this.state.goodsInfo.length !== 0 ?
                                    <table className="table">
                                        <tbody>
                                        {
                                            this.state.goodsInfo.map((item, index) =>
                                                  <tr key={index}>
                                                      <td>{item.goodsCode}</td>
                                                      <td>{item.barNo}</td>
                                                      <td>{item.goodsName}</td>
                                                      <td>{item.memberPrice}</td>
                                                      <td>{item.salePrice}</td>
                                                      <td>{item.saleAmount}</td>
                                                      <td>{item.cxxx}</td>
                                                </tr>
                                            )
                                        }
                                        </tbody>
                                    </table> :
                                    <div className="tip">
                                        <div>暂无数据</div>
                                    </div>
                            }
                        </div>
                    </div>
                    <div className="foot">
                        {/* <Button onClick={this.goodsPrint} type="primary">打印数据</Button> */}
                    </div>
                </div>
            </Modal>
        )
    }
}

export default withKeyBoard(ScanTest);