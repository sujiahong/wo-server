const TAG = "LogoScene.js";
/////创建一个全局数据
var g_ada = {};
cc.g_ada = g_ada;
const uiHelper = require("../util/ui_helper");
const event = require("../util/event_emit");
const util = require("../util/util");

var cls = {};
cls.extends = cc.Component;

cls.properties = {
    persistNode: cc.Node,
};

// use this for initialization
cls.onLoad = function () {
    console.log(TAG, "onLoad onLoad!!!!");
    /////添加常驻节点
    cc.game.addPersistRootNode(this.persistNode);
    cc.g_ada.persistNode = this.persistNode;
    //GLobleIAP.init();
    this.name = "!!!!!!!";
    this.init();
    setTimeout(function() {
        cc.director.loadScene("HotUpdateScene");
    }, 2000);
}

cls.init = function () {
    var str = util.md5("38338");
    var str1 = util.base64Encrypt("83739");
    console.log(TAG, "加密 ", str, str1)

    // event.on("gogo", function(){
    //     console.log(TAG, "i can gogogog!");
    // });
    // cc.director.getScheduler().schedule(function(){
    //     console.log(TAG, "this.name")
    // }, this, 3);
    // var timer = util.createTimer(2, function(){
    //     console.log(TAG, "ggggggggggge")
    //     timer.pause();
    // });
    // this.schedule(function(){
    //     console.log(TAG, "IIIIIIIIII")
    // }, 1);
    // this.schedule(function(){
    //     console.log(TAG, "ooooooooooo")
    // }, 2);
    // util.frameUpdater(500, function(c){
    //     console.log(TAG, "count: ", c)
    // });
    // var Client = require("../util/net_client");
    // var cli = new Client({ip: "192.168.10.34", port: 8311});
    // cli.connect();
    // var req = require("../util/http_request");
    // req.get({
    //     url: "http://192.168.10.34:8090/validateUser",
    //     cliType: "app",
    //     accountType: "tel-number",
    //     dd: {aa: 1}
    // }, function(){
    // });
}

cls.update = function(){
    uiHelper.createFlutterWord(343);
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