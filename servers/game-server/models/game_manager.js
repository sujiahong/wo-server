"use strict"
const TAG = "game_manager.js";
const RoomManager = require("./base/room_manager");

class GameManager{
    constructor(){
        this.serverId = 0;
        this.serverName = "";
        this.homeIdClientMap = {};
        this.forClientServer = null;
        this.connCodeUserIdMap = {};
        this.userIdPlayerMap = {};
        this.roomManager = new RoomManager();
    }
    getHomeClientById(id){
        return this.homeIdClientMap[id];
    }
    getPlayerById(id){
        return this.userIdPlayerMap[id];
    }
};

module.exports = GameManager;