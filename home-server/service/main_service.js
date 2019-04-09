"use strict"
const TAG = "home-server/main_service.js";
const redis = require("../../dao/redis/redis_common");
const userTable = require("../../dao/mysql/mini_program/table_user");
const constant = require("../../share/constant");
const errcode = require("../../share/errcode");
const util = require("../../utils/utils");
const HomeUser = require("../models/home_user");
const logger = g_serverData.logger;
var service = module.exports;

service.login = function(loginData, next){
    if (loginData.accountType == constant.ACCOUNT_TYPE.wx){
        var wxId = getWXId(loginData.accountData);
        redis.getRegisterUserId(wxId, (err, userId)=>{
            if (err){
                logger.error(TAG, "login error:: ", err);
                return next({code: errcode.REDIS_DATABASE_ERR});
            }
            if (userId){
                userTable.queryUser(userId, (err, results, fields)=>{
                    if (err){
                        return next({code: errcode.MYSQL_DATABASE_ERR});
                    }
                    var user = new HomeUser(userId, {});
                    g_serverData.homeManager.userAdd(userId, user);
                    var res = {
                        code: 0,
                        userId: userId,
                    };
                    next(res);
                });
            }else{
                service.register(loginData, next);
            }
        });
    }else if (loginData.accountType == constant.ACCOUNT_TYPE.tel){
        next({code: errcode.OK});
    }else{
        logger.info(TAG, "login 帐号类型：", loginData.accountType);
        next({code: errcode.ACCOUNT_TYPE_ERR});
    }
}

var getWXId = function(param){
    if (param.wxUnionId){
        return param.wxUnionId;
    }else{
        return param.wxOpenId;
    }
}

service.register = function(registerData, next){
    genUserUniqueId((code, userId)=>{
        if (code != errcode.OK){
            return next({code: code});
        }
        if (registerData.accountType == constant.ACCOUNT_TYPE.wx){
            var wxId = getWXId(registerData.accountData);
            var userData = {};
            userData.userId = userId;
            userData.cliType = registerData.cliType;
            userData.accountType = registerData.accountType;
            userData.account = wxId;
            userTable.createUser(userData, function(err, results, fields){
                if (err){
                    return next({code: errcode.MYSQL_DATABASE_ERR});
                }
                var user = new HomeUser(userId, {});
                g_serverData.homeManager.userAdd(userId, user);
                redis.addToRegisterTable(wxId, userId);
                var res = {
                    code: 0,
                    userId: userId,
                };
                next(res);
            });
        }else if (registerData.accountType == constant.ACCOUNT_TYPE.tel){
            next({code: errcode.OK});
        }else{
            logger.info(TAG, "register 帐号类型：", loginData.accountType);
            next({code: errcode.ACCOUNT_TYPE_ERR});
        }
    });
}

var genUserUniqueId = function(next){
    var cur = 0;
    var _genUniqueId = function(){
        var id = util.randFirstNotZero(8);
        userTable.isHaveUserId(id, function(err, results){
            if (err){
                logger.error(TAG, "genUserUniqueId: ", err);
                return next(errcode.MYSQL_DATABASE_ERR);
            }
            if (results.length > 0){
                cur++;
                if (cur < 10){
                    _genUniqueId();
                }else{
                    return next(errcode.UP_GEN_USREID_LIMIT);
                }
            }else{
                return next(errcode.OK, id);
            }
        });
    }
    _genUniqueId();
}

service.logout = function(){

}