'use strict';

/**
 * Module dependencies.
 */
var activitiesPolicy = require('../policies/activities.server.policy'),
  activities = require('../controllers/activities.server.controller');

module.exports = function (app) {
  // Activities collection routes
  app.route('/api/activities').all(activitiesPolicy.isAllowed)
    .get(activities.list)
    .post(activities.create);

  // Single activity routes
  app.route('/api/activities/:activityId').all(activitiesPolicy.isAllowed)
    .get(activities.read)
    .put(activities.update)
    .delete(activities.delete);

  // Finish by binding the activity middleware
  app.param('activityId', activities.activityByID);
};
