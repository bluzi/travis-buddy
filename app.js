const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const ejs = require('ejs');

const apiRoutes = require('./routes/api.routes');
const testRoutes = require('./routes/test.routes');
const websiteRoutes = require('./routes/website.routes');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

app.use('/public', express.static('public'));

app.use('/', apiRoutes);
app.use('/test', testRoutes);
app.use('/', websiteRoutes);

// catch 404 and forward to error handler
app.use((req, res) => {
  res
    .status(404)
    .render('not-found');
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.end();
});

module.exports = app;
