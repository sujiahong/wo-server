"use_strict"
const TAG = "table_action_user.js";
const util = require("util");
const dbConn = require("../../../utils/db_connection");

exports.queryUser = function(userId){
    var sql = "SELECT * FROM admin_user WHERE id = " + userId;
    return dbConn.mysqlQuery(sql);
}