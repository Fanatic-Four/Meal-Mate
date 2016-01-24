angular.module('starter.controllers', [])

.controller('StatusCtrl', function($scope) {
  console.log("Status Controller Activated");

  $scope.updates = ["No one is currently matched with you.",
  "Click on Restaurants if you are interested in eating with someone",
  "Click on Account to edit your profile description",
  "Happy eats!"];

  if (parseUser.get("isWaiting") == "yes") {
    var WaitingList = Parse.Object.extend("WaitingList");
    var query = new Parse.Query(WaitingList);
    query.equalTo('user', parseUser);

    var Restaurant = Parse.Object.extend("Restaurant");
    var rQuery = new Parse.Query(Restaurant);

    $scope.restaurants = [];

    query.find({
      success: function(results) {
        for (var i = 0; i < results.length; i++) {
          var restaurant = results[i].get("restaurant");
          console.log(restaurant.id);
          rQuery.get(restaurant.id, {
            success : function(rest) {
              $scope.restaurants.push(rest);
              console.log(rest.get("name"));
            }
          })
        }
      },
    });
  }

  else {

    $scope.match = null;

    var Joined = Parse.Object.extend("Joined");
    var jQuery = new Parse.Query(Joined);
    jQuery.find({
      success: function(entries){
        var curr = Parse.User.current();

        for(var i = 0; i < entries.length; i++){
          console.log(entries[i].get("user2").getUsername());
          if(entries[i].get("user1").id == curr.id){
            console.log("display user2")
            $scope.match = entries[i].get("user2").getUsername();
            console.log($scope.match);
          }
          else if(entries[i].get("user2").id == curr.objectId){
            console.log("display user1") 
            $scope.match = entries[i].get("user1").getUsername();
          }
        }
      }
    })
  }

  $scope.delete = function(restaurantId) {
    console.log("delete "+restaurantId);
    var Restaurant = Parse.Object.extend("Restaurant");
    var query = new Parse.Query(Restaurant);
    query.get(restaurantId, {
      success: function(rest) {
        // The object was retrieved successfully.
        rest.destroy({
          success: function() {
            window.location = "index.html";
          }
        });
      },
    })
  }
})

.controller('RestaurantsCtrl', function($scope, $state, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //

  // $scope.$on('$ionicView.enter', function(e) {
  // });

  //List of restaurants
  $scope.restaurants;

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
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true
    });

    angular.element(document.getElementById('map')).attr('data-tap-disabled', 'true');

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
    $scope.restaurants = listRest;
    console.log(listRest);
    document.getElementById("btn").click();
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

  $scope.showRestaurants = function(){
    console.log($scope.restaurants);
  }

})

