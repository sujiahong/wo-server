"use strict"
const TAG = "home_user.js";

class HomeUser {
    constructor(id, opts){
        this.id = id;
        this.account = opts.account;
        this.nickname = opts.nickname;
        this.icon = opts.icon;
        this.lv = opts.lv || 1;
        this.cliType = opts.cli_type;
        this.accountType = opts.account_type;
        this.loginIp = opts.login_ip || "";
        this.coins = opts.coins;
        this.miniId = opts.mini_id;
        this.userAction = 1;
        this.loginStat = 0;
        this.timeId = null;
    }


};

module.exports = HomeUser;