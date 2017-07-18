/**
 * Created by liw on 2017/7/4.
 */
const hr = require('./http-request');
const mapLimit = require('async/mapLimit');
const fs = require('fs');
const ProgressBar = require('progress');

const host = 'http://www.huosubtc.com';
const headreg = /^信息编号：(\d*).*发布日期：(\d{4}-\d{2}-\d{2}).*$/;
const footreg = /^联系人：([^  QQ]*)(  QQ：(\d*))?.*$/;

let record_text = fs.readFileSync('record/huosulink-record.json', 'utf8');
let record_json = JSON.parse(record_text);
let record_links = record_json.map(e => `${host}/goods/${e}.html`);
/**
 * 解析dom 并得到总页数
 * @param item
 * @returns {{uri: *}}
 */
function $GetCount(item) {
    let {$, category} = item;
    let data = {category};
    if ($) {
        const $pagination = $('.page_con .pagination');
        if ($pagination.length) {
            const $last = $pagination.find('li:nth-last-child(2) a');
            let count = $last.text();
            count = +count;
            data.count = count;
        } else {
            data.err = 'no dom';
        }
    }
    return data;
}

/**
 * 解析dom 并得到详情页链接
 * @param item
 * @returns {Array}
 */
function $GetLinks(item) {
    let {$, uri} = item;
    let links = [];
    if ($) {
        const $nei_btb_row = $('div.nei_btb_row .txt h1 a');
        if ($nei_btb_row.length) {
            for (let i = 0, len = $nei_btb_row.length; i < len; ++i) {
                let item = $nei_btb_row[i];
                let $link = $(item);
                links.push($link.attr('href'));
            }
        } else {
            console.log(uri, 'no dom');
        }
    }
    return links;
}

/**
 * 解析dom 详细信息
 * @param item
 * @returns {{}}
 */
function $GetDetails(item) {
    let {$, uri} = item;
    let details = {};
    if ($) {
        const $nei_left = $('div.nei_left');
        if ($nei_left.length) {
            const $detail_title = $nei_left.find('.btb_detail_tit');
            const $detail_top = $nei_left.find('.btb_detail_top');
            const $detail_content = $nei_left.find('.btb_detail_c');
            let subtitle = $detail_title.find('p').text();
            subtitle = headreg.exec(subtitle);
            let contact = $detail_top.find('.right .tel p').text();
            contact = footreg.exec(contact);
            let $content = $detail_top.find('.right .content');
            let $content_first = $($content[0]);
            let $content_second = $($content[1]);
            let $content_third = $($content[2]);
            details = {
                id: subtitle[1],
                title: $detail_title.find('h1').text(),
                time: subtitle[2],
                pic: $detail_top.find('.pic img').attr('src'),
                price: $detail_top.find('.right .price em').text(),
                type: $content_first.find('i').text(),
                fineness: $content_second.find('i').text(),
                area: $content_third.find('i').text(),
                tel: $detail_top.find('.right .tel h1').text(),
                contact: contact[1],
                content: $detail_content.find('p:first-child').text()
            };
            details.price = details.price === '咨询' ? -1 : details.price;
            details.type = details.type === '出售' ? 1 : 0;
            if (contact.length > 3 && contact[3])
                details.qq = contact[3];
        } else {
            console.log(uri, 'no dom');
        }
    }
    return details;
}

/**
 * get page count
 * @param category
 * @param callback
 */
exports.getPageCount = function getPageCount(category, callback) {
    let uri = `${host}/goods/${category}.html`;
    hr.getDom(uri, (err, res) => {
        res.category = category;
        const data = $GetCount(res);
        callback(null, data);
    });
};

/**
 * get links
 * @param category
 * @param uris
 * @param callback
 */
function getLinks(category, uris, callback) {
    let len = uris.length;
    let bar = new ProgressBar(`get ${category} links |:bar| :percent`, {
        complete: '█',
        incomplete: '░',
        width: 50,
        total: len + 1
    });
    bar.tick();
    mapLimit(uris, 8, (uris, callback) => {
        hr.getDom(uris, (e, r) => {
            bar.tick();
            callback(e, r);
        });
    }, (err, res) => {
        let result = {
            category, links: []
        };
        if (!err) {
            for (let item of res) {
                item.category = category;
                let data = $GetLinks(item);
                Array.prototype.push.apply(result.links, data);
            }
        }
        callback(null, result);
    });
}

/**
 * 得到单个类型下所有商品链接
 * @param options
 * @param callback
 */
exports.getCategoryLinks = function getCategoryLinks(options, callback) {
    let {category, count} = options;
    if (count) {
        let uris = [];
        for (let i = 1; i <= count; ++i) {
            let uri = `${host}/goods/${category}.html?page=${i}`;
            uris.push(uri);
        }
        getLinks(category, uris, callback);
    }
};

/**
 * 得到单个类型下所有商品详情
 * @param options
 * @param callback
 */
exports.getCategoryDetails = function getCategoryDetails(options, callback) {
    let {category, links} = options;
    links = links.filter(e => {
        let href = host + e;
        let flag = !record_links.find(item => {
            return item === href;
        });
        return flag;
    });
    links = links.map(e => host + e);
    let barlen = links.length;
    let bar = new ProgressBar(`get ${category} detail |:bar| :percent`, {
        complete: '█',
        incomplete: '░',
        width: 50,
        total: barlen + 1
    });
    bar.tick();
    mapLimit(links, 8, (links, callback) => {
        hr.getDom(links, (e, r) => {
            bar.tick();
            callback(e, r);
        });
    }, (err, res) => {
        let result = {
            category, details: []
        };
        if (!err) {
            for (let item of res) {
                item.category = category;
                let data = $GetDetails(item);
                result.details.push(data);
            }
        }
        callback(null, result);
    });
};

Array.prototype.unique3 = function () {
    let res = [];
    let json = {};
    for (let item of this) {
        if (!json[item]) {
            res.push(item);
            json[item] = 1;
        }
    }
    return res;
};

exports.unionRecords = function unionRecords(records) {
    Array.prototype.push.apply(record_json, records);
    record_json = record_json.unique3();
    return record_json;
};
