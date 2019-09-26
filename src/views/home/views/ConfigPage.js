import React, {Component} from 'react';
import '../style/configpage.less'
import {Modal} from 'antd';
import {Tabs} from 'antd';

const TabPane = Tabs.TabPane;


class ConfigPage extends Component {

    render() {
        let {visible, onCancel} = this.props;
        return (
            <Modal
                title={null}
                visible={visible}
                closable={false}
                maskClosable={false}
                footer={null}
                mask={true}
                zIndex={2}
                width={800}
                wrapClassName="vertical-center-modal"
                bodyStyle={{margin: 0, padding: 0}}
            >
                <div className="configpage">
                    <div className="title">
                        配置界面修改参数
                        <img src={require("@/common/image/paytk_close.png")} alt=""  onClick={() => onCancel("configModal")}/>
                    </div>
                    <div style={{margin: 10}}>
                        <div>
                            <Tabs defaultActiveKey="1">
                                <TabPane tab="收银机号配置" key="1">
                                    <div className="tabs_content_th">
                                        <div>
                                            参数名
                                        </div>
                                        <div>
                                            参数值
                                        </div>
                                    </div>
                                    <div className="tabs_content">
                                        <div className="tabs_content_tr">
                                            <label>服务器IP：</label>
                                            <input type="text" placeholder="Enter text"/>
                                        </div>
                                        <div className="tabs_content_tr">
                                            <label>服务器路径：</label>
                                            <input type="text" placeholder="Enter text"/>
                                        </div>
                                        <div className="tabs_content_tr">
                                            <label>服务器端口号：</label>
                                            <input type="text" placeholder="Enter text"/>
                                        </div>
                                    </div>
                                </TabPane>
                                <TabPane tab="收银机参数配置" key="2">
                                    <div className="tabs_content_th">
                                        <div>
                                            参数名
                                        </div>
                                        <div>
                                            参数值
                                        </div>
                                    </div>
                                    <div className="tabs_content">
                                        <div className="tabs_content_tr">
                                            <label>服务器IP：</label>
                                            <input type="text" placeholder="Enter text"/>
                                        </div>
                                        <div className="tabs_content_tr">
                                            <label>服务器路径：</label>
                                            <input type="text" placeholder="Enter text"/>
                                        </div>
                                        <div className="tabs_content_tr">
                                            <label>服务器端口号：</label>
                                            <input type="text" placeholder="Enter text" id="formBasicText"/>
                                        </div>
                                    </div>
                                </TabPane>
                            </Tabs>
                        </div>
                    </div>
                    <div className="foot">
                        <input type="button" className="test" value="Server测试" onClick={() => onCancel("configModal")}/>
                        <input type="button" className="submit" value="保存" onClick={() => onCancel("configModal")}/>
                    </div>
                </div>
            </Modal>
        )
    }
}

export default ConfigPage;