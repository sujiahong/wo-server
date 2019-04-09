"use strict"
const TAG = "home_user.js";

class HomeUser {
    constructor(id, opts){
        this.id = id;
        this.cliType = opts.cliType;
        this.accountType = opts.accountType;
        this.accountData = opts.accountData;
        this.loginIp = opts.ip;
        this.loginStat = 0;
        this.coinNum = opts.coinNum;
        this.userAction = 1;
    }


};

module.exports = HomeUser;