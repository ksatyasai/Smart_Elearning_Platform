import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema(
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
    earnedAt: {
      type: Date,
      default: Date.now
    },
    certificateNumber: {
      type: String,
      unique: true
    },
    grade: Number,
    hoursSpent: Number
  },
  { timestamps: true }
);

// Generate certificate number before saving
certificateSchema.pre('save', async function (next) {
  if (!this.certificateNumber) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substr(2, 9).toUpperCase();
    this.certificateNumber = `CERT-${timestamp}-${random}`;
  }
  next();
});

export default mongoose.model('Certificate', certificateSchema);
