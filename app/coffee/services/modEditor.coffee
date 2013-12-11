angular.module('starloader').factory 'modEditor', [
	'config', 'modRepository',
	(config,   modRepository) ->
		fs = require 'fs'
		pathUtil = require 'path'

		metaData =
			"internal-name": ""
			"name": ""
			"description": ""
			"author": "Unknown"
			"version": "0.0.0"
			"url": ""
			"order": 0
			"source": {"type": "", "path": ""}
			"active": true
		
		modFiles = []

		createMod = (folder) ->
			metaData =
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
			metaData = mod
			_scanFiles()
			
		_getFullPath = () ->
			path = metaData.source.path
			if metaData.source.type is 'installed'
				path = pathUtil.join config.get('modspath'), metaData.source.path
			return path
			
		_scanFiles = () ->
			path = _getFullPath()
			modFiles = []
			
		saveMod = () ->
			path = _getFullPath()
			modInfoPath = pathUtil.join path, "mod.json"
			basicMeta = 
				"internal-name": metaData["internal-name"]
				"name": metaData["name"]
				"description": metaData["description"]
				"author": metaData["author"]
				"version": metaData["version"]
				"url": metaData["url"]		
				
			fs.writeFileSync modInfoPath, angular.toJson(basicMeta)
			modRepository.save(metaData)

		return {
			metaData: metaData
			modFiles: modFiles
			createMod: createMod
			loadMod: loadMod
			saveMod: saveMod
		}
]