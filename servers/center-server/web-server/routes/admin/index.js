"use strict";
const TAG = "routes/admin/index.js";
const mainService = require("../../../main_service");
const utils = require("../../../../../utils/utils");
const router = require('koa-router')();

router.prefix("/admin");

router.get("/", async (ctx, next)=>{
    ctx.render("admin/login");
});

router.get("/login", async (ctx, next)=>{
    ctx.render("admin/login");
});

router.get("/info", async (ctx, next)=>{
    ctx.render("admin/login");
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