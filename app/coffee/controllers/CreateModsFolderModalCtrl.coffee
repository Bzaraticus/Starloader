angular.module('starloader').controller 'CreateModsFolderModalCtrl', [
	'$scope', '$route', 'createModsFolderModal', 'modFolderHandler',
	($scope,   $route,   createModsFolderModal,   modFolderHandler) ->
		$scope.createAndClose = () ->
			modFolderHandler.create()
			createModsFolderModal.deactivate()

			$route.reload()

		$scope.close = () ->
			createModsFolderModal.deactivate()
			
			$route.reload()
]