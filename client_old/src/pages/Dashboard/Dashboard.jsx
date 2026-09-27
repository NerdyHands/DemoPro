import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from '../AdminDashboard/AdminDashboard.jsx';
import ProjectDashboard from '../ProjectDashboard/ProjectDashboard.jsx';

/**
 * Unified Dashboard Component
 * Automatically switches between Admin and Customer views based on user role
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check user role from localStorage
    try {
      const userProfileString = localStorage.getItem('userProfile');
      const authToken = localStorage.getItem('authToken');
      
      // If no auth token, redirect to login
      if (!authToken) {
        navigate('/auth', { replace: true });
        return;
      }

      if (userProfileString) {
        const user = JSON.parse(userProfileString);
        setUserRole(user?.role || 'client');
      } else {
        // If no user profile but has token, default to client
        setUserRole('client');
      }
    } catch (error) {
      console.error('Error parsing user profile:', error);
      setUserRole('client'); // Default to client on error
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Show loading state while determining user role
  if (loading) {
    return (
      <>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
          color: '#666'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div className="loading-spinner" style={{
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #ff6b35',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  // Render admin or customer dashboard based on role
  if (userRole === 'admin') {
    return <AdminDashboard />;
  }

  // Default to customer dashboard (includes 'client', 'user', and any other roles)
  return <ProjectDashboard />;
};

export default Dashboard;

