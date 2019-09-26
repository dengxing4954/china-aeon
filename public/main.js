const { app, BrowserWindow, dialog, autoUpdater, globalShortcut, ipcMain, Menu } = require('electron');
app.disableHardwareAcceleration();
// Module to create native browser window.
const path = require('path');
const url = require('url');
const fs = require('fs');
const openJar = require('./utils/openJar');
const ini = require('ini');
const os = require('os');
const request = require('request');
const childProcess = require('child_process');
const moment = require('moment');
const writeLog = require('./utils/writeLog');
const uploadLog = require('./utils/uploadLog');
const { reversalLog, doReversal } = require('./utils/reversalLog.js');
const { storeValueLog, delLog, doStoreValueLog } = require('./utils/storeValueLog.js');
const instantUpload = require('./utils/instantUpload');
const { ftpDownload } = require('./utils/ftpService.js');
const package = require('./package.json');
const dev = !app.isPackaged;
const version = package.version;
const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
const ByteLength = SerialPort.parsers.ByteLength;
let portCardReader, portPagerSystem, portDisplayLine;

const MenuBilder = require('./menu');

const HOST = 'http://127.0.0.1';
const PORT = 8086;

// const ICBC = require("./utils/icbc");
// const GMC = require("./utils/gmc");
// const CLS = require("./utils/cls");
const setSystemTime = require("./utils/setSystemTime");
const deleteFolderRecursive = require("./utils/deleteFolder");

let mainWindow;
let initializeWindow;
let displayLineWindow;
let subWindow;
let installWindow;
let initializeSuccess = false;
//读ini文件
let info;
let openDevTools;
let fullscreen;
let syncService;
let syjh;
let mkt;
let ip;
let erpCode;
let http;
let ipath;
let centerURL;
let updateIP;
let ipAdress = getIPAdress();
let data = '';
let params;
let hb;
let PagerType;
let PagerFNo;

let ipurl;
let hostname;
let ports;

let online = true;
let shutdown;
let errorDetail = "";
let serviceVersion;
let posMode;

//删除log日志
let logTime = 2;
let logP = path.join(__dirname, dev ? "../log" : "../../../log");
if (fs.existsSync(logP)) {
    let arr = fs.readdirSync(logP);
    if (arr.length > logTime) {
        arr.forEach((item, index) => {
            if (index < arr.length - logTime) deleteFolderRecursive(`${logP}/${item}`);
        });
    }
}

/* childProcess.exec('taskkill /F /pid 884', function (err, stdout, stderr) {
    if (err) {
        console.log('taskkill error!' + err);
    } else {
        console.log('taskkill success!');
        childProcess.exec('taskkill /f /t /im PCSVC.exe', function (err, stdout, stderr) {
            if (err) {
                console.log('taskkill PCSVC error!' + err);
            } else {
                console.log('taskkill PCSVC success!');
            }
        });
    }
}); */

const gotTheLock = app.requestSingleInstanceLock();
console.log(gotTheLock);

if (!gotTheLock) {
    return app.quit();
} else {
    // 当运行第二个实例时,将会聚焦到mainWindow窗口
    // app.on('second-instance', (event, commandLine, workingDirectory) => {
    // });
}

const aeonPath = "C:/Users/POS/Desktop/AeonPOS.lnk";
if (fs.existsSync(aeonPath)) {
    fs.unlinkSync(aeonPath);
}

// this should be placed at top of main.js to handle setup events quickly
if (handleSquirrelEvent()) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
}

function handleSquirrelEvent() {
    if (process.argv.length === 1) {
        return false;
    }

    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    const exeName = path.basename(process.execPath);

    const spawn = function (command, args) {
        let spawnedProcess, error;

        try {
            spawnedProcess = childProcess.spawn(command, args, { detached: true });
        } catch (error) { }

        return spawnedProcess;
    };

    const spawnUpdate = function (args) {
        return spawn(updateDotExe, args);
    };

    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
        case '--squirrel-firstrun':
            // let ini = fs.readFileSync(path.join(__dirname, '../javaPos.ConfigFile/System.ini'), 'UTF-8');
            // fs.writeFileSync(path.join(__dirname, '../../../System.ini'), ini, 'UTF-8');
            setTimeout(app.quit, 1000);
            return true;
        case '--squirrel-install':
        case '--squirrel-updated':
            // Optionally do things such as:
            // - Add your .exe to the PATH
            // - Write to the registry for things like file associations and
            //   explorer context menus

            // Install desktop and start menu shortcuts
            spawnUpdate(['--createShortcut', exeName]);
            setTimeout(app.quit, 1000);
            return true;

        case '--squirrel-uninstall':
            // Undo anything you did in the --squirrel-install and
            // --squirrel-updated handlers

            // Remove desktop and start menu shortcuts
            spawnUpdate(['--removeShortcut', exeName]);
            setTimeout(app.quit, 1000);
            return true;

        case '--squirrel-obsolete':
            // This is called on the outgoing version of your app before
            // we update to the new version - it's the opposite of
            // --squirrel-updated

            app.quit();
            return true;
    }
}

// 关闭socket服务端口进程
function taskKill(callback) {
    const cmd = process.platform == 'win32' ? 'netstat -ano' : 'ps aux';
    const exec = require('child_process').exec;
    let flag = true;

    exec(cmd, function (err, stdout, stderr) {
        if (err) {
            return callback && callback(err);
        }
        stdout.split('\n').filter(function (line) {
            let p = line.trim().split(/\s+/);
            let address = p[1];
            if (address != undefined) {
                if (address.split(':')[1] == PORT && flag) {
                    flag = false;
                    exec('taskkill /F /pid ' + p[4], function (err, stdout, stderr) {
                        if (err) {
                            console.log('taskkill error!');
                        } else {
                            console.log('taskkill success!');
                        }
                        callback && callback(err);
                    });
                }
            }
        });
        flag && callback && callback();
    });
}

