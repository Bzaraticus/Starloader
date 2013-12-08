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
