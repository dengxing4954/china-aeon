const Client = require('node-ftp');
const fs = require('fs');
const path = require('path');
const writeLog = require('./writeLog');
const ds = 'download success!';
const us = 'upload success!';

function ftpDL(info, callback, flag) {
    const c = new Client();
    c.on('ready', function () {
        c.get(info.path, function (err, stream) {
            if (err) {
                writeLog(err);
                c.end();
            } else {
                stream.once('close', () => {
                    c.end();
                });
                try {
                    stream.pipe(fs.createWriteStream(flag ? info.dPath : path.join(__dirname, info.dPath)));
                } catch (err) {
                    writeLog(err);
                    c.end();
                }
            }
        });
    });

    c.on('greeting', (msg) => {
        console.log("greeting:" + msg);
    });
    c.on('close', (msg) => {
        console.log("close:" + msg);
        callback && callback();
        c.destroy();
    });
    c.on('error', (err) => {
        writeLog(err);
        callback && callback();
    });
    // connect to localhost:21 as anonymous
    c.connect({
        host: info.ftpHost,
        port: info.port,
        user: info.ftpUser,
        password: info.ftpPassword
    });
}

function ftpDownload(info, callback) {
    let num = 0;
    const c = new Client();
    c.on('ready', function () {
        c.list(info.path, (err, list) => {
            if (err) {
                return c.end();
            }
            list.forEach(ele => {
                const dlpath = path.join(__dirname, `${info.dlPath}/${ele.name}`);
                if (ele.type == "-") {
                    if (!fs.existsSync(dlpath) || fs.statSync(dlpath).size !== ele.size) {
                        num++;
                        c.get(`${info.path}/${ele.name}`, function (err, stream) {
                            num--;
                            if (err) {
                                writeLog(`File Transfer  [${ele.name}] ${err}`, '3');
                            } else {
                                stream.once('close', () => {
                                    if (!num) c.end();
                                    writeLog(`File Transfer  [${ele.name}] ${ds}`, '3');
                                });
                                stream.pipe(fs.createWriteStream(dlpath));
                            }
                        });
                    }
                }
            });
            if (!num) c.end();
        });
    });
    c.on('greeting', (msg) => {
        console.log("greeting:" + msg);
        writeLog('connection [successful] ' + msg, '3');
    });
    c.on('close', (msg) => {
        console.log("close:" + msg);
        callback && callback();
        c.destroy();
    });
    c.on('error', (err) => {
        writeLog('connection [error] ' + err, '3');
    });
    // connect to localhost:21 as anonymous
    c.connect({
        host: info.ftpHost,
        port: info.port,
        user: info.ftpUser,
        password: info.ftpPassword
    });
}

module.exports = {
    ftpDownload
};