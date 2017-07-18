/**
 * Created by liw on 2017/7/12.
 */
const fs = require('fs');
const mapLimit = require('async/mapLimit');
const setImmediate = require('async/setImmediate');
const mysql = require('mysql');
const {URL} = require('url');
const shortid = require('shortid');
const request = require('request');

const ProgressBar = require('progress');

const config = require('./config/data-config').config;
const {map2arr, arr2map, obj2map} = require('./util');
const regUrl = /^https?:\/\/.*$/;
const regSuffix = /^.*\.([^.]+)$/;

let cover_record_test = fs.readFileSync('record/huosuimg-record.json', 'utf8');
let cover_record_json = JSON.parse(cover_record_test);
let cover_record_map = arr2map(cover_record_json);
// cover_record_map = new Map();

const connection = mysql.createConnection(config);
connection.connect();
let promiseQuery = new Promise((resolve, reject) => {
    connection.query(`select id, cover 
            from jc_view_release 
            where cover like 'http://%' 
            order by cover`, (err, res, t) => {
        if (err)
            reject(err);
        else {
            res = res.map(e => {
                return {id: e.id, cover: e.cover}
            });
            resolve(res);
        }
    });
});
function getCover(row, callback) {
    let {id, cover: uri} = row;
    let result = {err: 0};
    if (regUrl.test(uri)) {
        let url = new URL(uri);
        let {pathname} = url;
        if (regSuffix.test(pathname)) {
            let suffix = regSuffix.exec(pathname)[1];
            let localFile = cover_record_map.get(uri);
            if (!localFile) {
                // 不存在本地文件，下载
                localFile = `covers/${shortid.generate()}.${suffix}`;
                let called = false;
                let res = request({uri, timeout: 1500});
                res.pipe(fs.createWriteStream(localFile));
                res.on('end', () => {
                    result.data = {id, localFile};
                    if (!called) {
                        called = true;
                        callback(null, result);
                    }
                });
                res.on('error', (err) => {
                    result.err = err;
                    if (!called) {
                        called = true;
                        callback(null, result);
                    }
                });
                cover_record_map.set(uri, localFile);
            } else {
                result.data = {id, localFile};
                callback(null, result);
            }
        } else {
            result.err = '图片类型不合法';
            callback(null, result);
        }
    } else {
        result.err = '图片链接不合法';
        callback(null, result);
    }
}
promiseQuery.then(res => {
    connection.end();
    let barlen = res.length;
    let bar = new ProgressBar('download files |:bar| :percent', {
        complete: '█',
        incomplete: '░',
        width: 50,
        total: barlen + 1
    });
    bar.tick();
    mapLimitGetCover(res, bar);
});

function mapLimitGetCover(res, bar) {
    mapLimit(res, 20, (row, callback) => {
        getCover(row, (e, r) => {
            bar.tick();
            setImmediate(callback, e, r);
        });
    }, (err, res) => {
        if (err)
            console.log(err);
        else {
            let cover_record_arr = map2arr(cover_record_map);
            fs.writeFile('record/huosuimg-record.json', JSON.stringify(cover_record_arr), err => {
                console.log(`write log completed`)
            });
        }
    });
}
