/**
 * Created by liw on 2017/7/18.
 */
const hr = require('./http-request');
const mapLimit = require('async/mapLimit');
const {URL} = require('url');

const {cookies} = require('./config/cy-cookie-config');
const host = 'http://www.cybtc.com';

function $GetDetails(item) {
    let data = {};
    let {$} = item;
    if ($) {
        let $viewad_title = $('h2.viewad_title');
    }
    return data;
}

function $GetCount(item) {
    let data = {};
    let {$} = item;
    if ($) {
        let $last = $('.pg a.last');
        if ($last.length) {
            let href = $last[0].attribs.href;
            href = `${host}/${href}`;
            let url = new URL(href);
            let {searchParams} = url;
            let page = searchParams.get('page');
            if (page) {
                data.count = +page;
            } else {
                data.err = 'no page'
            }
        } else {
            data.err = 'no dom';
        }
    }
    return data;
}

function $GetLinks(item) {
    let data = {};
    let {$} = item;
    if ($) {
        let $items = $('#media li.media a.media-cap');
        if ($items.length) {
            data.links = [];
            for (let i = 0, len = $items.length; i < len; ++i) {
                let $item = $items[i];
                let href = $item.attribs.href;
                data.links.push(href);
            }
        } else {
            data.err = 'no links'
        }
    }
    return data;
}

/**
 * get page count
 * @param callback
 */
exports.getPageCount = function getPageCount(callback) {
    let uri = `${host}/plugin.php?id=aljes`;
    hr.getDom(uri, (err, res) => {
        const data = $GetCount(res);
        callback(null, data);
    }, cookies)
};

exports.getLinks = function getLinks(count, callback) {
    let uris = [];
    for (let i = 1; i <= count; ++i) {
        let uri = `${host}/plugin.php?id=aljes&page=${i}`;
        uris.push(uri);
    }
    mapLimit(uris, 8, (uris, callback) => {
        hr.getDom(uris, (e, r) => {
            const data = $GetLinks(r);
            callback(null, data);
        });
    }, (err, res) => {
        let links = [];
        for (let item of res) {
            if (item.links) {
                Array.prototype.push.apply(links, item.links);
            }
        }
        callback(null, links);
    })
};



exports.getDetails = function getDetails(links, callback) {
    let uri = `${host}/plugin.php?id=aljes&act=view&lid=929`
};
