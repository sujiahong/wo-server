"use_strict";
const TAG = "jinhua_player.js";
const errcode = require("../../../share/errcode");
const Player = require("../base/player");

class JinHuaPlayer extends Player{
    constructor(){
        super();
        this.seeCardStat = 0;
        this.discardStat = 0;    //弃牌状态
        this.totalCoin = 0;      //本局金币
        this.betCoinData = {};
        this.cardInHand = [];    //手里的牌
        this.coinArr = [];
        this.handData = null;
    }
};
var player = JinHuaPlayer.prototype;

player.setHandCard = function(handCard){
    this.cardInHand = handCard;
}

player.setDiscardStat = function(stat){
    this.discardStat = stat;
}

player.setSeeCardStat = function(stat){
    this.seeCardStat = stat;
}

player.setBetData = function(coin, operation){
    if (coin > 0){
        this.totalCoin += coin;
        this.coinNum -= coin;
        this.coinArr.push(coin);
    }
    this.betCoinData = {coin, operation};
}

player.clearOneRunPlayer = function(){
    var player = this;
    player.readyStat = 0;
    player.discardStat = 0;
    player.seeCardStat = 0;
    player.cardInHand = [];
    player.betCoinData = {};
    player.totalCoin = 0;
    player.coinArr = [];
    player.handData = null;
}

player.getClientPlayerData = function(){
    var curPlayer = this;
    return {
        userId: curPlayer.userId,
        seatIdx: curPlayer.seatIdx,
        sex: curPlayer.sex,
        location: curPlayer.location,
        userNo: curPlayer.userNo,
        nickname: curPlayer.nickname,
        loginIp: curPlayer.loginIp,
        userIcon: curPlayer.userIcon,
        clientPlat: curPlayer.clientPlat,
        coinNum: curPlayer.coinNum,
        readyStat: curPlayer.readyStat,
        seeStat: curPlayer.seeCardStat,
        discardStat: curPlayer.discardStat,
        totalCoin: curPlayer.totalCoin,
        betCoinData: curPlayer.betCoinData,
        cardInHand: curPlayer.cardInHand
    };
}

mgr.betCoin = function(roomId, userId, msg, next){
    var coin = msg.coin;
    var operation = msg.operation;
    var compareId = msg.compareId;
    this.getRoomById(roomId, function(ecode, room){
        if (ecode != errcode.OK){
            return next(null, {code: ecode});
        }
        var player = room.getPlayerByUId(userId);
        if (!player){
            return next(null, {code: errcode.NOT_IN_JIN_ROOM_SEAT});
        }
        if(player.cardInHand.length == 0){
            return next(null, {code: errcode.ZJH_PLAYER_NOT_HAVE_CARD});
        }
        if (coin > player.coinNum){
            return next(null, {code: errcode.COIN_NOT_ENOUGH});
        }
        if (userId != room.operateId){
            return next(null, {code: errcode.NOT_YOUR_OPERATION});
        }
        var roundCount = room.roundCount;
        if (compareId){
            if(compareId == userId){
                return next(null, {code: errcode.NOT_COMPARE_MYSELF});
            }
            var comparedPlayer = room.getPlayerByUId(compareId);
            if (!comparedPlayer){
                return next(null, {code: errcode.NOT_IN_JIN_ROOM_SEAT});
            }
            if (comparedPlayer.discardStat == 1){
                return next(null, {code: errcode.ZJH_ROOM_HAVE_DISCARDED});
            }
            room.clearTimer();
            player.setBetData(coin, operation);
            room.totalCoin += coin;
            room.curBetData = {coin, operation, compareId};
            var winnerId = userId;
            if (room.compareCard(player, comparedPlayer) < 0){
                winnerId = compareId;
                player.setDiscardStat(2);
            }else{
                comparedPlayer.setDiscardStat(2);
            }
            var compareData = {userId: userId, comparedId: compareId};
            room.compareCardList.push(compareData);
            pusher.pushCompareCard(room, winnerId, compareData, ()=>{});
            room.recordPlayerOperation({userId, coin, operation, compareId, winnerId, roundCount});
            room.nextOpPlayerId(userId);
            if (winnerId == userId){
                if (compareId == room.firstId){
                    room.firstId = room.nextNoDiscardPlayerId(compareId);
                }
            }else{
                if (userId == room.firstId){
                    room.firstId = room.operateId;
                }
            }
            var underwayArr = room.getUnderwayPlayerArr();
            if (underwayArr.length > 1){
                pusher.pushBetCoin(room, userId, msg, next);
                room.createTimer(constant.ROOM_TIMEOUT.betTime, room.roundTimeout);
            }else{
                pusher.pushBetCoin(room, userId, msg, ()=>{});
                var ret = room.startScore(underwayArr[0]);
                saveRunEndData(room, ret, ()=>{
                    room.clearRun();
                });
                pusher.pushResult(room, ret, next);
            }
        }else{
            room.clearTimer();
            player.setBetData(coin, operation);
            room.totalCoin += coin;
            room.curBetData = {coin, operation};;
            room.recordPlayerOperation({userId, coin, operation, roundCount});
            room.nextOpPlayerId(userId);
            if (room.roundCount == constant.JIN_MAX_ROUND){
                pusher.pushBetCoin(room, userId, msg, ()=>{
                    var compareId1 = room.firstId;
                    var compareId2 = room.nextNoDiscardPlayerId(compareId1);
                    console.log(compareId1, compareId2)
                    var winner = compareTwo(room, compareId1, compareId2);
                    var ret = room.startScore(winner);
                    saveRunEndData(room, ret, ()=>{
                        room.clearRun();
                    });
                    pusher.pushResult(room, ret, next);
                });
            }else{
                pusher.pushBetCoin(room, userId, msg, next);
                room.createTimer(constant.ROOM_TIMEOUT.betTime, room.roundTimeout);
            }
        }
    });
}

