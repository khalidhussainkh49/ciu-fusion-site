const express = require('express');
const router = express.Router();
const { query, getAsync, allAsync } = require('../db');
const { authenticateToken, requireClearance, logAuditAction } = require('../middleware/auth');

router.get('/indicators', authenticateToken, async (req, res) => {
  try {
    let sql = 'SELECT c.*, u.full_name as reporter_name FROM cyber_indicators c LEFT JOIN users u ON c.reported_by = u.id WHERE 1=1';
    const params = [];
    let idx = 1;

    if (req.query.status) {
      sql += ` AND c.validation_status = $${idx++}`;
      params.push(req.query.status);
    }

    if (req.query.category) {
      sql += ` AND c.threat_category = $${idx++}`;
      params.push(req.query.category);
    }

    sql += ' ORDER BY c.created_at DESC';
    const indicators = await allAsync(sql, params);
    res.json({ indicators });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/indicators', authenticateToken, async (req, res) => {
  try {
    const { indicator_type, indicator_value, threat_category } = req.body;
    if (!indicator_type || !indicator_value || !threat_category) {
      return res.status(400).json({ error: 'Indicator type, value, and threat category are required' });
    }

    const count = await getAsync('SELECT COUNT(*) as count FROM cyber_indicators');
    const indicatorCode = `CYB-IND-${202600 + parseInt(count.count, 10) + 1}`;

    const result = await query(
      `INSERT INTO cyber_indicators (indicator_code, indicator_type, indicator_value, threat_category, validation_status, reported_by)
       VALUES ($1, $2, $3, $4, 'Pending Review', $5) RETURNING id`,
      [indicatorCode, indicator_type, indicator_value, threat_category, req.user.id]
    );

    const newId = result.rows[0].id;
    await logAuditAction(req, 'REPORT_CYBER_INDICATOR', 'Cyber Intelligence', { indicator_id: newId, indicator_code: indicatorCode });

    res.status(201).json({
      message: 'Cyber threat indicator logged for Cybersecurity Unit technical validation',
      indicator_id: newId,
      indicator_code: indicatorCode
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/validate', authenticateToken, requireClearance(3), async (req, res) => {
  try {
    const { indicator_id, validation_status, mitigation_outcome } = req.body;
    if (!indicator_id || !validation_status || !mitigation_outcome) {
      return res.status(400).json({ error: 'Indicator ID, validation status, and mitigation outcome are required' });
    }

    await query(
      'UPDATE cyber_indicators SET validation_status = $1, mitigation_outcome = $2 WHERE id = $3',
      [validation_status, mitigation_outcome, indicator_id]
    );

    await logAuditAction(req, 'VALIDATE_CYBER_INDICATOR', 'Cyber Intelligence', { indicator_id, validation_status, mitigation_outcome });

    res.json({ message: 'Cyber threat indicator validation updated', indicator_id, validation_status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
