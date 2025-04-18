const { check } = require('express-validator');

exports.validateApplication = [
  check('jobId', 'Job ID is required').notEmpty(),
  check('coverLetter', 'Cover letter is required').notEmpty(),
  check('resume', 'Resume URL is required').notEmpty(),
  check('resume', 'Invalid URL format').isURL()
];