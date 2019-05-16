"use_strict"
const TAG = "table_action_user.js";
const util = require("util");
const dbConn = require("../../../utils/db_connection");

exports.createUserTable = function(name, next){
    var sql = "CREATE TABLE " + name;
    dbConn.mysqlPoolQuery(sql, next);
}

exports.createUser = function(userData, next){
    var time = Date.now();
    var sql = "INSERT INTO mp_user(userid,nickname,sex,icon,coins,create_time,login_time,client_id,cli_type,account_type,account,login_ip) \
    VALUES(%s,'%s',%d,'%s',%d,%d,%d,%d,'%s','%s','%s','%s')";
    sql = util.format(sql, userData.userid, userData.nickname, userData.sex, userData.icon, userData.coins,
        time, time, userData.client_id, userData.cli_type, userData.account_type, userData.account, userData.login_ip);
    dbConn.mysqlPoolQuery(sql, next);
}

exports.modifyUser = function(sql, next){
    dbConn.mysqlPoolQuery(sql, next);
}

exports.modifyUserLoginIP = function(userId, ip, next){
    var sql = "UPDATE mp_user SET login_ip='%s', login_time=%d  WHERE userid = " + userId;
    sql = util.format(sql, ip, Date.now());
    dbConn.mysqlPoolQuery(sql, next);
}

exports.modifyUserLoginTime = function(userId, next){
    var sql = "UPDATE mp_user SET login_time=%d  WHERE userid = " + userId;
    sql = util.format(sql, Date.now());
    dbConn.mysqlPoolQuery(sql, next);
}

exports.modifyUserCoins = function(userId, coins, next){
    var sql = "UPDATE mp_user SET coins=%d  WHERE userid = " + userId;
    sql = util.format(sql, coins);
    dbConn.mysqlPoolQuery(sql, next);
}

exports.queryUser = function(userId, next){
    var sql = "SELECT * FROM mp_user WHERE userid = " + userId;
    dbConn.mysqlPoolQuery(sql, next);
}

exports.queryUserLastLogin = function(next){
    var sql = "SELECT * FROM mp_user WHERE";
    dbConn.mysqlPoolQuery(sql, next);
}

exports.queryAccount = function(account, next){
    var sql = "SELECT * FROM mp_user WHERE account = " + account;
    dbConn.mysqlPoolQuery(sql, next);
}

exports.queryAllUserId = function(next){
    var sql = "SELECT userid FROM mp_user";
    dbConn.mysqlPoolQuery(sql, next);
}

exports.isHaveUserId = function(userId, next){
    var sql = "SELECT account FROM mp_user WHERE userid = " + userId;
    dbConn.mysqlPoolQuery(sql, next);
}

