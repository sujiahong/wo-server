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

/////////////////////////USERID使用表/////////////////////////
exp.addToUserIdTable = function(userId){
    var _set = function(){
        client.hset("USERID_TABLE", userId, '1', function(err, reply){
            if (err || reply < 0){
                return _set();
            }
        });
    }
    _set();
}

exp.addToMUserIdTable = function(userIdMap){
    client.hmset("USERID_TABLE", userIdMap);
}

exp.userIdTableLen = function(next){
    client.hlen("USERID_TABLE", function(err, len){
        if (err){
            logger.error(TAG, "exp.isHaveUsed error: ", err);
            return next({code: 20});
        }
        next({code: 0, len: len});
    });
}

exp.isHaveUsed = function(userId, next){
    client.hexists("USERID_TABLE", userId, function(err, ret){
        if (err){
            logger.error(TAG, "exp.isHaveUsed error: ", err);
            return next({code: 20});
        }
        next({code: 0, is: (ret == 1)})
    });
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