/**
 * Usage
 * gulp [task]  --env development
 */
'use strict';

const gulp = require('gulp');
const jsdoc = require('gulp-jsdoc');
const mocha = require('gulp-mocha');
const eslint = require('gulp-eslint');
const utils = require('gulp-util');

/**
 * lint task
 * lint code
 */
gulp.task('lint', function () {
    return gulp.src(['lib/**/*.js','!node_modules/**'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

/**
 * test task
 * Run unit tests
 */
gulp.task('test', ['lint'], function () {
	return gulp.src('lib/**/*.spec.js', {read: false})
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

gulp.task('default', ['test']);
