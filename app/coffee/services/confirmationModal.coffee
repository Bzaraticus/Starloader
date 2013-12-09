angular.module('starloader').factory 'confirmationModal', [
	'btfModal',
	(btfModal) ->
		return btfModal {
			controller: 'ConfirmationModalCtrl',
			controllerAs: 'modal',
			templateUrl: 'templates/confirmation-modal.html'
		}
]