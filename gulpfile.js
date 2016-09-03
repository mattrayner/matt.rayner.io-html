'use strict';

var gulp = require('gulp'),
    coffee = require('gulp-coffee'),
    gutil = require('gulp-util'),
    coffeelint = require('gulp-coffeelint'),
    sass = require('gulp-sass'),
    cssmin = require('gulp-cssmin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    pug = require('gulp-pug'),
    uglify = require('gulp-uglify'),
    pump = require('pump'),
    mocha = require('gulp-mocha'),
    data = require('gulp-data');

var paths = {
    scripts: './app/coffee/**/*.coffee',
    styles: './app/scss/**/*.scss',
    pugs: ['./app/pug/**/*.pug', '!./app/pug/layout/**/*.pug']
};

gulp.task('default', function() {
    gulp.src('test.js', {read: false})
    // gulp-mocha needs filepaths so you can't have any plugins before it
        .pipe(mocha({reporter: 'nyan'}));

    gulp.start('lint', 'coffee', 'sass', 'pug:local', 'uglify:plugins');
});

gulp.task('build:live', function() {
    gulp.start('lint', 'coffee', 'sass', 'pug:live', 'uglify:plugins');
});

gulp.task('build:dev', function() {
    gulp.start('lint', 'coffee', 'sass', 'pug:dev', 'uglify:plugins');
});

gulp.task('coffee', function(cb) {
    gulp.src(paths.scripts)
        .pipe(coffee({bare: true}).on('error', gutil.log))
        .pipe(gulp.dest('./app/coffee/compiled'));

    pump([
            gulp.src('./app/coffee/compiled/**/*.js'),
            uglify(),
            rename({suffix: '.min'}),
            gulp.dest('./dist/js/')
        ],
        cb
    );
});

gulp.task('lint', function () {
    gulp.src(paths.scripts)
        .pipe(coffeelint())
        .pipe(coffeelint.reporter())
});

gulp.task('sass', function () {
    gulp.src('./app/scss/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./app/scss/compiled'));

    return gulp.src(['./app/scss/compiled/**/*.css', '!./app/scss/compiled/**/*.min.css'])
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./dist/css/'));
});

gulp.task('cssmin', function () {
    gulp.src(['./app/scss/compiled/**/*.css', '!./app/scss/compiled/**/*.min.css'])
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./dist/css/'));
});

gulp.task('pug:local', function buildHTML() {
    return gulp.src(paths.pugs)
        .pipe(data({
            debug: false,
            baseUrl: '/',
            isLive: false
        }))
        .pipe(pug())
        .pipe(gulp.dest('./dist'));
});

gulp.task('pug:dev', function buildHTML() {
    return gulp.src(paths.pugs)
        .pipe(data({
            debug: false,
            baseUrl: 'https://dev.matt.rayner.io/',
            isLive: false
        }))
        .pipe(pug())
        .pipe(gulp.dest('./dist'));
});

gulp.task('pug:live', function buildHTML() {
    return gulp.src(paths.pugs)
        .pipe(data({
            debug: false,
            baseUrl: 'https://matt.rayner.io/',
            isLive: true
        }))
        .pipe(pug())
        .pipe(gulp.dest('./dist'));
});

gulp.task('uglify:plugins', function (cb) {
    pump([
            gulp.src(['./app/vendor/modernizr/modernizr.min.js', './node_modules/foundation-sites/vendor/jquery/dist/jquery.min.js', './app/vendor/jquery.parallax.js', './node_modules/foundation-sites/dist/foundation.min.js', './node_modules/waypoints/lib/noframework.waypoints.js']),
            concat('concat.js'),
            gulp.dest('./dist/js/'),
            rename('plugins.min.js'),
            uglify(),
            gulp.dest('./dist/js/')
        ],
        cb
    );
});

// Rerun the task when a file changes
gulp.task('watch', function() {
    gulp.watch(paths.scripts, ['lint', 'coffee', 'uglify']);
    gulp.watch(paths.styles, ['sass', 'cssmin']);
    gulp.watch(paths.pugs, ['pug:local']);
});