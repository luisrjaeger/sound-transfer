var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');

app.set('port', (process.env.PORT || 5000));

//Parsing JSON parameters
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Rendering html for mobile
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

//Receiving input parameters for communication type (default 1)
var uses = '' + (process.argv[2] || 1);
console.info('usesFile', uses);

//Setting directory for communication type
app.use(express.static('base'));
app.use(express.static(uses));

app.get('/', function(req, res) {
  res.render('receive.html');
});

/** GET and POST **/
app.get('/transmit', function(req, res) {
  res.render('transmit.html');
});

app.get('/receive', function(req, res) {
  res.render('receive.html');
});

//Receives console output from client
app.post('/console', function(req, res) {
  var body = req.body;

  for (var prop in body) {
    console.info(prop + ' -', body[prop]);
  }
  console.info('**************************************');

  res.end();
});
/** GET and POST **/

app.listen(app.get('port'), function() {
  console.log('Started!', app.get('port'));
});
