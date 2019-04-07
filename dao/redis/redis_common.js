"use strict"
const TAG = "redis_common.js";

var client = g_redisConn;

var exp = module.exports;

////////////
exp.setRecommendation = function(recommondation, str){
    client.set(recommondation, str);
}

exp.getRecommendation = function(recommondation, next){
    client.get(recommondation, function(err, str){
        if (err){
            next(err);
        }
        next(null, str);
    });
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

exp.getRegisterUId = function(wxId, next){
    client.hget("REGISTER_USER", wxId, next);
}

exp.isHaveRegisted = function(wxId, next){
    client.hexists("REGISTER_USER", wxId, next);
}