angular.module('starloader').factory 'modEditor', [
	'config', 'modRepository',
	(config,   modRepository) ->
		fs = require 'fs'
		pathUtil = require 'path'

		_metaData = modRepository.getDefaultMetadata()		
		_modFiles = []

		createMod = (folder) ->
			_metaData = 
				"internal-name": ""
				"name": ""
				"description": ""
				"author": ""
				"version": ""
				"url": ""
				"order": 0
				"source": {"type": "folder", "path": folder}
				"active": true

			_scanFiles()

		loadMod = (mod) ->
			_metaData = mod
			_scanFiles()
			
		_scanFiles = (folder) ->
			path = modRepository.getPath _metaData, null, true
			_modFiles = []
			
		saveMod = (meta) ->
			path = modRepository.getPath meta, null, true
			modInfoPath = pathUtil.join path, "mod.json"
			basicMeta = 
				"internal-name": meta["internal-name"]
				"name": meta["name"]
				"description": meta["description"]
				"author": meta["author"]
				"version": meta["version"]
				"url": meta["url"]		
				
			fs.writeFileSync modInfoPath, angular.toJson(basicMeta)
			modRepository.save meta
			
		getMetaData = () ->
			return _metaData
			
		getFiles = () ->
			return _modFiles

		return {
			getMetaData: getMetaData
			getFiles: getFiles
			createMod: createMod
			loadMod: loadMod
			saveMod: saveMod
		}
]