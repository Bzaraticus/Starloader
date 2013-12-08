(function() {
  angular.module('starloader').controller('CreateModsFolderModalCtrl', [
    '$scope', '$route', 'createModsFolderModal', 'modFolderHandler', 'configHandler', function($scope, $route, createModsFolderModal, modFolderHandler, configHandler) {
      var config, fs;
      fs = require('fs');
      config = configHandler.get();
      $scope.createAndClose = function() {
        modFolderHandler.create();
        createModsFolderModal.deactivate();
        return $route.reload();
      };
      return $scope.close = function() {
        createModsFolderModal.deactivate();
        return $route.reload();
      };
    }
  ]);

}).call(this);
