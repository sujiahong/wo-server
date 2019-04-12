"use strict"
const TAG = "http_request.js";
const https = require("https");
const config = require("../share/config");
const errcode = require("../share/errcode");
const constant = require("../share/constant");
const queryString = require("querystring");

var req = module.exports;

req.loginWX = function(data, next){
    var url = config.WX_LOGIN_URL;
    var queryData = {
        appid: constant.MINIINFO[data.MiniId].appid,
        secret: constant.MINIINFO[data.MiniId].secret,
        js_code: JSON.parse(data.accountData).code,
        grant_type: "authorization_code"
    };
    url = url + queryString.stringify(queryData);
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
        console.log("loginWX error", e);
        next({code: errcode.FAIL});
    });
    rt.end();
}


