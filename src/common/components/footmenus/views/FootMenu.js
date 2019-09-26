import React, { Component } from 'react';

//无状态组件
class FootMenu extends Component {
    componentDidMount() {

    }

    componentWillUnmount() {

    }

    render() {
        return (
            <div className="footer">
                <ul>
                    <li><img src={require('@/common/image/logo_footer.png')} alt="" /></li>
                    <li>订单号：No：6688228</li>
                    <li>|</li>
                    <li>命令号：41</li>
                    <li>请求耗时：88ms</li>
                </ul>
                <p className="footer_date">2018</p>
            </div>
        );
    }

}
export default FootMenu;