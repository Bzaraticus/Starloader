(function() {
  angular.module('starloader').factory('createModsFolderModal', [
    'btfModal', function(btfModal) {
      return btfModal({
        controller: 'CreateModsFolderModalCtrl',
        controllerAs: 'modal',
        templateUrl: 'templates/create-mods-folder-modal.html'
      });
    }
  ]);

}).call(this);
