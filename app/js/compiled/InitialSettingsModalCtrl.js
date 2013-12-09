(function() {
  angular.module('starloader').controller('InitialSettingsModalCtrl', [
    '$scope', '$route', 'initialSettingsModal', 'createModsFolderModal', 'configHandler', function($scope, $route, initialSettingsModal, createModsFolderModal, configHandler) {
      var fs;
      fs = require('fs');
      $scope.config = configHandler.get();
      return $scope.saveAndClose = function() {
        configHandler.save();
        initialSettingsModal.deactivate();
        return $route.reload();
      };
    }
  ]);

}).call(this);
