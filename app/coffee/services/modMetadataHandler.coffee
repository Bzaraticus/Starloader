angular.module('starloader').factory 'modMetadataHandler', [
	'configHandler',
	(configHandler) ->
		fs = require 'fs'
		modsFilePath = ''
		mods = {}

		refreshModsFilePath = () ->
			configHandler.refresh()
			config = configHandler.get()
			modsFilePath = config.modspath + '/mods.json'

		refresh = () ->
			refreshModsFilePath()

			if fs.existsSync(modsFilePath)
				mods = JSON.parse fs.readFileSync(modsFilePath, {encoding: 'utf8'})
			else
				mods = null

		save = (userMods) ->
			refreshModsFilePath()

			fs.writeFileSync modsFilePath, JSON.stringify(userMods)

		create = () ->
			refreshModsFilePath()
			console.log modsFilePath
			fs.writeFileSync modsFilePath, '[]'

		refresh()

		return {
			get: () -> mods
			save: save
			refresh: refresh
			create: create
		}
]