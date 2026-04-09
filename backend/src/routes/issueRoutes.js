const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

// GET all issues (Public)
router.get('/', issueController.getAllIssues);

// GET user-specific issues (Protected)
router.get('/user', protect, issueController.getUserIssues);

// POST a new issue (Protected)
router.post('/', protect, issueController.createIssue);

// UPDATE issue status (Protected)
router.put('/:id/status', protect, issueController.updateIssueStatus);

// Admin Dashboard Actions — auth optional for local dev
router.post('/assign/:issueId', issueController.assignIssue);
router.post('/resolve/:issueId', issueController.resolveIssue);
router.put('/action/:issueId', issueController.updateActionStatus);
router.get('/actions', issueController.getActionIssues);
router.get('/analytics', analyticsController.getAnalytics);

module.exports = router;
