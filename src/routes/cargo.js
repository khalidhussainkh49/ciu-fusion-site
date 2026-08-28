const express = require('express');
const router = express.Router();
const { runAsync, getAsync, allAsync } = require('../db');
const { authenticateToken, requireClearance, logAuditAction } = require('../middleware/auth');

// GET /api/cargo/profile - list & search cargo declarations
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    let sql = 'SELECT * FROM cargo_profiles WHERE 1=1';
    const params = [];

    if (req.query.search) {
      sql += ' AND (paar_number LIKE ? OR sgd_number LIKE ? OR container_number LIKE ? OR importer_name LIKE ? OR agent_name LIKE ?)';
      const term = `%${req.query.search}%`;
      params.push(term, term, term, term, term);
    }

    if (req.query.selectivity_lane) {
      sql += ' AND selectivity_lane = ?';
      params.push(req.query.selectivity_lane);
    }

    if (req.query.hold_recommended) {
      sql += ' AND hold_recommended = ?';
      params.push(req.query.hold_recommended === 'true' ? 1 : 0);
    }

    sql += ' ORDER BY risk_score DESC';
    const cargoList = await allAsync(sql, params);
    res.json({ cargo: cargoList });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cargo/profile/:id
router.get('/profile/:id', authenticateToken, async (req, res) => {
  try {
    const cargo = await getAsync('SELECT * FROM cargo_profiles WHERE id = ?', [req.params.id]);
    if (!cargo) {
      return res.status(404).json({ error: 'Cargo profile declaration not found' });
    }

    // Risk indicator check
    const entityRisk = await getAsync('SELECT * FROM entity_profiles WHERE name LIKE ? OR name LIKE ?', [`%${cargo.importer_name}%`, `%${cargo.agent_name}%`]);

    await logAuditAction(req, 'VIEW_CARGO_PROFILE', 'Cargo Profiling', { cargo_id: cargo.id, paar_number: cargo.paar_number });

    res.json({
      cargo,
      entity_risk_match: entityRisk || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cargo/profile - Submit new cargo profile for risk scoring
router.post('/profile', authenticateToken, async (req, res) => {
  try {
    const {
      paar_number, form_m, sgd_number, manifest_number, container_number,
      vessel_name, importer_name, agent_name, commodity, hs_code,
      declared_value, origin_country, route, examination_note
    } = req.body;

    if (!paar_number || !form_m || !sgd_number || !manifest_number || !container_number || !importer_name || !agent_name || !hs_code) {
      return res.status(400).json({ error: 'Missing mandatory cargo profiling details' });
    }

    // Dynamic risk scoring rule evaluation
    let risk_score = 10;
    let selectivity_lane = 'Green';
    let hold_recommended = 0;

    // Check high risk origin or sensitive HS codes
    if (['China', 'Turkey', 'Dubai', 'India'].includes(origin_country)) risk_score += 25;
    if (hs_code.startsWith('8429') || hs_code.startsWith('9301') || hs_code.startsWith('3004')) risk_score += 30;
    if (declared_value > 20000000) risk_score += 20;

    // Check importer watchlist match
    const entityMatch = await getAsync("SELECT * FROM entity_profiles WHERE (name LIKE ? OR name LIKE ?) AND watchlist_status = 'Active'", [`%${importer_name}%`, `%${agent_name}%`]);
    if (entityMatch) {
      risk_score += 35;
    }

    if (risk_score >= 80) {
      selectivity_lane = 'Red';
      hold_recommended = 1;
    } else if (risk_score >= 50) {
      selectivity_lane = 'Yellow';
    }

    const result = await runAsync(
      `INSERT INTO cargo_profiles
      (paar_number, form_m, sgd_number, manifest_number, container_number, vessel_name, importer_name, agent_name, commodity, hs_code, declared_value, origin_country, route, risk_score, selectivity_lane, examination_note, hold_recommended)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [paar_number, form_m, sgd_number, manifest_number, container_number, vessel_name, importer_name, agent_name, commodity, hs_code, declared_value || 0, origin_country || 'Unknown', route || 'Direct', risk_score, selectivity_lane, examination_note || null, hold_recommended]
    );

    await logAuditAction(req, 'CREATE_CARGO_PROFILE', 'Cargo Profiling', { cargo_id: result.lastID, paar_number, risk_score, selectivity_lane });

    res.status(201).json({
      message: 'Cargo profile ingested and evaluated by CIU Risk Engine',
      cargo_id: result.lastID,
      risk_score,
      selectivity_lane,
      hold_recommended: !!hold_recommended
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cargo/hold-recommendation - Recommend cargo hold / physical examination
router.post('/hold-recommendation', authenticateToken, requireClearance(2), async (req, res) => {
  try {
    const { cargo_id, examination_note, hold_recommended } = req.body;
    if (!cargo_id) {
      return res.status(400).json({ error: 'Cargo ID required' });
    }

    await runAsync(
      'UPDATE cargo_profiles SET examination_note = ?, hold_recommended = ?, selectivity_lane = ? WHERE id = ?',
      [examination_note, hold_recommended ? 1 : 0, hold_recommended ? 'Red' : 'Yellow', cargo_id]
    );

    await logAuditAction(req, 'ISSUE_CARGO_HOLD', 'Cargo Profiling', { cargo_id, examination_note, hold_recommended });

    res.json({ message: 'Cargo examination recommendation updated successfully', cargo_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
