(function() {
  angular.module('starloader').controller('InitialSettingsModalCtrl', [
    '$scope', '$route', 'initialSettingsModal', 'createModsFolderModal', 'configHandler', function($scope, $route, initialSettingsModal, createModsFolderModal, configHandler) {
      var fs;
      fs = require('fs');
      $scope.config = configHandler.get();
      return $scope.saveAndClose = function() {
        var config;
        configHandler.save($scope.config);
        initialSettingsModal.deactivate();
        config = configHandler.get();
        if (!fs.existsSync(config.modspath)) {
          return createModsFolderModal.activate();
        } else {
          return $route.reload();
        }
      };
    }
  ]);

}).call(this);
