(function() {
  angular.module('starloader').factory('initialSettingsModal', [
    'btfModal', function(btfModal) {
      return btfModal({
        controller: 'InitialSettingsModalCtrl',
        controllerAs: 'modal',
        templateUrl: 'templates/initial-settings-modal.html'
      });
    }
  ]);

}).call(this);
