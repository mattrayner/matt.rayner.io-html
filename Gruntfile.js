module.exports = function(grunt) {

    var pugFiles = [{
        cwd: "app/pug",
        src: ["**/*.pug", "!layout/**/*.pug"],
        dest: "dist",
        expand: true,
        ext: ".html"
    }];

    grunt.initConfig({
        pug: {
            local: {
                options: {
                    data: {
                        debug: false,
                        baseUrl: '/',
                        isLive: false
                    }
                },
                files: pugFiles
            },
            dev: {
                options: {
                    data: {
                        debug: false,
                        baseUrl: 'https://dev.matt.rayner.io/',
                        isLive: false
                    }
                },
                files: pugFiles
            },
            live: {
                options: {
                    data: {
                        debug: false,
                        baseUrl: 'https://matt.rayner.io/',
                        isLive: true
                    }
                },
                files: pugFiles
            }
        },
        sass: {
            dist: {
                options: {
                    sourceMap: true
                },
                files: [{
                    expand: true,
                    cwd: "app/scss",
                    src: ["**/*.scss"],
                    dest: "app/scss/compiled",
                    ext: ".css"
                }]
            }
        },
        cssmin: {
            options: {
                shorthandCompacting: false,
                roundingPrecision: -1
            },
            target: {
                files: [{
                    expand: true,
                    cwd: 'app/scss/compiled',
                    src: ['**/*.css', '!*.min.css'],
                    dest: 'dist/css/',
                    ext: '.min.css'
                }]
            }
        },
        coffee: {
            compile: {
                files: [{
                    expand: true,
                    cwd: "app/coffee/",
                    src: ["**/*.coffee"],
                    dest: "app/coffee/compiled/",
                    ext: ".js"
                }]
            }
        },
        coffeelint: {
            coffee: ['app/coffee/*.coffee'] // lint all CoffeeScript files
        },
        modernizr: {
            dist: {
                crawl: false,
                customTests: [],
                dest: 'app/vendor/modernizr/modernizr.min.js',
                tests: [
                    'svg',
                    'cssmask',
                    'multiplebgs',
                    'svgasimg',
                    'inlinesvg'
                ],
                options: [
                    'setClasses'
                ],
                uglify: true
            }
        },
        uglify: {
            js: {
                options: {
                    sourceMap: true
                },
                files: [{
                    'dist/js/plugins.min.js': ['app/vendor/modernizr/modernizr.min.js', 'node_modules/foundation-sites/vendor/jquery/dist/jquery.min.js', 'app/vendor/jquery.parallax.js', 'node_modules/foundation-sites/dist/foundation.min.js']
                },
                {
                    expand: true,
                    cwd: "app/coffee/compiled",
                    src: ["**/*.js"],
                    dest: "dist/js/",
                    ext: ".min.js"
                }
                ]
            }
        },
        mocha: {
            test: {
                src: ['tests/**/*.html']
            }
        },
        watch: {
            pug: {
                files: ['app/pug/**/*.pug'],
                tasks: 'pug:local'
            },
            coffee: {
                files: ['app/coffee/*.coffee'],
                tasks: ['coffeelint', 'coffee', 'modernizr', 'uglify']
            },
            css: {
                files: 'app/scss/*.scss',
                tasks: ['sass', 'cssmin'],
                options: {
                    livereload: true
                }
            }
        },
        'sftp-deploy': {
            dev: {
                auth: {
                    host: 'dev.matt.rayner.io',
                    port: 22,
                    authKey: 'server'
                },
                cache: 'sftpCache.json',
                src: 'dist',
                dest: '/var/www/vhosts/dev.matt.rayner.io',
                serverSep: '/',
                concurrency: 1,
                progress: true
            },
            live: {
                auth: {
                    host: 'matt.rayner.io',
                    port: 22,
                    authKey: 'server'
                },
                cache: 'sftpCache.json',
                src: 'dist',
                dest: '/var/www/vhosts/matt.rayner.io',
                exclusions: ['dist/*.map'],
                serverSep: '/',
                concurrency: 1,
                progress: true
            }
        }
    });

    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    grunt.registerTask('default', ['build']);
    grunt.registerTask('build-assets', ['sass', 'cssmin', 'coffeelint', 'coffee', 'modernizr', 'uglify']);
    grunt.registerTask('build', ['pug:local', 'build-assets']);
    grunt.registerTask('build-dev', ['pug:dev', 'build-assets']);
    grunt.registerTask('build-live', ['pug:live', 'build-assets']);
    grunt.registerTask('test', ['coffeelint', 'mocha']);
};