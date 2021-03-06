// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var parseUser;
var ionicUser;

// Parse initialize
Parse.initialize("IxUGKoEGXw4yRCHU4o2l666D2WB5tyTViCZ6AcdP", "tFMhtD8QpEu5bAiZb5fyEYq5kNV7uCBpIJxgRiXh");

Ionic.io();

angular.module('starter', ['ionic','ionic.service.core', 'starter.controllers', 'starter.services', 'ngCordova', 'ionic-timepicker', 'firebase'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

  });
})

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    var push = new Ionic.Push({
      "debug": true
    });

    push.register(function(token) {
      console.log("Device token:",token.token);
    });
  });
})

.directive('standardTimeMeridian', function () {
    return {
        restrict: 'AE',
        replace: true,
        scope: {
            etime: '=etime'
        },
        template: "<strong>{{stime}}</strong>",
        link: function (scope, elem, attrs) {

            scope.stime = epochParser(scope.etime, 'time');

            function prependZero(param) {
                if (String(param).length < 2) {
                    return "0" + String(param);
                }
                return param;
            }

            function epochParser(val, opType) {
                if (val === null) {
                    return "00:00";
                } else {
                    var meridian = ['AM', 'PM'];

                    if (opType === 'time') {
                        var hours = parseInt(val / 3600);
                        var minutes = (val / 60) % 60;
                        var hoursRes = hours > 12 ? (hours - 12) : hours;

                        var currentMeridian = meridian[parseInt(hours / 12)];

                        return (prependZero(hoursRes) + ":" + prependZero(minutes) + " " + currentMeridian);
                    }
                }
            }

            scope.$watch('etime', function (newValue, oldValue) {
                scope.stime = epochParser(scope.etime, 'time');
            });

        }
    };
})


.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('signin', {
      url: '/sign-in',
      templateUrl: 'templates/sign-in.html',
      controller: 'SignInCtrl'
    })

  .state('chat', {
    url: '/chat',
    templateUrl: 'templates/chat.html',
    controller: 'ChatCtrl'
  })

  .state('diningtime', {
    url: '/dining-time',
    templateUrl: 'templates/dining-time.html',
    controller: 'DiningTimeCtrl'
  })

  .state('forgotpassword', {
    url: '/forgot-password',
    templateUrl: 'templates/forgot-password.html'
  })

  .state('register', {
    url: '/register',
    templateUrl: 'templates/register.html',
    controller: 'RegisterCtrl'
  })

  .state('tab.restaurants', {
    url: '/restaurants',
    views: {
      'tab-restaurants': {
        templateUrl: 'templates/tab-restaurants.html',
        controller: 'RestaurantsCtrl'
      }
    }
  })

  .state('tab.status', {
      url: '/status',
      views: {
        'tab-status': {
          templateUrl: 'templates/tab-status.html',
          controller: 'StatusCtrl'
        }
      }
    })

  .state('tab.restaurant-detail', {
    url: '/restaurant/:rName/:rId/:rAddr/:rRating/:rPrice',
    views: {
      'tab-restaurants': {
        templateUrl: 'templates/restaurant-detail.html',
        controller: 'RestaurantDetailCtrl'
      }
    }
  })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  parseUser = Parse.User.current();
  if (parseUser == null) {
    $urlRouterProvider.otherwise('/sign-in');
  }
  else {
    // isWaiting or open to wait at restaurants
    if (parseUser.get("isWaiting") == "yes") {
      $urlRouterProvider.otherwise('/tab/status');
    } else {
      $urlRouterProvider.otherwise('/dining-time');
    }
  }

})
