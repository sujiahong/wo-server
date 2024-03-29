"use strict"
const TAG = "game_player.js";

const manager = g_serverData.manager;

class Player{
    constructor(id){
        this.userId = id;
        this.socketId = "";
        this.seatIdx = 0;
        this.roomId = "";

        this.location = "";
        this.nickname = "";
        this.userIcon = "";
        this.sex = 0;
        this.loginIp = "";
        this.bindId = "";
        this.coinNum = 0;
        this.readyStat = 0;
    }
    setRoomId(roomId){
        this.roomId = roomId;
    }
    
    setSeatIdx(idx){
        this.seatIdx = idx;
    }
    
    setReady(stat){
        this.readyStat = stat;
    }

    seatdown(seatIdx, next){
        this.getRoomById(roomId, function(ecode, room){
            if (ecode == errcode.OK){
                var player = room.getWitnessPlayerByUid(userId);
                if (!player){
                    return next(null, {code: errcode.NOT_IN_ROOM_WITNESS});
                }
                var playerCoin = player.coinNum;
                var baseCoin = room.baseCoin;
                if (baseCoin < 10 && playerCoin > 500){
                    return next(null, {code: errcode.ROOM_COIN_UPLIMIT});
                }
                if (playerCoin < constant.ROOM_LIMIT_RATE[room.gamePlay] * baseCoin){
                    return next(null, {code: errcode.COIN_NOT_ENOUGH});
                }
                var eecode = room.selectedSeat(userId, seatIdx);
                if (eecode == errcode.OK){
                    gamePusher.pushSeat(room, userId, next);
                    if(room.isHaveOneReadyAndNoOneDealCard()){
                        room.createTimer(constant.ROOM_TIMEOUT.readyTime, readyTimeoutHandler);
                    }
                    var playerNum = room.getPlayerNum();
                    if (playerNum == 1){
                        room.createWaitTimer(constant.ROOM_TIMEOUT.waitTime, room.waitTimeout);
                    }else if(playerNum > 1){
                        room.clearWaitTimer();
                    }
                }else{
                    next(null, {code: eecode});
                }
            }else{
                next(null, {code: ecode});
            }
        });
    }
    
    ready(next){
        this.getRoomById(roomId, function(ecode, room){
            if (ecode == errcode.OK){
                var gamePlay = room.gamePlay;
                var player = room.getPlayerByUId(userId);
                if (!player){
                    return next(null, {code: errcode.NOT_IN_ROOM_SEAT});
                }
                if (player.readyStat == 1){
                    return next(null, {code: errcode.PLAYER_HAVE_READYED});
                }
                if (player.coinNum < constant.ROOM_LIMIT_RATE[gamePlay] * room.baseCoin){
                    return next(null, {code: errcode.COIN_NOT_ENOUGH});
                }
                if (room.isDealCard()){
                    return next(null, {code: errcode.ROOM_HAVE_DEALED});
                }
                player.setReady(1);
                var playerNum = room.getPlayerNum();
                console.log(TAG, "111111111111111111", room.isAllReady(), playerNum);
                if (gamePlay == constant.GAME_PLAY.dou_di_zhu){
                    if (playerNum < 3){
                        return gamePusher.pushReady(room, userId, next);
                    }
                }else{
                    if (playerNum < 2){
                        return gamePusher.pushReady(room, userId, next);
                    }
                }
                if (room.isAllReady()){
                    room.clearTimer();
                    room.startGame();
                    gamePusher.pushReady(room, userId, function(){
                        gamePusher.pushHandCard(room, next);
                        room.createTimer(constant.PLAY_ROUND_TIMEOUT[gamePlay], room.roundTimeout);
                    });
                }else{
                    gamePusher.pushReady(room, userId, next);
                    room.createTimer(constant.ROOM_TIMEOUT.readyTime, readyTimeoutHandler);
                }        
            }else{
                next(null, {code: ecode});
            }
        });
    }
    
    tradeSeat(next){
        var self = this;
        this.getRoomById(roomId, function(ecode, room){
            if (ecode == errcode.OK){
                var player = room.getPlayerByUId(userId);
                if (!player){
                    return next(null, {code: errcode.NOT_IN_ROOM_SEAT});
                }
                if (player.cardInHand.length > 0){
                    return next(null, {code: errcode.ROOM_HAVE_DEALED});
                }
                var seatIdx = room.getVacantSeatIdx();
                player.seatIdx = seatIdx;
                gamePusher.pushSeat(room, userId, next);
            }else{
                next(null, {code: ecode});
            }
        });
    }
    
