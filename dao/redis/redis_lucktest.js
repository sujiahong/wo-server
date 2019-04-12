"use strict"
const TAG = "redis_lucktest.js";

var client = g_redisConn;
var logger = g_serverData.logger;
var exp = module.exports;

exp.setUserIdTimes = function(userId, times, next){
    var _set = function(){
        client.hset("USERID_TIMES", userId, String(times), (err, reply)=>{
            if (err || reply < 0){
                return setTimeout(_set, 200);
            }
            next ? next() : null;
            if (reply == 1){
                client.pttl("USERID_TIMES", function(err, num){
                    if (err){
                        return logger.error(TAG, "exp.setUserIdTimes 设置 USERID_TIMES 超时时间出错", err);
                    }
                    if (num == -1){
                        var nowTime = Date.now();
                        var time = 86400000 - (nowTime + 28800000)%86400000;
                        client.pexpire("USERID_TIMES", time);
                    }
                });
            }
        });
    }
    _set();
}

exp.getUserIdTimes = function(userId, next){
    client.hget("USERID_TIMES", userId, function(err, times){
        if (err){
            logger.error(TAG, "exp.getUserIdTimes error: ", err);
            return next({code: 20});
        }
        if (!times)
            times = 0;
        else
            times = Number(times);
        next({code: 0, times: times});
    });
}

exp.delUserIdTimes = function(){
    client.del("USERID_TIMES");
}

exp.setUserIdSignin = function(userId, times, next){
    var _set = function(){
        client.hset("USERID_SIGNIN", userId, String(times), (err, reply)=>{
            if (err || reply < 0){
                return setTimeout(_set, 200);
            }
            next ? next() : null;
            if (reply == 1){
                client.pttl("USERID_SIGNIN", function(err, num){
                    if (err){
                        return logger.error(TAG, "exp.setUserIdSignin 设置 USERID_SIGNIN 超时时间出错", err);
                    }
                    if (num == -1){
                        var nowTime = Date.now();
                        var time = 86400000 - (nowTime + 28800000)%86400000;
                        client.pexpire("USERID_SIGNIN", time);
                    }
                });
            }
        });
    }
    _set();
}

exp.getUserIdSignin = function(userId, next){
    client.hget("USERID_SIGNIN", userId, function(err, times){
        if (err){
            logger.error(TAG, "exp.getUserIdSignin error: ", err);
            return next({code: 20});
        }
        if (!times)
            times = 0;
        else
            times = Number(times);
        next({code: 0, times: times});
    });
}

exp.setUserIdSignTimeArr = function(userId, arr, next){
    var _set = function(){
        client.hset("USERID_SIGNTIMEARR", userId, JSON.stringify(arr), (err, reply)=>{
            if (err || reply < 0){
                return setTimeout(_set, 200);
            }
            next ? next() : null;
        });
    }
    _set();
}

exp.getUserIdSignTimeArr = function(userId, next){
    client.hget("USERID_SIGNTIMEARR", userId, function(err, str){
        if (err){
            logger.error(TAG, "exp.getUserIdSignTimeArr error: ", err);
            return next({code: 20});
        }
        var arr;
        if (!str)
            arr = [];
        else
            arr = JSON.parse(str);
        next({code: 0, arr: arr});
    });
}