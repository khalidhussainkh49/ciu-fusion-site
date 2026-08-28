const express = require('express');
const router = express.Router();
const { query, getAsync, allAsync } = require('../db');
const { authenticateToken, requireClearance, logAuditAction } = require('../middleware/auth');

router.get('/requests', authenticateToken, async (req, res) => {
  try {
    const requests = await allAsync('SELECT * FROM agency_requests ORDER BY created_at DESC');
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/requests', authenticateToken, requireClearance(2), async (req, res) => {
  try {
    const { requesting_agency, target_agency, subject, details } = req.body;
    if (!requesting_agency || !target_agency || !subject || !details) {
      return res.status(400).json({ error: 'Requesting agency, target agency, subject, and details are required' });
    }

    const count = await getAsync('SELECT COUNT(*) as count FROM agency_requests');
    const requestCode = `IAR-2026-${String(parseInt(count.count, 10) + 1).padStart(4, '0')}`;

    const result = await query(
      `INSERT INTO agency_requests (request_code, requesting_agency, target_agency, subject, details, status)
       VALUES ($1, $2, $3, $4, $5, 'Pending Approval') RETURNING id`,
      [requestCode, requesting_agency, target_agency, subject, details]
    );

    const newId = result.rows[0].id;
    await logAuditAction(req, 'CREATE_INTERAGENCY_REQUEST', 'Inter-Agency Collaboration', { request_id: newId, request_code: requestCode });

    res.status(201).json({
      message: 'Inter-agency intelligence request created successfully',
      request_id: newId,
      request_code: requestCode
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/share', authenticateToken, requireClearance(3), async (req, res) => {
  try {
    const { request_id, status, response_summary } = req.body;
    if (!request_id || !status || !response_summary) {
      return res.status(400).json({ error: 'Request ID, status, and response summary are required' });
    }

    await query(
      'UPDATE agency_requests SET status = $1, response_summary = $2 WHERE id = $3',
      [status, response_summary, request_id]
    );

    await logAuditAction(req, 'SHARE_INTERAGENCY_INTELLIGENCE', 'Inter-Agency Collaboration', { request_id, status });

    res.json({ message: `Inter-agency request updated to ${status}`, request_id, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
