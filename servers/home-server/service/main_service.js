"use strict"
const TAG = "home-server/main_service.js";
const redis = require("../../../dao/redis/redis_common");
const luckRedis = require("../../../dao/redis/redis_lucktest");
const userTable = require("../../../dao/mysql/mini_program/table_user");
const constant = require("../../../share/constant");
const errcode = require("../../../share/errcode");
const util = require("../../../utils/utils");
const HomeUser = require("../models/home_user");
const logger = g_serverData.logger;

var service = module.exports;

service.login = function(loginData, next){
    loginData.accountData = JSON.parse(decodeURIComponent(loginData.accountData));
    redis.getRegisterUserId(loginData.account, (ret)=>{
        if (ret.code != errcode.OK){
            return next(ret);
        }
        var userId = ret.userId;
        if (userId){
            doLogin(userId, loginData, next);
        }else{
            logger.info(TAG, "go 注册！！！", loginData);
            service.register(loginData, next);
        }
    });
}

var doLogin = function(userId, loginData, next){
    userTable.queryUser(userId, (ret)=>{
        if (ret.code != errcode.OK){
            return next(ret);
        }
        var userData = ret.results[0];
        var accountData = loginData.accountData;
        accountData.avatarUrl = decodeURIComponent(accountData.avatarUrl);
        accountData.nickName = decodeURIComponent(accountData.nickName);
        if(accountData.avatarUrl == userData.icon && accountData.gender == userData.sex &&
        accountData.nickName == userData.nickname){
            if (loginData.ip == userData.login_ip){
                userTable.modifyUserLoginTime(userId, function(){});
            }else{
                userTable.modifyUserLoginIP(userId, loginData.ip, function(){});
            }
        }else{
            loginData.accountData.ip = loginData.ip;
            userTable.modifyUserInfo(userId, loginData.accountData, function(){});
        }
        var user = new HomeUser(userId, userData);
        g_serverData.homeManager.userAdd(userId, user);
        redis.getRecommendationTTL(loginData.recommendation, function(num){
            if (num > 0){
                user.timeId = setTimeout(function(){
                    g_serverData.homeManager.userExit(userId);
                    delete g_serverData.homeManager.recommendationAccountMap[loginData.recommendation];
                }, num);
            }else{
                g_serverData.homeManager.userExit(userId);
                delete g_serverData.homeManager.recommendationAccountMap[loginData.recommendation];
            }
        });
        var res = {
            code: 0,
            userId: userId,
            coins: userData.coins,
        };
        next(res);
    });
}

service.register = function(registerData, next){
    genUserUniqueId((code, userId)=>{
        if (code != errcode.OK){
            return next({code: code});
        }
        var userData = {};
        userData.userId = userId;
        userData.cli_type = registerData.cliType;
        userData.account_type = registerData.accountType;
        userData.account = registerData.account;
        userData.client_id = registerData.clientId;
        userData.nickname = decodeURIComponent(registerData.accountData.nickName);
        userData.sex = registerData.accountData.gender;
        userData.icon = decodeURIComponent(registerData.accountData.avatarUrl) || "";
        userData.coins = 20;
        userData.login_ip = registerData.ip;
        userTable.createUser(userData, function(ret){
            if (ret.code != errcode.OK){
                return next(ret);
            }
            var user = new HomeUser(userId, userData);
            g_serverData.homeManager.userAdd(userId, user);
            redis.getRecommendationTTL(registerData.recommendation, function(num){
                if (num > 0){
                    user.timeId = setTimeout(function(){
                        g_serverData.homeManager.userExit(userId);
                        delete g_serverData.homeManager.recommendationAccountMap[registerData.recommendation];
                    }, num);
                }else{
                    g_serverData.homeManager.userExit(userId);
                    delete g_serverData.homeManager.recommendationAccountMap[registerData.recommendation];
                }
            });
            redis.addToRegisterTable(registerData.account, userId);
            var res = {
                code: 0,
                userId: userId,
                coins: 20
            };
            logger.info(TAG, "to client data: ", res);
            next(res);
        });
    });
}

var genUserUniqueId = function(next){
    var cur = 0;
    var _genUniqueId = function(){
        var id = util.randFirstNotZero(8);
        userTable.isHaveUserId(id, function(ret){
            if (ret.code != errcode.OK){
                return next(ret.code);
            }
            if (ret.results.length > 0){
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

service.logout = function(userId, next){
    g_serverData.homeManager.userExit(userId);
    next({code: errcode.OK});
}

service.luckTest = function(user, next){
    logger.info(TAG, "luckTest......", typeof user.id);
    luckRedis.getUserIdTimes(user.id, function(ret){
        if (ret.code != errcode.OK){
            return next(ret);
        }
        var times = ret.times;
        var info = constant.MINIINFO[user.miniId];
        var maxTimes = info.times;
        if (times+1 > maxTimes){
            return next({code: errcode.UP_TIMES_LIMIT});
        }
        var costArr = info.consumption;
        user.coins -= costArr[times];
        luckRedis.setUserIdTimes(user.id, times + 1, function(){
            userTable.modifyUserCoins(user.id, user.coins, function(){});
            next({code: errcode.OK, coins: user.coins});
        });
    });
}

service.acquireSignData = function(user, next){
    if (user.signTimeArr){
        next({code: errcode.OK, data: user.signTimeArr});
    }else{
        luckRedis.getUserIdSignTimeArr(user.id, function(ret){
            if (ret.code != errcode.OK){
                return next(ret);
            }
            user.signTimeArr = ret.arr;
            next({code: errcode.OK, data: ret.arr});
        });
    }
}

service.signIn = function(user, next){
    luckRedis.getUserIdSignin(user.id, function(ret){
        if (ret.code != errcode.OK){
            return next(ret);
        }
        var times = ret.times;
        if (times > 0){
            return next({code: errcode.HAVE_SIGNIN});
        }
        service.acquireSignData(user, function(ret){
            if (ret.code != errcode.OK){
                return next(ret);
            }
            luckRedis.setUserIdSignin(user.id, times+1);
            ret.data.push(Date.now());
            user.signTimeArr = ret.data;
            luckRedis.setUserIdSignTimeArr(user.id, ret.data);
            var coin = 60 + Math.floor(Math.random() * 1000000)%10 + Math.floor(Math.pow(user.coins, 1/3));
            user.coins += coin;
            userTable.modifyUserCoins(user.id, user.coins, function(){});
            ret.coin = coin;
            next(ret);
        });
    });
}

service.shareSignInSuccess = function(user, coin, next){
    service.acquireSignData(user, function(ret){
        if (ret.code != errcode.OK){
            return next(ret);
        }
        user.coins += coin;
        userTable.modifyUserCoins(user.id, user.coins, function(){
            ret.coin = 2 * coin;
            next(ret);
        });
    });
}