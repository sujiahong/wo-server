"use strict";
const TAG = "wo-server app.js";
const srvCluster = require("./utils/server_cluster");

console.log(TAG, __dirname, process.execPath, process.execArgv, process.pid)
//////debug
//process.execArgv[1] = process.execArgv[1].replace('-brk', '');

/////启动集群
srvCluster.createCluster(1, function(cluster){
    require("./center_server_launch");
}, function(cluster){
    //启动服务
    require("./cluster_server_launch");
});