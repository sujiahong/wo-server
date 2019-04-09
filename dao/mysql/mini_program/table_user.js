"use_strict"
const TAG = "table_user.js";
const dbConn = require("../../../utils/db_connection");

exports.createUserTable = function(name, next){
    var sql = "CREATE TABLE " + name;
    dbConn.mysqlPoolQuery(sql, next);
}

exports.createUser = function(userData, next){
    var time = Date.now();
    var sql = "INSERT INTO mp_user(userid,nickname,sex,icon,create_time,login_time,cli_type,account_type,account) \
    VALUES({0},{1},{2},{3},{4},{5},{6},{7},{8})";
    sql = sql.format(userData.userId, userData.nickname, userData.sex, 
        userData.icon, time, time, userData.cliType, userData.accountType, userData.account);
    dbConn.mysqlPoolQuery(sql, next);
}

exports.modifyUserInfo = function(userId, userInfo, next){
    var sql = "UPDATE mp_user SET nickname={0}, sex={1}, icon={2}, login_time={3}  WHERE userid = " + userId;
    sql.format(userInfo.nickname, userInfo.sex, userInfo.icon, Date.now());
    dbConn.mysqlPoolQuery(sql, next);
}

exports.modifyUserLoginTime = function(userId, next){
    var sql = "UPDATE mp_user SET login_time={0}  WHERE userid = " + userId;
    sql.format(Date.now());
    dbConn.mysqlPoolQuery(sql, next);
}

exports.queryUser = function(userId, next){
    var sql = "SELECT * FROM mp_user WHERE userid = " + userId;
    dbConn.mysqlPoolQuery(sql, next);
}

exports.isHaveUserId = function(userId, next){
    var sql = "SELECT account FROM mp_user WHERE userid = " + userId;
    dbConn.mysqlPoolQuery(sql, next);
}

