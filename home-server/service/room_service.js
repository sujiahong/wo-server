"use strict"
const TAG = "home-server/main_service.js";
const redis = require("../../dao/redis/redis_common");
const constant = require("../../share/constant");
const errcode = require("../../share/errcode");
const util = require("../../utils/utils");
const config = require("../../share/config");
const logger = g_serverData.logger;

var service = module.exports;

service.createRoom = function(user, roomInfo, next){
    util.generateUniqueId(6, redis.existRoomId, function(ret){
        if (ret.code != errcode.OK){
            return next(ret);
        }
        var roomId = ret.roomId;
        var info = getGameServerInfoByRoomId(roomId);
        var homeManager = g_serverData.homeManager;
        var connectionCode = homeManager.serverName + "|" + info.NAME + "|" +
        roomId + "|" + Math.floor(Date.now() * Math.random());
        var socketId = homeManager.getSocketIdByServerId(info.ID);
        roomInfo.connectionCode = connectionCode;
        homeManager.forGameServer.send(socketId, {route: "createRoom", roomInfo: roomInfo});
        homeManager.forGameServer.on("createRoom", function(socketId, data){
            if (data.code != errcode.OK){
                return next({code: data.code});
            }
            logger.info(TAG, "create room ", info);
            var ret = {code: 0, roomId: roomId, connectionCode: connectionCode};
            ret.ip = info.IP;
            ret.port = info.FOR_CLIENT_PORT;
            next(ret);
        });
    });
}

var getGameServerInfoByRoomId = function(id){
    var servers = config.GAEM_SERVER_LIST;
    var len = servers.length;
	if(len == 1){
		return servers[0];
	}
	var num = parseInt(id);
	var remainder = num % len;
	return servers[remainder];
}

service.joinRoom = function(user, roomId, next){
    var info = getGameServerInfoByRoomId(roomId);
    var ret = {code: 0};
    ret.ip = info.IP;
    ret.port = info.FOR_CLIENT_PORT;
    next(ret);
}