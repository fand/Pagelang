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

  this.out = es.through();
  this.out.pipe(process.stdout);
  this.output = '';

  this.rl = readline.createInterface({
    input:  process.stdin,
    output: this.out
  });
};

Brainfuck.prototype.eval = function(code, callback){

  this.clear();

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
  }

  this.out.end();
  if (callback) { callback(null, this.output); }
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
  this.output += char;
};

Brainfuck.prototype.getChar = function (sync) {
  this.rl.question('', function (answer) {
    this.tape[this.pointer] = answer[0];
  });
};

Brainfuck.prototype.startLoop = function () {
  this.level++;
  this.loops.push(this.index);

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
  this.output = '';
  for (var i = 0; i < this.size; i++) {
    this.tape[i] = 0;
  }
};

Brainfuck.prototype.willEval = function (code) {
  var d = Q.defer();
  this.eval(code, function (err, data) {
    d.resolve(data);
  });
  return d.promise;
};

module.exports = Brainfuck;
