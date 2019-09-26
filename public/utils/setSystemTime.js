const path = require('path');
const ffi = require('ffi');
const ref = require('ref');
const Struct = require('ref-struct');

const SYSTEMTIME = Struct({
    wYear: ref.types.int16,
    wMonth: ref.types.int16,
    wDayOfWeek: ref.types.int16,
    wDay: ref.types.int16,
    wHour: ref.types.int16,
    wMinute: ref.types.int16,
    wSecond: ref.types.int16,
    wMilliseconds: ref.types.int16,
});

const dllPath = "C:/Windows/System32";
process.env.PATH = `${process.env.PATH}${path.delimiter}${dllPath}`;
const dll = ffi.Library(`${dllPath}/kernel32.dll`, {
    SetLocalTime: ["bool", [ref.refType(SYSTEMTIME)]]
});

function setSystemTime(dateTime) {
    const DT = {
        wYear: dateTime.getFullYear(),
        wMonth: dateTime.getMonth() + 1,
        wDay: dateTime.getDate(),
        wHour: dateTime.getHours(),
        wMinute: dateTime.getMinutes(),
        wSecond: dateTime.getSeconds()
    }
    const sysTime = new SYSTEMTIME(DT);
    return dll.SetLocalTime(sysTime.ref());
}

module.exports = setSystemTime;