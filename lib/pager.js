'use strict';

var util = require('util');
var Q = require('q');
var Brainfuck = require('./brainfuck');
var DB = require('./db');

var Pager = function () {
  this.super = Brainfuck;
  this.super.apply(this, arguments);

  this.db = new DB();
  this.offset = 0;
  this.limit = 0;
  this.buf_rows = [];
  this.result = {};
};
util.inherits(Pager, Brainfuck);

Pager.prototype.clear = function () {
  this.super.prototype.clear.apply(this, arguments);
  this.offset = 0;
  this.limit = 0;
  this.buf_rows = [];
};

Pager.prototype.evalChar = function () {

  if (this.index === this.code.length) {
    this.evaluating.resolve();
    return;
  }

  var char = this.code[this.index];
  var promise;

  switch (char) {
  case "<":
    this.leftPointer();       break;
  case ">":
    this.rightPointer();      break;
  case "+":
    this.incrementPointer();  break;
  case "-":
    this.decrementPointer();  break;
  case ".":
    this.putChar();           break;
  case ",":
    promise = this.getChar(); break;
  case "[":
    this.startLoop();         break;
  case "]":
    this.endLoop();           break;
  case "{":
    this.leftOffset();        break;
  case "}":
    this.rightOffset();       break;
  case "(":
    this.leftLimit();         break;
  case ")":
    this.rightLimit();        break;
  case "v":
    promise = this.select();  break;
  }

  this.index++;

  var self = this;
  if (promise) {
    promise.then(function () {
      self.evalChar();
    });
  }
  else {
    this.evalChar();
  }
};

Pager.prototype._eval = function (code, callback) {

  this.code = code;
  this.index = 0;

  var d = Q.defer();
  this.evaluating = d;
  this.evalChar();

  return d.promise;
};

Pager.prototype.eval = function(code, callback){

  var d = Q.defer();
  this.clear();

  var self = this;
  this.db.connect()
    .then(this._eval.bind(this, code))
    .then(this.db.end.bind(this.db))
    .then(function () {
      self.result.output = self.buf_output.join('');
      self.result.rows = self.buf_rows;
      if (callback && callback.constructor && callback.call && callback.apply) {
        callback(null, self.result);
      }
    }).done(function () {
      d.resolve(self.result);
    });

  return d.promise;
};

Pager.prototype.leftOffset = function () {
  if (this.offset === 0) {
    throw new Error('offset must be positive');
  }
  else {
    this.offset--;
  }
};

Pager.prototype.rightOffset = function(){
  if (this.offset === this.size - 1) {
    throw new Error('offset must be below size: ' + this.size);
  }
  else {
    this.offset++;
  }
};

Pager.prototype.leftLimit = function () {
  if (this.limit === 0) {
    throw new Error('limit must be positive');
  }
  else {
    this.limit--;
  }
};

Pager.prototype.rightLimit = function(){
  this.limit++;
};

Pager.prototype.select = function(){
  if (typeof this.table === 'undefined') {
    throw new Error('table not specified');
  }
  var query = 'SELECT * from ' + this.table + ' LIMIT ' + this.offset + ', ' + this.limit;

  var d = Q.defer();
  var self = this;

  this.db.query(query)
    .then(function (rows, fields) {
      self.buf_rows.push(rows);
    })
    .done(d.resolve);

  return d.promise;
};

Pager.prototype.setTable = function (table) {
  this.table = table;
};


module.exports = Pager;