    transpose(next){
        var self = this;
        this.getRoomById(roomId, function(ecode, room){
            if (ecode == errcode.OK){
                var isInSeat = true;
                var player = room.getPlayerByUId(userId);
                if (!player){
                    isInSeat = false;
                    player = room.getWitnessPlayerByUid(userId);
                }
                if (!player){
                    return next(null, {code: errcode.NOT_IN_ROOM_SEAT});
                }
                if (isInSeat && player.cardInHand.length > 0){
                    return next(null, {code: errcode.ROOM_HAVE_DEALED});
                }
                console.log(TAG, userId, "2222transpose22", roomId, isInSeat, room.isAllReady());
                var serverId = player.frontServerId;
                var randomRoom = self.randRoomExceptLastId(roomId, room.baseCoin);
                var randRoomId = randomRoom.roomId;
                if (randRoomId != roomId){
                    var eecode = room.leaveRoom(userId);
                    if (eecode == errcode.OK){
                        userRecord.updateUserByUserId(userId, {roomId: randRoomId});
                        destroyElseStart(self, room, isInSeat, room.getPlayerNum());
                        randomRoom.witnessPlayers[userId] = player;
                        player.roomId = randRoomId;
                        gamePusher.pushTranspose(randomRoom, room, userId, serverId, next);
                    }else{
                        next(null, {code: eecode});
                    }
                }else{
                    next(null, {code: errcode.OK});
                }
            }else{
                next(null, {code: ecode});
            }
        });
    }
    
    exitRoom(next){
        var self = this;
        this.getRoomById(roomId, function(ecode, room){
            if (ecode == errcode.OK){
                var isInSeat = true;
                var player = room.getPlayerByUId(userId);
                if (!player){
                    isInSeat = false;
                    player = room.getWitnessPlayerByUid(userId);
                }
                if (!player){
                    return next(null, {code: errcode.NOT_IN_ROOM_SEAT});
                }
                console.log(TAG, userId, "33333exitRoom3333", roomId, isInSeat, room.isAllReady());
                if (isInSeat && player.cardInHand.length > 0){
                    return next(null, {code: errcode.ROOM_HAVE_DEALED});
                }
                var serverId = player.frontServerId;
                var eecode = room.leaveRoom(userId);
                if (eecode == errcode.OK){
                    userRecord.updateUserByUserId(userId, {roomId: "", gamePlay: constant.GAME_PLAY.none, coinNum: player.coinNum});
                    destroyElseStart(self, room, isInSeat, room.getPlayerNum());
                    gamePusher.pushGameCoin(userId, serverId, player.coinNum, function(){
                        gamePusher.pushExit(room, userId, serverId, next);
                    });
                }else{
                    next(null, {code: eecode});
                }
            }else{
                next(null, {code: ecode});
            }
        });
    }
    
    reconnect(serverId, next){
        var self = this;
        this.getRoomById(roomId, function(ecode, room){
            if (ecode == errcode.OK){
                var player = self.gamePlayers[userId];
                if (player){
                    player.refresh(userId, serverId, function(eecode){
                        if (eecode != errcode.OK){
                            return next(null, {code: eecode});
                        }
                        next(null, {code: errcode.OK, roomData: room.getClientRoomData(userId)});
                    });
                }else{
                    userRecord.updateUserByUserId(userId, {roomId: "", gamePlay: constant.GAME_PLAY.none});
                    next(null, {code: errcode.CAN_NOT_FIND_PLAYER});
                }
            }else{
                userRecord.updateUserByUserId(userId, {roomId: "", gamePlay: constant.GAME_PLAY.none});
                next(null, {code: ecode});
            }
        });
    }
    
    chat(msg, next){
        this.getRoomById(roomId, function(ecode, data){
            if (ecode == errcode.OK){
                gamePusher.pushChat(data, userId, msg, next);
            }else{
                next(null, {code: ecode});
            }
        });
    }

    modifyCard(roomId, userId, cards, next){
        this.getRoomById(roomId, function(ecode, data){
            if (ecode == errcode.OK){
                var room = data;
                room.preSetCard(userId, cards);
                next(null, {code: ecode});
            }else{
                next(null, {code: ecode});
            }
        });
    }

