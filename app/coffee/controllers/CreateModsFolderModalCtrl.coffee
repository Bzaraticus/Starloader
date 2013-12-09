angular.module('starloader').controller 'CreateModsFolderModalCtrl', [
	'$scope', '$route', 'createModsFolderModal', 'modFolderHandler', 'configHandler',
	($scope,   $route,   createModsFolderModal,   modFolderHandler,  configHandler) ->
		$scope.createAndClose = () ->
			modFolderHandler.create()
			createModsFolderModal.deactivate()
			$route.reload()

		$scope.close = () ->
			createModsFolderModal.deactivate()
			$route.reload()
]