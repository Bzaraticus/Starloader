angular.module('starloader').factory 'modFolderHandler', [
	'configHandler',
	(configHandler) ->
		fs = require 'fs'

		exists = () ->
			configHandler.refresh()
			config = configHandler.get()

			return fs.existsSync config.modspath

		create = () ->
			configHandler.refresh()
			config = configHandler.get()

			fs.mkdirSync config.modspath
			return

		return {
			exists: exists
			create: create
		}
]