import React, { Component } from 'react';
import {Row, Col} from 'antd';

class FoodList extends Component{

    componentWillMount(){
        // //设置总页数
        this.setState({
            totalPage:Math.ceil(this.props.kindsData.length/this.state.pageSize),
            current: 0
        })
        this.pageNext(this.state.goValue)
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.kindsData !== this.props.kindsData){
            this.setState({
                current: 1,
                indexList:nextProps.kindsData.slice(0,0+this.state.pageSize),
                totalPage:Math.ceil(nextProps.kindsData.length/this.state.pageSize), 
                num: 0
            }) 
        }else{
            this.setState({
                indexList:nextProps.kindsData.slice(this.state.num,this.state.num+this.state.pageSize),
                totalPage:Math.ceil(nextProps.kindsData.length/this.state.pageSize),                
            })
        }
    }

    constructor(props){
        super(props);
        this.state = {
            current: 0, //当前页码
            pageSize:12, //每页显示的条数
            totalPage:0,//总页数
            goValue: 0,//要去的条数
            indexList:[],
            num: 1 ,
        };
    }

    lastpage = ()=>{
        if(this.state.current>1){
            this.setState({
                current: this.state.current-1,
                num:this.state.num - this.state.pageSize,
            },function ( ) {
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

    setPage = (num)=>{
        this.setState({
            indexList:this.props.kindsData.slice(num,num+this.state.pageSize)
        })
    }

    pageNext = (num) =>{
        this.setPage(num)
    }

    render(){
        let{windowsControl, breadFlag} = this.props;
        return(
            <div className={'square_fstyle_f'}>
                <div className={'square_fstyle'}>
                    <div className={'square_fsytle_store'}>
                        <Row type="flex" justify="start" className={'square_fstyle_row'}>
                            {
                                this.state.indexList.map(
                                    u=>
                                        <Col className={'square_fstyle_row_son'} span={6} onClick={() => {this.props.setKindsId(u.barNo)}} key={u.barNo}>
                                            <div className={'square_fstyle_row_son_img'}>
                                                <img
                                                    className={'square_fstyle_row_son_img_goodsimg'}
                                                    src={`${this.props.imgURL}${u.imageUrl}`}
                                                    alt=""
                                                />
                                            </div>
                                            <div className={'square_fstyle_row_box'}>{this.props.switchEng  === true ? u.enFname : u.goodsName}</div>
                                        </Col>
                                )
                            } 
                        </Row>
                    </div>
                </div>
                <div className={'square_fstyle_bt'}>
                    <div className={'square_fstyle_bts'} onClick={this.lastpage}>
                        <div className={this.state.current <= 1  ? 'square_fstyle_bt_last_i_no':'square_fstyle_bt_last_i'}></div>
                    </div>
                    <div className={'square_fstyle_bt_num'}>{this.state.current}/{this.state.totalPage}</div>
                    <div className={'square_fstyle_bts'} onClick={this.nextpage}>
                        <div className={this.state.current == this.state.totalPage ?'square_fstyle_bt_next_i_no':'square_fstyle_bt_next_i'}></div>
                    </div>
                </div>
            </div>

        )
    }
}


export default FoodList