/**
 * Created by liw on 2017/7/18.
 */
// const {hex_md5} = require('./util');
//
// let val = hex_md5('btc9will');
// console.log(val);

// const {cookies} = require('./config/cy-cookie-config');
//
// const hr = require('./http-request');
// let url = 'http://www.cybtc.com/plugin.php?id=aljes&act=view&lid=903';
// hr.getDom(url, (err, res) => {
//     let {$} = res;
//     console.log($('#num').text());
// }, cookies);

const {getPageCount, getLinks}  = require('./cy-step');

// getPageCount((e, r) => {
//     console.log(e, r)
// });

getLinks(3, (e, r) => {
    console.log(e, r)
});
