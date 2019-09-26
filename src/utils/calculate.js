export default {
    //加法函数
    add(num1, num2) {

        var r1, r2, m, c;
        try {
            r1 = num1.toString().split(".")[1].length
        } catch (e) {
            r1 = 0
        }
        try {
            r2 = num2.toString().split(".")[1].length
        } catch (e) {
            r2 = 0
        }
        c = Math.abs(r1 - r2);
        m = Math.pow(10, Math.max(r1, r2))
        if (c > 0) {
            var cm = Math.pow(10, c);
            if (r1 > r2) {
                num1 = Number(num1.toString().replace(".", ""));
                num2 = Number(num2.toString().replace(".", "")) * cm;
            }
            else {
                num1 = Number(num1.toString().replace(".", "")) * cm;
                num2 = Number(num2.toString().replace(".", ""));
            }
        }
        else {
            num1 = Number(num1.toString().replace(".", ""));
            num2 = Number(num2.toString().replace(".", ""));
        }
        return (num1 + num2) / m

        // var r1, r2, m;
        // try {
        //     r1 = num1.toString().split(".")[1].length;
        // }
        // catch (e) {
        //     r1 = 0;
        // }
        // try {
        //     r2 = num2.toString().split(".")[1].length;
        // }
        // catch (e) {
        //     r2 = 0;
        // }
        // m = Math.pow(10, Math.max(r1, r2));
        // return (num1 * m + num2 * m) / m;
    },

    //减法函数
    Subtr(arg1, arg2) {
        var r1, r2, m, n;
        try {
            r1 = arg1.toString().split(".")[1].length;
        }
        catch (e) {
            r1 = 0;
        }
        try {
            r2 = arg2.toString().split(".")[1].length;
        }
        catch (e) {
            r2 = 0;
        }
        m = Math.pow(10, Math.max(r1, r2));
        //last modify by deeka
        //动态控制精度长度
        n = (r1 >= r2) ? r1 : r2;
        return ((arg1 * m - arg2 * m) / m).toFixed(n);
    },

    //乘法函数
    Mul(num1, num2) {
        var m = 0, s1 = num1.toString(), s2 = num2.toString();
        try {
            m += s1.split(".")[1].length
        } catch (e) {
        }
        try {
            m += s2.split(".")[1].length
        } catch (e) {
        }
        return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
    },

    //除法函数
    Div(num1, num2) {
        var t1 = 0, t2 = 0, r1, r2;
        try {
            t1 = num1.toString().split(".")[1].length
        } catch (e) {
        }
        try {
            t2 = num2.toString().split(".")[1].length
        } catch (e) {
        }

        r1 = Number(num1.toString().replace(".", ""));

        r2 = Number(num2.toString().replace(".", ""));
        return (r1 / r2) * Math.pow(10, t2 - t1);
    },

    //转换数,f:表示传入值,dec:表示精确位数,flag:表示0就是截断,1表示四舍五入
    odoubleConvert(f, dec, flag, r) {
        let d;
        if (flag == 1) {
            d = f;
            // 先计算数字f 精度后2位的精度
            // if (!r) d = doubleConvert(d, dec + 2, 1, true);
            d = d * Math.pow(10.0, dec);
            return (Math.round(d)) / (Math.pow(10.0, dec));
        }
        else {
            //BigDecimal b = new BigDecimal(Math.abs(f)).setScale(dec, BigDecimal.ROUND_FLOOR);
            //return b.doubleValue() * (f < 0?-1:1);
            d = Math.abs(f);
            // if (!r) d = doubleConvert(d, dec + 2, 1, true);
            d = d * Math.pow(10.0, dec);
            return (Math.floor(d)) / (Math.pow(10.0, dec) * (f < 0 ? -1 : 1));
        }
    },

    tdoubleConvert(f, dec, flag) {
        return this.odoubleConvert(f, dec, flag, false);
    },
    
    doubleConvert(f) {
        return this.tdoubleConvert(f, 2, 1);
    },

    padLeft(str, length, padchar) {
        let count = length - str.length;

        for (let i = 0; i < count; i++) {
            str = padchar + str;
        }

        return str;
    }

}


