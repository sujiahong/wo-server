"use strict";
const TAG = "router/index.js";
const router = require('koa-router')();

router.get('/', async (ctx, next) => {
    ctx.body = "将渲染登录模版!";
});

module.exports = router;