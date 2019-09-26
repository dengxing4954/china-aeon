function normalize(params, point = 2) {
    if (!params) return params;
    let index = params.indexOf(".");
    if (index >= 0) {
        let length = params.slice(index + 1).length;
        if (length >= point) {
            params = params.slice(0, index + point + 1);
        } else {
            params = params + "0".repeat(point - length);
        }
    } else {
        params = `${params}.${"0".repeat(point)}`;
    }
    return params;
}

module.exports = normalize;