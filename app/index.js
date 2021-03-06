var requiredEnvVariables = [
  'POCKET_CONSUMER_KEY',
  'POCKET_REDIRECT_URI',
  'BUFFER_CLIENT_ID',
  'BUFFER_CLIENT_SECRET',
  'BUFFER_REDIRECT_URI'
];

requiredEnvVariables.forEach(function (name) {
  if (!process.env.hasOwnProperty(name)) {
    throw new Error('Missing environment variable ' + name);
  }
});

var MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/poffer';
var mongoose = require('mongoose');
mongoose.connect(MONGO_URL);

var path = require('path');
var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());

var publicDir = path.join(__dirname, '../public');
app.use('/', express.static(publicDir));

var viewsDir = path.join(__dirname, 'views');
app.set('views', viewsDir);
app.set('view engine', 'jade');

app.get('/status', function (req, res) {
  res.json({
    status: 'ok'
  });
});

var bufferRoute = require('./routes/buffer');
app.use('/api/buffer', bufferRoute);

var pocketRoute = require('./routes/pocket');
app.use('/api/pocket', pocketRoute);

app.get('/', function (req, res) {
  res.render('index', {
    googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
    env: JSON.stringify({
      accounts: {
        buffer: {
          client_id: process.env.BUFFER_CLIENT_ID,
          redirect_uri: process.env.BUFFER_REDIRECT_URI
        },
        pocket: {
        }
      }
    })
  });
});

app.get('/pocket/callback', function (req, res) {
  res.render('pocket-callback');
});

app.get('/buffer/callback', function (req, res) {
  res.render('buffer-callback');
});

app.use(function (req, res) {
  res.statusCode = 404;
  res.json({
    status: 'error',
    message: 'not found'
  });
});

if (process.env.BUGSNAG_API_KEY) {
  var bugsnag = require('bugsnag');
  bugsnag.register(process.env.BUGSNAG_API_KEY, {
    releaseStage: process.env.NODE_ENV || 'development',
    onUncaughtError: function (err) {
      console.error(err.stack || err);
    }
  });
}

var PORT = process.env.PORT || '1234';
app.listen(PORT, function () {
  console.log('Listening to ' + PORT);
});
