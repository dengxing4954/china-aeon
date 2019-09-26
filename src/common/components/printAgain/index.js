import React, {Component} from 'react';
import './style/PrintAgainModal.less'
import PrintAgainModal from './views/PrintAgainModal';

export default class PrintAgain extends Component {

    static defaultProps = {
        billList: [],
    }
    render() {
        let {visible, billList, getBillDetail, loseBill} = this.props;
        return <PrintAgainModal  {...this.props}/>
    }
}