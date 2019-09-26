import React, { Component } from 'react';
import NumberKeypad from '@/common/components/numberKeypad/index.js';
import { Modal, Button, Row, Col, Carousel } from 'antd';
import withKeypad from '@/common/components/keypad/';
import '../style/queryGameCoin.less';
import intl from 'react-intl-universal';

//商品明细
class QueryGameCoin extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tabKey: "1"
        };
    }

    componentDidMount() {

    }

    componentWillMount() {
    }

    componentWillReceiveProps() {
    }

    closeModal = () => {
        this.props.callback();
    }

    render() {
        const { visible, data } = this.props;
        return (
            <Modal className="presale_game_coin"
                   width={700}
                   style={{ top: 100 }}
                   title="代蔽活動査詢"
                   visible={visible}
                   footer={
                       <Button type="primary" onClick={this.closeModal}>確定</Button>
                   }
                   afterClose={() => {document.getElementById('codeInput').focus()}}
                   destroyOnClose={true}
            >
                <Carousel effect="fade">
                    {data.map(item =>
                        <div key={item.evenId} className="game_coin_table">
                            <Row>
                                <Col span={6}>活動名稱</Col>
                                <Col span={18}>{item.pname}</Col>
                            </Row>
                            <Row>
                                <Col span={6}>活動時間</Col>
                                <Col span={18}>{`${item.staDate} ~ ${item.endDate || ""} `}</Col>
                            </Row>
                            <Row>
                                <Col span={6}>活動對象</Col>
                                <Col span={18}>
                                    {item.cons.map(obj =>
                                        <span key={obj.consGrp}>{obj.consRak}</span>
                                    )}
                                </Col>
                            </Row>
                            <Row className="game_coin_ladder">
                                <Col span={6}>活動詳情</Col>
                                <Col span={18} className="ladder_list">
                                    {item.ladder.map(obj =>
                                        <li key={obj.lid}>{obj.lname}</li>
                                    )}
                                </Col>
                            </Row>
                        </div>
                    )}
                </Carousel>
            </Modal>
        );
    }
}

export default QueryGameCoin;
