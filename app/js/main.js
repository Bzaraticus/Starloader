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

(function() {
  window.starloader.config([
    '$compileProvider', function($compileProvider) {
      return $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
    }
  ]);

  window.starloader.config([
    '$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
      $routeProvider.when('/modlist', {
        templateUrl: './templates/modlist.html',
        controller: 'ModListCtrl'
      });
      $routeProvider.when('/license', {
        templateUrl: './templates/license.html'
      });
      $routeProvider.when('/options', {
        templateUrl: './templates/options.html'
      });
      $routeProvider.when('/about', {
        templateUrl: './templates/about.html'
      });
      $routeProvider.otherwise({
        redirectTo: '/modlist'
      });
      return $locationProvider.html5Mode(false);
    }
  ]);

}).call(this);
