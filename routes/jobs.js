const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const jobController = require('../controllers/jobController');

router.route('/')
  .get(jobController.getJobs)
  .post(protect, authorize('employer'), jobController.createJob);

router.route('/:id')
  .get(jobController.getJob)
  .put(protect, authorize('employer'), jobController.updateJob)
  .delete(protect, authorize('employer'), jobController.deleteJob);
  
router.route('/search')
  .get(jobController.searchJobs);


module.exports = router;