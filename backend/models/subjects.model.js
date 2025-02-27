const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  // other fields if needed
});

module.exports = mongoose.model('subjects', subjectSchema);
