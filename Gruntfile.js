'use strict';

module.exports = function(grunt) {

  grunt.initConfig({
    
    cucumberjs: {
      files: 'features',
      options: {
        format: 'pretty'
      }
    }
  })

  grunt.loadNpmTasks('grunt-cucumber')

  grunt.registerTask('default', ['cucumberjs']);
  grunt.registerTask('tests', ['cucumberjs']);
}
