"use strict"
const TAG = "main_router.js";
const mainService = require("../service/main_service");


exports.notifyFromHome = function(cli){
    cli.on("createRoom", function(data){
        mainService.createRoom(data.roomInfo);
    });
}

exports.addMonitor = function(svr){
    svr.on("joinRoom", function(data, next){
        var ret = mainService.joinRoom(data.joinData);
        next({code: 0});
    });
    svr.on("go", function(data, next){
        next({code: 0});
    });
}