import React, { Component } from 'react';
import {Modal, Button, Icon } from 'antd';
import message from '@/common/components/message';
import NumberKeypad from '@/common/components/numberKeypad/index.js';
import '../style/stampChange.less'

const confirm = Modal.confirm;

class StampChange extends Component {

    state = {
        vipFlag: false,//是否电子印花会员
        barcode: '', //商品条码
        stampNumber: '', //输入电子印花数
    }

    componentWillReceiveProps = (nextProps) => {
        const {vipInfo} = this.props
        if(vipInfo.stampEnabled !== nextProps.stampEnabled){
            if(nextProps.vipInfo.stampEnabled === 'TRUE'){
                this.setState({
                    vipFlag: true
                })
            }else{
                this.setState({
                    vipFlag: false
                })
            }
        }
    }
    
    
    afterClose = () => {
        if(this.props.focusInput) {
            document.getElementById('codeInput').focus();
        }
    }

    onChange = (e) => {
        e.preventDefault();
        this.setState({
            barcode: e.target.value
        })
    }

    stampChange = (e) => {
        e.preventDefault();
        this.setState({
            stampNumber: e.target.value
        })
    }

    getGoods = () => {
        this.props.getStampGoods(this.state.barcode)
        this.setState({
            stampNumber: ''
        })
    }

    onInputKeyDown = (e) => {
        if(e.keyCode === 13) {
            this.getGoods()
        }
    }

