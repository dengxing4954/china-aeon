const { ipcRenderer } = require('electron');
ipcRenderer.on("back", function () {
    history.go(-1);
});

// 刷卡绑定
ipcRenderer.on('Com', function (event, data) {
    window.EventEmitter && window.EventEmitter.emit('Com', data);
});

// 磁道刷卡
ipcRenderer.on('Card', function (event, data) {
    window.EventEmitter && window.EventEmitter.emit('Card', data);
});

// 脱网
ipcRenderer.on('Online', function (event, data) {
    window.EventEmitter && window.EventEmitter.emit('Online', data);
});

// 钱箱
ipcRenderer.on('Drawer', function (event, data) {
    window.EventEmitter && window.EventEmitter.emit('Drawer', data);
});

ipcRenderer.on('setInitializeState', function (event, data) {
    window.EventEmitter && window.EventEmitter.emit("setInitializeState", data);
});

// 客显广告数据交互
ipcRenderer.on('dlWindow', function (event, data) {
    window.EventEmitter && window.EventEmitter.emit("dlWindow", data);
});

// 接受扫描数据
ipcRenderer.on('scanSubmit', function (event, data) {
    window.EventEmitter && window.EventEmitter.emit("setFlowList", data);
});

ipcRenderer.on("KeyBoard", function (event, data) {
    window.EventEmitter && window.EventEmitter.emit("KeyBoard", data);
});

// 初始化
function Initialize() {
    var initializeData = ipcRenderer.sendSync('Initialize');
    window["posKeyboard"] = initializeData.data.poskeyboard.map(function (item, index) {
        return { keyCode: item.keycode, keyName: item.keyname, funcName: item.funcname };
    });
    console.log(posKeyboard);
    return initializeData;
}

// 重启应用
function reStart() {
    return ipcRenderer.send('reStart');
}

// 配置文件打开
function iniOpen(arg) {
    return ipcRenderer.sendSync('iniOpen', arg);
}

// 配置文件保存
function iniSave(arg) {
    return ipcRenderer.sendSync('iniSave', arg);
}

// 更新小票号
function UpdateXPH() {
    ipcRenderer.send('UpdateXPH');
}

// 更新AMC小票号
function UpdateAMC() {
    var amcNo = ipcRenderer.sendSync('UpdateAMC');
    window.EventEmitter && window.EventEmitter.emit('amcNo', amcNo);
}

// 同步收银机状态
function SyncCASHIER(cash) {
    return ipcRenderer.sendSync('SyncCASHIER', cash);
}

// 脱机同步
function offlineSync(data) {
    return ipcRenderer.sendSync('offlineSync', data);
}

// 打印
function Print(data, callback) {
    ipcRenderer.send('Print', data);
    ipcRenderer.once('Print', function (event, data) {
        console.log(data);
        if (callback) {
            return callback(data);
        }
        window.PrintMessage && window.PrintMessage(data.message);
    });
}

// 打开钱箱
function openCashbox() {
    ipcRenderer.send('OpenCashbox');
}

// 钱箱状态
function getCashboxStatus() {
    ipcRenderer.send('getCashboxStatus');
}

// 武汉通
function CLS(data) {
    return ipcRenderer.sendSync("CLS", data);
}

// 工行
function ICBC(data) {
    return ipcRenderer.sendSync("ICBC", data);
}

// 银联
function GMC(data) {
    //数据
    // {
    //     appCode: "00",
    //     posCode: "123",
    //     operateCode: "9590068",
    //     tradeFlag: "01",
    //     amount: "0.01",
    //     originalTradeDate: "190529",
    //     originalTradeCode: "1234",
    //     originalVoucherCode: "000025",
    //     lrcCheckout: "132",
    //     IMEI: "1234567890",
    //     umsOrderNo: "123124124",
    //     erpOrderNo: "123124124124",
    //     qrcodeId: "123123213123",
    //     appIdKey: "11112222333344444"
    // }
    return ipcRenderer.sendSync("GMC", data);
}

function octLog() {
    ipcRenderer.send('octLog');
}

// 八达通
function Octopus(data) {
    let obj = ipcRenderer.sendSync('Octopus', data);
    return !!obj && !!obj.resData ? obj.resData : null;
}

// 八达通屏显复位
function OctopusClear(data) {
    ipcRenderer.send('OctopusClear', data);
}

// 银行交易
function PaymentBank(data) {
    console.log(data)
    let obj = ipcRenderer.sendSync('PaymentBank', data);
    console.log(obj)
    return !!obj && !!obj.resData ? obj.resData : null;
}

// 清机关闭
function Shutdown(flag) {
    ipcRenderer.send('Shutdown', flag);
}

// 清机关闭
function ClearMachine(arg) {
    ipcRenderer.send('ClearMachine', arg);
}

// 清机OCT
function ClearOCT() {
    ipcRenderer.send('ClearOCT');
}

// log写入
function Log(log, type) {
    type || (type = '2');
    ipcRenderer.send("Log", { log: log, type: type });
}

// log写入
function Bill(arg) {
    ipcRenderer.send("Bill", arg);
}

