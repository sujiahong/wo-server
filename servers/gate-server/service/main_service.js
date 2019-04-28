"use strict"
const TAG = "gate-server/main_ervice.js";
const httpReq = require("../../../utils/http_request");
const errcode = require("../../../share/errcode");
const constant = require("../../../share/constant");
const redis = require("../../../dao/redis/redis_common");
const utils = require("../../../utils/utils");
const logger = g_serverData.logger;
var service = module.exports;

service.validateUser = function(vData, next){
    logger.info(TAG, vData)
    switch(vData.accountType){
    case constant.ACCOUNT_TYPE.wx:
        httpReq.loginWX(vData, function(ret){
            var toData = {};
            toData.code = ret.errcode;
            if (ret.errcode == errcode.OK){
                var openid = ret.openid;
                toData.account = openid;
                var homeServerData = recommondHomeServer(g_serverData.idHomeInfoMap);
                toData.ip = homeServerData.IP;
                toData.port = homeServerData.FOR_CLIENT_PORT;
                var str = genRecommendationCode(vData.accountType, homeServerData.ID, openid);
                toData.recommendation = str;
                redis.setRecommendation(str, openid);
                notifyHomeServerRecommendation(homeServerData.ID, str, openid);
            }
            next(toData);
        });
        break;
    case constant.ACCOUNT_TYPE.tel:
        var toData = {};
        toData.code = errcode.OK;
        var account = JSON.parse(decodeURIComponent(vData.accountData)).account;
        toData.account = account;
        var homeServerData = recommondHomeServer(g_serverData.idHomeInfoMap);
        toData.ip = homeServerData.IP;
        toData.port = homeServerData.FOR_CLIENT_PORT;
        var str = genRecommendationCode(constant.ACCOUNT_TYPE.tel, homeServerData.ID, account);
        toData.recommendation = str;
        redis.setRecommendation(str, account);
        notifyHomeServerRecommendation(homeServerData.ID, str, account);
        next(toData);
        break;
    case constant.ACCOUNT_TYPE.wb:
        break;
    case constant.ACCOUNT_TYPE.mail:
        break;
    default:
        next({code: errcode.ACCOUNT_TYPE_ERR});
    }
}

var genRecommendationCode = function(accountType, homeServerName, account){
    var val = Math.floor(Date.now() * Math.random()); 
    var str = g_serverData.serverName + "|" + homeServerName +  "|" + accountType + "|" + account + "|" + val;
    return utils.md5(str);
}

var recommondHomeServer = function(serverMap){
    var serverList = Object.keys(serverMap);
    var len = serverList.length;
    if(len == 1){
		return serverMap[serverList[0]];
	}
    var idx = Math.floor(Math.random()* 100000) % len;
    return serverMap[serverList[idx]];
}

var notifyHomeServerRecommendation = function(homeId, str, account){
    var socketId = g_serverData.idHomeInfoMap[homeId].socketId;
    g_serverData.forHomeServer.send(socketId, {route: "recommend", data: {recommendation: str, account: account}});
}

service.checkRecommendation = function(vData, next){
    redis.getRecommendation(vData.recommendation, function(ret){
        if (ret.account){
            next({code: errcode.OK});
        }else{
            next({code: errcode.RECOMMENDATION_NOT_EXIST});
        }
    });
}