const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { initDb } = require('../src/db');

const authRoutes = require('../src/routes/auth');
const fusionRoutes = require('../src/routes/fusion');
const reportsRoutes = require('../src/routes/reports');
const entitiesRoutes = require('../src/routes/entities');
const cargoRoutes = require('../src/routes/cargo');
const geospatialRoutes = require('../src/routes/geospatial');
const casesRoutes = require('../src/routes/cases');
const cyberRoutes = require('../src/routes/cyber');
const interagencyRoutes = require('../src/routes/interagency');
const kpiRoutes = require('../src/routes/kpi');
const aiRoutes = require('../src/routes/ai');

let app;
let server;
let baseUrl;
let authToken;
let userId;

test.before(async () => {
  await initDb();
  app = express();
  app.use(express.json());

  app.use('/api/auth', authRoutes);
  app.use('/api/fusion', fusionRoutes);
  app.use('/api/reports', reportsRoutes);
  app.use('/api/entities', entitiesRoutes);
  app.use('/api/cargo', cargoRoutes);
  app.use('/api/geospatial', geospatialRoutes);
  app.use('/api/cases', casesRoutes);
  app.use('/api/cyber', cyberRoutes);
  app.use('/api/interagency', interagencyRoutes);
  app.use('/api/kpi', kpiRoutes);
  app.use('/api/ai', aiRoutes);

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://localhost:${server.address().port}`;
      resolve();
    });
  });
});

test.after(() => {
  if (server) server.close();
});

test('1. Authentication Flow & MFA Challenge', async () => {
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'cgc_admin', password: 'Password123!' })
  });
  const loginData = await loginRes.json();
  assert.equal(loginRes.status, 200);
  assert.equal(loginData.mfa_required, true);
  userId = loginData.user_id;

  const mfaRes = await fetch(`${baseUrl}/api/auth/mfa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, mfa_code: '123456' })
  });
  const mfaData = await mfaRes.json();
  assert.equal(mfaRes.status, 200);
  assert.ok(mfaData.token);
  authToken = mfaData.token;
});

test('2. Intelligence Fusion Centre Overview API', async () => {
  const res = await fetch(`${baseUrl}/api/fusion/overview`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.ok(data.metrics);
  assert.ok(data.recent_alerts);
});

test('3. Field Intelligence Report Submission & Approval Flow', async () => {
  const submitRes = await fetch(`${baseUrl}/api/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
    body: JSON.stringify({
      title: 'Automated Test Intelligence Submission',
      category: 'Anti-Smuggling',
      command: 'Keme Border Command',
      location: 'Sector 4 Patrol',
      source_reliability: 'A - Completely Reliable',
      information_credibility: '1 - Confirmed by Other Sources',
      classification: 'Secret',
      details: 'Test detailed intel text'
    })
  });
  const submitData = await submitRes.json();
  assert.equal(submitRes.status, 201);
  assert.ok(submitData.report_id);

  const approveRes = await fetch(`${baseUrl}/api/reports/${submitData.report_id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
    body: JSON.stringify({ action: 'Approved', comments: 'Validated by HQ' })
  });
  const approveData = await approveRes.json();
  assert.equal(approveRes.status, 200);
  assert.equal(approveData.status, 'Approved');
});

test('4. Trader & Entity Profiling Link Analysis API', async () => {
  const createRes = await fetch(`${baseUrl}/api/entities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
    body: JSON.stringify({
      name: 'Omni Trading Ltd',
      type: 'Importer',
      tin_rc: 'RC-12345678',
      phone: '+23480011122233',
      risk_score: 90,
      watchlist_status: 'Active'
    })
  });
  const createData = await createRes.json();
  assert.equal(createRes.status, 201);
  assert.ok(createData.entity_id);

  const getRes = await fetch(`${baseUrl}/api/entities/${createData.entity_id}`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  const getData = await getRes.json();
  assert.equal(getRes.status, 200);
  assert.equal(getData.entity.name, 'Omni Trading Ltd');
});

test('5. Cargo Profiling & AI Risk Prediction Engine', async () => {
  const aiRes = await fetch(`${baseUrl}/api/ai/predict-risk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
    body: JSON.stringify({
      importer_name: 'Omni Trading Ltd',
      origin_country: 'China',
      hs_code: '8429.52.00',
      declared_value: 60000000
    })
  });
  const aiData = await aiRes.json();
  assert.equal(aiRes.status, 200);
  assert.ok(aiData.predicted_risk_score >= 80);
  assert.equal(aiData.recommendation, 'RED_LANE_HOLD');
});

test('6. Investigation Case Management & Evidence Register', async () => {
  const caseRes = await fetch(`${baseUrl}/api/cases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
    body: JSON.stringify({
      title: 'Automated Test Case File',
      category: 'Trade Fraud',
      assigned_officer_id: 1
    })
  });
  const caseData = await caseRes.json();
  assert.equal(caseRes.status, 201);

  const evRes = await fetch(`${baseUrl}/api/cases/${caseData.case_id}/evidence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
    body: JSON.stringify({
      item_description: 'Seized Hard Drive with Fraudulent Invoices',
      evidence_type: 'Digital Media',
      custodian: 'Case Officer'
    })
  });
  assert.equal(evRes.status, 201);
});

test('7. KPI & Monthly Report Generator API', async () => {
  const kpiRes = await fetch(`${baseUrl}/api/kpi/commands`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  const kpiData = await kpiRes.json();
  assert.equal(kpiRes.status, 200);
  assert.ok(Array.isArray(kpiData.rankings));
});
