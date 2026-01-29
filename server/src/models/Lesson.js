import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a lesson title'],
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
    moduleIndex: {
      type: Number,
      default: null // Maps to course.modules[moduleIndex]
    },
    content: {
      type: String,
      required: true // HTML content
    },
    videoUrl: {
      type: String,
      default: null
    },
    youtubeUrl: {
      type: String,
      default: null // YouTube embed URL
    },
    resources: [{
      title: String,
      url: String,
      type: String
    }],
    duration: {
      type: Number, // in minutes
      default: 0
    },
    order: {
      type: Number,
      default: 0
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

// Populate course on query
lessonSchema.pre(/^find/, function (next) {
  if (this.options._recursed) {
    return next();
  }
  this.populate({
    path: 'course',
    select: 'title'
  });
  next();
});

export default mongoose.model('Lesson', lessonSchema);
