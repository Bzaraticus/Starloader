"use strict";

module.exports = function (grunt) {
    grunt.loadNpmTasks("grunt-contrib-coffee");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-copy");

    var gruntConfig = {
        coffee: {
            dist: {
                expand: true,
                flatten: true,
                cwd: 'app/coffee',
                src: ['*.coffee'],
                dest: 'app/js/compiled/',
                ext: '.js'
            }
        },

        concat: {
            dist: {
                src: ['app/js/external/*.js', 'app/js/compiled/*.js'],
                dest: 'app/js/main.js'
            }
        },

        uglify: {
            options: {
                preserveComments: "some"
            },
            dist: {
                files: {
                    "app/js/main.min.js": ["app/js/main.js"]
                }
            }
        },

        copy: {
            devMin: {
                src: 'app/js/main.js',
                dest: 'app/js/main.min.js'
            }
        },

        watch: {
            scripts: {
                files: ['app/coffee/*.coffee'],
                tasks: ['dev']
            }
        }
    };

    gruntConfig.uglify['check'] = {
        options: {
            report: 'gzip'
        },
        files: gruntConfig.uglify.dist.files
    };

    grunt.initConfig(gruntConfig);

    grunt.registerTask("default", ["dev"]);
    grunt.registerTask("dev", ["coffee", "concat", "copy:devMin"]);
    grunt.registerTask("prod", ["coffee", "concat", "uglify"]);
    grunt.registerTask("min-check", ["uglify:check"]);
};
