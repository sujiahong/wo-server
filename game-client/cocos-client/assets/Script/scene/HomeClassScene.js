"use strict";
const TAG = "HomeClassScene.js";

if (!cc.g_ada){
    cc.g_ada = {};
}
const g_ada = cc.g_ada;
const ClassificationRoom = require("../model/garbage/ClassificationRoom");
const constant = require("../share/constant");
const config = require("../model/garbage/GarbageConfig");

var cls = {};

cls.extends = cc.Component;
cls.properties = {

};

cls.onLoad = function(){
    
}

cc.Class(cls);