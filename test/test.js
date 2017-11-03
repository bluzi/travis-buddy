const assert = require('assert');
const request = require('supertest');
const app = require('../app');
const samplePayload = require('./../sample-payloads/payload2.json');


describe('GET /', () => {
    it('should be running and return HTTP status 200', done => {
        request(app)
            .get('/')
            .expect(200)
            .expect({ state: 'running' })
            .end((err, res) => {
                if (err) return done(err);
                done();
            })
    }).timeout(10000);
});

describe('POST /', () => {
    it('should return HTTP status 200 and ok message', done => {
        request(app)
            .post('/')
            .send({ payload: JSON.stringify(samplePayload) })            
            .expect(200)
            .expect({ ok: true })
            .end((err, res) => {
                if (err) return done(err);
                done();
            })
    }).timeout(10000);
});