"use strict"
const TAG = "gameserver-start.js";
const network = require("../utils/network");
const config = require("../share/config");
const dbConn = require("../utils/db_connection");
global.g_logger = require("../utils/log_launch")("game-server");

g_logger.debug(TAG, "启动 processid: ", process.pid, process.execArgv, process.argv);

var start = function(){
    global.g_serverId = process.argv[2];
    global.g_serverName = process.argv[3];
    g_logger.info("连接 redis server， mysql server");
    //连接redis
    dbConn.redisConnect();
    //连接mysql
    dbConn.mysqlPoolConnect(config.DB_NAME_LIST[1]);
    //连接home,完成register
    connectHome();
    ////监听game user connection;
    listenConnection();
}

var connectHome = function(){
    var homeList = config.HOME_SERVER_LIST;
    for (var i = 0; i < homeList.length; ++i){
        var cli = new network.Client({port: homeList[i].FOR_LOGIC_PORT});
        cli.connect();
        cli.request({request: "register", serverId: g_serverId}, function(data){
            g_logger.info("注册game server ！！！！ server pid: ", process.pid, data.msg, data.serverId);
        });
        global.g_homeIdClientMap[homeList[i].ID] = cli; 
    }
}

var listenConnection = function(){

}

process.on("uncaughtException", (err)=>{
    console.error("caught exception: ", err.stack);
});

start();