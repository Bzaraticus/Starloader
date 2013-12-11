angular.module('starloader').factory 'modMerger', [
	'config', 'modRepository',
	(config,   modRepository) ->
		# Node modules
		fs       = require 'fs'
		pathUtil = require 'path'
		mkdirp   = require 'mkdirp'
		rimraf   = require 'rimraf'

		# Where to search for to-be-merged files in mods' folders
		roots = [
			'.'
			'./assets'
		]

		singleLineCommentRegex = /\/\/.*/g
		multiLineCommentRegex  = /\s*(?!<\")\/\*[^\*]*\*\/(?!\")\s*/g

		getMergeFolder = () ->
			return pathUtil.join(config.get('modspath'), '_merged')

		_extend = (source, extensions...) ->
			if typeof source isnt 'object' then return source

			for extension, index in extensions
				if typeof extension isnt 'object' then continue

				for propName, propValue of extension
					if source[propName]?
						# Merge arrays
						if angular.isArray(source[propName]) and angular.isArray(propValue)
							source[propName] = source[propName].concat extensions[index][propName]
							continue

						# Merge objects
						if typeof source[propName] is 'object' and typeof propValue is 'object'
							source[propName] = _extend source[propName], extensions[index][propName]
							continue
					
					# If we haven't continued until now, i.e. none of the above conditions matched, replace/add the property in the source object
					source[propName] = extensions[index][propName]

			return source

		# Returns the absolute paths to active mods with the default assets folder added as the first "mod"
		_getModPaths = () ->
			modPaths = []
			allMods = modRepository.getActive()

			modPaths.unshift pathUtil.join(config.get('gamepath'), 'assets')

			for mod in allMods
				# Request absolute paths to each mod
				modPaths.push modRepository.getPath(mod, "", true)

			return modPaths

		# Returns the paths to the existing instances of the given fileName in modPaths, under the first matching root if any.
		_getMergePathsForModPaths = (modPaths, fileName) ->
			mergePaths = []

			for modPath in modPaths
				rootPaths = _getRootPathsForModPath modPath

				for rootPath in rootPaths
					filePath = pathUtil.join rootPath, fileName
					if fs.existsSync filePath
						mergePaths.push filePath
						break

			return mergePaths

		# Returns the possible, existing root paths for the given mod paths.
		_getRootPathsForModPath = (modPath) ->
			rootPaths = []

			for root in roots
				rootPath = pathUtil.join modPath, root
				if fs.existsSync rootPath
					rootPaths.push rootPath

			return rootPaths

		clearMergedFolder = () ->
			mergeFolderPath = getMergeFolder()

			if fs.existsSync(mergeFolderPath)
				rimraf.sync mergeFolderPath

			fs.mkdir mergeFolderPath

		# Merges the given file in all active mods in load order and saves the result in <modspath>/_merged/<fileName>
		mergeFile = (fileName) ->
			allMods = modRepository.getActive()
			modPaths = _getModPaths()
			mergePaths = _getMergePathsForModPaths(modPaths, fileName)

			currentFile = {}

			for mergePath in mergePaths
				fileJson = fs.readFileSync mergePath, {encoding: 'utf8'}

				# Strip single-line comments
				fileJson = fileJson.replace singleLineCommentRegex, ''

				# Strip multi-line comments NOT in strings
				fileJson = fileJson.replace multiLineCommentRegex, ''

				try
					parsed = JSON.parse fileJson
				catch e
					continue

				_extend currentFile, parsed

			# Merging done, save the merged file
			mergeFolderPath = getMergeFolder()

			if not fs.existsSync mergeFolderPath
				clearMergedFolder()

			mergeFilePath = pathUtil.join mergeFolderPath, fileName

			# If the file would be saved in a subdirectory, recursively create folders up to there if they don't exist
			mergeFileDirname = pathUtil.dirname mergeFilePath
			if not fs.existsSync mergeFileDirname
				try
					mkdirp.sync mergeFileDirname
				catch e
					console.error e.toString()
					console.error e
					return

			# Attempt to save the merged file
			try
				fs.writeFileSync mergeFilePath, angular.toJson(currentFile)
			catch e
				console.error e
				return

			return

		return {
			mergeFile: mergeFile
			clearMergedFolder: clearMergedFolder
		}
]