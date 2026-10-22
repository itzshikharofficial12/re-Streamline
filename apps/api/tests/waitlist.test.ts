import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '@streamline/database';

describe('Waitlist API Integration Tests', () => {
  const app = createApp();
  const testId = Date.now();
  const testEmail = `waitlist_test_${testId}@streamline.live`;

  after(async () => {
    // Clean up created test entries safely
    await prisma.waitlistEntry.deleteMany({
      where: {
        email: {
          contains: `waitlist_test_${testId}`
        }
      }
    });
  });

  it('POST /waitlist — should successfully add new email and return 201 Created', async () => {
    const res = await request(app)
      .post('/waitlist')
      .set('Origin', 'http://localhost:3000')
      .set('X-Requested-With', 'XMLHttpRequest')
      .send({ email: testEmail, source: 'homepage' });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.entry.id);
    assert.equal(res.body.data.entry.email, testEmail);
    assert.equal(res.body.data.entry.status, 'pending');
    assert.equal(res.body.data.entry.source, 'homepage');
    assert.equal(res.body.data.message, "You're on the list!");

    // Verify row was persisted in PostgreSQL
    const dbRecord = await prisma.waitlistEntry.findUnique({
      where: { email: testEmail }
    });
    assert.ok(dbRecord);
    assert.equal(dbRecord.email, testEmail);
  });

  it('POST /waitlist — should reject duplicate email submission with 409 Conflict', async () => {
    const res = await request(app)
      .post('/waitlist')
      .set('Origin', 'http://localhost:3000')
      .set('X-Requested-With', 'XMLHttpRequest')
      .send({ email: testEmail });

    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'ALREADY_REGISTERED');
    assert.equal(res.body.error.message, "You're already on the list.");

    // Verify no duplicate row was created
    const count = await prisma.waitlistEntry.count({
      where: { email: testEmail }
    });
    assert.equal(count, 1);
  });

  it('POST /waitlist — should normalize email (trim and lowercase) and reject duplicate variants', async () => {
    const res = await request(app)
      .post('/waitlist')
      .set('Origin', 'http://localhost:3000')
      .set('X-Requested-With', 'XMLHttpRequest')
      .send({ email: `  ${testEmail.toUpperCase()}   ` });

    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'ALREADY_REGISTERED');

    // Confirm total rows for this email remains exactly 1
    const count = await prisma.waitlistEntry.count({
      where: { email: testEmail }
    });
    assert.equal(count, 1);
  });

  it('POST /waitlist — should reject invalid email format with 400 Bad Request', async () => {
    const res = await request(app)
      .post('/waitlist')
      .set('Origin', 'http://localhost:3000')
      .set('X-Requested-With', 'XMLHttpRequest')
      .send({ email: 'not-an-email' });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
    assert.equal(res.body.error.message, 'Invalid email address');
  });

  it('POST /waitlist — should reject empty payload with 400 Bad Request', async () => {
    const res = await request(app)
      .post('/waitlist')
      .set('Origin', 'http://localhost:3000')
      .set('X-Requested-With', 'XMLHttpRequest')
      .send({});

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  });

  it('POST /api/waitlist — should work via /api/waitlist alias route', async () => {
    const aliasEmail = `alias_test_${testId}@streamline.live`;

    const res = await request(app)
      .post('/api/waitlist')
      .set('Origin', 'http://localhost:3000')
      .set('X-Requested-With', 'XMLHttpRequest')
      .send({ email: aliasEmail });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.entry.email, aliasEmail);

    // Clean up alias test row
    await prisma.waitlistEntry.delete({
      where: { email: aliasEmail }
    });
  });
});
