"use strict";
const TAG = "StartGamePanel.js";

var cls = {};

cls.extends = cc.Component;

cls.properties = {
    closeButton: cc.Button,
    startButton: cc.Button,
    nameLabel: cc.Label,
    garbageScroll: cc.ScrollView,
    garbagePrefab: {
        default: null,
        type: cc.Prefab
    },
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
    this.garbageScroll.node.on("scroll-to-left", this.onScrollLeft, this);
    this.garbageScroll.node.on("scroll-began", this.onScrollBegan, this);
    this.createGarbageSprite("resources/image/08.png")
}

cls.createGarbageSprite = function(img){
    let content = this.garbageScroll.content;
    cc.loader.load(cc.url.raw(img), function(err, texture){
        if (err){
            return console.log("createGarbageSprite load err: ", err);
        }
        var node = new cc.Node();
        var spt = node.addComponent(cc.Sprite);
        spt.spriteFrame = new cc.SpriteFrame(texture);
        console.log(spt, spt.spriteFrame, node.width, node.height)
        content.addChild(node);
        node.on(cc.Node.EventType.TOUCH_START, function(event){
            console.log(TAG, "node touch start");
        }, node);
        node.on(cc.Node.EventType.TOUCH_END, function(event){
            console.log(TAG, "node touch end");
        }, node);
    });
}

cls.onClose = function(){
    this.node.active = false;
}

cls.onStart = function(){
    console.log(TAG, "onStart");
    cc.director.loadScene("ClassificationScene");
}

cls.onScrollLeft = function(){
    console.log(TAG, "onScrollLeft");
}

cls.onScrollBegan = function(){
    console.log(TAG, "onScrollBegan");
}

cc.Class(cls);