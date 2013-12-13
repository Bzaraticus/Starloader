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

			scanFiles()

		loadMod = (mod) ->
			_metaData = mod
			scanFiles()
			
		scanFiles = () ->
			path = modRepository.getPath _metaData, null, true
			_modFiles = []
			_scanDir path, _modFiles
			
		_scanDir = (path, fileArray) ->
			files = fs.readdirSync path
			for file in files
				fullPath = pathUtil.join path, file
				if fs.lstatSync(fullPath).isDirectory()
					subFiles = []
					_scanDir fullPath, subFiles
					fileArray.push {"type": "folder", "name": file, "subfiles": subFiles, "fullName": fullPath, "path": path }
				else
					ext = pathUtil.extname file
					type = switch
						when ext is ".object" then "object"
						when ext is ".png" then "image"
						when ext is ".frames" then "frames"
						when ext is ".animation" then "animation"
						when ext is ".item" then "item"
						when ext is ".recipe" then "recipe"
						when ext is ".spawner" then "spawner"
						when ext is ".config" then "config"
						else "other"
					fileArray.push {"type": type, "name": file, "fullName": fullPath, "path": path }
					
		deleteSomething = (something) ->
			if something.type is "folder" 
				for file in something.subfiles
					if file.type is "folder"
						deleteSomething file
					else
						fs.unlinkSync file.fullName					
				fs.rmdirSync something.fullName
			else
				fs.unlinkSync something.fullName
				
	
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
			scanFiles: scanFiles
			deleteSomething: deleteSomething
		}
]