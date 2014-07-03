'use strict';

var mocha = require('mocha');
var assert = require('chai').assert;
var Q = require('q');

var DB = require('../lib/db');


describe('DB', function(){

  var db;

  before(function (done) {
    db = new DB({
      database: 'pager_test'
    });

    // Insert 10 records
    db.connect()
      .then(db.query.bind(db, 'TRUNCATE table user'))
      .then(db.query.bind(db, 'INSERT into user (name, age) VALUES (1, 1)'))
      .then(db.query.bind(db, 'INSERT into user (name, age) VALUES (2, 2)'))
      .then(db.query.bind(db,
        'INSERT into user ( \
          SELECT t1.id = NULL, t1.name, t1.age \
          FROM (user t1, user t2, user t3))'
      ))
      .then(function () {})  // ignore results of the last query
      .done(done);
  });

  after(function (done) {
    db.end().then(done);
  });

  it('should manage queries successfully', function (done) {
    db.query('select 1 + 1 AS solution', function (err, rows, fields) {
      if (err) { throw err; }
      assert.equal(rows[0].solution, 2);
      done();
    });
  });

  it('select from tables', function (done) {
    db.query('select * from user', function (err, rows, fields) {
      if (err) { throw err; }
      assert.equal(rows.length, 10, 'select all data from the table');

      var count1 = 0, count2 = 0;
      for (var i = 0; i < rows.length; i++) {
        if (rows[i].age === 1) count1++;
        if (rows[i].age === 2) count2++;
      }
      assert.equal(count1, count2);

      done();
    });
  });

  it('insert to the table', function (done) {
    var affectedRows;
    db.query('INSERT into user (name, age) VALUES (1, 1)')
      .then(function (result) {
        affectedRows = result.affectedRows;
      })
      .then(db.query.bind(db, 'SELECT * from user'))
      .then(function (rows, fields) {
        assert.equal(rows.length, 10 + affectedRows);
      })
      .then(db.query.bind(db, 'INSERT into user (name, age) VALUES (1, 1)'))
      .then(function (result) {
        affectedRows += result.affectedRows;
      })
      .then(db.query.bind(db, 'SELECT * from user'))
      .then(function (rows, fields) {
        assert.equal(rows.length, 10 + affectedRows);
      })
      .done(done);
  });

});
