/**
 * @file
 * @author
 */
var http = require('http');
var https = require('https');
var queryString = require('querystring');
var url = require('url');
/**
 *
 * @param {object} options {'context':{}}
 * @returns {proxy}
 * @constructor
 */
var HttpProxy = function (options) {
    var contexts = [];
    Object.keys(options).forEach(function(item) {
        contexts.push(item);
    });
    return middleware;
    function middleware(req, res, next){
        var _url = req.originalUrl || req.url;
        var context = shouldProxy(contexts, _url);
        if (context) {
            var _option = options[context];
            var _target = url.parse(_option.target);
            var _protocol = _target.protocol;
            // 默认端口
            var _port = _protocol === 'http:' ? 80 : 443;
            var _method = req.method;
            var proxyReqOptions = {};
            proxyReqOptions.hostname = _target.hostname;
            proxyReqOptions.port = _target.port || _port;
            proxyReqOptions.path = req.path;
            proxyReqOptions.path += queryString.stringify(req.params);
            proxyReqOptions.method = _method;
            proxyReqOptions.headers = Object.assign(req.headers, _option.headers);
            var httpClient = _protocol == 'http:' ? http : https;
            var proxyReq = httpClient.request(proxyReqOptions);
            proxyReq.write(queryString.stringify(req.body));
            proxyReq.on('response', function (response) {
                var body = [];
                response.on('data', function (chunk) {
                    body.push(chunk);
                });
                response.on('end', function () {
                    body = Buffer.concat(body);
                    res.json(JSON.parse(body.toString()));
                });
            });
            proxyReq.on('error', function (e) {
                console.error(e);
            });
            proxyReq.end();
        }
        else {
            next();
        }
    }
};

/**
 * 判断是否需要走代理
 * @param {Array} contexts 匹配数组
 * @param {string} reqUrl 请求url
 * @return {string} 有匹配到则返回匹配到的规则，没有则返回空字符串
 */
function shouldProxy(contexts, reqUrl) {
    var rule = '';
    if (Array.isArray(contexts)) {
        contexts.forEach(function (item) {
            if (reqUrl.indexOf(item) === 0 && rule.indexOf(item) !== 0) {
                rule = item;
            }
        })
    }
    return rule;
}

module.exports = HttpProxy;
