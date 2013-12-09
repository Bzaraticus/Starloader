angular.module('starloader').controller 'OptionsCtrl', [
	'$scope', 'configHandler',
	($scope,   configHandler) ->
		$scope.config = configHandler.get()

		$scope.save = () ->
			configHandler.save $scope.config
]