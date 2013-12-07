starloader.config [
	'$compileProvider',
	($compileProvider) ->
		$compileProvider.aHrefSanitizationWhitelist /^\s*(https?|ftp|mailto|file|tel):/
]

starloader.config [
	'$routeProvider', '$locationProvider',
	($routeProvider,   $locationProvider) ->
		$routeProvider.when '/modlist', {
			templateUrl: './templates/modlist.html'
			controller: 'ModListCtrl'
		}

		$routeProvider.otherwise {
			redirectTo: '/modlist'
		}

		$locationProvider.html5Mode false
]