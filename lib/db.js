'use strict';

var mysql = require('mysql');
var connection;

var queries = [];
var actions = [];


// Default options.
var options = {
  host     : 'localhost',
  user     : 'pager',
  password : 'pagerank'
};


// Functions
var connect = function(opts){
  if (opts) {
    if (opts.host) { options.host = opts.host; }
    if (opts.user) { options.user = opts.user; }
    if (opts.password) { options.password = opts.password; }
  }
  connection = mysql.createConnection(options);
};

var end = function () {
  connection.end();
};


var query = function(){
  if (queries.length === 0) { return; }

  connection.query(queries.shift(), function (err, rows, fields) {
    var action = actions.shift();
    if (action) {
      action(rows, fields);
    }
    query();
  });
};

var transact = function (_queries, _actions) {
  queries = _queries;
  connection.beginTransaction(function (err) {
    if (err) { throw err; }
    query();
  });
};

module.exports = {
  connect: connect,
  transact: transact,
  end: end
};
