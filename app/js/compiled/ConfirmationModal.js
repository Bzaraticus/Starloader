(function() {
  angular.module('starloader').factory('confirmationModal', [
    'btfModal', function(btfModal) {
      return btfModal({
        controller: 'ConfirmationModalCtrl',
        controllerAs: 'modal',
        templateUrl: 'templates/confirmation-modal.html'
      });
    }
  ]);

}).call(this);
