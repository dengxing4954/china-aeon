import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import App from './App.js';
import '@/common/style/styles.less';
import '@/common/style/iconfont.css';
import '@/common/style/zhongbai.less';

ReactDOM.render(
    <App />
    , document.getElementById('root')
);

registerServiceWorker();
