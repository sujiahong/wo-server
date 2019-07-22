"use strict";
const TAG = "ClassificationScene.js";

const ClassificationRoom = require("../model/ClassificationRoom");
const Player = require("../model/Player");

var cls = {};

cls.extends = cc.Component;
cls.properties = {
    trash1: cc.Sprite,
    trash2: cc.Sprite,
    closeButton: cc.Button,
    garbage: cc.Sprite,
};

cls.onLoad = function(){
    console.log(TAG, "onload", ClassificationRoom);
    var self = this;
    this.closeButton.node.on("click", this.onClose, this); 
    var cftRoom = new ClassificationRoom(1);
    //var player = new Player(cc.g_ada.gameUser.getPlayerInitData());

    // var spt = cc.instantiate(this.garbage);
    // console.log("-----  ", spt.node, spt.parent)
    // spt.parent = this.garbage.node.parent;
    let node = new cc.Node("Sprite");
    // node.setContentSize(cc.size(70, 70));
    let sp = node.addComponent(cc.Sprite);
    sp.spriteFrame = this.garbage.spriteFrame;
    node.width = 70;
    node.height = 70;
    node.setPosition(0, 355);
    node.color = cc.Color.GREEN;
    node.parent = this.garbage.node.parent;
    //this.node.addChild(node);
    console.log("33333  ", this.garbage.node.parent.name, node.width, this.getComponent("Canvas"));
    setTimeout(function(){
        var action1 = cc.sequence(cc.moveTo(3, cc.v2(0, -320)),
        cc.callFunc(function(){
            console.log("----------------   ", sp);
            sp.destroy();
        }));
        sp.node.runAction(action1);
    }, 1000);

    var action = cc.sequence(cc.moveTo(3, cc.v2(0, -320)),
                    cc.callFunc(function(){
                        console.log("----------------");
                        self.garbage.destroy();
                    }));
    this.garbage.node.runAction(action);
    this.garbage.node.on(cc.Node.EventType.TOUCH_START, function(event){
        var location = event.getLocation();
        console.log("touch start", location.x, location.y);
        self.garbage.node.runAction(cc.moveTo(0.6, cc.v2(-355, -320)));
    });
    this.garbage.node.on(cc.Node.EventType.TOUCH_MOVE, function(event){
        var moveLocation = event.getLocation();
        console.log("touch move", moveLocation.x, moveLocation.y);
    });
    this.garbage.node.on(cc.Node.EventType.TOUCH_END, function(event){
        var location = event.getLocation();
        
        console.log("touch end");
    });
}

cls.update = function(){

}

cls.onClose = function(){
    console.log(TAG, "onClose");
}

cc.Class(cls);