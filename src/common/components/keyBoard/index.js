import React from 'react';
import EventEmitter from '@/eventemitter';
let kbList = [];

export default function withKeyBoard(Compont) {
    return class extends React.Component {
        componentDidMount() {
        }
        componentWillUnmount() {
            if (this.index) {
                kbList.shift();
                EventEmitter.off('KeyBoard', this.kb);
            }
        }
        render() {
            return <Compont {...this.props} bind={this.bind}></Compont>
        }
        bind = (callbackList, sync) => {
            if (!this.index) {
                this.index = callbackList;
                kbList.unshift(callbackList);
                if (sync) {
                    EventEmitter.on('KeyBoard', this.kb);
                } else {
                    Promise.resolve().then(() => {
                        EventEmitter.on('KeyBoard', this.kb);
                    });
                }
                this.list = [];
                const update = (updateCL) => {
                    this.list.push(this.index);
                    this.index = updateCL;
                    kbList[0] = this.index;
                };
                const fallback = () => {
                    if (this.list.length) {
                        this.index = this.list.pop();
                        kbList[0] = this.index;
                    }
                };
                return { update, fallback };
            }
        }
        kb = (key) => {
            if (kbList[0] == this.index && typeof kbList[0][key.code] == "function") kbList[0][key.code](key.shortKey);
        }
    }

}