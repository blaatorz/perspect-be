'use strict';

// Setting up route
angular.module('activities').config(['$stateProvider',
  function ($stateProvider) {
    // Activities state routing
    $stateProvider
      .state('activities', {
        abstract: true,
        url: '/activities',
        template: '<ui-view/>'
      })
      .state('activities.list', {
        url: '',
        templateUrl: 'modules/activities/client/views/list-activities.client.view.html'
      })
      .state('activities.create', {
        url: '/create',
        templateUrl: 'modules/activities/client/views/create-activity.client.view.html',
        data: {
          roles: ['admin', 'master']
        }
      })
      .state('activities.view', {
        url: '/:activityId',
        templateUrl: 'modules/activities/client/views/view-activity.client.view.html'
      })
      .state('activities.edit', {
        url: '/:activityId/edit',
        templateUrl: 'modules/activities/client/views/edit-activity.client.view.html',
        data: {
          roles: ['admin', 'master']
        }
      });
  }
]);