//获取本机ip
function getIPAdress() {
    let interfaces = os.networkInterfaces();
    for (let devName in interfaces) {
        let iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            let alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
    return "";
}

// 同步发票号码
function syncFPHM(no) {
    let jsonPath = path.join(__dirname, dev ? '../data/fphm.txt' : '../../../fphm.txt');
    let exists = fs.existsSync(jsonPath);
    if (exists) {
        let fphm = fs.readFileSync(jsonPath, 'utf8');
        if (fphm.length == 6 && parseInt(fphm) >= parseInt(no)) {
            return fphm;
        }
    }
    no = no + "";
    if (no.length >= 7) no = "000001";
    if (no.length < 6) no = `${'0'.repeat(6 - no.length)}${no}`;
    fs.writeFileSync(jsonPath, no, 'utf8');
    return no;
}

// 更新发票号码
function updateXPH() {
    let jsonPath = path.join(__dirname, dev ? '../data/fphm.txt' : '../../../fphm.txt');
    let exists = fs.existsSync(jsonPath);
    if (exists) {
        let fphm = fs.readFileSync(jsonPath, 'UTF-8');
        let xph = parseInt(fphm) + 1;
        if (xph >= 1000000) xph = 1;
        xph = xph + "";
        fphm = `${'0'.repeat(6 - xph.length)}${xph}`;
        fs.writeFileSync(jsonPath, fphm, 'utf8');
    }
}

function syncAMC() {
    let jsonPath = path.join(__dirname, dev ? '../data/amc.txt' : '../../../amc.txt');
    let exists = fs.existsSync(jsonPath);
    if (exists) {
        return fs.readFileSync(jsonPath, 'UTF-8');
    } else {
        fs.writeFileSync(jsonPath, "000001", 'utf8');
        return "000001";
    }
}

function syncPagerNO() {
    let jsonPath = path.join(__dirname, dev ? '../data/pager.txt' : '../../../pager.txt');
    let exists = fs.existsSync(jsonPath);
    if (exists) {
        let pno = fs.readFileSync(jsonPath, 'UTF-8');
        if (isNaN(parseInt(pno))) {
            fs.writeFileSync(jsonPath, "001", 'utf8');
            return "001";
        }
        return pno;
    } else {
        fs.writeFileSync(jsonPath, "001", 'utf8');
        return "001";
    }
}

// 同步收银机状态
function SyncCASHIER(deal = {}) {
    //收银机当前现金金额;收银机当前交易笔数;收银机当前交易金额;收银机当天交易额,na机器除去增值意外的所有收入
    let jsonPath = path.join(__dirname, dev ? '../data/cash.txt' : '../../../cash.txt');
    let cashCach = JSON.parse(fs.readFileSync(jsonPath, 'utf8').toString());
    if (Object.keys(deal).length) {
        for (key in deal) {
            cashCach[key] = parseFloat(cashCach[key]) + parseFloat(deal[key]);
        }
        if (key === 'na' || key === 'mediaTotal') {
            cashCach[key] = Math.round(cashCach[key] * 100) / 100;
        }
        cashCach.cash = typeof cashCach.cash === 'string' ? cashCach.cash : cashCach.cash.toFixed(2);
        fs.writeFileSync(jsonPath, JSON.stringify(cashCach), 'utf8');
    }

    if (deal.na) {
        let naStrPath = path.join(__dirname, dev ? '../data/na.txt' : '../../../na.txt');
        let naStr = cashCach.na + ',' + cashCach.clearTime;
        fs.writeFileSync(naStrPath, naStr, 'utf8');
    }
    return cashCach;
}

function initCASHIER(dealNumbers, mediaTotal) {
    let jsonPath = path.join(__dirname, dev ? '../data/cash.txt' : '../../../cash.txt'),
        naStrPath = path.join(__dirname, dev ? '../data/na.txt' : '../../../na.txt'),
        newDate = new Date(), date = newDate.getDate(),
        hours = newDate.getHours(), cashCach,
        initData = {
            cash: 0,
            dealNumbers,
            mediaTotal,
            na: 0,
            clearTime: `${newDate.getDate() + 1},5`
        };
    let readAction = (path) => fs.readFileSync(path, 'utf8').toString().trim();
    let writeAction = (errStatus = false) => {
        try {
            let exists = fs.existsSync(jsonPath);
            if (exists) {
                cashCach = JSON.parse(readAction(jsonPath));
                let clearTime = cashCach.clearTime.split(',');
                if (clearTime[0] - 1 !== date && hours > clearTime[1]) {
                    cashCach.clearTime = `${date + 1},5`;
                    cashCach.na = 0;
                }
                cashCach.cash = 0;
                cashCach.dealNumbers = dealNumbers;
                cashCach.mediaTotal = mediaTotal;
                fs.writeFileSync(naStrPath, cashCach.na + ',' + cashCach.clearTime, 'utf8');
                fs.writeFileSync(jsonPath, JSON.stringify(cashCach), 'utf8');
            } else {
                let naData;
                if (errStatus) {//判断是否是文件异常报错
                    naData = readAction(naStrPath).split(',');
                    if (naData.length === 3) {
                        if (naData[1] - 1 !== date && hours > naData[2]) { //校验na是否需要重置
                            fs.writeFileSync(naStrPath, initData.na + ',' + initData.clearTime);
                        } else {
                            initData.na = naData[0];
                            initData.clearTime = naData[1] + ',' + naData[2];
                        }
                    } else {
                        fs.writeFileSync(naStrPath, initData.na + ',' + initData.clearTime, 'utf8');
                        writeLog('na文件出现读写异常');
                    }
                }
                fs.writeFileSync(jsonPath, JSON.stringify(initData), 'utf8');
            }
        } catch (e) {
            writeLog('cash文件异常: ' + e);
            fs.unlinkSync(jsonPath);
            writeAction(true);
        }
    }
    writeAction();
}

function mainBind() {
    const setting = JSON.parse(fs.readFileSync(path.join(__dirname, "./setting.json"), 'UTF-8'));
    const uploadSetting = JSON.parse(fs.readFileSync(path.join(__dirname, "./uploadSetting.json"), 'UTF-8'));
    let iniIndex;

    // ipcMain.on('CLS', (event, arg) => {
    //     event.returnValue = CLS(arg);
    // });

    // ipcMain.on('ICBC', (event, arg) => {
    //     event.returnValue = ICBC(arg);
    // });

    // ipcMain.on('GMC', (event, arg) => {
    //     event.returnValue = GMC(arg);
    // })

    ipcMain.on('Initialize', (event, arg) => {
        let date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        if (month < 10) month = `0${month}`;
        let day = date.getDate();
        if (day < 10) day = `0${day}`;
        let now = `${year}${month}${day}`;
        let JRRQ = false;
        params.Syspara.JRRQ && params.Syspara.JRRQ.forEach((item) => {
            if (item == now) {
                JRRQ = true;
            }
        })
        event.returnValue = Object.assign({ BrowserWindowID: event.sender.id, dev, version, syjh, mkt, erpCode, ipAdress, ip, ipath, imgURL: centerURL, data, JRRQ, PagerType, setting, uploadSetting, serviceVersion, posMode }, params);
        hbTimer(parseInt(params.hbtime) - 60);
        //event.returnValue = { syjh, mkt, ipAdress, data, ...params};
    });

    ipcMain.on('reStart', (event, arg) => {
        app.relaunch();
        mainWindow && mainWindow.destroy();
    });

    ipcMain.on('iniOpen', (event, arg) => {
        iniIndex = arg;
        try {
            event.returnValue = fs.readFileSync(path.join(__dirname, setting[arg].path), 'UTF-8');
        } catch (err) {
            event.returnValue = false;
        }
    });

    ipcMain.on('iniSave', (event, arg) => {
        try {
            fs.writeFileSync(path.join(__dirname, setting[iniIndex].path), arg, 'UTF-8');
            event.returnValue = true;
        } catch (err) {
            event.returnValue = false;
        }
    });

    ipcMain.on('offlineSync', (event, arg) => {
        if (arg[0] && setSystemTime(new Date(arg[0]))) {
            writeLog("脱机同步时间成功！");
        } else {
            writeLog("脱机同步时间失败！");
        }
        if (arg[1]) {
            let jsonPath = path.join(__dirname, dev ? '../data/fphm.txt' : '../../../fphm.txt');
            let exists = fs.existsSync(jsonPath);
            if (exists) {
                fs.writeFileSync(jsonPath, arg[1], 'utf8');
            }
        }
        event.returnValue = "";
    });

    ipcMain.on('UpdateXPH', (event, arg) => {
        updateXPH();
    });

    ipcMain.on('UpdateAMC', (event, arg) => {
        let jsonPath = path.join(__dirname, dev ? '../data/amc.txt' : '../../../amc.txt');
        let exists = fs.existsSync(jsonPath);
        if (exists) {
            let fphm = fs.readFileSync(jsonPath, 'UTF-8');
            let xph = parseInt(fphm) + 1;
            if (xph >= 1000000) xph = 1;
            xph = xph + "";
            fphm = `${'0'.repeat(6 - xph.length)}${xph}`;
            fs.writeFileSync(jsonPath, fphm, 'utf8');
            event.returnValue = fphm;
        } else {
            fs.writeFileSync(jsonPath, "000001", 'utf8');
            event.returnValue = "000001";
        }
    });

    ipcMain.on('UpdatePagerNO', (event, arg) => {
        let jsonPath = path.join(__dirname, dev ? '../data/pager.txt' : '../../../pager.txt');
        let exists = fs.existsSync(jsonPath);
        if (exists) {
            let pager = fs.readFileSync(jsonPath, 'UTF-8');
            let no = parseInt(pager) + 1;
            if (no >= 1000) no = 1;
            no = no + "";
            pager = `${'0'.repeat(3 - no.length)}${no}`;
            fs.writeFileSync(jsonPath, pager, 'utf8');
            event.returnValue = PagerFNo + pager;
        } else {
            fs.writeFileSync(jsonPath, "001", 'utf8');
            event.returnValue = PagerFNo + "001";
        }
    });

    ipcMain.on('SyncCASHIER', (event, arg) => {
        let returnValue = SyncCASHIER(arg);
        setTimeout(function () {
            event.returnValue = returnValue;
        }, 100);
    });

    ipcMain.on('Bill', (event, arg) => {
        let jsonPath = path.join(__dirname, '../data/billList.txt');
        let txt = fs.readFileSync(jsonPath, 'UTF-8');
        let bill = JSON.parse(txt[0] == "{" ? txt : "{}");
        bill[arg.key] || (bill[arg.key] = []);
        if (arg.type) {
            bill[arg.key] = bill[arg.key].filter(value => {
                if (!arg.data.find(item => item.no === value.no)) {
                    return true;
                } else {
                    return false;
                }
            });
        } else {
            for (let item of bill[arg.key]) {
                if (item.no === arg.data.no) return;
            }
            bill[arg.key].unshift(arg.data);
        }
        fs.writeFileSync(jsonPath, JSON.stringify(bill), 'utf8');
    });

    ipcMain.on('ReversalLog', (event, arg) => {
        reversalLog(arg);
    });

    ipcMain.on('StoreValueLog', (event, arg) => {
        storeValueLog(arg);
    });

    ipcMain.on('DelLog', (event, arg) => {
        delLog(arg);
    });

    ipcMain.on('Print', (event, arg) => {
        checkPrinter(flag => {
            if (flag) {
                let req = Object.assign({ 'Module': "print" }, arg);
                printOperat(req).then(res => {
                    event.sender.send('Print', res);
                }).catch(err => {
                    event.sender.send('Print', { code: '5', message: '打印服务异常，打印失败' });
                })
            } else {
                event.sender.send('Print', { code: '5', message: '打印服务异常，打印失败' });
            }
        })
    });

    ipcMain.on('OpenCashbox', (event, arg) => {
        printOperat({ 'Module': "OpenDrawer" });
    });

    ipcMain.on('Shutdown', (event, arg) => {
        // UPLOADPAYSTATISTICSINFO
        let contents = JSON.stringify({
            command_id: 'UPLOADPAYSTATISTICSINFO',
            erpCode,
            mkt,
            syjh
        });

        const options = {
            hostname,
            path: ipath,
            port: ports,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                'Content-Length': contents.length
            }
        };

        let req = http.request(options, (res) => {
            let hbData = "";
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                hbData += chunk;
            });
            res.on('end', () => {
                writeLog(hbData);
                shutdown = arg;
                mainWindow && mainWindow.destroy();
            });
        });

        req.on('error', (e) => {
            writeLog("UPLOADPAYSTATISTICSINFO " + e.toString());
            shutdown = arg;
            mainWindow && mainWindow.destroy();
        });

        req.write(contents);
        req.end();
    });

    ipcMain.on('ClearMachine', (event, arg) => {
        let data = { mkt, syjh, erpCode, ent_id: params.entid };
        let cPath = "/mongoUpload?method=pos.file.uploadFile&ent_id=0";
        if (online) {
            uploadLog(centerURL + cPath, { ...data, fileType: '1' }, syjh, err => {
                if (err) writeLog(`EJupLoadError:${mkt}|${syjh}|${err}`);
                setTimeout(() => {
                    uploadLog(centerURL + cPath, { ...data, fileType: '2' }, () => {
                    });
                }, 500);
            });
        }
    });

    ipcMain.on('Log', (event, arg) => {
        writeLog(arg.log, arg.type, syjh);
    });

    ipcMain.on('UploadLogFind', (event, arg) => {
        let { index, name, type, date } = arg;
        //let name = uploadSetting[index];
        switch (name) {
            case 'log':
                let _date = moment(date).format('YYYYMM');
                logPath = path.join(__dirname, dev ? `../log/${_date}` : `../../../log/${_date}`);
                name = moment(date).format('YYYYMMDD') + '.txt';
                break;
            case 'CLS':
                logPath = path.join(__dirname, `../dll/CLS`);
                name = moment(date).format('YYYY-MM-DD') + '.txt';
                break;
            case 'GMC':
                logPath = path.join(__dirname, `../dll/GMC/log`);
                name = 'umsgmc' + moment(date).format('YYYYMMDD') + '.log';
                break;
            case 'ICBC':
                logPath = path.join(__dirname, `../dll/ICBC/jwlogs`);
                // if (date !== moment().format('YYYY-MM-DD')) {
                //     name = 'false';
                // }
                name = 'KeeperClient.log';
                break;
            default:
                logPath = uploadSetting[index].path;
                if (date !== moment().format('YYYY-MM-DD')) {
                    name = name.split('.');
                    name.splice(1, 0, date);
                    name = name.join('.');
                }
                //logPath = 'C:/ePosLog';
                break;
        }
        if (fs.existsSync(logPath)) {
            let files = fs.readdirSync(logPath);
            files = files.filter(item => item === name);
            event.returnValue = { files, logPath };
        } else {
            event.returnValue = {};
        }
    });

    ipcMain.on('UploadLogIinstant', (event, arg) => {
        let { filePath } = arg;
        let url = centerURL + "/mongoUpload?method=pos.file.uploadFile&ent_id=0";
        console.log(filePath)
        event.returnValue = instantUpload(filePath, { url });
    });

    ipcMain.on("dlWindow", (event, arg) => {
        if (!displayLineWindow.isDestroyed()) displayLineWindow.webContents.send("dlWindow", arg);
    });

    ipcMain.on("scanSubmit", (event, arg) => {
        mainWindow.webContents.send("scanSubmit", arg);
        subWindow.webContents.send("scanSubmit", arg);
    });

    ipcMain.on("KeyBoard", (event, arg) => {
        if (arg <= 40) {
            if (!subWindow.isDestroyed()) subWindow.webContents.send("KeyBoard", arg);
        } else {
            if (!mainWindow.isDestroyed()) mainWindow.webContents.send("KeyBoard", arg);
        }
    });
}

