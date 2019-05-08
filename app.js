"use strict"
const TAG = "wo-server app.js";
const srvCluster = require("./utils/server_cluster");
const clusterInfo = require("./config/cluster_info.json");
const cp = require("child_process");
const async = require("async");

console.log(TAG, __dirname, process.execPath, process.execArgv, process.pid)
//////debug
//process.execArgv[1] = process.execArgv[1].replace('-brk', '');

/////启动集群
srvCluster.createCluster(1, function(cluster){
    require("./servers/center-server/start");
    require("./servers/center-server/web-server/start");
}, function(cluster){
    //启动服务
    var startArr = [];
    for (let key in clusterInfo){
        var func = function(cb){
            let list = clusterInfo[key];
            let len = list.length;
            for(var i = 0; i < len; ++i){
                console.log(TAG, "启动服务: ", list[i].ID);
                cp.fork(list[i].START_PATH, [JSON.stringify(list[i])]);
            }
            setTimeout(cb, 300*len);
        }
        startArr.push(func);
    }
    async.waterfall(startArr, function(){
        process.exit();
    });
});

// setTimeout(function(){
//     require("./test/benchmark").bench(2000);
// }, 5000);

//

// var modifyUserLoginTime = function(userId, next){
//     var sql = "{0}".format();
//     sql.Format(Date.now());
//     console.log(sql);
// }
// modifyUserLoginTime()