import React, { Component } from 'react';
import Displayline from './displayline';
import EventEmitter from '@/eventemitter/';
import '../style/displayline.less';
import '../style/displaylineTwo.less';
import '../style/displaylinePay.less';
import { connect } from "react-redux";


//有状态组件
class DisplaylineService extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isDisplayline: '1',
            order: {},
        }
    }
    componentDidMount() {
        EventEmitter.on("dlWindow", (data) => {
            console.log(data);
            this.setState((state, props) => ({
                isDisplayline: data.optionType ? data.optionType : '1',
                order: data.order ? data.order : {}
            }))
        });
    }

    shouldComponentUpdate(nextProps, nextState) {
        let prevState = this.state;
        if (JSON.stringify(prevState) !== JSON.stringify(nextState)) {
            return true;
        }
        return false;
    }

    componentWillUnmount() {
        this.setState({
            isDisplayline: '1',
            order: {}
        })
    }

    render() {
        return (
            <div className={"displayline"}>
                <Displayline initialState={this.props.initialState} isDisplayline={this.state.isDisplayline} order={this.state.order}></Displayline>
            </div>
        );
    }
}
const mapStateToProps = (state) => {
    console.log("displayline", state)
    return {
        initialState: state.initialize,
    };
};
const mapDispatchToProps = (dispatch) => {
    return {

    }
};
export default connect(mapStateToProps, mapDispatchToProps)(DisplaylineService);
