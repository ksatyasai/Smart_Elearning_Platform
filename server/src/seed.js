import 'dotenv/config';
import connectDB from './src/config/database.js';
import User from './src/models/User.js';
import Course from './src/models/Course.js';
import Lesson from './src/models/Lesson.js';
import Quiz from './src/models/Quiz.js';

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Course.deleteMany({});
    await Lesson.deleteMany({});
    await Quiz.deleteMany({});

    console.log('Creating seed data...');

    // Create users
    const instructor = await User.create({
      name: 'John Instructor',
      email: 'instructor@example.com',
      password: 'password123',
      role: 'instructor',
      plan: 'Instructor Pro AI',
      verified: true
    });

    const student1 = await User.create({
      name: 'Jane Student',
      email: 'student1@example.com',
      password: 'password123',
      role: 'student',
      plan: 'Premium Plan',
      verified: true
    });

    const student2 = await User.create({
      name: 'Bob Learner',
      email: 'student2@example.com',
      password: 'password123',
      role: 'student',
      plan: 'Free Plan',
      verified: true
    });

    console.log('Users created');

    // Create courses
    const course1 = await Course.create({
      title: 'Advanced Machine Learning',
      description: 'Master machine learning techniques with real-world projects',
      instructor: instructor._id,
      category: 'Data Science',
      level: 'Advanced',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
      price: 49.99,
      rating: 4.8,
      studentsEnrolled: 2,
      duration: 40,
      isPublished: true
    });

    const course2 = await Course.create({
      title: 'UI/UX Design Masterclass',
      description: 'Learn modern design principles and create stunning user interfaces',
      instructor: instructor._id,
      category: 'Design',
      level: 'Intermediate',
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
      price: 39.99,
      rating: 4.6,
      studentsEnrolled: 1,
      duration: 30,
      isPublished: true
    });

    const course3 = await Course.create({
      title: 'Web Development with React',
      description: 'Build modern web applications using React and Node.js',
      instructor: instructor._id,
      category: 'Web Development',
      level: 'Beginner',
      image: 'https://images.unsplash.com/photo-1633356540215-9e2cfb2a5985?w=400&h=300&fit=crop',
      price: 0,
      rating: 4.9,
      studentsEnrolled: 2,
      duration: 35,
      isPublished: true
    });

    console.log('Courses created');

    // Create lessons for course1
    const lesson1 = await Lesson.create({
      title: 'Introduction to Machine Learning',
      description: 'Learn the fundamentals of ML',
      course: course1._id,
      content: '<h2>Welcome to ML</h2><p>This lesson covers the basics of machine learning algorithms.</p>',
      duration: 45,
      order: 1,
      isPublished: true
    });

    const lesson2 = await Lesson.create({
      title: 'Neural Networks Deep Dive',
      description: 'Understand neural networks',
      course: course1._id,
      content: '<h2>Neural Networks</h2><p>Explore how neural networks work and their applications.</p>',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: 60,
      order: 2,
      isPublished: true
    });

    // Create lessons for course2
    const lesson3 = await Lesson.create({
      title: 'Design Fundamentals',
      description: 'Basic design principles',
      course: course2._id,
      content: '<h2>Design Basics</h2><p>Learn color theory, typography, and layout.</p>',
      duration: 50,
      order: 1,
      isPublished: true
    });

    const lesson4 = await Lesson.create({
      title: 'Prototyping & Wireframing',
      description: 'Create effective wireframes',
      course: course2._id,
      content: '<h2>Prototyping</h2><p>Learn to create prototypes and wireframes for your designs.</p>',
      duration: 55,
      order: 2,
      isPublished: true
    });

    // Create lessons for course3
    const lesson5 = await Lesson.create({
      title: 'React Basics',
      description: 'Get started with React',
      course: course3._id,
      content: '<h2>React Basics</h2><p>Learn JSX, components, and state management.</p>',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: 40,
      order: 1,
      isPublished: true
    });

    const lesson6 = await Lesson.create({
      title: 'Building Your First Component',
      description: 'Create React components',
      course: course3._id,
      content: '<h2>React Components</h2><p>Build reusable components and manage their lifecycle.</p>',
      duration: 50,
      order: 2,
      isPublished: true
    });

    // Add lessons to courses
    course1.lessons = [lesson1._id, lesson2._id];
    await course1.save();

    course2.lessons = [lesson3._id, lesson4._id];
    await course2.save();

    course3.lessons = [lesson5._id, lesson6._id];
    await course3.save();

    console.log('Lessons created');

    // Create quizzes
    const quiz1 = await Quiz.create({
      title: 'ML Fundamentals Quiz',
      description: 'Test your knowledge of machine learning basics',
      course: course1._id,
      lesson: lesson1._id,
      questions: [
        {
          question: 'What is machine learning?',
          type: 'multiple-choice',
          options: [
            'A type of artificial intelligence',
            'A programming language',
            'A database system',
            'A web framework'
          ],
          correctAnswer: 'A type of artificial intelligence',
          points: 1
        },
        {
          question: 'What is supervised learning?',
          type: 'multiple-choice',
          options: [
            'Learning with labeled data',
            'Learning without labels',
            'Learning from humans only',
            'A type of deep learning'
          ],
          correctAnswer: 'Learning with labeled data',
          points: 1
        }
      ],
      passingScore: 60,
      duration: 15,
      isPublished: true
    });

    const quiz2 = await Quiz.create({
      title: 'Design Principles Quiz',
      description: 'Test your understanding of design principles',
      course: course2._id,
      lesson: lesson3._id,
      questions: [
        {
          question: 'What is the primary goal of UX design?',
          type: 'multiple-choice',
          options: [
            'To make products easy to use',
            'To make products beautiful',
            'To reduce development time',
            'To increase server speed'
          ],
          correctAnswer: 'To make products easy to use',
          points: 1
        }
      ],
      passingScore: 60,
      duration: 10,
      isPublished: true
    });

    // Add quizzes to courses
    course1.quizzes = [quiz1._id];
    await course1.save();

    course2.quizzes = [quiz2._id];
    await course2.save();

    console.log('Quizzes created');

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
