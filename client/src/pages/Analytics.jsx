/**
 * Analytics.jsx
 * Detailed analytics page with charts and metrics
 */
import { useState } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Users,
    Clock,
    Target,
    Award,
    Calendar,
    Download
} from 'lucide-react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { useAuth } from '../hooks/useAuth';
import './Analytics.css';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

/**
 * Analytics component
 * Displays detailed learning analytics and performance metrics
 */
const Analytics = () => {
    const { isInstructor } = useAuth();
    const [timeRange, setTimeRange] = useState('30days');

    // Mock analytics data
    const summaryStats = isInstructor ? [
        { icon: Users, label: 'Total Students', value: '12,840', change: '+12%', positive: true },
        { icon: Clock, label: 'Avg. Time on Platform', value: '2.4h', change: '+8%', positive: true },
        { icon: Target, label: 'Avg. Quiz Score', value: '78%', change: '-2%', positive: false },
        { icon: Award, label: 'Certificates Issued', value: '847', change: '+15%', positive: true }
    ] : [
        { icon: Clock, label: 'Total Study Time', value: '48h', change: '+12%', positive: true },
        { icon: Target, label: 'Avg. Quiz Score', value: '85%', change: '+5%', positive: true },
        { icon: Award, label: 'Courses Completed', value: '3', change: '+1', positive: true },
        { icon: TrendingUp, label: 'Learning Streak', value: '12 days', change: 'Best: 24', positive: true }
    ];

    // Study Time / Engagement Chart
    const engagementData = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
            {
                label: 'Study Hours',
                data: [12, 18, 15, 22],
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                fill: true,
                tension: 0.4
            },
            {
                label: 'Goal',
                data: [15, 15, 15, 15],
                borderColor: '#d1d5db',
                borderDash: [5, 5],
                fill: false,
                tension: 0
            }
        ]
    };

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                align: 'end'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(0,0,0,0.05)' }
            },
            x: {
                grid: { display: false }
            }
        }
    };

    // Performance by Subject
    const subjectData = {
        labels: ['Machine Learning', 'Python', 'Data Science', 'Deep Learning', 'Statistics'],
        datasets: [
            {
                data: [85, 92, 78, 65, 88],
                backgroundColor: [
                    '#4f46e5',
                    '#22c55e',
                    '#f59e0b',
                    '#ef4444',
                    '#8b5cf6'
                ],
                borderWidth: 0
            }
        ]
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right'
            }
        },
        cutout: '65%'
    };

    // Activity by Day
    const activityData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Hours',
                data: [2.5, 4, 5.5, 3, 4.5, 2, 1.5],
                backgroundColor: '#4f46e5',
                borderRadius: 6
            }
        ]
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(0,0,0,0.05)' }
            },
            x: {
                grid: { display: false }
            }
        }
    };

    // Recent Activity
    const recentActivity = [
        { type: 'quiz', title: 'Completed ML Basics Quiz', score: '92%', date: 'Today' },
        { type: 'course', title: 'Started Deep Learning Module', progress: '15%', date: 'Yesterday' },
        { type: 'certificate', title: 'Earned Python Certificate', date: '3 days ago' },
        { type: 'quiz', title: 'Completed Data Viz Quiz', score: '78%', date: '5 days ago' }
    ];

    return (
        <div className="analytics-page">
            {/* Header */}
            <div className="analytics-header">
                <div>
                    <h1>Analytics Overview</h1>
                    <p>Track your learning progress and performance metrics</p>
                </div>
                <div className="header-actions">
                    <select
                        className="time-select"
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                    >
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                        <option value="90days">Last 90 Days</option>
                        <option value="year">This Year</option>
                    </select>
                    <button className="btn btn-secondary">
                        <Download size={16} />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="analytics-stats">
                {summaryStats.map((stat, index) => (
                    <div key={index} className="analytics-stat-card">
                        <div className="stat-icon-box">
                            <stat.icon size={20} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">{stat.label}</span>
                            <div className="stat-row">
                                <span className="stat-value">{stat.value}</span>
                                <span className={`stat-change ${stat.positive ? 'positive' : 'negative'}`}>
                                    {stat.positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                    {stat.change}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="analytics-charts">
                {/* Engagement Over Time */}
                <div className="chart-card chart-large">
                    <div className="chart-header">
                        <h3>Study Time Trend</h3>
                        <span className="chart-subtitle">Weekly comparison vs goal</span>
                    </div>
                    <div className="chart-body">
                        <Line data={engagementData} options={lineOptions} />
                    </div>
                </div>

                {/* Performance by Subject */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Performance by Subject</h3>
                        <span className="chart-subtitle">Average quiz scores</span>
                    </div>
                    <div className="chart-body doughnut-chart">
                        <Doughnut data={subjectData} options={doughnutOptions} />
                    </div>
                </div>

                {/* Activity by Day */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Weekly Activity</h3>
                        <span className="chart-subtitle">Hours per day</span>
                    </div>
                    <div className="chart-body">
                        <Bar data={activityData} options={barOptions} />
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Recent Activity</h3>
                        <span className="chart-subtitle">Your learning timeline</span>
                    </div>
                    <div className="activity-list">
                        {recentActivity.map((item, index) => (
                            <div key={index} className="activity-row">
                                <div className={`activity-dot ${item.type}`}></div>
                                <div className="activity-info">
                                    <span className="activity-title">{item.title}</span>
                                    <span className="activity-meta">
                                        {item.score || item.progress || ''} {item.date}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Learning Insights */}
            <div className="insights-section">
                <h2>AI-Powered Insights</h2>
                <div className="insights-grid">
                    <div className="insight-card">
                        <div className="insight-icon success">
                            <TrendingUp size={20} />
                        </div>
                        <h4>Strong Performance</h4>
                        <p>Your quiz scores in Machine Learning have improved by 15% this month. Keep up the great work!</p>
                    </div>
                    <div className="insight-card">
                        <div className="insight-icon warning">
                            <Target size={20} />
                        </div>
                        <h4>Area for Improvement</h4>
                        <p>Deep Learning concepts need more practice. Consider reviewing the backpropagation module.</p>
                    </div>
                    <div className="insight-card">
                        <div className="insight-icon info">
                            <Clock size={20} />
                        </div>
                        <h4>Study Pattern</h4>
                        <p>You're most productive on Wednesdays. Try scheduling difficult topics on this day.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
