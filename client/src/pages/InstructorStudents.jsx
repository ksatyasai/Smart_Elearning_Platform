/**
 * InstructorStudents.jsx
 * Page for instructors to view and manage students enrolled in their courses
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft,
    Search,
    Mail,
    Phone,
    Award,
    AlertCircle,
    Filter,
    Loader
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { coursesAPI } from '../services/api';
import './InstructorStudents.css';

const InstructorStudents = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('all');
    const [courses, setCourses] = useState([]);

    // Fetch students from backend
    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Fetch instructor's students from backend
            const response = await coursesAPI.getInstructorStudents();
            const studentsList = response.data.students || [];
            
            // Extract unique courses from all enrollments
            const coursesSet = new Set();
            studentsList.forEach(student => {
                student.courseNames.forEach((name, idx) => {
                    if (student.enrolledCourses[idx]) {
                        coursesSet.add(JSON.stringify({
                            id: student.enrolledCourses[idx],
                            name: name
                        }));
                    }
                });
            });
            
            const coursesList = Array.from(coursesSet).map(c => {
                const parsed = JSON.parse(c);
                return { _id: parsed.id, title: parsed.name };
            });
            
            setStudents(studentsList);
            setFilteredStudents(studentsList);
            setCourses(coursesList);
        } catch (err) {
            console.error('Error fetching students:', err);
            setError(err.response?.data?.message || 'Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        filterStudents(term, selectedCourse);
    };

    const handleCourseFilter = (courseId) => {
        setSelectedCourse(courseId);
        filterStudents(searchTerm, courseId);
    };

    const filterStudents = (search, course) => {
        let filtered = students;

        // Filter by search term
        if (search) {
            filtered = filtered.filter(student =>
                student.name.toLowerCase().includes(search) ||
                student.email.toLowerCase().includes(search)
            );
        }

        // Filter by course
        if (course !== 'all') {
            filtered = filtered.filter(student =>
                student.enrolledCourses.includes(course)
            );
        }

        setFilteredStudents(filtered);
    };

    if (loading) {
        return (
            <div className="instructor-students dashboard-loading">
                <Loader size={40} className="loading-spinner" />
                <p>Loading students...</p>
            </div>
        );
    }

    return (
        <div className="instructor-students">
            {/* Header */}
            <div className="students-header">
                <Link to="/instructor" className="btn btn-secondary btn-icon-only">
                    <ArrowLeft size={20} />
                </Link>
                <div className="header-content">
                    <h1>Student Management 👥</h1>
                    <p>View and manage all students enrolled in your courses</p>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="message-container message-error">
                    <AlertCircle size={20} />
                    <p>{error}</p>
                </div>
            )}

            {/* Stats Bar */}
            <div className="stats-bar">
                <div className="stat-item">
                    <span className="stat-label">Total Students</span>
                    <span className="stat-value">{students.length}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Active Students</span>
                    <span className="stat-value">
                        {students.filter(s => s.enrollments?.some(e => e.status === 'active')).length}
                    </span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Total Courses</span>
                    <span className="stat-value">{courses.length}</span>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-section">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search students by name or email..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="search-input"
                    />
                </div>

                <div className="course-filters">
                    <Filter size={20} />
                    <select value={selectedCourse} onChange={(e) => handleCourseFilter(e.target.value)} className="filter-select">
                        <option value="all">All Courses</option>
                        {courses.map(course => (
                            <option key={course._id} value={course._id}>{course.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Students List */}
            {filteredStudents.length === 0 ? (
                <div className="empty-state">
                    <AlertCircle size={48} />
                    <p className="empty-state-title">No students found</p>
                    <p className="empty-state-subtitle">Students will appear here once they enroll in your courses</p>
                </div>
            ) : (
                <div className="students-table">
                    <div className="table-header">
                        <div className="col-name">Student Name</div>
                        <div className="col-email">Email</div>
                        <div className="col-courses">Enrolled Courses</div>
                        <div className="col-progress">Progress</div>
                        <div className="col-status">Status</div>
                    </div>

                    <div className="table-body">
                        {filteredStudents.map(student => (
                            <div key={student.id} className="table-row">
                                <div className="col-name">
                                    <div className="student-avatar">{student.name.charAt(0).toUpperCase()}</div>
                                    <span className="student-name">{student.name}</span>
                                </div>

                                <div className="col-email">
                                    <a href={`mailto:${student.email}`} className="student-email">
                                        <Mail size={16} />
                                        {student.email}
                                    </a>
                                </div>

                                <div className="col-courses">
                                    <div className="course-badges">
                                        {student.courseNames.slice(0, 2).map((courseName, idx) => (
                                            <span key={idx} className="badge">{courseName}</span>
                                        ))}
                                        {student.courseNames.length > 2 && (
                                            <span className="badge badge-more">+{student.courseNames.length - 2}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="col-progress">
                                    {(() => {
                                        const avgProgress = student.enrollments && student.enrollments.length > 0
                                            ? Math.round(student.enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / student.enrollments.length)
                                            : 0;
                                        return (
                                            <>
                                                <div className="progress-bar">
                                                    <div className="progress-fill" style={{width: `${avgProgress}%`}}></div>
                                                </div>
                                                <span className="progress-text">{avgProgress}%</span>
                                            </>
                                        );
                                    })()}
                                </div>

                                <div className="col-status">
                                    {(() => {
                                        const activeEnrollments = student.enrollments?.filter(e => e.status === 'active').length || 0;
                                        const isActive = activeEnrollments > 0;
                                        return (
                                            <span className={`status-badge status-${isActive ? 'active' : 'inactive'}`}>
                                                {isActive ? '✓ Active' : 'Inactive'}
                                            </span>
                                        );
                                    })()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstructorStudents;
