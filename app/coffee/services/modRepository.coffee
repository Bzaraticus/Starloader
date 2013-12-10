angular.module('starloader').factory 'modRepository', [
	'config',
	(config) ->
		fs = require 'fs'
		pathUtil = require 'path'

		# Path to mods.json
		_modsFilePath = null

		_mods = null

		# Default values for different metadata properties
		_defaultModMetadata =
			"internal-name": ""
			"name": ""
			"description": ""
			"author": ""
			"version": ""
			"url": ""
			"order": 0
			"source": {"type": "", "path": ""}
			"active": true

		_sortByOrder =  (a, b) ->
			if a.order > b.order then return 1
			if a.order < b.order then return -1
			return 0

		# Makes sure the path to mods.json is fresh
		_refreshFilePath = () ->
			if config.get('modspath')?
				_modsFilePath = pathUtil.join config.get('modspath'), 'mods.json'
			else
				_modsFilePath = null

		# Loads mods.json to the "mods" variable
		_refreshFromFile = () ->
			_refreshFilePath()

			if _modsFilePath isnt null and fs.existsSync(_modsFilePath)
				_mods = JSON.parse fs.readFileSync(_modsFilePath, {encoding: 'utf8'})
				_mods.sort _sortByOrder
			else
				_mods = null

		# Updates mods.json with the current contents of "mods"
		_updateFile = () ->
			_fs.writeFileSync _modsFilePath, angular.toJson(_mods)

		# Tidys up the mods by making sure there are no gaps in ordering
		_cleanMods = () ->
			_mods.sort _sortByOrder
			order = 1
			for mod, index in _mods
				_mods[index].order = order
				order++

		# Gets either the specified mod or all of them
		get = (internalName) ->
			if _mods is null
				_mods = []
				init()

			if internalName?
				for mod in _mods
					if mod["internal-name"] is internalName
						return angular.extend {}, mod

				return null
			else
				return angular.extend {}, _mods

		# Adds or updates the given mod to mods.json and saves the file
		save = (inputMod) ->
			saved = false
			modMetadata = angular.extend _defaultModMetadata, inputMod

			# Attempt to find an existing mod to update
			for mod, index in _mods
				if mod["internal-name"] is inputMod["internal-name"]
					_mods[index] = modMetadata
					saved = true
					break

			# If we didn't find a mod to update, add this as a new one
			if not saved
				_mods.push modMetadata

			_cleanMods()
			_updateFile()

		# Initializes the repository by creating mods.json
		init = () ->
			_refreshFilePath()
			fs.writeFileSync _modsFilePath, '[]'

			_refreshFromFile()

		# Removes a mod from "mods"
		remove = (modMetadata) ->
			for mod, index in _mods
				if mod["internal-name"] is modMetadata["internal-name"]
					_mods.splice index, 1
					break

			_cleanMods()
			_updateFile()

		# Returns the path to a mod
		getPath = (modMetadata, relativeModPathPrefix) ->
			if not relativeModPathPrefix? then relativeModPathPrefix = ''

			path = ''

			# If possible, attempt to use a relative path for installed mods
			if modMetadata.source?.type is 'installed'
				# If the mods folder exists under the game folder, use a relative path to ensure functionality even if the game is relocated.
				if config.get('modspath').indexOf(config.get('gamepath')) isnt -1
					preferredModsPath = pathUtil.relative config.get('gamepath'), config.get('modspath')

					# If we have a prefix (usually to handle relative paths from the bootstrap files), apply that
					preferredModsPath = pathUtil.join relativeModPathPrefix, preferredModsPath
				else
					preferredModsPath = config.get('modspath')

				path = pathUtil.join(preferredModsPath, modMetadata.source.path)
			else
				# External mods, even if they exist in the mods folder, use absolute paths
				path = modMetadata.source.path

			return pathUtil.normalize path

		# Returns active mods
		getActive = () ->
			activeMods = []
			mods = [].concat(_mods)

			for modMetadata, index in modCollectionMetadata
				if modMetadata.active then activeMods.push modCollectionMetadata[index]

			modsToInstall.sort _sortByOrder

			return activeMods

		_refreshFromFile()

		return {
			init: init
			get: get
			save: save
			remove: remove
		}
]