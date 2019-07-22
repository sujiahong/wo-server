"use strict";
const TAG = "ClassificationScene.js";

const ClassificationRoom = require("../model/garbage/ClassificationRoom");
const Player = require("../model/Player");

var cls = {};

cls.extends = cc.Component;
cls.properties = {
    trash1: cc.Sprite,
    trash2: cc.Sprite,
    closeButton: cc.Button,
    garbagePrefab: {
        default: null,
        type: cc.Prefab
    },
};

cls.onLoad = function(){
    console.log(TAG, "onload", ClassificationRoom);
    var self = this;
    this.closeButton.node.on("click", this.onClose, this); 
    var cftRoom = new ClassificationRoom(1);
    //var player = new Player(cc.g_ada.gameUser.getPlayerInitData());
    setInterval(function(){
        self.spawnGarbage();
    }, 1000);
}

cls.update = function(){

}

cls.spawnGarbage = function(){
    let garbage = cc.instantiate(this.garbagePrefab);
    this.node.addChild(garbage);
    garbage.setPosition(0, 355);
    var action = cc.sequence(cc.moveTo(3, cc.v2(0, -320)),
                cc.callFunc(function(){
                        console.log("----------------");
                        garbage.destroy();
                }));
    garbage.runAction(action);
}

cls.onClose = function(){
    console.log(TAG, "onClose");
}

cc.Class(cls);