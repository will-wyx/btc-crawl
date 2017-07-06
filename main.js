// /**
//  * Created by WILL on 2017/7/1.
//  */
const hb = require('./huosubtc-step');
const fs = require('fs');
const mapLimit = require('async/mapLimit');
// const host = 'http://www.huosubtc.com';
const mysql = require('mysql');
const config = require('./data-config').config;

/**
 * step 2 get page count
 * 得到所有商品类型的页数
 * [
 *  { category: 'bitcoin', count: 0 },
 *  { category: 'litecoin', count: 0 }
 * ]
 * @returns {Promise}
 */
function getPageCount() {
    return new Promise((resolve, reject) => {
        mapLimit(categories, 4, hb.getPageCount, (err, res) => {
            if (err)
                reject(err);
            else
                resolve(res);
        });
    });
}

/**
 * step 3 get links
 * 得到所有的商品链接
 * [
 *  { category: 'bitcoin', links: [] },
 *  { category: 'litecoin', links: [] }
 * ]
 * @param categoriesCount
 * @returns {Promise}
 */
function getLinks(categoriesCount) {
    return new Promise((resolve, reject) => {
        mapLimit(categoriesCount, 4, hb.getCategoryLinks, (err, res) => {
            if (err)
                reject(err);
            else
                resolve(res);
        });
    });
}

/**
 * 得到所有商品的详细信息
 * [
 *  { category: 'bitcoin', details: [] },
 *  { category: 'litecoin', details: [] }
 * ]
 * @param categoriesLinks
 * @returns {Promise}
 */
function getDetails(categoriesLinks) {
    return new Promise((resolve, reject) => {
        mapLimit(categoriesLinks, 4, hb.getCategoryDetails, (err, res) => {
            if (err)
                reject(err);
            else
                resolve(res);
        });
    });
}

// step 1 set categories
const categories = [
    'bitcoin',
    'litecoin',
    'ethereum',
    'power'
];

// step 2 get page count
let promiseGetPageCount = getPageCount();
// step 3 get links
function getCategoryLinks(categoriesCount) {
    console.log('*** counts ***');
    let promiseGetLinks = getLinks(categoriesCount);
    promiseGetLinks.then(getCategoryDetails, err => {
        console.log('get links error', err);
    })
}

promiseGetPageCount.then(getCategoryLinks, err => {
    console.log('get page count error', err);
});

const connection = mysql.createConnection(config);
function addPublish(connection, values, callback) {
    connection.query('insert into jc_view_release set ?', values, callback);
}
// step 4 get details
function getCategoryDetails(categoriesLinks) {
    console.log('*** start get details ***');
    let promiseGetDetails = getDetails(categoriesLinks);
    promiseGetDetails.then(res => {
        connection.connect();
        let records = [];
        let params = [];
        for (let item of res) {
            // 入库
            let {category, details} = item;
            for (let detail of details) {
                if (detail && detail.id) {
                    params.push(detail);
                }
            }
        }
        mapLimit(params, 20, (detail, callback) => {
            let values = {
                type: detail.type, category: 71, neworold: detail.fineness,
                price: detail.price, name: detail.title, content: detail.content,
                compellation: detail.contact, qq: detail.qq, phone: detail.tel,
                userid: 1, status: 3, create_time: detail.time, cover: detail.pic
            };
            addPublish(connection, values, (err, res, field) => {
                if(err)
                    console.log(err);
                else {
                    callback(null, detail.id);
                }
            })
        }, (err, res) => {
            if(err)
                console.log(err);
            else {
                for(let item of res) {
                    records.push(item);
                }
            }
            connection.end();
            let record_json = hb.unionRecords(records);
            fs.writeFile('huosubtc-record.json', JSON.stringify(record_json), err => {
                console.log(`write log ${err}`)
            });
        });
    }, err => {
        console.log('get details error', err);
    })
}

