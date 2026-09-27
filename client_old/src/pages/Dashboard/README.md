# Unified Dashboard Component

## Overview
The Dashboard component is a unified dashboard that automatically switches between Admin and Customer views based on the logged-in user's role.

## How It Works

### Role Detection
The component checks the user's role from `localStorage.userProfile`:
- If `user.role === 'admin'` → Shows AdminDashboard
- Otherwise (including 'client', 'user', or any other role) → Shows ProjectDashboard

### Routes
All the following routes now point to this unified Dashboard component:
- `/dashboard` - Main dashboard route
- `/project-dashboard` - Legacy customer dashboard route  
- `/admin` - Admin dashboard route

### User Experience

#### For Customer Users:
1. User logs in with customer/client role
2. Navigates to `/dashboard` or `/project-dashboard`
3. Sees the ProjectDashboard with their projects and reports

#### For Admin Users:
1. User logs in with admin role
2. Navigates to `/dashboard` or `/admin`
3. Sees the AdminDashboard with system statistics, user management, quotes, etc.

### Navigation
- **Header Navigation**: 
  - All users see "Dashboard" link (goes to `/dashboard`)
  - Admin users additionally see "Admin Dashboard" link (goes to `/admin`)
  - Both routes show the appropriate view based on user role

### Benefits
1. **Single Source of Truth**: One dashboard component handles routing logic
2. **Simplified Routing**: No need for separate route guards or duplicate routes
3. **Better UX**: Users automatically see the correct dashboard for their role
4. **Maintainability**: Easier to update dashboard logic in one place
5. **Security**: Role checking happens on every mount, ensuring correct view

### Implementation Details

#### File Structure
```
client/src/pages/
├── Dashboard/
│   ├── Dashboard.jsx          # Unified dashboard (NEW)
│   └── README.md              # This file
├── AdminDashboard/
│   ├── AdminDashboard.jsx     # Admin view (unchanged)
│   └── PipelineDashboard.jsx  # Admin pipeline view
└── ProjectDashboard/
    └── ProjectDashboard.jsx   # Customer view (unchanged)
```

#### Authentication Flow
1. User logs in via Auth.jsx
2. Auth stores user profile in localStorage with role information
3. User is redirected to `/dashboard`
4. Unified Dashboard component reads user role and renders appropriate view
5. User sees their role-specific dashboard

### Code Example
```jsx
// Dashboard.jsx determines which view to show
const userRole = user?.role || 'client';

if (userRole === 'admin') {
  return <AdminDashboard />;
}
return <ProjectDashboard />;
```

## Testing
To verify the unified dashboard works correctly:

1. **Test Customer View**:
   - Login as a customer/client user
   - Navigate to `/dashboard` or `/project-dashboard`
   - Verify ProjectDashboard is displayed with customer features

2. **Test Admin View**:
   - Login as an admin user
   - Navigate to `/dashboard` or `/admin`
   - Verify AdminDashboard is displayed with admin features

3. **Test Navigation**:
   - Click "Dashboard" link in header
   - For admin: Click "Admin Dashboard" link
   - Verify correct dashboard appears in both cases

4. **Test Role Switching**:
   - Switch between admin and customer accounts
   - Verify dashboard changes appropriately
   - Check that unauthorized users cannot access admin features

## Migration Notes
- **No Breaking Changes**: Existing routes still work
- **Backward Compatible**: `/project-dashboard` and `/admin` routes maintained
- **Original Components**: AdminDashboard and ProjectDashboard unchanged
- **Transparent to Users**: No changes to user experience, just cleaner architecture

