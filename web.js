var express = require('express');

var app = express.createServer(express.logger());

var fs = require("fs");
var buffer = fs.readFileSync("index.html");
var str = buffer.toString();
app.get('/', function(request, response) {
  response.send(str);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
