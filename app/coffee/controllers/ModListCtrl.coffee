starloader.controller 'ModListCtrl', [
	'$scope',
	($scope) ->
		$scope.mods = [
			{
				"name": "Test mod"
				"version": "1.0.0"
				"author": "Test guy"
			}
		]

		$scope.text = 'yay'
]