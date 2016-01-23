angular.module('starter.controllers', [])

.controller('StatusCtrl', function($scope) {
  console.log("Status Controller Activated");

  $scope.updates = ["No one is currently matched with you",
                    "Click on restaurants if you are interested in eating with someone",
                    "lets see",
                    "ebola"];
})

.controller('RestaurantsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});


  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('SignInCtrl', function($scope, $state) {

  $scope.signIn = function(user) {
    console.log('Sign-In', user);

    Parse.User.logIn(user.username, user.password, {
      success: function(user) {
        // Do stuff after successful login.
        console.log("Logged in");
        $state.go('tab.status');
      },
      error: function(user, error) {
        // The login failed. Check error to see why.
        console.log("failed to log in, " + error.code + error.message);
      }
    });
    
  };

})

.controller('ToastCtrl', function($scope, $cordovaToast) {

  $scope.toastLogIn = function(user){
    Parse.User.logIn(user.username, user.password, {
      success: function(user) {
        // Do stuff after successful login.
        console.log("Logged in");
        $state.go('tab.status');
      },
      error: function(user, error) {
        // The login failed. Check error to see why.
        $cordovaToast
          .show('Error code:'+ error.code + " " + error.message, 'long', 'bottom')
          .then(function(success) {
            // success
            console.log("yay");
          }, function (error) {
            // error
        });
        console.log("failed to log in, " + error.code + error.message);
      }  
    }) //close parse
    .then(function(success) {
      $cordovaToast.show('hi', 'long', 'bottom')
          .then(function(success) {
            // success
            console.log("yay");
          }, function (error) {
            // error
        });
    }, function(error) {

    });
  }

  $scope.showToast = function(){
    $cordovaToast.show('TOOOOAST', 'long', 'bottom').then(function(success){
      //yay
    }, function(error){
      //nooo
    });
  }

})

.controller('RegisterCtrl', function($scope, $state) {

  $scope.register = function(user) {
    console.log('Register', user);

    var parse_user = new Parse.User();
    parse_user.set("username", user.username);
    parse_user.set("password", user.password);
    parse_user.set("description", user.description);
    parse_user.set("age", user.age);
    parse_user.set("interests", user.interests);

    parse_user.signUp(null, {
      success : function(parse_user){
        console.log("Success!");
        $state.go('signin');
      },
      error : function(parse_user, error){
        console.log("Error: " + error.code + " " + error.message);
      }
    });


  }

})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
