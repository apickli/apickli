const gulp = require('gulp');
const cucumber = require('gulp-cucumber');
const eslint = require('gulp-eslint');
const reporter = require('cucumber-html-reporter');
const runSequence = require('run-sequence');
const fsp = require('fs-promise');


gulp.task('run-test', function() {
    runSequence('onPrepare',
        'test',
        'reportHtml');
});

gulp.task('onPrepare', function() {
    return fsp.emptyDir('reports/json')
        .then(function() {
            return fsp.emptyDir('reports/html');
        });
});


gulp.task('reportHtml', function() {
    const options = {
        theme: 'bootstrap',
        jsonFile: 'reports/json/reports.json',
        output: 'reports/html/reports.html',
        reportSuiteAsScenarios: true,
        launchReport: false,
        metadata: {
            'App Version': '0.0.3',
         },
    };
    reporter.generate(options);
});

gulp.task('test', function() {
    const options = {
        'steps': 'test/features/step_definitions/*.js',
        'support': 'test/features/support/init.js',
        'tags': '@core',
        'format': 'json:reports/json/reports.json',

    };

    return gulp.src('test/features/*')
        .pipe(cucumber(options));
});

gulp.task('console-test', function() {
    const options = {
        'steps': 'test/features/step_definitions/*.js',
        'support': 'test/features/support/init.js',
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
