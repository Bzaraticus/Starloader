"use strict";

module.exports = function (grunt) {
    grunt.loadNpmTasks("grunt-contrib-coffee");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-watch");

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
                files: ['app/coffee/*.coffee'],
                tasks: ['dev']
            }
        }
    };

    grunt.initConfig(gruntConfig);

    grunt.registerTask("default", ["coffee", "concat"]);
};
