"use strict"
const TAG = "center-server/main_service.js";
const userTable = require("../../dao/mysql/mini_program/table_user");
const redis = require("../../dao/redis/redis_common");

exports.initUserData = function(){
    /////初始化userid使用表
    redis.userIdTableLen(function(data){
        if (data.code != 0){
            return;
        }
        if (data.len == 0){
            userTable.queryAllUserId(function(ret){
                if (ret.code != 0){
                    return;
                }
                var rets = ret.results;
                var len = rets.length;
                var userIdMap = {};
                for(var i = 0; i < len; ++i){
                    userIdMap[ret.results[i].userid] = '1';
                }
                redis.addToMUserIdTable(userIdMap);
            });
        }
        console.log(TAG, "user table len: ", data.len);
    });

    /////加载用户数据
    //userTable.queryUserLastLogin();
}