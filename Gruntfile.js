module.exports = function(grunt) {
    
    var static_dir = 'root/static/';
    var ia_dir = 'src/ia/';
    var templates_dir = 'src/templates/';
    var ddgc_dir = 'src/ddgc/';

    // tasks that run after diff
    // to release a new version
    var release_tasks = [
        'build',
        'cssmin:ddgc_css',
        'cssmin:ia_css',
        'version:release',
        'removelogging',
        'uglify:js',
        'remove',
    ];

    // commit files for release
    var commit_tasks = [
        'gitcommit:ia_pages'
    ];

    // tasks that run when building
    var build_tasks = [
        'handlebars:compile',
        'compass',
        'concat',
    ];

    var ia_page_js = [
        'handlebars_tmp',
        'DDH.js',
        'IAIndex.js',
        'IAPage.js',
        'IAPageCommit.js',
        'ready.js'
    ];

    for( var file in ia_page_js ){
        ia_page_js[file] = ia_dir + 'js/' + ia_page_js[file];
    }

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        static_dir: static_dir,
        ia_dir: ia_dir,
        ddgc_dir: ddgc_dir,
        templates_dir: templates_dir,
        release_tasks: release_tasks,

        /*
         * increases the version number in package.json
         */
        version: {
            release: {
                options: {
                    release: 'minor'
                },
                src: ['package.json']
            }
        },

        /*
         * concat js files in ia_js_dir and copy to static_dir
         */
        concat: {
            ia_pages: {
                src: [templates_dir+'handlebars_tmp', ia_page_js],
                dest: static_dir + 'js/ia.js'
            },
            ddgc_pages: {
                src: ddgc_dir + 'js/*.js',
                dest: static_dir + 'js/ddgc.js'
            },
            ia_css: {
                src: ia_dir + 'css/*.css',
                dest: static_dir + 'css/ia.css'
            },
            ddgc_css: {
                src: ddgc_dir + 'css/*.css',
                dest: static_dir + 'css/ddgc.css'
            }
        },

        /*
         * Compiles handlebar templates and add to Handlebars.templates namespace
         */
        handlebars: {
            compile: {
                options: {
                    namespace: "Handlebars.templates",
                    processName: function(filepath) {
                        var parts = filepath.split('/');
                        return parts[parts.length - 1].replace('.handlebars','');
                    }
                },
                files: {
                    '<%= templates_dir %>/handlebars_tmp' : '<%= templates_dir %>/*.handlebars'
                }
            }
        },

        /*
         * uglify ia.js and give it a version number for release
         */
        uglify: {
            js: {
                files: {
                    '<%= static_dir + "js/ia" +  pkg.version %>.js': static_dir + 'js/ia.js', 
                    '<%= static_dir + "js/ddgc" +  pkg.version %>.js': static_dir + 'js/ddgc.js' 
                }
            }
        },

        /*
         * removes dev versions of JS and CSS files
         */
        remove: {
            default_options: {
                trace: true,
                fileList: [ 
                    static_dir + 'js/ia.js', 
                    templates_dir + 'handlebars_tmp',
                    static_dir + 'js/ddgc.js',
                    static_dir + 'css/ddgc.css',
                    static_dir + 'css/ia.css'
                ]
            }
        },

        /*
         * for release check ia.js to see if it has changed.  If true then
         * run the tasks.  If not then stop here.
         */
        diff: {
            ia_js: {
                src: [ ],
               // src: [ static_dir + 'ia.js'],
                tasks: release_tasks
            } 
        },

        /*
         * commits the ia.js version file and package.json
         * still needs to be pushed
         */
        gitcommit: {
            ia_pages: {
                options: {
                    message: 'Release IA pages version: <%= pkg.version %>'
                },
                files: {
                    src: [ 
                        static_dir + 'js/ia<%= pkg.version %>.js', 
                        static_dir + 'js/ddgc<%= pkg.version %>.js', 
                        static_dir + 'css/ddgc<%= pkg.version %>.css',
                        static_dir + 'css/ia<%= pkg.version %>.css',
                        'package.json',  
                    ]
                }
            }
        
        },

        /*
         * removes console.log
         */
        removelogging: {
            dist: {
                src: static_dir + 'js/ia.js'
            }
        },

        /*
         * not used yet
         */
        compass: {
            dist: {
                options: {
                    ia: {
                        cssDir: 'src/ia/css'
                    },
                    ddgc:{
                        cssDir: 'src/ddgc/css'
                    }
                }
            } 
        },

        /*
         * minify and version css files
         */
        cssmin: {
            ddgc_css: {
                files: {'root/static/css/ddgc<%= pkg.version %>.css' : 'src/ddgc/css/*.css'}
            },
            ia_css: {
                files: {'root/static/css/ia<%= pkg.version %>.css' : 'src/ia/css/*.css'}
            }
        }
    });

        // check diff on ia.js.  Diff runs rest
        // of release process if the file has changed
        grunt.registerTask('release', release_tasks);

        // compile handlebars and concat js files
        // to ia.js
        grunt.registerTask('build', build_tasks);

        // commit files to the repo for release
        grunt.registerTask('commit', commit_tasks);
 
        // default task runs build
        grunt.registerTask('default', build_tasks);

        // add modules here
        grunt.loadNpmTasks('grunt-contrib-concat');
        grunt.loadNpmTasks('grunt-contrib-handlebars');
        grunt.loadNpmTasks('grunt-version');
        grunt.loadNpmTasks('grunt-contrib-uglify');
        grunt.loadNpmTasks('grunt-diff');
        grunt.loadNpmTasks('grunt-remove');
        grunt.loadNpmTasks('grunt-git');
        grunt.loadNpmTasks('grunt-remove-logging');
        grunt.loadNpmTasks('grunt-contrib-compass');
        grunt.loadNpmTasks('grunt-contrib-cssmin');
        grunt.loadNpmTasks('grunt-exec');

}
