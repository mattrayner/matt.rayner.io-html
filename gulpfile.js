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
    puglint = require('gulp-pug-lint'),
    uglify = require('gulp-uglify'),
    pump = require('pump'),
    mocha = require('gulp-mocha'),
    data = require('gulp-data'),
    sitemap = require('gulp-sitemap');

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

gulp.task('coffee', function() {
    return gulp.src(paths.scripts)
        .pipe(coffee({bare: true}).on('error', gutil.log))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./dist/js/'));
});

gulp.task('lint', function () {
    gulp.src(paths.scripts)
        .pipe(coffeelint())
        .pipe(coffeelint.reporter());

    return gulp.src(paths.pugs[0])
        .pipe(data({
            debug: false,
            baseUrl: '/',
            isLive: false
        }))
        .pipe(puglint());
});

gulp.task('sass', function () {
    return gulp.src(paths.styles)
        .pipe(sass().on('error', sass.logError))
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
        .pipe(puglint())
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
        .pipe(puglint())
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
        .pipe(puglint())
        .pipe(pug())
        .pipe(gulp.dest('./dist'));
});

gulp.task('uglify:plugins', function (cb) {
    pump([
            gulp.src(['./node_modules/foundation-sites/vendor/jquery/dist/jquery.min.js', './app/vendor/jquery.parallax.js', './node_modules/foundation-sites/dist/foundation.js', './node_modules/isotope-layout/dist/isotope.pkgd.js']),
            concat('concat.js'),
            rename('plugins.min.js'),
            uglify(),
            gulp.dest('./dist/js/')
        ],
        cb
    );
});

gulp.task('sitemap', function () {
    gulp.src('./dist/**/*.html', {
        read: false
    })
    .pipe(sitemap({
        siteUrl: 'https://matt.rayner.io/'
    }))
    .pipe(gulp.dest('./dist'));
});

// Rerun the task when a file changes
gulp.task('watch', function() {
    gulp.watch([paths.scripts, paths.styles, paths.pugs[0]], ['lint', 'coffee', 'sass', 'pug:local', 'sitemap']);
});