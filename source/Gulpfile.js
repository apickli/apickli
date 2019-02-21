const gulp = require('gulp');
const cucumber = require('gulp-cucumber');
const eslint = require('gulp-eslint');
const reporter = require('cucumber-html-reporter');
const fs = require('fs-extra');
const run = require('gulp4-run-sequence');
const argv = require('argv').option({name: 'report', type: 'string'}).run();

gulp.task('test', (done) => {
  const tasks = argv.options.report ? ['clean', 'cucumber', 'report'] : ['cucumber'];
  run(tasks);
  done();
});

gulp.task('clean', function(done) {
  return fs.ensureDir('reports')
      .then(fs.emptyDir('reports'));
});

gulp.task('report', function(done) {
  const reportOptions = {
    theme: 'bootstrap',
    jsonFile: 'reports/reports.json',
    output: 'reports/reports.html',
    reportSuiteAsScenarios: true,
    launchReport: false,
  };

  reporter.generate(reportOptions);
  done();
});

gulp.task('cucumber', function() {
  const options = {
    'steps': 'test/features/step_definitions/*.js',
    'support': 'test/features/support/init.js',
    'tags': '@core',
    'emitErrors': false,
  };

  if (argv.options.report) {
    options.format = 'json:reports/reports.json';
  }

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
