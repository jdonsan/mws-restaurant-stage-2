'use strict';

const { series, watch  } = require('gulp')
const gulp = require('gulp')
const source = require('vinyl-source-stream')
const rename = require('gulp-rename')
const browserify = require('browserify')
const es = require('event-stream')
const browserSync = require('browser-sync').create()

function bundleTask(done) {
  const files = [
    './js/main.js',
    './js/restaurant_info.js'
  ];

  const tasks = files.map(function (entry) {
    return browserify({ entries: [entry] })
      .transform("babelify", { presets: ["@babel/preset-env"] })
      .bundle()
      .pipe(source(entry))
      .pipe(rename({ extname: '.bundle.js' }))
      .pipe(gulp.dest('./dist'));
  });

  es.merge(tasks).on('end', done);
}

function browserSynTask() {
  browserSync.init({
    server: {
      baseDir: "./dist"
    }
  })
}

watch(['js/*.js'], bundleTask);
exports.js = bundleTask
exports.default = series(bundleTask, browserSynTask)
