angular.module('starloader').controller 'ModListCtrl', [
	'$scope', 'configHandler', 'modFolderHandler', 'modMetadataHandler', 'createModsFolderModal', 'initialSettingsModal',
	($scope,   configHandler,   modFolderHandler,  modMetadataHandler,   createModsFolderModal,   initialSettingsModal) ->
		fs = require 'fs'
		config = configHandler.get()

		if not config.gamepath? or not config.modspath?
			initialSettingsModal.activate()
			return
		
		if not modFolderHandler.exists()
			createModsFolderModal.activate()
			return

		modMetadata = modMetadataHandler.get()
		if modMetadata is null
			modMetadataHandler.create()
			modMetadataHandler.refresh()
			modMetadata = modMetadataHandler.get()

		$scope.mods = modMetadata
]