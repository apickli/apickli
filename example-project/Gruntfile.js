// $ grunt test

module.exports = function(grunt) {
	'use strict';
	grunt.initConfig({
		cucumberjs: {
			src: 'features',
			options: {
				format: 'pretty',
				steps: 'features/step_definitions'
			}
		}
	});

	grunt.loadNpmTasks('grunt-cucumber');
	grunt.registerTask('test', ['cucumberjs']);
};
