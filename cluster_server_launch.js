"use strict";
const TAG = "cluster_server_launch.js";
const cp = require("child_process");
const async = require("async");
var clusterInfo = require("./config/cluster_info.json");
console.log("!!!!!  ", process.argv)
////////////获取一个json文件
var len = process.argv.length;
if (len > 2 && process.argv[2] == "-f"){
    var path = process.argv[3];
    clusterInfo = require(path);
}

var startArr = [];
for (let key in clusterInfo){
    var func = function(cb){
        let list = clusterInfo[key];
        let len = list.length;
        for(var i = 0; i < len; ++i){
            console.log(TAG, "启动服务: ", list[i].ID);
            cp.fork(list[i].START_PATH, [JSON.stringify(list[i]), JSON.stringify(clusterInfo)]);
        }
        setTimeout(cb, 200*len);
    }
    startArr.push(func);
}
async.waterfall(startArr, function(){
    process.exit();
});