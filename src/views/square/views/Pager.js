import React, { Component } from 'react';
import {Modal, Button, Select, Input } from 'antd';
import NumberKeypad from '@/common/components/numberKeypad/index.js';
import message from '@/common/components/message';
import '../style/pager.less'

const Option = Select.Option;

class Pager extends Component { 

    state = {
        pagerNo: '',
        code: []
    }
     
    onChange = (e) => {
        e.preventDefault();
        this.setState({
            pagerNo: e.target.value
        });
    }

    openKeypad = (name, left) => {
        NumberKeypad.open({
            top: 270,
            left: left,
            autoClose: true,
            onInput: (value) => {
                let _value = this.state[name];
                if(_value.length === 4){
                    message('只允許輸入四位數取餐號');
                    value = '';
                }
                this.setState({
                    [name]: _value + value
                });
            },
            onBack: () => {
                let value = this.state[name];
                this.setState({
                    [name]: value.substring(0, value.length-1)
                });
            },
            onClear: () => {
                this.setState({
                    [name]: ''
                });
            },
            onCancel: () => {
                this.setState({
                    [name]: '',
                    //[name + 'Input']: false
                });
            },
            onOk: () => {
                if(this.state[name] === '') {
                    return false;
                }
            },
        })
    }

    handleSubmit = () => {
        let {pagerNo, code} = this.state;
        if(pagerNo.length !== 4){
            message('請輸入四位取餐號')
            return false
        };
        let params = {no: [pagerNo], code};
        let flag = window.PagerSystem(params,true);
        if(flag == '1'){
            message('補單成功')
            this.handleCancel();
        }else{
            message('請檢查傳呼器取餐號碼后重試')
        }
    }

    handleCancel = () => {
        this.setState({pagerNo: ''});
        this.props.changePager();
    }

    handleChange = (value) => {
        this.setState({code: value})
    }
    
    render(){
        const {visible, stallInfoList} = this.props
        const stallInfoListShow = stallInfoList.map(v => <Option key={v.selfId}>{v.stallName}</Option>);
        return (
            <Modal
            title={null}
            visible={visible}
            closable={false}
            maskClosable={false}
            footer={null}
            style={{ top: 200 }}
            mask={true}
            width={400}
            wrapClassName="vertical-center-modal"
            bodyStyle={{ margin: 0, padding: 0 }}
            destroyOnClose={true}
            afterClose={this.afterClose}
            >
            <div className="square_pager" >
                <div className="head">
                    傳呼器
                </div>
                <div className="content">
                    <div className = 'pager_message'>
                        <div>
                            <span>取餐號 : </span>
                            <Input 
                            name = 'pagerNo'
                            value={this.state.pagerNo}
                            autoFocus={true}
                            onFocus={() => this.openKeypad('pagerNo', 250)}
                            onChange = {this.onChange}
                            style = {{width : '200px'}}/>
                        </div>
                    </div>
                    <div>
                    <div className = 'pager_message'>
                            <span>菜品號 : </span>
                            <Select  
                            style = {{width : '201px'}} 
                            mode="multiple"
                            onChange={this.handleChange}>
                            {stallInfoListShow}
                            </Select>
                        </div>
                    </div>
                </div>
                <div className="foot">
                    <Button  onClick = {this.handleCancel} style={{borderRadius: '5px',marginRight: '40px',borderColor: '#333',padding:'5px 20px',height: '40px', width: '100px'}}>取消</Button>
                    <Button  onClick = {this.handleSubmit} style={{borderRadius: '5px',color:"white",backgroundColor:'#363646',padding:'5px 20px',height: '40px', width: '100px'}}>確認</Button>
                </div>
            </div>
            </Modal>
        )
    }
    
}

export default Pager

