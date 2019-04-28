"use strict"
const TAG = "game_player.js";

class Player{
    constructor(id){
        this.userId = id;
        this.socketId = "";
    }
};

module.exports = Player;