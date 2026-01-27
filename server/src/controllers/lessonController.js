import Lesson from '../models/Lesson.js';
import Course from '../models/Course.js';
import Progress from '../models/Progress.js';

// @desc    Get course lessons
// @route   GET /api/lessons/course/:courseId
// @access  Private
export const getCourseLessons = async (req, res, next) => {
  try {
    const lessons = await Lesson.find({ course: req.params.courseId })
      .sort({ order: 1 });

    res.status(200).json({
      success: true,
      count: lessons.length,
      lessons
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single lesson
// @route   GET /api/lessons/:id
// @access  Private
export const getLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    res.status(200).json({
      success: true,
      lesson
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark lesson as complete
// @route   POST /api/lessons/:id/complete
// @access  Private
export const markLessonComplete = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    // Create or update progress
    const progress = await Progress.findOneAndUpdate(
      { student: req.user.id, lesson: req.params.id, course: lesson.course },
      {
        student: req.user.id,
        lesson: req.params.id,
        course: lesson.course,
        completed: true,
        completedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Lesson marked as complete',
      progress
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create lesson (Instructor)
// @route   POST /api/lessons
// @access  Private (instructor only)
export const createLesson = async (req, res, next) => {
  try {
    const { title, description, content, course, videoUrl, duration, order } = req.body;

    if (!title || !content || !course) {
      return res.status(400).json({ success: false, message: 'Title, content and course are required' });
    }

    // Check if user is the course instructor
    const courseDoc = await Course.findById(course);
    if (!courseDoc || courseDoc.instructor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to add lessons to this course' });
    }

    const lesson = await Lesson.create({
      title,
      description: description || '',
      content,
      course,
      videoUrl: videoUrl || null,
      duration: duration || 0,
      order: order || 0
    });

    // Add lesson to course
    courseDoc.lessons.push(lesson._id);
    await courseDoc.save();

    res.status(201).json({
      success: true,
      message: 'Lesson created successfully',
      lesson
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lesson (Instructor)
// @route   PUT /api/lessons/:id
// @access  Private (instructor only)
export const updateLesson = async (req, res, next) => {
  try {
    let lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    // Check authorization
    const course = await Course.findById(lesson.course);
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this lesson' });
    }

    const { title, description, content, videoUrl, duration, order, isPublished } = req.body;

    if (title) lesson.title = title;
    if (description !== undefined) lesson.description = description;
    if (content) lesson.content = content;
    if (videoUrl !== undefined) lesson.videoUrl = videoUrl;
    if (duration !== undefined) lesson.duration = duration;
    if (order !== undefined) lesson.order = order;
    if (isPublished !== undefined) lesson.isPublished = isPublished;

    await lesson.save();

    res.status(200).json({
      success: true,
      message: 'Lesson updated successfully',
      lesson
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete lesson (Instructor)
// @route   DELETE /api/lessons/:id
// @access  Private (instructor only)
export const deleteLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    // Check authorization
    const course = await Course.findById(lesson.course);
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this lesson' });
    }

    // Remove from course
    course.lessons.pull(lesson._id);
    await course.save();

    await Lesson.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Lesson deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
