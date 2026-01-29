import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a quiz title'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      default: null
    },
    questions: [{
      question: String,
      type: {
        type: String,
        enum: ['multiple-choice', 'true-false', 'short-answer']
      },
      options: [String],
      correctAnswer: mongoose.Schema.Types.Mixed,
      points: { type: Number, default: 1 }
    }],
    totalPoints: {
      type: Number,
      default: 0
    },
    passingScore: {
      type: Number,
      default: 60 // percentage
    },
    duration: {
      type: Number, // in minutes
      default: 30
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Calculate total points before saving
quizSchema.pre('save', function (next) {
  if (this.questions && Array.isArray(this.questions)) {
    this.totalPoints = this.questions.reduce((sum, q) => {
      const points = q.points || 1;
      return sum + points;
    }, 0);
  } else {
    this.totalPoints = 0;
  }
  next();
});

export default mongoose.model('Quiz', quizSchema);
