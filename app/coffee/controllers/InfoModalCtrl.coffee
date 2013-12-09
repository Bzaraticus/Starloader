angular.module('starloader').controller 'InfoModalCtrl', [
	'$scope', 'infoModal',
	($scope,   infoModal) ->
		$scope.close = () ->
			infoModal.deactivate()
]