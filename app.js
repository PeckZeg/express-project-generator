global.reqlib = require('app-root-path').require;
global._ = require('lodash');

const config = reqlib('config');

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const swig = require('swig');
const debug = require('debug')(`${config.appName}:server`);
const http = require('http');
const compression = require('compression');

const swigFilters = reqlib('swig/filters')(swig);

const TEMPLATE_PATHNAME = path.join(__dirname, config.publicFolder.templates);

const ROUTES = {
    index: reqlib('routes/index')
};

const API_ROUTES = {};

var app = express();

//  视图引擎设置
app.set('port', config.port);
app.set('views', TEMPLATE_PATHNAME);
app.set('view engine', 'html');
app.set('view cache', false);
app.engine('html', swig.renderFile);
swig.setDefaults({
    loader: swig.loaders.fs(TEMPLATE_PATHNAME),
    cache: false,
});

//  图标设置
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression());
app.use('/static',express.static(path.join(__dirname, config.publicFolder.static)));

//  页面路由
_.each(ROUTES, (router, pathname) => {
    if (pathname == 'index') pathname = '';
    app.use(`/${pathname}`, router);
});

//  接口路由
_.each(API_ROUTES, (router, pathname) => {
    app.use(`/api/${pathname}`, router);
});

//  捕获 404 错误，并继续进行下一个处理
app.use((req, res, next) => {
    var err = new Error('Not Found');
        err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    res.status(err.status || 500).render(config.errorTemplate, _.extend({
        message: err.message,
        error: config.isDev ? err : {}
    }, config));
});

var server = http.createServer(app);

server.listen(config.port);

server.on('error', (err) => {
    if (err.syscall !== 'listen') throw err;

    var bind = _.isString(config.port) ? `Pipe ${config.port}` : 
                `Port ${config.port}`;

    //  处理指定的监听错误，输出友好的消息
    switch (err.code) {
        case 'EACCES':
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;

        case 'EADDRINUSE':
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;

        default:
            throw err;
    }
});

server.on('listening', () => {
    var addr = server.address(),
        bind = _.isString(addr) ? `pipe ${addr}` : `port ${addr.port}`;

    debug(`Listening on ${bind}`);
});