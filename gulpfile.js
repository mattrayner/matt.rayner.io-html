'use strict';

var gulp = require('gulp'),
    coffee = require('gulp-coffee'),
    coffeelint = require('gulp-coffeelint'),
    sass = require('gulp-sass'),
    cssmin = require('gulp-cssmin'),
    rename = require('gulp-rename'),
    pug = require('gulp-pug'),
    uglify = require('gulp-uglify'),
    pump = require('pump'),
    mocha = require('gulp-mocha'),
    modernizr = require('gulp-modernizr');

gulp.task('default', function() {
    gulp.src('test.js', {read: false})
    // gulp-mocha needs filepaths so you can't have any plugins before it
        .pipe(mocha({reporter: 'nyan'}))
});

gulp.task('coffee', function() {
    gulp.src('./src/*.coffee')
        .pipe(coffee({bare: true}).on('error', gutil.log))
        .pipe(gulp.dest('./public/'));
});

gulp.task('lint', function () {
    gulp.src('./src/*.coffee')
        .pipe(coffeelint())
        .pipe(coffeelint.reporter())
});

gulp.task('sass', function () {
    return gulp.src('./sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./css'));
});

gulp.task('sass:watch', function () {
    gulp.watch('./sass/**/*.scss', ['sass']);
});

gulp.task('default', function () {
    gulp.src('src/**/*.css')
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('dist'));
});

gulp.task('views', function buildHTML() {
    return gulp.src('views/*.pug')
        .pipe(pug({
            // Your options in here.
        }))
});

gulp.task('compress', function (cb) {
    pump([
            gulp.src('lib/*.js'),
            uglify(),
            gulp.dest('dist')
        ],
        cb
    );
});

gulp.task('modernizr', function() {
    gulp.src('./js/*.js')
        .pipe(modernizr())
        .pipe(gulp.dest("build/"))
});