"use strict"
const TAG = "utils/log_launch.js";

const log4js = require("log4js");
const logconf = require("../config/log_conf.json");

log4js.configure(logconf);

module.exports = function(category){
    return log4js.getLogger(category);
}

