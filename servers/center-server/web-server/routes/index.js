"use strict";
const TAG = "index.js";
const router = require('koa-router')()
const mainService = require("../../main_service");
const utils = require("../../../../utils/utils");

router.get('/', async (ctx, next) => {
  mainService.refreshServerInfo();
  await utils.delayPromise(2000);
  await ctx.render('index', {
    title: '服务器状态Center-server',
    serverInfo: JSON.stringify(g_serverData.innerServerInfo)
  });
})

router.get('/string', async (ctx, next) => {
  ctx.body = 'koa2 string'
})

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

module.exports = router
