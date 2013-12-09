angular.module('starloader').factory 'modInstaller', [
	'configHandler', 'modMetadataHandler',
	(configHandler,   modMetadataHandler) ->
		fs = require 'fs'
		pathUtil = require 'path'
		AdmZip = require 'adm-zip'
		rimraf = require 'rimraf'

		config = configHandler.get()
		bootstraps = [
			{path: pathUtil.join(config.gamepath, '/win32'), sourcePrefix: '../'},
			{path: pathUtil.join(config.gamepath, '/Starbound.app/Contents/MacOS'), sourcePrefix: '../../../'},
			{path: pathUtil.join(config.gamepath, '/linux32'), sourcePrefix: '../'},
			{path: pathUtil.join(config.gamepath, '/linux64'), sourcePrefix: '../'}
		]

		bootstraps.map (bootstrap) ->
			bootstrap.path = pathUtil.join(bootstrap.path, 'bootstrap.config')
			return bootstrap

		updateBootstraps = () ->
			modMetadata = [].concat(modMetadataHandler.get())

			# Use a relative path to the mods folder from the game folder
			# if the game path exists in the mods path.
			if config.modspath.indexOf(config.gamepath) isnt -1
				relativeModsPath = pathUtil.relative config.gamepath, config.modspath
			else
				relativeModsPath = config.modspath

			installedAssetSources = [{source: 'assets', order: 99999}]
			absoluteAssetSources = []

			# Resolve the correct paths for the mods and only use active mods
			for mod in modMetadata
				if mod.active is false then continue

				if mod.source.type is 'folder'
					absoluteAssetSources.push {source: mod.source.path, order: mod.order}
				else if mod.source.type is 'installed'
					installedAssetSources.push {source: pathUtil.join(relativeModsPath, mod.source.path), order: mod.order}

			# Update the asset sources to each bootstrap file
			for bootstrap in bootstraps
				# Resolve the "local" (specific to this bootstrap file) paths for the installed mods
				localInstalledAssetSources = installedAssetSources.map (assetSource) ->
					resolvedSource = angular.extend {}, assetSource
					resolvedSource.source = pathUtil.join bootstrap.sourcePrefix, assetSource.source

					return resolvedSource

				# Combine the local and absolute sources and sort them by load order
				assetSources = localInstalledAssetSources.concat(absoluteAssetSources)
				assetSources.sort (a, b) ->
					if a.order > b.order then return 1
					if a.order < b.order then return -1
					return 0

				# Use forward slashes even on Windows
				assetSources.map (assetSource) ->
					assetSource.source = assetSource.source.replace /[\\\/]+/g, '/'
					return assetSource
				
				# Get the current bootstrap file and update its asset sources
				bootstrapData = JSON.parse fs.readFileSync(bootstrap.path)

				# Use only the source/path part, the order is irrelevant at this point
				bootstrapData.assetSources = assetSources.map (assetSource) -> assetSource.source

				fs.writeFileSync bootstrap.path, JSON.stringify(bootstrapData)

		installFromZip = (path, callback) ->
			if pathUtil.extname(path) isnt '.zip'
				callback "File is not a .zip archive"
				return

			try
				zip = new AdmZip(path)
			catch e
				callback e.toString()

			# Make sure the mod has a metadata file first
			metadataEntry = zip.getEntry('mod.json')
			if metadataEntry is null
				callback "Mod metadata file (mod.json) was not found in the archive"
				return

			try
				modMetadata = JSON.parse metadataEntry.getData().toString('utf8')
			catch e
				callback "Invalid mod metadata (mod.json)"
				return
			
			if not modMetadata["internal-name"]? or modMetadata["internal-name"] is ""
				callback "Invalid internal name for mod"
				return

			# The folder where the mod is stored is named after the internal name
			dirname = modMetadata["internal-name"].replace /[^a-zA-Z0-9-_]+/g, '-'

			if dirname is ""
				callback "Empty filename"
				return

			installPath = pathUtil.join(config.modspath, dirname)

			fs.exists installPath, (exists) ->
				if exists
					callback "A mod with this name already exists. Try updating the existing one!"
					return

				# Extract the archive
				fs.mkdir installPath, () ->
					zip.extractAllTo installPath

					# Save the mod's metadata
					modMetadata.source =
						type: 'installed'
						path: dirname

					modMetadataHandler.addMod modMetadata
					modMetadataHandler.save()
					updateBootstraps()

					callback()

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

						fs.readFile modMetadataFilePath, (err, data) ->
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

							modMetadataHandler.addMod modMetadata
							modMetadataHandler.save()
							updateBootstraps()

							callback()

			return

		uninstall = (modMetadata, callback) ->
			if modMetadata.source.type is 'installed'
				uninstallFromArchive modMetadata, callback
			else if modMetadata.source.type is 'folder'
				uninstallFromFolder modMetadata, callback

			return

		uninstallFromArchive = (modMetadata, callback) ->
			modPath = pathUtil.join config.modspath, modMetadata.source.path

			finalize = () ->
				modMetadataHandler.removeMod modMetadata
				modMetadataHandler.save()
				updateBootstraps()

				if callback then callback()

			fs.exists modPath, (exists) ->
				if exists
					rimraf modPath, (err) ->
						if err then console.log 'rimraf error', err
						finalize()
				else
					finalize()

			return

		uninstallFromFolder = (modMetadata, callback) ->
			modMetadataHandler.removeMod modMetadata
			modMetadataHandler.save()
			updateBootstraps()

			callback()

			return

		refreshMods = () ->
			discoverArchiveInstallations()
			refreshAllModMetadata()
			modMetadataHandler.refresh()

			return

		discoverArchiveInstallations = () ->
			# Make sure the array we're looping stays intact during this operation
			# so that we won't hit undefined elements.
			allModMetadata = [].concat(modMetadataHandler.get())

			existingMods = {}

			# Gather our current mods into an object with their paths as the keys.
			# This enabled us to check if a mod already exists.
			for modMetadata, index in allModMetadata
				existingMods[modMetadata["internal-name"]] = allModMetadata[index]

			files = fs.readdirSync config.modspath
			for file in files
				if file.substr(0, 1) is '_' then continue

				filePath = pathUtil.normalize pathUtil.join(config.modspath, file)

				# Mods can only be directories here
				stat = fs.statSync filePath
				if not stat.isDirectory() then continue

				# Make sure a mod metadata file exists
				modMetadataFile = pathUtil.join filePath, 'mod.json'
				if not fs.existsSync(modMetadataFile) then continue

				# Make sure the metadata file can be read and parsed
				try
					modMetadata = JSON.parse fs.readFileSync(modMetadataFile)
				catch
					continue
			
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

					modMetadataHandler.removeMod modMetadata
					modMetadataHandler.addMod modMetadata
				else
					modMetadata.source = {type: 'installed', path: file}
					modMetadataHandler.addMod modMetadata

			modMetadataHandler.save()
			updateBootstraps()

		refreshAllModMetadata = () ->
			# Make sure the array we're looping stays intact during this operation
			# so that we won't hit undefined elements.
			allModMetadata = [].concat(modMetadataHandler.get())

			for modMetadata in allModMetadata
				if modMetadata.source.type is 'installed'
					modPath = pathUtil.join config.modspath, modMetadata.source.path
					modMetadataFile = pathUtil.join config.modspath, modMetadata.source.path, 'mod.json'
				else
					modPath = modMetadata.source.path
					modMetadataFile = pathUtil.join modMetadata.source.path, 'mod.json'

				if not fs.existsSync(modPath) or not fs.existsSync(modMetadataFile)
					modMetadataHandler.removeMod modMetadata
					continue

				modMetadataFromFile = JSON.parse fs.readFileSync(modMetadataFile)

				refreshedMetadata = angular.extend {}, modMetadata, modMetadataFromFile

				modMetadataHandler.removeMod refreshedMetadata
				modMetadataHandler.addMod refreshedMetadata

			modMetadataHandler.save()
			updateBootstraps()

		return {
			updateBootstraps: updateBootstraps
			installFromZip: installFromZip
			installFromFolder: installFromFolder
			uninstall: uninstall
			refreshMods: refreshMods
		}
]