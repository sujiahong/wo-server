"use strict"
const TAG = "home_manager.js";

class HomeManager {
    constructor(){
        this.userIdObjectMap = {};
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
};

module.exports = HomeManager;