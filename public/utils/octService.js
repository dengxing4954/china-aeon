const fs = require('fs');
const path = require('path');
const writeLog = require('./writeLog');
const ini = require('ini');

let ds = 'download success!';
let us = 'upload success!';
let rwlPath = '';
if (!fs.existsSync('C://windows/RWL.INI')) {
    rwlPath = path.join(__dirname, '../../javaPos.ConfigFile/RWL.INI');
} else {
    rwlPath = 'C://windows/RWL.INI';
}
const info = ini.parse(fs.readFileSync(rwlPath, 'UTF-8'));
const uploadPath = info['EXCHANGE'].FILEDIR;
const downloadPath = info['BLACKLIST'].FILEDIR;

const oPath = "O://";
const dir = path.join(__dirname, '../../../../octTemp');

function octDownload(info, callback) {
    let num = 0;
    let error;
    let octDLPath = oPath + info.ftpdl;
    if (fs.existsSync(octDLPath)) {
        fs.readdirSync(octDLPath).forEach(function (file) {
            num++;
            let curPath = octDLPath + "/" + file;
            if (!fs.statSync(curPath).isDirectory()) {
                fs.copyFile(curPath, downloadPath + "/" + file, (err) => {
                    num--;
                    if (err) {
                        error = err;
                        writeLog(`File Transfer  [${file}] ${err}`, '3');
                    } else {
                        writeLog(`File Transfer  [${file}] ${ds}`, '3');
                    }
                    if (!num) callback && callback(error);
                });
            }
        });
        if (!num) callback && callback(error);
    } else {
        error = "error";
        callback && callback(error);
    }

}

function octUpload(info, callback) {
    let num = 0;
    let error;
    let octULPath = oPath + info.ftpul;
    if (fs.existsSync(octULPath)) {
        fs.readdirSync(uploadPath).forEach(function (file) {
            num++;
            let curPath = uploadPath + "/" + file;
            if (!fs.statSync(curPath).isDirectory()) {
                fs.copyFile(curPath, octULPath + "/" + file, (err) => {
                    num--;
                    if (err) {
                        error = err;
                        writeLog(`File Transfer  [${file}] ${err}`, '3');
                    } else {
                        writeLog(`File Transfer  [${file}] ${us}`, '3');
                        createTemp(file);
                        fs.unlinkSync(curPath);
                    }
                    if (!num) callback && callback(error);
                });
            }
        });
        if (!num) callback && callback(error);
    } else {
        error = "error";
        callback && callback(error);
    }
}

function createTemp(filename) {
    !fs.existsSync(dir) && fs.mkdirSync(dir);
    fs.copyFileSync(uploadPath + "/" + filename, dir + "/" + filename);
}

module.exports = {
    octDownload,
    octUpload
};