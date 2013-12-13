angular.module('starloader').controller 'InputModalCtrl', [
	'$scope', 'inputModal',
	($scope,   inputModal) ->
		
		$scope.error = null
	
		$scope.validateEntry = () ->
			$scope.error = null
			if $scope.validate? 
				$scope.error = $scope.validate($scope.value)
			
	
		$scope.closeAndOkay = () ->
			inputModal.deactivate()
			if $scope.okay? then $scope.okay($scope.value)

		$scope.closeAndCancel = () ->
			inputModal.deactivate()
			if $scope.cancel? then $scope.cancel()
]