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
