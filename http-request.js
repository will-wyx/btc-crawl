/**
 * Created by WILL on 2017/7/1.
 */
const cheerio = require('cheerio');
const rp = require('request-promise');
exports.record_http = [];
exports.getDom = function getDom(uri, callback) {
    let result = {err: 0};
    if (!exports.record_http.find(e => e === uri)) {
        rp({uri, timeout: 1500, transform: body => cheerio.load(body)})
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
