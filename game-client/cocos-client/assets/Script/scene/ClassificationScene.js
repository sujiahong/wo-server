"use strict";
const TAG = "ClassificationScene.js";

if (!cc.g_ada){
    cc.g_ada = {};
}

const ClassificationRoom = require("../model/garbage/ClassificationRoom");
const constant = require("../share/constant");
const config = require("./garbage/GarbageConfig");

var cls = {};

cls.extends = cc.Component;
cls.properties = {
    closeButton: cc.Button,
    garbagePrefab: {
        default: null,
        type: cc.Prefab
    },
    timeLimit: 0,
    timeCount: 0,
};

cls.onLoad = function(){
    this.closeButton.node.on("click", this.onClose, this); 
    cc.g_ada.room = new ClassificationRoom(constant.ROOM_TYPE.garbage);
    cc.g_ada.room.scene = this;
    // this.garbagePrefab.node.removeFromParent();
    //var player = new Player(cc.g_ada.gameUser.getPlayerInitData());
}

cls.update = function(dt){
    this.timeCount += dt;
    if (this.timeCount >= this.timeLimit){
        cc.g_ada.room.spawnGarbage();
        this.timeCount = 0;
        this.timeLimit = Math.random()*1000000%config.TIME_LIMIT_MAX+1;
    }
}

cls.createGarbageSprite = function(keyid, img){
    console.log("11111111     ", keyid, img)
    let garbage = cc.instantiate(this.garbagePrefab);
    this.node.addChild(garbage);
    garbage.setPosition(0, 700);
    var gspt = garbage.getComponent("GarbageSprite");
    gspt.keyid = keyid;
    cc.loader.load(cc.url.raw(img), function(err, texture){
        if (err){
            return console.log("createGarbageSprite load err: ", err);
        }
        var spt = garbage.getComponent(cc.Sprite);
        spt.spriteFrame.setTexture(texture);
    });
}

cls.onClose = function(){
    console.log(TAG, "onClose");
}

cc.Class(cls);