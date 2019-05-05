"use strict"
const TAG = "main_router.js";
const mainService = require("../service/main_service");
const errcode = require("../../../share/errcode");

var manager = g_serverData.manager;

exports.notifyFromHome = function(cli){
    cli.on("game-info", function(data){
        data.gameInfo = {id: manager.serverId};
        cli.send({route: "game-info", data: data});
    });
    cli.on("createRoom", function(roomInfo){
        manager.connCodeUserIdMap[roomInfo.connectionCode] = roomInfo.userId;
        mainService.createRoom(roomInfo);
    });
}

exports.addMonitor = function(svr){
    svr.on("joinRoom", function(joinData, next){
        var userId = manager.connCodeUserIdMap[joinData.connectionCode];
        if (!userId){
            return next({code: errcode.CONNECTION_CODE_INVALID});
        }
        delete manager.connCodeUserIdMap[joinData.connectionCode];
        joinData.userId = userId;
        mainService.joinRoom(joinData, function(){
            next({code: 0});
        });
    });
    svr.on("go", function(data, next){
        next({code: 0});
    });
}