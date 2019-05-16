"use strict";
const TAG = "webserver-start.js";
const Koa = require('koa');
const app = new Koa();
const views = require('koa-views');
const json = require('koa-json');
const koaStatic = require("koa-static");
const koaError = require('koa-onerror');
const bodyparser = require('koa-bodyparser');
const klogger = require('koa-logger');
const session = require("koa-session-minimal");
const http = require('http');

const index = require('./routes/index');
const admin = require("./routes/admin");
const api = require('./routes/api');
const config = require("../../../share/config");
const dbConn = require("../../../utils/db_connection");
dbConn.mysqlConnect(config.DB_NAME_LIST[2]);
const logger = g_serverData.logger;

// error handler
koaError(app);

app.use(session(config.KOA_SESSION));

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}));
app.use(json());
app.use(klogger());
app.use(koaStatic(__dirname + '/public'));

app.use(views(__dirname + '/views', {
  extension: 'pug'
}));

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
});

////session验证拦截
const allowRouterArr = ['/admin/login','/api/user/login'];
app.use(async (ctx, next)=>{
    var url = ctx.originalUrl;
    console.log(url, ctx.origin, ctx.session, ctx.cookies.get("session-id"));
    if (allowRouterArr.indexOf(url) < 0){////不允许访问
        if (!ctx.session.userId)
            return await ctx.render("admin/login", {title: "登录"});
    }
    await next();
});
// routes
app.use(index.routes(), index.allowedMethods());
app.use(admin.routes(), admin.allowedMethods());
app.use(api.routes(), api.allowedMethods());

// error-handling
app.on('error', (err, ctx) => {
  logger.error(TAG, 'server error', err, ctx);
  ctx.status = 500;
  ctx.statusText = "server Error";
  ctx.body = {code: 1};
});

/**
 * Create HTTP server.
 */

var server = http.createServer(app.callback());

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(config.CENTER_HTTP_PORT);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  logger.debug(TAG, __dirname, 'web server Listening on ' + bind);
}