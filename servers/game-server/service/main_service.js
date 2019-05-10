"use strict"
const TAG = "game-server/main_service.js";
const redis = require("../../../dao/redis/redis_common");
const errcode = require("../../../share/errcode");

const manager = g_serverData.manager;
var service = module.exports;

service.createRoom = function(roomInfo){
    manager.roomManager.createRoom(roomInfo);
}

service.joinRoom = function(joinData, next){
    var userId = manager.connCodeUserIdMap[joinData.connectionCode];
    if (!userId){
        return next({code: errcode.CONNECTION_CODE_INVALID});
    }
    delete manager.connCodeUserIdMap[joinData.connectionCode];
    // if (joinData.userId != userId){
    //     return next({code:1});
    // }
    var player = manager.getPlayerById(joinData.userId);
    if (!player){
        return next({code: errcode.PLAYER_NOT_EXIST});
    }
    next({code: 0});
}

service.matchRoom = function(){
    
}

service.exitRoom = function(msg, next){
    var player = manager.getPlayerById(joinData.userId);
    if (!player){
        return next({code: errcode.PLAYER_NOT_EXIST});
    }
    next({code: 0});
}