const express = require('express');
const router = express.Router();
const { runAsync, getAsync, allAsync } = require('../db');
const { authenticateToken, requireClearance, logAuditAction } = require('../middleware/auth');

// GET /api/cyber/indicators - List digital threat indicators
router.get('/indicators', authenticateToken, async (req, res) => {
  try {
    let sql = 'SELECT c.*, u.full_name as reporter_name FROM cyber_indicators c LEFT JOIN users u ON c.reported_by = u.id WHERE 1=1';
    const params = [];

    if (req.query.status) {
      sql += ' AND c.validation_status = ?';
      params.push(req.query.status);
    }

    if (req.query.category) {
      sql += ' AND c.threat_category = ?';
      params.push(req.query.category);
    }

    sql += ' ORDER BY c.created_at DESC';
    const indicators = await allAsync(sql, params);
    res.json({ indicators });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cyber/indicators - Report digital threat (fake website, phishing, leaked credentials)
router.post('/indicators', authenticateToken, async (req, res) => {
  try {
    const { indicator_type, indicator_value, threat_category } = req.body;
    if (!indicator_type || !indicator_value || !threat_category) {
      return res.status(400).json({ error: 'Indicator type, value, and threat category are required' });
    }

    const count = await getAsync('SELECT COUNT(*) as count FROM cyber_indicators');
    const indicatorCode = `CYB-IND-${202600 + count.count + 1}`;

    const result = await runAsync(
      `INSERT INTO cyber_indicators (indicator_code, indicator_type, indicator_value, threat_category, validation_status, reported_by)
       VALUES (?, ?, ?, ?, 'Pending Review', ?)`,
      [indicatorCode, indicator_type, indicator_value, threat_category, req.user.id]
    );

    await logAuditAction(req, 'REPORT_CYBER_INDICATOR', 'Cyber Intelligence', { indicator_id: result.lastID, indicator_code: indicatorCode });

    res.status(201).json({
      message: 'Cyber threat indicator logged for Cybersecurity Unit technical validation',
      indicator_id: result.lastID,
      indicator_code: indicatorCode
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cyber/validate - Cybersecurity Unit validation workflow
router.post('/validate', authenticateToken, requireClearance(3), async (req, res) => {
  try {
    const { indicator_id, validation_status, mitigation_outcome } = req.body;
    if (!indicator_id || !validation_status || !mitigation_outcome) {
      return res.status(400).json({ error: 'Indicator ID, validation status, and mitigation outcome are required' });
    }

    await runAsync(
      'UPDATE cyber_indicators SET validation_status = ?, mitigation_outcome = ? WHERE id = ?',
      [validation_status, mitigation_outcome, indicator_id]
    );

    await logAuditAction(req, 'VALIDATE_CYBER_INDICATOR', 'Cyber Intelligence', { indicator_id, validation_status, mitigation_outcome });

    res.json({ message: 'Cyber threat indicator validation updated', indicator_id, validation_status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
