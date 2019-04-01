"use strict"
const TAG = "wo-server app.js";
const srvCluster = require("./utils/server_cluster");

console.log(__dirname, process.execPath, process.execArgv, process.pid)
//////debug
process.execArgv[1] = process.execArgv[1].replace('-brk', '');

/////启动集群
srvCluster.createCluster(2, function(cluster){
    const gateStarter = require("./gate-server/start");
    //启动gate
    gateStarter.start();
}, function(cluster){
    const gameStarter = require("./home-server/start");
    //
    gameStarter.start();
});



//
process.on("uncaughtException", (err)=>{
    console.error("caught exception: ", err.stack);
});
