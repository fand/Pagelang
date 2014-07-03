'use strict';

var mocha = require('mocha');
var assert = require('chai').assert;
var Q = require('q');

var Brainfuck = require('../lib/brainfuck');


describe('Brainfuck', function(){

  var bf;

  before(function () {
    bf = new Brainfuck();
  });

  afterEach(function () {

  });

  it('should run brainfuck code', function (done) {
    var code = '++++++++[>++++++++<-]>+.+.+.';
    var answer = 'ABC';
    bf.eval(code, function (err, data) {
      assert.equal(data, answer);
      done();
    });
  });

  it('should return same outputs in eval and willEval', function (done) {
    var code = '++++++++[>++++++++<-]>+.+.+.';
    var answer = 'ABC';
    bf.eval(code, function (err, data1) {
      bf.willEval(code).then(function (data2) {
        assert.equal(data1, data2);
        done();
      });
    });
  });

  it('should run HelloWorld in brainfuck', function (done) {
    var code = '+++++++++[>++++++++<-]>.<+++++[>+++++<-]>++++.+++++++..+++.[>+>+<<-]++++[>------<-]>.>.+++.------.--------.[-]++++++[>+++++<-]>+++..';
    var answer = 'HelloWorld!!';
    bf.willEval(code).then(function (data) {
      assert.equal(data, answer);
      done();
    });
  });

  it('should run abc... in brainfuck', function (done) {
    var code = '+++++++++++++++++++++++++++++++++.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.';
    var answer = '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';
    bf.eval(code, function (err, data) {
      assert.equal(data, answer);
      done();
    });
  });

  it('should move the pointer right', function (done) {
    bf.willEval('>')
      .then(function () {
        assert.equal(bf.pointer, 1);
      }).then(function () {
        bf.willEval('>>>');
      }).then(function () {
        assert.equal(bf.pointer, 3);
      }).then(function () {
        done();
      });
  });

  it('should move the pointer left', function (done) {
    bf.willEval('><')
      .then(function(){
        assert.equal(bf.pointer, 0);
      }).then(function () {
        bf.willEval('>><');
      }).then(function () {
        assert.equal(bf.pointer, 1);
      }).then(function () {
        bf.willEval('>>><<<');
      }).then(function () {
        assert.equal(bf.pointer, 0);
      }).then(function () {
        assert.throws(function () {
          bf.willEval('<');
        });
      }).then(function () {
        done();
      });
  });

  it('should clear the properties by Brainfuck#clear', function (done) {
    var code = '++++++++[>++++++++<-]>+.+.+.';
    bf.willEval(code).then(function () {
      assert.equal(bf.pointer, 1);
      bf.clear();
      assert.equal(bf.pointer, 0);
      done();
    });
  });

});
