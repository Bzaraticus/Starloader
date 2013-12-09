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
