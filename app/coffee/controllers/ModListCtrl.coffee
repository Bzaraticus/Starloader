angular.module('starloader').controller 'ModListCtrl', [
	'$scope', '$route', '$location', 'config', 'modFolderHandler', 'modRepository', 'initialSettingsModal', 'modInstaller', 'confirmationModal', 'infoModal', 'modEditor',
	($scope,   $route,   $location,   config,   modFolderHandler,  modRepository,    initialSettingsModal,   modInstaller,   confirmationModal,   infoModal,   modEditor) ->
		fs = require 'fs'

		if not config.get('gamepath')? or not config.get('modspath')?
			console.log config.get(), config.get('gamepath'), config.get('modspath')
			initialSettingsModal.activate()
			return
		
		if not modFolderHandler.exists()
			confirmationModal.activate {
				title: 'The \'mods\' directory does not exist'
				text: 'Create it? (' + config.get('modspath') + ')'
				yes: () ->
					modFolderHandler.create()
					$route.reload()
				no: () ->
					$location.path '/options'
			}
			return

		console.log 'refreshing'
		modRepository.refresh()

		allMods = modRepository.get()
		$scope.mods = allMods

		# Options for the directive sortable
		$scope.sortableOptions = {
			stop: (e, ui) ->
				i = 1
				for mod, index in allMods
					allMods[index].order = i
					i++

				modRepository.save allMods
				modInstaller.applyModInstallations()
		}

		$scope.addFromFile = (file) ->
			modInstaller.installFromZip file, (err) ->
				if err then infoModal.activate {title: 'Error', text: err.toString()}

				$route.reload()

		$scope.addFromFolder = (folder) ->
			modInstaller.installFromFolder folder, (err) ->
				if err then infoModal.activate {title: 'Error', text: err.toString()}

				$route.reload()

		$scope.updateModFromInput = (input) ->
			file = input.value
			$input = $(input)
			modInternalName = $input.siblings('.update-internal-name').html()
			modToUpdate = null

			for mod, index in allMods
				if mod['internal-name'] is modInternalName
					modToUpdate = allMods[index]
					break

			if modToUpdate is null
				return

			modInstaller.uninstall modToUpdate, (err) ->
				if err then infoModal.activate {title: 'Error', text: err.toString()}

				$scope.addFromFile file

		$scope.uninstallMod = (mod) ->
			confirmationModal.activate {
				title: 'Are you sure?'
				text: 'Remove `' + mod.name + '`?'
				yes: () ->
					modInstaller.uninstall mod, (err) ->
						if err then infoModal.activate {title: 'Error', text: err.toString()}

						$route.reload()
			}
			
		$scope.createMod = (folder) ->
			modEditor.createMod folder
			$location.path '/editmod'
			$scope.$apply()

		$scope.editMod = (mod) ->
			modEditor.loadMod mod
			$location.path '/editmod'

		$scope.refreshMods = () ->
			modInstaller.refreshMods()
			$route.reload()

		$scope.updateModActivity = (mod) ->
			if mod.active then modInstaller.activateMod(mod)
			else modInstaller.deactivateMod(mod)

			$route.reload()
]