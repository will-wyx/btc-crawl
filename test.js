const {URL} = require('url');
let href = 'http://www.cybtc.com/plugin.php';
let url = new URL(href);
let {searchParams} = url;
console.log(searchParams.get('page'));

// let regPageLink = /^plugin\.php\?id=aljes&page=(71)$/;
// let page = regPageLink.exec(url);
// console.log(page);
// let flag = regPageLink.test(url);
// console.log(flag);
