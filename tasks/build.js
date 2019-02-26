const gulp = require('gulp')
const source = require('vinyl-source-stream')
const rename = require('gulp-rename')
const browserify = require('browserify')
const es = require('event-stream')

module.exports = function build(done) {
  const files = [
    { path: './app/src/main.js', name: 'main.bundle.js' },
    { path: './app/src/restaurant_info.js', name: 'restaurant_info.bundle.js' }
  ]

  const tasks = files.map(function (entry) {
    return browserify({ entries: [entry.path] })
      .transform("babelify", { presets: ["@babel/preset-env"] })
      .bundle()
      .pipe(source(entry.path))
      .pipe(rename(entry.name))
      .pipe(gulp.dest('./dist/js'));
  });

  es.merge(tasks).on('end', done);
}