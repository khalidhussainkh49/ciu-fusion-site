const express = require('express');
const router = express.Router();
const { getAsync, allAsync } = require('../db');
const { authenticateToken, logAuditAction } = require('../middleware/auth');

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

    const rankings = commandStats.map((cmd, idx) => {
      const totalRpts = parseInt(cmd.total_reports, 10);
      const appRpts = parseInt(cmd.approved_reports, 10);
      return {
        rank: idx + 1,
        command: cmd.command,
        total_reports: totalRpts,
        approved_reports: appRpts,
        productivity_score: Math.min(100, totalRpts * 20 + appRpts * 15),
        est_revenue_recovered_ngn: appRpts * 150000000
      };
    });

    await logAuditAction(req, 'VIEW_COMMAND_KPI', 'KPI & Command Ranking', 'Viewed command performance leaderboard');

    res.json({ rankings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/reports/monthly', authenticateToken, async (req, res) => {
  try {
    const month = req.query.month || 'June 2026';

    const reportCount = await getAsync('SELECT COUNT(*) as count FROM intelligence_reports');
    const caseCount = await getAsync('SELECT COUNT(*) as count FROM case_files');
    const watchlistCount = await getAsync("SELECT COUNT(*) as count FROM entity_profiles WHERE watchlist_status = 'Active'");
    const redCargoCount = await getAsync("SELECT COUNT(*) as count FROM cargo_profiles WHERE selectivity_lane = 'Red'");

    const totalRpts = parseInt(reportCount.count, 10);
    const totalCases = parseInt(caseCount.count, 10);
    const totalWatchlist = parseInt(watchlistCount.count, 10);
    const totalRedCargo = parseInt(redCargoCount.count, 10);

    res.json({
      title: `Monthly Customs Intelligence Performance Report - ${month}`,
      generated_by: req.user.full_name,
      generated_at: new Date().toISOString(),
      summary_metrics: {
        total_reports_submitted: totalRpts,
        investigation_cases_initiated: totalCases,
        active_watchlist_entities: totalWatchlist,
        red_lane_targeted_consignments: totalRedCargo,
        estimated_revenue_protected_ngn: totalRedCargo * 450000000
      },
      conclusion: 'Overall CIU intelligence output demonstrates high actionable impact across maritime ports and border corridors.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
