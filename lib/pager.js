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
};
util.inherits(Pager, Brainfuck);

Pager.prototype.clear = function () {
  this.super.prototype.clear.apply(this, arguments);
  this.offset = 0;
  this.limit = 0;
};

Pager.prototype._eval = function (code, callback) {
  var d = Q.defer();

  this.code = code;
  this.index = 0;
  while (this.index < code.length) {
    var char = code[this.index];

    switch (char) {
    case "<":
      this.leftPointer();      break;
    case ">":
      this.rightPointer();     break;
    case "+":
      this.incrementPointer(); break;
    case "-":
      this.decrementPointer(); break;
    case ".":
      this.putChar();          break;
    case ",":
      this.getChar();          break;
    case "[":
      this.startLoop();        break;
    case "]":
      this.endLoop();          break;
    case "{":
      this.leftOffset();       break;
    case "}":
      this.rightOffset();      break;
    case "(":
      this.leftLimit();        break;
    case ")":
      this.rightLimit();       break;
    }

    this.index++;

    if (this.index === this.code.length) {
      d.resolve();
      if (callback) { callback(); }
    }
  }

  return d.promise;
};

Pager.prototype.eval = function(code, callback){

  var d = Q.defer();
  this.clear();

  var self = this;
  this.db.connect()
    .then(this._eval(code))
    .then(this.db.end())
    .then(function () {
      if (callback) { callback(null, self.buf_output.join('')); }
      d.resolve(self.buf_output.join(''));
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


module.exports = Pager;
