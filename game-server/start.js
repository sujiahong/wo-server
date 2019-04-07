"use strict"
const TAG = "gameserver-start.js";
global.g_serverData = {};
g_serverData.logger = require("../utils/log_launch")("game-server");
const logger = g_serverData.logger;
const network = require("../utils/network");
const config = require("../share/config");
const dbConn = require("../utils/db_connection");


logger.debug(TAG, "启动 processid: ", process.pid, process.execArgv, process.argv);

var start = function(){
    g_serverData.serverId = process.argv[2];
    g_serverData.serverName = process.argv[3];
    logger.info("连接 redis server， mysql server");
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
    g_serverData.homeIdClientMap = {};
    var homeList = config.HOME_SERVER_LIST;
    for (var i = 0; i < homeList.length; ++i){
        var cli = new network.Client({port: homeList[i].FOR_LOGIC_PORT});
        cli.connect();
        cli.request({route: "register", serverId: g_serverData.serverId}, function(data){
            logger.info("注册game server ！！！！ server pid: ", process.pid, data.msg, data.serverId);
        });
        g_serverData.homeIdClientMap[homeList[i].ID] = cli; 
    }
}

var listenConnection = function(){

}

process.on("uncaughtException", (err)=>{
    console.error("caught exception: ", err.stack);
});

start();