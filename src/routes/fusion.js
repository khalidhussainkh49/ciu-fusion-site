const express = require('express');
const router = express.Router();
const { getAsync, allAsync } = require('../db');
const { authenticateToken, logAuditAction } = require('../middleware/auth');

// GET /api/fusion/overview
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    const totalReports = await getAsync('SELECT COUNT(*) as count FROM intelligence_reports');
    const pendingReports = await getAsync("SELECT COUNT(*) as count FROM intelligence_reports WHERE status = 'Submitted'");
    const activeCases = await getAsync("SELECT COUNT(*) as count FROM case_files WHERE status = 'Active'");
    const watchlistCount = await getAsync("SELECT COUNT(*) as count FROM entity_profiles WHERE watchlist_status = 'Active'");
    const highRiskCargo = await getAsync("SELECT COUNT(*) as count FROM cargo_profiles WHERE risk_score >= 80");
    const activeCyberAlerts = await getAsync("SELECT COUNT(*) as count FROM cyber_indicators WHERE validation_status != 'Mitigated'");

    const recentAlerts = await allAsync('SELECT * FROM intelligence_reports ORDER BY created_at DESC LIMIT 5');
    const recentCases = await allAsync('SELECT * FROM case_files ORDER BY created_at DESC LIMIT 5');
    const highRiskEntities = await allAsync("SELECT * FROM entity_profiles WHERE watchlist_status = 'Active' OR risk_score >= 70 ORDER BY risk_score DESC LIMIT 5");

    await logAuditAction(req, 'VIEW_FUSION_OVERVIEW', 'Intelligence Fusion Centre', 'Viewed national fusion overview');

    res.json({
      metrics: {
        total_reports: totalReports.count,
        pending_reports: pendingReports.count,
        active_cases: activeCases.count,
        watchlist_count: watchlistCount.count,
        high_risk_cargo: highRiskCargo.count,
        active_cyber_alerts: activeCyberAlerts.count
      },
      recent_alerts: recentAlerts,
      recent_cases: recentCases,
      high_risk_entities: highRiskEntities
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/fusion/briefs
router.get('/briefs', authenticateToken, async (req, res) => {
  try {
    const period = req.query.period || 'daily';
    const topReports = await allAsync("SELECT * FROM intelligence_reports WHERE status = 'Approved' ORDER BY created_at DESC LIMIT 10");
    const topCargo = await allAsync("SELECT * FROM cargo_profiles WHERE hold_recommended = 1 ORDER BY risk_score DESC LIMIT 5");

    res.json({
      period,
      generated_at: new Date().toISOString(),
      summary: `Executive Intelligence Summary (${period.toUpperCase()}) for Customs Intelligence Unit`,
      key_intelligence_reports: topReports,
      high_risk_consignments: topCargo
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
