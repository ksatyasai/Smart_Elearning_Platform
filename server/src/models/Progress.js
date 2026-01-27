import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
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
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    lastAccessedAt: {
      type: Date,
      default: Date.now
    },
    timeSpent: {
      type: Number, // in minutes
      default: 0
    }
  },
  { timestamps: true }
);

// Compound unique index
progressSchema.index({ student: 1, course: 1, lesson: 1 }, { unique: true });

export default mongoose.model('Progress', progressSchema);
