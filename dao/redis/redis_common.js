"use strict"
const TAG = "redis_common.js";
const constant = require("../../share/constant");
var client = g_redisConn;

var exp = module.exports;

///////////////////推荐码/////////////////////////////
exp.setRecommendation = function(recommondation, str){
    client.set(recommondation, str);
    client.pexpire(recommondation, constant.LOGIN_TIME);
}

exp.getRecommendation = function(recommondation, next){
    var _get = function(){
        client.get(recommondation, function(err, str){
            if (err){
                _get();
            }
            next({code: 0, account: str});
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

/////////////////////////注册用户表/////////////////////////
exp.addToRegisterTable = function(wxId, userId){
    var _set = function(){
        client.hset("REGISTER_USER", wxId, userId, function(err, reply){
            if (err || reply < 0){
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

/////////////////////////房间id玩法/////////////////////////
exp.setRoomIdToPlay = function(roomId, play){
    var _set = function(){
        client.hset("ROOMID_ROOMPLAY", roomId, play, (err, reply)=>{
            if (err || reply < 0){
                return _set();
            }
        });
    }
    _set();
}

exp.getRoomIdToPlay = function(roomId, next){
	client.hget("ROOMID_ROOMPLAY", roomId, next);
}

exp.delRoomIdToPlay = function(roomId, next){
    var count = 0 ;
    var _del = function(){
        client.hdel("ROOMID_ROOMPLAY", roomId, (err, reply)=>{
            console.log(TAG, "delRoomIdToPlay ", err, reply);
            if (err || reply != 1){
                count ++;
                if (count < 10)
                    return _del();
            }
            next ? next() : null;
        });
    }
    _del();
}

exp.existRoomId = function(roomId, next){
	client.hexists("ROOMID_ROOMPLAY", roomId, function(err, ret){
        if (err){
            logger.error(TAG, "exp.existRoomId error: ", err);
            return next({code: 20});
        }
        next({code: 0, is: (ret == 1)})
    });
}

exp.clearRoomIdToPlay = function(){
	client.del("ROOMID_ROOMPLAY");
}