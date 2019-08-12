"use strict";
const TAG = "StartGamePanel.js";

var cls = {};

cls.extends = cc.Component;

cls.properties = {
    closeButton: cc.Button,
    startButton: cc.Button,
    nameLabel: cc.Label,
};

cls.onLoad = function(){
    console.log(TAG, "onLoad onLoad");
    this.closeButton.node.on("click", this.onClose, this);
    this.startButton.node.on("click", this.onStart, this);
    this.node.on(cc.Node.EventType.TOUCH_START, function(event){
        event.stopPropagation();
    }, this);
    this.node.on(cc.Node.EventType.TOUCH_END, function(event){
        event.stopPropagation();
    }, this);
}

cls.onClose = function(){
    this.node.active = false;
}

cls.onStart = function(){
    console.log(TAG, "onStart");
    cc.director.loadScene("ClassificationScene");
}


cc.Class(cls);