// /**
//  * Created by liw on 2017/7/12.
//  */
// const request = require('request');
// const fs = require('fs');
// // let uri = 'http://m.huosubtc.com/static/front/img/10.jpg?t=234567';
// let uri = 'http://www.huosubtc.com/static/front/img/10.jpg?t=234567';
// // let uri = 'nihao china';
// //
// // request(uri).pipe(fs.createWriteStream('covers/10.jpg'));
//
// const regUrl = /^https?:\/\/.*$/;
// const {URL} = require('url');
// if (regUrl.test(uri)) {
//     let url = new URL(uri);
//     let {hostname, pathname} = url;
//     let prefix = hostname.split('.')[0];
//     console.log(prefix, pathname);
//     let res = request(uri);
//     res.pipe(fs.createWriteStream('covers/10.jpg'));
//     res.on('end', () => {
//         console.log('end');
//     });
// } else
//     console.log('not a url');

// const fs = require('fs');
//
// const {map2arr, arr2map, obj2map} = require('./util');
//
// let cover_record_test = fs.readFileSync('huosuimg-record.json', 'utf8');
// let cover_record_json = JSON.parse(cover_record_test);
//
// let map = obj2map(cover_record_json);
// let arr = map2arr(map);
//
// fs.writeFile('huosuimg-record.json', JSON.stringify(arr), err => {
//     console.log(`write log completed`)
// });

