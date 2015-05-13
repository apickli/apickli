// $ gulp test

var gulp = require('gulp');
var cucumber = require('gulp-cucumber');
 
gulp.task('test', function() {
    return gulp.src('test/features/*')
			.pipe(cucumber({
				'steps': 'test/features/step_definitions/*.js',
				'format': 'pretty'
			}));
});
