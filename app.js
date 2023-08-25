var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { sequelize } = require('./models');

var indexRouter = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
// Setup request body JSON parsing.
app.use(express.json());

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Root route redirect to the '/books' route
app.get('/', (req,res) => {
  res.redirect('/books');
});
// Use route definitions 
app.use('/books', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.log('404 error handler called');
  const err = new Error("Sorry! We couldn't find the page you were looking for.");
  res.status(404).render('page-not-found',{ err });
  //next(createError(404));
});

// Global error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  if (err.status === 404) {
    res.status(404).render('page-not-found', { err });
  } else {
    err.message = err.message || `It looks like something went wrong on the server!`;
    res.status(err.status || 500).render('error', { err });

  // Log the err object's status and message properties to the console
    console.log('Global error handler called', err);  
  }
});

// Test the database connection.
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

// Sequelize model synchronization, then start listening on our port.
sequelize.sync();


module.exports = app;
