"use_strict"
const TAG = "utils/server_cluter.js";
const cluster = require("cluster");

exports.createCluster = function(num, masterFunc, workerFunc){
    if (cluster.isMaster){
        console.log(TAG, "--------master pid: ", process.pid);
        masterFunc(cluster);
        for (var i = 0; i < num; ++i)
            cluster.fork();
        cluster.on("exit", (worker, code, signal) => {
            console.log(TAG, "worker exit id-pid: ", worker.id, worker.process.pid, code, signal);
        });
        cluster.on("disconnect", (worker)=>{
            console.log(TAG, "worker disconnect id-pid: ", worker.id, worker.process.pid);
        });
        cluster.on("fork", function(worker){
            console.log(TAG, "worker fork id: ", worker.id, worker.process.pid, process.pid, cluster.isMaster, cluster.isWorker);
            worker.on("error", function(err){
                console.error(TAG, "error id-pid: ", worker.id, worker.process.pid, err);
            });
            //worker.disconnect();
        });
    }else{
        console.log(TAG, "========worker pid: ", process.pid);
        workerFunc(cluster);
    }
}

