import React, {Component} from 'react';
import {Modal, Input,  Button, DatePicker, message } from 'antd';
import '../style/uploadLog.less';
import Message from '@/common/components/message';
import moment from 'moment';
import withKeyBoard from '@/common/components/keyBoard';
import { spawn } from 'child_process';



class UploadLog extends Component {

    constructor(props) {
        super(props);
        this.state = {
            editModal: false,
            txt: '',
            capsLock: false,
            shift: false,
            //scrollTop: 0,
            settingList: [],
            dirList: props.dirList || [],
            fileList: [],
            datePicker: false,
            date: moment().format('YYYY-MM-DD'),
            keyType: 'dir',
            dirIndex: "",
            fileIndex: "",
        };

    }

    componentDidMount() {
        if(true) {
            this.props.bind({
                //home
                "36": () => {
                    if(this.state.keyType === 'dir') {
                        let files = this.selectDir({...this.state.dirList[this.state.dirIndex], index: this.state.dirIndex});
                        if(files && files.length > 0) {
                            this.setState({
                                keyType: 'file',
                                fileIndex: 0,
                            })
                        } else {
                            Message('暂无数据')
                        }
                    } else if(this.state.keyType === 'date'){
                        let {date} = this.state;
                        if(!moment(date).isValid() || date.length !== 10) {
                            Message('请输入正确格式的日期！')
                            setTimeout(this.refs.dateInputRef.focus, 300)
                            return;
                        }
                        if(this.state.dirIndex || this.state.dirIndex === 0) {
                            this.selectDir({...this.state.dirList[this.state.dirIndex], index: this.state.dirIndex});
                        }
                        this.setState({
                            keyType: 'dir'
                        })
                        this.refs.dateInputRef.blur();
                    }
                },
                //pageUP
                "33": () => {
                    const boxEle = this.refs.uploadFileScroll;
                    boxEle.scrollTop -= 50;
                },
                //pageDown
                "34": () => {
                    const boxEle = this.refs.uploadFileScroll;
                    boxEle.scrollTop += 50;
                },
                //左箭头
                "37": () => {
                },
                //上箭头
                "38": () => {
                    let name = this.state.keyType;
                    let index = this.state[name + 'Index'];
                    if(!index && index !== 0) {
                        this.setState({[name + 'Index']: 0});
                        return;
                    }
                    if(index > 0) {
                        this.setState({[name + 'Index']: index - 1});
                    }
                },
                //下箭头
                "40":  () => {
                    let name = this.state.keyType;
                    let index = this.state[name + 'Index'],
                        length = this.state[name + 'List'] && this.state[name + 'List'].length;
                    if(!index && index !== 0 && length) {
                        this.setState({[name + 'Index']: 0});
                        return;
                        }
                        if(index < length - 1) {
                            this.setState({[name + 'Index']: index + 1});
                        }
                    },
                //右键头
                "39": () => {
                },
                //f1
                "112": () => {
                    this.setState({
                        keyType: 'dir',
                        dirIndex: 0,
                        fileIndex: '',
                    })
                    this.refs.dateInputRef.blur();
                },
                //f2
                "113": () => {
                    if(this.state.fileList && this.state.fileList.length > 0) {
                        this.setState({
                            keyType: 'file',
                            fileIndex: 0,
                            dirIndex: ''
                        })
                    }
                    this.refs.dateInputRef.blur();
                },
                //f3
                "114": () => {
                    if(!this.refs.dateInputRef) return;
                    //let sPos = this.state.date.length;
                    this.refs.dateInputRef.focus();
                    this.setState({keyType: 'date'})
                    //this.refs.dateInputRef.input.setSelectionRange(sPos, sPos)
                },
                //end
                "35": this.props.callback,
            })
            let bindObj = {
                
            }
        }
    }

    componentWillMount() {
    }

    componentWillReceiveProps(nextProps) {

    }