    joinRoom(roomId, gamePlay, userId, serverId, next){
        var self = this;
        var player = self.gamePlayers[userId];
        if (!player){
            player = new playConfig.gamePlayToPlayer[gamePlay]();
            self.gamePlayers[userId] = player;
        }
        if (player.roomId  != ""){
            player.matchStat = 0;
            return next(null, {code: errcode.HAVE_IN_ROOM});
        }
        player.roomId = roomId;
        this.getRoomById(roomId, function(ecode, room){
            if (ecode != errcode.OK){
                player.clearPlayer();
                return next(null, {code: ecode});
            }
            console.log(userId, serverId, room.roomId, "joinRoom @@@@@@@@@@@@@", player.roomId, room.isInRoom(userId));
            if (room.isInRoom(userId)){
                room.leaveRoom(userId);
                return next(null, {code: errcode.HAVE_IN_ROOM});
            }
            player.init(userId, serverId, function(eecode){
                player.matchStat = 0;
                player.roomId = "";
                if (eecode == errcode.OK){
                    if (room.GPSActive == 1 && (player.location == "closed" || player.location == "")){
                        return next(null, {code: errcode.GPS_CLOSED});
                    }
                    if (room.midJoinStat == 0 && room.curRunCount > 0){
                        return next(null, {code: errcode.ROOM_NOT_MID_JOIN});
                    }
                    if (room.baseCoin < 10 && player.coinNum > 500){
                        return next(null, {code: errcode.ROOM_COIN_UPLIMIT});
                    }
                    userRecord.updateUserByUserId(userId, {roomId: roomId, gamePlay: gamePlay});
                    room.witnessPlayers[userId] = player;
                    player.roomId = roomId;
                    gamePusher.pushRoomData(room, userId, serverId, ()=>{});
                    gamePusher.pushJoinRoom(room, userId, next);
                }else{
                    player.clearPlayer();
                    next(null, {code: eecode});
                }
            });
        });
    }
    
    matchRoom(userId, msg, serverId, next){
        var player = this.gamePlayers[userId];
        if (!player){
            player = new playConfig.gamePlayToPlayer[msg.gamePlay]();
            this.gamePlayers[userId] = player;
        }
        if (player.matchStat == 1){
            return next(null, {code: errcode.PALYER_MATCHING});
        }
        player.matchStat = 1;
        var roomArr = [];
        var matchRooms = this.rooms;
        for (var roomId in matchRooms){
            var room = matchRooms[roomId];
            if (msg.baseCoin == room.baseCoin){
                roomArr.push(room);
            }
        }
        var len = roomArr.length;
        var idx = Math.floor(len * Math.random());
        console.log("roomlen :", len, "idx: ", idx)
        var i = idx;
        var room = roomArr[i];
        if (room){
            if (room.getPlayerNum() < room.uplimitPersons){
                console.log("111111111  ", room.roomId)
                return this.joinRoom(room.roomId, msg.gamePlay, userId, serverId, next);
            }else{
                i = (i + 1)%len;
            }
            while(i != idx){
                if (room.getPlayerNum() < room.uplimitPersons){
                    console.log("2222222222  ", room.roomId)
                    return this.joinRoom(room.roomId, msg.gamePlay, userId, serverId, next);
                }
                i = (i + 1)%len;
            }
            console.log("33333333  ", room.roomId)
            generateMatchRoom(this, userId, msg, serverId, next);
        }else{
            console.log("444444444  ", msg.roomId)
            generateMatchRoom(this, userId, msg, serverId, next);
        }
    }

    playerOnline(roomId, userId, serverId, next){
        var self = this;
        self.getRoomById(roomId, function(ecode, data){
            if (ecode == errcode.OK){
                var room = data;
                var player = self.gamePlayers[userId];
                console.log(TAG, "playerOnline  online ", roomId, userId);
                if (!player){
                    player = room.getPlayerByUId(userId);
                    self.gamePlayers[userId] = player;
                }
                if (!player){
                    player = room.getWitnessPlayerByUid(userId);
                    self.gamePlayers[userId] = player;
                }
                if (player){
                    player.frontServerId = serverId;
                    gamePusher.pushLineStat(room, userId, 1, next);
                }else{
                    next(null, {code: ecode});
                }
            }else{
                next(null, {code: ecode});
            }
        });
    }
    
    playerOffline(roomId, userId, next){
        var self = this;
        self.getRoomById(roomId, function(ecode, data){
            if (ecode == errcode.OK){
                var room = data;
                var player = self.gamePlayers[userId];
                console.log(TAG, "playerOffline  offline ", roomId, userId);
                if (!player){
                    player = room.getPlayerByUId(userId);
                    self.gamePlayers[userId] = player;
                }
                if (!player){
                    player = room.getWitnessPlayerByUid(userId);
                    self.gamePlayers[userId] = player;
                }
                if (player){
                    userRecord.updateUserByUserId(userId, {coinNum: player.coinNum});
                    player.frontServerId = "";
                    gamePusher.pushLineStat(room, userId, 0, next);
                }else{
                    next(null, {code: ecode});
                }
            }else{
                next(null, {code: ecode});
            }
        });
    }
    
