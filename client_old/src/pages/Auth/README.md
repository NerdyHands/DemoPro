# Authentication Page

A modern, responsive authentication page that combines login and signup functionality with a split-screen layout inspired by modern SaaS applications like monday.com.

## Features

### Design
- **Split-screen layout**: Form on the left, interactive illustration on the right
- **Modern UI**: Clean, professional design using the company's design system
- **Responsive**: Works seamlessly on desktop, tablet, and mobile devices
- **Interactive illustration**: Dashboard mockup with animated elements

### Functionality
- **Unified interface**: Single page handles both login and signup
- **OTP verification**: Secure 6-digit code verification system
- **Google OAuth**: Ready for Google authentication integration
- **Form validation**: Real-time validation with helpful error messages
- **Auto-focus**: Smart input focus management for OTP fields
- **Resend functionality**: Countdown timer for OTP resend

### User Experience
- **Smooth transitions**: Animated state changes and hover effects
- **Loading states**: Clear feedback during API calls
- **Error handling**: User-friendly error messages
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Components

### Auth.jsx
Main authentication component that handles:
- Form state management
- OTP verification flow
- API integration
- Navigation logic

### Auth.css
Comprehensive styling including:
- Responsive grid layout
- Interactive animations
- Form styling
- Illustration design

## Usage

The authentication page is now the default route (`/`) and can also be accessed at `/auth`.

### Routes
- `/` - Redirects to `/auth`
- `/auth` - Main authentication page
- `/login` - Legacy login page (still available)
- `/signup` - Legacy signup page (still available)

## API Integration

The component integrates with the existing API service:
- `apiService.sendOTP()` - Send verification codes
- `apiService.verifyOTP()` - Verify OTP for login
- `apiService.register()` - Register new users

## Design System

Uses the existing CSS custom properties:
- `--primary-color`: #10b981 (emerald green)
- `--text-primary`: #1a202c (dark gray)
- `--bg-white`: #ffffff (white)
- Consistent spacing, border radius, and transitions

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Responsive design adapts to all screen sizes
