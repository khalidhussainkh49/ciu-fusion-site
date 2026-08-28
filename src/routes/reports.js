const express = require('express');
const router = express.Router();
const { runAsync, getAsync, allAsync } = require('../db');
const { authenticateToken, requireClearance, logAuditAction } = require('../middleware/auth');

// GET /api/reports - list reports with filter options
router.get('/', authenticateToken, async (req, res) => {
  try {
    let sql = 'SELECT r.*, u.full_name as submitter_name FROM intelligence_reports r JOIN users u ON r.submitted_by = u.id WHERE 1=1';
    const params = [];

    if (req.query.status) {
      sql += ' AND r.status = ?';
      params.push(req.query.status);
    }

    if (req.query.command) {
      sql += ' AND r.command = ?';
      params.push(req.query.command);
    }

    if (req.query.category) {
      sql += ' AND r.category = ?';
      params.push(req.query.category);
    }

    sql += ' ORDER BY r.created_at DESC';

    const reports = await allAsync(sql, params);
    res.json({ reports });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/:id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const report = await getAsync('SELECT r.*, u.full_name as submitter_name FROM intelligence_reports r JOIN users u ON r.submitted_by = u.id WHERE r.id = ?', [req.params.id]);
    if (!report) {
      return res.status(404).json({ error: 'Intelligence report not found' });
    }
    await logAuditAction(req, 'VIEW_REPORT', 'Field Intelligence', { report_id: report.id, report_number: report.report_number });
    res.json({ report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reports - Submit structured field intelligence report
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      title, category, command, location, source_reliability,
      information_credibility, classification, subject_entity,
      commodity, route_location, details, recommended_action, attachment_url
    } = req.body;

    if (!title || !category || !command || !location || !source_reliability || !information_credibility || !classification || !details) {
      return res.status(400).json({ error: 'Missing mandatory intelligence report fields' });
    }

    const reportCount = await getAsync('SELECT COUNT(*) as count FROM intelligence_reports');
    const reportNumber = `CIU/RPT/2026/${String(reportCount.count + 1).padStart(3, '0')}`;

    const result = await runAsync(
      `INSERT INTO intelligence_reports
      (report_number, title, category, command, location, source_reliability, information_credibility, classification, subject_entity, commodity, route_location, details, recommended_action, attachment_url, submitted_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [reportNumber, title, category, command, location, source_reliability, information_credibility, classification, subject_entity || null, commodity || null, route_location || null, details, recommended_action || null, attachment_url || null, req.user.id]
    );

    await logAuditAction(req, 'SUBMIT_REPORT', 'Field Intelligence', { report_id: result.lastID, report_number: reportNumber });

    res.status(201).json({
      message: 'Intelligence report submitted successfully for supervisory review',
      report_id: result.lastID,
      report_number: reportNumber
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reports/:id/approve - Supervisor review & approval workflow
router.post('/:id/approve', authenticateToken, requireClearance(2), async (req, res) => {
  try {
    const { action, comments } = req.body; // action: 'Approved', 'Rejected', 'Returned'
    if (!action || !['Approved', 'Rejected', 'Returned'].includes(action)) {
      return res.status(400).json({ error: 'Invalid approval action. Must be Approved, Rejected, or Returned' });
    }

    const report = await getAsync('SELECT * FROM intelligence_reports WHERE id = ?', [req.params.id]);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    await runAsync(
      'UPDATE intelligence_reports SET status = ?, approved_by = ? WHERE id = ?',
      [action, req.user.id, req.params.id]
    );

    await logAuditAction(req, 'SUPERVISOR_REVIEW', 'Field Intelligence', { report_id: req.params.id, action, comments });

    res.json({ message: `Intelligence report ${action.toLowerCase()} successfully`, report_id: req.params.id, status: action });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
