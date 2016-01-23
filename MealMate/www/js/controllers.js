angular.module('starter.controllers', [])

.controller('StatusCtrl', function($scope) {
  console.log("Status Controller Activated");

  $scope.updates = ["No one is currently matched with you",
                    "Click on Restaurants if you are interested in eating with someone",
                    "Click on Account to edit your profile description",
                    "Happy eats!"];
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

  //var parseUser = Parse.User.current();


  if (parseUser != null) {
    $state.go('tab.status');
  }

  $scope.signIn = function(user) {
    console.log('Sign-In', user);

    Parse.User.logIn(user.username, user.password, {
      success: function(user) {
        // Do stuff after successful login.
        alert("Successfully logged in");
        $state.go('tab.status');
        parseUser = Parse.User.current();
      },
      error: function(user, error) {
        alert("Error: " + error.code + " " + error.message);
        // The login failed. Check error to see why.
        // $state.go('tab.restaurants');
      }
    });

  };
})

.controller('DiningTimeCtrl', function ($scope, $ionicPopup) {

    $scope.timePickerObjectFrom = {
      fromEpochTime: ((new Date()).getHours() * 60 * 60),  //Optional
      step: 15,  //Optional
      format: 12,  //Optional
      titleLabel: '12-hour Format',  //Optional
      closeLabel: 'Close',  //Optional
      setLabel: 'Set',  //Optional
      setButtonType: 'button-positive',  //Optional
      closeButtonType: 'button-stable',  //Optional
      callback: function (val) {    //Mandatory
        timePickerFromCallback(val);
      }
    };

    $scope.timePickerObjectTo = {
      toEpochTime: ((new Date()).getHours() * 60 * 60),  //Optional
      step: 15,  //Optional
      format: 12,  //Optional
      titleLabel: '12-hour Format',  //Optional
      closeLabel: 'Close',  //Optional
      setLabel: 'Set',  //Optional
      setButtonType: 'button-positive',  //Optional
      closeButtonType: 'button-stable',  //Optional
      callback: function (val) {    //Mandatory
        timePickerToCallback(val);
      }
    };

    function timePickerFromCallback(val) {
      if (typeof (val) === 'undefined') {
        console.log('Time not selected');
      } else {
        $scope.timePickerObjectFrom.fromEpochTime = val;
        var selectedTime = new Date(val * 1000);
        console.log('Selected epoch is : ', val, 'and the time is ', selectedTime.getUTCHours(), ':', selectedTime.getUTCMinutes(), 'in UTC');
      }
    }

    function timePickerToCallback(val) {
      if (typeof (val) === 'undefined') {
        console.log('Time not selected');
      } else {
        $scope.timePickerObjectTo.toEpochTime = val;
        var selectedTime = new Date(val * 1000);
        console.log('Selected epoch is : ', val, 'and the time is ', selectedTime.getUTCHours(), ':', selectedTime.getUTCMinutes(), 'in UTC');
      }
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
