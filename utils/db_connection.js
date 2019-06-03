"use strict"
const TAG = "utils/db_connection.js";
const redis = require("redis");
const config = require("../share/config");
const mongo = require("mongodb");
const mysql = require("mysql");

const logger = g_serverData.logger;
var dbc = module.exports;

dbc.redisConnect = function(){
    var conn = redis.createClient(config.REDIS_PORT, config.REDIS_IP, {});
    conn.on("error", (err)=>{
        console.error(TAG, "redis connect error:", err);
    });
    global.g_redisConn = conn;
    logger.info(TAG, "redis数据库连接成功！！！！！");
}

dbc.mongoConnect = function(dbName, next){
    mongo.MongoClient.connect(config.MONGO_URL, {
        useNewUrlParser: true,
        poolSize: 10,
    }, (err, client)=>{
        if (err) throw err;
        logger.info(TAG, "mongo数据库连接成功！！！！！");
        global.g_mongoConn = client;
        var db = client.db(dbName);
        next ? next(db) : null;
    });
}

dbc.mysqlConnect = function(dbName){
    var conn = mysql.createPool({
        host: config.MYSQL_IP,
        port: config.MYSQL_PORT,
        user: config.MYSQL_USER,
        password: config.MYSQL_PASSWD,
        database: dbName,
        charset: "utf8mb4"
    });
    logger.info(TAG, "mysql数据库连接成功！！！！！", conn.threadId);
    global.g_mysqlConn = conn;
}

dbc.mysqlQuery = function(sql){
    return new Promise((resolve, reject) => {
        g_mysqlConn.query(sql, (err, results, fields) => {
            if ( err ) {
                logger.error(TAG, "mysql 查询出错：sql: ", sql, err);
                g_mysqlConn.destroy();
                dbc.mysqlConnect(config.DB_NAME_LIST[2]);
                reject({code: 21});
            } else {
                resolve({code: 0, results: results, fields: fields})
            }
        });
    })
}

dbc.mysqlPoolConnect = function(dbName){
    var pool = mysql.createPool({
        connectionLimit: config.MYSQL_CONNECTION_LIMIT,
        host: config.MYSQL_IP,
        port: config.MYSQL_PORT,
        user: config.MYSQL_USER,
        password: config.MYSQL_PASSWD,
        connectTimeout: 60000,
        acquireTimeout: 60000,
        database: dbName,
        charset: "utf8mb4",
        debug: false
    });
    pool.on("enqueue", function(){
        logger.info("mysql 一个连接请求在排队");
    });
    logger.info(TAG, "mysql数据库连接成功, 使用连接池！！！！！");
    global.g_mysqlPool = pool;
}

dbc.mysqlPoolQuery = function(sql, next){
    g_mysqlPool.getConnection((err, conn)=>{
        if (err){
            logger.error(TAG, sql, " 获取连接出错：", err);
            return next({code: 21});
        }
        conn.query(sql, (err, results, fields)=>{
            conn.release();
            if (err){
                logger.error(TAG, "mysql 查询出错：sql: ", sql, err);
                return next({code: 21});
            }
            next({code: 0, results: results, fields: fields});
        });
    });
}