.controller('SignInCtrl', function($scope, $state) {

  //var parseUser = Parse.User.current();


  if (parseUser != null) {
    $state.go('tab.status');
  }

  var ionicSuccess = function() {
    ionicUser = Ionic.User.current();
  }

  var ionicFailure = function(id) {
    // this will give you a fresh user or the previously saved 'current user'
    ionicUser = Ionic.User.current();

    // if the user doesn't have an id, you'll need to give it one.
    if (!ionicUser.id) {
      ionicUser.id = id;
      // user.id = 'your-custom-user-id';
    }

    //persist the user
    ionicUser.save();
  }

  $scope.signIn = function(user) {
    console.log('Sign-In', user);

    if (user !== undefined) {
      Parse.User.logIn(user.username, user.password, {
        success: function(user) {
          // Do stuff after successful login.
          console.log(user.get("isWaiting"));
          console.log(user.get("isWaiting") == 'yes');
          parseUser = Parse.User.current();

          Ionic.User.load(user.id).then(ionicSuccess, ionicFailure(user.id));

          if(user.get("isWaiting") == 'yes') {
            $state.go('tab.status');
          } else {
            $state.go('diningtime');
          }
        },
        error: function(user, error) {
          console.log("Error: " + error.code + " " + error.message);
          alert("Email/Password is incorrect");
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
    step: 5,  //Optional
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
    step: 5,  //Optional
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

.controller('ChatCtrl', function($scope, $state, $ionicPopup, Messages) {

  $scope.messages = Messages;

  $scope.addMessage = function() {

    $ionicPopup.prompt({
      title: 'Send message',
      template: 'Let them know you if you want to change plans!'
    }).then(function(res) {
      $scope.messages.$add({
        "message": res
      });
    });
  };

  $scope.logout = function() {
    var ref = new Firebase("https://burning-fire-7390.firebaseio.com");
    ref.unauth();
    $state.go('login');
  };

})

.controller('RestaurantDetailCtrl', function($scope, $stateParams) {
  $scope.rName = $stateParams.rName;
  $scope.rId = $stateParams.rId;
  $scope.rAddr = $stateParams.rAddr;
  $scope.rRating = $stateParams.rRating;
  var dollar = "";
  for(i = 0 ; i < $stateParams.rPrice; i++) dollar+="$";
  $scope.rPrice = dollar;
  $scope.rAddr = $stateParams.rAddr;

  console.log($stateParams);
  console.log("in detail controller");

  var WaitingList = Parse.Object.extend("WaitingList");
  var query = new Parse.Query(WaitingList);
  console.log($scope.rId);
  query.equalTo("restaurantId", $scope.rId);

  var uQuery = new Parse.Query(Parse.User);
  $scope.users_waiting = [];
  $scope.userObjects = [];

  //Display the people in WaitingList
  query.find({
    success: function(results) {
      //Results is all the rows of the target restaurant
      console.log(results);
      for (var i = 0; i < results.length; i++) {
        var user = results[i].get("user");
        uQuery.get(user.id, {
          success: function(person){
            if(person.id != Parse.User.current().id){
              $scope.users_waiting.push(person.getUsername());
              $scope.userObjects.push(person);
            }
          }
        })
      }
    },
    });


  $scope.join = function(username){
    console.log($scope.users_waiting); // don't delete this
    console.log("Clicked to join");

    console.log(username);
    uQuery = new Parse.Query(Parse.User);

    uQuery.equalTo("username", username)
    .find({
      success: function(user){
        //Remove all instances of the-user-you-joined from Waitinglist
        var query = new Parse.Query(WaitingList);
        console.log(user[0]);
        console.log(parseUser);
        query.equalTo("user", user[0]);
        query.find({
          success: function(results){
            console.log("here");
            console.log(results);
            for(var i = 0; i < results.length; i++){
              results[i].destroy({
                success: function(o){console.log("destroyed object");}
              });
              console.log("destroyed the user you joined with in waiting_list");
            }
          }
        })

        //TODO: Update the-user-you-joined "isWaiting" to No
        //but no write access

        //Add both users to Join pool
        var Joined = new Parse.Object.extend("Joined");
        var j = new Joined();
        j.set("user1", user[0]);
        j.set("user2", Parse.User.current());
        j.save();

      }
    });

    // Destroy curr user from waiting list
    var query = new Parse.Query(WaitingList);
    query.equalTo("user", Parse.User.current());
    query.find({
      success: function(curr){
        console.log(curr[0]);
        for(var i = 0; i < curr.length; i++){
          curr[i].destroy({
            success: function(res){
              console.log("destroyed current user from Waiting List");
            }
          });
        }

      }
    })

    // Update current user's isWaiting
    var curr = Parse.User.current();
    curr.set("isWaiting", "no");
    curr.save();
    console.log("curr isWaiting: " + curr.isWaiting);
    // $state.go('tab.status');
  } //end join function

  $scope.wait = function(){
    console.log("Clicked to wait");

    //Set current user's isWaiting field to yes
    var curr = Parse.User.current();
    curr.set("isWaiting", "yes");
    curr.save();

    var Restaurant = Parse.Object.extend("Restaurant");
    var r = new Restaurant();
    var query = new Parse.Query(Restaurant);
    query.equalTo("restaurantId", $scope.rId);
    query.find({
      success: function(results) {
        if (results.length > 0) {
          // already has restaurant
          r = results[0];

          var WaitingList = Parse.Object.extend("WaitingList");
          var waiting_list = new WaitingList();
          // check if the user-restaurant is already in the WaitingList
          var waitingListQuery = new Parse.Query(WaitingList);
          waitingListQuery.equalTo("user", parseUser);
          console.log("err r "+r);
          waitingListQuery.equalTo("restaurant", r);

          waitingListQuery.find({
            success: function(results) {
              if (results.length == 0) {
                // this user has no record of waiting here
                waiting_list.set("user", parseUser);
                waiting_list.set("restaurant", r);
                waiting_list.set("restaurantId", $scope.rId);
                waiting_list.save();
                console.log(waiting_list);
              }
            }
          })

        } else {
          // add new restaurant
          r.set("restaurantId", $scope.rId);
          r.set("name", $scope.rName);
          r.set("address", $scope.rAddr);
          r.save(null, {
            success : function(res) {

              var WaitingList = Parse.Object.extend("WaitingList");
              var waiting_list = new WaitingList();
              // check if the user-restaurant is already in the WaitingList
              var waitingListQuery = new Parse.Query(WaitingList);
              waitingListQuery.equalTo("user", parseUser);
              waitingListQuery.equalTo("restaurant", r);

              waitingListQuery.find({
                success: function(results) {
                  if (results.length == 0) {
                    // this user has no record of waiting here
                    waiting_list.set("user", parseUser);
                    waiting_list.set("restaurant", r);
                    waiting_list.set("restaurantId", $scope.rId);
                    waiting_list.save();
                  }
                }
              })
            }
          });
        }
      },
    });
  }
})

.controller('AccountCtrl', function($scope, $state) {
  parseUser = Parse.User.current();
  console.log(parseUser);
  $scope.username = parseUser.get("username");
  $scope.age = parseUser.get("age");
  $scope.description = parseUser.get("description");
  $scope.interests = parseUser.get("interests");
  $scope.isWaiting = parseUser.get("isWaiting");

  $scope.logOut = function() {
    Parse.User.logOut().then(function() {
      $state.go('signin');
      console.log("Sign in page redirect");
    });
  }

  $scope.chat = function() {
    $state.go('chat');
  }
});
