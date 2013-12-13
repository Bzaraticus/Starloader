angular.module('starloader').factory 'inputModal', [
	'btfModal',
	(btfModal) ->
		return btfModal {
			controller: 'InputModalCtrl',
			controllerAs: 'modal',
			templateUrl: 'templates/input-modal.html'
		}
]