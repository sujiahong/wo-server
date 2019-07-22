"use strict";
const TAG = "Garbage.js";

var cls = {};

cls.extends = cc.Component;
cls.properties = {
    type: 0,
    downSpeed: 0,
};

cls.onLoad = function(){
    let self = this;
    var location;
    var moveLocation;
    this.node.on(cc.Node.EventType.TOUCH_START, function(event){
        location = event.getLocation();
        console.log("touch start", location.x, location.y);
        
    });
    this.node.on(cc.Node.EventType.TOUCH_MOVE, function(event){
        moveLocation = event.getLocation();
        console.log("touch move", moveLocation.x, moveLocation.y, location.x, location.y);
    });
    this.node.on(cc.Node.EventType.TOUCH_END, function(event){
        if (moveLocation.x - location.x > 10){
            self.node.runAction(cc.moveTo(0.6, cc.v2(355, -320)));
        }else if (moveLocation.x - location.x < -10){
            self.node.runAction(cc.moveTo(0.6, cc.v2(-355, -320)));
        }
        console.log("touch end");
    });
    this.node.on(cc.Node.EventType.TOUCH_CANCEL, function(event){
        if (moveLocation.x - location.x > 10){
            self.node.runAction(cc.moveTo(0.6, cc.v2(355, -320)));
        }else if (moveLocation.x - location.x < -10){
            self.node.runAction(cc.moveTo(0.6, cc.v2(-355, -320)));
        }
        console.log("touch cancel");
    });
}

cls.onTouchStart = function(){

}

cc.Class(cls);