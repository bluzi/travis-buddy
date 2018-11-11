const request = require('supertest');
const { createApp } = require('../http/app');
const samplePayload = require('./samples/payload.json');
const GitHub = require('better-github-api');
const configuration = require('../utils/configuration');
const assert = require('assert');

const app = createApp({
  isTest: true,
  returnRequestContext: true,
  logs: 'errors',
});

describe('api', () => {
  describe('POST /', () => {
    let response;
    let error;

    before(function(done) {
      this.timeout(100000);

      request(app)
        .post('/?someOption=someValue')
        .send({ payload: JSON.stringify(samplePayload) })
        .expect(201)
        .end((responseError, { body: responseBody }) => {
          response = responseBody;
          error = responseError;
          done();
        });
    });

    it('should not return an error', done => (error ? done(error) : done()));
    it('should have an ok field', done =>
      response.ok !== true ? done(`ok is: ${response.ok}`) : done());
    it('should have a sain message', done =>
      !response.context.message || response.context.message.length < 100
        ? done(`Weird message:\n${response.context.message}`)
        : done());
    it('should have a message with a request identifier', done =>
      !response.context.message.includes('TravisBuddy Request Identifier')
        ? done(`No request identifier`)
        : done());
    it('should support query parameters', done =>
      response.context.query.someOption !== 'someValue'
        ? done(`Query parameter was not found or its value is malformed`)
        : done());
  }).timeout(100000);

  describe('GET /status', () => {
    it('should be running and return HTTP status 200', done => {
      request(app)
        .get('/status')
        .expect(200)
        .expect({ state: 'running' })
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  // describe('GET /test', () => {
  //   it('should return HTTP status 200', (done) => {
  //     request(app)
  //       .get('/test/node_js/295503460')
  //       .expect(200)
  //       .end((err) => {
  //         if (err) return done(err);
  //         done();
  //       });
  //   }).timeout(10000);
  // });
});

describe('site', () => {
  describe('GET /', () => {
    it('should return HTML and status 200', done => {
      request(app)
        .get('/')
        .expect(200)
        .expect('Content-Type', /html/)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe('GET /getting-started', () => {
    it('should return HTML and status 200', done => {
      request(app)
        .get('/getting-started')
        .expect(200)
        .expect('Content-Type', /html/)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe('GET /contact-us', () => {
    it('should return HTML and status 200', done => {
      request(app)
        .get('/contact-us')
        .expect(200)
        .expect('Content-Type', /html/)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe('GET /dashboard', () => {
    it('should return HTML and status 200', done => {
      request(app)
        .get('/dashboard')
        .expect(200)
        .expect('Content-Type', /html/)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });
});

describe('TravisBuddy configuration', () => {
  it('should parse successfully', done => {
    configuration('bluzi', 'travis-buddy').then(config => {
      assert.notEqual(config.selectedConfig, undefined);
      assert.notEqual(config.selectedConfig.templates, undefined);
      done();
    });
  }).timeout(100000);
});
