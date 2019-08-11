"use strict";
const TAG = "ClassificationRoom.js";
const Room = require("../Room");
const config = require("GarbageConfig");

class ClassificationRoom extends Room{
    constructor(type){
        super(type);
        this.curLevel = 2;
        this.maxGarbageCount = 0;
        this.garbageClassificationArr = [];
        this.garbageOpCount = 0;
        this.garbageCount = 0;
        this.garbageDataArr = [];
        console.log("ClassificationRoom construct");
    }

    spawnGarbage(){
        var url = cc.url.raw("resources/json/level.json");
        var self = this;
        cc.loader.load(url, function(err, data){
            if (err == null){
                var levelData = data.json[self.curLevel];
                var garbageKeyIdArr = levelData.garbage; 
                self.maxGarbageCount = garbageKeyIdArr.length;
                console.log("21111111   ", garbageKeyIdArr.length);
                for (var i = 0; i < self.maxGarbageCount; ++i){
                    var keyid = Number((garbageKeyIdArr[i]== "")?1:garbageKeyIdArr[i]);
                    var img = config.GARBAGE_KEYID_2_IMG[keyid];
                    var interval = Number((levelData.interval[i] == "") ? 0 : levelData.interval[i])/1000;
                    self.garbageDataArr.push({keyid: keyid, img: img, interval: interval});
                }
            }
        });
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
