'use strict';

var mocha = require('mocha');
var assert = require('chai').assert;
var Q = require('q');

var Pager = require('../lib/pager');


describe('Brainfuck', function(){

  var pager;
  var tmp;

  before(function () {
    pager = new Pager();
  });

  afterEach(function () {

  });

  it('should run brainfuck code', function (done) {
    var code = '++++++++[>++++++++<-]>+.+.+.';
    var answer = 'ABC';
    pager.eval(code, function (err, data) {
      assert.equal(data, answer);
      done();
    });
  });

  it('should return same outputs in eval and willEval', function (done) {
    var code = '++++++++[>++++++++<-]>+.+.+.';
    var answer = 'ABC';
    pager.eval(code, function (err, data1) {
      pager.willEval(code).then(function (data2) {
        assert.equal(data1, data2);
        done();
      });
    });
  });

  it('should run HelloWorld in brainfuck', function (done) {
    var code = '+++++++++[>++++++++<-]>.<+++++[>+++++<-]>++++.+++++++..+++.[>+>+<<-]++++[>------<-]>.>.+++.------.--------.[-]++++++[>+++++<-]>+++..';
    var answer = 'HelloWorld!!';
    pager.willEval(code).then(function (data) {
      assert.equal(data, answer);
      done();
    });
  });

  it('should run abc... in brainfuck', function (done) {
    var code = '+++++++++++++++++++++++++++++++++.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.';
    var answer = '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';
    pager.eval(code, function (err, data) {
      assert.equal(data, answer);
      done();
    });
  });

  it('should move the pointer right', function (done) {
    pager.willEval('>')
      .then(function () {
        assert.equal(pager.pointer, 1);
      }).then(function () {
        pager.willEval('>>>');
      }).then(function () {
        assert.equal(pager.pointer, 3);
      }).then(function () {
        done();
      });
  });

  it('should move the pointer left', function (done) {
    pager.willEval('><')
      .then(function(){
        assert.equal(pager.pointer, 0);
      }).then(function () {
        pager.willEval('>><');
      }).then(function () {
        assert.equal(pager.pointer, 1);
      }).then(function () {
        pager.willEval('>>><<<');
      }).then(function () {
        assert.equal(pager.pointer, 0);
      }).then(function () {
        assert.throws(function () {
          pager.willEval('<');
        });
      }).then(function () {
        done();
      });
  });

  it('should clear the properties by Pager#clear', function (done) {
    var code = '++++++++[>++++++++<-]>+.+.+.';
    pager.willEval(code).then(function () {
      assert.equal(pager.pointer, 1);
      pager.clear();
      assert.equal(pager.pointer, 0);
      done();
    });
  });

});
