const Payment = {


    /**
     * Query objects that specify keys and values in an array where all values are objects.
     * @param   {boolean}       _isInitPayModeInfoFill   The value of the object that needs to be queried.
     * @param   {array}         _payModeInfo   An array where all values are objects, like [{key:1},{key:2}].
     * @param   {string}        _nozjfkpaycode     The key of the object that needs to be queried.
     * @param   {string}        value   The value of the object that needs to be queried.
     * @return  {object|undefined}   Return frist object when query success.
     */
    payModeFilt(_isInitPayModeInfoFill, _payModeInfo, _nozjfkpaycode){
        let _paymodeList = _isInitPayModeInfoFill ? [..._isInitPayModeInfoFill] : [];
        //付款模板控制删除不能直接付款方式
        let _payMode = _payModeInfo.filter((item, index) => {
            return _nozjfkpaycode.indexOf(item.code) === -1;
        })
        console.log("Payment payModeFilt: ", this.name)
    }

}
export default Payment;