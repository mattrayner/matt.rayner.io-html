'use strict';

// Import all of our gulp helpers
var gulp = require('gulp'),
    coffee = require('gulp-coffee'), // Languages
    sass = require('gulp-sass'),
    pug = require('gulp-pug'),
    mocha = require('gulp-mocha'),
    uglify = require('gulp-uglify'), // Minification
    cssmin = require('gulp-cssmin'),
    coffeelint = require('gulp-coffeelint'), // Linters
    puglint = require('gulp-pug-lint'),
    gutil = require('gulp-util'), // Utilities
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    sitemap = require('gulp-sitemap'),
    download = require('gulp-download'),
    data = require('gulp-data'),
    pump = require('pump'),
    critical = require('critical').stream,
    rev = require("gulp-rev"), // Cache Busting
    revReplace = require("gulp-rev-replace"),
    revdel = require('gulp-rev-delete-original'),
    fs = require('fs');

// Reusable path strings
var paths = {
    raw: {
        dist:   './dist/',
        coffee: './app/coffee/',
        scss:   './app/scss/',
        pug:    './app/pug/',
        build:  'build/'
    }
};
paths = {
    dist: paths.raw.dist,
    coffee: {
        in:  paths.raw.coffee+'**/*.coffee',
        out: paths.raw.coffee+paths.raw.build
    },
    js: {
        in: paths.raw.coffee+paths.raw.build+'**/*.js',
        out: paths.raw.dist+'js/'
    },
    scss: {
        in:  paths.raw.scss+'**/*.scss',
        out: paths.raw.scss+paths.raw.build
    },
    css: {
        in:  paths.raw.scss+paths.raw.build+'**/*.css',
        out: paths.raw.dist+'css/'
    },
    pugs: {
        in:  [paths.raw.pug+'**/*.pug', '!'+paths.raw.pug+'layout/**/*.pug'],
        out: paths.raw.dist
    },
    html: paths.raw.dist+'/**/*.html'
};


// Default task ran when you type `gulp`
gulp.task('default', function() {
    gulp.src('test.js', {read: false})
        .pipe(mocha({reporter: 'nyan'}));

    gulp.start('build:local');
});


// Main shared tasks
gulp.task('build:shared', function(){
    return gulp.start('lint', 'dist:assets');
});

// Local development
gulp.task('build:local', function(){
    return gulp.start('pug:local', 'build:shared')
});

// Development deploy
gulp.task('build:dev', function() {
    // return gulp.start('lint', 'coffee', 'sass', 'pug:dev', 'uglify:plugins', 'fetch-newest-analytics');
    return gulp.start('pug:dev', 'build:shared')
});

// Live server
gulp.task('build:live', function() {
    // return gulp.start('lint', 'coffee', 'sass', 'pug:live', 'uglify:plugins', 'fetch-newest-analytics');
    return gulp.start('pug:live', 'build:shared')
});


// Build pug files for different setups
gulp.task('pug:local', function buildHTML() {
    var pug_data = get_data_file();

    pug_data.debug = false;
    pug_data.baseUrl = '/';
    pug_data.isLive = false;

    return build_pug_files(pug_data)
});

gulp.task('pug:dev', function buildHTML() {
    var pug_data = get_data_file();

    pug_data.debug = false;
    pug_data.baseUrl = '/';
    pug_data.isLive = false;

    return build_pug_files(pug_data)
});

gulp.task('pug:live', function buildHTML() {
    var pug_data = get_data_file();

    pug_data.debug = false;
    pug_data.baseUrl = '/';
    pug_data.isLive = true;

    return build_pug_files(pug_data)
});

// Compile our pug files using the data passed
var build_pug_files = function(data_value){
    return gulp.src(paths.pugs.in)
        .pipe(data(data_value))
        .pipe(puglint())
        .pipe(pug())
        .pipe(gulp.dest(paths.pugs.out));
};

var get_data_file = function(){
    var json = JSON.parse(
        fs.readFileSync('./app/data/data.json')
    );
    json.moment = require('moment');

    return json;
};


// Process all assets, starting with HTML
gulp.task("dist:assets", ['dist:js'], function(){
    var manifest = gulp.src("./rev-manifest.json");

    return gulp.src(paths.html)
        .pipe(revReplace({
            manifest: manifest
        }))
        .pipe(gulp.dest(paths.dist));
});


// Compile our CSS (but first compile out sass)
gulp.task("dist:css", ['sass'], function(){
    return gulp.src(paths.css.in)
        .pipe(rev())
        .pipe(gulp.dest(paths.css.out))
        .pipe(revdel())
        .pipe(rev.manifest())
        .pipe(gulp.dest('.'))
});

// Compile our SASS and minify
gulp.task('sass', function () {
    return gulp.src(paths.scss.in)
        .pipe(sass().on('error', sass.logError))
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(paths.scss.out))
});


// Compile out JS (but first download analytics, compile coffee and uglify plugins)
gulp.task("dist:js", ['dist:css', 'fetch-analytics', 'coffee', 'uglify:plugins'], function(){
    return gulp.src(paths.js.in)
        .pipe(rev())
        .pipe(gulp.dest(paths.js.out))
        .pipe(revdel())
        .pipe(rev.manifest({ merge: true }))
        .pipe(gulp.dest('.'))
});

// Fetch the latest analytics file from google and cache it locally (for google pagespeed)
gulp.task('fetch-analytics', function() {
    return download('https://www.google-analytics.com/analytics.js')
        .pipe(gulp.dest(paths.coffee.out))
});

// Compile our coffee script files
gulp.task('coffee', function() {
    return gulp.src(paths.coffee.in)
        .pipe(coffee({bare: true}).on('error', gutil.log))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(paths.coffee.out))
});

// Uglify all of our plugins into one file
gulp.task('uglify:plugins', function (cb) {
    pump([
            gulp.src(['./node_modules/jquery/dist/jquery.min.js', './app/vendor/jquery.parallax.js', './node_modules/foundation-sites/dist/foundation.js', './node_modules/isotope-layout/dist/isotope.pkgd.js']),
            concat('concat.js'),
            rename('plugins.min.js'),
            gulp.dest(paths.coffee.out)
        ],
        cb
    );
});


// Lint our pug application files (but first our coffee files)
gulp.task('lint', ['lint:coffee'], function () {
    return gulp.src(paths.pugs.in[0])
        .pipe(data({
            debug: false,
            baseUrl: '/',
            isLive: false
        }))
        .pipe(puglint());
});

// Lint our coffee files
gulp.task('lint:coffee', function () {
    return gulp.src(paths.coffee.in)
        .pipe(coffeelint())
        .pipe(coffeelint.reporter());
});


// Generate a sitemap for our site
gulp.task('build:sitemap', function () {
    gulp.src(paths.html, {
        read: false
    })
    .pipe(sitemap({
        siteUrl: 'https://matt.rayner.io/',
        changefreq: 'monthly'
    }))
    .pipe(gulp.dest(paths.dist));
});


// Determine the 'critical' CSS we need for first page load
gulp.task('build:critical', function (cb) {
    return gulp.src(paths.html)
        .pipe(critical({base: paths.dist, inline: true, minify: true, width: 320, height: 480}))
        .on('error', function(err) { console.log(err.message); })
        .pipe(gulp.dest(paths.dist));
});


// Rerun the default when a file changes
gulp.task('watch', function() {
    gulp.watch([paths.coffee.in, paths.scss.in, paths.pugs.in[0]], ['default']);
});