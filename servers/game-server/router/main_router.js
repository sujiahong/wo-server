"use strict"
const TAG = "main_router.js";
const mainService = require("../service/main_service");


exports.createRoom = function(cli, data){
    var ret = mainService.createRoom(data.roomInfo);
    cli.send({route: data.route, code: 0});
}

exports.addMonitor = function(svr){
    svr.on("joinRoom", function(socketId, data){
        var ret = mainService.joinRoom(data.joinData);
        svr.push(socketId, {route: data.route, code: 0});
    });
    svr.on("go", function(socketId, data){
        svr.push(socketId, data);
    });
}