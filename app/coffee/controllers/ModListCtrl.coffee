window.starloader.controller 'ModListCtrl', [
	'$scope',
	($scope) ->
		$scope.mods = [
			{
				"name": "Test mod"
				"version": "1.0.0"
				"author": "Test guy"
				"order": 1
			}
			{
				"name": "Megamod"
				"version": "1.mega"
				"author": "Megamega"
				"order": 2
			}
		]

		$scope.text = 'yay'
]