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

(function() {
  angular.module('starloader').config([
    '$compileProvider', function($compileProvider) {
      return $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
    }
  ]);

  angular.module('starloader').config([
    '$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
      $routeProvider.when('/modlist', {
        templateUrl: './templates/modlist.html',
        controller: 'ModListCtrl'
      });
      $routeProvider.when('/license', {
        templateUrl: './templates/license.html'
      });
      $routeProvider.when('/options', {
        templateUrl: './templates/options.html'
      });
      $routeProvider.when('/about', {
        templateUrl: './templates/about.html'
      });
      $routeProvider.otherwise({
        redirectTo: '/modlist'
      });
      return $locationProvider.html5Mode(false);
    }
  ]);

}).call(this);

(function() {
  angular.module('starloader').factory('configHandler', function() {
    var config, configFile, create, fs, refresh, save;
    fs = require('fs');
    configFile = './config.json';
    config = {};
    refresh = function() {
      if (fs.existsSync(configFile)) {
        return config = JSON.parse(fs.readFileSync(configFile));
      } else {
        create();
        return config = {};
      }
    };
    save = function(userConfig) {
      var newConfig;
      newConfig = angular.extend({}, config, userConfig);
      fs.writeFileSync(configFile, JSON.stringify(newConfig));
      return refresh();
    };
    create = function() {
      return fs.writeFileSync(configFile, '{}');
    };
    return {
      get: function() {
        return config;
      },
      refresh: refresh,
      save: save,
      create: create
    };
  });

}).call(this);

(function() {
  angular.module('starloader').factory('createModsFolderModal', [
    'btfModal', function(btfModal) {
      return btfModal({
        controller: 'CreateModsFolderModalCtrl',
        controllerAs: 'modal',
        templateUrl: 'templates/create-mods-folder-modal.html'
      });
    }
  ]);

}).call(this);

(function() {
  angular.module('starloader').factory('initialSettingsModal', [
    'btfModal', function(btfModal) {
      return btfModal({
        controller: 'InitialSettingsModalCtrl',
        controllerAs: 'modal',
        templateUrl: 'templates/initial-settings-modal.html'
      });
    }
  ]);

}).call(this);

(function() {
  angular.module('starloader').factory('modFolderHandler', [
    'configHandler', function(configHandler) {
      var create, exists, fs;
      fs = require('fs');
      exists = function() {
        var config;
        configHandler.refresh();
        config = configHandler.get();
        return fs.existsSync(config.modspath);
      };
      create = function() {
        var config;
        configHandler.refresh();
        config = configHandler.get();
        fs.mkdirSync(config.modspath);
      };
      return {
        exists: exists,
        create: create
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('starloader').factory('modMetadataHandler', [
    'configHandler', function(configHandler) {
      var create, fs, mods, modsFilePath, refresh, refreshModsFilePath, save;
      fs = require('fs');
      modsFilePath = '';
      mods = {};
      refreshModsFilePath = function() {
        var config;
        configHandler.refresh();
        config = configHandler.get();
        return modsFilePath = config.modspath + '/mods.json';
      };
      refresh = function() {
        refreshModsFilePath();
        if (fs.existsSync(modsFilePath)) {
          return mods = JSON.parse(fs.readFileSync(modsFilePath, {
            encoding: 'utf8'
          }));
        } else {
          return mods = null;
        }
      };
      save = function(userMods) {
        refreshModsFilePath();
        return fs.writeFileSync(modsFilePath, JSON.stringify(userMods));
      };
      create = function() {
        refreshModsFilePath();
        console.log(modsFilePath);
        return fs.writeFileSync(modsFilePath, '[]');
      };
      refresh();
      return {
        get: function() {
          return mods;
        },
        save: save,
        refresh: refresh,
        create: create
      };
    }
  ]);

}).call(this);
