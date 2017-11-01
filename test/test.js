const assert = require('assert');
const request = require('supertest');
const app = require('../app');
const samplePayload = require('./../sample-payloads/payload2.json');


describe('POST /mocha', () => {

    it('should be equal to two', done => {
        request(app)
            .post('/mocha')
            .send({ payload: JSON.stringify(samplePayload) })            
            .expect(200)
            .expect({ ok: true })
            .end((err, res) => {
                if (err) return done(err);
                done();
            })
    }).timeout(10000);
});