    payGameCoin(roomId, orderData, next){
        var self = this;
        this.getRoomById(roomId, (ecode, room)=>{
            if (ecode == errcode.OK){
                var userId = orderData.userId;
                var player = self.gamePlayers[userId];
                if (!player){
                    player = room.getPlayerByUId(userId);
                    self.gamePlayers[userId] = player;
                }
                if (!player){
                    player = room.getWitnessPlayerByUid(userId);
                    self.gamePlayers[userId] = player;
                }
                if (!player){
                    return next(null, {code: errcode.NOT_IN_ROOM});
                }
                player.coinNum += orderData.coinNum;
                userRecord.updateUserByUserId(userId, {coinNum: player.coinNum}, ()=>{
                    for (var uid in room.players){
                        if (uid != userId){
                            gamePusher.pushGameCoin(uid, room.players[uid].frontServerId, {userId: userId, coinNum: player.coinNum}, ()=>{});
                        }
                    }
                    gamePusher.pushGameCoin(userId, player.frontServerId, player.coinNum, ()=>{
                        var ret = 1;
                        if (orderData.promoterId){
                            ret = 2;
                        }
                        gamePusher.pushRechargeResult(userId, player.frontServerId, ret, next);
                    });
                });
            }else{
                next(null, {code: ecode});
            }
        });
    }
    
    rechargeCoin(roomId, userId, next){
        this.getRoomById(roomId, (ecode, room)=>{
            if (ecode == errcode.OK){
                room.refreshTimer(60000);
                next(null, {code: errcode.OK});
            }else{
                next(null, {code: ecode});
            }
        });
    }
};

var readyTimeoutHandler = function(room){
    var kickedArr = room.noReadyPlayer();
    for (let i = 0; i < kickedArr.length; ++i){
        let uid = kickedArr[i];
        let player = room.getPlayerByUId(uid);
        let serverId = player.frontServerId;
        gamePusher.pushGameCoin(uid, serverId, player.coinNum, ()=>{});
        gamePusher.pushExit(room, uid, serverId, ()=>{});
        room.leaveRoom(uid);
        userRecord.updateUserByUserId(uid, {roomId: "", gamePlay: constant.GAME_PLAY.none, coinNum: player.coinNum});
    }
    if (room.gamePlay != constant.GAME_PLAY.dou_di_zhu && room.gamePlay != constant.GAME_PLAY.pao_de_kuai){
        var playerNum = room.getPlayerNum();
        console.log(playerNum, "11111111readyTimeoutHandler1111111111", room.isAllReady())
        if (playerNum > 1 && room.isAllReady() && !room.isDealCard()){
            room.startGame();
            gamePusher.pushHandCard(room, function(){
                room.createTimer(constant.PLAY_ROUND_TIMEOUT[room.gamePlay], room.roundTimeout);
            });
        }
    }
}

var destroyElseStart = function(self, room, isInSeat, playerNum){
    if (playerNum == 0){
        var roomId = room.roomId;
        if ((room.roomType == constant.ROOM_TYPE.private_room || 
            room.roomType == constant.ROOM_TYPE.public_room)){
            self.rmvRoomById(roomId);
            redis.delRoomIdToPlay(roomId);
            for (let uid in room.witnessPlayers){
                var wPlayer = room.witnessPlayers[uid];
                gamePusher.pushDestroy(uid, wPlayer.frontServerId, function(){
                    userRecord.updateUserByUserId(uid, {roomId: "", gamePlay: constant.GAME_PLAY.none});
                });
                room.leaveRoom(uid);
            }
        }
        room.clearWaitTimer();
    }else{
        console.log(TAG, "exit eixt exit", isInSeat, playerNum, room.isAllReady());
        if (isInSeat && playerNum > 1 && room.isAllReady() && !room.isDealCard()){////两个人并且已经都准备了
            if (room.gamePlay != constant.GAME_PLAY.dou_di_zhu){
                room.clearTimer();
                room.startGame();
                gamePusher.pushHandCard(room, ()=>{
                    room.createTimer(constant.PLAY_ROUND_TIMEOUT[room.gamePlay], room.roundTimeout);
                });
            }
        }else{
            if (playerNum == 1){
                room.clearTimer();
                if (isInSeat){
                    room.createWaitTimer(constant.ROOM_TIMEOUT.waitTime, room.waitTimeout);
                }
            }
        }
    }
}

module.exports = Player;