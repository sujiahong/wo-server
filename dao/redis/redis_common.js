"use strict"
const TAG = "redis_common.js";

var client = g_redisConn;

var exp = module.exports;

////////////推荐码
exp.setRecommendation = function(recommondation, str){
    client.set(recommondation, str);
    client.pexpire(recommondation, 60*1000);
}

exp.getRecommendation = function(recommondation, next){
    var _get = function(){
        client.get(recommondation, function(err, str){
            if (err){
                _get();
            }
            next(null, str);
        });
    }
    _get();
}

exp.getRecommendationTTL = function(recommondation, next){
    var _get = function(){
        client.pttl(recommondation, function(err, num){
            if (err){
                setTimeout(_get, 1000);
            }
            next(num);
        });
    }
    _get();
}

///////////////注册用户表/////////////////
exp.addToRegisterTable = function(wxId, userId){
    var _set = function(){
        client.hset("REGISTER_USER", wxId, userId, function(err, reply){
            if (err || reply != 1){
                return _set();
            }
        });
    }
    _set();
}

exp.getRegisterUserId = function(wxId, next){
    client.hget("REGISTER_USER", wxId, function(err, id){
        if (err){
            logger.error(TAG, "exp.getRegisterUserId error: ", err);
            return next({code: 20});
        }
        next({code: 0, userId: id});
    });
}

exp.isHaveRegisted = function(wxId, next){
    client.hexists("REGISTER_USER", wxId, next);
}