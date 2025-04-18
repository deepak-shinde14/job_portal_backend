const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship']
  },
  salary: { type: String, required: true },
  description: { type: String, required: true },
  requirements: [String],
  category: { 
    type: String, 
    required: true,
    enum: ['Development', 'Design', 'Marketing', 'Sales', 'Business', 'Customer Support']
  },
  postedBy: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Job', jobSchema);
