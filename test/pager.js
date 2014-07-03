'use strict';

var mocha = require('mocha');
var assert = require('chai').assert;
var Q = require('q');

var Brainfuck = require('../lib/brainfuck');
var Pager = require('../lib/pager');


describe('Pager', function(){

  var pager;

  before(function () {
    pager = new Pager();
  });

  afterEach(function () {

  });

  it('should give same outputs as Brainfuck for brainfuck codes', function (done) {
    var codes = [
      '++++++++[>++++++++<-]>+.+.+.',
      '+++++++++[>++++++++<-]>.<+++++[>+++++<-]>++++.+++++++..+++.[>+>+<<-]++++[>------<-]>.>.+++.------.--------.[-]++++++[>+++++<-]>+++..',
      '+++++++++++++++++++++++++++++++++.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.+.'
    ];
    var answers = [
      'ABC',
      'HelloWorld!!',
      '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'
    ];

    var callcount = 0;
    var callback = function () {
      if (++callcount === codes.length) { done(); }
    };

    var bf = new Brainfuck();
    for (var i = 0; i < codes.length; i++) {
      pager.eval(codes[i], function (err, data1) {
        if (err) { throw err; }
        bf.eval(codes[i], function (err, data2) {
          if (err) { throw err; }
          assert.equal(data1, data2);
          callback();
        });
      });
    }
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


  it('should clear the properties by Pager#clear', function (done) {
    var code = '}}}))))';
    pager.willEval(code).then(function () {
      assert.equal(pager.offset, 3);
      assert.equal(pager.limit, 4);
      pager.clear();
      assert.equal(pager.offset, 0);
      assert.equal(pager.limit, 0);
      done();
    });
  });

});
