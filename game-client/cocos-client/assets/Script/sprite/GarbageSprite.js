"use strict";
const TAG = "Garbage.js";

var cls = {};

const leftX = -260;
const rightX = 260;
const downY = -255;
const acceleration = 0.01;

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
            self.node.runAction(cc.moveTo(time, cc.v2(rightX, downY)));
        }else if (moveLocation.x - location.x < -10){
            self.node.runAction(cc.moveTo(time, cc.v2(leftX, downY)));
        }
    });
    this.node.on(cc.Node.EventType.TOUCH_CANCEL, function(event){
        var time = self.getAccrossTime();
        console.log("touch cancel  ", time);
        if (moveLocation.x - location.x > 10){
            self.node.runAction(cc.moveTo(time, cc.v2(rightX, downY)));
        }else if (moveLocation.x - location.x < -10){
            self.node.runAction(cc.moveTo(time, cc.v2(leftX, downY)));
        }
    });
}

cls.onTouchStart = function(){

}

cls.update = function(){
    this.downSpeed = (this.downSpeed*100 + acceleration*100)/100;
    this.node.y = (this.node.y*100 - this.downSpeed*100)/100;
    if (this.node.y <= downY){
        this.node.destroy();
    }
}

cls.getAccrossTime = function(){
    console.log("getAccrosstime  :  ", this.downSpeed, this.node.y)
    return (Math.sqrt(this.downSpeed*this.downSpeed*3600+1.2*(this.node.y-downY)) - this.downSpeed*60)/2;
}

cc.Class(cls);