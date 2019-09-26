const path = require('path');
const fs = require('fs');
const request = require('request');

/** 储值卡冲正 */
let str = 'storeValueLog';
const logPath = path.join(__dirname, true ? `../../${str}` : `../../../../${str}`);
let _dir = `${logPath}`;
let _file = `${logPath}/storeValueLog.json`;

const newRecords = [];
function storeValueLog(log) {
    //储值卡交易日志写入
    if (!fs.existsSync(_dir)) {
        fs.mkdirSync(_dir);
    }
    let record = [];
    if (fs.existsSync(_file)) {
        let fileObj = JSON.parse(fs.readFileSync(_file));
        if (!!fileObj) {
            record = fileObj.storeValueRecord;
        }
    } 
    record.push(log);
    fs.writeFileSync(_file, JSON.stringify({storeValueRecord: record}));
}

function delLog(log) { 
    //删除支付行成功 或 保存订单返回储值卡支付行列表,  删除对应交易日志
    let record = [];
    if (fs.existsSync(_file)) {
        let fileObj = JSON.parse(fs.readFileSync(_file));
        if (!!fileObj) {
            record = fileObj.storeValueRecord;
        }
    }
    let arr = [];
    log.forEach(v => {
        // record.forEach (item => {
        //     if (item.params.orderNo !== v.refCode) arr.push(item)
        // })
        record = record.filter(item => item.params.orderNo !== v.refCode);
    })
    // record = arr;
    fs.writeFileSync(_file, JSON.stringify({storeValueRecord: record}));
}

function handleRequest(records, centerURL, _file) {    
    if (records.length > 0) {
        let _rec = records.shift();
        if(!!_rec.params && !!_rec.url){
            request.post({
                url: _rec.url.indexOf("http")!=-1 ? _rec.url : centerURL + _rec.url,
                json: true,
                body: _rec.params
            }, function (error, response, body) {
                // err.push(error);
                // res.push(response);
                // bdy.push(body);
                if(!body || body.returncode != "0"){ //revoke failed
                    newRecords.push(_rec);
                }
                handleRequest(records, centerURL, _file);
            });
        } else {
            handleRequest(records, centerURL, _file);
        }
    } else { 
        let allRecords = newRecords.concat(records);
        fs.writeFileSync(_file, JSON.stringify({storeValueRecord: allRecords}));
        // fs.writeFileSync(_file.replace("reversal.json", "error.json"), JSON.stringify({errors: err}));
        // fs.writeFileSync(_file.replace("reversal.json", "response.json"), JSON.stringify({response: res}));
        // fs.writeFileSync(_file.replace("reversal.json", "body.json"), JSON.stringify({bodies: bdy}));
        return; 
    }
}

function doStoreValueLog(centerURL) {
    if(fs.existsSync(_dir)){ 
        if (fs.existsSync(_file)) {
            let records = [];
            var fileObj = JSON.parse(fs.readFileSync(_file));
            if(!!fileObj){
                records = fileObj.storeValueRecord;
                if (records.length > 0) {
                    handleRequest(records, centerURL, _file);
                }
            }
        }
    } 
}

module.exports = { 
    storeValueLog,
    delLog,
    doStoreValueLog
};