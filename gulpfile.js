var gulp = require('gulp');
var less = require('gulp-less');
var path = require('path');
var watch = require('gulp-watch');

gulp.task('less', function() {
	gulp
		.src('./_dev/less/main.less')
		.pipe(less({
			paths: [ '_dev/less' ]
		}))
		.on('error', function (error) {
			console.log(error.message);
			this.emit('end');
		})
		.pipe(gulp.dest('public/css'))
});

gulp.task('watch', function () {
	gulp.watch('./_dev/less/**/*.less', ['less']);
});


gulp.task('default', [
	'less',
	'watch'
]);
