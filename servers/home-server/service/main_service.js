"use strict"
const TAG = "home-server/main_service.js";
const redis = require("../../../dao/redis/redis_common");
const luckRedis = require("../../../dao/redis/redis_lucktest");
const userTable = g_serverData.cache.userTableCache;
const constant = require("../../../share/constant");
const errcode = require("../../../share/errcode");
const util = require("../../../utils/utils");
const HomeUser = require("../models/home_user");
const logger = g_serverData.logger;

var service = module.exports;

service.login = function(loginData, next){
    loginData.accountData = JSON.parse(decodeURIComponent(loginData.accountData));
    userTable.selectAccount(loginData.account, (ret)=>{
        if (ret.code != errcode.OK){
            return next(ret);
        }
        if (ret.data){
            doLogin(ret.data, loginData, next);
        }else{
            logger.info(TAG, "go 注册！！！", loginData);
            service.register(loginData, next);
        }
    });
}

var doLogin = function(cacheUser, loginData, next){
    var userId = cacheUser.userid;
    var accountData = loginData.accountData;
    accountData.avatarUrl = decodeURIComponent(accountData.avatarUrl);
    accountData.nickName = decodeURIComponent(accountData.nickName);
    userTable.updateUser(userId, {nickname: accountData.nickName, icon: accountData.avatarUrl,
         sex: accountData.gender, login_ip: loginData.ip, login_time: Date.now()}, 
    function(ret){
        if (ret.code != errcode.OK){
            return next(ret);
        }
        var user = new HomeUser(userId, cacheUser);
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
            coins: cacheUser.coins,
        };
        next(res);
    });
}

service.register = function(registerData, next){
    genUserUniqueId((code, userId)=>{
        if (code != errcode.OK){
            logger.error(TAG, "生成userid errcode: ", code);
            return next({code: code});
        }
        var time = Date.now();
        var userData = {
            userid : userId,
            cli_type : registerData.cliType,
            account_type : registerData.accountType,
            account : registerData.account,
            client_id : registerData.clientId,
            nickname : decodeURIComponent(registerData.accountData.nickName),
            sex : registerData.accountData.gender,
            icon : decodeURIComponent(registerData.accountData.avatarUrl) || "",
            coins : 20,
            login_ip : registerData.ip,
            create_time : time,
            login_time : time,
            lv: 0,
            location: "",
            successive_sign: 0,
        };
        var cacheUser = userTable.insertUser(userData);
        var user = new HomeUser(userId, cacheUser);
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
        redis.addToUserIdTable(userId);
        var res = {
            code: 0,
            userId: userId,
            coins: 20
        };
        logger.info(TAG, "to client data: ", res);
        next(res);
    });
}

var genUserUniqueId = function(next){
    var cur = 0;
    var _genUniqueId = function(){
        var id = util.randFirstNotZero(8);
        redis.isHaveUsed(id, function(ret){
            if (ret.code != errcode.OK){
                return next(ret.code);
            }
            if (ret.is){
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
            userTable.updateUser(user.id, {coins: user.coins}, function(){});
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
            userTable.updateUser(user.id, {coins: user.coins}, function(){
                ret.coin = coin;
                next(ret);
            });
        });
    });
}

service.shareSignInSuccess = function(user, coin, next){
    service.acquireSignData(user, function(ret){
        if (ret.code != errcode.OK){
            return next(ret);
        }
        user.coins += coin;
        userTable.updateUser(user.id, {coins: user.coins}, function(){
            ret.coin = 2 * coin;
            next(ret);
        });
    });
}