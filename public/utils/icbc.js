const path = require('path');
const ffi = require('ffi');
const ref = require('ref');
const ArrayType = require('ref-array');
const Struct = require('ref-struct');
const iconv = require('../node_modules/iconv-lite');
const normalize = require("./normalize");

const MisposIn = Struct({
    TransType: ArrayType(ref.types.char, 2), //交易指令
    FuncID: ArrayType(ref.types.char, 4), //分行特色脚本ID号
    TransAmount: ArrayType(ref.types.char, 12), //交易金额
    TipAmount: ArrayType(ref.types.char, 12), //小费金额 
    TransDate: ArrayType(ref.types.char, 8), //交易日期
    MisTraceNo: ArrayType(ref.types.char, 6), //MIS流水号
    CardNo: ArrayType(ref.types.char, 19), //交易卡号
    ExpDate: ArrayType(ref.types.char, 4), //卡片有效期
    Track2: ArrayType(ref.types.char, 37), //二磁道信息
    Track3: ArrayType(ref.types.char, 104), //三磁道信息
    ReferNo: ArrayType(ref.types.char, 8), //系统检索号
    AuthNo: ArrayType(ref.types.char, 6), //授权号
    MultiId: ArrayType(ref.types.char, 12), //多商户交易索引号
    TerminalId: ArrayType(ref.types.char, 15), //交易终端号
    InstallmentTimes: ArrayType(ref.types.char, 2),  //分期期数
    PreInput: ArrayType(ref.types.char, 256), //预输入项
    AddDatas: ArrayType(ref.types.char, 256), //固定输入项
    QRCardNO: ArrayType(ref.types.char, 50), //二维码支付号
    QROrderNo: ArrayType(ref.types.char, 50), //二维码订单号
    platId: ArrayType(ref.types.char, 20), //收银机号
    operId: ArrayType(ref.types.char, 20), //操作员号 
});

const MisposOut = Struct({
    TransType: ArrayType(ref.types.char, 2), //交易指令
    CardNo: ArrayType(ref.types.char, 19),  //交易卡号
    Amount: ArrayType(ref.types.char, 12),  //交易金额
    TipAmount: ArrayType(ref.types.char, 12),  //小费金额
    TransTime: ArrayType(ref.types.char, 6),  //交易时间
    TransDate: ArrayType(ref.types.char, 8), //交易日期
    ExpDate: ArrayType(ref.types.char, 4), //卡片有效期
    Track2: ArrayType(ref.types.char, 37), //二磁道信息
    Track3: ArrayType(ref.types.char, 104), //三磁道信息
    ReferNo: ArrayType(ref.types.char, 8), //系统检索号
    AuthNo: ArrayType(ref.types.char, 6), //授权号
    RspCode: ArrayType(ref.types.char, 2), //返回码
    TerminalId: ArrayType(ref.types.char, 15), //交易终端号
    MerchantId: ArrayType(ref.types.char, 12), //交易商户号
    YLMerchantId: ArrayType(ref.types.char, 15), //银联商户号
    InstallmentTimes: ArrayType(ref.types.char, 2), //分期期数
    TCData: ArrayType(ref.types.char, 256), //IC卡数据
    MerchantNameEng: ArrayType(ref.types.char, 50), //英文商户名称
    MerchantNameChs: ArrayType(ref.types.char, 40), //中文商户名称
    TerminalTraceNo: ArrayType(ref.types.char, 6), //终端流水号
    TerminalBatchNo: ArrayType(ref.types.char, 6), //终端批次号
    IcCardId: ArrayType(ref.types.char, 4), //IC卡序列号
    BankName: ArrayType(ref.types.char, 20), //发卡行名称
    TransName: ArrayType(ref.types.char, 20), //中文交易名称
    CardType: ArrayType(ref.types.char, 20), //卡类别
    TotalInfo: ArrayType(ref.types.char, 800), //交易汇总信息，打印总账时需要
    RspMessage: ArrayType(ref.types.char, 100), //交易失败时，MISPOS系统返回中文错误描述信息
    Remark: ArrayType(ref.types.char, 300), //备注信息
    WTrace: ArrayType(ref.types.char, 24), //外卡流水号
    AIDDAT: ArrayType(ref.types.char, 34), //AID(IC卡数据项)
    APPLBL: ArrayType(ref.types.char, 20), //APPLABEL(IC卡数据项)
    APPNAM: ArrayType(ref.types.char, 20), //APPNAME(IC卡数据项)
    ElecTotal: ArrayType(ref.types.char, 32), //脱机交易汇总信息
    SettleAmount: ArrayType(ref.types.char, 12),//实扣金额
    QROrderNo: ArrayType(ref.types.char, 50), //二维码订单号
    QRMemo: ArrayType(ref.types.char, 300), //二维码优惠支付信息:( 积分抵扣 12+电子券抵扣金额 12+优惠券抵扣金额 12+银行立减12+商户立减12+订单号30该字段全为可视字符，另外目前工行对该字段的设计是长度可变，该字段可能为空，也可能只有一个订单号，后面的金额个数也是未定的，有可能一个金额，也可能多个金额， 具体以工行实际返回为准，收银系统这边要对这块做好解析扩展空间)
    platId: ArrayType(ref.types.char, 20), //收银机号
    operId: ArrayType(ref.types.char, 20), //操作员号 
});

const dllPath = path.join(__dirname, "../../dll/ICBC");
process.env.PATH = `${process.env.PATH}${path.delimiter}${dllPath}`;
const dll = ffi.Library(`${dllPath}/KeeperClient.dll`, {
    misposTrans: ["int", [ref.refType(MisposIn), ref.refType(MisposOut)]]
});

const icbcFun = (request) => {
    for (let key in request) {
        if (typeof request[key] == "string") request[key] = request[key].split("");
    }
    let misposIn = new MisposIn(request);
    let misposOut = new MisposOut();
    let code = dll.misposTrans(misposIn.ref(), misposOut.ref());
    console.log(code);
    let response = {};
    for (let key in misposOut) {
        if (key != "ref.buffer" && misposOut[key] && typeof misposOut[key] == "object") response[key] = iconv.decode(Buffer.from(misposOut[key]), "GBK").trim();
    }
    return { code, ...response };
}

function ICBC(data) {
    for (let key in data) {
        switch (key) {
            case "TransAmount":
                data[key] = normalize(data[key].toString()).replace(".", "").padStart(12, "0");
                break;
            case "platId":
                data[key] = data[key].toString().endStart(20, " ");
                break;
            case "operId":
                data[key] = data[key].toString().endStart(20, " ");
                break;
            case "ReferNo":
                data[key] = data[key].toString().padStart(8, "0");
                break;
            case "TerminalId":
                data[key] = data[key].toString().padStart(15, "0");
                break;
            case "AuthNo":
                data[key] = data[key].toString().padStart(6, "0");
                break;
        }
    }
    return icbcFun(data);
}

module.exports = ICBC;