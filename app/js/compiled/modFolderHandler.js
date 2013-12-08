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
