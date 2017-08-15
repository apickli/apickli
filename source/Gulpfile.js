const gulp = require('gulp');
const cucumber = require('gulp-cucumber');
const eslint = require('gulp-eslint');

gulp.task('test', function() {
    const options = {
        'steps': 'test/features/step_definitions/*.js',
        'tags': '@core',
        'format': 'pretty',
    };

    return gulp.src('test/features/*')
        .pipe(cucumber(options));
});

gulp.task('console-test', function() {
    const options = {
        'steps': 'test/features/step_definitions/*.js',
        'tags': '@console',
        'format': 'pretty',
    };

    return gulp.src('test/features/*')
        .pipe(cucumber(options));
});

gulp.task('lint', function() {
    return gulp.src(['**/*.js', '!node_modules/**'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});
