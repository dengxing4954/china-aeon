/**
 * Created by Administrator on 2018/5/24.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'antd';

const leftArrowActiveIcon = require('@/common/image/left-arrow-active.png');
const leftArrowDisabledIcon = require('@/common/image/left-arrow-disabled.png');
const rightArrowActiveIcon = require('@/common/image/right-arrow-active.png');
const rigthArrowDisabledIcon = require('@/common/image/right-arrow-disabled.png');

//商品明细
class TagSelect extends Component {

    static propTypes = {
        defaultNum: PropTypes.number,
        callback: PropTypes.func
    };

    static defaultProps = {
        dataList: [],
        pageSize: 0
    };

    constructor(props) {
        super(props);
        this.state = {
            page: 1,
        };
    }

    componentDidMount() {
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.dataList !== nextProps.dataList && this.state.page !== 1) {
            this.setState({ page: 1 })
        }
    }

    componentWillMount() {

    }

    handlePageChange = (type) => {
        let { dataList, pageSize } = this.props;
        let { page } = this.state;
        let totalPage = Math.ceil(dataList.length / (pageSize - 1));
        if ((type === 'left' && page === 1) || (type === 'right' && page === totalPage)) {
            return false;
        }
        if (type === 'left') {
            page--;
        } else if (type === 'right') {
            page++;
        }
        this.setState({ page })
    }

    showDataList = () => {
        const { page } = this.state;
        const { dataList, pageSize } = this.props;
        if (dataList.length <= pageSize) {
            return dataList;
        } else {
            return dataList.slice((page - 1) * (pageSize - 1), page * (pageSize - 1));
        }
    }

    strCut = function (str, max_length) {
        let m = 0,
            str_return = '';
        let a = str.split("");
        for (let i = 0; i < a.length; i++) {
            if (/^[\u0000-\u00ff]$/.test(a[i])) {
                m++;
            } else {
                m += 2;
            }
            if (m > max_length) {
                break;
            }
            str_return += a[i];
        }
        return str_return;
    }

    renderPageChange = (dataList, pageSize) => {
        let num = Math.ceil(dataList.length / (pageSize));
        console.log('分页', num)
        let arr = [];
        for (let i = 0; i < num; i++) {
            let _class = '';
            if ((i + 1) === this.state.page) {
                _class = 'selected';
            }
            let s = '<span class="' + _class + '"></span>'
            arr.push(s);
        }
        return arr.join('');
    }

    render() {
        const { page } = this.state;
        const { dataList, pageSize, className, onClickLabel, type, selectId } = this.props;
        const totalPage = Math.ceil(dataList.length / (pageSize - 1));
        return (
            <div className={`presale_tags ${className}`}>
                <ul>
                    {
                        type === "brands" ?
                            this.showDataList().map((item, index) =>
                                <li key={index}
                                    /*key={item.stallCode}*/
                                    /*style={{fontSize: item.stallName.length > 7 ? '16px': '18px'}}*/
                                    className={`presale_tags_brands ${item.stallCode === selectId ? "presale_tag_selected" : ""}`}
                                    onClick={() => onClickLabel(item.stallCode, index)}>
                                    {/*this.strCut(item.goodDisplayType || '', 28)*/}
                                    {item.goodDisplayType && item.goodDisplayType.indexOf('/n') !== -1 ?
                                        item.goodDisplayType.split('/n').map((_item, index) =>
                                            <span key={index}>{this.strCut(_item || '', 14)}</span>
                                        ) : this.strCut(item.goodDisplayType || '', 28)
                                    }
                                </li>
                            ) :
                            this.showDataList().map((item, index) =>
                                <li key={index}
                                    className={`presale_tags_brands ${this.props.checkSelectedGoods(item.barNo || item.goodsCode) ? "selected" : ""}`}
                                    /*key={item.barNo}*/
                                    /*style={{fontSize: item.goodsName.length > 7 ? '16px': '18px'}}*/
                                    /*className={item.barNo === selectId ? "presale_tag_selected" : ""}*/
                                    onClick={() => onClickLabel(item.barNo || item.goodsCode || '')}>
                                    {item.goodsName && item.goodsName.indexOf('/n') !== -1 ?
                                        item.goodsName.split('/n').map((_item, index) =>
                                            <span key={index}>{this.strCut(_item || '', 14)}</span>
                                        ) :
                                        <React.Fragment>
                                            <span>{this.strCut(item.goodsName || '', 28)}</span>
                                            <span className="price_tag">{item.salePrice}</span>
                                        </React.Fragment>
                                    }

                                </li>
                            )
                    }
                    {dataList.length > pageSize ?
                        <li className="presale_tags_arrow">
                            <div>
                                <img src={page === 1 ? leftArrowDisabledIcon : leftArrowActiveIcon} alt="" onClick={() => this.handlePageChange('left')} />
                            </div>
                            <div>
                                <img src={page === totalPage ? rigthArrowDisabledIcon : rightArrowActiveIcon} alt="" onClick={() => this.handlePageChange('right')} />
                            </div>
                        </li> : null}
                </ul>
                {
                    type === 'kinds' && dataList.length > pageSize ?
                        <div ref={(div) => { this.pagetip = div }} className="presale-kinds-page-tip" dangerouslySetInnerHTML={{ __html: this.renderPageChange(dataList, pageSize) }}>
                        </div>
                        : null
                }
            </div>
        );
    }
}

export default TagSelect;
