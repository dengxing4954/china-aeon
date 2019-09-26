import React, { Component } from 'react';
import { Row, Col, Button, Modal, Table, Input, Form } from 'antd';
import '../style/Tablemodal.less'
const FormItem = Form.Item

class TableModalForm extends Component {

    static defaultProps = {
        table: true,
        searchButton: true,
    };

    state = {
        selectedRows: [],
        selectedRowKeys: [],
        pagination: {
            showSizeChanger: false,
            current: 1,
            pageSize: 5
          },
        visible: true
    }

    componentWillMount() {
        
    }

    //勾选
    handleRowSelectChange = (selectedRowKeys, selectedRows) => {
        this.setState({
            selectedRowKeys,
            selectedRows
        })
    }

    //分页
    handlePageChange = (pagination) => {
        // initDataSource(Object.assign({
        //   page: pagination.current,
        //   pageSize: pagination.pageSize
        // }))
        this.setState({
            pagination:{
                ...pagination,
                current: pagination.current
            }
        })
        this.handleRowSelectChange([],[])
    }

    handleOk = () => {
        this.props.open({
            tableData: this.state.selectedRowKeys,
            receiptId: this.props.form.getFieldValue('receiptId')
        })
    }

    render() {

        //测试数据
        const columns = [{
            title: 'Name',
            dataIndex: 'name',
          }, {
            title: 'Age',
            dataIndex: 'age',
          }, {
            title: 'Address',
            dataIndex: 'address',
          }];

          const data = [];
            for (let i = 0; i < 19; i++) {
            data.push({
                key: i,
                name: `Edward King ${i}`,
                age: 32,
                address: `London, Park Lane no. ${i}`,
            });
            }
        const {width, title, style, table, searchButton} = this.props
        const {pagination} = this.state
        const { getFieldDecorator } = this.props.form
        const rowSelection = {
            selectedRowKeys : this.state.selectedRowKeys,
            onChange: this.handleRowSelectChange,
          }
          const formItemLayout = {
              labelCol: { span: 8},
              wrapperCol: { span: 16},
          }
        return (
            <Modal
                visible = {this.state.visible}
                title = {title}
                width = {width}
                style = {style}
                maskClosable = {false}
                onCancel = {this.props.close}
                onOk = {this.handleOk}
                okText = '确认'
                cancelText = '取消'
            >   
                <Row >
                    <Col span={16}>
                        <FormItem {...formItemLayout} label={'单号'}>
                            {getFieldDecorator('receiptId')(
                                <Input placeholder = '请输入单号'  size = 'default'/>
                            )}
                        </FormItem>
                    </Col>
                    {searchButton ?
                        <Col span={8} style={{ textAlign: 'right' }}>
                            <Button type="primary"  style ={{marginRight:'8px', marginTop: '5px'}}>查询</Button>
                        </Col> : null
                    }
                </Row>
                {table ?
                    <Table
                        style = {{width: '100%'}}
                        columns = {columns}
                        dataSource = {data}
                        rowSelection= {rowSelection}
                        pagination = {pagination}
                        onChange={(pagination) => this.handlePageChange(pagination)}
                        /> : null
                }
            </Modal>
        )
    }
}

const TableModal = Form.create()(TableModalForm)
export default TableModal