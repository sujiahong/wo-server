"use strict";
const TAG = "webserver-start.js";
const Koa = require('koa');
const app = new Koa();
const views = require('koa-views');
const json = require('koa-json');
const koaStatic = require("koa-static");
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser');
const klogger = require('koa-logger');
const session = require("koa-session-minimal");
const http = require('http');

const index = require('./routes/index');
const users = require('./routes/users');
const config = require("../../../share/config");
const logger = g_serverData.logger;

// error handler
onerror(app);

app.use(session({
  key: "id",
}))

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

// routes
app.use(index.routes(), index.allowedMethods());
app.use(users.routes(), users.allowedMethods());

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