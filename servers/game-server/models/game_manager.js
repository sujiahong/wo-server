"use strict"
const TAG = "game_manager.js";

class GameManager{
    constructor(){
        this.serverId = 0;
        this.serverName = "";
        this.homeIdClientMap = {};
        this.forClientServer = null;
        this.connCodeUserIdMap = {};
        this.userIdPlayerMap = {};
        this.roomIdRoomMap = {};
    }
    setHomeClient(){

    }
    getHomeClientById(){
        
    }
};

module.exports = GameManager;