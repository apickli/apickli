const gulp = require('gulp');
const cucumber = require('gulp-cucumber');
const eslint = require('gulp-eslint');
const report = require('cucumber-html-reporter');
var jsonReportPath = 'test/reports/json/';
var htmlReportPath = 'test/reports/html/';
const fs = require('fs-extra');

const cucumberReportOpts ={
    theme: 'bootstrap',
    jsonDir: jsonReportPath,
    output: htmlReportPath+'/report.html',
    brandTitle: 'Demo Tests Results Report',
    reportSuiteAsScenarios: true,
    launchReport: false,
    storeScreenShots: true,
    ignoreBadJsonFile: true,
    };

gulp.task('createFolders',(done)=>{
    new Promise(function(resolve,reject){
        try{
            fs.mkdirsSync(jsonReportPath);
            fs.mkdirsSync(htmlReportPath);

            resolve();
        }
        catch (e) {
            console.log(e);
            done();
        }
    }).then(function(){
        done();
    })
});

gulp.task('report', (done) => {

    new Promise(function(resolve,reject){
        try{
            report.generate(cucumberReportOpts);
            resolve();
        }
        catch (e) {
            console.log(e);
            done();
        }
    }).then(function(){
        done();
    })

});
gulp.task('test', function() {
    const options = {
        'steps': 'test/features/step_definitions/*.js',
        'support': 'test/features/support/init.js',
        'format': 'json:test/reports/json/jsonReport.json',
        'tags': '@api',
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
