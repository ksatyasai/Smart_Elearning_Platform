/**
 * Landing.jsx
 * Main landing/home page for the EduAI platform
 */
import { Link } from 'react-router-dom';
import {
    Play,
    Brain,
    MessageSquare,
    BarChart3,
    Shield,
    ArrowRight,
    CheckCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Landing.css';

// Hero section image placeholder
const heroImage = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop';

/**
 * Landing component
 * Marketing page with hero, features, CTA sections
 */
const Landing = () => {
    // Statistics data
    const stats = [
        { value: '10k+', label: 'Active Students' },
        { value: '98%', label: 'Satisfaction Rate' },
        { value: '5M+', label: 'AI Insights Generated' }
    ];

    // Features data
    const features = [
        {
            icon: Brain,
            title: 'Adaptive Quizzes',
            description: 'Questions that evolve based on your real-time performance and difficulty curve.',
            color: 'primary'
        },
        {
            icon: MessageSquare,
            title: 'AI Feedback',
            description: 'Instant, constructive critiques on assignments and essays to help you improve.',
            color: 'info'
        },
        {
            icon: BarChart3,
            title: 'Progress Tracking',
            description: 'Visual data dashboards to monitor growth and mastery across all subjects.',
            color: 'success'
        },
        {
            icon: Shield,
            title: 'Local AI',
            description: 'Privacy-focused AI processing that happens right on your device for total security.',
            color: 'warning'
        }
    ];

    return (
        <div className="landing-page">
            {/* Navigation */}
            <Navbar isLanding={true} />

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-container">
                    <div className="hero-content">
                        <span className="hero-badge">
                            <span className="badge-icon">✦</span>
                            NEXT-GEN EDTECH
                        </span>

                        <h1 className="hero-title">
                            Personalized Learning{' '}
                            <span className="gradient-text">Powered by AI</span>
                        </h1>

                        <p className="hero-description">
                            Revolutionize your educational journey with adaptive quizzes,
                            instant feedback, and data-driven insights tailored just for you.
                            Built for students who crave mastery.
                        </p>

                        <div className="hero-actions">
                            <Link to="/signup" className="btn btn-primary btn-lg">
                                Get Started Free
                            </Link>
                            <button className="btn btn-secondary btn-lg">
                                <Play size={18} />
                                Watch Demo
                            </button>
                        </div>
                    </div>

                    <div className="hero-visual">
                        <div className="hero-image-wrapper">
                            <img
                                src={heroImage}
                                alt="Students learning with AI"
                                className="hero-image"
                            />
                            <div className="hero-stats-card">
                                <div className="stats-card-icon">
                                    <BarChart3 size={20} />
                                </div>
                                <div className="stats-card-content">
                                    <span className="stats-card-label">GROWTH METRICS</span>
                                    <span className="stats-card-value">+42% Learning Efficiency</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Statistics Section */}
            <section className="stats-section">
                <div className="stats-container">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-item">
                            <span className="stat-label">{stat.label}</span>
                            <span className="stat-value">{stat.value}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="features-container">
                    <div className="features-header">
                        <span className="section-badge">POWERFUL CAPABILITIES</span>
                        <h2 className="section-title">Core AI Features built for modern learners</h2>
                        <p className="section-description">
                            Our platform uses cutting-edge machine learning to provide a truly bespoke
                            educational experience.
                        </p>
                    </div>

                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card">
                                <div className={`feature-icon feature-icon-${feature.color}`}>
                                    <feature.icon size={24} />
                                </div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-container">
                    <div className="cta-card">
                        <h2 className="cta-title">Ready to transform your learning?</h2>
                        <p className="cta-description">
                            Join thousands of students and educators already using EduAI to
                            achieve their academic goals.
                        </p>
                        <div className="cta-actions">
                            <Link to="/signup" className="btn btn-secondary btn-lg cta-btn-primary">
                                Get Started Now
                            </Link>
                            <Link to="/contact" className="btn btn-outline btn-lg cta-btn-secondary">
                                Contact Sales
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default Landing;
