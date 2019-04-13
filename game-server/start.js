"use strict"
const TAG = "gameserver-start.js";
global.g_serverData = {};
g_serverData.logger = require("../utils/log_launch")("game-server");
const logger = g_serverData.logger;
const GameManager = require("./models/game_manager");
const network = require("../utils/network");
const networkWS = require("../utils/network_ws");
const config = require("../share/config");
const dbConn = require("../utils/db_connection");
//连接redis
dbConn.redisConnect();
//连接mysql
dbConn.mysqlPoolConnect(config.DB_NAME_LIST[1]);
const mainRouter = require("./router/main_router");
logger.debug(TAG, "启动 processid: ", process.pid, process.execArgv, process.argv);

var start = function(){
    g_serverData.manager = new GameManager();
    g_serverData.manager.serverId = process.argv[2];
    g_serverData.manager.serverName = process.argv[3];
    logger.info("连接 redis server， mysql server");
    //连接home,完成register
    connectHome();
    ////监听game user connection;
    listenConnection();
}

var connectHome = function(){
    var homeList = config.HOME_SERVER_LIST;
    for (var i = 0; i < homeList.length; ++i){
        var cli = new network.Client({host: homeList[i].IP, port: homeList[i].FOR_LOGIC_PORT});
        cli.connect();
        cli.request({route: "register", serverId: g_serverData.manager.serverId}, function(data){
            logger.info("注册game server ！！！！ server pid: ", process.pid, data.msg, data.serverId);
        });
        cli.on("createRoom", function(data){
            mainRouter.createRoom(cli, data);
        });
        g_serverData.manager.homeIdClientMap[homeList[i].ID] = cli; 
    }
}

var listenConnection = function(){
    var addr = getForClientListenAddress();
    logger.warn(TAG, "listenConnection addr: ", addr);
    var svr = new network.Server(addr);
    svr.createServer();
    svr.recv(function(socketId, data){});
    mainRouter.listen(svr);
    g_serverData.manager.forClientServer = svr;
}

var getForClientListenAddress = function(){
    var addr = {};
    var serverId = g_serverData.manager.serverId;
    var gameServerList = config.GAEM_SERVER_LIST;
    for (var i = 0; i < gameServerList.length; ++i){
        if (gameServerList[i].ID == serverId){
            addr.port = gameServerList[i].FOR_CLIENT_PORT;
            addr.host = gameServerList[i].IP;
            return addr;
        }
    }
    return addr;
}

process.on("exit", function(){
    logger.warn(TAG, "exit 事件", process.pid);
});

// process.on("SIGINT", function(){
//     logger.warn(TAG, "sigint 事件", process.pid);
// });

process.on("uncaughtException", (err)=>{
    console.error("caught exception: ", err.stack);
});

start();