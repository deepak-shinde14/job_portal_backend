const { body } = require('express-validator');
const Application = require('../models/Application');
const Job = require('../models/Job');
const mongoose = require('mongoose');


// @desc    Create application
exports.createApplication = async (req, res) => {
  console.log(req.body)
  try {
    const { jobId, coverLetter, resume } = req.body;

    // Enhanced validation
    if (!jobId || !coverLetter || !resume) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide job ID, cover letter and resume URL'
      });
    }

    // Validate job ID format
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid job ID format'
      });
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ 
        success: false,
        message: 'Job not found' 
      });
    }

    // Check if user is trying to apply to their own job
    if (job.postedBy.toString() === req.user.id) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot apply to your own job' 
      });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      user: req.user.id
    });

    if (existingApplication) {
      return res.status(400).json({ 
        success: false,
        message: 'You have already applied to this job' 
      });
    }

    const application = await Application.create({
      job: jobId,
      user: req.user.id,
      coverLetter,
      resume,
      status: 'pending'
    });

    // Populate details for response
    const populatedApp = await Application.findById(application._id)
      .populate('job', 'title company')
      .populate('user', 'name email');

    res.status(201).json({
      success: true,
      data: populatedApp
    });
  } catch (error) {
    console.error('Application error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while processing application' 
    });
  }
};

// @desc    Get user's applications
exports.getUserApplications = async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user.id })
      .populate('job', 'title company location');

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get applications for a job
exports.getJobApplications = async (req, res) => {
  try {
    const applications = await Application.find({ job: req.params.jobId })
      .populate('user', 'name email');

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update application status
exports.updateApplication = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'reviewed', 'accepted', 'rejected'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const application = await Application.findById(req.params.id)
      .populate('job', 'postedBy');
      
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify the updater is the job poster
    if (application.job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }

    application.status = status;
    await application.save();

    res.json(application);
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('user', 'name email')
      .populate('job', 'title company postedBy');
      
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Verify requester has access (either applicant or job poster)
    const isApplicant = application.user._id.toString() === req.user.id;
    const isJobPoster = application.job.postedBy.toString() === req.user.id;
    
    if (!isApplicant && !isJobPoster) {
      return res.status(403).json({ message: 'Not authorized to view this application' });
    }
    
    res.json(application);
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getEmployerApplications = async (req, res) => {
  try {
    // Get jobs posted by this employer
    const jobs = await Job.find({ postedBy: req.user.id });
    const jobIds = jobs.map(job => job._id);

    const applications = await Application.find({ job: { $in: jobIds } })
      .populate('user', 'name email')
      .populate('job', 'title company');

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteApplication = async (req, res) => {
  try {
    await Application.findByIdAndDelete(req.params.id);
    res.json({ message: 'Application removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get application statistics for jobseeker
exports.getJobSeekerStats = async (req, res) => {
  try {
    const stats = await Application.aggregate([
      { $match: { user: mongoose.Types.ObjectId(req.user.id) } },
      { $group: { 
        _id: '$status',
        count: { $sum: 1 }
      }}
    ]);
    
    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get application statistics for employer
exports.getEmployerStats = async (req, res) => {
  try {
    // Get jobs posted by this employer
    const jobs = await Job.find({ postedBy: req.user.id });
    const jobIds = jobs.map(job => job._id);
    
    const stats = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { 
        _id: '$status',
        count: { $sum: 1 }
      }}
    ]);
    
    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};