"use strict";
const TAG = "initCache.js";
g_serverData.cache = {};
const mysqlUser = require("../../mysql/mini_program/table_user");
const User = require("./table/user");
const errcode = require("../../../share/errcode");
const constant = require("../../../share/constant");
const logger = g_serverData.logger;

class UserTableCache {
    constructor(){
        this.idUserCacheMap = {};
        setTimeout(()=>{
            refreshData(this);
        }, constant.REFRESH_MYSQL_TIME);
    }
    insertUser(data){
        var user = new User(data);
        user.setOperation("insert");
        this.idUserCacheMap[user.userid] = user;
        return user;
    }
    selectUser(userId, next){
        var self = this;
        var user = self.idUserCacheMap[userId];
        if (!user){
            mysqlUser.queryUser(userId, function(ret){
                if (ret.code != errcode.OK){
                    return next(ret);
                }
                user = new User(ret.results[0]);
                user.setOperation("update");
                self.idUserCacheMap[userId] = user;
                self.idUserCacheMap[user.account] = user;
                Object.defineProperty(self.idUserCacheMap, user.account, {enumerable: false});
                next({code: 0, data: user});
            });
        }else{
            next({code: 0, data: user});
        }
    }
    selectAccount(account, next){
        var self = this;
        var user = self.idUserCacheMap[account];
        if (!user){
            mysqlUser.queryAccount(account, function(ret){
                if (ret.code != errcode.OK){
                    return next(ret);
                }
                if (ret.results.length > 0){
                    user = new User(ret.results[0]);
                    user.setOperation("update");
                    self.idUserCacheMap[account] = user;
                    Object.defineProperty(self.idUserCacheMap, account, {enumerable: false});
                    self.idUserCacheMap[user.userid] = user;
                    next({code: 0, data: user});
                }else{
                    next({code: 0});
                }
            });
        }else{
            next({code: 0, data: user});
        }
    }
    updateUser(userId, data, next){
        this.selectUser(userId, function(ret){
            if (ret.code != errcode.OK){
                return next(ret);
            }
            for (var key in data){
                if (ret.data[key] != data[key]){
                    ret.data[key] = data[key];
                    ret.data._dirtyStat = true;
                }
            }
            next({code: 0});
        });
    }
    deleteUser(userId){
        if (this.idUserCacheMap[userId]){
            delete this.idUserCacheMap[userId];
        }
        /////删除数据库
    }
}

var refreshData = function(self){
    var head = "UPDATE mp_user SET ";
    var tail = " WHERE userid=";
    var userDirtyArr = [];
    var map = self.idUserCacheMap;
    for (var key in map){
        var user = map[key];
        if (user._dirtyStat){
            userDirtyArr.push(user);
        }
    }
    var _refresh = function(idx){
        if (idx < userDirtyArr.length){
            var user = userDirtyArr[idx];
            if(user.operation == "update"){
                let dirtyArr = [];
                var str = "";
                for (let kk in user){
                    if (user[kk]._dirtyStat){
                        str += "," + kk.substr(1) + "=" + user[kk]._val;
                        dirtyArr.push(user[kk]);
                    }
                }
                if (dirtyArr.length > 0){
                    str = str.substr(1);
                    //logger.debug(TAG, "有数据更新 ", str, user.userid);
                    mysqlUser.modifyUser(head + str + tail + user.userid, function(ret){
                        if (ret.code == errcode.OK){
                            for (var i = 0; i < dirtyArr.length; ++i){
                                dirtyArr[i]._dirtyStat = false;
                            }
                            user._dirtyStat = false;
                        }
                        _refresh(idx+1);
                    });
                }
            }else{
                //logger.debug(TAG, "新玩家创建 ", user.account, user.userid);
                mysqlUser.createUser(user, function(ret){
                    if (ret.code == errcode.OK){
                        user._dirtyStat = false;
                    }
                    _refresh(idx+1);
                });
            }
        }else{
            refreshData(self);
        }
    }
    logger.info(TAG, "玩家数据变动的数量：   ", userDirtyArr.length)
    if (userDirtyArr.length > 0){
        _refresh(0);
    }else{
        setTimeout(function(){
            refreshData(self);
        }, constant.REFRESH_MYSQL_TIME);
    }
}

g_serverData.cache.userTableCache = new UserTableCache();