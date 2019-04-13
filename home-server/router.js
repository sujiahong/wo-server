"use strict"
const TAG = "router.js";
const express = require("express");
const router = express.Router();
const errcode = require("../share/errcode");
const mainService = require("./service/main_service");
const roomService = require("./service/room_service");
const redis = require("../dao/redis/redis_common");
const logger = g_serverData.logger;

module.exports = router;

router.get("/", (req, res)=>{
    res.send({code: errcode.ROUTE_ERR});
});

router.get("/login", function(req, res){
    var query = req.query;
    var ip = res.socket.remoteAddress;
    if (ip.substr(0, 7) == "::ffff:") {
		ip = ip.substr(7);
    }
    query.ip = ip;
    logger.info(TAG, "用户登录！！！", query);
    var recommendation = query.recommendation;
    var recommendationAccountMap = g_serverData.homeManager.recommendationAccountMap;
    if (recommendationAccountMap[recommendation] != query.account){
        redis.getRecommendation(recommendation, function(ret){
            if (ret.account){
                recommendationAccountMap[recommendation] = ret.account;
                mainService.login(query, function(ret){
                    res.send(ret);
                });
            }else{
                return res.send({code: errcode.RECOMMENDATION_NOT_EXIST});
            }
        });
    }else{
        mainService.login(query, function(ret){
            res.send(ret);
        });
    }
});

router.get("/logout", function(req, res){
    var userId = req.query.userId;
    var user = g_serverData.homeManager.getUserById(userId);
    if (!user){
        return res.send({code: errcode.LOGIN_INVALID});
    }
    mainService.logout(userId, function(ret){
        res.send(ret);
    });
});

router.get("/luckTest", function(req, res){
    var userId = req.query.userId;
    var user = g_serverData.homeManager.getUserById(userId);
    if (!user){
        return res.send({code: errcode.LOGIN_INVALID});
    }
    mainService.luckTest(user, function(ret){
        res.send(ret);
    });
});

router.get("/signIn", function(req, res){
    var userId = req.query.userId;
    var user = g_serverData.homeManager.getUserById(userId);
    if (!user){
        return res.send({code: errcode.LOGIN_INVALID});
    }
    mainService.signIn(user, function(ret){
        res.send(ret);
    });
});

router.get("/acquireSignData", function(req, res){
    var userId = req.query.userId;
    var user = g_serverData.homeManager.getUserById(userId);
    if (!user){
        return res.send({code: errcode.LOGIN_INVALID});
    }
    mainService.acquireSignData(user, function(ret){
        res.send(ret);
    });
});

router.get("/shareSignInSuccess", function(req, res){
    var userId = req.query.userId;
    var user = g_serverData.homeManager.getUserById(userId);
    if (!user){
        return res.send({code: errcode.LOGIN_INVALID});
    }
    mainService.shareSignInSuccess(user, req.query.coin, function(ret){
        res.send(ret);
    });
});


///////////////////////////game//////////////////////////////

router.get("/createRoom", function(req, res){
    var userId = req.query.userId;
    var user = g_serverData.homeManager.getUserById(userId);
    if (!user){
        return res.send({code: errcode.LOGIN_INVALID});
    }
    roomService.createRoom(user, req.query.roomInfo, function(ret){
        res.send(ret);
    });
});

router.get("/joinRoom", function(req, res){
    var userId = req.query.userId;
    var user = g_serverData.homeManager.getUserById(userId);
    if (!user){
        return res.send({code: errcode.LOGIN_INVALID});
    }
    roomService.joinRoom(user, req.query.roomId, function(ret){
        res.send(ret);
    });
});