var express = require('express');

var app = express.createServer(express.logger());

var fs = require("fs");
app.get('/', function(request, response) {
  var buffer = fs.readFileSync("index.html");
  var str = buffer.toString();
  response.send(str);
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
