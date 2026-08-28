const express = require('express');
const router = express.Router();
const { runAsync, getAsync, allAsync } = require('../db');
const { authenticateToken, requireClearance, logAuditAction } = require('../middleware/auth');

// GET /api/cases - List investigation cases
router.get('/', authenticateToken, async (req, res) => {
  try {
    let sql = `
      SELECT c.*,
             u1.full_name as assigned_officer_name,
             u2.full_name as supervisor_name
      FROM case_files c
      LEFT JOIN users u1 ON c.assigned_officer_id = u1.id
      LEFT JOIN users u2 ON c.supervisor_id = u2.id
      WHERE 1=1
    `;
    const params = [];

    if (req.query.status) {
      sql += ' AND c.status = ?';
      params.push(req.query.status);
    }

    if (req.query.assigned_to) {
      sql += ' AND c.assigned_officer_id = ?';
      params.push(req.query.assigned_to);
    }

    sql += ' ORDER BY c.created_at DESC';
    const cases = await allAsync(sql, params);
    res.json({ cases });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cases/:id - Detailed case view with evidence and tasks
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const caseFile = await getAsync(`
      SELECT c.*,
             u1.full_name as assigned_officer_name,
             u2.full_name as supervisor_name,
             r.title as originating_report_title
      FROM case_files c
      LEFT JOIN users u1 ON c.assigned_officer_id = u1.id
      LEFT JOIN users u2 ON c.supervisor_id = u2.id
      LEFT JOIN intelligence_reports r ON c.originating_report_id = r.id
      WHERE c.id = ?
    `, [req.params.id]);

    if (!caseFile) {
      return res.status(404).json({ error: 'Case file not found' });
    }

    const evidence = await allAsync('SELECT * FROM case_evidence WHERE case_id = ?', [req.params.id]);
    const tasks = await allAsync(`
      SELECT t.*, u.full_name as assignee_name
      FROM case_tasks t
      JOIN users u ON t.assigned_to = u.id
      WHERE t.case_id = ?
    `, [req.params.id]);

    await logAuditAction(req, 'VIEW_CASE_FILE', 'Case Management', { case_id: caseFile.id, case_number: caseFile.case_number });

    res.json({
      case_file: caseFile,
      evidence,
      tasks
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cases - Initiate investigation case from intelligence report
router.post('/', authenticateToken, requireClearance(2), async (req, res) => {
  try {
    const { title, category, originating_report_id, assigned_officer_id } = req.body;
    if (!title || !category || !assigned_officer_id) {
      return res.status(400).json({ error: 'Case title, category, and assigned officer are required' });
    }

    const caseCount = await getAsync('SELECT COUNT(*) as count FROM case_files');
    const caseNumber = `CIU/INV/2026/${String(caseCount.count + 1).padStart(5, '0')}`;

    const result = await runAsync(
      `INSERT INTO case_files (case_number, title, category, originating_report_id, assigned_officer_id, supervisor_id, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Active')`,
      [caseNumber, title, category, originating_report_id || null, assigned_officer_id, req.user.id]
    );

    await logAuditAction(req, 'CREATE_INVESTIGATION_CASE', 'Case Management', { case_id: result.lastID, case_number: caseNumber });

    res.status(201).json({
      message: 'Investigation case created successfully',
      case_id: result.lastID,
      case_number: caseNumber
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cases/:id/evidence - Register digital/physical evidence
router.post('/:id/evidence', authenticateToken, async (req, res) => {
  try {
    const { item_description, evidence_type, custodian } = req.body;
    if (!item_description || !evidence_type || !custodian) {
      return res.status(400).json({ error: 'Evidence description, type, and custodian are required' });
    }

    const result = await runAsync(
      'INSERT INTO case_evidence (case_id, item_description, evidence_type, custodian) VALUES (?, ?, ?, ?)',
      [req.params.id, item_description, evidence_type, custodian]
    );

    await logAuditAction(req, 'ADD_CASE_EVIDENCE', 'Case Management', { case_id: req.params.id, evidence_id: result.lastID });

    res.status(201).json({ message: 'Evidence added to digital evidence register', evidence_id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cases/:id/tasks - Assign investigation task
router.post('/:id/tasks', authenticateToken, async (req, res) => {
  try {
    const { task_title, assigned_to, due_date } = req.body;
    if (!task_title || !assigned_to || !due_date) {
      return res.status(400).json({ error: 'Task title, assignee, and due date are required' });
    }

    const result = await runAsync(
      'INSERT INTO case_tasks (case_id, task_title, assigned_to, due_date) VALUES (?, ?, ?, ?)',
      [req.params.id, task_title, assigned_to, due_date]
    );

    await logAuditAction(req, 'ASSIGN_CASE_TASK', 'Case Management', { case_id: req.params.id, task_id: result.lastID });

    res.status(201).json({ message: 'Investigation task assigned successfully', task_id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cases/:id/close - Close case file with report
router.post('/:id/close', authenticateToken, requireClearance(2), async (req, res) => {
  try {
    const { outcome, closure_report } = req.body;
    if (!outcome || !closure_report) {
      return res.status(400).json({ error: 'Outcome and closure report are required to close case' });
    }

    await runAsync(
      "UPDATE case_files SET status = 'Closed', outcome = ?, closure_report = ? WHERE id = ?",
      [outcome, closure_report, req.params.id]
    );

    await logAuditAction(req, 'CLOSE_CASE_FILE', 'Case Management', { case_id: req.params.id, outcome });

    res.json({ message: 'Investigation case file closed successfully', case_id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
