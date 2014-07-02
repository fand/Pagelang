var gulp = require('gulp');
var plumber = require('gulp-plumber');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');

gulp.task('test', function () {
  return gulp.src('test/*.js')
    .pipe(plumber())
    .pipe(mocha({
      ui: 'bdd',
      reporter: 'spec',
      timeout: 100000
    }))
    .once('end', function () {
      process.exit();
    });
});

gulp.task('coverage', function () {
  return gulp.src(['lib/*.js'])
    .pipe(istanbul())
    .on('finish', function () {
      gulp.src(['test/*.js'])
        .pipe(mocha({
          ui: 'bdd',
          reporter: 'spec',
          timeout: 100000
        }))
        .pipe(istanbul.writeReports({
          dir: './coverage',
          reporters: ['lcov']
        }))
        .once('end', function () {
          process.exit();
        });
    });
});

gulp.task('watch', function () {
  gulp.watch(['lib/*.js', 'test/*.js'], ['test']);
});
gulp.task('default', ['watch']);
