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
