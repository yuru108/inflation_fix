var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db/sqlite.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the SQlite database.');
});

app.get('/prices/Oil', (req, res) => {
  db.all('SELECT * FROM OilPrices', (err, rows) => {
    if (err) {
      console.error(err.message);
    }
    res.json(rows);
  });
});

app.get('/prices/Gas', (req, res) => {
  db.all('SELECT * FROM NaturalGasPrices', (err, rows) => {
    if (err) {
      console.error(err.message);
    }
    res.json(rows);
  });
});

app.get('/prices/Coal', (req, res) => {
  db.all('SELECT * FROM CoalPrices', (err, rows) => {
    if (err) {
      console.error(err.message);
    }
    res.json(rows);
  });
});

module.exports = app;
