"use strict"
const TAG = "utils/db_connection.js";
const redis = require("redis");
const config = require("../share/config");
const mongo = require("mongodb");
const mysql = require("mysql");

var dbc = module.exports;

dbc.redisConnect = function(){
    var conn = redis.createClient(config.REDIS_PORT, config.REDIS_IP, {});
    conn.on("error", (err)=>{
        console.error(TAG, "redis connect error:", err);
    });
    global.g_redisConn = conn;
    g_logger.info(TAG, "redis数据库连接成功！！！！！");
}

dbc.mongoConnect = function(dbName, next){
    mongo.MongoClient.connect(config.MONGO_URL, {
        useNewUrlParser: true,
        poolSize: 10,
    }, (err, client)=>{
        if (err) throw err;
        g_logger.info(TAG, "mongo数据库连接成功！！！！！");
        global.g_mongoConn = client;
        var db = client.db(dbName);
        next ? next(db) : null;
    });
}

dbc.mysqlConnect = function(dbName){
    var conn = mysql.createConnection({
        host: config.MYSQL_IP,
        port: config.MYSQL_PORT,
        user: config.MYSQL_USER,
        password: config.MYSQL_PASSWD,
        database: dbName
    });
    conn.connect(function(err){
        if (err) throw err;
        g_logger.info(TAG, "mysql数据库连接成功！！！！！", conn.threadId);
        global.g_mysqlConn = conn;
    });
}

dbc.mysqlPoolConnect = function(dbName){
    var pool = mysql.createPool({
        connectionLimit: config.MYSQL_CONNECTION_LIMIT,
        host: config.MYSQL_IP,
        port: config.MYSQL_PORT,
        user: config.MYSQL_USER,
        password: config.MYSQL_PASSWD,
        database: dbName
    });
    pool.on("enqueue", function(){
        g_logger.info("mysql 一个连接请求在排队");
    });
    g_logger.info(TAG, "mysql数据库连接成功, 使用连接池！！！！！");
    global.g_mysqlPool = pool;
}

dbc.mysqlPoolQuery = function(sql, next){
    g_mysqlPool.getConnection((err, conn)=>{
        if (err){
            g_logger.error(TAG, "mysql 获取连接出错：", err);
            return next(err);
        }
        conn.query(sql, (err, results, fields)=>{
            conn.release();
            if (err){
                g_logger.error(TAG, "mysql 查询出错：sql: ", sql, err);
                return next(err);
            }
            next(null, results, fields);
        });
    });
}