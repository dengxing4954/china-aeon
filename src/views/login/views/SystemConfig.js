import React, {Component} from 'react';
import {Modal, Input,  Button} from 'antd';
import message from '@/common/components/message';
const { TextArea } = Input;



class SystemConfig extends Component {

    constructor(props) {
        super(props);
        this.state = {
            editModal: false,
            txt: '',
            capsLock: false,
            shift: false,
            //scrollTop: 0,
            settingList: []
        };
        this.keyObj = [
            {key: '`', value: '`', width: 60, up: '~'},
            {key: '1', value: '1', width: 60, up: '!'},
            {key: '2', value: '2', width: 60, up: '@'},
            {key: '3', value: '3', width: 60, up: '#'},
            {key: '4', value: '4', width: 60, up: '$'},
            {key: '5', value: '5', width: 60, up: '%'},
            {key: '6', value: '6', width: 60, up: '^'},
            {key: '7', value: '7', width: 60, up: '&'},
            {key: '8', value: '8', width: 60, up: '*'},
            {key: '9', value: '9', width: 60, up: '('},
            {key: '0', value: '0', width: 60, up: ')'},
            {key: '-', value: '-', width: 60, up: '_'},
            {key: '=', value: '=', width: 60, up: '+'},
            {key: '', value: '←', width: 90, type: 'backspace'},
            {key: ' ', value: ' ', width: 90},
            {key: 'q', value: 'Q', width: 60},
            {key: 'w', value: 'W', width: 60},
            {key: 'e', value: 'E', width: 60},
            {key: 'r', value: 'R', width: 60},
            {key: 't', value: 'T', width: 60},
            {key: 'y', value: 'Y', width: 60},
            {key: 'u', value: 'U', width: 60},
            {key: 'i', value: 'I', width: 60},
            {key: 'o', value: 'O', width: 60},
            {key: 'p', value: 'P', width: 60},
            {key: '[', value: '[', width: 60, up: '{'},
            {key: ']', value: ']', width: 60, up: '}'},
            {key: '\\', value: '\\', width: 60, up: '|'},
            {key: '', value: 'caps lock', width: 120, type: 'caps lock'},
            {key: 'a', value: 'A', width: 60},
            {key: 's', value: 'S', width: 60},
            {key: 'd', value: 'D', width: 60},
            {key: 'f', value: 'F', width: 60},
            {key: 'g', value: 'G', width: 60},
            {key: 'h', value: 'H', width: 60},
            {key: 'j', value: 'J', width: 60},
            {key: 'k', value: 'K', width: 60},
            {key: 'l', value: 'L', width: 60},
            {key: ';', value: ';', width: 60, up: ':'},
            {key: '\'', value: '\'', width: 90, up: '"'},
            {key: 'shift', value: 'shift', width: 150, type:'shift'},
            {key: 'z', value: 'Z', width: 60},
            {key: 'x', value: 'X', width: 60},
            {key: 'c', value: 'C', width: 60},
            {key: 'v', value: 'V', width: 60},
            {key: 'b', value: 'B', width: 60},
            {key: 'n', value: 'N', width: 60},
            {key: 'm', value: 'M', width: 60},
            {key: ',', value: ',', width: 60, up: '<'},
            {key: '.', value: '.', width: 60, up: '>'},
            {key: '/', value: '/', width: 60, up: '?'},
            {key: '\n', value: 'enter↵', width: 120, type: 'enter'},
        ]
    }

    componentDidMount() {
    }

    componentWillMount() {
    }

    componentWillReceiveProps(nextProps) {

    }

    selectDec = (index) => {
        let txt = window.iniOpen(index);
        if(!txt) {
            message('打開文件失敗！');
        }else {
            this.settingIndex = index;
            this.setState({
                txt: txt.replace(/\r\n/g,'\n'),
                editModal: true
            })
        }
    }


    closeModal = (params) => {
        if(params) {
            window.reStart();
        } else {
            if(this.state.settingList.length > 0) {
                Modal.confirm({
                    title: '提示',
                    content: '配置文件已修改，重啟系統後生效，取消將在下次進入系統時生效，是否確認取消？',
                    width: 500,
                    className: 'vla-confirm',
                    okText: '是',
                    cancelText: '否',
                    onOk: () => {
                        this.props.callback();
                    },
                    onCancel() {

                    }
                });
            } else {
                this.props.callback();
            }
        }
    }

    submit = () => {
        this.props.callback(this.state.value);
    }