var compareTwo = function(room, compareId1, compareId2){
    console.log("compareTwo  ", compareId1, compareId2)
    if (compareId1 != compareId2){
        var comparePlayer1 = room.getPlayerByUId(compareId1);
        var comparePlayer2 = room.getPlayerByUId(compareId2);
        var compareData = {userId: compareId1, comparedId: compareId2};
        room.compareCardList.push(compareData);
        pusher.pushCompareCard(room, "", compareData, ()=>{});
        if (room.compareCard(comparePlayer1, comparePlayer2) < 0){
            comparePlayer1.setDiscardStat(2);
            compareId1 = compareId2;
            compareId2 = room.nextNoDiscardPlayerId(compareId1);
        }else{
            comparePlayer2.setDiscardStat(2);
            compareId2 = room.nextNoDiscardPlayerId(compareId2);
        }
        return compareTwo(room, compareId1, compareId2);
    }else{
        return room.getPlayerByUId(compareId1);
    }
}

mgr.discard = function(roomId, userId, next){
    this.getRoomById(roomId, function(ecode, room){
        if (ecode != errcode.OK){
            return next(null, {code: ecode});
        }
        var player = room.getPlayerByUId(userId);
        if (!player){
            return next(null, {code: errcode.NOT_IN_KENG_ROOM_SEAT});
        }
        if (player.discardStat == 1){
            return next(null, {code: errcode.ZJH_ROOM_HAVE_DISCARDED});
        }
        if(player.cardInHand.length == 0){
            return next(null, {code: errcode.ZJH_PLAYER_NOT_HAVE_CARD});
        }
        if (userId != room.operateId){
            return next(null, {code: errcode.NOT_YOUR_OPERATION});
        }
        room.clearTimer();
        player.setDiscardStat(1);
        player.setBetData(-1, -1);
        room.recordPlayerOperation({userId: userId, coin: -1, operation: -1, roundCount: room.roundCount});
        var underwayArr = room.getUnderwayPlayerArr();
        if (underwayArr.length > 1){
            room.nextOpPlayerId(userId);           
            if (userId == room.firstId){
                room.firstId = room.operateId;
            }
            pusher.pushDiscard(room, userId, next);
            room.createTimer(constant.ROOM_TIMEOUT.betTime, room.roundTimeout);
        }else{
            pusher.pushDiscard(room, userId, ()=>{});
            var ret = room.startScore(underwayArr[0]);
            saveRunEndData(room, ret, ()=>{
                room.clearRun();
            });
            pusher.pushResult(room, ret, next);
        }
    });
}

