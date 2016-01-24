angular.module('starter.controllers', [])

.controller('StatusCtrl', function($scope) {
  console.log("Status Controller Activated");

  $scope.updates = ["No one is currently matched with you",
  "Click on Restaurants if you are interested in eating with someone",
  "Click on Account to edit your profile description",
  "Happy eats!"];
})

.controller('RestaurantsCtrl', function($scope, $state, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  $scope.$on('$ionicView.enter', function(e) {
    //console.log("banana");
  });

  $scope.restaurants = null;

  $scope.showMap = function(){
      // google map
      var map;
      // variables holding origin latitude and longitude
      var orig;
      // info window for marker
      var infowindow;
      // list of restaurant
      var listRest;

      initSearch();
      function initSearch() {
          // initialize map
          map = new google.maps.Map(document.getElementById('map'), {
              center: {lat: 42.2579438, lng: -72.5785799},
              zoom: 8,
              mapTypeId: google.maps.MapTypeId.ROADMAP
          });

          // Create the origin search box and link it to the UI element.
          var origin = document.getElementById('origin-input');
          var oriSearchBox = new google.maps.places.SearchBox(origin);
          // push the oriSearchBox to the map
          map.controls[google.maps.ControlPosition.TOP_LEFT].push(origin);

          // Bias the SearchBox results towards current map's viewport.
          map.addListener('bounds_changed', function () {
              oriSearchBox.setBounds(map.getBounds());
          });

          // an array of marker on map
          var markers = [];

          // Listen for the event fired when the user selects a prediction
          // retrieve more details for that place.
          oriSearchBox.addListener('places_changed', function () {
              var oriplaces = oriSearchBox.getPlaces();

              if (oriplaces.length == 0) {
                  return;
              }

              // Clear out the old markers.
              markers.forEach(function (marker) {
                  marker.setMap(null);
              });
              markers = [];

              // For each place, get name and location.
              var bounds = new google.maps.LatLngBounds();
              oriplaces.forEach(function (place) {
                  // Create a marker for each place.
                  markers.push(new google.maps.Marker({
                      map: map,
                      title: place.name,
                      position: place.geometry.location
                  }));

                  if (place.geometry.viewport) {
                      // Only geocodes have viewport.
                      bounds.union(place.geometry.viewport);
                  } else {
                      bounds.extend(place.geometry.location);
                  }
                  // set orig to be LatLng type
                  orig = new google.maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng());
                  console.log(orig);
                  if(orig != null){
                    console.log("finding POI");
                    listRest = new Array();
                    findPOI();
                  }
              });
              // adjust map view
              map.fitBounds(bounds);
              map.setZoom(12);
          });
      }

      // find restaurant around place
      function findPOI() {
          // recenter and zoom on map
          map.setCenter(orig);
          map.setZoom(14);

          // initialize info window
          infowindow = new google.maps.InfoWindow();

          // create new service for search
          var service = new google.maps.places.PlacesService(map);
          service.nearbySearch({
              location: orig,
              radius: 2000,
              types: ['restaurant']
          }, callback);
      }

      // function called when search
      function callback(results, status) {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
              for (var i = 0; i < results.length; i++) {
                  createMarker(results[i]);
                  listRest.push(results[i]);
              }
          }
          console.log(listRest);
          $scope.restaurants = listRest;
      }

      // create marker for place
      function createMarker(place) {
          //var placeLoc = place.geometry.location;
          var marker = new google.maps.Marker({
              map: map,
              position: place.geometry.location
          });

          // when clicked on marker, show name and rating of place
          google.maps.event.addListener(marker, 'click', function () {
              infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + '\nRating: ' + place.rating);
              infowindow.open(map, this);
          });
      }
  }


  $scope.showRestaurant = function(){
    console.log($scope.restaurants);
  };

  $scope.remove = function(r) {
    // Chats.remove(chat);
    console.log("Got to remove");
  };

  $scope.navigateToDetails = function(r){
    console.log(r);
    $state.go('tab.chat-detail', {restaurant : r});
  };
})

.controller('SignInCtrl', function($scope, $state) {

  //var parseUser = Parse.User.current();


  if (parseUser != null) {
    $state.go('tab.status');
  }

  $scope.signIn = function(user) {
    console.log('Sign-In', user);

    if (user !== undefined) {
      Parse.User.logIn(user.username, user.password, {
        success: function(user) {
          // Do stuff after successful login.
          console.log(user.get("isWaiting"));
          console.log(user.get("isWaiting") == 'yes');
          if(user.get("isWaiting") == 'yes') {
            $state.go('tab.status');
          } else {
            $state.go('diningtime');
          }
          parseUser = Parse.User.current();
        },
        error: function(user, error) {
          alert("Error: " + error.code + " " + error.message);
        }
      });
    }

  };
})

.controller('DiningTimeCtrl', function ($scope, $state, $ionicPopup) {

  $scope.setDiningTime = function(from, to) {
    console.log(from);
    console.log(to);
    console.log(parseUser.get("isWaiting"));

    if( to > from ) {
      var WaitingTime = Parse.Object.extend("WaitingTime");
      var waiting_time = new WaitingTime();
      waiting_time.set("userId", parseUser.id);
      waiting_time.set("from", from * 1000);
      waiting_time.set("to", to * 1000);

      waiting_time.save(null, {
        success: function(waiting_time) {
          console.log("Successfully saved waiting time");
          parseUser.set("isWaiting", "yes");
          parseUser.save();
          $state.go('tab.restaurants');
        },
        error: function(waiting_time, error) {
          console.log("Error on waiting time: " + error.code + " " + error.message);
        }
      });

    } else {
      alert("'To' should be after 'From'");
    }
  };

  $scope.timePickerObjectFrom = {
    inputEpochTime: ((new Date()).getHours() * 60 * 60),  //Optional
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
    inputEpochTime: ((new Date()).getHours() * 60 * 60),  //Optional
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
      $scope.timePickerObjectFrom.inputEpochTime = val;
      var selectedTime = new Date(val * 1000);
      console.log('Selected epoch is : ', val, 'and the time is ', selectedTime.getUTCHours(), ':', selectedTime.getUTCMinutes(), 'in UTC');
    }
  }

  function timePickerToCallback(val) {
    if (typeof (val) === 'undefined') {
      console.log('Time not selected');
    } else {
      $scope.timePickerObjectTo.inputEpochTime = val;
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
    parse_user.set("isWaiting", "no");

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

.controller('ChatDetailCtrl', function($scope, $stateParams, $state) {
  $scope.rName = $stateParams.rName;
  $scope.rId = $stateParams.rId
  console.log($stateParams);
  console.log("in detail controller");
})

.controller('AccountCtrl', function($scope) {
  parseUser = Parse.User.current();
  console.log(parseUser);
  $scope.username = parseUser.get("username");
  $scope.age = parseUser.get("age");
  $scope.description = parseUser.get("description");
  $scope.interests = parseUser.get("interests");
  $scope.isWaiting = parseUser.get("isWaiting");

  $scope.logOut = function() {
    Parse.User.logOut();
    $state.go('signin')
  }
});
