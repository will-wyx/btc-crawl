/**
 * Created by liw on 2017/7/12.
 */
const fs = require('fs');
const mapLimit = require('async/mapLimit');
const mysql = require('mysql');
const {URL} = require('url');
const shortid = require('shortid');
const request = require('request');

const ProgressBar = require('progress');

const config = require('./data-config').config;
const {map2arr, arr2map, obj2map} = require('./util');
const regUrl = /^https?:\/\/.*$/;
const regSuffix = /^.*\.([^.]+)$/;

let cover_record_test = fs.readFileSync('huosuimg-record.json', 'utf8');
let cover_record_json = JSON.parse(cover_record_test);
cover_record_json = arr2map(cover_record_json);

const connection = mysql.createConnection(config);
connection.connect();

(new Promise((resolve, reject) => {
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
})).then(res => {
    connection.end();
    let barlen = res.length;
    let bar = new ProgressBar('download files |:bar| :percent', {
        complete: '█',
        incomplete: '░',
        width: 50,
        total: barlen + 1
    });
    bar.tick();
    mapLimit(res, 20, (row, callback) => {
        let {id, cover: uri} = row;
        let result = {err: 0};
        if (regUrl.test(uri)) {
            let url = new URL(uri);
            let {pathname} = url;
            if (regSuffix.test(pathname)) {
                let suffix = regSuffix.exec(pathname)[1];
                let localFile = cover_record_json.get(uri);
                if (!localFile) {
                    // 不存在本地文件，下载
                    localFile = `covers/${shortid.generate()}.${suffix}`;
                    let res = request({uri, timeout: 1500});
                    res.pipe(fs.createWriteStream(localFile));
                    res.on('end', () => {
                        result.data = {id, localFile};
                        bar.tick();
                        callback(null, result);
                    });
                    res.on('error', (err) => {
                        result.err = err;
                        bar.tick();
                        callback(null, result);
                    });
                    cover_record_json.set(uri, filename);
                } else {
                    result.data = {id, localFile};
                    bar.tick();
                    callback(null, result);
                }
            } else {
                result.err = '图片类型不合法';
                bar.tick();
                callback(null, result);
            }
        } else {
            result.err = '图片链接不合法';
            bar.tick();
            callback(null, result);
        }
    }, (err, res) => {
        console.log('completed');
        return false;
        if (err)
            console.log(err);
        else {
            let cover_record_arr = map2arr(cover_record_json);
            fs.writeFile('huosuimg-record.json', JSON.stringify(cover_record_arr), err => {
                console.log(`write log completed`)
            });
        }
    });
});
