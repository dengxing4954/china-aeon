import React, {Component} from 'react';
import {Row, Col, Layout, List, Icon} from 'antd';
const {Header, Content, Footer} = Layout;

//无状态组件
class InvoiceLeft extends Component {
    componentDidMount() {

    }

    componentWillUnmount() {

    }

    render() {
        const {goodsList, zdyftotal, zdsjtotal, zddsctotal, vip_name, vip_no, fphm, mkt, operators, type, syspara, switchEng, intl, delGoods, cardNo, staffType} = this.props;
        return (
            <div className="cash_payleft">
                <Layout className="layout">
                    <div className="header">
                        <p className="syy"><span>{intl("SALES_CASHIER")+"："}</span>{operators}</p>
                        <div>
                            {cardNo?  <div className="hy">
                                <p>{staffType ==="2"?"親屬卡購物卡號":"員工購物卡號"}</p>
                                <p>NO.{cardNo}</p>
                            </div>: <div className="hy">
                                <p>{intl("AMC_CARD")}</p>
                                <p>NO.{vip_no}</p>
                            </div>}

                        <div className="invoice_le_reload"
                             onClick={this.props.repullSale}>
                            <Icon type="sync"/>
                        </div>
                            </div>
                    </div>
                    <Content className="con">
                        <List
                            split={false}
                            className="goodslist"
                            dataSource={goodsList}
                            renderItem={item => (
                                <List.Item key={item.id} style={{position:"relative"}}>
                                    {/*{item.goodsType == "99" ? <div className="del"><Icon type="close" onClick={() => delGoods(item.guid, item.barcode)}/></div> : null}*/}
                                    <List.Item.Meta
                                        title={<p className="bold">{item.goodsno || item.incode}</p>}
                                        description={switchEng? item.engname:item.fname}
                                    />
                                    <div>
                                        <p className="bold right">x {parseInt(item.qty * 10000) / 10000}&nbsp;&nbsp;{syspara.bbcodeHBFH[1] + (item.barcode==='12952701'?item.total.toFixed(1):item.total.toFixed(2))}</p>
                                        <p className="bold right" style={{color:'#BE4C94'}}>-{syspara.bbcodeHBFH[1]+parseFloat(item.dsctotal).toFixed(2)}</p>
                                    </div>
                                </List.Item>
                            )}
                        >
                        </List>
                    </Content>
                    <Footer className="fdtl">
                        <Row>
                            <Col span={12} className="left">
                                <p>{intl("PAY_NUMBER")+"："+fphm}</p>
                                <p><span>{intl("STORE_NUMBER")+"："}</span>{mkt}</p>
                                <p><span>{intl("TOTAL_COST")+"："}</span>{syspara.bbcodeHBFH[1]+parseFloat(zdsjtotal).toFixed(2)}</p>
                                <p><span>{intl("TOTAL_DISCOUNT")+"："}</span>-{syspara.bbcodeHBFH[1]+parseFloat(zddsctotal).toFixed(2)}</p>
                            </Col>
                            <Col span={12} className="right">
                                <p><b>{syspara.bbcodeHBFH[1]+parseFloat(zdyftotal).toFixed(2)}</b></p>
                                <p>{type == "4"? "应退金额" : intl("RECEIVABLE_AMOUNT")}</p>
                            </Col>
                        </Row>
                    </Footer>
                </Layout>
            </div>
        );
    }

}

export default InvoiceLeft;