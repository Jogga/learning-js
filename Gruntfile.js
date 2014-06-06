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
            },
            dist: {
               options: {
                   relativeAssets: true,
                   imagesDir:'public/img',
                   fontsDir: 'public/font',
                   sassDir: '_dev/scss',
                   cssDir: 'public/css',
                   outputStyle: 'compressed',
                   environment: 'production'
               }
            }
        },

        concat: {
            html5shiv: {
                src: 'bower_components/html5shiv/dist/html5shiv.min.js',
                dest: 'public/js/html5shiv.min.js'
            },
            normalizeCss: {
                src: 'bower_components/normalize-css/normalize.css',
                dest: 'public/css/normalize.css'
            },
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
        'concat:normalizeCss',
        'concat:html5shiv',
        'concat:dev',
        'watch'
    ]);

    grunt.registerTask('dist', [
        'compass:dist',
        'concat:normalizeCss',
        'concat:html5shiv',
        'concat:dev'
    ]);
};
