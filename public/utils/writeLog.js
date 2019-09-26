const path = require('path');
const fs = require('fs');
const iconv = require('../node_modules/iconv-lite');
const dev = !require('electron').app.isPackaged;

function writeLog(log, type = '2', syjh) {
    let str = '';
    switch (type) {
        case '1':
            str = 'ejoural';
            break;
        case '2':
            str = 'log';
            break;
        case '3':
            str = 'ftplog';
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
    let hour = date.getHours();
    hour < 10 && (hour = `0${hour}`);
    let minute = date.getMinutes();
    minute < 10 && (minute = `0${minute}`);
    let second = date.getSeconds();
    second < 10 && (second = `0${second}`);
    let ms = date.getMilliseconds();
    let time = str == 'ftplog' ? `${year}/${month}/${day} ${hour}:${minute}:${second}` : `[${hour}:${minute}:${second} ${ms}]`;
    let path1 = `${year}${month}`;
    let path2 = `${path1}${day}`;
    let dir1 = `${logPath}/${path1}`;
    let dir2 = `${logPath}/${path1}/${path2}.${type === '1' ? syjh : "txt"}`;
    !fs.existsSync(logPath) && fs.mkdirSync(logPath);
    !fs.existsSync(dir1) && fs.mkdirSync(dir1);
    // let txt = type == '1' ? `${log} \r\n` : `${time} ${log} \r\n`;
    let txt;
    if (type === '1') {
        txt = iconv.encode(`${log} \r\n`, 'big5');
    } else {
        txt = `${time} ${log} \r\n`;
    }

    if (fs.existsSync(dir2)) {
        fs.appendFile(dir2, txt, 'utf8', (err) => {
            if (err) throw err;
            console.log('The file has been saved!');
        });
    } else {
        try {
            fs.writeFileSync(dir2, txt, 'utf8');
            console.log('The file has been saved!');
        } catch (err) {
            console.log('writeLog error!');
            throw err;
        }
    }
}

module.exports = writeLog;