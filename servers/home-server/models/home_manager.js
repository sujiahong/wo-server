"use strict"
const TAG = "home_manager.js";

class HomeManager {
    constructor(){
        this.serverId = 0;
        this.serverName = "";
        this.userIdObjectMap = {};
        this.recommendationAccountMap = {};
        this.idGameInfoMap = {};
        this.forGameServer = null;
    }
    userAdd(id, user){
        this.userIdObjectMap[id] = user;
    }
    getUserById(id){
        return this.userIdObjectMap[id];
    }
    userExit(id){
        delete this.userIdObjectMap[id];
    }
    getServerId(){
        return this.serverId;
    }
    getServerName(){
        return this.serverName;
    }
    getSocketIdByServerId(serverId){
        return this.idGameInfoMap[serverId].socketId;
    }
};

module.exports = HomeManager;