// 冲正记录
function ReversalLog(arg) {
    ipcRenderer.send("ReversalLog", arg);
}

// 冲正执行
function DoReversal() {
    ipcRenderer.send("DoReversal");
}

// 储值卡冲正
function StoreValueLog(arg) {
    ipcRenderer.send("StoreValueLog", arg);
}

// 储值卡冲正删除记录
function DelLog(arg) {
    ipcRenderer.send("DelLog", arg);
}

// 客显
function LineDisplay(arg) {
    ipcRenderer.send("LineDisplay", arg);
}

// 客显
function welcome() {
    ipcRenderer.send("welcome");
}

// 寻呼系统
function PagerSystem(arg, flag) {
    let code = ipcRenderer.sendSync("PagerSystem", arg);
    if (code && !flag) {
        var pagerNO = ipcRenderer.sendSync('UpdatePagerNO');
        window.EventEmitter && window.EventEmitter.emit('pagerNO', pagerNO);
    }
    return code;
}

// 更新PagerNO小票号
function UpdatePagerNO() {
    var pagerNO = ipcRenderer.sendSync('UpdatePagerNO');
    window.EventEmitter && window.EventEmitter.emit('pagerNO', pagerNO);
    return pagerNO;
}

// 上传本地日志
function UploadLogFind(arg) {
    return ipcRenderer.sendSync("UploadLogFind", arg);
}

function UploadLogIinstant(arg) {
    return ipcRenderer.sendSync("UploadLogIinstant", arg);
}

// 广告屏数据推送
function dlWindow(data) {
    ipcRenderer.send("dlWindow", data);
}

// 扫描结束向主屏推送
function scanSubmit(data) {
    ipcRenderer.send("scanSubmit", data);
}

// 音频播放
window.AudioContext = window.AudioContext || window.webkitAudioContext;
var success, error;
var context = new AudioContext();
var bufferLoader = new BufferLoader(context, ['./assets/success.mp3', './assets/error.mp3'], function (bufferList) {
    success = bufferList[0];
    error = bufferList[1];
});
bufferLoader.load();

function audioPlay(tag) {
    if (!success || !error) return;
    var audio = context.createBufferSource();
    if (tag) {
        audio.buffer = success;
    } else {
        audio.buffer = error;
    }
    audio.connect(context.destination);
    audio.start(0);
}

window.onerror = function (msg, url, l) {
    Log(msg);
}

function bindKeyCode(code, callback) {
    for (var i = 0, len = posKeyboard.length; i < len; i++) {
        if (posKeyboard[i].keyCode == code) {
            callback({
                code: posKeyboard[i].funcCode,
                shortKey: posKeyboard[i].shortKey
            });
        }
    }
}

// 扫码枪
var timeStamp = 0;
var keyFlag = false;
var keyVal = "";

window.addEventListener("keyup", function (event) {
    keyFlag = false;
    if (event.timeStamp - timeStamp >= 30) {
        if (window.fetchCount) return;
        return window.EventEmitter && window.EventEmitter.emit("KeyBoard", { code: event.keyCode, shortKey: null });
        bindKeyCode(event.keyCode, function (key) {
            console.log(key);
            window.EventEmitter && window.EventEmitter.emit("KeyBoard", key);
            for (var x in shortcutKey) {
                if (x == key.code) {
                    return window.EventEmitter && window.EventEmitter.emit("ShortcutKey", shortcutKey[x]);
                }
            }
        });
    } else {
        if (event.keyCode === 13) {
            console.log(keyVal);
            var data = keyVal;
            var flag = true;
            if (data.slice(0, 6).toLowerCase() == "qrcode") {
                flag = false;
                data = data.slice(6);
            } else if (data.indexOf("%") != -1 || data.indexOf("+") != -1) {
                let index = data.indexOf(";");
                if (index != -1) {
                    data = data.slice(index + 1, index + 38);
                    window.EventEmitter && window.EventEmitter.emit("Card", data);
                    data = data.split("=")[0];
                } else {
                    flag = false;
                }
            } else if (data.indexOf("=") != -1) {
                let index = data.indexOf("=");
                let start = data.indexOf(";");
                if (start != -1) {
                    if (data.length - index >= 10) {
                        data = data.slice(start + 1, start + 8);
                    } else {
                        data = data.slice(start + 1, start + 12);
                    }
                } else {
                    if (data.slice(index - 5, index) == "00000") {
                        data = data.slice(0, 11);
                    } else {
                        data = data.slice(0, 16);
                    }
                }
            } else if (data.indexOf(";") != -1) {
                data = "J" + data.slice(data.indexOf(";") + 1, data.indexOf("?"));
            } else {
                flag = false;
            }
            window.EventEmitter && window.EventEmitter.emit(flag ? "Com" : "Scan", data);
            keyVal = "";
        } else {
            if (event.key.length === 1) keyVal += event.key;
        }
    }
});

window.addEventListener("keydown", function (event) {
    if (keyFlag) return;
    timeStamp = event.timeStamp;
    keyFlag = true;
});
