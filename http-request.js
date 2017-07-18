/**
 * Created by WILL on 2017/7/1.
 */
const cheerio = require('cheerio');
const rp = require('request-promise');
const tough = require('tough-cookie');
const {URL} = require('url');
exports.record_http = [];
exports.getDom = function getDom(uri, callback, cookies) {
    let result = {err: 0};
    if (!exports.record_http.find(e => e === uri)) {
        let options = {
            uri,
            timeout: 1500,
            transform: body => cheerio.load(body)
        };
        if(cookies) {
            let cookiejar = rp.jar();
            let url = new URL(uri);
            for(let cookie of cookies) {
                cookie = new tough.Cookie(cookie);
                cookiejar.setCookie(cookie, url.origin);
            }
            options.jar = cookiejar
        }
        rp(options)
            .then($ => {
                result.$ = $;
                result.uri = uri;
                callback(null, result);
            }, error => {
                result.err = error;
                result.uri = uri;
                callback(null, result);
            })
    } else {
        result.err = 'has';
        // console.log('has');
        callback(null, result);
    }
};
