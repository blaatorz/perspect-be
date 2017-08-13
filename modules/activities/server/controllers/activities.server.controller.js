'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Activity = mongoose.model('Activity'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create an activity
 */
exports.create = function (req, res) {
  var activity = new Activity(req.body);
  activity.user = req.user;

  activity.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(activity);
    }
  });
};

/**
 * Show the current activity
 */
exports.read = function (req, res) {
  res.json(req.activity);
};

/**
 * Update a activity
 */
exports.update = function (req, res) {
  var activity = req.activity;

  activity.title = req.body.title;
  activity.content = req.body.content;

  activity.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(activity);
    }
  });
};

/**
 * Delete an activity
 */
exports.delete = function (req, res) {
  var activity = req.activity;

  activity.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(activity);
    }
  });
};

/**
 * List of Activities
 */
exports.list = function (req, res) {
  Activity.find().sort('-created').populate('user', 'displayName').exec(function (err, activities) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(activities);
    }
  });
};

/**
 * Activity middleware
 */
exports.activityByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Activity is invalid'
    });
  }

  Activity.findById(id).populate('user', 'displayName').exec(function (err, activity) {
    if (err) {
      return next(err);
    } else if (!activity) {
      return res.status(404).send({
        message: 'No activity with that identifier has been found'
      });
    }
    req.activity = activity;
    next();
  });
};
