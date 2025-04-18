const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createApplication,
  getUserApplications,
  getJobApplications,
  updateApplication,
  deleteApplication,
  getApplication,
  getEmployerApplications,
  getJobSeekerStats,
  getEmployerStats
} = require('../controllers/applicationController');
const { checkApplicationOwnership } = require('../middleware/applicationMiddleware')
const { validateApplication } = require('../middleware/applicationValidation');

// Jobseeker routes
router.route('/')
  .post(protect, createApplication);

router.route('/my-applications')
  .get(protect, authorize('jobseeker'), getUserApplications);

// Employer routes
router.route('/job/:jobId')
  .get(protect, authorize('employer'), getJobApplications);

router.route('/employer/applications')
  .get(protect, authorize('employer'), getEmployerApplications);

// Shared routes
router.route('/:id')
  .get(protect, checkApplicationOwnership, getApplication)
  .put(protect, authorize('employer'), checkApplicationOwnership, updateApplication)
  .delete(protect, checkApplicationOwnership, deleteApplication)

// In applications.js
router.route('/stats/jobseeker')
  .get(protect, authorize('jobseeker'), getJobSeekerStats);

router.route('/stats/employer')
  .get(protect, authorize('employer'), getEmployerStats);
module.exports = router;