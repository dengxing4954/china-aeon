/**
 * Created by Administrator on 2018/5/24.
 */
import './style/NumberCount.less'
import React, { Component } from 'react';
import { Icon } from 'antd';
import message from '@/common/components/message';
import intl from 'react-intl-universal';

//商品明细
class NumberCount extends Component {

    static defaultProps = {
        num: 1,
        min: 1,
    };

    componentDidMount() {
    }

    componentWillReceiveProps(nextProps) {

    }

    componentWillMount() {
    }

    handleCount = (type) => {
        let num = this.props.num;
        if (type === '-') {
            if (this.props.num <= this.props.min) {
                message(intl.get("INFO_NUMCOUNTMIN"))
                return false;
            }
            num--;
        }
        if (type === '+') {
            if(this.props.max && num + 1 > this.props.max) {
                message(intl.get("INFO_NUMCOUNTMAX", {max: this.props.max}))
                return false;
            }
            num++;
        }
        //this.setState({ num })
        if (this.props.callback) {
            this.props.callback(num);
        }
    }

    onNumClick = () => {
        if(this.props.onNumClick) {
            this.props.onNumClick();
        }
    }

    render() {
        const {visibility, num} = this.props;
        return (
            <div className="number_count">
                <Icon style={{ visibility: visibility ? "hidden" : "visible" }} type="minus" onClick={() => this.handleCount('-')} />
                <span onClick={this.onNumClick}>{num}</span>
                <Icon style={{ visibility: visibility ? "hidden" : "visible" }} type="plus" onClick={() => this.handleCount('+')} />
            </div>
        );
    }
}

export default NumberCount;
