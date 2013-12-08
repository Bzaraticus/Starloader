angular.module('starloader').controller 'InitialSettingsModalCtrl', [
	'$scope', '$route', 'initialSettingsModal', 'createModsFolderModal', 'configHandler',
	($scope,   $route,   initialSettingsModal,   createModsFolderModal,   configHandler) ->
		fs = require 'fs'

		$scope.config = configHandler.get()

		$scope.saveAndClose = () ->
			configHandler.save($scope.config)
			initialSettingsModal.deactivate()

			config = configHandler.get()
			if not fs.existsSync(config.modspath)
				createModsFolderModal.activate()
			else
				$route.reload()
]