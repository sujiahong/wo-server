"use strict";
const TAG = "room_manager.js";

var generateMatchRoom = function(self, userId, msg, serverId, next){
    var gamePlay = msg.gamePlay;
    var rule = playConfig.gamePlayToRule[gamePlay];
    rule.baseCoin = msg.baseCoin;
    rule.roomType = constant.ROOM_TYPE.match_room;
    self.createRoom(msg.roomId, userId, serverId, rule, next);
}

class RoomManager{
    constructor(){
        this.roomIdRoomMap = {};
        this.roomIdPrivateRoomMap = {};  //////私密房间表
        this.roomIdPublicRoomMap = {}; ////////公共房间表
    }
    addRoomTable(roomType, room){
        var roomId = room.roomId;
        this.roomIdTypeData[roomId] = roomType;
        if (roomType == constant.ROOM_TYPE.system_room){
            this.publicRooms[roomId] = room;
        }else if (roomType == constant.ROOM_TYPE.match_room){
            this.rooms[roomId] = room;
        }else if (roomType == constant.ROOM_TYPE.public_room){
            this.publicRooms[roomId] = room;
        }else if (roomType == constant.ROOM_TYPE.private_room){
            this.privateRooms[roomId] = room;
        }else{
            console.log(TAG, "不存在的房间类型：", roomType);
        }
    }
    
    getRoomById(roomId, next){
        var roomType = this.roomIdTypeData[roomId];
        if (!roomType){
            return null;
        }
        var room = null;
        if (roomType == constant.ROOM_TYPE.system_room){
            room = this.publicRooms[roomId];
        }else if (roomType == constant.ROOM_TYPE.match_room){
            room = this.rooms[roomId];
        }else if (roomType == constant.ROOM_TYPE.public_room){
            room = this.publicRooms[roomId];
        }else if (roomType == constant.ROOM_TYPE.private_room){
            room = this.privateRooms[roomId];
        }
        return room;
    }
    
    rmvRoomById(roomId){
        var roomType = this.roomIdTypeData[roomId];
        if (!roomType){
            return;
        }
        if (roomType == constant.ROOM_TYPE.match_room){
            delete this.rooms[roomId];
        }else if (roomType == constant.ROOM_TYPE.public_room){
            delete this.publicRooms[roomId];
        }else if (roomType == constant.ROOM_TYPE.private_room){
            delete this.privateRooms[roomId];
        }else if (roomType == constant.ROOM_TYPE.system_room){
            delete this.publicRooms[roomId];
        }
        delete this.roomIdTypeData[roomId];
    }
    
    randRoomExceptLastId(id, coin){
        var roomIdArr = [];
        var rooms = this.rooms;
        for(var roomId in rooms){  
            if (roomId != id && coin == rooms[roomId].baseCoin){
                roomIdArr.push(roomId);
            }
        }
        var len = roomIdArr.length;
        if (len == 0){
            return rooms[id];
        }else{
            var ram = Math.floor(len * Math.random());
            return rooms[roomIdArr[ram]];
        }
    }
    
    ///////remote
    
    createRoom(roomId, userId, serverId, rule, next){
        var self = this;
        var gamePlay = rule.gamePlay;
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
        player.init(userId, serverId, function(ecode){
            player.matchStat = 0;
            player.roomId = "";
            if (ecode == errcode.OK){
                if (rule.GPSActive == 1 && (player.location == "closed" || player.location == "")){
                    return next(null, {code: errcode.GPS_CLOSED});
                }
                var playerCoin = player.coinNum;
                var baseCoin = rule.baseCoin;
                if (rule.roomType == constant.ROOM_TYPE.private_room && playerCoin <= constant.ROOM_LIMIT_RATE[gamePlay]*baseCoin){
                    return next(null, {code: errcode.COIN_NOT_ENOUGH});
                }
                if (baseCoin < 10 && playerCoin > 500){
                    return next(null, {code: errcode.ROOM_COIN_UPLIMIT});
                }
                var room = new playConfig.gamePlayToRoom[gamePlay]();
                room.init(roomId, rule);
                userRecord.updateUserByUserId(userId, {roomId: roomId, gamePlay: gamePlay});
                room.creatorId = userId;
                player.roomId = roomId;
                room.witnessPlayers[userId] = player;
                self.addRoomTable(rule.roomType, room);
                redis.setRoomIdToPlay(roomId, gamePlay);
                gamePusher.pushRoomData(room, userId, serverId, next);
            }else{
                player.clearPlayer();
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
    
    
    createSystemRoom(roomId, rule, next){
        var room = new playConfig.gamePlayToRoom[rule.gamePlay]();
        room.init(roomId, rule);
        room.creatorId = "system";
        this.addRoomTable(rule.roomType, room);
        redis.setRoomIdToPlay(roomId, rule.gamePlay);
        next(null, {code: errcode.OK});
    }
    
    listPublicRoom(next){
        var roomList = [];
        var publicRooms = this.publicRooms;
        for (var roomId in publicRooms){
            var room = publicRooms[roomId];
            var data = {
                roomId: roomId,
                roomLaw: room.roomLaw,
                roomType: room.roomType,
                rulePlay: room.rulePlay,
                baseCoin: room.baseCoin,
                curPersons: room.getPlayerNum(),
                maxPersons: room.uplimitPersons,
                GPSActive: room.GPSActive
            };
            roomList.push(data);
        }
        var rooms = this.rooms;
        for (var roomId in rooms){
            var room = rooms[roomId];
            var curNum = room.getPlayerNum();
            if (curNum > 0){
                var data = {
                    roomId: roomId,
                    roomLaw: room.roomLaw,
                    roomType: room.roomType,
                    rulePlay: room.rulePlay,
                    baseCoin: room.baseCoin,
                    curPersons: curNum,
                    maxPersons: room.uplimitPersons,
                    GPSActive: room.GPSActive
                };
                roomList.push(data);
            }
        }
        next(null, {code: errcode.OK, roomList: roomList});
    }
};

module.exports = RoomManager;