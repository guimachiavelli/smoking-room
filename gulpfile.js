(function() {
	'use strict';

	var gulp = require('gulp'),
		source = require('vinyl-source-stream'),
		plumber = require('gulp-plumber'),
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
				sourcemap: true,
				style: 'nested',
				comments: false
			}))
			.pipe(gulp.dest('public/css'));
	});

	gulp.task('browserify', function() {
		var bundleSource = browserify('./src/main.js').bundle();

		bundleSource
			.on('error', console.log)
			.pipe(plumber())
			.pipe(source('main.js'))
			.pipe(gulp.dest('public/js'));
	});

	gulp.task('develop', function() {
		gulp.watch(['src/components/*.jsx', 'src/js/*.js'], ['react']);
	});

}());
