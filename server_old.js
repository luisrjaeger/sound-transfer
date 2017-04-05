var fs = require("fs");
var RC4 = require('simple-rc4');
var fileName = "sample2.txt";
var express  = require('express');
var app      = express();

app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

var key = new Buffer([210, 654, 779, 80, 546, 357]);

app.use(express.static('uses'));

app.get('/transmit', function (req, res) {
  res.render('transmit.html');
});

app.get('/receive', function (req, res) {
  res.render('receive.html');
});

/*
app.get('/encrypt', function (req, res) {
  var enc = new RC4(key), text = new Buffer(req.query.msg);
  enc.update(text);
  console.info('enc', text.toString());
  console.info('enc', text.toString('hex'));
  res.send(JSON.stringify(text));
});

app.get('/decrypt', function (req, res) {
  var dec = new RC4(key), text = req.query.msg;
  console.info('deco', text);
  dec.update(text);
  res.send(text.toString());
});
*/

app.get('/sample', function (req, res) {
  readFile(res);
});

app.listen(8888, function () {
  console.log('Started!');
});

/*
function readFile(res) {
  fs.readFile(fileName, function(err, data) {
    if (err) throw err;
    res.send(JSON.stringify(data));
  });
}
*/

/*
app.post('/crypt', function (req, res) {
  console.info('MSG', req.body.msg);
  var body = req.body, msg = body.msg,
      enc = new RC4(key), text = new Buffer(msg);

  console.info('BEFORE', text);
  enc.update(text);
  console.info('AFTER', text);

  console.info('TEXTO', text.toString());

  console.info('***************************************');

  res.send(JSON.stringify(text));
});

app.get('/decrypt', function (req, res) {
  var text = req.query.msg;
  console.info('deco', text);
  dec.update(text);
  res.send(text.toString());

  var body = req.body, msg = body.msg,
      dec = new RC4(key), text = new Buffer(msg);
  res.send(JSON.stringify(dec.update(text)));
});
*/
