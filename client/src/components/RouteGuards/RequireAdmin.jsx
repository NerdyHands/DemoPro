import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// Simple admin route guard using localStorage userProfile
const RequireAdmin = ({ children }) => {
  let isAdmin = false;
  try {
    const userProfileString = localStorage.getItem('userProfile');
    if (userProfileString) {
      const user = JSON.parse(userProfileString);
      isAdmin = user?.role === 'admin';
    }
  } catch {
    isAdmin = false;
  }

  const location = useLocation();
  if (!isAdmin) {
    return <Navigate to="/auth" replace state={{ from: location, reason: 'admin_required' }} />;
  }

  return children;
};

export default RequireAdmin;


