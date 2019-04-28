"use strict"
const TAG = "home-server/main_service.js";
const redis = require("../../../dao/redis/redis_common");
const constant = require("../../../share/constant");
const errcode = require("../../../share/errcode");
const util = require("../../../utils/utils");
const logger = g_serverData.logger;

var service = module.exports;

service.createRoom = function(user, roomInfo, next){
    util.generateUniqueId(6, redis.existRoomId, function(genData){
        if (genData.code != errcode.OK){
            return next(genData);
        }
        var roomId = genData.roomId;
        var info = getGameServerInfoByRoomId(roomId);
        var homeManager = g_serverData.homeManager;
        var connectionCode = util.generateConnectionCode(user.id, homeManager.serverName, info.NAME, roomId);
        var socketId = homeManager.getSocketIdByServerId(info.ID);
        roomInfo.connectionCode = connectionCode;
        homeManager.forGameServer.send(socketId, {route: "createRoom", data: roomInfo});
        var ret = {code: 0, roomId: roomId, connectionCode: connectionCode};
        ret.ip = info.IP;
        ret.port = info.FOR_CLIENT_PORT;
        next(ret);
    });
}

var getGameServerInfoByRoomId = function(id){
    var idInfoMap = g_serverData.homeManager.idGameInfoMap;
    var servers = Object.keys(idInfoMap);
    var len = servers.length;
	if(len == 1){
		return idInfoMap[servers[0]];
	}
	var num = parseInt(id);
	var remainder = num % len;
	return idInfoMap[servers[remainder]];
}

service.joinRoom = function(user, roomId, next){
    var homeManager = g_serverData.homeManager;
    var info = getGameServerInfoByRoomId(roomId);
    var connectionCode = util.generateConnectionCode(user.id, homeManager.serverName, info.NAME, roomId);
    var ret = {code: 0, connectionCode: connectionCode};
    ret.ip = info.IP;
    ret.port = info.FOR_CLIENT_PORT;
    next(ret);
}