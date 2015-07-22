var gulp = require('gulp');
var browserify = require('browserify');
var reactify = require('reactify');
var source = require('vinyl-source-stream');


gulp.task('js', function() {
  browserify(['./src/js/list.js'])
    .transform(reactify)
    .bundle()
    .on('error', function(err) {
      console.log(err.message);
      //this.end();
    })
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./public/js/'));
});

gulp.task('watch', function() {
  gulp.watch(['src/**/*.js'], ['js']);
});

gulp.task('default', ['js', 'connect', 'watch']);
