angular.module('starloader').factory 'modFolderHandler', [
	'config',
	(config) ->
		fs = require 'fs'

		exists = () ->
			return fs.existsSync config.get('modspath')

		create = () ->
			fs.mkdirSync config.get('modspath')
			return

		return {
			exists: exists
			create: create
		}
]