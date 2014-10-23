#!/usr/bin/env node

'use strict';
var Pager = require('../lib/pager');
var options = {};
var oneliner;


// Parse options.
var command = require('commander');
command
  .usage('[options] <file ...>')
  .version('0.0.1')
  .option(
    '-D, --database [database]', 'specify db',
    function(val) {
      options.database = val;
    })
  .option(
    '-t, --table [table]', 'specify table',
    function(val) {
      options.table = val;
    })
  .option(
    '-u, --user [username]', 'specify user',
    function(val) {
      options.user = val;
    })
  .option(
    '-p, --password [password]', 'specify password',
    function(val) {
      options.user = val;
    })
  .option(
    '-e, --eval [code]', 'run as one-liner',
    function(val) {
      oneliner = val;
    })
  .parse(process.argv);


var pager = new Pager(options);
if (oneliner) {
  if (!options.table) {
    console.error("Please specify table!");
    process.exit(1);
  }
  pager.setTable(options.table);
  pager
    .eval(oneliner)
    .then(function (res) {

      // By default, cli pager prints rows in the result.
      res.rows.forEach(function (rows) {
        console.log(rows);
      });

      process.exit();
    });
}
else {
  // var fs = require('fs');
  // fs.createReadableStream();
}
