const path = require('path');
const fs = require('fs');
const request = require('request');

const newRecords = [];
function reversalLog(log) {
        let str = 'reversalLog';
        const logPath = path.join(__dirname, true ? `../../${str}` : `../../../../${str}`);        
        let _dir = `${logPath}`;
        let _file = `${logPath}/reversal.json`;
        let records = [];
        if(!fs.existsSync(_dir)){   
            fs.mkdirSync(_dir);
        } 
        if (fs.existsSync(_file)) {       
            var fileObj = JSON.parse(fs.readFileSync(_file));
            if(!!fileObj){
                records = fileObj.reversalRecords;
            }
        }
        records.push(log);
        fs.writeFileSync(_file, JSON.stringify({reversalRecords: records}));
}

const err = [], res = [], bdy = [];
function reversalRequest(records, centerURL, _file) {    
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
                reversalRequest(records, centerURL, _file);
            });
        } else {
            reversalRequest(records, centerURL, _file);
        }
    } else { 
        let allRecords = newRecords.concat(records);
        fs.writeFileSync(_file, JSON.stringify({reversalRecords: allRecords}));
        // fs.writeFileSync(_file.replace("reversal.json", "error.json"), JSON.stringify({errors: err}));
        // fs.writeFileSync(_file.replace("reversal.json", "response.json"), JSON.stringify({response: res}));
        // fs.writeFileSync(_file.replace("reversal.json", "body.json"), JSON.stringify({bodies: bdy}));
        return; 
    }
}

function doReversal(centerURL) {
    let str = 'reversalLog';
    const logPath = path.join(__dirname, true ? `../../${str}` : `../../../../${str}`);
    let _dir = `${logPath}`;
    if(fs.existsSync(_dir)){ 
        let _file = `${logPath}/reversal.json`;
        if (fs.existsSync(_file)) {
            let records = [];
            var fileObj = JSON.parse(fs.readFileSync(_file));
            if(!!fileObj){
                records = fileObj.reversalRecords;
                if (records.length > 0) {
                    reversalRequest(records, centerURL, _file);
                }
            }
        }
    } 
}

module.exports = { 
    reversalLog,
    doReversal
};