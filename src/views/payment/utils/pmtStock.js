import { deepCopy } from './index.js'

//过滤券信息
export function filterGoodsStock(data) {
    let _this = this;
    let oldData = [];
    let oldsData = deepCopy(data);
    for (let key in oldsData) {
        oldData.push(oldsData[key]);
    }
    oldData = oldData.filter(item => item.goodsType !== "99" && item.goodsType !== "98");//过滤券商品
    return oldData;
}