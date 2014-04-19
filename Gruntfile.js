'use strict';

module.exports = function (grunt) {
	grunt.initConfig({

		// metadata
		pkg : grunt.file.readJSON('package.json'),
		meta: {
			copyright : 'Copyright (c) 2013-<%= grunt.template.today("yyyy") %>',
			banner    : '/* \n' +
						' * <%= pkg.name %>.js v<%= pkg.version %> \n' +
						' * <%= pkg.repository.url %> \n' +
						' */ \n',
			source    : ['js/colist.js']
		},

		// JShint this version
		jshint: {
			files: {
				src: '<%= meta.source %>'
			}
		}

	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('default', ['jshint']);

};