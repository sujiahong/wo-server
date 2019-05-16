"use strict";
const TAG = "router/index.js";
const router = require('koa-router')();

router.get('/', async (ctx, next) => {
    await ctx.render("admin/login", {title: "登录"});
});

module.exports = router;