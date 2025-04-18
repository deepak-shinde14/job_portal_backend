const Application = require('../models/Application');
const Job = require('../models/Job');

exports.checkApplicationOwnership = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Check if user is applicant or job poster
    const job = await Job.findById(application.job);
    const isApplicant = application.user.toString() === req.user.id;
    const isJobPoster = job.postedBy.toString() === req.user.id;
    
    if (!isApplicant && !isJobPoster) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    req.application = application;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
