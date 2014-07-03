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

    var bf = new Brainfuck();
    var test = function (code) {
      var d = Q.defer();
      pager.eval(code, function (err, data1) {
        if (err) { throw err; }
        bf.eval(code, function (err, data2) {
          if (err) { throw err; }
          assert.equal(data1, data2);
          d.resolve();
        });
      });
      return d.promise;
    };

    test(0).then(test(1)).then(test(2)).then(done);
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
