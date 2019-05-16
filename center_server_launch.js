"use strict";
const TAG = "center_server_launch.js";

require("./servers/center-server/start");
require("./servers/center-server/web-server/start");

const downloadConf = require("./config/download_conf.json");
const cp = require("child_process");

for (let key in downloadConf){
    console.log(TAG, "启动下载服务: ", key);
    cp.fork(downloadConf[key].START_PATH, [JSON.stringify(downloadConf[key])]);
}