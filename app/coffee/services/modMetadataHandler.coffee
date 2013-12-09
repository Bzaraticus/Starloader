angular.module('starloader').factory 'modMetadataHandler', [
	'configHandler',
	(configHandler) ->
		fs = require 'fs'
		modsFilePath = ''
		mods = []

		defaultModMetadata =
			"internal-name": ""
			name: ""
			author: ""
			version: ""
			order: 0
			source: {type: "", path: ""}
			active: true

		sortByOrder =  (a, b) ->
			if a.order > b.order then return 1
			if a.order < b.order then return -1
			return 0

		refreshModsFilePath = () ->
			configHandler.refresh()
			config = configHandler.get()
			modsFilePath = config.modspath + '/mods.json'

		refresh = () ->
			refreshModsFilePath()

			if fs.existsSync(modsFilePath)
				mods = JSON.parse fs.readFileSync(modsFilePath, {encoding: 'utf8'})

				mods.sort sortByOrder
			else
				mods = null

		save = (userMods) ->
			refreshModsFilePath()
			
			if userMods?
				mods = userMods

			# Make sure there aren't any gaps in the ordering
			mods.sort sortByOrder
			order = 1
			for mod, index in mods
				mods[index].order = order
				order++

			fs.writeFileSync modsFilePath, angular.toJson(mods)

		create = () ->
			refreshModsFilePath()
			fs.writeFileSync modsFilePath, '[]'

		addMod = (userModMetadata) ->
			modMetadata = angular.extend {}, defaultModMetadata, userModMetadata
			if not userModMetadata.order?
				modMetadata.order = mods.length + 1

			mods.push modMetadata

		removeMod = (modInfo) ->
			for mod, index in mods
				if mod["internal-name"] is modInfo["internal-name"]
					mods.splice index, 1
					break

		refresh()

		return {
			get: () -> mods
			save: save
			refresh: refresh
			create: create
			addMod: addMod
			removeMod: removeMod
		}
]