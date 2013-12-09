"use strict";

module.exports = function (grunt) {
    grunt.loadNpmTasks("grunt-contrib-coffee");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-compass");
    grunt.loadNpmTasks("grunt-node-webkit-builder");

    var gruntConfig = {
        coffee: {
            dist: {
                expand: true,
                flatten: true,
                cwd: 'app/coffee',
                src: ['**/*.coffee'],
                dest: 'app/js/compiled/',
                ext: '.js'
            }
        },

        concat: {
            dist: {
                src: ['app/js/compiled/*.js'],
                dest: 'app/js/main.js'
            }
        },

        watch: {
            scripts: {
                files: ['app/coffee/**/*.coffee'],
                tasks: ['scripts']
            },
            styles: {
                files: ['app/scss/**/*.scss'],
                tasks: ['styles']
            }
        },

        nodewebkit: {
            options: {
                version: '0.8.1',
                build_dir: './releases',
                mac: true,
                win: true,
                linux32: true,
                linux64: true
            },
            src: ['./**/*']
        },

        compass: {
            dist: {
                options: {
                    sassDir: 'app/scss',
                    cssDir: 'app/css',
                    environment: 'production'
                }
            }
        }
    };

    grunt.initConfig(gruntConfig);

    grunt.registerTask("scripts", ["coffee", "concat"]);
    grunt.registerTask("styles", ["compass"]);
};
