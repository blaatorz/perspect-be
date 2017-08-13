'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Activity = mongoose.model('Activity'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, activity;

/**
 * Activity routes tests
 */
describe('Activity CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new activity
    user.save(function () {
      activity = {
        title: 'Activity Title',
        content: 'Activity Content'
      };

      done();
    });
  });

  it('should be able to save an activity if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new activity
        agent.post('/api/activities')
          .send(activity)
          .expect(200)
          .end(function (activitySaveErr, activitySaveRes) {
            // Handle activity save error
            if (activitySaveErr) {
              return done(activitySaveErr);
            }

            // Get a list of activities
            agent.get('/api/activities')
              .end(function (activitiesGetErr, activitiesGetRes) {
                // Handle activity save error
                if (activitiesGetErr) {
                  return done(activitiesGetErr);
                }

                // Get activities list
                var activities = activitiesGetRes.body;

                // Set assertions
                (activities[0].user._id).should.equal(userId);
                (activities[0].title).should.match('Activity Title');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an activity if not logged in', function (done) {
    agent.post('/api/activities')
      .send(activity)
      .expect(403)
      .end(function (activitySaveErr, activitySaveRes) {
        // Call the assertion callback
        done(activitySaveErr);
      });
  });

  it('should not be able to save an activity if no title is provided', function (done) {
    // Invalidate title field
    activity.title = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new activity
        agent.post('/api/activities')
          .send(activity)
          .expect(400)
          .end(function (activitySaveErr, activitySaveRes) {
            // Set message assertion
            (activitySaveRes.body.message).should.match('Title cannot be blank');

            // Handle activity save error
            done(activitySaveErr);
          });
      });
  });

  it('should be able to update an activity if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new activity
        agent.post('/api/activities')
          .send(activity)
          .expect(200)
          .end(function (activitySaveErr, activitySaveRes) {
            // Handle activity save error
            if (activitySaveErr) {
              return done(activitySaveErr);
            }

            // Update activity title
            activity.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing activity
            agent.put('/api/activities/' + activitySaveRes.body._id)
              .send(activity)
              .expect(200)
              .end(function (activityUpdateErr, activityUpdateRes) {
                // Handle activity update error
                if (activityUpdateErr) {
                  return done(activityUpdateErr);
                }

                // Set assertions
                (activityUpdateRes.body._id).should.equal(activitySaveRes.body._id);
                (activityUpdateRes.body.title).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of activities if not signed in', function (done) {
    // Create new activity model instance
    var activityObj = new Activity(activity);

    // Save the activity
    activityObj.save(function () {
      // Request activities
      request(app).get('/api/activities')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single activity if not signed in', function (done) {
    // Create new activity model instance
    var activityObj = new Activity(activity);

    // Save the activity
    activityObj.save(function () {
      request(app).get('/api/activities/' + activityObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', activity.title);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single activity with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/activities/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Activity is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single activity which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent activity
    request(app).get('/api/activities/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No activity with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an activity if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new activity
        agent.post('/api/activities')
          .send(activity)
          .expect(200)
          .end(function (activitySaveErr, activitySaveRes) {
            // Handle activity save error
            if (activitySaveErr) {
              return done(activitySaveErr);
            }

            // Delete an existing activity
            agent.delete('/api/activities/' + activitySaveRes.body._id)
              .send(activity)
              .expect(200)
              .end(function (activityDeleteErr, activityDeleteRes) {
                // Handle activity error error
                if (activityDeleteErr) {
                  return done(activityDeleteErr);
                }

                // Set assertions
                (activityDeleteRes.body._id).should.equal(activitySaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an activity if not signed in', function (done) {
    // Set activity user
    activity.user = user;

    // Create new activity model instance
    var activityObj = new Activity(activity);

    // Save the activity
    activityObj.save(function () {
      // Try deleting activity
      request(app).delete('/api/activities/' + activityObj._id)
        .expect(403)
        .end(function (activityDeleteErr, activityDeleteRes) {
          // Set message assertion
          (activityDeleteRes.body.message).should.match('User is not authorized');

          // Handle activity error error
          done(activityDeleteErr);
        });

    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Activity.remove().exec(done);
    });
  });
});