function printOperat(data) {
    return new Promise((resolve, reject) => {
        request.post({
            url: `${HOST}:${PORT}/${data.Module}`,
            json: true,
            body: data
        }, (error, response, body) => {
            if (error || response.statusCode != 200) {
                writeLog("PrintError:" + (error || response.statusCode));
                reject(error || response.statusCode);
            } else {
                writeLog("PrintData:" + JSON.stringify(body));
                resolve(body);
            }
        });
    })
}

function checkPrinter(callback, disCheck) {
    if (disCheck) return callback && callback(true);
    printOperat({ 'Module': 'GetPrintStatus' }).then(res => {
        if (res.code == "0") {
            callback && callback(true);
        } else {
            dialog.showMessageBox(mainWindow, {
                type: 'info',
                buttons: ['是', '否'],
                message: "打印机状态异常! 是否继续打印？"
            }).then(({ response }) => {
                if (response === 0) {
                    checkPrinter(callback, disCheck);
                } else {
                    callback && callback(false);
                }
            });
        }
    }).catch(err => {
        callback && callback(false);
    })
}

function Initialize() {
    taskKill(err => {
        const requestData = {
            url: ip + ipath,
            json: true,
            body: {
                command_id: 'INITCERTIFY',
                erpCode,
                mkt,
                syjh,
                ipAdress,
                version: serviceVersion ? `${version},${serviceVersion}` : version
            }
        };
        const dialogOpts = {
            type: 'info',
            buttons: ['重試', '退出'],
            message: "初始化失敗！",
            detail: '伺服器連接失敗。'
        };
        writeLog(JSON.stringify(requestData));
        request.post(requestData, (error, response, body) => {
            if (error || response.statusCode != 200) {
                error ? writeLog(error.toString()) : writeLog(JSON.stringify(body));
                dialog.showMessageBox(initializeWindow, dialogOpts).then(({ response }) => {
                    if (response === 0) {
                        Initialize();
                    } else {
                        initializeWindow = null;
                        app.quit();
                    }
                });
            } else {
                try {
                    errorDetail = "";
                    writeLog(JSON.stringify(body));
                    if (body.retflag === "0") {
                        data = body;
                        if (checkInitialize()) {
                            throw new Error("初始化缺少参数！");
                        }
                        let { syjcurcashje, syjcurinvbs, syjcurinvje, syjflag } = body.syjmain[0];
                        if (syjflag == "N") {
                            return dialog.showMessageBox(initializeWindow, {
                                type: 'info',
                                buttons: ['退出'],
                                message: '初始化失敗！',
                                detail: '收銀機號無效！'
                            }).then(() => {
                                initializeWindow = null;
                                app.quit();
                            });
                        }
                        console.log(body.serverTime && body.serverTime.serviceTime);
                        timeTemp = new Date().getTime();
                        let logPath = path.join(__dirname, '../data');
                        !fs.existsSync(logPath) && fs.mkdirSync(logPath);
                        let fphm = body.syjmain[0].syjcurnum + 1;
                        console.log(fphm);
                        fphm = syncFPHM(fphm);
                        let amcNO = syncAMC();
                        let pagerNO = PagerFNo + syncPagerNO();
                        //cash: parseFloat(syjcurcashje),//收银机当前现金金额 在登录界面进行同步 废弃。
                        //dealNumbers: parseInt(syjcurinvbs),//收银机当前交易笔数
                        //mediaTotal: parseFloat(syjcurinvje),//收银机当前交易金额
                        initCASHIER(parseInt(syjcurinvbs), parseFloat(syjcurinvje));
                        let jsonPath = path.join(__dirname, '../data/billList.txt');
                        let exists = fs.existsSync(jsonPath);
                        let bill = { presale: [], square: [], practice: [], coupon: [] };
                        if (exists) {
                            let json = fs.readFileSync(jsonPath, 'UTF-8');
                            if (json && json[0] == "{") {
                                bill = JSON.parse(json);
                                bill.practice = [];
                                if (!bill.coupon) {
                                    bill.coupon = [];
                                }
                            }
                        }
                        fs.writeFileSync(jsonPath, JSON.stringify(bill), 'UTF-8');
                        params = sysParam();
                        console.log("open PrintService");
                        let jarPath = path.join(__dirname, "../extjar/SJ-DeviceService.jar");
                        openJar(`${jarPath}`).then(data => { }).catch(err => console.log(err));
                        console.log(params.hbtime);
                        // hbTimer(params.hbtime - 60);
                        params = Object.assign(params, { amcNO, pagerNO, fphm, bill, popMode: parseInt(info['System'].popMode || 1) });
                        if (body.uniformity == "N") {
                            console.log(body.uniformity);
                            dialog.showMessageBoxSync(initializeWindow, { message: "此次登录IP与上次不一致!" });
                        }
                        if (!dev && data.serverTime && data.serverTime.serviceTime) {
                            if (setSystemTime(new Date(data.serverTime.serviceTime))) {
                                writeLog("同步时间成功！");
                            } else {
                                writeLog("同步时间失败！");
                            }
                        }
                        let { printtemplate } = body;
                        if (printtemplate && !dev) {
                            ftpDownload({
                                path: `.` + printtemplate.ftppath || `./`,
                                dlPath: "../../printConfigFile",
                                ftpHost: printtemplate.ftpaddress,
                                port: printtemplate.port,
                                ftpUser: printtemplate.userid,
                                ftpPassword: printtemplate.passwd
                            }, () => {
                                initializeSuccess = true;
                                initializeWindow.destroy();
                            });
                        } else {
                            initializeSuccess = true;
                            initializeWindow.destroy();
                        }
                        // octDownload(info['System'], err => {
                        //     if (err) {
                        //         dialog.showMessageBoxSync(initializeWindow, { message: "拉取八達通黑名單失敗！" });
                        //     }
                        //     setTimeout(() => {
                        //         initializeSuccess = true;
                        //         initializeWindow.destroy();
                        //     }, 1500);
                        // });
                        doReversal(centerURL);
                        doStoreValueLog(centerURL); //储值卡冲正
                    } else {
                        dialog.showMessageBox(initializeWindow, dialogOpts).then(({ response }) => {
                            if (response === 0) {
                                Initialize();
                            } else {
                                initializeWindow = null;
                                app.quit();
                            }
                        });
                    }
                } catch (err) {
                    // throw err;
                    writeLog(err);
                    dialog.showMessageBox(initializeWindow, {
                        type: 'info',
                        buttons: ['重試', '退出'],
                        message: '初始化失敗！',
                        detail: `初始化參數錯誤！ ${errorDetail}`
                    }).then(({ response }) => {
                        if (response === 0) {
                            Initialize();
                        } else {
                            initializeWindow = null;
                            app.quit();
                        }
                    });
                }
            }
        });
    });
}

