"use strict";
const TAG = "ClassificationRoom.js";
const Room = require("./Room");

class ClassificationRoom extends Room{
    constructor(id){
        super(id);
        console.log("ClassificationRoom construct");
    }

    generateGarbage(){
        var type = Math.random()*100%3;
        return type
    }

};

module.exports = ClassificationRoom;