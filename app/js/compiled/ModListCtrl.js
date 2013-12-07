(function() {
  window.starloader.controller('ModListCtrl', [
    '$scope', function($scope) {
      $scope.mods = [
        {
          "name": "Test mod",
          "version": "1.0.0",
          "author": "Test guy",
          "order": 1
        }, {
          "name": "Megamod",
          "version": "1.mega",
          "author": "Megamega",
          "order": 2
        }
      ];
      return $scope.text = 'yay';
    }
  ]);

}).call(this);
