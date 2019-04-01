"use strict"
const TAG = "utils/db_connection.js";
const redis = require("redis");
const config = require("../share/config");

var dbc = module.exports;

dbc.redisConnect = function(){
    var conn = redis.createClient(config.REDIS_PORT, config.REDIS_IP, {});
    conn.on("error", (err)=>{
        console.error(TAG, "redis connect error:", err);
    });
    global.g_redisConn = conn;
}

dbc.mongoConnect = function(){

}