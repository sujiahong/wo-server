"use strict"
const TAG = "game-server/jinhua_service.js";
const errcode = require("../../../share/errcode");

const manager = g_serverData.manager;
var handle = module.exports;

handle.betCoin = function(msg, next){
    var player = manager.getPlayerById(msg.userId);
    if (!player){
        return next({code: errcode.PLAYER_NOT_EXIST});
    }
}

handle.seeCard = function(msg, next){
    var player = manager.getPlayerById(msg.userId);
    if (!player){
        return next({code: errcode.PLAYER_NOT_EXIST});
    }
}

handle.discard = function(msg, next){
    var player = manager.getPlayerById(msg.userId);
    if (!player){
        return next({code: errcode.PLAYER_NOT_EXIST});
    }
}

handle.compareCard = function(msg, next){
    var player = manager.getPlayerById(msg.userId);
    if (!player){
        return next({code: errcode.PLAYER_NOT_EXIST});
    }
}

handle.ready = function(msg, next){
    var player = manager.getPlayerById(msg.userId);
    if (!player){
        return next({code: errcode.PLAYER_NOT_EXIST});
    }
}

handle.seatdown = function(msg, next){
    var player = manager.getPlayerById(msg.userId);
    if (!player){
        return next({code: errcode.PLAYER_NOT_EXIST});
    }
}

handle.transpose = function(msg, next){
    var player = manager.getPlayerById(msg.userId);
    if (!player){
        return next({code: errcode.PLAYER_NOT_EXIST});
    }
}

handle.exitRoom = function(msg, next){
    var player = manager.getPlayerById(msg.userId);
    if (!player){
        return next({code: errcode.PLAYER_NOT_EXIST});
    }
}

handle.reconnect = function(msg, next){
    var player = manager.getPlayerById(msg.userId);
    if (!player){
        return next({code: errcode.PLAYER_NOT_EXIST});
    }
}

handle.chat = function(msg, next){
    var player = manager.getPlayerById(msg.userId);
    if (!player){
        return next({code: errcode.PLAYER_NOT_EXIST});
    }
}