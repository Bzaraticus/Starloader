angular.module('starloader').factory 'createModsFolderModal', [
	'btfModal',
	(btfModal) ->
		return btfModal {
			controller: 'CreateModsFolderModalCtrl'
			controllerAs: 'modal'
			templateUrl: 'templates/create-mods-folder-modal.html'
		}
]