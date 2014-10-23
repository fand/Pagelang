'use strict';

var mysql = require('mysql');
var options = require('../config').db;  // Default options.
var Q = require('q');

var DB = function (opts) {
  this.options = options;
  if (opts) {
    if (opts.host) { this.options.host = opts.host; }
    if (opts.user) { this.options.user = opts.user; }
    if (opts.password) { this.options.password = opts.password; }
    if (opts.database) { this.options.database = opts.database; }
  }

  this.connection = mysql.createConnection(this.options);
  this.buf_query = [];
  this.buf_action = [];
};

DB.prototype.connect = function (callback) {
  var d = Q.defer();
  this.connection.connect(function () {
    if (callback && callback.constructor && callback.call && callback.apply) { callback.apply(null, arguments); }
    d.resolve();
  });
  return d.promise;
};

DB.prototype.end = function (callback) {
  var d = Q.defer();
  this.connection.end(function () {
    if (callback && callback.constructor && callback.call && callback.apply) { callback.apply(null, arguments); }
    d.resolve();
  });
  return d.promise;
};

DB.prototype.query = function (q, callback) {
  var d = Q.defer();
  this.connection.query(q, function (err, rows, fields) {
    if (err) { d.reject(err); }
    if (callback && callback.constructor && callback.call && callback.apply) { callback.apply(null, arguments); }
    d.resolve.apply(d, [].slice.apply(arguments, [1]));
  });
  return d.promise;
};

DB.prototype.queries = function(){
  if (this.buf_query.length === 0) { return; }

  var self = this;
  this.query(this.buf_query.shift(), function (err, rows, fields) {
    if (err) { throw err; }
    var action = this.buf_actions.shift();
    if (action) {
      action(rows, fields);
    }
    self.queries();
  });
};

DB.prototype.transact = function (queries, actions) {
  this.buf_query = queries;
  this.buf_action = actions;

  var self = this;
  this.connection.beginTransaction(function (err) {
    if (err) { throw err; }
    self.query();
  });
};

module.exports = DB;
