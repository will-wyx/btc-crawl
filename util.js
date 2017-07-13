/**
 * Created by liw on 2017/7/13.
 */
exports.map2arr = function map2arr(map) {
    let arr = [];
    for(let [key, value] of map.entries()) {
        arr.push([key, value]);
    }
    return arr;
};

exports.arr2map = function arr2map(arr) {
    return new Map(arr);
};

exports.obj2map = function obj2map(obj) {
    let map = new Map();
    for(let [key, value] of Object.entries(obj)) {
        map.set(key, value);
    }
    return map;
};
