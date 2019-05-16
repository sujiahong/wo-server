"use strict";
const TAG = "controllers/user.js";
const userTableAction = require("../../../../dao/mysql/admin/table_action_user");
const errcode = require("../../../../share/errcode");

class User{
    static async login(ctx){
        const {account, passwd} = ctx.request.body;
        var session = ctx.session;
        var ret = await userTableAction.queryUser(account);
        if (ret.code != 0){
            return ctx.body = ret;
        }
        if (ret.results.length == 0){
            return ctx.body = {code: errcode.LOGIN_USERID_NOT_EXIST};
        }
        var user = ret.results[0];
        console.log(TAG, user, session);
        if (user.passwd != passwd){
            return ctx.body = {code: errcode.LOGIN_PASSWD_ERR};
        }
        session.userId = account;
        ctx.body = {code: 0};
    }

    static async info(){

    }

    static async list(){

    }

    static async delete(){

    }
};

module.exports = User;