    editConfig = (params) => {
        if(params && !window.iniSave(this.state.txt.replace(/\n/g,'\r\n'))) {
            message('保存失敗！')
            return;
        }
        if(params) {
            let {settingList} = this.state;
            settingList.push(this.settingIndex);
            this.setState({
                settingList
            })
        }
        this.setState({
            editModal: !this.state.editModal
        })
    }

    textAreaFocus = (e) => {
        /*this.setState({
            scrollTop: e.target.scrollTop
        })*/
    }

    textAreaChange = (e) => {
        this.setState({
            txt: e.target.value,
            selectionStart: e.target.selectionStart,
            selectionEnd: e.target.selectionEnd
        })
    }

    buttonClick = (item) => {
        const elem = document.getElementById('systemConfigTextArea');
        let selectionStart = elem.selectionStart,
            selectionEnd = elem.selectionEnd;
            //scrollTop = elem.scrollTop;
        let {txt, capsLock, shift} = this.state;
        let newSelection = selectionStart;
        if(!item.type) {
            let buttonKey = item.key;
            if(capsLock) buttonKey = buttonKey.toLocaleUpperCase();
            if(shift && item.up) buttonKey = item.up;
            txt = txt.substring(0,selectionStart) + buttonKey + txt.substring(selectionEnd, txt.length);
            newSelection = selectionStart + 1;
        }else if(item.type === 'enter') {
            txt = txt.substring(0,selectionStart) + item.key + txt.substring(selectionEnd, txt.length);
            newSelection = selectionStart + 1;
        }else if( item.type === 'backspace') {
            if(selectionStart === selectionEnd) {
                txt = txt.substring(0,selectionStart - 1) + txt.substring(selectionEnd, txt.length);
                newSelection = selectionStart - 1;
            } else {
                txt = txt.substring(0,selectionStart) + txt.substring(selectionEnd, txt.length);
            }
        } else if( item.type === 'caps lock') {
            this.setState({
                capsLock: !this.state.capsLock
            })
        } else if( item.type === 'shift') {
            this.setState({
                shift: !this.state.shift
            })
        }
        this.setState({
            txt: txt,
        }, () => {
            elem.setSelectionRange(newSelection, newSelection);
            elem.focus();
            /*if(item.type !== 'enter' && selectionEnd < txt.length - 1) {
                elem.scrollTop = scrollTop;
            }*/
        })
    }

    render() {
        const {visible, dataList} = this.props;
        const {settingList} = this.state;
        return (
            <div className="systemConfig">
                <Modal
                    className="systemConfig_list"
                    width={880}
                    style={{ top: 35 }}
                    title='配置參數'
                    visible={visible}
                    closable={false}
                    maskClosable={false}
                    footer={
                        <div>
                            <Button onClick={() => this.closeModal()}>取消</Button>
                            {settingList.length > 0 ?
                            <Button type="primary" onClick={() => this.closeModal(true)}>重啟</Button> : null}
                        </div>
                    }>
                    <ul className="systemConfig_ul">
                        {dataList.map((item,index) =>
                            <li key={index}
                                style={{color: settingList.includes(index) ? '#C6539B': ''}}
                                onClick={() => this.selectDec(index)}>{item.dec}</li>
                        )}
                    </ul>
                </Modal>
                <Modal
                    className="systemConfig_edit"
                    width={950}
                    style={{ top: 20 }}
                    title='配置參數'
                    visible={this.state.editModal}
                    closable={false}
                    maskClosable={false}
                    footer={
                        <div>
                            <Button onClick={() => this.editConfig()}>取消</Button>
                            <Button type="primary" onClick={() => this.editConfig(true)}>確認</Button>
                        </div>
                    }>
                    <div className="systemConfig_textArea">
                        <TextArea
                            id="systemConfigTextArea"
                            /*autoFocus={true}*/
                            value={this.state.txt}
                            /*onClick={this.textAreaFocus}*/
                            onChange={this.textAreaChange}
                            />
                    </div>
                    <div className="fullKey">
                        {this.keyObj.map((item, index) =>
                            <div key={index}
                                 className='keyButton'
                                 style={{width: item.width}}>
                                <Button
                                    type={(item.type === 'caps lock' && this.state.capsLock) || (item.type === 'shift' && this.state.shift) ? "primary" : "default"}
                                    onClick={() => this.buttonClick(item)}>
                                    {
                                        item.up ?
                                            <div>
                                                <span className="button_up">{item.up}</span>
                                                <span>{item.value}</span>
                                            </div>: item.value
                                    }
                                </Button>
                            </div>
                        )}
                    </div>
                </Modal>
            </div>
        )
    }
}

export default SystemConfig;