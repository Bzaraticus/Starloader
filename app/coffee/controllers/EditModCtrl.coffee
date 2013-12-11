angular.module('starloader').controller 'EditModCtrl', [
	'$scope', '$route', '$routeParams', '$location', 'config', 'confirmationModal', 'infoModal', 'modEditor', 'modRepository'
	($scope,   $route,   $routeParams,   $location,   config,   confirmationModal,   infoModal,   modEditor,   modRepository) ->
		fs = require 'fs'
		
		modMeta = modEditor.getMetaData()
		modFiles = modEditor.getFiles()

		$scope.mod = angular.extend {}, modMeta
		
		$scope.resetModInfo = () ->
			$scope.mod = angular.extend {}, modMeta
		
		$scope.saveModInfo = () ->
			# Validate input
			if $scope.modinfo.$valid is false
				infoModal.activate {
					title: 'Error'
					text: 'Invalid mod info'
				}
				return
			if $scope.mod['internal-name'] isnt modMeta['internal-name'] 
				modRepository.remove modMeta
			modMeta = $scope.mod
			modEditor.saveMod modMeta
			infoModal.activate {
				title: 'Success'
				text: 'Successfully saved mod info'
			}
]