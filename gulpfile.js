// var gulp = require('gulp'),
//     coffee = require('gulp-coffee'), // Languages
//     sass = require('gulp-sass'),
//     pug = require('gulp-pug'),
//     uglify = require('gulp-uglify'), // Minification
//     cssmin = require('gulp-cssmin'),
//     coffeelint = require('gulp-coffeelint'), // Linters
//     puglint = require('gulp-pug-lint'),
//     rename = require('gulp-rename'),
//     concat = require('gulp-concat'),
//     data = require('gulp-data'),
//     pump = require('pump'),
//     critical = require('critical').stream,
//     rev = require("gulp-rev"), // Cache Busting
//     revReplace = require("gulp-rev-replace"),
//     revdel = require('gulp-rev-delete-original'),
//     fs = require('fs');

var gulp = require("gulp"),
    coffee = require('gulp-coffee'), // Languages
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    pug = require('gulp-pug'),
    coffeelint = require('gulp-coffeelint'), // Linters
    puglint = require('gulp-pug-lint'),
    gutil = require('gulp-util'), // Utilities
    rename = require("gulp-rename"),
    postcss = require("gulp-postcss"),
    concat = require('gulp-concat'),
    autoprefixer = require("autoprefixer"),
    cssnano = require("cssnano"),
    sourcemaps = require("gulp-sourcemaps"),
    browserSync = require('browser-sync').create(),
    moment = require('moment'),
    data = require('gulp-data'),
    sitemap = require('gulp-sitemap'),
    critical = require('critical').stream,
    rev = require("gulp-rev"), // Cache Busting
    revReplace = require("gulp-rev-replace"),
    revdel = require('gulp-rev-delete-original'),
    fs = require('fs');

var debug   = process.env.DEBUG    || false;
var baseUrl = process.env.BASE_URL || "./";
var isLive  = process.env.IS_LIVE  || true;

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
    html: paths.raw.dist+'/*.html'
};


var get_data_file = function(){
    var json = JSON.parse(
        fs.readFileSync('./app/data/data.json')
    );
    json.moment = moment;

    return json;
};

function html() {
    var pug_data = get_data_file();

    pug_data.debug = debug;
    pug_data.baseUrl = baseUrl;
    pug_data.isLive = isLive;

    return gulp.src(paths.pugs.in)
        .pipe(data(pug_data))
        .pipe(puglint())
        .pipe(pug({}))
        .pipe(gulp.dest(paths.pugs.out))
        .pipe(browserSync.reload({ stream: true }));
}

function assets() {
    gulp
        .src(paths.scss.in)
        // Initialize sourcemaps before compilation starts
        .pipe(sourcemaps.init())
        .pipe(sass({ outputStyle: 'compressed' })
            .on("error", sass.logError))
        // Use postcss with autoprefixer and compress the compiled file using cssnano
        .pipe(postcss([autoprefixer({ cascade: false }), cssnano()]))
        // Now add/write the sourcemaps
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(paths.scss.out));

    gulp
        .src(paths.css.in)
        .pipe(rev())
        .pipe(gulp.dest(paths.css.out))
        .pipe(revdel())
        .pipe(rev.manifest({ merge: true }))
        .pipe(gulp.dest('.'))
        // Add browsersync stream pipe after compilation
        .pipe(browserSync.stream());

    gulp.src(paths.coffee.in)
        .pipe(coffeelint())
        .pipe(coffeelint.reporter())
        .pipe(coffee({bare: true}).on('error', gutil.log))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(paths.coffee.out));

    gulp.src(paths.js.in)
        .pipe(uglify())
        .pipe(gulp.dest(paths.js.out));

    gulp.src(['./node_modules/jquery/dist/jquery.min.js', './app/vendor/jquery.parallax.js', './node_modules/foundation-sites/dist/js/foundation.js', './node_modules/isotope-layout/dist/isotope.pkgd.js'])
        .pipe(concat('concat.js'))
        .pipe(rename('plugins.min.js'))
        .pipe(gulp.dest(paths.coffee.out));

    gulp.src(paths.js.in)
        .pipe(rev())
        .pipe(gulp.dest(paths.js.out))
        .pipe(revdel())
        .pipe(rev.manifest({ merge: true }))
        .pipe(gulp.dest('.'));

    var manifest = gulp.src("./rev-manifest.json");

    return gulp.src(paths.html)
        .pipe(revReplace({
            manifest: manifest
        }))
        .pipe(gulp.dest(paths.dist))
        .pipe(browserSync.stream());
}

function buildSitemap() {
    return gulp.src(paths.html, { read: false })
        .pipe(sitemap({
            siteUrl: baseUrl,
            changefreq: 'monthly'
        }))
        .pipe(gulp.dest(paths.dist));
}

function calculateCritical() {
    return gulp.src(paths.html)
        .pipe(critical({base: paths.dist, inline: true, minify: true, width: 1300, height: 900}))
        .pipe(gulp.dest(paths.dist));
}


// A simple task to reload the page
function reload() {
    browserSync.reload();
}

// Add browsersync initialization at the start of the watch task
function watch() {
    browserSync.init({
        // You can tell browserSync to use this directory and serve it as a mini-server
        server: {
            baseDir: "./dist"
        }
        // If you are already serving your website locally using something like apache
        // You can use the proxy setting to proxy that instead
        // proxy: "yourlocal.dev"
    });
    gulp.watch(paths.scss.in, assets);
    gulp.watch(paths.pugs.in, html);
    gulp.watch(paths.coffee.in, assets);
    gulp.watch(paths.html, reload);
}

/*
 * Specify if tasks run in series or parallel using `gulp.series` and `gulp.parallel`
 */
var build = gulp.series(html, assets);
var build_watch = gulp.parallel(gulp.series(html, assets), watch);
var release = gulp.series(html, assets, buildSitemap, calculateCritical);

// Don't forget to expose the task!
exports.watch = watch;

// Expose the task by exporting it
// This allows you to run it from the commandline using
// $ gulp style
exports.assets = assets;
exports.html = html;
exports.build = build;
exports.watch = build_watch;
exports.release = release;

/*
 * Define default task that can be called by just running `gulp` from cli
 */
gulp.task('default', build);
