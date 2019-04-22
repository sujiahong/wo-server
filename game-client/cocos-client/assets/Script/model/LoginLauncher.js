"use strict";
const TAG = "LoginLauncher.js";
const request = require("../util/http_request");
const constant = require("../share/constant");
const errcode = require("../share/errcode");
const GameUser = require("./GameUser");


class LoginLauncher{
    constructor(){
        this.account = "";
        this.cliType = constant.CLI_TYPE.app;
        this.accountType = constant.ACCOUNT_TYPE.tel;
        this.address = "";
        this.recommendation = "";
        var addressData = cc.sys.localStorage.getItem(constant.LOCAL_ITEM.address_data);
        if (addressData){
            addressData = JSON.parse(addressData);
            this.address = addressData.address;
            this.recommendation = addressData.recommendation;
        }
    }

    setAccount(account){
        this.account = account;
    }
    getAccount(){
        return this.account;
    }
    setAccountType(accountType){
        this.accountType = accountType;
    }

    requestGate(next){
        var self = this;
        var accountData = {};
        if (this.accountType == constant.ACCOUNT_TYPE.wx){
            accountData.code = "";
            accountData.clientId = constant.CLIENT_ID;
        }else if (this.accountType == constant.ACCOUNT_TYPE.tel){
            accountData.account = this.account;
        }else if(this.accountType == constant.ACCOUNT_TYPE.wb){

        }else if(this.accountType == constant.ACCOUNT_TYPE.mail){
            accountData.account = this.account;
        }else{
            return next(errcode.UNKNOW_ACCOUNT_TYPE);
        }
        accountData = JSON.stringify(accountData);
        request.get({
            url: constant.GATE_URL,
            accountType: this.accountType,
            accountData: encodeURIComponent(accountData)
        }, function(code, ret){
            console.log(TAG, "requestGate: ", code, JSON.stringify(ret));
            if (code != errcode.OK)
                return next(code);
            if (ret.code != errcode.OK)
                return next(ret.code);
            self.recommendation = ret.recommendation;
            self.address = "http://"+ret.ip + ":"+ret.port;
            cc.sys.localStorage.setItem(constant.LOCAL_ITEM.address_data, 
                JSON.stringify({recommendation: self.recommendation, address: self.address}));
            self.account = ret.account;
            self.requestLogin(next);
        });
    }

    requestLogin(next){
        var self = this;
        var accountData = {nickName: "", gender: 0, avatarUrl: ""};
        accountData = JSON.stringify(accountData);
        request.get({
            url: this.address+"/login",
            account: this.account,
            cliType: this.cliType,
            accountType: this.accountType,
            clientId: constant.CLIENT_ID,
            recommendation: this.recommendation,
            accountData: encodeURIComponent(accountData)
        }, function(code, ret){
            console.log(TAG, "requestLogin: ", code, JSON.stringify(ret));
            if (code != errcode.OK)
                return next(code);
            if (ret.code != errcode.OK){
                if (ret.code == errcode.RECOMMENDATION_NOT_EXIST){
                    self.recommendation = "";
                    self.address = "";
                    return self.requestGate(next);
                }else{
                    return next(ret.code);
                }
            }
            cc.g_ada.gameUser = new GameUser(ret.userId, ret.coins);
            next(0);
        });
    }

    login(next){
        if (this.account == ""){
            return next(errcode.LOGIN_ACCOUNT_NULL);
        }
        if (this.recommendation && this.address){
            this.requestLogin(next);
        }else{
            this.requestGate(next);
        }
    }

    requestRegister(next){

    }
}

module.exports = LoginLauncher;