function checkInitialize() {
    if (!data.paymode || data.paymode.length == 0) {
        errorDetail = "支付方式為空";
        return errorDetail;
    }
}

// 心跳计时
function hbTimer(time = 540) {
    const hbFunc = (flag) => {
        writeLog("hb start!");
        let jsonPath = path.join(__dirname, dev ? '../data/cash.txt' : '../../../cash.txt');
        let { cash, dealNumbers, mediaTotal } = JSON.parse(fs.readFileSync(jsonPath, 'UTF-8'));
        jsonPath = path.join(__dirname, dev ? '../data/fphm.txt' : '../../../fphm.txt');
        let fphm = fs.readFileSync(jsonPath, 'UTF-8');
        let contents = JSON.stringify({
            command_id: 'HBCERTIFY',
            erpCode,
            mkt,
            syjh,
            syjcurinvje: parseFloat(mediaTotal),
            syjcurinvbs: parseInt(dealNumbers),
            syjcurcashje: parseFloat(cash),
            syjcurnum: parseInt(fphm)
        });

        const options = {
            hostname,
            path: ipath,
            port: ports,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                'Content-Length': contents.length
            }
        };

        let req = http.request(options, (res) => {
            let hbData = "";
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                hbData += chunk;
            });
            res.on('end', () => {
                console.log(hbData);
                writeLog(hbData);
                try {
                    hbData = JSON.parse(hbData);
                    if (hbData.retflag === "0") {
                        // hbData.netType = 0;
                        if (flag) mainWindow.webContents.send("setInitializeState", { syncTime: hbData.netType });
                        mainWindow.webContents.send("Online", hbData.netType);
                        mainWindow.webContents.send("setInitializeState", { posNews: !!hbData.posnews ? hbData.posnews : null });
                        console.log("hb success!");
                        writeLog("hb success!");
                    } else {
                        writeLog("hb error!");
                    }
                } catch (err) {
                    writeLog("hb error!");
                }

            });
        });

        req.on('error', (e) => {
            writeLog("hb error!" + e.toString());
        });

        req.write(contents);
        req.end();
    };
    hbFunc(true);
    if (hb) return;
    if (isNaN(time) || typeof time != "number" || time < 120) time = 540;
    hb = setInterval(hbFunc, time * 1000);
}

