/**
 * DashboardLayout.jsx
 * Layout wrapper for authenticated dashboard pages
 */
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import './DashboardLayout.css';

/**
 * DashboardLayout component
 * Provides consistent layout with sidebar and navbar for dashboard pages
 */
const DashboardLayout = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className={`dashboard-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            {/* Sidebar */}
            <Sidebar isCollapsed={sidebarCollapsed} />

            {/* Main Content Area */}
            <div className="dashboard-content">
                {/* Top Navbar */}
                <Navbar showSearch={true} isLanding={false} />

                {/* Page Content */}
                <main className="dashboard-main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
