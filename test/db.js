'use strict';

var mocha = require('mocha');
var assert = require('chai').assert;
var Q = require('q');

var DB = require('../lib/db');


describe('DB', function(){

  var db;

  before(function () {
    db = new DB();
  });

  beforeEach(function (done) {
    db.connect().then(done);
  });

  afterEach(function (done) {
    db.end().then(done);
  });

  it('should manage queries successfully', function (done) {
    db.query('select 1 + 1 AS solution', function (err, rows, fields) {
      if (err) { throw err; }
      assert.equal(rows[0].solution, 2);
      done();
    });
  });

});
