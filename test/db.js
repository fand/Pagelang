'use strict';

var mocha = require('mocha');
var assert = require('chai').assert;
var Q = require('q');

var DB = require('../lib/db');


describe('DB', function(){

  var db;

  beforeEach(function (done) {
    db = new DB({
      database: 'pager_test'
    });

    // Insert 10 records
    db.connect()
      .then(db.query.bind(db, 'CREATE DATABASE IF NOT EXISTS pager_test'))
      .then(db.query.bind(db, 'CREATE TABLE IF NOT EXISTS pager_test.user( id int auto_increment, name text, age int, primary key(id) )'))
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

  it('update the records by field condition', function (done) {
    db.query('UPDATE user set age = 10')
      .then(function (result) {
        assert.equal(result.affectedRows, 10);
      })
      .then(db.query.bind(db, 'SELECT count from (SELECT count(*) as count, age from user group by age) as u where age = 10'))
      .then(function (rows) {
        assert.equal(rows[0].count, 10);
      })
      .done(done);
  });

  it('update the records by range', function (done) {
    db.query('UPDATE user t1 JOIN (SELECT * from user limit 3, 4) t2 ON t1.id = t2.id set t1.age = 20')
      .then(function (result) {
        assert.equal(result.affectedRows, 4, 'the number of affectedRows reported is correct');
      })
      .then(db.query.bind(db, 'SELECT count from (SELECT count(*) as count, age from user group by age) as u where age = 20'))
      .then(function (rows) {
        assert.equal(rows[0].count, 4, 'the number of updated rows is correct');
      })
      .then(db.query.bind(
        db,
        'select count from (select COALESCE(count(*), 0) as count, age from (select * from user limit 0, 3) as t2 group by age) as t1 where age = 20'
      ))
      .then(function (rows) {
        assert.deepEqual(rows, []);
      })
      .then(db.query.bind(
        db,
        'select count from (select COALESCE(count(*), 0) as count, age from (select * from user limit 3, 4) as t2 group by age) as t1 where age = 20'
      ))
      .then(function (rows) {
        assert.equal(rows[0].count, 4);
      })
      .then(db.query.bind(
        db,
        'select count from (select COALESCE(count(*), 0) as count, age from (select * from user limit 7, 3) as t2 group by age) as t1 where age = 20'
      ))
      .then(function (rows) {
        assert.deepEqual(rows, []);
      })
      .done(done);
  });
});
