"use strict";
const TAG = "StartGamePanel.js";

var cls = {};

cls.extends = cc.Component;

cls.properties = {
    closeButton: cc.Button,
    startButton: cc.Button,
    nameLabel: cc.Label,
    garbageScroll: cc.ScrollView,
    garbageDetailsPrefab: {
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
    let content = this.garbageScroll.content;
    this.createGarbageSprite(content, 1, "resources/image/07.png");
    this.createGarbageSprite(content, 2, "resources/image/08.png");
    this.createGarbageSprite(content, 3, "resources/image/09.png");
    this.createGarbageSprite(content, 4, "resources/image/010.png");
    this.createGarbageSprite(content, 5, "resources/image/011.png");
}

cls.createGarbageSprite = function(content, keyId, img){
    var self = this;
    cc.loader.load(cc.url.raw(img), function(err, texture){
        if (err){
            return console.log("createGarbageSprite load err: ", err);
        }
        var node = new cc.Node();
        var spt = node.addComponent(cc.Sprite);
        spt.spriteFrame = new cc.SpriteFrame(texture);
        console.log(texture, spt, spt.spriteFrame, node.width, node.height)
        content.addChild(node);
        node.on(cc.Node.EventType.TOUCH_START, function(event){
            console.log(TAG, "node touch start ", keyId);
        }, node);
        node.on(cc.Node.EventType.TOUCH_END, function(event){
            console.log(TAG, "node touch end ", keyId);
            var panel = cc.instantiate(self.garbageDetailsPrefab);
            self.node.addChild(panel);
            var obj = panel.getComponent("GarbageInfoPanel");
            obj.nameLabel.string = "484895050";
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