(function() {
  angular.module('starloader').controller('ModListCtrl', [
    '$scope', 'configHandler', 'modFolderHandler', 'modMetadataHandler', 'createModsFolderModal', 'initialSettingsModal', function($scope, configHandler, modFolderHandler, modMetadataHandler, createModsFolderModal, initialSettingsModal) {
      var config, fs, modMetadata;
      fs = require('fs');
      config = configHandler.get();
      if ((config.gamepath == null) || (config.modspath == null)) {
        initialSettingsModal.activate();
        return;
      }
      if (!modFolderHandler.exists()) {
        createModsFolderModal.activate();
        return;
      }
      modMetadata = modMetadataHandler.get();
      if (modMetadata === null) {
        modMetadataHandler.create();
        modMetadataHandler.refresh();
        modMetadata = modMetadataHandler.get();
      }
      return $scope.mods = modMetadata;
    }
  ]);

}).call(this);
