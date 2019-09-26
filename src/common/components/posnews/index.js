import React from 'react'
import { Button, notification } from 'antd'
import './style/posnews.less'

export default function posNewsNotify(time = 25) {
    if ( !!global.posNews && global.posNews.length > 0 ) {
        let news = global.posNews[0];
        let content = news.text;
        let key= news.publishrqsj;
        let btn = (
            <Button type="primary" 
                    size="small" 
                    onClick={() => {
                        notification.close(key);
                        if(!!global.posNews){
                            global.posNews.shift();
                            if(global.posNews.length===0){                            
                                delete global.posNews;
                            }else{
                                posNewsNotify(time);
                            }
                        }
                    }}>
                知道了
            </Button>
        );
        setTimeout( ()=>{
            notification.info({
                key,
                placement: 'bottomRight',
                message: news.title,
                description: content,
                duration: time,
                btn,
                className: "vla-posnews",
                onClose: ()=>{
                    if(!!global.posNews){
                        global.posNews.shift();
                        if(global.posNews.length===0){                            
                            delete global.posNews;
                        }else{
                            posNewsNotify(time);
                        }
                    }
                }
              });
        }, 1000 );
    }
}