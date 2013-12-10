angular.module('starloader').controller 'InitialSettingsModalCtrl', [
	'$scope', '$route', 'initialSettingsModal', 'config',
	($scope,   $route,   initialSettingsModal,   config) ->
		fs = require 'fs'

		fullConfig = config.get()
		$scope.config = fullConfig

		$scope.saveAndClose = () ->
			config.save(fullConfig)
			initialSettingsModal.deactivate()
			
			$route.reload()
]