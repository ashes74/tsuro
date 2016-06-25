var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));
app.use(express.static('./node_modules'));
app.use(express.static('./browser'));

app.get('/', function(req, res, next){
	res.sendFile('public/index.html');
});

app.use(function (err, req, res, next) {
    console.error(err, err.stack);
    res.status(500).send(err);
});

app.listen(3000, function(){
	console.log('listening....');
});

