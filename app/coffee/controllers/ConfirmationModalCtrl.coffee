angular.module('starloader').controller 'ConfirmationModalCtrl', [
	'$scope', 'confirmationModal',
	($scope,   confirmationModal) ->
		$scope.closeAndYes = () ->
			confirmationModal.deactivate()
			if $scope.yes? then $scope.yes()

		$scope.closeAndNo = () ->
			confirmationModal.deactivate()
			if $scope.no? then $scope.no()
]