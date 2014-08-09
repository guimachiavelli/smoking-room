(function() {
	'use strict';

	var gulp = require('gulp'),
		source = require('vinyl-source-stream'),
		plumber = require('gulp-plumber'),
		gutil = require('gutil'),
		compass = require('gulp-compass'),
		browserify = require('browserify');

	gulp.task('default', function() {
		console.log('default task');
	});

	gulp.task('compass', function() {
		gulp.src('./src/sass/*.scss')
			.pipe(compass({
				css: 'public/css',
				sass: 'src/sass',
				style: 'nested',
				comments: false
			}))
			.pipe(gulp.dest('public/css'));
	});

	gulp.task('browserify', function() {
		var bundleSource = browserify('./src/js/main.js')
			.require('jquery')
			.bundle();

		bundleSource
			.on('error', gutil.log)
			.pipe(plumber())
			.pipe(source('bundle.js'))
			.pipe(gulp.dest('public/js'));
	});

	gulp.task('develop', function() {
		gulp.watch(['src/js/*.js'], ['browserify']);
	});

}());
