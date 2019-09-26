import React, { Component } from 'react';
import { Icon } from 'antd';
import withKeyBoard from '@/common/components/keyBoard';

class Home extends Component {
    constructor(porps) {
        super(porps);
        this.state = {
            proX: 0,
            proY: 0
        }
    }

    componentDidMount() {
        this.props.bind({
            "33": () => {
                this.props.clickTabs(true, this.props.tabIndex - 1);
                this.setState({ proX: 0, proY: 0 });
            },
            "34": () => {
                this.props.clickTabs(false, this.props.tabIndex + 1);
                this.setState({ proX: 0, proY: 0 });
            },
            "36": () => {
                this.props.clickIcon(this.props.list[this.props.tabIndex][this.state.proY][this.state.proX]);
            },
            "37": () => {
                this.setState({ proX: this.state.proX - 1 < 0 ? this.props.list[this.props.tabIndex][this.state.proY].length - 1 : this.state.proX - 1 });
            },
            "38": () => {
                this.setState({ proY: this.state.proY - 1 < 0 ? this.props.list[this.props.tabIndex].length - 1 : this.state.proY - 1 });
            },
            "39": () => {
                this.setState({ proX: (this.state.proX + 1) % this.props.list[this.props.tabIndex][this.state.proY].length });
            },
            "40": () => {
                this.setState({ proY: (this.state.proY + 1) % this.props.list[this.props.tabIndex].length });
            }
        });
    }

    styleFill = (length) => {
        let fill = [];
        for (let i = 0, len = 4 - length; i < len; i++) {
            fill.push(<li style={{ width: 120 }} key={i + 4}></li>);
        }
        return fill;
    }

    render() {
        let { list, tabIndex, clickTabs, cls, handleAnimationEnd, clickIcon, tipBl } = this.props;
        return (
            <div className="main">
                <div className="menu_head">
                    <embed src={require('@/common/image/logo.png')} />
                    <div className={'menu_online_' + this.props.onlineModel}></div>
                    {
                        tipBl ? <p className="syncTip"><Icon
                            type="info-circle" style={{ marginRight: 12 }} />{'有文件需要同步上传！'}</p> : null
                    }
                </div>
                <div className="menu_content">
                    <div className="menu_arrow"
                        onClick={() => {
                            this.setState({ proX: 0, proY: 0 });
                            clickTabs(true, tabIndex - 1);
                        }}>
                        <img src={require("@/common/image/nav_arrow_left.png")}
                            alt="" />
                    </div>
                    <div className={'menuItme   ' + cls}
                        onAnimationEnd={handleAnimationEnd}>
                        {
                            list[tabIndex].map((series, index) =>
                                <ul key={index}>
                                    {
                                        series.map((item, key) =>
                                            <li key={key} className={this.state.proY == index && this.state.proX == key ? 'home_menu_selected' : null}>
                                                <a onClick={() => clickIcon(item)}>
                                                    <img
                                                        src={require("@/" + item.img)}
                                                        alt="" />
                                                </a>
                                                <div className="solid_line" />
                                                <div
                                                    className="describe">{item.dsc}</div>
                                            </li>
                                        )
                                    }
                                    {this.styleFill(series.length)}
                                </ul>
                            )
                        }
                    </div>
                    <div className="menu_arrow"
                        onClick={() => {
                            this.setState({ proX: 0, proY: 0 });
                            clickTabs(false, tabIndex + 1);
                        }}>
                        <img src={require("@/common/image/nav_arrow_right.png")}
                            alt="" />
                    </div>
                </div>
                <div className="menu_foot">
                    <ul>
                        {
                            list.map((item, key) =>
                                <li style={{ backgroundColor: tabIndex === key ? '#000' : '#fff' }}
                                    onClick={tabIndex !== key ? () => {
                                        this.setState({ proX: 0, proY: 0 });
                                        clickTabs(true, key);
                                    } : () => {}} key={key} />
                            )
                        }
                    </ul>
                </div>
            </div>
        )
    }
}

export default withKeyBoard(Home);