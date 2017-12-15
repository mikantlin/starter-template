// TODO: font optimising, babel JS conversion

// Gulp and utilities
const gulp = require('gulp');
const pump = require('pump');
const gulpIf = require('gulp-if');
const useref = require('gulp-useref');
const runSequence = require('run-sequence');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');

// HTML processing
const htmlhint = require('gulp-htmlhint');

// CSS processing
const sass = require('gulp-sass');
const cssnano = require('gulp-cssnano');
const autoprefixer = require('gulp-autoprefixer');

// JS processing
const jshint = require('gulp-jshint');
const uglify = require('gulp-uglify');

// Image processing
const imagemin = require('gulp-imagemin');
const cache = require('gulp-cache');

// Testing
const browserSync = require('browser-sync').create();

// Support tasks
gulp.task('htmlhint', (cb) => {
  pump(
    [
      gulp.src('src/*.html'),
      htmlhint(),
      htmlhint.reporter()
    ],
    cb
  );
});


gulp.task('sass', (cb) => {
  pump(
    [
      gulp.src('src/scss/**/*.scss'),
      sourcemaps.init(),
      sass().on('error', sass.logError),
      sourcemaps.write(),
      autoprefixer(),
      gulp.dest('src/css'),
      browserSync.reload({
        stream: true
      }),
    ],
    cb
  );
});

gulp.task('jshint', (cb) => {
  pump(
    [
      gulp.src('src/js/*.js'),
      jshint(),
      jshint.reporter('default')
    ],
    cb
  );
});

gulp.task('images', (cb) => {
  pump(
    [
      gulp.src('src/img/**/*.+(png|jpg|gif|svg)'),
      cache(imagemin()),
      gulp.dest('dist/img')
    ],
    cb
  );
});

gulp.task('browserSync', () => {
  browserSync.init({
    server: {
      baseDir: 'src',
    },
    port: 3030,
    https: true,
  })
});

gulp.task('useref', (cb) => {
  pump([
    gulp.src('src/*.html'),
    useref(),
    gulpIf('*.js', uglify()),
    gulpIf('*.css', cssnano()),
    gulp.dest('dist'),
    ],
    cb
  );
});

gulp.task('clean:dist', function() {
  return del.sync('dist');
})

gulp.task('cache:clear', function (callback) {
  return cache.clearAll(callback)
})

gulp.task('watch', ['browserSync','htmlhint','jshint','sass'], () => {
  gulp.watch('src/scss/**/*.scss', ['sass']);
  gulp.watch('src/*.html', ['htmlhint', browserSync.reload]);
  gulp.watch('src/js/**/*.js', ['jshint', browserSync.reload]);
});

// Main tasks
// Development
gulp.task('default', function (callback) {
  runSequence(['htmlhint','jshint','sass','browserSync', 'watch'],
    callback
  )
})

// Live
gulp.task('build', function (callback) {
  runSequence('clean:dist',
    ['sass', 'useref', 'images'],
    callback
  )
})