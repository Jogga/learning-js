module.exports = function (grunt) {

    'use strict';

    grunt.initConfig({

        compass: {
            dev: {
                options: {
                    relativeAssets: true,
                    imagesDir:'public/img',
                    fontsDir: 'public/font',
                    sassDir: 'dev/scss',
                    cssDir: 'public/css',
                    outputStyle: 'expanded',
                    environment: 'development'
                }
            }
        },

        concat: {
            dev: {
                src: 'dev/js/**/*.js',
                dest: 'public/js/main.js'
            }
        },

        watch: {
            options: {
                spawn: false,
                livereload: true
            },
            js: {
                files: ['dev/js/**/*.js',],
                tasks: ['concat:dev']
            },
            css: {
                files: ['dev/scss/**/*.scss'],
                tasks: ['compass:dev']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', [
        'compass:dev',
        'concat:dev',
        'watch'
    ]);
};
