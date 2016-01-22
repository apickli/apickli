var gulp = require('gulp');
var cucumber = require('gulp-cucumber');
var jshint = require('gulp-jshint');
 
gulp.task('test', function() {
	var options = {
		'steps': 'test/features/step_definitions/*.js',
        'tags': '@core',
		'format': 'pretty'
	};

    return gulp.src('test/features/*')
			.pipe(cucumber(options));
});

gulp.task('console-test', function() {
	var options = {
		'steps': 'test/features/step_definitions/*.js',
        'tags': '@console',
		'format': 'pretty'
	};

    return gulp.src('test/features/*')
			.pipe(cucumber(options));
});

gulp.task('jshint', function() {
	var apickliJs = 'apickli/*.js';
	var apickliTestJs = 'test/features/step_definitions/*.js';

	return gulp.src([ apickliJs, apickliTestJs ])
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'));
});