mgr.seeCard = function(roomId, userId, next){
    this.getRoomById(roomId, function(ecode, room){
        if (ecode != errcode.OK){
            return next(null, {code: ecode});
        }
        var player = room.getPlayerByUId(userId);
        if (!player){
            return next(null, {code: errcode.NOT_IN_JIN_ROOM_SEAT});
        }
        if (player.seeCardStat == 1){
            return next(null, {code: errcode.PLAYER_IS_LOOKED});
        }
        if(player.cardInHand.length == 0){
            return next(null, {code: errcode.ZJH_PLAYER_NOT_HAVE_CARD});
        }
        player.setSeeCardStat(1);
        room.recordPlayerOperation({userId});
        pusher.pushSeeCard(room, userId, next);
    });
}

var saveRunEndData = function(room, ret, next){
    var _save = function(){
        saveMongoCombatGain(room, ret, function(err, combatRecord){
            if (err){
                console.warn(TAG, "saveRunEndData 保存战绩mongo出错, 3妙后再试一次！！", err);
                return setTimeout(_save, 3000);
            }
            var rebateData = {};
            var players = room.players;
            for (let uid in players){
                var player = players[uid];
                if (player.readyStat == 1 && player.cardInHand.length > 0){
                    room.saveRedisCombatGain(uid, combatRecord);
                    var param = {
                        userId: uid,
                        userNo: player.userNo,
                        nickname: player.nickname,
                        coinNum: player.coinNum,
                        roomId: room.roomId,
                        gamePlay: constant.GAME_PLAY.zha_jin_hua,
                        roomFee: room.baseCoin*(constant.ROOM_FEE_RATE[room.baseCoin] || constant.JIN_RATE),
                        upPromoterId: player.bindId,
                        upUserNo: player.bindUserNo
                    };
                    rebateData[uid] = JSON.stringify(param);
                }
            }
            console.log(TAG, "saveRunEndData  rebateData:", rebateData);
            httpUtil.rebateRoomFeeToPromoter(rebateData);
            next ? next() : null;
        });
    }
    _save();
}

var saveMongoCombatGain = function(room, scoreRet, next){
    util.generateUniqueId(8, jinRedis.isExistViewId, function(viewId){
        var param = {
            roomId: room.roomId,
            roomType: room.roomType,
            roomLaw: room.roomLaw,
            baseCoin: room.baseCoin,
            totalCoin: room.totalCoin,
            startStamp: room.startStamp,
            endStamp: room.endStamp,
            viewCodeId: viewId,
            uplimitPersons: room.uplimitPersons,
            rulePlay: room.rulePlay,
            operationArray: room.operationDataArr,
            roundCount: room.roundCount,
            dealerId: room.dealerId,
            players: []
        };
        var players = room.players;
        for (var uid in players){
            var player = players[uid];
            if (player.readyStat == 1 && player.cardInHand.length > 0){
                var resData = {
                    userId: uid,
                    userNo: player.userNo,
                    seatIdx: player.seatIdx,
                    nickname: player.nickname,
                    userIcon: player.userIcon,
                    remainderCoin: player.coinNum,
                    coinIncr: 0
                };
                var consumeCoin = 0;
                var scoreData = scoreRet[uid];
                if (scoreData.win > 0){
                    resData.coinIncr = room.totalCoin - player.totalCoin;
                }else{
                    resData.coinIncr = -player.totalCoin
                    consumeCoin = player.totalCoin;
                }
                var record = {
                    userId: uid,
                    nickname: player.nickname,
                    roomId: room.roomId,
                    roomType: room.roomType,
                    roomLaw: room.roomLaw,
                    gamePlay: constant.GAME_PLAY.zha_jin_hua,
                    coinNum: consumeCoin,
                    roomFee: room.baseCoin * (constant.ROOM_FEE_RATE[room.baseCoin] || constant.JIN_RATE),
                }
                expendRecord.addRecord(record);
                param.players.push(resData);
            }
        }
        combatRecord.addRecord(param, function(err, record){
            if (err){
                return next(err);
            }
            jinRedis.setViewIdCombatId(viewId, record.id.toString());
            next(null, record);
        });
    });
}