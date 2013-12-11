angular.module('starloader').factory 'modInstaller', [
	'config', 'modRepository', 'modMerger',
	(config,   modRepository,   modMerger) ->
		# Node modules
		fs       = require 'fs'
		pathUtil = require 'path'
		AdmZip   = require 'adm-zip'
		rimraf   = require 'rimraf'

		# Information about the platform-dependant bootstrap.config files
		_bootstraps = [
			{path: '/win32', sourcePrefix: '../'},
			{path: '/Starbound.app/Contents/MacOS', sourcePrefix: '../../../'},
			{path: '/linux32', sourcePrefix: '../'},
			{path: '/linux64', sourcePrefix: '../'}
		]

		applyModInstallations = () ->
			_mergeFiles()
			_updateBootstraps()

		_mergeFiles = () ->
			filesToMerge = config.get 'filesToMerge'

			if typeof filesToMerge is 'undefined'
				filesToMerge = 'player.config,quests/quests.config'
				config.set 'filesToMerge', filesToMerge

			modMerger.clearMergedFolder()

			filesToMergeArray = filesToMerge.split ','
			for fileToMerge in filesToMergeArray
				modMerger.mergeFile fileToMerge

		# Returns the absolute paths to the bootstrap files
		_getBootstrapPaths = () ->
			return _bootstraps.map (bootstrap) ->
				localBootstrap = angular.extend {}, bootstrap
				localBootstrap.path = pathUtil.join(config.get('gamepath'), localBootstrap.path, 'bootstrap.config')
				return localBootstrap

		# Updates the bootstrap files
		_updateBootstraps = () ->
			console.log 'updating bootstraps'
			localBootstraps = _getBootstrapPaths()
			modsToInstall = modRepository.getActive()

			for bootstrap in localBootstraps
				assetSources = []

				for modMetadata in modsToInstall
					assetSources.push modRepository.getPath(modMetadata, bootstrap.sourcePrefix)

				assetSources.push pathUtil.join(bootstrap.sourcePrefix, 'assets')
				assetSources.push pathUtil.join(bootstrap.sourcePrefix, '_merged')
				assetSources = assetSources.map (assetSource) -> assetSource.replace /[\\\/]+/g, '/'

				# Get the current bootstrap file and update its asset sources
				bootstrapData = JSON.parse fs.readFileSync(bootstrap.path)
				bootstrapData.assetSources = assetSources
				fs.writeFileSync bootstrap.path, JSON.stringify(bootstrapData)

		# Installs a mod from a .zip archive specified by "path".
		installFromZip = (path, callback) ->
			# Should we create a default metadata file if one doesn't exist?
			createDefaultMetadataFile = false

			if pathUtil.extname(path) isnt '.zip'
				callback "File is not a .zip archive"
				return

			try
				zip = new AdmZip(path)
			catch e
				callback e.toString()
				return

			# Make sure the mod has a metadata file first
			metadataEntry = zip.getEntry('mod.json')
			if metadataEntry is null
				createDefaultMetadataFile = true

				modMetadata = {}
				modMetadata["internal-name"] = pathUtil.basename(path, '.zip').replace(/[^a-zA-Z0-9_\-]+/g, '_')
				modMetadata["name"] = modMetadata["internal-name"]
			else
				try
					modMetadata = JSON.parse metadataEntry.getData().toString('utf8')
				catch e
					callback "Invalid mod metadata (mod.json)"
					return
				
				if not modMetadata["internal-name"]? or modMetadata["internal-name"] is ""
					callback "Invalid internal name for mod"
					return

			# The folder where the mod is stored is named after the internal name
			dirname = modMetadata["internal-name"].replace /[^a-zA-Z0-9_\-]+/g, '_'

			if dirname is ""
				callback "Empty filename"
				return

			installPath = pathUtil.join(config.get('modspath'), dirname)

			# Attempt to install the mod
			fs.exists installPath, (exists) ->
				if exists
					callback "A mod with this name already exists. Try updating the existing one!"
					return

				# Extract the archive
				fs.mkdir installPath, () ->
					zip.extractAllTo installPath

					# Create the mod metadata file if one didn't exist
					if createDefaultMetadataFile
						metadataFilePath = pathUtil.join(installPath, 'mod.json')
						fs.writeFileSync metadataFilePath, angular.toJson(modMetadata)

					# Save the mod's metadata
					modMetadata.source =
						type: 'installed'
						path: dirname

					modRepository.save modMetadata
					applyModInstallations()

					callback()

		# Installs a mod by loading it from the folder specified by "path"
		installFromFolder = (path, callback) ->
			metadataFilePath = pathUtil.join(path, 'mod.json')

			fs.exists path, (exists) ->
				if not exists
					callback "Folder not found"
					return

				fs.stat path, (err, stats) ->
					if err or not stats.isDirectory()
						callback "Target is not a folder"
						return

					fs.exists metadataFilePath, (exists) ->
						if not exists
							callback "Mod metadata file (mod.json) was not found in the folder"
							return

						fs.readFile metadataFilePath, (err, data) ->
							try
								modMetadata = JSON.parse data
							catch e
								callback "Invalid mod metadata (mod.json): " + e.toString()
								return

							if not modMetadata["internal-name"]? or modMetadata["internal-name"] is ""
								callback "Invalid internal name for mod"
								return

							modMetadata.source =
								type: 'folder'
								path: path

							modRepository.save modMetadata
							applyModInstallations()

							callback()

			return

		# Uninstalls the mod specified by modMetadata
		uninstall = (modMetadata, callback) ->
			if modMetadata.source.type is 'installed'
				_uninstallFromArchive modMetadata, callback
			else if modMetadata.source.type is 'folder'
				_uninstallFromFolder modMetadata, callback

			return

		# Uninstalls the archive mod specified by modMetadata
		_uninstallFromArchive = (modMetadata, callback) ->
			modPath = pathUtil.join config.get('modspath'), modMetadata.source.path

			finalize = () ->
				modRepository.remove modMetadata
				applyModInstallations()

				if callback then callback()

			fs.exists modPath, (exists) ->
				if exists
					rimraf modPath, (err) ->
						if err then console.log 'rimraf error', err
						finalize()
				else
					finalize()

			return

		# Uninstalls the folder mod specified by modMetadata
		_uninstallFromFolder = (modMetadata, callback) ->
			modRepository.remove modMetadata
			applyModInstallations()

			callback()

			return

		refreshMods = () ->
			_discoverArchiveInstallations()
			_refreshAllModMetadata()
			applyModInstallations()

			return

		_discoverArchiveInstallations = () ->
			# Make sure the array we're looping stays intact during this operation
			# so that we won't hit undefined elements.
			allModMetadata = modRepository.get()
			updatedMetadata = []

			console.log 'discover archive installations'
			allModMetadata.map (mod) ->
				console.log mod.name + ':', mod.order

			existingMods = {}

			# Gather our current mods into an object with their paths as the keys.
			# This enabled us to check if a mod already exists.
			for modMetadata, index in allModMetadata
				existingMods[modMetadata["internal-name"]] = allModMetadata[index]

			files = fs.readdirSync config.get('modspath')
			for file in files
				if file.substr(0, 1) is '_' then continue

				filePath = pathUtil.normalize pathUtil.join(config.get('modspath'), file)

				# Mods can only be directories here
				stat = fs.statSync filePath
				if not stat.isDirectory() then continue

				modMetadataFile = pathUtil.join filePath, 'mod.json'

				if fs.existsSync(modMetadataFile)
					# If the metadata file exists, make sure it can be read and parsed
					try
						modMetadata = JSON.parse fs.readFileSync(modMetadataFile)
					catch
						continue
				else
					# If the metadata file doesn't exist, generate a new one
					modMetadata = {}
					modMetadata["internal-name"] = file
					modMetadata["name"] = modMetadata["internal-name"]

					fs.writeFileSync modMetadataFile, angular.toJson(modMetadata)

				# Make sure every mod's metadata has the "internal-name" property
				if not modMetadata["internal-name"]? or modMetadata["internal-name"] is ""
					continue

				# Update existing mods' metadata
				if existingMods[modMetadata["internal-name"]]?
					modMetadata = angular.extend {}, existingMods[modMetadata["internal-name"]], modMetadata

					if modMetadata.source.type is 'installed'
						modMetadata.source.path = file
					else
						modMetadata.source.path = filePath
				else
					modMetadata.source = {type: 'installed', path: file}
				
				# Push the updated metadata to our save queue
				updatedMetadata.push modMetadata

			modRepository.save updatedMetadata

		# Refreshes all mod metadata by loading the mods' mod.json files and extending
		# the existing mod metadata with that.
		_refreshAllModMetadata = () ->
			allModMetadata = modRepository.get()
			allRefreshedMetadata = []
			
			console.log 'discover archive installations'
			allModMetadata.map (mod) ->
				console.log mod.name + ':', mod.order

			for modMetadata in allModMetadata
				if modMetadata.source.type is 'installed'
					modPath = pathUtil.join config.get('modspath'), modMetadata.source.path
					modMetadataFile = pathUtil.join config.get('modspath'), modMetadata.source.path, 'mod.json'
				else
					modPath = modMetadata.source.path
					modMetadataFile = pathUtil.join modMetadata.source.path, 'mod.json'

				if not fs.existsSync(modPath) or not fs.existsSync(modMetadataFile)
					modRepository.remove modMetadata
					continue

				modMetadataFromFile = JSON.parse fs.readFileSync(modMetadataFile)

				refreshedMetadata = angular.extend {}, modMetadata, modMetadataFromFile
				allRefreshedMetadata.push refreshedMetadata

			modRepository.save allRefreshedMetadata

		activateMod = (mod) ->
			console.log 'activating mod'
			modMetadata = modRepository.get mod["internal-name"]
			modMetadata.active = true
			modRepository.save modMetadata

			applyModInstallations()

		deactivateMod = (mod) ->
			console.log 'deactivating mod'
			modMetadata = modRepository.get mod["internal-name"]
			modMetadata.active = false
			modRepository.save modMetadata

			applyModInstallations()

		return {
			installFromZip: installFromZip
			installFromFolder: installFromFolder
			uninstall: uninstall
			refreshMods: refreshMods
			activateMod: activateMod
			deactivateMod: deactivateMod,
			applyModInstallations: applyModInstallations
		}
]