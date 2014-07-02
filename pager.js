'use strict';

var db = require('./db');
var readline = require('readline');


var Pager = function(size){
  this.size = size || 1024;
  this.tape = new Array(this.size);
  for (var i = 0; i < this.size; i++) {
    this.tape[i] = 0;
  }

  this.idx = 0;      // idx for code
  this.pointer = 0;  // pointer on tape
  this.offset = 0;
  this.limit = 0;
  this.level = 0;
  this.loops = [];

  this.rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
};

Pager.prototype.eval = function(code){

  db.connect();

  this.idx = 0;
  while (this.idx < code.length) {
    var char = code[this.idx];

    switch (char) {
    case "<":
      this.leftIdx();      break;
    case ">":
      this.rightIdx();     break;
    case "+":
      this.incrementIdx(); break;
    case "-":
      this.decrementIdx(); break;
    case ".":
      this.putChar();      break;
    case ",":
      this.getChar();      break;
    case "[":
      this.startLoop();    break;
    case "]":
      this.endLoop();      break;
    }

    this.idx++;
  }
};

Pager.prototype.leftIdx = function(){
  if (this.pointer === 0) {
    throw new Error('pointer must be positive');
  }
  else {
    this.pointer--;
  }
};

Pager.prototype.rightIdx = function(){
  if (this.pointer === this.size - 1) {
    throw new Error('index must be below size: ' + this.size);
  }
  else {
    this.pointer++;
  }
};

Pager.prototype.incrementIdx = function(){
  this.tape[this.pointer]++;
};

Pager.prototype.decrementIdx = function(){
  if (this.tape[this.pointer] === 0) {
    throw new Error('cannot decrement memory value 0');
  }
  this.tape[this.pointer]--;
};

Pager.prototype.putChar = function(){
  console.log(String.fromCharCode(this.tape[this.pointer]));
};

Pager.prototype.getChar = function(){
  this.rl.question('', function (answer) {
    this.tape[this.pointer] = answer[0];
  });
};


Pager.prototype.startLoop = function(){
  this.level++;
  this.loops.push(this.idx);

};

Pager.prototype.endLoop = function(){
  if (this.level === 0) {
    throw new Error('illegal loop end');
    return;
  }

  if (this.tape[this.pointer] === 0) {
    this.loops.pop();
    this.level--;
  }
  else {
    this.idx = this.loops[this.loops.length - 1];
  }
};

module.export = Pager;
