'use strict';

module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    var config = {
        app: 'app',
        dist: 'dist',
        tmp: '.tmp'
    };

    grunt.initConfig({
        config: config,
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            server: {
                options: {
                    livereload: true
                },
                files: [
                    '<%= config.tmp %>/{,*/}*.html',
                    '<%= config.tmp %>/styles/{,*/}*.css',
                    '<%= config.app %>/scripts/{,*/}*.js',
                    '<%= config.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            },
            jade: {
                files: '<%= config.app %>/jade/**/*.jade',
                tasks: ['jade:html'],
                options: {
                    spawn: false //make sure not execute jade with forked child process
                }
            },
            // less: {
            //     files: '<%= config.app %>/styles/*.less',
            //     tasks: ['less:css']
            // }
            stylus: {
                files: '<%= config.app %>/styles/*.styl',
                tasks: ['stylus:compile']
            }
        },

        jade: {
            html: {
                options: {
                    client: false,
                    pretty: true,
                    basedir: '<%= config.app %>/jade'
                },
                files: [{
                    expand: true,
                    cwd: '<%= config.app %>/jade',
                    src: [
                        '{,*/}*.jade',
                        '!**/{layout,include}/*'
                    ],
                    dest: '<%= config.tmp %>',
                    ext: '.html'
                }]
            }
        },

        // less: {
        //     options: {
        //         paths: ['<%= config.app %>/styles'],
        //         ieCompat: true,
        //         sourceMap: true,
        //         sourceMapFilename: '<%= config.tmp %>/styles/styles.css.map',
        //         sourceMapURL: 'http://localhost:9000/styles/styles.css.map',
        //         sourceMapBasepath: '<%= config.app %>/styles'
        //     },
        //     css: {
        //         files: [{
        //             expand: true,
        //             cwd: '<%= config.app %>/styles',
        //             src: ['*.less'],
        //             dest: '<%= config.tmp %>/styles',
        //             ext: '.css'
        //         }]
        //     }
        // },

        stylus: {
            compile: {
                options: {
                    paths: ['<%= config.app %>/styles'],
                    // urlfunc: 'data-uri', // use data-uri('test.png') in our code to trigger Data URI embedding
                    firebug: true,
                    compress: false,
                    import: [      //  @import 'foo', 'bar/moo', etc. into every .styl file
                        'common/_normalize',       //  that is compiled. These might be findable based on values you gave
                        'common/_variables',    //  to `paths`, or a plugin you added under `use`
                        'common/_layout'    //  to `paths`, or a plugin you added under `use`
                    ]
                },
                files: [{
                    expand: true,
                    cwd: '<%= config.app %>/styles',
                    src: ['*.styl'],
                    dest: '<%= config.tmp %>/styles',
                    filter: 'isFile',
                    ext: '.css'
                }]
            }
        },

        jshint: {
            all: [
                'Gruntfile.js',
                'app/scripts/*.js'
            ],
            options: {
                jshintrc: '.jshintrc',
                //reporterOutput: '.tmp/report/jshint',
                reporter: require('jshint-stylish')
            }
        },

        csslint: {
            options: {
                csslintrc: '.csslintrc',
                formatters: [
                    {id: 'csslint-xml', dest: '.tmp/report/csslint.xml'}
                ]
            },
            src: [
                'app/styles/**/*.css',
                '!app/styles/ie.css'
            ]
        },

        filerev: {
            dist: {
                src: [
                    '<%= config.dist %>/scripts/**/*.js',
                    '<%= config.dist %>/styles/**/*.css',
                    '<%= config.dist %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}',
                    '<%= config.dist %>/styles/fonts/*'
                ]
            }
        },

        connect: {
            options: {
                port: 9000,
                open: false,
                // Change this to '0.0.0.0' to access the server from outside
                hostname: '0.0.0.0',
                livereload: true
            },
            rules: [
                {from: '^/$', to: 'my.html', redirect: 'permanent'}
            ],
            server: {
                options: {
                    base: ['<%= config.tmp %>', '<%= config.app %>'],
                    middleware: function (connect, options) {
                        if (!Array.isArray(options.base)) {
                            options.base = [options.base];
                        }

                        var middlewares = [
                            require('grunt-connect-rewrite/lib/utils').rewriteRequest,
                            require('grunt-connect-proxy/lib/utils').proxyRequest
                        ];

                        options.base.forEach(function (base) {
                            middlewares.push(connect.static(base));
                        });

                        var directory = options.directory || options.base[options.base.length - 1];
                        middlewares.push(connect.directory(directory));

                        return middlewares;
                    }
                },
                proxies: [{
                    context: [
                        '/Base/Action',
                    ],
                    host: 'localhost',
                    port: 8888,
                    https: false,
                    changeOrigin: false,
                    xforward: false,
                    headers: {}
                }]
            },
            dist: {
                options: {
                    open: true,
                    base: ['<%= config.dist %>']
                },
                livereload: false
            }
        },

        useminPrepare: {
            options: {
                dest: '<%= config.dist %>'
            },
            html: ['<%= config.tmp %>/{,*/}*.html']
        },

        usemin: {
            html: ['<%= config.dist %>/{,*/}*.html'],
            css: ['<%= config.dist %>/styles/{,*/}*.css'],
            options: {
                dirs: ['<%= config.dist %>']
            }
        },

        cssmin: {
            options: {
                compatibility: 'ie8'
            }
        },

        // Empties folders to start fresh
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '<%= config.tmp %>',
                        '<%= config.dist %>/*'
                    ]
                }]
            },
            server: '<%= config.tmp %>'
        },

        // Copies remaining files to places other tasks can use
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= config.app %>',
                    dest: '<%= config.dist %>',
                    src: [
                        'images/{,*/}*.{webp,jpg,png,gif,ico}'
                    ]
                }, {
                    expand: true,
                    dot: true,
                    cwd: '<%= config.tmp %>',
                    dest: '<%= config.dist %>',
                    src: ['{,*/}*.html']
                }, {
                    expand: true,
                    dot: true,
                    cwd: '<%= config.app %>',
                    dest: '<%= config.tmp %>',
                    src: ['scripts/**/*.js']
                }]
            }
        }
    });

    //compile corresponding jade files according to inheritance tree
    (function (grunt) {
        var JadeInheritance = require('jade-inheritance');
        var jadeFiles = [];
        var jadeTaskPrefix = 'jade.html';

        var analyzeJadeFile = grunt.util._.debounce(function () {
            var options = grunt.config(jadeTaskPrefix + '.options');
            var dependantFiles = [];

            var traverseInheritanceTree = function (tree) {
                if (tree instanceof Array) {
                    for (var i = 0; i < tree.length; i++) {
                        traverseInheritanceTree(tree[i]);
                    }
                    return;
                }

                for (var filePath in tree) {
                    var subTree = tree[filePath];
                    if (subTree.extendedBy === undefined
                        && subTree.includedBy === undefined) {
                        dependantFiles.push(filePath);
                    } else {
                        traverseInheritanceTree(subTree.extendedBy);
                        traverseInheritanceTree(subTree.includedBy);
                    }
                }
            };

            jadeFiles.forEach(function (filename) {
                var directory = options.basedir;
                var inheritance = new JadeInheritance(filename, directory, options);
                traverseInheritanceTree(inheritance.tree);
            });

            var config = grunt.config(jadeTaskPrefix + '.files')[0];
            config.src = dependantFiles;
            grunt.config(jadeTaskPrefix + '.files', [config]);

            jadeFiles = [];
        }, 200)

        grunt.event.on('watch', function (action, filepath, target) {
            if (target === 'jade') {
                jadeFiles.push(filepath);
                analyzeJadeFile();
            }
        });
    })(grunt);

    grunt.registerTask('lint', ['jshint', 'csslint']);

    grunt.registerTask('serve', function (target) {

        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            'jade',
            // 'less',
            'stylus',
            'configureRewriteRules',
            'configureProxies:server',
            'connect:server',
            'watch'
        ]);
    });

    grunt.registerTask('build', [
        //'lint',
        'clean:dist',
        'jade',
        // 'less',
        'stylus',
        'copy:dist',
        'useminPrepare',
        'concat',
        'cssmin',
        'uglify',
        //'filerev',
        'usemin'
    ]);
};
