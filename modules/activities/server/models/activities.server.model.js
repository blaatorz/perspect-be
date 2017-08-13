'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Activity Schema
 */
var ActivitySchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  description: {
    short: {
      type: String,
      default: '',
      trim: true,
      required: 'Short description cannot be blank'
    },
    long: {
      type: String,
      default: '',
      trim: true,
      required: 'Long description cannot be blank'
    }
  },
  duration: {
    startDate: {
      type: Date,
      default: Date.now,
      required: 'Start cannot be blank'
    },
    endDate: {
      type: Date,
      default: Date.now,
      required: 'Start cannot be blank'
    }
  },
  location: {
    latlng: {
      type: [Number],
      default: [0, 0],
      required: 'Please fill coordinates'
    }
  },
  modified: {
    type: Date,
    default: Date.now
  },
  title: {
    type: String,
    default: '',
    trim: true,
    required: 'Title cannot be blank'
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Activity', ActivitySchema);
