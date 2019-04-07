"use strict"
const TAG = "wo-server app.js";
const srvCluster = require("./utils/server_cluster");
const cq = require("./config/cluster_quantity.json");

console.log(TAG, __dirname, process.execPath, process.execArgv, process.pid)
//////debug
//process.execArgv[1] = process.execArgv[1].replace('-brk', '');

/////启动集群
srvCluster.createCluster(cq.home_quantity, function(cluster){
    const gateStarter = require("./gate-server/start");
    //启动gate
    gateStarter.start();
}, function(cluster){
    const homeStarter = require("./home-server/start");
    //
    homeStarter.start();
});

// setTimeout(function(){
//     require("./test/benchmark").bench(2000);
// }, 5000);

//
process.on("uncaughtException", (err)=>{
    console.error("caught exception: ", err.stack);
});
