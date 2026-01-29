import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Lesson from '../models/Lesson.js';
import { getPaginationParams, buildQuery } from '../utils/validators.js';

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
export const getAllCourses = async (req, res, next) => {
  try {
    const { page, limit, search, category, level } = req.query;
    const { pageNum, limitNum, skip } = getPaginationParams(page, limit);

    const query = buildQuery({ search, category, level, isPublished: true });

    const courses = await Course.find(query)
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Course.countDocuments(query);

    res.status(200).json({
      success: true,
      count: courses.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      courses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
export const getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate('lessons quizzes');

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.status(200).json({
      success: true,
      course
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get enrolled courses
// @route   GET /api/courses/enrolled
// @access  Private
export const getEnrolledCourses = async (req, res, next) => {
  try {
    console.log('Getting enrolled courses for user:', req.user._id);
    const enrollments = await Enrollment.find({ student: req.user._id }).populate('course');

    console.log('Found enrollments:', enrollments.length);

    const courses = enrollments.map(e => ({
      ...e.course.toObject(),
      enrollment: {
        status: e.status,
        progress: e.progress,
        enrolledAt: e.enrolledAt,
        completedAt: e.completedAt,
        certificateEarned: e.certificateEarned
      }
    }));

    res.status(200).json({
      success: true,
      count: courses.length,
      courses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Enroll in course
// @route   POST /api/courses/:id/enroll
// @access  Private
export const enrollCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user._id,
      course: req.params.id
    });

    if (existingEnrollment) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: req.params.id
    });

    // Update course student count
    course.studentsEnrolled += 1;
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Enrolled successfully',
      enrollment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get course progress
// @route   GET /api/courses/:id/progress
// @access  Private
export const getCourseProgress = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: req.params.id
    });

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Not enrolled in this course' });
    }

    const course = await Course.findById(req.params.id);
    const lessons = await Lesson.find({ course: req.params.id });

    res.status(200).json({
      success: true,
      progress: {
        enrolledAt: enrollment.enrolledAt,
        status: enrollment.status,
        progress: enrollment.progress,
        totalLessons: lessons.length,
        certificateEarned: enrollment.certificateEarned,
        completedAt: enrollment.completedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create course (Instructor)
// @route   POST /api/courses
// @access  Private (instructor only)
export const createCourse = async (req, res, next) => {
  try {
    const { title, description, category, level, price, image, isPublished, modules } = req.body;

    // Validation
    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description required' });
    }

    if (!title.trim() || title.trim().length < 5) {
      return res.status(400).json({ success: false, message: 'Title must be at least 5 characters' });
    }

    if (!description.trim() || description.trim().length < 20) {
      return res.status(400).json({ success: false, message: 'Description must be at least 20 characters' });
    }

    // Create course with instructor
    const course = await Course.create({
      title: title.trim(),
      description: description.trim(),
      category: category || 'Other',
      level: level || 'Beginner',
      price: price || 0,
      image: image || 'https://images.unsplash.com/photo-1516321318423-f06f70d504f0?w=400&h=300&fit=crop',
      instructor: req.user._id,
      isPublished: isPublished !== undefined ? isPublished : false,
      modules: modules || []
    });

    console.log('Course created:', course);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    console.error('Error creating course:', error);
    next(error);
  }
};

// @desc    Update course (Instructor)
// @route   PUT /api/courses/:id
// @access  Private (instructor only)
export const updateCourse = async (req, res, next) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check ownership
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this course' });
    }

    const { title, description, category, level, price, isPublished, image, modules } = req.body;

    if (title) course.title = title;
    if (description) course.description = description;
    if (category) course.category = category;
    if (level) course.level = level;
    if (price !== undefined) course.price = price;
    if (image) course.image = image;
    if (isPublished !== undefined) course.isPublished = isPublished;
    if (modules) course.modules = modules;

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      course
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get students enrolled in instructor's courses
// @route   GET /api/courses/instructor/students
// @access  Private (instructor only)
export const getInstructorStudents = async (req, res, next) => {
  try {
    // Get all courses for this instructor
    const courses = await Course.find({ instructor: req.user._id });

    if (!courses.length) {
      return res.status(200).json({
        success: true,
        students: [],
        message: 'No courses found for this instructor'
      });
    }

    const courseIds = courses.map(c => c._id);

    // Get all enrollments for instructor's courses
    const enrollments = await Enrollment.find({ course: { $in: courseIds } })
      .populate({
        path: 'student',
        select: 'name email phone'
      })
      .populate({
        path: 'course',
        select: 'title'
      });

    // Group students and their enrollments
    const studentMap = new Map();

    enrollments.forEach(enrollment => {
      const studentId = enrollment.student._id.toString();

      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, {
          id: studentId,
          name: enrollment.student.name,
          email: enrollment.student.email,
          phone: enrollment.student.phone,
          enrolledCourses: [],
          courseNames: [],
          enrollments: []
        });
      }

      const student = studentMap.get(studentId);
      if (!student.enrolledCourses.includes(enrollment.course._id.toString())) {
        student.enrolledCourses.push(enrollment.course._id.toString());
        student.courseNames.push(enrollment.course.title);
      }

      student.enrollments.push({
        courseId: enrollment.course._id.toString(),
        courseName: enrollment.course.title,
        status: enrollment.status,
        progress: enrollment.progress || 0,
        enrolledAt: enrollment.enrolledAt,
        completedAt: enrollment.completedAt,
        certificateEarned: enrollment.certificateEarned
      });
    });

    const students = Array.from(studentMap.values());

    res.status(200).json({
      success: true,
      count: students.length,
      students
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete course (Instructor)
// @route   DELETE /api/courses/:id
// @access  Private (instructor only)
export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check ownership
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this course' });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get analytics for instructor
// @route   GET /api/courses/analytics
// @access  Private (instructor only)
export const getInstructorAnalytics = async (req, res, next) => {
  try {
    const { timeRange = '30days' } = req.query;
    
    // Get all courses for this instructor
    const courses = await Course.find({ instructor: req.user._id });
    const courseIds = courses.map(c => c._id);

    // Get date range
    let startDate = new Date();
    switch (timeRange) {
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '90days':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case '30days':
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // Get all enrollments for instructor's courses in time range
    const enrollments = await Enrollment.find({
      course: { $in: courseIds },
      enrolledAt: { $gte: startDate }
    }).populate('student course');

    // Calculate summary stats
    const totalStudents = new Set(enrollments.map(e => e.student._id.toString())).size;
    const totalEnrollments = enrollments.length;
    const completedEnrollments = enrollments.filter(e => e.status === 'completed').length;
    const certificatesIssued = enrollments.filter(e => e.certificateEarned).length;
    const avgProgress = enrollments.length > 0
      ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length)
      : 0;

    // Get daily engagement data (last 7 days)
    const dailyEngagement = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayEnrollments = enrollments.filter(e => {
        const eDate = new Date(e.updatedAt);
        eDate.setHours(0, 0, 0, 0);
        return eDate.getTime() === date.getTime();
      });

      dailyEngagement.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        count: dayEnrollments.length,
        progress: dayEnrollments.length > 0
          ? Math.round(dayEnrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / dayEnrollments.length)
          : 0
      });
    }

    // Get performance by course
    const coursePerformance = courses.map(course => {
      const courseEnrollments = enrollments.filter(e => e.course._id.toString() === course._id.toString());
      return {
        courseId: course._id,
        courseName: course.title,
        students: courseEnrollments.length,
        avgProgress: courseEnrollments.length > 0
          ? Math.round(courseEnrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / courseEnrollments.length)
          : 0,
        completed: courseEnrollments.filter(e => e.status === 'completed').length
      };
    });

    // Get status distribution
    const statusDistribution = {
      active: enrollments.filter(e => e.status === 'active').length,
      completed: enrollments.filter(e => e.status === 'completed').length,
      dropped: enrollments.filter(e => e.status === 'dropped').length
    };

    res.status(200).json({
      success: true,
      analytics: {
        summaryStats: {
          totalStudents,
          totalEnrollments,
          completedEnrollments,
          certificatesIssued,
          avgProgress
        },
        dailyEngagement,
        coursePerformance,
        statusDistribution,
        timeRange
      }
    });
  } catch (error) {
    next(error);
  }
};
