"use strict"
const TAG = "gameserver-start.js";
global.g_serverData = {};
g_serverData.logger = require("../../utils/log_launch")("game-server");
const logger = g_serverData.logger;
const GameManager = require("./models/game_manager");
const network = require("../../utils/network");
const WSServer = require("../../utils/network_ws");
const config = require("../../share/config");
const errcode = require("../../share/errcode");
const dbConn = require("../../utils/db_connection");
logger.info("连接 redis server， mysql server");
//连接redis
dbConn.redisConnect();
//连接mysql
dbConn.mysqlPoolConnect(config.DB_NAME_LIST[1]);

const serverInfo = JSON.parse(process.argv[2]);
g_serverData.manager = new GameManager();
const router = require("./router");

g_serverData.manager.serverName = serverInfo.NAME;
g_serverData.manager.serverId = serverInfo.ID;

logger.info(TAG, "game server start ~~!!!!", serverInfo.ID, process.pid, process.cwd());

var connectHome = function(){
    var homeList = require("../../config/cluster_info.json").HOME_SERVER_LIST;
    for (let i = 0; i < homeList.length; ++i){
        let cli = new network.Client({host: homeList[i].IP, port: homeList[i].FOR_LOGIC_PORT});
        cli.connect(function(ret){
            if (ret.code != errcode.OK){
                if (ret.code == errcode.CLIENT_SOCKET_CLOSE){
                    logger.warn(TAG, g_serverData.manager.serverName, " socket close!!!");
                }else if (ret.code == errcode.CLIENT_SOCKET_ERR){
                    logger.error(TAG, g_serverData.manager.serverName, " socket error!!!");
                }
            }else{
                cli.request("register", serverInfo, function(data){
                    logger.info(TAG, "向home server 注册 success code: ", data.code);
                });
            }
        });
        router.notifyFromHome(cli);
        g_serverData.manager.homeIdClientMap[homeList[i].ID] = cli; 
    }
}

var listenConnection = function(){
    var options = {
        port: serverInfo.FOR_CLIENT_PORT
    }
    var wsvr = new WSServer(options);
    wsvr.createServer(function(ret){
        if (ret.code == errcode.WS_SOCKET_CLOSE){
            return logger.warn(TAG, "socket id close: ",  ret.socketId, ret.uid);
        }
    });
    router.addMonitor(wsvr);
    g_serverData.manager.forClientServer = wsvr;
}

////监听game user connection;
listenConnection();

//连接home,完成register
connectHome();

process.on("exit", function(){
    logger.warn(TAG, "exit 事件", process.pid);
});

// process.on("SIGINT", function(){
//     logger.warn(TAG, "sigint 事件", process.pid);
// });

process.on("uncaughtException", (err)=>{
    console.error("caught exception: ", err.stack);
});