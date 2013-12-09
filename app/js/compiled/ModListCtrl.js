(function() {
  angular.module('starloader').controller('ModListCtrl', [
    '$scope', '$route', '$location', 'configHandler', 'modFolderHandler', 'modMetadataHandler', 'initialSettingsModal', 'modInstaller', 'confirmationModal', 'infoModal', function($scope, $route, $location, configHandler, modFolderHandler, modMetadataHandler, initialSettingsModal, modInstaller, confirmationModal, infoModal) {
      var config, fs, modMetadata;
      fs = require('fs');
      config = configHandler.get();
      if ((config.gamepath == null) || (config.modspath == null)) {
        initialSettingsModal.activate();
        return;
      }
      if (!modFolderHandler.exists()) {
        confirmationModal.activate({
          title: 'The \'mods\' directory does not exist',
          text: 'Create it?',
          yes: function() {
            modFolderHandler.create();
            return $route.reload();
          },
          no: function() {
            return $location.path('/options');
          }
        });
        return;
      }
      modMetadata = modMetadataHandler.get();
      if (modMetadata === null) {
        modMetadataHandler.create();
        $route.reload();
      }
      $scope.mods = modMetadata;
      $scope.saveModMetadata = function() {
        modMetadataHandler.save();
        return modInstaller.updateBootstraps();
      };
      $scope.sortableOptions = {
        stop: function(e, ui) {
          var i, index, mod, _i, _len, _ref;
          i = 1;
          _ref = $scope.mods;
          for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
            mod = _ref[index];
            $scope.mods[index].order = i;
            i++;
          }
          return $scope.saveModMetadata();
        }
      };
      $scope.addFromFile = function(file) {
        return modInstaller.installFromZip(file, function(err) {
          if (err) {
            infoModal.activate({
              title: 'Error',
              text: err.toString()
            });
          }
          return $route.reload();
        });
      };
      $scope.addFromFolder = function(folder) {
        return modInstaller.installFromFolder(folder, function(err) {
          if (err) {
            infoModal.activate({
              title: 'Error',
              text: err.toString()
            });
          }
          return $route.reload();
        });
      };
      $scope.updateModFromInput = function(input) {
        var $input, file, index, mod, modInternalName, modToUpdate, _i, _len, _ref;
        file = input.value;
        $input = $(input);
        modInternalName = $input.siblings('.update-internal-name').html();
        modToUpdate = null;
        _ref = $scope.mods;
        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
          mod = _ref[index];
          if (mod['internal-name'] === modInternalName) {
            modToUpdate = $scope.mods[index];
          }
        }
        if (modToUpdate === null) {
          return;
        }
        return modInstaller.uninstall(modToUpdate, function(err) {
          if (err) {
            infoModal.activate({
              title: 'Error',
              text: err.toString()
            });
          }
          return $scope.addFromFile(file);
        });
      };
      $scope.uninstallMod = function(mod) {
        return confirmationModal.activate({
          title: 'Are you sure?',
          text: 'Remove `' + mod.name + '`?',
          yes: function() {
            return modInstaller.uninstall(mod, function(err) {
              if (err) {
                infoModal.activate({
                  title: 'Error',
                  text: err.toString()
                });
              }
              return $route.reload();
            });
          }
        });
      };
      return $scope.refreshMods = function() {
        modInstaller.refreshMods();
        return $route.reload();
      };
    }
  ]);

}).call(this);