function sysParam() {
    let params = data.syspara;
    let jygs;
    let entid;
    let hbtime;
    let flag = false;
    let Syspara = {};
    Syspara.syncService = syncService; //ini 配置本地服务是否开启
    for (let i = 0, len = params.length; i < len; i++) {
        switch (params[i].code) {
            case "1M": {
                jygs = params[i].paravalue;
                if (flag) {
                    break;
                } else {
                    flag = true;
                }
            }
                break;
            case "48": {
                hbtime = params[i].paravalue;
                if (flag) {
                    break;
                } else {
                    flag = true;
                }
            }
                break;
            case "13": {
                Syspara.mktname = params[i].paravalue;
            }
                break;
            case "14": {
                Syspara.mktcode = params[i].paravalue;
            }
                break;
            case "16": {
                Syspara.shopname = params[i].paravalue;
            }
                break;
            case "40": {
                //取消
                // Syspara.yyygz = params[i].paravalue;
            }
                break;
            case "41": {
                Syspara.isxh = params[i].paravalue;
            }
                break;
            case "42": {
                Syspara.customvsgoods = params[i].paravalue;
            }
                break;
            case "44": {
                Syspara.inputydoc = params[i].paravalue;
            }
                break;
            case "45": {
                Syspara.isconnect = params[i].paravalue;
            }
                break;
            case "4C": {
                Syspara.maxxj = params[i].paravalue;
            }
                break;
            case "4L": {
                Syspara.autoopendrawer = params[i].paravalue;
            }
                break;
            case "4N": {
                Syspara.cashsale = params[i].paravalue;
            }
                break;
            case "4Q": {
                const str = params[i].paravalue.split(',');
                const strlen = str.length;
                if (strlen > 0) {
                    Syspara.fdprintyyy = str[0].toString();
                }
                if (strlen > 1) {
                    Syspara.printyyygrouptype = str[1].toString();
                }
                if (strlen > 2) {
                    Syspara.fdprintyyytrack = str[2].toString();
                }
                if (strlen > 3) {
                    Syspara.printyyhsequence = str[3].toString();
                }
            }
                break;
            case "4R": {
                const str = params[i].paravalue.split(',');
                const strlen = str.length;
                if (strlen > 0) {
                    Syspara.isinputjkdate = str[0].toString();
                }
                if (strlen > 1) {
                    Syspara.printjknum = str[1].toString();
                }
                if (strlen > 2) {
                    Syspara.isGetNetMaxJkdNo = str[2].toString();
                }
            }
                break;
            case "4T": {
                Syspara.closedrawer = params[i].paravalue;
            }
                break;
            case "J1": {
                const str = params[i].paravalue.split(',');
                const strlen = str.length;
                if (strlen > 0) {
                    Syspara.grantpwd = str[0].toString();
                }
                if (strlen > 1) {
                    Syspara.grtpwdshow = str[1].toString();
                }
                if (strlen > 2) {
                    Syspara.grantpasswordmsr = str[2].toString();
                }
            }
                break;
            case "J4": {
                Syspara.msrspeed = params[i].paravalue;
            }
                break;
            case "J7": {
                Syspara.havebroken = params[i].paravalue;
            }
                break;
            case "JA": {
                //暂不需要
                // Syspara.paysummarymode = params[i].paravalue;
            }
                break;
            case "JB": {
                //暂时不需要
                // Syspara.autojfexchange = params[i].paravalue;
            }
                break;
            case "JC": {
                Syspara.quitpwd = params[i].paravalue;
            }
                break;
            case "JG": {
                //暂不需要
                // Syspara.iscardmsg = params[i].paravalue;
            }
                break;
            case "JH": {
                //paravalue未返回
                //  const str = params[i].paravalue.split(',');
                //  const strlen = str.length;
                //  if(strlen > 0){
                //      Syspara.printdelayline = str[1];
                //  }
                //  if(strlen > 0){
                //      Syspara.printdelaysec = str[2];
                //  }
            }
                break;
            case "JL": {
                //暂不需要
                // Syspara.onlyUseBReturn = params[i].paravalue;
            }
                break;
            case "JN": {
                //暂不需要
                // Syspara.mjPaymentRule = params[i].paravalue;
            }
                break;
            case "JP": {
                //暂不需要
                // const str = params[i].paravalue.split(',');
                // const strlen = str.length;
                // if(strlen > 0){
                //     Syspara.lczcmaxmoney = str[0].toString();
                // }
                // if(strlen > 1){
                //     Syspara.isAutoLczc = str[1].toString();
                // }
                // if(strlen > 2){
                //     Syspara.isAutoPayByLczc = str[2].toString();
                // }
                // if(strlen > 3){
                //     Syspara.isReMSR = str[3].toString();
                // }
            }
                break;
            case "JV": {
                //暂不需要
                // const str = params[i].paravalue.split(',');
                // const strlen = str.length;
                // if(strlen > 0){
                //     Syspara.customerbyconnect = str[0].toString();
                // }
                // if(strlen > 1){
                //     Syspara.customerbysale = str[1].toString();
                // }
                // if(strlen > 2){
                //     Syspara.custDisconnetNoPeriod = str[2].toString();
                // }
            }
                break;
            case "JY": {
                Syspara.printpaysummary = params[i].paravalue;
            }
                break;
            case "JZ": {
                Syspara.isinputpremoney = params[i].paravalue;
            }
                break;
            case "O3": {
                const str = params[i].paravalue.split(',');
                const strlen = str.length;
                // if(strlen > 0){//暂不需要
                //     Syspara.mzkbillnum = str[0].toString();
                // }
                if (strlen > 0) {
                    Syspara.salebillnum = str[0].toString();
                }
                if (strlen > 1) {
                    Syspara.isGoodsSryPrn = str[1].toString();
                }
            }
                break;
            case "O6": {
                //暂不需要
                // Syspara.printInfo1 = params[i].paravalue;
            }
                break;
            case "O7": {
                //暂不需要
                // Syspara.printInfo2 = params[i].paravalue;
            }
                break;
            case "O8": {
                //暂不需要
                // const str = params[i].paravalue.split(',');
                // const strlen = str.length;
                // if(strlen > 0){
                //     Syspara.setPriceBackStatus = str[0].toString();
                // }
                // if(strlen > 1){
                //     Syspara.isbackpricestatus = str[1].toString();
                // }
            }
                break;
            case "O9": {
                //暂不需要
                // Syspara.inputyyyfph = params[i].paravalue;
            }
                break;
            case "OB": {
                const str = params[i].paravalue.split(',');
                const strlen = str.length;
                if (strlen > 0) {
                    Syspara.bankprint = str[0].toString();
                }
                if (strlen > 1) {
                    Syspara.displaybanktype = str[1].toString();
                }
                // if(strlen > 2){
                //     Syspara.paycodebanktype = str[2].toString();
                // }//暂不需要
            }
                break;
            case "OD": {
                //暂不需要
                // Syspara.findcustfjk = params[i].paravalue;
            }
                break;
            case "OG": {
                Syspara.backRefundMSR = params[i].paravalue;
            }
                break;
            case "OH": {
                Syspara.validservicedate = params[i].paravalue;
            }
                break;
            case "OL": {
                //暂不需要
                // Syspara.printpaymode = params[i].paravalue;
            }
                break;
            case "OM": {
                //暂不需要
                // Syspara.debugtracelog = params[i].paravalue;
            }
                break;
            case "ON": {
                //暂不需要
                // Syspara.mzkStatistics = params[i].paravalue;
            }
                break;
            case "OY": {
                Syspara.issetprinter = params[i].paravalue;
            }
                break;
            case "OZ": {
                const str = params[i].paravalue.split(',');
                const strlen = str.length;
                if (strlen > 0) {
                    Syspara.maxSaleGoodsCount = str[0].toString();
                }
                if (strlen > 1) {
                    Syspara.maxSalePayCount = str[1].toString();
                }
                if (strlen > 2) {
                    Syspara.maxSaleGoodsQuantity = str[2].toString();
                }
                if (strlen > 3) {
                    Syspara.maxSaleGoodsMoney = str[3].toString();
                }
                if (strlen > 4) {
                    Syspara.maxSaleMoney = str[4].toString();
                }
            }
                break;
            case "P1": {
                const str = params[i].paravalue.split(',');
                const strlen = str.length;
                if (strlen > 0) {
                    Syspara.printInBill = str[0].toString();
                }
                if (strlen > 1) {
                    Syspara.isHcPrintBill = str[1].toString();
                }
            }
                break;
            case "P2": {
                //暂不需要
                // const str = params[i].paravalue.split(',');
                // const strlen = str.length;
                // if(strlen > 0){
                //     Syspara.removeGoodsModel = str[0].toString();
                // }
                // if(strlen > 1){
                //     Syspara.removeGoodsMsg = str[1].toString();
                // }
            }
                break;
            case "P4": {
                const str = params[i].paravalue.split(',');
                const strlen = str.length;
                if (strlen > 0) {
                    Syspara.onlineGd = str[0].toString();
                }
                if (strlen > 1) {
                    Syspara.isPrintGd = str[1].toString();
                }
                if (strlen > 2) {
                    Syspara.gdTimes = str[2].toString();
                }
            }
                break;
            case "PD": {
                Syspara.issaleby0 = params[i].paravalue;
            }
                break;
            case "PE": {
                //暂不考虑
                // Syspara.iscloseJkUI = params[i].paravalue;
            }
                break;
            case "PF": {
                //暂不考虑
                // Syspara.isshowAllBcData = params[i].paravalue;
            }
                break;
            case "PN": {
                const str = params[i].paravalue.split('|');
                const strlen = str.length;
                if (strlen > 0) {
                    Syspara.nodeletepaycode = str[0].split(',');
                }
                if (strlen > 1) {
                    Syspara.nozjfkpaycode = str[1].split(',');
                }
            }
                break;
            case "PO": {
                Syspara.verifyDzcmname = params[i].paravalue;
            }
                break;
            case "PT": {
                //暂不需要
            }
                break;
            case "SW": {
                //未返回
            }
                break;
            case "HG": {
                //未返回
            }
                break;
            case "HJ": {
                //暂不需要
            }
                break;
            case "DY": {
                Syspara.notyxPaycode = params[i].paravalue;
            }
                break;
            case "Q3": {
                Syspara.returnKhcode = params[i].paravalue;
            }
                break;
            case "JN": {
                //重复暂时不需要
                // Syspara.mjPaymentRule = params[i].paravalue;
            }
                break;
            case "BBFS": {
                Syspara.bbPaycode = params[i].paravalue;
                if (params[i].paravalue.indexOf(',') != -1) {
                    Syspara.bbcodeHBFH = params[i].paravalue.split(',');
                }
            }
                break;
            case "WKFS": {
                Syspara.wkzfPaycode = params[i].paravalue;
            }
                break;
            case "BZQ0": {
                Syspara.ischeckBzq = params[i].paravalue;
            }
                break;
            case "BZQ1": {
                Syspara.bzqMaxday1 = params[i].paravalue;
            }
                break;
            case "BZQ1": {
                Syspara.bzqMaxday2 = params[i].paravalue;
            }
                break;
            case "QXTH": {
                Syspara.xdIsaddfphm = params[i].paravalue;
            }
                break;
            case "XDFS": {
                Syspara.notxdPaycode = params[i].paravalue.split(',');
            }
                break;
            case "MQFS": {
                Syspara.buylqPaycode = params[i].paravalue.split(',');
            }
                break;
            case "SCHS": {
                Syspara.maxDelhs = params[i].paravalue;
            }
                break;
            case "DWSC": {
                Syspara.dwtime = params[i].paravalue;
            }
                break;
            case "OC": {
                if (params[i].paravalue.indexOf('|') != -1) {
                    Syspara.payObj = params[i].paravalue.split('|');
                }
            }
                break;
            case "BBFS": {
                if (params[i].paravalue.indexOf(',') != -1) {
                    Syspara.bbcodeHBFH = params[i].paravalue.split(',');
                }
            }
                break;
            case "HSXP": {
                Syspara.dateHSXP = params[i].paravalue;
            }
                break;
            case "FQHD": {
                if (params[i].paravalue.indexOf('|') != -1) {
                    Syspara.fqhdCheck = params[i].paravalue.split('|')[0];
                    Syspara.fqhdSCB = params[i].paravalue.split('|')[1];
                    Syspara.fqhdManhattan = params[i].paravalue.split('|')[2];
                }
            }
                break;
            case "YHRQ": {
                Syspara.yhrqTS = params[i].paravalue.split(',');
            }
                break;
            case "JHSP": {
                Syspara.JHSP = params[i].paravalue && params[i].paravalue.split('|')
            }
                break;
            case "JRRQ": {
                Syspara.JRRQ = params[i].paravalue && params[i].paravalue.split(',')
            }
                break;
            default: {
                break;
            }
        }
    }
    entid = data.elecscalecoderule[0].entId;
    return { jygs, entid, hbtime, Syspara };
}

