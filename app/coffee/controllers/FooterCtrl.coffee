angular.module('starloader').controller 'FooterCtrl', [
	'$scope',
	($scope) ->
		appInfo = require '../package.json'
		$scope.version = 'v' + appInfo.version
]