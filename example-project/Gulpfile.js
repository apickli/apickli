// $ gulp test

var gulp = require('gulp');
var cucumber = require('gulp-cucumber');
 
gulp.task('test', function() {
    return gulp.src('features/*')
			.pipe(cucumber({
				'steps': 'features/step_definitions/*.js',
				'format': 'pretty'
			}));
});
