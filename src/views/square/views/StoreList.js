import React, { Component } from 'react';
import {Row, Col} from 'antd';

class StoreList extends Component {


    constructor(props){
        super(props);
        this.state = {
            current: 1, //当前页码
            pageSize:8, //每页显示的条数
            totalPage:0,//总页数
            goValue: 0,//要去的条数
            indexList:[],
            num: 0 ,
            selectId:'',
            storename: [
                {id:0,store:'烧味'},
                {id:1,store:'梅光轩'},
                {id:2,store:'CONA CONA'},
                {id:3,store:'老上海食府'},
                {id:4,store:'京东食堂'},
                {id:5,store:'NAGAYO'},
                {id:6,store:'烧味'},
                {id:7,store:'吃'},
                {id:8,store:'NAGAYO'},
                {id:9,store:'烧味'},
                // {id:10,store:'吃'},
                // {id:11,store:'吃'},
                // {id:12,store:'吃'},
                ]
        };
    }

    componentWillMount(){
        // //设置总页数
        this.setState({
            totalPage:Math.ceil( this.props.brandsData.length/this.state.pageSize),
        })
        this.pageNext(this.state.goValue)
    }

    lastpage = ()=>{
        if(this.state.current>1){
            this.setState({
                current: this.state.current-1,
                num:this.state.num - this.state.pageSize,
            },function (){
                this.pageNext(this.state.num);
            })
        }
    }

    nextpage = ()=>{
        if(this.state.current>=this.state.totalPage){
            this.setState({
                current: this.state.totalPage,
            },function(){
                this.pageNext(this.state.num);
            })
        }else if(this.state.current>0){
            this.setState({
                current: this.state.current+1,
                num:this.state.num + this.state.pageSize,
            },function(){
                this.pageNext(this.state.num);
            })
        }
    }

    strCut = function (str, max_length) {
        let m = 0,
            str_return = '';
        let a = str.split("");
        for (let i = 0; i < a.length; i++) {
            if (/^[\u0000-\u00ff]$/.test(a[i])) {
                m ++;
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
    
    setPage = (num)=>{
        this.setState({
            indexList:this.props.brandsData.slice(num,num+this.state.pageSize)
        })
    }

    pageNext = (num) =>{
        this.setPage(num)
    }

    render() {
        let{selectId, setBrandsId, brandsData, breadFlag}=this.props;
        return (
            <div className = {'square_store'}>
                {/*<Row type="flex" justify="start" className={'square_store_row'}>*/}
                    {/*{*/}
                        {/*this.state.indexList.map(*/}
                            {/*u=>*/}
                            {/*<Col className={'square_store_row_son'} span={6} key={u.siid}>*/}
                                {/*<div onClick={()=> {setBrandsId(u.siid)}}*/}
                                    {/*className = {u.siid === selectId ? 'square_store_row_box_change': 'square_store_row_box'}*/}
                                {/*>{u.stallName}</div>*/}
                            {/*</Col>*/}
                        {/*)*/}
                    {/*}*/}
                {/*</Row>*/}
                <div type="flex" justify="start" className={'square_store_row'}>
                    {
                         brandsData.map(
                            (u, idx)=>
                                <div className={'square_store_row_son'} key={idx} 
                                style = {u.siid === 'collapse' ? {position: 'absolute', bottom: '0px', right: '0.5%'} : null}>
                                    <div onClick={()=> {setBrandsId(u.siid)}}
                                         className = {u.siid === selectId ? 'square_store_row_box_change': 'square_store_row_box'}
                                    >
                                    {u.stallName && u.stallName.indexOf('/n') !== -1 ?
                                        u.stallName.split('/n').map((_item, index) =>
                                            <span key={index}>{this.strCut(_item || '', 14)}</span>
                                        ) : this.strCut(u.stallName || '', 28)
                                    }
                                    </div>
                                </div>
                        )
                    }
                </div>
                {/*<div className={'square_store_bt'}>*/}
                    {/*<div className={'square_store_bts'} onClick={this.lastpage}>*/}
                        {/*<div className={this.state.current ==1 ? 'square_store_bt_last_i_no':'square_store_bt_last_i'}*/}
                        {/*></div>*/}
                    {/*</div>*/}
                    {/*<div className={'square_store_bt_num'}>*/}
                        {/*{this.state.current}/{this.state.totalPage}*/}
                    {/*</div>*/}
                    {/*<div className={'square_store_bts'} onClick={this.nextpage}>*/}
                        {/*<div className={this.state.current == this.state.totalPage ? 'square_store_bt_next_i_no' : 'square_store_bt_next_i'}></div>*/}
                    {/*</div>*/}
                {/*</div>*/}
            </div>


        )
    }
}

export default StoreList