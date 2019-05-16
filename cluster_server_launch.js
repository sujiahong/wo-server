"use strict";
const TAG = "cluster_server_launch.js";
const cp = require("child_process");
const async = require("async");
var clusterInfo = require("./config/cluster_info.json");
console.log("!!!!!  ", process.argv)

if (process.argv[2]){
    var path = process.argv[2];
    clusterInfo = require(path);
}

var startArr = [];
for (let key in clusterInfo){
    var func = function(cb){
        let list = clusterInfo[key];
        let len = list.length;
        for(var i = 0; i < len; ++i){
            console.log(TAG, "启动服务: ", list[i].ID);
            cp.fork(list[i].START_PATH, [JSON.stringify(list[i])]);
        }
        setTimeout(cb, 200*len);
    }
    startArr.push(func);
}
async.waterfall(startArr, function(){
    process.exit();
});