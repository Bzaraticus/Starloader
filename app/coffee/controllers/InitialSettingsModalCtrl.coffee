angular.module('starloader').controller 'InitialSettingsModalCtrl', [
	'$scope', '$route', 'initialSettingsModal', 'createModsFolderModal', 'configHandler',
	($scope,   $route,   initialSettingsModal,   createModsFolderModal,   configHandler) ->
		fs = require 'fs'

		$scope.config = configHandler.get()

		$scope.saveAndClose = () ->
			configHandler.save()
			initialSettingsModal.deactivate()
			$route.reload()
]