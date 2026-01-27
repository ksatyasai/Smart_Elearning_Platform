import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    completedAt: Date,
    status: {
      type: String,
      enum: ['active', 'completed', 'dropped'],
      default: 'active'
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    certificateEarned: {
      type: Boolean,
      default: false
    },
    certificateDate: Date,
    grade: {
      type: Number,
      default: null
    }
  },
  { timestamps: true }
);

// Compound unique index - a student can only enroll once per course
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

// Populate student and course
enrollmentSchema.pre(/^find/, function (next) {
  if (this.options._recursed) {
    return next();
  }
  this.populate([
    { path: 'student', select: 'name email avatar' },
    { path: 'course', select: 'title image' }
  ]);
  next();
});

export default mongoose.model('Enrollment', enrollmentSchema);
