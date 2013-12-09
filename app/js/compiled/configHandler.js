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
