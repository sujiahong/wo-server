"use strict";
const TAG = "routes/api.js";
const router = require('koa-router')();
const user = require("../controllers/user");

router.prefix('/api');

// 用户登录
router.post('/user/login', user.login);
// 删除用户
router.delete('/user/delete/:id', user.delete);
// 获取用户信息
router.get('/user/info', user.info);
// 获取用户列表
router.get('/user/list', user.list);

module.exports = router;