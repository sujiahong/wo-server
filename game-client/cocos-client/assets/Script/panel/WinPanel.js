"use strict";
const TAG = "WinPanel.js";

var cls = {};

cls.extends = cc.Component;

cls.properties = {
    cpLabel: cc.Label,
    garbageScroll: cc.ScrollView,
    cpProgress: cc.ProgressBar,
    homeButton: cc.Button,
    nextButton: cc.Button,
};

cls.onLoad = function(){
    console.log(TAG, "onLoad onLoad");
    this.homeButton.node.on("click", this.onHome, this);
    this.nextButton.node.on("click", this.onNext, this);
}

cls.onHome = function(){
    this.node.active = false;
    cc.director.loadScene("HomeClassScene");
}

cls.onNext = function(){

}

cc.Class(cls);