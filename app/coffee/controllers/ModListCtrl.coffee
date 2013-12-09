angular.module('starloader').controller 'ModListCtrl', [
	'$scope', '$route', '$location', 'configHandler', 'modFolderHandler', 'modMetadataHandler', 'initialSettingsModal', 'modInstaller', 'confirmationModal', 'infoModal',
	($scope,   $route,   $location,   configHandler,   modFolderHandler,  modMetadataHandler,    initialSettingsModal,   modInstaller,   confirmationModal,   infoModal) ->
		fs = require 'fs'
		config = configHandler.get()

		if not config.gamepath? or not config.modspath?
			initialSettingsModal.activate()
			return
		
		if not modFolderHandler.exists()
			confirmationModal.activate {
				title: 'The \'mods\' directory does not exist'
				text: 'Create it?'
				yes: () ->
					modFolderHandler.create()
					$route.reload()
				no: () ->
					$location.path '/options'
			}
			return

		modMetadata = modMetadataHandler.get()
		if modMetadata is null
			modMetadataHandler.create()
			$route.reload()

		$scope.mods = modMetadata

		$scope.saveModMetadata = () ->
			modMetadataHandler.save()
			modInstaller.updateBootstraps()

		$scope.sortableOptions =
			stop: (e, ui) ->
				i = 1
				for mod, index in $scope.mods
					$scope.mods[index].order = i
					i++

				$scope.saveModMetadata()

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

			for mod, index in $scope.mods
				if mod['internal-name'] is modInternalName
					modToUpdate = $scope.mods[index]

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

		$scope.refreshMods = () ->
			modInstaller.refreshMods()
			$route.reload()
]