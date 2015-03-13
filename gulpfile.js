/**
 * Usage
 * gulp [task]  --env development
 */
'use strict';

var gulp = require('gulp');
var jsdoc = require('gulp-jsdoc');
var mocha = require('gulp-mocha');
var utils = require('gulp-util');

/**
 * test task
 * Run unit tests
 */
gulp.task('test', function () {
	return gulp.src('lib/index.spec.js', {read: false})
		.pipe(mocha({
			ui: 'bdd',
			reporter: 'spec'
		}))
		.on('error', utils.log);
});

/**
 * docs task
 * Generate the JavaScript documentation
 */
gulp.task('docs', function () {
	return gulp.src('lib/index.js')
		.pipe(jsdoc('./docs'))
		.on('error', utils.log);
});

/*
 * Grouped task definitions
 */

gulp.task('build', ['test', 'docs']);

gulp.task('default', ['build']);
