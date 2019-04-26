"use strict"
const TAG = "http_request.js";
const https = require("https");
const config = require("../share/config");
const errcode = require("../share/errcode");
const constant = require("../share/constant");
const queryString = require("querystring");

var req = module.exports;

var request = function(url, next){
    var rt = https.request(url, function(res){
        var str = "";
        res.setEncoding("utf-8");
        res.on("data", function(chunk){
            str += chunk;
        }).on("end", function(){
            console.log(TAG, "end end", str);
            var data = JSON.parse(str);
            if (!data.errcode)
                data.errcode = 0;
            next(data);
        });
    });
    rt.on("error", function(e){
        console.log("request error", e);
        next({code: errcode.FAIL});
    });
    rt.end();
}

req.loginWX = function(data, next){
    var accountData = JSON.parse(data.accountData);
    var url = config.WX_LOGIN_URL;
    var queryData = {
        appid: constant.MINIINFO[accountData.clientId].appid,
        secret: constant.MINIINFO[accountData.clientId].secret,
        js_code: accountData.code,
        grant_type: "authorization_code"
    };
    url = url + queryString.stringify(queryData);
    request(url, next);
}


