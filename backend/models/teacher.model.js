const mongoose = require("mongoose");

const workingHoursSchema = new mongoose.Schema({
  startTime: String,
  endTime: String,
});

const teacherSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    teacherName: {
      type: String,
      required: true,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
    },
    profilePhotourl: { type: String },
    localUrl: { type: String },
    startingDate: {
      type: String,
      required: true,
    },
    aboutMe: {
      type: String,
      default: "",
    },
    subjects: [
      {
        type: String,
        required: true,
      },
    ],
    workingHours: {
      monday: workingHoursSchema,
      tuesday: workingHoursSchema,
      wednesday: workingHoursSchema,
      thursday: workingHoursSchema,
      friday: workingHoursSchema,
      saturday: workingHoursSchema,
      sunday: workingHoursSchema,
    },
    salary: {
      type: {
        type: String,
        enum: ["monthly", "hourly"],
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
    },
    createdAt: String,
    updatedAt: String,
  },
  {
    versionKey: false,
  }
);

// Set timestamps before saving
teacherSchema.pre("save", function (next) {
  const now = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
  });

  if (!this.createdAt) {
    this.createdAt = now;
  }
  this.updatedAt = now;
  next();
});

const Teacher = mongoose.model("Teacher", teacherSchema);
module.exports = Teacher;
