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
    userAvatar: cc.Sprite,
    nameLabel: cc.Label,
    strengthAvatar: cc.Sprite,
    strengthLabel: cc.Label,
    redAvatar: cc.Sprite,
    redLabel: cc.Label,
    rankButton: cc.Button,
    wasteButton: cc.Button,
    startPanel: cc.Sprite,
};

cls.onLoad = function(){
    console.log(TAG, "onLoad !", wx);
    if (typeof wx === undefined)
        return;
    this.startButton.node.on("click", this.onStart, this);
    this.rankButton.node.on("click", this.onRank, this);
    this.wasteButton.node.on("click", this.onWaste, this);
}

cls.onStart = function(){
    console.log(TAG, "onStart!!");
    this.startPanel.node.active = true;
}

cls.onRank = function(){
    console.log(TAG, "onRank!!");
}

cls.onWaste = function(){
    console.log(TAG, "onWaste!!");
}

cc.Class(cls);