    openKeypad = (name, left, top,isGetGoods) => {
        NumberKeypad.open({
            top: top,
            left: left,
            autoClose: true,
            onInput: (value) => {
                let _value = this.state[name];
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
                    return false
                }
                if(isGetGoods){
                    return Promise.resolve(this.getGoods())
                }
            },
        })
    }

    handleCancel = () => {
        this.props.handleCancel()
        this.setState({
            barcode: '',
            stampNumber: ''
        })
    }

    clearData = () => {
        this.setState({
            barcode: '',
            stampNumber: ''
        })
    }

    fullStampNumber =() => {
        const {stampGoodsInfo, vipInfo} = this.props
        if(Object.keys(stampGoodsInfo).length == 0){
            message('請先輸入商品')
        }else{
            this.setState({
                stampNumber: Object.keys(vipInfo).length !== 0 && vipInfo.hasOwnProperty('membershipUntilDate') ? stampGoodsInfo.memberStamp : stampGoodsInfo.nonMemberStamp
            })
        }
    }

    handleStampGoods = () => {
        const {vipInfo, stampGoodsInfo} = this.props
        let params 
        if(Object.keys(vipInfo).length !== 0){
            if(this.state.vipFlag){
                if(stampGoodsInfo.allowElectronicStampFlag === 'Y'){
                    params = {electronicStamp: Number(this.state.stampNumber)}
                }else{
                    params = {physicalStamp: Number(this.state.stampNumber)}
                }
                // if(Number(vipInfo.stampBalance)- Number(this.state.stampNumber) < 0 ){
                //     message('會員賬戶印花數不足')
                //     return false
                // }
            }else{
                params = {physicalStamp: Number(this.state.stampNumber)}
            }
        }else{
            params = {physicalStamp: Number(this.state.stampNumber)}
        }
        this.props.handleStampGoods(params, params && params.electronicStamp !== undefined, Number(this.state.stampNumber))
    }

     showConfirm = () => {
        let _this = this
        if(this.state.barcode === ''){
            message('請先輸入商品條碼')
            return false
        }
        confirm({
          title: '是否確認印花換購?',
          okText: '確定',
          cancelText: '取消',
          onOk() {
             _this.handleStampGoods()
          },
          onCancel() {},
        });
      }

    render (){
        const {visible, vipInfo, stampGoodsInfo, stampGoodsFlag} = this.props
        return (
            <Modal 
            title={null}
            visible={visible}
            closable={false}
            maskClosable={false}
            footer={null}
            mask={true}
            width={800}
            wrapClassName="vertical-center-modal"
            bodyStyle={{ margin: 0, padding: 0 }}
            destroyOnClose={true}
            afterClose={this.afterClose}
            >
            <div className="presale_stampChange" >
                <div className="head">
                    印花換購
                    <img src={require('@/common/image/paytk_close.png')} alt="" onClick={() => this.handleCancel()} />
                </div>
                <div className="content">
                    {Object.keys(vipInfo).length !== 0 &&
                     <div className = 'vip_message'>
                        <div className = 'list_one'>
                            <span>AEON會員:</span>
                            <div>{vipInfo.memberId}</div>
                        </div>
                        <div className = 'list_two'>
                            <span>可用电子印花:</span>
                            <div>{vipInfo.stampBalance}</div>
                        </div> 
                        <div className = 'list_two'>
                            <span>印花結餘:</span>
                            <div>{vipInfo.stampBalance}</div>
                        </div>
                     </div>
                    }
                    <div className = 'goods_message'>
                        <div className = 'list_one'>
                            <span>換購貨品:</span>
                            <Icon type="search" style = {{position:'absolute', top:'70px', left:'10px', fontSize: '20px'}} 
                            onClick={() => this.openKeypad('barcode', 50, 200, true)}/>
                            <input 
                                placeholder ='請掃描商品'
                                name = 'barcode'
                                value={this.state.barcode} 
                                autoFocus={true}  
                                onChange = {this.onChange.bind(this)}                           
                                onKeyDown={this.onInputKeyDown}
                            />
                            <div>{stampGoodsInfo.fname}</div>
                        </div>
                        <div className = 'list_two'>    
                            <span>優惠價$:</span>
                            <div>{Object.keys(vipInfo).length !== 0 && vipInfo.hasOwnProperty('membershipUntilDate') ? stampGoodsInfo.memberAmount : stampGoodsInfo.nonMemberAmount}</div>
                        </div>
                        <img className = 'img' src={require('@/common/image/sale_05.png')} />
                        <div className = 'list_two'>
                            <span>所需印花數:</span>
                            <div>{Object.keys(vipInfo).length !== 0 && vipInfo.hasOwnProperty('membershipUntilDate') ? stampGoodsInfo.memberStamp : stampGoodsInfo.nonMemberStamp}</div>
                        </div>
                    </div>
                    {
                        stampGoodsFlag && 
                        <div className = 'stamp_message'>
                        <div className = 'list_one'>
                            <span>印花換購:</span>
                            <Icon type="edit" style = {{position:'absolute', top:'50px', left:'10px', fontSize: '20px'}} 
                            onClick={() => {this.openKeypad('stampNumber', 50, 380); this.refs.stampInput.focus()}}/>
                            <input 
                                placeholder ='請輸入印花數'
                                name = 'stampNumber'
                                ref = 'stampInput'
                                value={this.state.stampNumber} 
                                onChange = {this.stampChange.bind(this)}                           
                            />
                            <Button className = 'btn' onClick = {this.fullStampNumber}>全數</Button>
                        </div>
                        <div className = 'list_two'>
                            <span>總換購印花:</span>
                            <div>{Object.keys(vipInfo).length !== 0 && vipInfo.hasOwnProperty('membershipUntilDate')? stampGoodsInfo.memberStamp : stampGoodsInfo.nonMemberStamp}</div>
                        </div>
                        <div className = 'list_two'>
                            <span>餘數印花:</span>
                            <div>{Object.keys(stampGoodsInfo).length == 0 ? '' : (Object.keys(vipInfo).length !== 0 && vipInfo.hasOwnProperty('membershipUntilDate') ? Number(stampGoodsInfo.memberStamp) - Number(this.state.stampNumber): Number(stampGoodsInfo.nonMemberStamp) - Number(this.state.stampNumber))}</div>
                        </div>
                        </div>
                    }    
                </div>
                <div className="foot">
                    <Button onClick={this.showConfirm} style={{borderRadius: '5px',color:"white",backgroundColor:'#363646',padding:'5px 20px',height: '60px', width: '200px'}}>確認</Button>
                </div>
            </div>
            </Modal>
        )
    }
}

export default StampChange