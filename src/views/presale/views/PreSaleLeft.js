import React, { Component } from 'react';
import NumberCount from '@/common/components/numberCount/index.js';
import { Button, Icon, Modal, Menu, Dropdown, Pagination } from 'antd';
import RechargeKeypad from '@/common/components/rechargeKeypad/index.js';
import intl from 'react-intl-universal';

const editIcon = require('@/common/image/edit.png');
const delIcon = require('@/common/image/delete.png');

class PreSaleLeft extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
    }

    componentWillMount() {
    }

    editGood = (index) => {
        this.props.handleEditGoods(index);
    }

    //antd的table组件的index是当前页的，需要转换成dataSource的index
    calculateDataIndex = (index) => {
        const { pageSize, current } = this.props.pagination;
        return pageSize * (current - 1) + index
    }

    onNumClick = (item, index) => {
        RechargeKeypad.open({
            title: intl.get("INFO_CHANGEQTY"), //"修改商品数量",
            placeholder: intl.get("PLACEHOLDER_NUM"),    //"请输入商品数量",
            errMessage: intl.get("INFO_QTYMAX"),    //"请输入1~99999之间的整数"
            rule: (num) => {
                /*if (/^((0\.\d{1,2})||([1-9]\d{0,2}(\.\d{1,2})?))$/.test(num)) {
                    return true;
                }*/
                if (/^([1-9]\d{0,4})$/.test(num)) {
                    return true;
                }
                return false;
            },
            keyboard: [     //可选的键盘
                { name: "10", value: "10" },
                { name: "15", value: "15" },
                { name: "20", value: "20" },
                { name: "50", value: "50" },
            ],
            callback: (value) => this.props.editGoods('qty', value, item, index)
        })
    }

    onDeliveryCancel = () => {
        this.props.onDeliveryCancel();
    }

    renderGoodsList = () => {

        let { goodsList, switchEng, octozz, disabled, delGoods, editGoods, pagination } = this.props;
        let { current, pageSize } = pagination;

        let startIndex = (current - 1) * pageSize;
        let endIndex = startIndex + pageSize;
        let showGoodsList = goodsList.slice(startIndex, endIndex);
        for (let i = 0; i < showGoodsList.length; i++) {
            if (i === 1) {
                showGoodsList[i].daogouyuan = '李四';
            }
            if (i === 3) {
                showGoodsList[i].daogouyuan = '张三';
            }
        }

        let goodsList1 = showGoodsList.filter(item => item.daogouyuan === undefined);
        let goodsList2 = showGoodsList.filter(item => item.daogouyuan !== undefined && item.daogouyuan !== '');
        let resultGoodsList = [...goodsList1, ...goodsList2];

        return resultGoodsList.map((item, index) => {
            console.log('map', item)
            let prevItem = {};
            if (index !== 0) {
                prevItem = showGoodsList[index];
            }
            console.log("item", index, prevItem)
            return (
                <React.Fragment key={item.goodsCode + '-' + index}>
                    {
                        item.daogouyuan ? <p>导购员：{item.daogouyuan}</p> :
                            index <= goodsList1.length && index !== 0 ? null : <p>无导购员</p>
                    }
                    < li className={index === (showGoodsList.length - 1) ? 'last-goods' : ''} >
                        <div>
                            <p>{item.goodsCode}</p>
                            <p>{switchEng ? item.engname : item.goodsName}</p>
                            <p>{index % 2 === 0 ? '促销很优惠' : ''}</p>
                        </div>
                        <div>
                            {(disabled || ((octozz === 'Y10' || octozz === 'Y11' || octozz === 'Y19') && item.barcode !== '665')) ? <span>{item.qty}</span> :
                                <NumberCount num={item.qty}
                                    max={99999}
                                    onNumClick={() => this.onNumClick(item, index)}
                                    callback={(qty) => editGoods('qty', qty, item, index)} />
                            }
                        </div>
                        <div>
                            {item.salePrice}
                        </div>
                        <div>{item.totalDiscountValue}</div>
                        <div>{item.saleAmount}</div>
                        <div className="option-btn">
                            <img src={editIcon} alt="" onClick={() => { this.editGood(index) }} />
                            <img src={delIcon} alt="" onClick={() => { delGoods(item, index) }} />
                        </div>
                    </li>
                </React.Fragment >

            )
        })
    }

    getItemHeight = (item) => {
        if (item) {
            return parseFloat(
                window.getComputedStyle(item, null).height
            );
        }

    }

    autoScroller = (goodsLength) => {
        if (goodsLength) {
            if (!!this.goodsListContainer) {
                let lastItemHeight = this.getItemHeight(this.goodsListContainer.lastElementChild);
                if (goodsLength > 5) {
                    this.goodsListContainer.scrollBy(0, lastItemHeight * (goodsLength - 5));
                }
            }
        }

    }

    render() {
        const { goodsList, totalData, delGoods, editGoods, pagination, chooseList,
            chooseModal, disabled, onPageChange, onSubmit, onCancel, onGoodsChoose, posrole,
            switchEng, initialState, flow_no, djlb, syspara, octozz, editModalVisible } = this.props;
        const { editIndex } = this.state;
        const columns = [{
            // title: intl.get("GOODS_ITEM"), //'商品信息',
            title: '商品信息',
            dataIndex: 'item',
            key: 'item',
            //width: 167,
            width: 247,
            className: 'info_column',
            render: (text, record, index) => {
                const menu = (
                    <Menu className="presale_pop_dropdowm">
                        {record.pop_details && record.pop_details.map((item, index) =>
                            <Menu.Item key={index}>
                                <span style={{ fontSize: 16 }}>
                                    {`${item.pop_describe}(${item.staDate || " "}~${item.endDate || " "})`}
                                </span>
                            </Menu.Item>
                        )}
                    </Menu>
                );
                return (
                    <div style={{/*paddingLeft: disabled ? 5 : 28 */ paddingLeft: 10 }}>
                        <div style={{ lineHeight: '22px' }}>{`${record.goodsCode}（${record.artCode}）`}</div>
                        {switchEng ?
                            <div className="info_name"
                                style={{ fontSize: record.engname && record.engname.length > 20 ? '14px' : '16px' }}>
                                {record.engname || ''}
                            </div> :
                            <div className="info_name"
                                style={{ fontSize: record.goodsName && record.goodsName.length > 10 ? '14px' : '16px' }}>
                                {record.goodsName || ''}
                            </div>
                        }
                        <div className="info_discount" style={{ lineHeight: '22px' }}>
                            {`${intl.get("GOODS_FAVORABLE")}：${(record.totalDiscountValue * 1).toFixed(2)}`}
                        </div>
                        <div className="pop_details">
                            {record.pop_details && record.pop_details.length > 0 &&
                                (record.pop_details.length > 1 ?
                                    <Dropdown overlay={menu} trigger={['click']}
                                        placement={index === pagination.pageSize - 1 ? "topLeft" : "bottomLeft"}>
                                        <span>
                                            {`${record.pop_details[0].pop_describe}(${record.pop_details[0].staDate || " "}~${record.pop_details[0].endDate || " "})`}
                                            <Icon style={{ marginLeft: 10 }} type="down-circle-o" />
                                        </span>
                                    </Dropdown> :
                                    <span>{`${record.pop_details[0].pop_describe}(${record.pop_details[0].staDate || " "}~${record.pop_details[0].endDate || " "})`}</span>)
                            }
                        </div>
                    </div>
                )
            }
        }, {
            // title: intl.get("GOODS_NUM"),    //'数量'
            title: '件数',
            dataIndex: 'qty',
            key: 'qty',
            width: 140,
            align: 'center',
            className: 'qty_column',
            render: (text, record, index) => disabled || ((octozz === 'Y10' || octozz === 'Y11' || octozz === 'Y19') && record.barcode !== '665') ?
                <span>{text}</span> :
                <NumberCount num={text}
                    max={99999}
                    onNumClick={() => this.onNumClick(record, this.calculateDataIndex(index))}
                    callback={(qty) => editGoods('qty', qty, record, this.calculateDataIndex(index))} />
        }, {
            // title: intl.get("GOODS_PRICE"), //'单价',
            title: '单价',
            dataIndex: 'salePrice',
            key: 'salePrice',
            //width: 90,
            width: 100,
            align: 'center',
            render: (text, record) =>
                <span>{record.goodsCode === "12952701" ? (text * 1).toFixed(1) : (text * 1).toFixed(2)}</span>
        }, {
            title: '折价',
            dataIndex: 'totalDiscountValue',
            key: 'totalDiscountValue',
            width: 100,
            align: 'right',
            render: (text) =>
                <span>{(text * 1).toFixed(2)}</span>
        }, {
            // title: intl.get("GOODS_TOTALPRICE"), //'总价',
            title: '总计',
            dataIndex: 'saleAmount',
            key: 'saleAmount',
            //width: 100,
            width: 110,
            align: 'center',
            className: 'edit_column',
            render: (text, record, index) =>
                <div>
                    {disabled ?
                        null :
                        <div className="info_column_actions">
                            {record.goodsCode === '665' || (octozz !== 'Y10' && octozz !== 'Y11' && octozz !== 'Y19') ?
                                <Icon type="delete"
                                    onClick={() => delGoods(record, this.calculateDataIndex(index))} /> : null}
                            {record.goodsCode !== '665' && octozz !== 'Y10' && octozz !== 'Y11' && octozz !== 'Y19' ?
                                <Icon type="edit"
                                    onClick={() => this.editGood(this.calculateDataIndex(index))} /> : null}
                        </div>
                    }
                    <span>{record.goodsCode === "12952701" ? (text * 1).toFixed(1) : (text * 1).toFixed(2)}</span>
                </div>
        }];
        return (
            <div className={`presale_le ${djlb === 'Y7' ? 'presale_le_practice' : ''}`}>
                <div className="presale_le_table">

                    <div className="presale_goods_container_header">
                        <ul>
                            <li>商品信息</li>
                            <li>件数</li>
                            <li>单价</li>
                            <li>折价</li>
                            <li>总计</li>
                        </ul>
                    </div>
                    <div className="presale_goods_container_body">
                        <ul ref={ul => {
                            this.goodsListContainer = ul;
                        }}>
                            {
                                this.renderGoodsList()
                            }
                        </ul>
                        {
                            goodsList.length > pagination.pageSize ?
                                <div className="goods_list_pagination">
                                    <Pagination current={pagination.current} pageSize={pagination.pageSize} onChange={(pageNo) => onPageChange({ current: pageNo, pageSize: pagination.pageSize })} total={goodsList.length} />
                                </div> : null
                        }

                    </div>
                    {/** 
                    <Table rowKey="guid"
                        size="small"
                        pagination={goodsList.length > pagination.pageSize ? pagination : false}
                        columns={columns}
                        dataSource={goodsList}
                        rowClassName={(record, index) =>
                            this.calculateDataIndex(index) === this.props.selectedGoods ? "new_row" : ""}
                        onChange={(e) => { onPageChange(e) }} />*/}
                </div>
                <div className="presale_le_del_goods">
                    <div><span>负</span></div>
                    <div>
                        <p></p>
                        <p></p>
                    </div>
                    <div><span></span></div>
                    <div><span></span></div>
                    <div><span></span></div>
                    <div><span></span></div>
                </div>
                <div className="presale_le_foot">
                    <div className="presale_footer_left">
                        <div>
                            件数：{totalData.num}
                        </div>
                        <div className="presale_footer_money">
                            <div>小计：￥{totalData.price.toFixed(2)}</div>
                            <div>暂收款：￥{totalData.totalPrice.toFixed(2)}</div>
                        </div>
                    </div>
                    <div className="presale_footer_right">
                        <Button type="primary"
                            className={goodsList.length === 0 ? "disabled" : ""}
                            onClick={onSubmit}>{this.props.scanWindow ? "提交" : "付款"}</Button>
                    </div>
                    {/** 
                    <div className="presale_le_total">
                        <span>{`${intl.get("TOTAL_AMOUNT")}：${totalData.num}`}</span>
                        <span>{`${intl.get("TOTAL_COST")}：${totalData.price.toFixed(2)}`}</span>
                        <span>{`${intl.get("TOTAL_DISCOUNT")}：${totalData.discounts.toFixed(2)}`}</span>
                    </div>
                    <div className="presale_le_button">
                        <Button type="primary"
                                className={goodsList.length === 0 ? "disabled" : "" }
                            onClick={onSubmit}>{this.props.scanWindow ? "提交" : "付款"}</Button>
                    </div>
                    <div className="presale_le_money">
                        <span>{intl.get("RECEIVABLE_AMOUNT")}</span>
                        <span>{totalData.totalPrice.toFixed(2) + ""}</span>
                    </div>
                    */}
                </div>
                <Modal visible={chooseModal}
                    width={700}
                    title={
                        <div>
                            <span>{intl.get("INFO_INSELECTGOODS")}</span>
                            <Icon type="close" onClick={() => onGoodsChoose(false)} />
                        </div>}
                    wrapClassName='presale_choose_goods'
                    footer={null}>
                    <table>
                        <thead className="ant-table-thead">
                            <tr>
                                <th>{intl.get("PRODUCT_NAME")}</th>
                                <th>{intl.get("RETURNGOODS_BARCODE")}</th>
                                <th>{intl.get("SCAN_GOODSCODE")}</th>
                                <th>{intl.get("PRICE")}</th>
                            </tr>
                        </thead>
                        <tbody className="ant-table-tbody">
                            {chooseList.map((item, index) =>
                                <tr key={index} onClick={() => onGoodsChoose(item)}>
                                    <td>{item.goodsName}</td>
                                    <td>{item.barNo}</td>
                                    <td>{item.goodsCode}</td>
                                    <td>{item.salePrice || item.price}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </Modal>
            </div>
        );
    }
}

export default PreSaleLeft;
