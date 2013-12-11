angular.module('starloader').controller 'EditModCtrl', [
	'$scope', '$route', '$routeParams', '$location', 'config', 'confirmationModal', 'infoModal', 'modEditor'
	($scope,   $route,   $routeParams,   $location,   config,   confirmationModal,   infoModal,   modEditor) ->
		fs = require 'fs'

		$scope.mod = modEditor.metaData
		
		$scope.saveMod = () ->
			modEditor.saveMod()
			$location.path "/modlist"
]