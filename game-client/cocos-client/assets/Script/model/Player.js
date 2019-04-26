"use strict";
const TAG = "Player.js";

class Player{
    constructor(id){
        this.userId = id;
        this.nickname = "";
        this.sex = 0;
        this.icon = "";
        this.ip = "";
        this.coins = 0;
    }
}

module.exports = Player;