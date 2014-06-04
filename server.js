var express = require('express');
var app = express();
var port = 8002;

app.use(express.static(__dirname + '/public'));
app.listen(port);
console.log('server running on port ' + port);
