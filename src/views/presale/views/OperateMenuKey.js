import React, { Component } from 'react';
import withKeyBoard from '@/common/components/keyBoard';
import { Icon } from 'antd';
import intl from 'react-intl-universal';

class OperateMenu extends Component {
    constructor(props) {
        super(props);
        this.state = {
            menuList: [],
            menuListShow: [],
            selectedMenu: 0,
        };
    }

    componentDidMount() {
        //this.initMenuList(this.props.list);
        // let menuList = [];
        // try {
        //     //获取menuList
        //     menuList = this.props.menuFilter(this.props.menuList.presskeys.find(item => item.sale).sale);
        //     this.setState({ menuList })
        //     this.initMenuList(menuList);
        // } catch (err) {

        // }
        console.log(this.props.list.map((item, index) => ({ [index + 112]: () => this.props.onSelect(item.event) })))
        let bindObj = {
            ...this.props.defaultKeys,
            //end
            "35": this.props.onExit,
            //home
            "36": () => {
                if (this.props.list && this.props.list.length > 0) {
                    //this.props.onSelect(this.props.list[this.state.selectedMenu].event);
                    this.props.list[this.state.selectedMenu].event();
                }
            },
            //左箭头
            "37": this.handleKeyLeft,
            //上箭头
            "38": this.handleKeyUp,
            //右键头
            "39": this.handleKeyRight,
            //下箭头
            "40": this.handleKeyDown,
        }
        this.props.list.forEach((item, index) => {
            bindObj[index + 112] = () => item.event()
        });
        this.props.bind(bindObj);
    }

    componentWillMount() {
    }

    componentWillReceiveProps(nextProps) {
    }

    handleKeyLeft = () => {
        if (this.state.selectedMenu > 0) {
            this.setState({
                selectedMenu: this.state.selectedMenu - 1
            })
        }
    }

    handleKeyUp = () => {
        if (this.state.selectedMenu > this.props.rowQty - 1) {
            this.setState({
                selectedMenu: this.state.selectedMenu - this.props.rowQty
            })
        }
    }

    handleKeyRight = () => {
        if (this.state.selectedMenu < this.props.list.length - 1) {
            this.setState({
                selectedMenu: this.state.selectedMenu + 1
            })
        }
    }

    handleKeyDown = () => {
        if (this.state.selectedMenu < this.props.list.length - this.props.rowQty) {
            this.setState({
                selectedMenu: this.state.selectedMenu + this.props.rowQty
            })
        }
    }

    // handleKeySelect = () => {
    //     const {menuListShow, selectedMenu} = this.state;
    //     const code = menuListShow[selectedMenu].code;
    //     const menu = this.props.list.find(item => item.code === code);
    //     if(menu) {
    //         if(menu.code === 'more' || menu.code ==='collapse') {
    //             this.handleMenuList(menu.event);
    //         } else {
    //             this.props.menuEvents(menu.event);
    //         }
    //     }
    // }

    //菜单展开或收起
    // handleMenuList = (type) => {
    //     const { totalQty, rowQty } = this.props;
    //     let menuListShow = [];
    //     if (type === 'more') {
    //         const { menuList } = this.state;
    //         if (menuList.length % rowQty === 0 && menuList.length > totalQty - 1) {
    //             menuListShow = [...menuList, { code: 'blank' }, { code: 'collapse' }];
    //         } else {
    //             menuListShow = [...menuList, { code: 'collapse' }];
    //         }
    //     } else {
    //         menuListShow = [...this.state.menuListShow];
    //         menuListShow.splice(totalQty - 1, menuListShow.length - (totalQty - 1));
    //         menuListShow.push({ code: 'more' });
    //         this.setState({
    //             selectedMenu: this.state.totalQty - 1
    //         })
    //     }
    //     this.setState({ menuListShow }, () => {
    //         if (type === 'more') {
    //             const menuRef = this.refs.presale_menu;
    //             menuRef.scrollTop = menuRef.scrollHeight;
    //         }
    //     })
    // }

    // 初始化菜单列表
    // initMenuList = (menuList) => {
    //     const { totalQty } = this.props;
    //     let menuListShow = [...menuList];
    //     if (menuListShow.length > totalQty) {
    //         menuListShow.splice((totalQty - 1), menuListShow.length - (totalQty - 1))
    //         menuListShow.push({ code: 'more' })
    //     }
    //     this.setState({ menuListShow })
    // }

    //渲染菜单列表
    // handleMenuRender = (item) => {
    //     const { menuEvents, billList } = this.props;
    //     let renderDom = null;
    //     if(item.code === 'more') {
    //         renderDom =
    //             <div onClick={() => this.handleMenuList('more')}>
    //                 <i className="iconfont icon-gengduo"></i>
    //                 <p>更多</p>
    //             </div>
    //     } else if (item.code === 'collapse') {
    //         renderDom =
    //             <div onClick={() => this.handleMenuList('collapse')}>
    //                 <i className="iconfont icon-shouqi"></i>
    //                 <p>收起</p>
    //             </div>
    //     } else {
    //         renderDom =
    //         <div onClick={() => menuEvents(item.event)}>
    //             {item.icon ?
    //                 <Icon type={item.icon} /> : null
    //             }
    //             {item.badge && item.code == '204' && billList?
    //                 <span className="badge">{billList.length}</span> : null
    //             }
    //             {item.iconfont ?
    //                 <i className={`iconfont ${item.iconfont}`}></i> : null
    //             }
    //             <p>{item.name}</p>
    //         </div>
    //     }
    //     return renderDom;
    // }

    render() {
        const { rowQty, rowWidth, className, list } = this.props;
        return (
            <div className={className}
                style={{ width: rowQty * rowWidth }}>
                <div ref="presale_menu">
                    <ul>
                        {list.map((item, index) =>
                            <li key={index}
                                style={{ width: Math.floor(1 / rowQty * 100) + '%' }}
                                className={index === this.state.selectedMenu ? 'selected' : ''}>
                                {item.render()}
                            </li>
                        )}
                    </ul>
                </div>
                <div></div>
            </div >

        );
    }
}

export default withKeyBoard(OperateMenu);
