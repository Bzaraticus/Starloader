(function() {
  angular.module('starloader').controller('FooterCtrl', [
    '$scope', function($scope) {
      var appInfo;
      appInfo = require('../package.json');
      return $scope.version = 'v' + appInfo.version;
    }
  ]);

}).call(this);