function jarOperat(data, callback) {
    let jsonPath = path.join(__dirname, '../javaPos.ConfigFile/PrintData.json');
    fs.writeFile(jsonPath, JSON.stringify(data), 'utf8', (err) => {
        if (err) throw err;
        openJar(`${path.join(__dirname, '../extjar/print.jar')}`).then(res => {
            let jsonPath = path.join(__dirname, '../javaPos.ConfigFile/Print.json');
            let { code } = JSON.parse(fs.readFileSync(jsonPath, 'UTF-8'));
            callback && callback(code);
        }).catch(err => {
            writeLog(err);
            callback && callback(-1);
        });
    });
}

function installSystem() {
    installWindow = new BrowserWindow({
        show: false,
        resizable: false,
        frame: dev,
        useContentSize: true,
        fullscreenable: false,
        width: 960,
        height: 370,
        webPreferences: { defaultFontFamily: { standard: "Microsoft YaHei" }, nodeIntegration: true }
    });

    installWindow.once('ready-to-show', () => {
        let flag = false;
        ipcMain.on('Install', (event, arg) => {
            if (flag) return;
            flag = true;
            let url = arg.split("//")[1];
            let httpMod = arg.split("//")[0].split(':')[0];
            if (!url || (httpMod != "http" && httpMod != "https")) {
                dialog.showMessageBoxSync(installWindow, {
                    type: 'info',
                    message: '安装失敗！',
                    detail: '二維碼錯誤！'
                });
                flag = false;
                return;
            }
            http = require(httpMod);
            const options = {
                hostname: url.split("/")[0],
                path: url.slice(url.indexOf("/")) + '&token=1592161107706568120',
                // port: 80,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8'
                }
            };
            let req = http.request(options, (res) => {
                res.setEncoding('utf8');
                res.on('data', (chunk) => {
                    data = data + chunk;
                });
                res.on('end', () => {
                    try {
                        data = JSON.parse(data);
                        if (data.returncode === "0") {
                            let config = data.data.posConfig;
                            // console.log(config);
                            let ini = "[System]\r\n";
                            for (let x in config) {
                                ini += `${x}=${config[x]}\r\n`;
                            }
                            console.log(ini);
                            fs.writeFileSync(path.join(__dirname, '../../../System.ini'), ini, 'UTF-8');
                            installWindow.destroy();
                        } else {
                            data = "";
                            dialog.showMessageBoxSync(installWindow, {
                                type: 'info',
                                message: '安装失敗！',
                                detail: '參數錯誤！'
                            });
                        }
                    } catch (err) {
                        // throw err;
                        data = "";
                        dialog.showMessageBoxSync(installWindow, {
                            type: 'info',
                            message: '安装失敗！',
                            detail: '參數錯誤！'
                        });
                    }
                    finally {
                        flag = false;
                    }
                });
            });

            req.on('error', (e) => {
                dialog.showMessageBoxSync(installWindow, {
                    type: 'info',
                    message: '安装失敗！',
                    detail: '二維碼錯誤！'
                });
                flag = false;
            });
            req.write("{}");
            req.end();
        });
        installWindow.show();
    });

    installWindow.once("closed", () => {
        if (data) {
            data = "";
            loadInitialize();
        } else {
            installWindow = null;
            app.quit();
        }
    });

    installWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'install.html'),
        protocol: 'file:',
        slashes: true
    }));
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

// Menu.setApplicationMenu(null);

function createWindow() {
    initializing();
    if (!dev && !fs.existsSync(path.join(__dirname, '../../../System.ini'))) {
        installSystem();
        // let ini = fs.readFileSync(path.join(__dirname, '../javaPos.ConfigFile/System.ini'), 'UTF-8');
        // fs.writeFileSync(path.join(__dirname, '../../../System.ini'), ini, 'UTF-8');
    } else {
        loadInitialize();
    }
}

function loadInitialize() {
    info = ini.parse(fs.readFileSync(path.join(__dirname, dev ? '../System.ini' : '../../../System.ini'), 'UTF-8'));
    posMode = info['System'].posMode;
    openDevTools = info['System'].openDevTools;
    fullscreen = info['System'].fullscreen;
    syncService = info['System'].syncService;
    syjh = info['System'].syjh;
    mkt = info['System'].mkt;
    ip = info['System'].ip;
    erpCode = info['System'].erpCode;
    http = require(ip.split(':')[0]);
    ipath = info['System'].path;
    updateIP = info['System'].updateIP;
    ipurl = ip.split('//')[1];
    hostname = ipurl.split(':')[0];
    ports = ipurl.split(':')[1];
    centerURL = info['System'].centerURL;
    PagerType = info['System'].PagerType;
    PagerFNo = info['System'].PagerFNo || "1";
    let displayLine = info['System'].displayLine && info['System'].displayLine.split("|");
    let cardReader = info['System'].cardReader && info['System'].cardReader.split("|");
    let pagerSystem = info['System'].pagerSystem && info['System'].pagerSystem.split("|");
    portDisplayLine = new SerialPort(displayLine ? displayLine[0] : "COM1", { autoOpen: false, baudRate: parseInt(displayLine ? displayLine[1] : 19200) });
    portCardReader = new SerialPort(cardReader ? cardReader[0] : "COM4", { autoOpen: false, baudRate: parseInt(cardReader ? cardReader[1] : 19200) });
    portPagerSystem = new SerialPort(pagerSystem ? pagerSystem[0] : "COM9", { autoOpen: false, baudRate: parseInt(pagerSystem ? pagerSystem[1] : 9600) });
    let versionPath = "D:/aeonPossv/serviceversion.ini";
    if (fs.existsSync(versionPath)) {
        serviceVersion = fs.readFileSync(versionPath, 'UTF-8');
    }
    initializeWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'initialize.html'),
        protocol: 'file:',
        slashes: true
    }));
}

