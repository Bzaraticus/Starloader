(function() {
  angular.module('starloader').factory('infoModal', [
    'btfModal', function(btfModal) {
      return btfModal({
        controller: 'InfoModalCtrl',
        controllerAs: 'modal',
        templateUrl: 'templates/info-modal.html'
      });
    }
  ]);

}).call(this);
