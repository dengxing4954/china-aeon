const fs = require('fs');
const path = require('path');
const package = require('../package.json');
const dev = package.dev;
const request = require('request');
const archiver = require('archiver');

function uploadLog(url, params, syjh, callback) {
    let str = '';
    let type = params.fileType;
    switch (type) {
        case '1':
            str = 'ejoural';
            break;
        case '2':
            str = 'log';
            break;
        default:
            str = 'log';
            break;
    }
    const logPath = path.join(__dirname, dev ? `../../${str}` : `../../../../${str}`);
    let date = new Date();
    if (date.getHours() < 5) {
        date = new Date(date.getTime() - 24 * 60 * 60 * 1000);
    }
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    month < 10 && (month = `0${month}`);
    let day = date.getDate();
    day < 10 && (day = `0${day}`);
    let path1 = `${year}${month}`;
    let path2 = `${path1}${day}`;
    let dir1 = `${logPath}/${path1}`;
    let dir2 = `${logPath}/${path1}/${path2}.${type === '1' ? syjh : "txt"}`;
    let ejPath = `F:/retail/stn_${syjh}`;
    if (fs.existsSync(logPath) && fs.existsSync(dir1) && fs.existsSync(dir2)) {
        //ej上传
        if (fs.existsSync(ejPath) && type === '1') {
            fs.writeFileSync(`${ejPath}/journal.${syjh}`, fs.readFileSync(dir2));
        }
        //1-ejoural日志 2-pos操作日志
        let requestData = {
            command_id: 'UPLOADFILE',
            uploadType: '1',
            ...params
        };
        let upload = () => {
            request.post({
                url,
                json: true,
                body: requestData
            }, function (error, response, body) {
                callback && callback(error || JSON.stringify(body));
            });
        }
        let zip = dir2 + ".zip";
        let output = fs.createWriteStream(zip);
        let archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });
        output.on('close', function () {
            console.log(archive.pointer() + ' total bytes');
            console.log('archiver has been finalized and the output file descriptor has closed.');
            // requestData.file = fs.createReadStream(zip);
            requestData.ejRoute = zip;
            upload();
        });
        output.on('end', function () {
            console.log('Data has been drained');
        });
        archive.on('warning', function (err) {
            if (err.code === 'ENOENT') {
                // log warning
            } else {
                // throw error
                throw err;
            }
        });
        archive.on('error', function (err) {
            throw err;
        });
        archive.pipe(output);
        archive.append(fs.createReadStream(dir2), { name: `${path2}.${type === '1' ? syjh : "txt"}` });
        archive.finalize();
    }
}

module.exports = uploadLog;