function initializing() {
    initializeWindow = new BrowserWindow({
        show: false,
        resizable: false,
        frame: false,
        useContentSize: true,
        fullscreenable: false,
        width: 960,
        height: 370,
        // width: 750,
        // height: 290,
        webPreferences: {
            defaultFontFamily: { standard: "Microsoft YaHei" },
            nodeIntegration: true,
            // zoomFactor: 0.78125
        }
    });

    initializeWindow.once('ready-to-show', () => {
        initializeWindow.show();
        if (!dev && autoUpdater && updateIP) {
            appUpdate(updateIP);
        }
        else {
            Initialize();
        }
    });

    initializeWindow.on('closed', function () {
        if (!initializeSuccess) return app.quit();
        if (!initializeWindow) return;
        initializeWindow = null;
        mainBind();
        if (dev) {
            mainWindow.loadURL(`http://localhost:${package.post}/`);

            let portEvent = "";

            portPagerSystem.on('error', err => {
                // dialog.showMessageBoxSync(mainWindow, { message: err.message });
                console.log("error");
            });

            portPagerSystem.on('close', err => {
                // dialog.showMessageBoxSync(mainWindow,{ message: err.message });
                console.log("close");
            });

            portPagerSystem.on('data', data => {
                writeLog("pagerData:" + data);
                switch (PagerType) {
                    case "KH":
                        portEvent += data;
                        break;
                    case "WP":
                        portEvent = data;
                        break;
                    default:
                        portEvent += data;
                        break;
                }
            });

            let buf1 = Buffer.from([0x01]);
            let buf3 = Buffer.from([0x02, 0x03, 0x04]);
            ipcMain.on("PagerSystem", (event, arg) => {
                portEvent = "OK";
                let portWrite = () => {
                    switch (PagerType) {
                        case "KH":
                            portPagerSystem.write(`**SET_NO:${arg.no};${arg.code.join(",")}*`, 'ascii');
                            break;
                        case "WP":
                            portPagerSystem.write(Buffer.concat([buf1, Buffer.from(arg.no), buf3]));
                            break;
                        default:
                            portPagerSystem.write(`**SET_NO:${arg.no};${arg.code.join(",")}*`, 'ascii');
                            break;
                    }
                    setTimeout(() => {
                        if ((portEvent.indexOf('O') != -1 || portEvent.indexOf('K') != -1) && portEvent.indexOf('LOW') == -1) {
                            event.returnValue = 1;
                        } else {
                            event.returnValue = 0;
                        }
                    }, 1500);
                }
                if (portPagerSystem.isOpen) {
                    portWrite();
                } else {
                    portPagerSystem.open(err => {
                        if (err) {
                            event.returnValue = 0;
                            // dialog.showMessageBoxSync(mainWindow, { message: "傳呼器連接異常！" });
                        } else {
                            portWrite();
                        }
                    });
                }
            });
        } else {
            mainWindow.loadURL(url.format({
                pathname: path.join(__dirname, 'index.html'),
                protocol: 'file:',
                slashes: true
            }));

            //串口操作
            const parser = portCardReader.pipe(new Readline({ delimiter: '\r' }));
            portCardReader.on('error', err => {
                // dialog.showMessageBoxSync(mainWindow, { message: err.message });
            });
            portCardReader.open(err => {
                if (err) {
                    // dialog.showMessageBoxSync(mainWindow, { message: err.message });
                } else {
                    parser.on("data", data => {
                        if (data.indexOf("%") != -1 || data.indexOf("+") != -1) {
                            let index = data.indexOf(";");
                            if (index == -1) return;
                            data = data.slice(index + 1, index + 38);
                            mainWindow.webContents.send("Card", data);
                            data = data.split("=")[0];
                        } else if (data.indexOf("=") != -1) {
                            let index = data.indexOf("=");
                            let start = data.indexOf(";");
                            if (data.length - index >= 10) {
                                data = data.slice(start + 1, start + 8);
                            } else {
                                data = data.slice(start + 1, start + 12);
                            }
                        } else {
                            data = "J" + data.slice(data.indexOf(";") + 1, data.indexOf("?"));
                        }
                        // dialog.showMessageBoxSync({ message: 'data' + data });
                        mainWindow.webContents.send("Com", data);
                        // mainWindow.webContents.send("Com", '1234');
                    });
                }
            });

            portDisplayLine.open(err => {
                if (err) {
                    //dialog.showMessageBoxSync(mainWindow,{ message: err.message });
                } else {
                    portDisplayLine.write(Buffer.from(["0x0c"]));
                    portDisplayLine.write("WELCOME TO AEON");
                    ipcMain.on("LineDisplay", (event, arg) => {
                        portDisplayLine.write(Buffer.from(["0x0c"]));
                        let { itemCode, qty, price, total, cash, change } = arg.data;
                        let length = 20;
                        let lengthQ = 12;
                        let lineTop = "";
                        let lineBot = "Total:";
                        switch (arg.type) {
                            case 1:
                                lineTop = `${itemCode}${' '.repeat(Math.max(1, lengthQ - (itemCode + qty).length))}${qty}${' '.repeat(Math.max(1, length - lengthQ - price.length))}${price}`;
                                let lengthA = lineTop.length > length ? lineTop.length - length : 0;
                                lineBot = `${lineBot}${' '.repeat(length - lengthA - (lineBot + total).length)}${total}`;
                                break;
                            case 2:
                                if (total && total.toString().indexOf('.') == -1) total += ".0";
                                lineBot = `${lineBot}${' '.repeat(length - (lineBot + total).length)}${total}`;
                                break;
                            case 3:
                                lineTop = "Cash";
                                lineBot = "Change";
                                if (cash && cash.toString().indexOf('.') == -1) cash += ".0";
                                if (change && change.toString().indexOf('.') == -1) change += ".0";
                                lineTop = `${lineTop}${' '.repeat(length - (lineTop + cash).length)}${cash}`;
                                lineBot = `${lineBot}${' '.repeat(length - (lineBot + change).length)}${change}`;
                                break;
                            default:
                                break;
                        }
                        portDisplayLine.write(`${lineTop}${lineBot}`);
                    });
                    ipcMain.on("welcome", (event, arg) => {
                        portDisplayLine.write(Buffer.from(["0x0c"]));
                        portDisplayLine.write("WELCOME TO AEON");
                    });
                }
            });

            let portEvent = "";

            portPagerSystem.on('error', err => {
                // dialog.showMessageBoxSync(mainWindow, { message: err.message });
                console.log("error");
            });

            portPagerSystem.on('close', err => {
                // dialog.showMessageBoxSync(mainWindow,{ message: err.message });
                console.log("close");
            });

            portPagerSystem.on('data', data => {
                writeLog("pagerData:" + data);
                switch (PagerType) {
                    case "KH":
                        portEvent += data;
                        break;
                    case "WP":
                        portEvent = data;
                        break;
                    default:
                        portEvent += data;
                        break;
                }
            });

            let buf1 = Buffer.from([0x01]);
            let buf3 = Buffer.from([0x02, 0x03, 0x04]);
            ipcMain.on("PagerSystem", (event, arg) => {
                portEvent = "";
                let portWrite = () => {
                    switch (PagerType) {
                        case "KH":
                            let pagerStr = `**SET_NO:${arg.no};${arg.code.join(",")}*;`;
                            writeLog(pagerStr);
                            portPagerSystem.write(pagerStr, 'ascii');
                            break;
                        case "WP":
                            let pagerBuffer = Buffer.concat([buf1, Buffer.from(arg.no.join("00,") + "00"), buf3]);
                            writeLog(pagerBuffer.toString());
                            portPagerSystem.write(pagerBuffer);
                            break;
                        default:
                            portPagerSystem.write(`**SET_NO:${arg.no};${arg.code.join(",")}*;`, 'ascii');
                            break;
                    }
                    setTimeout(() => {
                        if ((portEvent.indexOf('O') != -1 || portEvent.indexOf('K') != -1) && portEvent.indexOf('LOW') == -1) {
                            event.returnValue = 1;
                        } else {
                            event.returnValue = 0;
                        }
                    }, 1500);
                }
                if (portPagerSystem.isOpen) {
                    portWrite();
                } else {
                    portPagerSystem.open(err => {
                        if (err) {
                            event.returnValue = 0;
                            // dialog.showMessageBoxSync(mainWindow, { message: "傳呼器連接異常！" });
                        } else {
                            portWrite();
                        }
                    });
                }
            });
        }
    });

    // Create the browser window.
    mainWindow = new BrowserWindow({
        show: false,
        frame: dev,
        resizable: dev,
        useContentSize: true,
        fullscreenable: dev,
        fullscreen: (fullscreen == '1'),
        width: dev ? 1024 : 800,
        height: dev ? 768 : 600,
        webPreferences: {
            nodeIntegration: true,
            zoomFactor: dev ? 1 : 0.78125
        }
    });
    // and load the index.html of the app.

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        if (dev) {
            displayLineWindow.loadURL(`http://localhost:${package.post}`);
        } else {
            displayLineWindow.loadURL(url.format({
                pathname: path.join(__dirname, 'index.html'),
                protocol: 'file:',
                slashes: true
            }));
        }
        // Open the DevTools.
        if (openDevTools == 1) {
            mainWindow.openDevTools();
            displayLineWindow.openDevTools();
            subWindow.openDevTools();
        }
    });

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        subWindow.destroy();
        displayLineWindow.destroy();
    });

    mainWindow.webContents.on('did-finish-load', () => {
        // mainWindow.webContents.send("Initialize", JSON.stringify({ id, ipAdress }));
        globalShortcut.register("Alt+Z", () => {
            // Do stuff when Y and either Command/Control is pressed.
            mainWindow.webContents.send("back");
        });
        globalShortcut.register("Alt+C", () => {
            // Do stuff when Y and either Command/Control is pressed.
            mainWindow.webContents.send("Com", '1234');
        });
        globalShortcut.register("Alt+V", () => {
            // Do stuff when Y and either Command/Control is pressed.
            mainWindow.webContents.send("Com", info['System'].NO);
        });
        globalShortcut.register("Alt+L", () => {
            // Do stuff when Y and either Command/Control is pressed.
            mainWindow.webContents.send("Card", "4509361234567890=19061234567890123456");
        });
        globalShortcut.register("Alt+S", () => {
            // Do stuff when Y and either Command/Control is pressed.
            mainWindow.webContents.send("Com", "9901976");
        });
    });

    // if (dev) {
    //     const menuBuilder = new MenuBilder(mainWindow);
    //     menuBuilder.buildMenu();
    // }



    // mainWindow.webContents.on('context-menu', (e, props) => {
    //     const { x, y } = props;

    //     Menu.buildFromTemplate([
    //         {
    //             label: '调试模式',
    //             click: () => {
    //                 mainWindow.inspectElement(x, y);
    //             }
    //         },
    //         {
    //             label: '最大化',
    //             click: () => {
    //                 mainWindow.maximize();
    //             }
    //         },
    //         {
    //             label: '最小化',
    //             click: () => {
    //                 mainWindow.minimize();
    //             }
    //         },
    //         {
    //             label: '还原',
    //             click: () => {
    //                 mainWindow.restore();
    //             }
    //         },
    //         {
    //             label: '关闭',
    //             click: () => {
    //                 app.quit();
    //             }
    //         },
    //         {
    //             label: '全屏切换',
    //             accelerator: 'Ctrl+Command+F',
    //             click: () => {
    //                 mainWindow.setFullScreen(!mainWindow.isFullScreen());
    //             }
    //         }
    //     ]).popup(mainWindow);
    // });

    subWindow = new BrowserWindow({
        show: false,
        frame: dev,
        resizable: dev,
        useContentSize: true,
        fullscreenable: dev,
        fullscreen: (fullscreen == '1'),
        width: dev ? 1024 : 800,
        height: dev ? 768 : 600,
        x: dev ? 500 : 800,
        y: 0,
        webPreferences: {
            nodeIntegration: true,
            zoomFactor: dev ? 1 : 0.78125
        }
    });

    subWindow.once('ready-to-show', () => {
        subWindow.show();
    });

    // if (dev) {
    //     const subMenubuilder = new MenuBilder(subWindow);
    //     subMenubuilder.buildMenu();
    // }

    displayLineWindow = new BrowserWindow({
        show: false,
        frame: dev,
        resizable: dev,
        useContentSize: true,
        fullscreenable: dev,
        fullscreen: (fullscreen == '1'),
        width: dev ? 1024 : 800,
        height: dev ? 768 : 600,
        x: dev ? 0 : -800,
        y: 0,
        webPreferences: {
            nodeIntegration: true,
            zoomFactor: dev ? 1 : 0.78125
        }
    });

    displayLineWindow.once('ready-to-show', () => {
        displayLineWindow.show();
        if (posMode != 0) {
            if (dev) {
                subWindow.loadURL(`http://localhost:${package.post}`);
            } else {
                subWindow.loadURL(url.format({
                    pathname: path.join(__dirname, 'index.html'),
                    protocol: 'file:',
                    slashes: true
                }));
            }
        }
    });

    // if (dev) {
    //     const dlMenubuilder = new MenuBilder(displayLineWindow);
    //     dlMenubuilder.buildMenu();
    // }
}

