const TAG = "LogoScene.js";
var cls = {};
cls.extends = cc.Component;

cls.properties = {};

// use this for initialization
cls.onLoad = function () {
    console.log(TAG, "onLoad");
    //GLobleIAP.init();
    this.init();
    setTimeout(function () {
        console.debug(TAG, "111111   ", cc.director.loadScene("HotUpdateScene"), cc.director.getScene());
    }, 2000);
}

cls.init = function () {
    var g_ada = {};
    cc.g_ada = g_ada;
    //var Client = require("../util/network");
    //var cli = new Client({ip: "192.168.10.34", port: 8311});
    //cli.connect();
    // var req = require("../util/http_request");
    // req.get({
    //     url: "http://192.168.10.34:8090/validateUser",
    //     cliType: "app",
    //     accountType: "tel-number",
    //     dd: {aa: 1}
    // }, function(){
    // });
}

var urlParse = function () {
    console.log(TAG, window.io);
    var params = {};
    if (window.location == null) {
        return params;
    }
    var name, value;
    var str = window.location.href; //取得整个地址栏

    var num = str.indexOf("?");
    str = str.substr(num + 1); //取得所有参数   stringvar.substr(start [, length ]

    var arr = str.split("&"); //各个参数放到数组里
    for (var i = 0; i < arr.length; i++) {
        num = arr[i].indexOf("=");
        if (num > 0) {
            name = arr[i].substring(0, num);
            value = arr[i].substr(num + 1);
            params[name] = value;
        }
    }
    return params;
}

cc.Class(cls);