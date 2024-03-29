var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var dotenv = require('dotenv').config();
const { connectMongoDB } = require('./config/mongodbConfig');
const { swaggerUi, specs } = require('./swagger/swagger');

var indexRouter = require('./controller/index');
var usersRouter = require('./controller/users');
var authRouter = require('./controller/auth');
var bookRouter = require('./controller/book');
var sseRouter = require('./controller/sse');
const cors = require('cors');

// CORS 미들웨어 추가
var app = express();

app.use(cors());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// routing
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/books', bookRouter);
app.use('/sse', sseRouter);

// swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// connect MongoDB
connectMongoDB();

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
