#!bin/node
var connect = require('connect');
var serverStatic = require('serve-static');
connect().use(serverStatic(__dirname)).listen(3000);