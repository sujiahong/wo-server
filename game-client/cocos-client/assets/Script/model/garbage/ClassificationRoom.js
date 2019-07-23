"use strict";
const TAG = "ClassificationRoom.js";
const Room = require("../Room");
const config = require("./GarbageConfig");

class ClassificationRoom extends Room{
    constructor(type){
        super(type);
        this.garbageClassificationArr = [];
        console.log("ClassificationRoom construct");
    }

    spawnGarbage(){
        var keyid = Math.floor(Math.random()*100000) % config.GARBAGE_KEYID_MAX+1;
        var img = config.GARBAGE_KEYID_2_IMG[keyid];
        this.scene.createGarbageSprite(keyid, img);
    }

};

module.exports = ClassificationRoom;