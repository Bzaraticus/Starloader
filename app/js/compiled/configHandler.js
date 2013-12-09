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
