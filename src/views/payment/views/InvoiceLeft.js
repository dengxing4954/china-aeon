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
        const {goodsList, zdyftotal, zdsjtotal, zddsctotal, vip_name, pageChange, vip_no, fphm, oldFphm, mkt, operators, orderType, syspara, switchEng, intl, delGoods, cardNo, staffType, syjh, pagination} = this.props;
        let showFphm = oldFphm !== '' ? oldFphm : fphm;
        return (
            <div className="cash_payleft">
                <Layout className="layout">
                    <div className="header">
                        <p className="syy">
                        <span style = {{marginRight: '20px'}}>{intl("SALES_CASHIER")+"："}{operators}</span>
                        <span>{'收银机号' + "："}{syjh}</span>
                        </p>
                        <div>
                            {cardNo?  <div className="hy">
                                <p>{staffType ==="2"?"亲属卡购物卡号":"员工购物卡号"}</p>
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
                            pagination = {pagination}
                            onChange = {pageChange}
                            renderItem={item => (
                                <List.Item key={item.id} style={{position:"relative"}}>
                                    {/*{item.goodsType == "99" ? <div className="del"><Icon type="close" onClick={() => delGoods(item.guid, item.barcode)}/></div> : null}*/}
                                    <List.Item.Meta
                                        title={<p className="bold">{item.goodsCode || item.goodsNo}</p>}
                                        description={switchEng? item.goodsName:item.goodsName}
                                    />
                                    <div>
                                        <p className="bold right">x {parseInt(item.qty * 10000) / 10000}&nbsp;&nbsp;{syspara.bbcodeHBFH[1] + (item.goodsCode==='12952701'?item.salePrice.toFixed(1):item.salePrice.toFixed(2))}</p>
                                        <p className="bold right discount" >-{syspara.bbcodeHBFH[1]+parseFloat(item.totalDiscountValue).toFixed(2)}</p>
                                    </div>
                                </List.Item>
                            )}
                        >
                        </List>
                    </Content>
                    <Footer className="fdtl">
                        <Row>
                            <Col span={12} className="left">
                                <p>{intl("PAY_NUMBER")+"："+showFphm}</p>
                                <p><span>{intl("STORE_NUMBER")+"："}</span>{mkt}</p>
                                <p><span>{intl("TOTAL_COST")+"："}</span>{syspara.bbcodeHBFH[1]+parseFloat(zdyftotal).toFixed(2)}</p>
                                <p><span>{intl("TOTAL_DISCOUNT")+"："}</span>-{syspara.bbcodeHBFH[1]+parseFloat(zddsctotal).toFixed(2)}</p>
                            </Col>
                            <Col span={12} className="right">
                                <p><b>{syspara.bbcodeHBFH[1]+parseFloat(zdsjtotal).toFixed(2)}</b></p>
                                <p>{orderType == "4" || orderType == "2" ? "应退金额" : intl("RECEIVABLE_AMOUNT")}</p>
                            </Col>
                        </Row>
                    </Footer>
                </Layout>
            </div>
        );
    }

}

export default InvoiceLeft;