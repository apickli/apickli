// $ grunt test

module.exports = function(grunt) {
	'use strict';
	grunt.initConfig({
		cucumberjs: {
			src: 'test/features',
			options: {
				format: 'pretty',
				steps: 'test/features/step_definitions'
			}
		}
	});

	grunt.loadNpmTasks('grunt-cucumber');
	grunt.registerTask('test', ['cucumberjs']);
};
