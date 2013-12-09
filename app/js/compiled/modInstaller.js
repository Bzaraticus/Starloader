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
