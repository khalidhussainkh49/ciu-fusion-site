const express = require('express');
const router = express.Router();
const { runAsync, getAsync, allAsync } = require('../db');
const { authenticateToken, requireClearance, logAuditAction } = require('../middleware/auth');

// GET /api/interagency/requests - List requests
router.get('/requests', authenticateToken, async (req, res) => {
  try {
    const requests = await allAsync('SELECT * FROM agency_requests ORDER BY created_at DESC');
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/interagency/requests - Initiate request to partner agency
router.post('/requests', authenticateToken, requireClearance(2), async (req, res) => {
  try {
    const { requesting_agency, target_agency, subject, details } = req.body;
    if (!requesting_agency || !target_agency || !subject || !details) {
      return res.status(400).json({ error: 'Requesting agency, target agency, subject, and details are required' });
    }

    const count = await getAsync('SELECT COUNT(*) as count FROM agency_requests');
    const requestCode = `IAR-2026-${String(count.count + 1).padStart(4, '0')}`;

    const result = await runAsync(
      `INSERT INTO agency_requests (request_code, requesting_agency, target_agency, subject, details, status)
       VALUES (?, ?, ?, ?, ?, 'Pending Approval')`,
      [requestCode, requesting_agency, target_agency, subject, details]
    );

    await logAuditAction(req, 'CREATE_INTERAGENCY_REQUEST', 'Inter-Agency Collaboration', { request_id: result.lastID, request_code: requestCode });

    res.status(201).json({
      message: 'Inter-agency intelligence request created successfully',
      request_id: result.lastID,
      request_code: requestCode
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/interagency/share - Approve and submit response/sharing log
router.post('/share', authenticateToken, requireClearance(3), async (req, res) => {
  try {
    const { request_id, status, response_summary } = req.body;
    if (!request_id || !status || !response_summary) {
      return res.status(400).json({ error: 'Request ID, status, and response summary are required' });
    }

    await runAsync(
      'UPDATE agency_requests SET status = ?, response_summary = ? WHERE id = ?',
      [status, response_summary, request_id]
    );

    await logAuditAction(req, 'SHARE_INTERAGENCY_INTELLIGENCE', 'Inter-Agency Collaboration', { request_id, status });

    res.json({ message: `Inter-agency request updated to ${status}`, request_id, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
