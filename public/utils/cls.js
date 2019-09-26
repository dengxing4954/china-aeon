const path = require('path');
const ffi = require('ffi');
const ref = require('ref');
// const iconv = require('../node_modules/iconv-lite');
const normalize = require("./normalize");

const dllPath = path.join(__dirname, "../../dll/CLS");
process.env.PATH = `${process.env.PATH}${path.delimiter}${dllPath}`;
const dll = ffi.Library(`${dllPath}/PosCls.dll`, {
    Exec: ["int", ["int", "string", "string", "string"]]
});

const CLS = (request) => {
    let { transType = "09", posCode = "", invoiceNo = "", mcNo = "", mktNo = "", cardPrintNo = "", amount = "", balance = "", cradTransNo = "", reserve = "" } = request;
    transType = transType.toString().padStart(2, "0");
    posCode = posCode.toString().padStart(6, "0");
    invoiceNo = invoiceNo.padStart(10, "0");
    mcNo = mcNo.toString().padStart(8, "0");
    mktNo = mktNo.toString().padStart(8, "0");
    cardPrintNo = cardPrintNo.toString().padStart(10, "0");
    amount = normalize(amount.toString()).replace(".", "").padStart(12, "0");
    balance = normalize(balance.toString()).replace(".", "").padStart(12, "0");
    cradTransNo = cradTransNo.toString().padStart(8, "0");
    reserve = reserve.toString().padStart(10, "0");
    let input = `${transType}#${posCode}#${invoiceNo}#${mcNo}#${mktNo}#${cardPrintNo}#${amount}#${balance}#${cradTransNo}#${reserve}`;
    let responseLen = ref.alloc("CString");
    let response = ref.alloc("CString");
    let call = dll.Exec(input.length, input, responseLen, response);
    console.log(call);
    console.log(responseLen.deref());
    console.log(response.deref());
    let arr = response.deref().split("#");
    // let str = `09#00#102700040745#20190711145028#00003365#8027110330398018#59200305#8303980180#11#03#102702006094#20190711091337#000000000001#000000003849#13#00000115#00004893#77A7BA98#08#00200000000000000000`;
    const data = {
        code: "0",
        msg: "ok",
        psamCardNo: arr[2],
        saleDate: arr[3],
        psamSerialNo: arr[4],
        logicCardNo: arr[5],
        MaterialCardNo: arr[6],
        carveNo: arr[7],
        mainCardType: arr[8],
        subCardType: arr[9],
        lastPsamCardNo: arr[10],
        lastSaleDate: arr[11],
        transAmount: parseInt(arr[12]) / 100,
        balance: parseInt(arr[13]) / 100,
        transType: arr[14],
        onlineCounter: arr[15],
        offlineCounter: arr[16],
        transTAC: arr[17],
        flag: arr[18],
        reserve: arr[19]
    }
    return call == 0 && arr[1] == "00" ? data : { code: "10000", msg: "error" };
}

module.exports = CLS;