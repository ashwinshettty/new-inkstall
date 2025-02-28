const mongoose = require("mongoose");

const gradesSchema = new mongoose.Schema({
  grades: [String],
});

const Grades = mongoose.model("Grades", gradesSchema);

module.exports = Grades;
