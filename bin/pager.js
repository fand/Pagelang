#!/usr/bin/env node

'use strict';
var db = require('./db');
var options = {};


// Parse options.
var command = require('commander');
command
  .usage('[options] <file ...>')
  .version('0.0.1')
  .option(
    '-D, --database [db]', 'specify db',
    function(val) {
      options.db = val;
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
      options.code = val;
    })
  .parse(process.argv);
