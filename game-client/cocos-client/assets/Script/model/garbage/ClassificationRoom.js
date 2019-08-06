"use strict";
const TAG = "ClassificationRoom.js";
const Room = require("../Room");
const config = require("GarbageConfig");

class ClassificationRoom extends Room{
    constructor(type){
        super(type);
        this.garbageClassificationArr = [];
        this.garbageOpCount = 0;
        this.garbageCount = 0;
        this.garbageDataArr = [];
        console.log("ClassificationRoom construct");
    }

    spawnGarbage(){
        for (var i = 0; i < 5; ++i){
            var keyid = Math.floor(Math.random()*100000) % config.GARBAGE_KEYID_MAX+1;
            var img = config.GARBAGE_KEYID_2_IMG[keyid];
            this.garbageDataArr.push({keyid: keyid, img: img});
        }
        //this.scene.createGarbageSprite(keyid, img);
    }

    getBarbageDataByIndex(idx){
        return this.garbageDataArr[idx];
    }

    isLastGarbage(){
        if (this.garbageCount >=  this.garbageDataArr.length){
            return true;
        }
        return false;
    }

};

module.exports = ClassificationRoom;