    inputDate = (e) => {
        let {date} = this.state;
        let value = e.target.value;
        console.log(date, value)
        if(value.length > date.length && (value.length === 4 || value.length === 7 )) {
            value = value + '-'
        }
        if(value.length < date.length && (value.length === 4 || value.length === 7 )) {
            value = value.substring(0, value.length - 1)
        }
        this.setState({
            date: value
        })
    }

    inputDateBlur = () => {
        let {date} = this.state;
        if(!moment(date).isValid()) {
            Message('请输入正确格式的日期！')
            this.setState({date: moment().format('YYYY-MM-DD')})
        }
    }

    inputDateFocus = () => {
        this.setState({keyType: 'date'})
    }

    selectDir = (params) => {
        let {files, logPath} = window.UploadLogFind({...params, date: this.state.date});
        this.setState({
            fileList: files || [], 
            dirIndex: params.index,
            uploadPath: logPath
        })
        return files
    }

    selectFile = (fileIndex) => {
        let fileName = this.state.fileList[fileIndex];
        let filePath = `${this.state.uploadPath}/${fileName}`;
        this.setState({fileIndex});
        message.loading('文件上传中...', 0);
        let res = window.UploadLogIinstant({filePath});
        console.log(res);
        message.destroy();
        Message('上传成功！')
    }

    onDateChange = (date, dateString) => {
        this.setState({
            date: dateString,
            datePicker: false
        }, () => {
            if(this.state.dirIndex || this.state.dirIndex === 0) {
                this.selectDir({...this.state.dirList[this.state.dirIndex], index: this.state.dirIndex});
            }
        })
    }

    inputClick = () => {
        this.setState({
            datePicker: true
        })
    }

    render() {
        const {visible } = this.props;
        const {settingList, fileList, dirList} = this.state;
        return (
            <Modal
                className="uploadLog"
                width={880}
                style={{ top: 35 }}
                title='上传本地日志'
                visible={true}
                closable={false}
                maskClosable={false}
                footer={
                    <div>
                        <Button onClick={this.props.callback}>取消</Button>
                    </div>
                }>
                    <div className="uploadLog_body">
                        <div className="uploadLog_le">
                            <ul className={this.state.keyType === 'dir'? "selected uploadFile_dir": "uploadFile_dir"}>
                                {dirList.map((item,index) =>
                                    <li key={index}
                                        className={this.state.dirIndex === index ? 'selected' : ''}
                                        style={{color: settingList.includes(index) ? '#C6539B': ''}}
                                        onClick={() => this.selectDir({index, ...item})}>{item.dec}</li>
                                )}
                            </ul>
                        </div>
                        <div className="uploadLog_ri">
                        {!this.state.datePicker ?
                            <Input 
                                ref='dateInputRef'
                                value={this.state.date}
                                onClick={this.inputClick}
                                onFocus={this.inputDateFocus}
                                onBlur={this.inputDateBlur}
                                onChange={this.inputDate}/> : 
                            <DatePicker 
                                ref='datePickRef'
                                size='large'
                                open={true}
                                defaultValue={moment(this.state.date).isValid()? moment(this.state.date) : moment()}
                                onChange={this.onDateChange} />}
                            <ul className={this.state.keyType === 'file'? "selected uploadFile_file": "uploadFile_file"} 
                                ref="uploadFileScroll">
                                {fileList.length > 0 ? fileList.map((item,index) =>
                                    <li key={index}
                                        className={this.state.fileIndex === index ? 'selected' : ''}
                                        style={{color: settingList.includes(index) ? '#C6539B': ''}}
                                        onClick={() => this.selectFile(index)}>
                                            <span>{item}</span>
                                            <span>点击上传</span>
                                        </li>
                                ) : <p>暂无数据</p>}
                            </ul>
                        </div>
                    </div>
            </Modal>
        )
    }
}

export default withKeyBoard(UploadLog);