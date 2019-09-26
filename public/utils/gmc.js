const path = require('path');
const ffi = require('ffi');
const ref = require('ref');
const iconv = require('../node_modules/iconv-lite');
const normalize = require("./normalize");

const dllPath = path.join(__dirname, "../../dll/GMC");
process.env.PATH = `${process.env.PATH}${path.delimiter}${dllPath}`;
const dll = ffi.Library(`${dllPath}/posinf.dll`, {
    bankall: ["int", ["string", "string"]]
});

const GMC = (request) => {
    let { appCode = "", posCode = "", operateCode = "", tradeFlag = "", amount = "", originalTradeDate = "", originalTradeCode = "", originalVoucherCode = "", lrcCheckout = "", IMEI = "", umsOrderNo = "", erpOrderNo = "", qrcodeId = "", appIdKey = "" } = request;
    appCode = appCode.toString().padStart(2, "0");
    posCode = posCode.toString().padEnd(8, " ");
    operateCode = operateCode.toString().padEnd(8, " ");
    tradeFlag = tradeFlag.toString().padStart(2, "0");
    amount = normalize(amount.toString()).replace(".", "").padStart(12, "0");
    originalTradeDate = originalTradeDate.toString().padEnd(8, " ");
    originalTradeCode = originalTradeCode.toString().padStart(12, "0");
    originalVoucherCode = originalVoucherCode.toString().padStart(6, "0");
    lrcCheckout = lrcCheckout.toString().padEnd(3, " ");
    IMEI = IMEI.toString().padStart(50, " ");
    umsOrderNo = umsOrderNo.toString().padStart(50, "0");
    erpOrderNo = erpOrderNo.toString().padStart(50, "0");
    qrcodeId = qrcodeId.toString().padStart(32, "0");
    appIdKey = appIdKey.toString().padEnd(300, " ");
    let input = appCode + posCode + operateCode + tradeFlag + amount + originalTradeDate + originalTradeCode + originalVoucherCode + lrcCheckout + IMEI + umsOrderNo + erpOrderNo + qrcodeId + appIdKey;
    let response = Buffer.alloc(792);
    let call = dll.bankall(input, response);
    console.log(call);
    let reData = {
        resp_code: 2,
        bank_code: 4,
        card_no: 20,
        trace: 6,
        pay_amount: 12,
        resp_chin: 40,
        mer_id: 15,
        ter_id: 8,
        batch_no: 6,
        txndate: 4,
        txntime: 6,
        refdata: 12,
        authcode: 6,
        stdate: 4,
        lrc: 3,
        discount_amount: 12,
        cardtype: 2,
        thirdPartyDiscountInstrution: 200,
        thirdPartyName: 50,
        unionMerchant: 50,
        erpMerchant: 50,
        payType: 1,
        queryResCode: 1,
        queryResDesc: 50,
        billQRCode: 200,
        billDate: 8,
        status: 20,
    };
    let len = 0;
    for (let key in reData) {
        len += reData[key];
        reData[key] = iconv.decode(response.slice(len - reData[key], len), "GBK").trim();
    }
    return reData;
}

module.exports = GMC;