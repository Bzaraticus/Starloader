angular.module('starloader').factory 'initialSettingsModal', [
	'btfModal',
	(btfModal) ->
		return btfModal {
			controller: 'InitialSettingsModalCtrl'
			controllerAs: 'modal'
			templateUrl: 'templates/initial-settings-modal.html'
		}
]