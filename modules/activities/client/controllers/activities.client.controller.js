'use strict';

// Activities controller
angular.module('activities').controller('ActivitiesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Activities',
  function ($scope, $stateParams, $location, Authentication, Activities) {
    $scope.authentication = Authentication;

    $scope.initDatePickers = function() {
      //init today
      $scope.today = new Date();
      $scope.tomorrow = new Date();
      $scope.tomorrow = $scope.tomorrow.setDate($scope.tomorrow.getDate() + 1);

      //init status
      $scope.status = {};
      $scope.status.start = false;
      $scope.status.end = false;

      //set dateOptions
      $scope.dateOptions = {};
      $scope['starting-day'] = 1;
      $scope['show-weeks'] = false;

      //set startDate
      $scope.startDate = new Date();

      //set endDate +1
      $scope.endDate = new Date();
      $scope.endDate.setDate($scope.endDate.getDate() + 1);
    };

    $scope.initTimePickers = function() {
      //set hour and minute step
      $scope.hstep = 1;
      $scope.mstep = 1;

      //init times
      $scope.startTime = new Date();
      $scope.endTime = new Date();
    };

    $scope.initDatePickers();
    $scope.initTimePickers();

    $scope.getLocation = function() {
      $scope.loading = true;
      navigator.geolocation.getCurrentPosition(function(resp) {
        //success cb
        $scope.location = resp;
        $scope.address = 'Location found';

        //enable location button
        $scope.loading = false;

        //apply changes
        $scope.$apply();
      }, function(err) {

        //set right location error
        $scope.locationError = [];

        if (err.code === 1) {
          $scope.locationError = 'The page doesn\'t have permission to get your current position.';
        } else if (err.code === 2) {
          $scope.locationError = 'At least one internal source of position returned an internal error.';
        } else {
          $scope.locationError = 'It takes too long to get your current position.';
        }

        //enable location button
        $scope.loading = false;

        //apply changes
        $scope.$apply(function() {

        });
      });
    };

    $scope.mergeDate = function(date, time) {
      var dt = date.setHours(time.getHours());
      dt = date.setMinutes(time.getMinutes());
      return dt;
    };

    $scope.validateLocation = function() {
      if ($scope.address.geometry) {
        return [$scope.address.geometry.location.lat, $scope.address.geometry.location.lng];
      } else if ($scope.address === 'Location found') {
        return [$scope.location.coords.latitude, $scope.location.coords.longitude];
      } else {
        return false;
      }
    };

    // Create new Activity
    $scope.create = function (isValid) {
      $scope.error = null;

      $scope.location = $scope.validateLocation();

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'activityForm');

        return false;
      }

      //merge start & end dates to into duration object
      $scope.duration = {};
      $scope.duration.startDate = $scope.mergeDate($scope.startDate, $scope.startTime);
      $scope.duration.endDate = $scope.mergeDate($scope.endDate, $scope.endTime);

      // Create new Activity object
      var activity = new Activities({
        title: this.title,
        description: {
          short: this.description.short,
          long: this.description.long
        },
        duration: {
          startDate: this.duration.startDate,
          endDate: this.duration.endDate
        },
        location: {
          latlng: this.location
        }
      });

      // Redirect after save
      activity.$save(function (response) {
        $location.path('activities/' + response._id);

        // Clear form fields
        $scope.title = '';
        $scope.description.short = '';
        $scope.description.long = '';
        $scope.address = '';
        $scope.initDatePickers();
        $scope.initTimePickers();
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Remove existing Activity
    $scope.remove = function (activity) {
      if (activity) {
        activity.$remove();

        for (var i in $scope.activities) {
          if ($scope.activities[i] === activity) {
            $scope.activities.splice(i, 1);
          }
        }
      } else {
        $scope.activity.$remove(function () {
          $location.path('activities');
        });
      }
    };

    // Update existing Activity
    $scope.update = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'activityForm');

        return false;
      }

      var activity = $scope.activity;

      activity.$update(function () {
        $location.path('activities/' + activity._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of Activities
    $scope.find = function () {
      $scope.activities = Activities.query();
    };

    // Find existing Activity
    $scope.findOne = function () {
      Activities.get({
        activityId: $stateParams.activityId
      }, function(resp) {
        $scope.activity = resp;
        $scope.reverseGeocoding();
      });
    };

    $scope.reverseGeocoding = function() {
      var geocoder = new google.maps.Geocoder();
      var latlng = new google.maps.LatLng($scope.activity.location.latlng[0], $scope.activity.location.latlng[1]);

      geocoder.geocode({ 'location': latlng }, function(results, status) {
        if (status === 'OK') {
          if (results[0]) {
            $scope.$apply(function() {
              $scope.activity.address = results[0].formatted_address;
            });
          } else {
            console.log('No results found');
          }
        } else {
          console.log('Geocoder failed due to ' + status);
        }
      }, function(err) {
        console.log(err);
      });
    };
  }
]);
