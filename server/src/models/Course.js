import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Module title is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  },
  lessons: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    youtubeUrl: {
      type: String,
      default: null
    },
    duration: {
      type: Number, // in minutes
      default: 0
    },
    order: {
      type: Number,
      default: 0
    },
    resources: [{
      title: String,
      url: String
    }],
    isPublished: {
      type: Boolean,
      default: true
    }
  }],
  isPublished: {
    type: Boolean,
    default: true
  }
});

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a course title'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide a course description']
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    category: {
      type: String,
      enum: ['Web Development', 'Data Science', 'Design', 'Business', 'Programming', 'Other'],
      default: 'Other'
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner'
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1633356540215-9e2cfb2a5985?w=400&h=300&fit=crop'
    },
    price: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    studentsEnrolled: {
      type: Number,
      default: 0
    },
    duration: {
      type: Number, // in hours
      default: 0
    },
    modules: [moduleSchema],
    lessons: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    }],
    quizzes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz'
    }],
    isPaid: {
      type: Boolean,
      default: false
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

// Populate instructor on query
courseSchema.pre(/^find/, function (next) {
  if (this.options._recursed) {
    return next();
  }
  this.populate({
    path: 'instructor',
    select: 'name email avatar role'
  });
  next();
});

export default mongoose.model('Course', courseSchema);
