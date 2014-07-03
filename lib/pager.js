'use strict';

var util = require('util');
var Brainfuck = require('./brainfuck');
var db = require('./db');

var Pager = function () {
  this.super = Brainfuck;
  this.super.apply(this, arguments);

  this.offset = 0;
  this.limit = 0;
};
util.inherits(Pager, Brainfuck);

Pager.prototype.clear = function () {
  this.super.prototype.clear.apply(this, arguments);
  this.offset = 0;
  this.limit = 0;
};

Pager.prototype.eval = function(code, callback){

  this.clear();
  db.connect();

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
  }

  db.end();
  this.out.end();

  if (callback) { callback(null, this.output); }
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
