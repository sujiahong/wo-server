"use strict";
const TAG = "table_user.js";
const constant = require("../../../../share/constant");

class User{
    constructor(opt){
        for (let key in opt){
            let userKey = "_" +key;
            this[userKey] = {
                _val: opt[key],
                _dirtyStat: false,
            };
            Object.defineProperty(this, key, {
                set: function(val){
                    this[userKey]._val = val;
                    this[userKey]._dirtyStat = true;
                },
                get: function(){
                    return this[userKey]._val;
                }
            });
        }
        this._dirtyStat = true;
        Object.defineProperty(this, "_dirtyStat", {enumerable: false});
        this.operation = "";////////insert  /  update
        Object.defineProperty(this, "operation", {enumerable: false});
        var _timeoutDelete = function(){
            setTimeout(() => {
                var user = g_serverData.cache.userTableCache.idUserCacheMap[opt.userid];
                if (user._dirtyStat == false){
                    delete g_serverData.cache.userTableCache.idUserCacheMap[opt.userid];
                    delete g_serverData.cache.userTableCache.idUserCacheMap[opt.account];
                }else{
                    _timeoutDelete();
                }
            }, constant.CACHE_STAY_TIME);
        }
        _timeoutDelete();
    }
    setOperation(op){
        this.operation = op;
    }
}

module.exports = User;