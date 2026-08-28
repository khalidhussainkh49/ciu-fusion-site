const express = require('express');
const router = express.Router();
const { getAsync, allAsync } = require('../db');
const { authenticateToken, logAuditAction } = require('../middleware/auth');

// GET /api/kpi/commands - Command ranking & performance KPIs
router.get('/commands', authenticateToken, async (req, res) => {
  try {
    const commandStats = await allAsync(`
      SELECT command,
             COUNT(*) as total_reports,
             SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approved_reports,
             SUM(CASE WHEN classification = 'Secret' THEN 1 ELSE 0 END) as secret_grade_reports
      FROM intelligence_reports
      GROUP BY command
      ORDER BY total_reports DESC
    `);

    // Add revenue recovery simulation & seizure metrics per command
    const rankings = commandStats.map((cmd, idx) => ({
      rank: idx + 1,
      command: cmd.command,
      total_reports: cmd.total_reports,
      approved_reports: cmd.approved_reports,
      productivity_score: Math.min(100, cmd.total_reports * 20 + cmd.approved_reports * 15),
      est_revenue_recovered_ngn: cmd.approved_reports * 150000000
    }));

    await logAuditAction(req, 'VIEW_COMMAND_KPI', 'KPI & Command Ranking', 'Viewed command performance leaderboard');

    res.json({ rankings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/kpi/reports/monthly - Automated monthly report generator
router.get('/reports/monthly', authenticateToken, async (req, res) => {
  try {
    const month = req.query.month || 'June 2026';

    const reportCount = await getAsync('SELECT COUNT(*) as count FROM intelligence_reports');
    const caseCount = await getAsync('SELECT COUNT(*) as count FROM case_files');
    const watchlistCount = await getAsync("SELECT COUNT(*) as count FROM entity_profiles WHERE watchlist_status = 'Active'");
    const redCargoCount = await getAsync("SELECT COUNT(*) as count FROM cargo_profiles WHERE selectivity_lane = 'Red'");

    res.json({
      title: `Monthly Customs Intelligence Performance Report - ${month}`,
      generated_by: req.user.full_name,
      generated_at: new Date().toISOString(),
      summary_metrics: {
        total_reports_submitted: reportCount.count,
        investigation_cases_initiated: caseCount.count,
        active_watchlist_entities: watchlistCount.count,
        red_lane_targeted_consignments: redCargoCount.count,
        estimated_revenue_protected_ngn: redCargoCount.count * 450000000
      },
      conclusion: 'Overall CIU intelligence output demonstrates high actionable impact across maritime ports and border corridors.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
