const request = require('request');
const fs = require('fs');
let uri = 'http://192.168.1.253/fds';
let res = request({uri, timeout: 1500});
res.on('end', (e, r, t) => {
    console.log('end');
});
// res.on('response', response => {
//     console.log(response.statusCode, 'response');
// });
res.pipe(fs.createWriteStream('test.bak'));
res.on('error', (err) => {
    console.log(err);
});
