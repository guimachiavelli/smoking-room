module.exports = (grunt) ->

	grunt.initConfig {
		mochacli: {
			options: {
				compilers: ['coffee:coffee-script']
				files: 'test/*.coffee'
			}

			single: {
				options: {
					reporter: 'spec'
				}
			}

			watching: {
				options: {
					reporter: 'min'
				}
			}
		}

		coffeelint: {
			files: 'lib/*.coffee', 'test/*.coffee'

			options: {
				force: true
				indentation: {
					name: 'indentation'
					value: 1
					level: 'error'
				}
				no_tabs: {
					name: 'no_tabs'
					level: 'ignore'
				}
      		}
    	}

		watch: {
			mocha: {
				files: ['test/*.coffee', 'lib/*.coffee']
				tasks: ['test-watch', 'lint']
			}
		}
		



	}

	grunt.registerTask 'default', 'Log some stuff.', ->
		grunt.log.write 'available tasks: test, watch, lint'


	grunt.registerTask 'test', ['mochacli:single', 'coffeelint']
	grunt.registerTask 'test-watch', ['mochacli:watching']
	grunt.registerTask 'lint', ['coffeelint']

	grunt.loadNpmTasks 'grunt-contrib-coffee'
	grunt.loadNpmTasks 'grunt-mocha-cli'
	grunt.loadNpmTasks 'grunt-contrib-watch'
	grunt.loadNpmTasks 'grunt-coffeelint'

