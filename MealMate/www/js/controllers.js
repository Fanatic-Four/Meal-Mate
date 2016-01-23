angular.module('starter.controllers', [])

.controller('StatusCtrl', function($scope) {})

.controller('RestaurantsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  console.log("lsdjkf");
  $scope.showMap = function(){
    console.log("Heyyyyy");
      // google map
      var map;
      // variables holding origin latitude and longitude
      var orig;
      // info window for marker
      var infowindow;
      
      initSearch();
      function initSearch() {
          console.log("Hey I'm here");
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
              });
              // adjust map view
              map.fitBounds(bounds);
              map.setZoom(12);
          });

          if (orig != null){
            findPOI();
          }
      }

      // find restaurant around place
      function findPOI() {
          // recenter and zoom on map
          map.setCenter(dest);
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
              }
          }
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

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('SignInCtrl', function($scope, $state) {

  $scope.signIn = function(user) {
    console.log('Sign-In', user);
    $state.go('tab.status');
  };

})

.controller('RegisterCtrl', function($scope, $state) {

  $scope.register = function(user) {
    console.log('Register', user);

    //Insert Parse code here
    $state.go('signin');
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
