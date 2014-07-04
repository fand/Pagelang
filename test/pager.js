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
    pager.setTable('user');
  });

  after(function () {

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
          assert.equal(data1.output, data2);
          d.resolve();
        });
      });
      return d.promise;
    };

    test(codes[0])
      .then(test.bind(null, codes[1]))
      .then(test.bind(null, codes[2]))
      .then(done);
  });

  it('should return same outputs in callback and promise', function (done) {
    var code = '++++++++[>++++++++<-]>+.+.+.';
    var answer = 'ABC';
    pager.eval(code, function (err, result1) {
      if (err) { throw err; }
      pager.eval(code).then(function (result2) {
        assert.equal(result1.output, result2.output);
      }).done(done);
    });
  });

  it('should clear the properties by Pager#clear', function (done) {
    var code = '}}}))))';
    pager.eval(code).then(function () {
      assert.equal(pager.offset, 3);
      assert.equal(pager.limit, 4);
      pager.clear();
      assert.equal(pager.offset, 0);
      assert.equal(pager.limit, 0);
      done();
    });
  });

  it('should select correct range', function (done) {
    var code = '}}}))))v';
    pager.eval(code).then(function (result) {
      assert.equal(result.rows[0].length, 4);
      done();
    });
  });

});
