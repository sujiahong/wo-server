"use strict";
const TAG = "Garbage.js";

var cls = {};

const leftX = -255;
const rightX = 250;
const downY = -250;

cls.extends = cc.Component;
cls.properties = {
    keyid: 0,
    type: 0,
    downSpeed: 0,
    acrossSpeed: 0,
};

cls.onLoad = function(){
    this.downSpeed = 5;
    let self = this;
    var location;
    var moveLocation;
    this.node.on(cc.Node.EventType.TOUCH_START, function(event){
        location = event.getLocation();
        console.log("touch start", location.x, location.y);
        
    });
    this.node.on(cc.Node.EventType.TOUCH_MOVE, function(event){
        moveLocation = event.getLocation();
        // console.log("touch move", moveLocation.x, moveLocation.y, location.x, location.y);
    });
    this.node.on(cc.Node.EventType.TOUCH_END, function(event){
        var time = self.getAccrossTime();
        console.log("touch end  ", time);
        if (moveLocation.x - location.x > 10){
            self.node.runAction(cc.moveTo(0.6, cc.v2(250, -250)));
        }else if (moveLocation.x - location.x < -10){
            self.node.runAction(cc.moveTo(0.6, cc.v2(-255, -250)));
        }
    });
    this.node.on(cc.Node.EventType.TOUCH_CANCEL, function(event){
        var time = self.getAccrossTime();
        console.log("touch cancel  ", time);
        if (moveLocation.x - location.x > 10){
            self.node.runAction(cc.moveTo(0.6, cc.v2(250, -250)));
        }else if (moveLocation.x - location.x < -10){
            self.node.runAction(cc.moveTo(0.6, cc.v2(-255, -250)));
        }
    });
}

cls.onTouchStart = function(){

}

cls.update = function(){
    this.downSpeed += 0.01;
    this.node.y -= this.downSpeed;
    if (this.node.y <= -250){
        this.node.destroy();
    }
}

cls.getAccrossTime = function(){
    console.log("getAccrosstime  ", this.downSpeed, this.node.y)
    return (Math.sqrt(this.downSpeed*this.downSpeed+2*0.6*(this.node.y+250)) - this.downSpeed)/0.6;
}

cc.Class(cls);