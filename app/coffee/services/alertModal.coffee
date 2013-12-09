angular.module('starloader').factory 'infoModal', [
	'btfModal',
	(btfModal) ->
		return btfModal {
			controller: 'InfoModalCtrl',
			controllerAs: 'modal',
			templateUrl: 'templates/info-modal.html'
		}
]