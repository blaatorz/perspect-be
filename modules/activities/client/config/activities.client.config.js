'use strict';

// Configuring the Activities module
angular.module('activities').run(['Menus',
  function (Menus) {
    // Add the activities dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Activities',
      state: 'activities',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'activities', {
      title: 'List Activities',
      state: 'activities.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'activities', {
      title: 'Create Activities',
      state: 'activities.create',
      roles: ['admin', 'master']
    });
  }
]);
