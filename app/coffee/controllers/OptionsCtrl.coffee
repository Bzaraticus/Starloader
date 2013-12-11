angular.module('starloader').controller 'OptionsCtrl', [
	'$scope', 'config', 'infoModal',
	($scope,   config,   infoModal) ->
		$scope.config = config.get()

		$scope.save = () ->
			config.save $scope.config
			infoModal.activate {
				title: 'Success'
				text: 'Settings saved'
			}
]