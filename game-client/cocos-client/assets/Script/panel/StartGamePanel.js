"use strict";
const TAG = "StartGamePanel.js";

var cls = {};

cls.extends = cc.Component;

cls.properties = {
    closeButton: cc.Button,
    startButton: cc.Button,
};

cls.onLoad = function(){
    console.log(TAG, "onLoad onLoad");
    this.closeButton.node.on("click", this.onClose, this);
    this.startButton.node.on("click", this.onStart, this);
}

cls.onClose = function(){
    this.node.active = false;
}

cls.onStart = function(){
    console.log(TAG, "onStart");
}


cc.Class(cls);