"use strict";
const TAG = "routes/admin.js";
const mainService = require("../../main_service");
const utils = require("../../../../utils/utils");
const router = require('koa-router')();

router.prefix("/admin");

router.get("/", async (ctx, next)=>{
    await ctx.render("admin/index", {title: "后台"});
});

router.get("/login", async (ctx, next)=>{
    await ctx.render("admin/login", {title: "登录"});
});

router.get("/info", async (ctx, next)=>{
    await ctx.render("admin/login");
});


router.get("/cluster", async(ctx, next)=>{
    mainService.refreshServerInfo();
    await utils.delayPromise(2000);
    await ctx.render("admin/server_state", {
      title: '服务器状态Center-server',
      serverInfo: JSON.stringify(g_serverData.innerServerInfo)
    });
});


module.exports = router;