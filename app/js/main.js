(function() {
  angular.module('starloader').factory('confirmationModal', [
    'btfModal', function(btfModal) {
      return btfModal({
        controller: 'ConfirmationModalCtrl',
        controllerAs: 'modal',
        templateUrl: 'templates/confirmation-modal.html'
      });
    }
  ]);

}).call(this);

(function() {
  angular.module('starloader').controller('ConfirmationModalCtrl', [
    '$scope', 'confirmationModal', function($scope, confirmationModal) {
      $scope.closeAndYes = function() {
        confirmationModal.deactivate();
        if ($scope.yes != null) {
          return $scope.yes();
        }
      };
      return $scope.closeAndNo = function() {
        confirmationModal.deactivate();
        if ($scope.no != null) {
          return $scope.no();
        }
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('starloader').controller('CreateModsFolderModalCtrl', [
    '$scope', '$route', 'createModsFolderModal', 'modFolderHandler', 'configHandler', function($scope, $route, createModsFolderModal, modFolderHandler, configHandler) {
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
  angular.module('starloader').controller('FooterCtrl', [
    '$scope', function($scope) {
      var appInfo;
      appInfo = require('../package.json');
      return $scope.version = 'v' + appInfo.version;
    }
  ]);

}).call(this);

(function() {
  angular.module('starloader').controller('InfoModalCtrl', [
    '$scope', 'infoModal', function($scope, infoModal) {
      return $scope.close = function() {
        return infoModal.deactivate();
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
        configHandler.save();
        initialSettingsModal.deactivate();
        return $route.reload();
      };
    }
  ]);

}).call(this);

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

(function() {
  angular.module('starloader').controller('OptionsCtrl', [
    '$scope', 'configHandler', function($scope, configHandler) {
      $scope.config = configHandler.get();
      return $scope.save = function() {
        return configHandler.save($scope.config);
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('starloader').factory('infoModal', [
    'btfModal', function(btfModal) {
      return btfModal({
        controller: 'InfoModalCtrl',
        controllerAs: 'modal',
        templateUrl: 'templates/info-modal.html'
      });
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
        templateUrl: './templates/options.html',
        controller: 'OptionsCtrl'
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
      var configJson, e;
      if (fs.existsSync(configFile)) {
        try {
          configJson = fs.readFileSync(configFile, {
            encoding: 'utf8'
          });
          config = JSON.parse(configJson);
        } catch (_error) {
          e = _error;
          console.error(e.toString());
        }
      } else {
        create();
      }
    };
    save = function(userConfig) {
      if (userConfig != null) {
        angular.extend(config, userConfig);
      }
      fs.writeFileSync(configFile, angular.toJson(config));
    };
    create = function() {
      config = {};
      save();
    };
    refresh();
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
  angular.module('starloader').factory('modInstaller', [
    'configHandler', 'modMetadataHandler', function(configHandler, modMetadataHandler) {
      var AdmZip, bootstraps, config, discoverArchiveInstallations, fs, generateMergedPlayerConfig, installFromFolder, installFromZip, pathUtil, refreshAllModMetadata, refreshMods, rimraf, uninstall, uninstallFromArchive, uninstallFromFolder, updateBootstraps;
      fs = require('fs');
      pathUtil = require('path');
      AdmZip = require('adm-zip');
      rimraf = require('rimraf');
      bootstraps = [
        {
          path: '/win32',
          sourcePrefix: '../'
        }, {
          path: '/Starbound.app/Contents/MacOS',
          sourcePrefix: '../../../'
        }, {
          path: '/linux32',
          sourcePrefix: '../'
        }, {
          path: '/linux64',
          sourcePrefix: '../'
        }
      ];
      config = configHandler.get();
      updateBootstraps = function() {
        var absoluteAssetSources, assetSources, bootstrap, bootstrapData, installedAssetSources, localBootstraps, localInstalledAssetSources, mod, modMetadata, relativeModsPath, _i, _j, _len, _len1, _results;
        modMetadata = [].concat(modMetadataHandler.get());
        localBootstraps = bootstraps.map(function(bootstrap) {
          var localBootstrap;
          localBootstrap = angular.extend({}, bootstrap);
          localBootstrap.path = pathUtil.join(config.gamepath, localBootstrap.path, 'bootstrap.config');
          return localBootstrap;
        });
        if (config.modspath.indexOf(config.gamepath) !== -1) {
          relativeModsPath = pathUtil.relative(config.gamepath, config.modspath);
        } else {
          relativeModsPath = config.modspath;
        }
        installedAssetSources = [
          {
            source: 'assets',
            order: 99999
          }
        ];
        absoluteAssetSources = [];
        for (_i = 0, _len = modMetadata.length; _i < _len; _i++) {
          mod = modMetadata[_i];
          if (mod.active === false) {
            continue;
          }
          if (mod.source.type === 'folder') {
            absoluteAssetSources.push({
              source: mod.source.path,
              order: mod.order
            });
          } else if (mod.source.type === 'installed') {
            installedAssetSources.push({
              source: pathUtil.join(relativeModsPath, mod.source.path),
              order: mod.order
            });
          }
        }
        _results = [];
        for (_j = 0, _len1 = localBootstraps.length; _j < _len1; _j++) {
          bootstrap = localBootstraps[_j];
          localInstalledAssetSources = installedAssetSources.map(function(assetSource) {
            var resolvedSource;
            resolvedSource = angular.extend({}, assetSource);
            resolvedSource.source = pathUtil.join(bootstrap.sourcePrefix, assetSource.source);
            return resolvedSource;
          });
          assetSources = localInstalledAssetSources.concat(absoluteAssetSources);
          assetSources.sort(function(a, b) {
            if (a.order > b.order) {
              return 1;
            }
            if (a.order < b.order) {
              return -1;
            }
            return 0;
          });
          assetSources.map(function(assetSource) {
            assetSource.source = assetSource.source.replace(/[\\\/]+/g, '/');
            return assetSource;
          });
          bootstrapData = JSON.parse(fs.readFileSync(bootstrap.path));
          bootstrapData.assetSources = assetSources.map(function(assetSource) {
            return assetSource.source;
          });
          _results.push(fs.writeFileSync(bootstrap.path, JSON.stringify(bootstrapData)));
        }
        return _results;
      };
      installFromZip = function(path, callback) {
        var dirname, e, installPath, metadataEntry, modMetadata, zip;
        if (pathUtil.extname(path) !== '.zip') {
          callback("File is not a .zip archive");
          return;
        }
        try {
          zip = new AdmZip(path);
        } catch (_error) {
          e = _error;
          callback(e.toString());
        }
        metadataEntry = zip.getEntry('mod.json');
        if (metadataEntry === null) {
          callback("Mod metadata file (mod.json) was not found in the archive");
          return;
        }
        try {
          modMetadata = JSON.parse(metadataEntry.getData().toString('utf8'));
        } catch (_error) {
          e = _error;
          callback("Invalid mod metadata (mod.json)");
          return;
        }
        if ((modMetadata["internal-name"] == null) || modMetadata["internal-name"] === "") {
          callback("Invalid internal name for mod");
          return;
        }
        dirname = modMetadata["internal-name"].replace(/[^a-zA-Z0-9-_]+/g, '-');
        if (dirname === "") {
          callback("Empty filename");
          return;
        }
        installPath = pathUtil.join(config.modspath, dirname);
        return fs.exists(installPath, function(exists) {
          if (exists) {
            callback("A mod with this name already exists. Try updating the existing one!");
            return;
          }
          return fs.mkdir(installPath, function() {
            zip.extractAllTo(installPath);
            modMetadata.source = {
              type: 'installed',
              path: dirname
            };
            modMetadataHandler.addMod(modMetadata);
            modMetadataHandler.save();
            updateBootstraps();
            return callback();
          });
        });
      };
      installFromFolder = function(path, callback) {
        var metadataFilePath;
        metadataFilePath = pathUtil.join(path, 'mod.json');
        fs.exists(path, function(exists) {
          if (!exists) {
            callback("Folder not found");
            return;
          }
          return fs.stat(path, function(err, stats) {
            if (err || !stats.isDirectory()) {
              callback("Target is not a folder");
              return;
            }
            return fs.exists(metadataFilePath, function(exists) {
              if (!exists) {
                callback("Mod metadata file (mod.json) was not found in the folder");
                return;
              }
              return fs.readFile(modMetadataFilePath, function(err, data) {
                var e, modMetadata;
                try {
                  modMetadata = JSON.parse(data);
                } catch (_error) {
                  e = _error;
                  callback("Invalid mod metadata (mod.json): " + e.toString());
                  return;
                }
                if ((modMetadata["internal-name"] == null) || modMetadata["internal-name"] === "") {
                  callback("Invalid internal name for mod");
                  return;
                }
                modMetadata.source = {
                  type: 'folder',
                  path: path
                };
                modMetadataHandler.addMod(modMetadata);
                modMetadataHandler.save();
                updateBootstraps();
                return callback();
              });
            });
          });
        });
      };
      uninstall = function(modMetadata, callback) {
        if (modMetadata.source.type === 'installed') {
          uninstallFromArchive(modMetadata, callback);
        } else if (modMetadata.source.type === 'folder') {
          uninstallFromFolder(modMetadata, callback);
        }
      };
      uninstallFromArchive = function(modMetadata, callback) {
        var finalize, modPath;
        modPath = pathUtil.join(config.modspath, modMetadata.source.path);
        finalize = function() {
          modMetadataHandler.removeMod(modMetadata);
          modMetadataHandler.save();
          updateBootstraps();
          if (callback) {
            return callback();
          }
        };
        fs.exists(modPath, function(exists) {
          if (exists) {
            return rimraf(modPath, function(err) {
              if (err) {
                console.log('rimraf error', err);
              }
              return finalize();
            });
          } else {
            return finalize();
          }
        });
      };
      uninstallFromFolder = function(modMetadata, callback) {
        modMetadataHandler.removeMod(modMetadata);
        modMetadataHandler.save();
        updateBootstraps();
        callback();
      };
      refreshMods = function() {
        discoverArchiveInstallations();
        refreshAllModMetadata();
        modMetadataHandler.refresh();
      };
      discoverArchiveInstallations = function() {
        var allModMetadata, existingMods, file, filePath, files, index, modMetadata, modMetadataFile, stat, _i, _j, _len, _len1;
        allModMetadata = [].concat(modMetadataHandler.get());
        existingMods = {};
        for (index = _i = 0, _len = allModMetadata.length; _i < _len; index = ++_i) {
          modMetadata = allModMetadata[index];
          existingMods[modMetadata["internal-name"]] = allModMetadata[index];
        }
        files = fs.readdirSync(config.modspath);
        for (_j = 0, _len1 = files.length; _j < _len1; _j++) {
          file = files[_j];
          if (file.substr(0, 1) === '_') {
            continue;
          }
          filePath = pathUtil.normalize(pathUtil.join(config.modspath, file));
          stat = fs.statSync(filePath);
          if (!stat.isDirectory()) {
            continue;
          }
          modMetadataFile = pathUtil.join(filePath, 'mod.json');
          if (!fs.existsSync(modMetadataFile)) {
            continue;
          }
          try {
            modMetadata = JSON.parse(fs.readFileSync(modMetadataFile));
          } catch (_error) {
            continue;
          }
          if ((modMetadata["internal-name"] == null) || modMetadata["internal-name"] === "") {
            continue;
          }
          if (existingMods[modMetadata["internal-name"]] != null) {
            modMetadata = angular.extend({}, existingMods[modMetadata["internal-name"]], modMetadata);
            if (modMetadata.source.type === 'installed') {
              modMetadata.source.path = file;
            } else {
              modMetadata.source.path = filePath;
            }
            modMetadataHandler.removeMod(modMetadata);
            modMetadataHandler.addMod(modMetadata);
          } else {
            modMetadata.source = {
              type: 'installed',
              path: file
            };
            modMetadataHandler.addMod(modMetadata);
          }
        }
        modMetadataHandler.save();
        return updateBootstraps();
      };
      refreshAllModMetadata = function() {
        var allModMetadata, modMetadata, modMetadataFile, modMetadataFromFile, modPath, refreshedMetadata, _i, _len;
        allModMetadata = [].concat(modMetadataHandler.get());
        for (_i = 0, _len = allModMetadata.length; _i < _len; _i++) {
          modMetadata = allModMetadata[_i];
          if (modMetadata.source.type === 'installed') {
            modPath = pathUtil.join(config.modspath, modMetadata.source.path);
            modMetadataFile = pathUtil.join(config.modspath, modMetadata.source.path, 'mod.json');
          } else {
            modPath = modMetadata.source.path;
            modMetadataFile = pathUtil.join(modMetadata.source.path, 'mod.json');
          }
          if (!fs.existsSync(modPath) || !fs.existsSync(modMetadataFile)) {
            modMetadataHandler.removeMod(modMetadata);
            continue;
          }
          modMetadataFromFile = JSON.parse(fs.readFileSync(modMetadataFile));
          refreshedMetadata = angular.extend({}, modMetadata, modMetadataFromFile);
          modMetadataHandler.removeMod(refreshedMetadata);
          modMetadataHandler.addMod(refreshedMetadata);
        }
        modMetadataHandler.save();
        return updateBootstraps();
      };
      generateMergedPlayerConfig = function() {
        /*
        				TODO BLARGH
        */

        var allModMetadata, configFiles, modMetadata, modPath, _i, _len, _results;
        allModMetadata = [].concat(modMetadataHandler.get());
        configFiles = pathUtil.join(config.gamepath, 'assets/player.config');
        _results = [];
        for (_i = 0, _len = allModMetadata.length; _i < _len; _i++) {
          modMetadata = allModMetadata[_i];
          modPath = '';
          if (modMetadata.source.type === 'installed') {
            modPath = pathUtil.join(config.modspath, modMetadata.source.path);
          } else {
            modPath = modMetadata.source.path;
          }
          if (fs.existsSync(fileUtil.join(modPath, 'player.config'))) {
            _results.push(configFiles.push(fileUtil.join(modPath, 'player.config')));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };
      return {
        updateBootstraps: updateBootstraps,
        installFromZip: installFromZip,
        installFromFolder: installFromFolder,
        uninstall: uninstall,
        refreshMods: refreshMods
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('starloader').factory('modMetadataHandler', [
    'configHandler', function(configHandler) {
      var addMod, create, defaultModMetadata, fs, mods, modsFilePath, pathUtil, refresh, refreshModsFilePath, removeMod, save, sortByOrder;
      fs = require('fs');
      pathUtil = require('path');
      modsFilePath = null;
      mods = null;
      defaultModMetadata = {
        "internal-name": "",
        "name": "",
        "author": "",
        "version": "",
        "order": 0,
        "source": {
          "type": "",
          "path": ""
        },
        "active": true
      };
      sortByOrder = function(a, b) {
        if (a.order > b.order) {
          return 1;
        }
        if (a.order < b.order) {
          return -1;
        }
        return 0;
      };
      refreshModsFilePath = function() {
        var config;
        configHandler.refresh();
        config = configHandler.get();
        if (config.modspath != null) {
          return modsFilePath = pathUtil.join(config.modspath, 'mods.json');
        } else {
          return modsFilePath = null;
        }
      };
      refresh = function() {
        refreshModsFilePath();
        console.log('reading mods from', modsFilePath);
        if (modsFilePath !== null && fs.existsSync(modsFilePath)) {
          mods = JSON.parse(fs.readFileSync(modsFilePath, {
            encoding: 'utf8'
          }));
          return mods.sort(sortByOrder);
        } else {
          return mods = null;
        }
      };
      save = function(userMods) {
        var index, mod, order, _i, _len;
        refreshModsFilePath();
        if (userMods != null) {
          mods = userMods;
        }
        mods.sort(sortByOrder);
        order = 1;
        for (index = _i = 0, _len = mods.length; _i < _len; index = ++_i) {
          mod = mods[index];
          mods[index].order = order;
          order++;
        }
        return fs.writeFileSync(modsFilePath, angular.toJson(mods));
      };
      create = function() {
        refreshModsFilePath();
        fs.writeFileSync(modsFilePath, '[]');
        return refresh();
      };
      addMod = function(userModMetadata) {
        var modMetadata;
        modMetadata = angular.extend({}, defaultModMetadata, userModMetadata);
        if (userModMetadata.order == null) {
          modMetadata.order = mods.length + 1;
        }
        return mods.push(modMetadata);
      };
      removeMod = function(modInfo) {
        var index, mod, _i, _len, _results;
        _results = [];
        for (index = _i = 0, _len = mods.length; _i < _len; index = ++_i) {
          mod = mods[index];
          if (mod["internal-name"] === modInfo["internal-name"]) {
            mods.splice(index, 1);
            break;
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };
      refresh();
      return {
        get: function() {
          return mods;
        },
        save: save,
        refresh: refresh,
        create: create,
        addMod: addMod,
        removeMod: removeMod
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('starloader').directive('sortable', [
    function() {
      var link;
      return link = function(scope, element) {};
    }
  ]);

}).call(this);
