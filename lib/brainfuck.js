'use strict';

var readline = require('readline');
var es = require('event-stream');
var Q = require('q');

var Brainfuck = function (size) {
  this.size = size || 1024;
  this.tape = new Array(this.size);
  for (var i = 0; i < this.size; i++) {
    this.tape[i] = 0;
  }

  this.index = 0;    // index for code
  this.pointer = 0;  // pointer on tape
  this.level = 0;
  this.loops = [];

  // init IO
  this.in = process.stdin;
  this.out = es.through();
  this.out.pipe(process.stdout);

  this.buf_output = [];
  this.buf_input = [];
};

Brainfuck.prototype.eval = function(code, callback){
  var d = Q.defer();
  var self = this;

  this.clear();

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
    }

    this.index++;

    if (this.index === this.code.length) {
      d.resolve(self.buf_output.join(''));
      if (callback) {
        callback(null, self.buf_output.join(''));
      }
    }
  }

  return d.promise;
};

Brainfuck.prototype.leftPointer = function () {
  if (this.pointer === 0) {
    throw new Error('pointer must be positive');
  }
  else {
    this.pointer--;
  }
};

Brainfuck.prototype.rightPointer = function () {
  if (this.pointer === this.size - 1) {
    throw new Error('index must be below size: ' + this.size);
  }
  else {
    this.pointer++;
  }
};

Brainfuck.prototype.incrementPointer = function () {
  this.tape[this.pointer]++;
};

Brainfuck.prototype.decrementPointer = function () {
  if (this.tape[this.pointer] === 0) {
    throw new Error('cannot decrement memory value 0');
  }
  this.tape[this.pointer]--;
};

Brainfuck.prototype.putChar = function () {
  var char = String.fromCharCode(this.tape[this.pointer]);
  this.out.write(char);
  this.buf_output.push(char);
};

Brainfuck.prototype.getChar = function () {
  this.tape[this.pointer] = this.in.read(1).toString().charCodeAt(0);
};

Brainfuck.prototype.startLoop = function () {
  if (this.tape[this.pointer] === 0) {
    while (this.code[this.index] !== ']') {
      if (this.index >= this.code.length) {
        throw new RangeError('illegal loop match');
      }
      this.index++;
    }
  }
  else {
    this.level++;
    this.loops.push(this.index);
  }
};

Brainfuck.prototype.endLoop = function () {
  if (this.level === 0) {
    throw new Error('illegal loop end');
    return;
  }

  if (this.tape[this.pointer] === 0) {
    this.loops.pop();
    this.level--;
  }
  else {
    this.index = this.loops[this.loops.length - 1];
  }
};

Brainfuck.prototype.pipe = function (dst) {
  this.out.unpipe();
  this.out.pipe(dst);
};

Brainfuck.prototype.unpipe = function () {
  this.out.unpipe();
};

Brainfuck.prototype.clear = function () {
  this.index = 0;
  this.pointer = 0;
  this.level = 0;
  this.loops = [];
  this.buf_output = [];
  this.buf_input = [];

  for (var i = 0; i < this.size; i++) {
    this.tape[i] = 0;
  }
};

Brainfuck.prototype.input = function (str) {
  this.in.push(str);
};

module.exports = Brainfuck;
