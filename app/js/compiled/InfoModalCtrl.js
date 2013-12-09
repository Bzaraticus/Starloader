(function() {
  angular.module('starloader').controller('InfoModalCtrl', [
    '$scope', 'infoModal', function($scope, infoModal) {
      return $scope.close = function() {
        return infoModal.deactivate();
      };
    }
  ]);

}).call(this);