function appUpdate(updateIP) {
    request.get(`${updateIP}/RELEASES`, (error, response, body) => {
        if (error || response.statusCode != 200) {
            Initialize();
        } else {
            try {
                if (body.split(" ")[1].split("-")[0] == package.name) {
                    const feed = `${updateIP}/`;
                    let flag = false;
                    let updataFlag = false;
                    autoUpdater.setFeedURL(feed);
                    autoUpdater.on('error', (err) => {
                        writeLog(err);
                        if (flag) {
                            if (updataFlag) Initialize();
                            return;
                        } else {
                            flag = true;
                        }
                        Initialize();
                    });
                    autoUpdater.on('update-available', () => {
                        writeLog('update-available');
                        updataFlag = true;
                        if (flag) {
                            return;
                        } else {
                            flag = true;
                        }
                        initializeWindow.webContents.send("Update", 'start');
                    });
                    autoUpdater.on('update-not-available', () => {
                        writeLog('update-not-available');
                        if (flag) {
                            return;
                        } else {
                            flag = true;
                        }
                        Initialize();
                    });
                    autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
                        const dialogOpts = {
                            type: 'info',
                            buttons: ['Restart', 'Later'],
                            title: 'Application Update',
                            message: process.platform === 'win32' ? releaseNotes : releaseName,
                            detail: 'A new version has been downloaded. Restart the application to apply the updates.'
                        }

                        dialog.showMessageBox(initializeWindow, dialogOpts).then(({ response }) => {
                            initializeWindow = null;
                            if (response === 0) {
                                autoUpdater.quitAndInstall();
                            } else {
                                app.quit();
                            }
                        });
                    })
                    autoUpdater.checkForUpdates();
                } else {
                    Initialize();
                }
            } catch (error) {
                Initialize();
            }
        }
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        // uploadLog(info['System'], err => {
        //     console.log(err);
        // });
        clearInterval(hb);
        // if (port.isOpen) {
        //     port.close();
        // }
        // taskKill(() => {
        app.quit();
        //程序结束后关机
        if (shutdown && !dev) childProcess.execSync("shutdown /s /t 0");
        // childProcess.execSync("shutdown /s /t 0");
        // });
    }
});

app.on('will-quit', function () {

});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
