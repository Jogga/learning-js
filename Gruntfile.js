module.exports = function (grunt) {

    'use strict';

    grunt.initConfig({

        compass: {
            dev: {
                options: {
                    relativeAssets: true,
                    imagesDir:'public/img',
                    fontsDir: 'public/font',
                    sassDir: '_dev/scss',
                    cssDir: 'public/css',
                    outputStyle: 'expanded',
                    environment: 'development'
                }
            }
        },

        concat: {
            dev: {
                src: '_dev/js/**/*.js',
                dest: 'public/js/main.js'
            }
        },

        watch: {
            options: {
                spawn: false,
                livereload: true
            },
            js: {
                files: ['_dev/js/**/*.js',],
                tasks: ['concat:dev']
            },
            css: {
                files: ['_dev/scss/**/*.scss'],
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
