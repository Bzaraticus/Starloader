window.starloader.config [
	'$compileProvider',
	($compileProvider) ->
		$compileProvider.aHrefSanitizationWhitelist /^\s*(https?|ftp|mailto|file|tel):/
]

window.starloader.config [
	'$routeProvider', '$locationProvider',
	($routeProvider,   $locationProvider) ->
		$routeProvider.when '/modlist', {
			templateUrl: './templates/modlist.html'
			controller: 'ModListCtrl'
		}

		$routeProvider.when '/license', {
			templateUrl: './templates/license.html'
		}

		$routeProvider.when '/options', {
			templateUrl: './templates/options.html'
		}

		$routeProvider.when '/about', {
			templateUrl: './templates/about.html'
		}

		$routeProvider.otherwise {
			redirectTo: '/modlist'
		}

		$locationProvider.html5Mode false
]