//-------------------------------------
// Require Plugin
//-------------------------------------

const gulp = require('gulp');
const gulpIf = require('gulp-if');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const htmlmin = require('gulp-htmlmin');
const cssmin = require('gulp-cssmin');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const concat = require('gulp-concat');
const jsImport = require('gulp-js-import');
const sourcemaps = require('gulp-sourcemaps');
const htmlPartial = require('gulp-html-partial');
const clean = require('gulp-clean');
const autoprefixer = require('gulp-autoprefixer');
const isProd = process.env.NODE_ENV === 'prod';


//-------------------------------------
// DECLARE
//-------------------------------------

const input =  {
    html    : 'src/**/*.html',
    partials: 'src/partials/',
    scss    : 'src/scss/**/*.scss',
    js      : 'src/js/**/*.js',
    img     : 'src/images/**/*'
}

const output = {
    base_url:   'dist/*',
    css     :   'dist/css/',
    js      :   'dist/js/',
    img     :   'dist/images/',
    html    :   'dist/',
    min_css :   'styles.min.css',
    min_js  :   'main.min.js'
}

const sassOption = { 
    outputStyle : 'compressed',
    precision   : 10
}

const syncOption = { 
    stream : true
}
 
var onError = function(err) {
    console.log(err);
    this.emit('end');
}
//-------------------------------------
// TASK: Html Compile
//-------------------------------------

function html() {
  return gulp.src(input.html)
      .pipe(htmlPartial({
          basePath: input.partials
      }))
      .pipe(gulpIf(isProd, htmlmin({
          collapseWhitespace: true
      })))
      .pipe(gulp.dest(output.html));
}

//-------------------------------------
// TASK: Style Compile
//-------------------------------------


function css() {
  return gulp.src(input.scss)
      .pipe(gulpIf(!isProd, sourcemaps.init()))
      .pipe(sass({
          includePaths: ['node_modules']
      }).on('error', sass.logError))
      .pipe(autoprefixer())
      .pipe(concat(output.min_css)) 
      .pipe(gulpIf(!isProd, sourcemaps.write()))
      .pipe(gulpIf(isProd, cssmin()))
      .pipe(gulp.dest(output.css));
}
//-------------------------------------
// TASK: Javascript Compile
//-------------------------------------


function js() {
  return gulp.src(['node_modules/jquery/dist/jquery.min.js', 'node_modules/bootstrap/dist/js/bootstrap.min.js', input.js])
      .pipe(jsImport({
          hideConsole: true
      }))
      .pipe(concat(output.min_js))
      .pipe(gulpIf(isProd, uglify()))
      .pipe(gulp.dest(output.js));
}

//-------------------------------------
// TASK: Image Optimize
//-------------------------------------
function img() {
  return gulp.src(input.img)
      .pipe(gulpIf(isProd, imagemin()))
      .pipe(gulp.dest(output.img));
}

//-------------------------------------
// TASK: Watch
//-------------------------------------

function serve() {
  browserSync.init({
      open: true,
      server : {
        baseDir : './dist'
    },
  });
}

function browserSyncReload(done) {
  browserSync.reload();
  done();
}

function watchFiles() {
  gulp.watch('src/**/*.html', gulp.series(html, browserSyncReload));
  gulp.watch('src/**/*.scss', gulp.series(css, browserSyncReload));
  gulp.watch('src/**/*.js', gulp.series(js, browserSyncReload));
  gulp.watch('src/images/**/*.*', gulp.series(img));

  return;
}

function del() {
  return gulp.src(output.base_url, {read: false})
      .pipe(clean());
}
//-------------------------------------
// TASK: Default
//-------------------------------------

exports.css = css;
exports.html = html;
exports.js = js;
exports.del = del;
exports.serve = gulp.parallel(html, css, js, img, watchFiles, serve);
exports.default = gulp.series(del, html, css, js, img);