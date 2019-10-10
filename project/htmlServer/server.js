var express = require('express');
var proxy = require('http-proxy-middleware');


var app = express();

// app.use('/', proxy({
//   target: 'http://localhost', changeOrigin: true
// }));

app.all('*', function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.use('^/api/tools', proxy({
  target: 'http://10.188.60.148:8108', changeOrigin: true
}));
app.listen(3004);
