"use strict"
const TAG = "home_manager.js";

class HomeManager {
    constructor(){
        this.serverId = 0;
        this.serverName = "";
        this.userIdObjectMap = {};
        this.recommendationAccountMap = {};
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
    setServerId(id){
        this.serverId = id;
    }
    getServerId(){
        return this.serverId;
    }
    setServerName(name){
        this.serverName = name;
    }
    getServerName(){
        return this.serverName;
    }
};

module.exports = HomeManager;