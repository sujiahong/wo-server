"use strict"
const TAG = "main_router.js";
const mainService = require("../service/main_service");


exports.createRoom = function(cli, data){
    mainService.createRoom(data.roomInfo);
    cli.send({route: "createRoom", code: 0});
}

exports.listen = function(svr){
    svr.on("connect", function(socketId, data){
        mainService.joinRoom(data);
        svr.send(socketId, {route: "connect"});
    });
}