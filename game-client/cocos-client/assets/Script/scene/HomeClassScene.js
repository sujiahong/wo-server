"use strict";
const TAG = "HomeClassScene.js";

if (!cc.g_ada){
    cc.g_ada = {};
}
const g_ada = cc.g_ada;
const constant = require("../share/constant");
const config = require("../model/garbage/GarbageConfig");

var cls = {};

cls.extends = cc.Component;
cls.properties = {
    startButton: cc.Button,
    userAvatar: cc.Sprite
};

cls.onLoad = function(){
    console.log(TAG, "onLoad !");
    if (typeof wx === undefined)
        return;
    this.startButton.node.on("click", this.onStart, this);
}

cls.onStart = function(){
    console.log(TAG, "onStart!!");
    cc.director.loadScene("ClassificationScene");
}

cc.Class(cls);