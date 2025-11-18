const { OAuth2Client } = require('google-auth-library');

class GoogleOAuthService {
  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID;
    this.client = new OAuth2Client(this.clientId);
  }

  /**
   * Verify Google ID token
   * @param {string} idToken - Google ID token
   * @returns {Promise<Object>} - Decoded token payload
   */
  async verifyIdToken(idToken) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: idToken,
        audience: this.clientId
      });

      const payload = ticket.getPayload();
      
      console.log('✅ Google ID token verified successfully');
      
      return {
        success: true,
        payload: {
          sub: payload.sub, // Google user ID
          email: payload.email,
          email_verified: payload.email_verified,
          name: payload.name,
          given_name: payload.given_name,
          family_name: payload.family_name,
          picture: payload.picture,
          locale: payload.locale,
          hd: payload.hd // Hosted domain (for G Suite users)
        }
      };
    } catch (error) {
      console.error('❌ Google ID token verification failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verify Google access token
   * @param {string} accessToken - Google access token
   * @returns {Promise<Object>} - User info from Google
   */
  async verifyAccessToken(accessToken) {
    try {
      const userInfo = await this.client.getTokenInfo(accessToken);
      
      console.log('✅ Google access token verified successfully');
      
      return {
        success: true,
        userInfo: {
          email: userInfo.email,
          email_verified: userInfo.email_verified,
          scope: userInfo.scope
        }
      };
    } catch (error) {
      console.error('❌ Google access token verification failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get user info from Google using access token
   * @param {string} accessToken - Google access token
   * @returns {Promise<Object>} - User profile from Google
   */
  async getUserInfo(accessToken) {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Google API error: ${response.status} ${response.statusText}`);
      }

      const userInfo = await response.json();
      
      console.log('✅ Google user info retrieved successfully');
      
      return {
        success: true,
        userInfo: {
          id: userInfo.id,
          email: userInfo.email,
          verified_email: userInfo.verified_email,
          name: userInfo.name,
          given_name: userInfo.given_name,
          family_name: userInfo.family_name,
          picture: userInfo.picture,
          locale: userInfo.locale,
          hd: userInfo.hd
        }
      };
    } catch (error) {
      console.error('❌ Failed to get Google user info:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate Google OAuth data
   * @param {Object} userData - User data from client
   * @returns {Object} - Validation result
   */
  validateUserData(userData) {
    const errors = [];

    if (!userData.email) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(userData.email)) {
      errors.push('Invalid email format');
    }

    if (!userData.firstName) {
      errors.push('First name is required');
    }

    if (!userData.lastName) {
      errors.push('Last name is required');
    }

    if (!userData.googleId) {
      errors.push('Google ID is required');
    }

    if (userData.profilePicture && !this.isValidUrl(userData.profilePicture)) {
      errors.push('Invalid profile picture URL');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if email is valid
   * @param {string} email - Email to validate
   * @returns {boolean} - Is valid email
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Check if URL is valid
   * @param {string} url - URL to validate
   * @returns {boolean} - Is valid URL
   */
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Extract user data from Google token
   * @param {Object} tokenPayload - Decoded token payload
   * @returns {Object} - Formatted user data
   */
  extractUserData(tokenPayload) {
    return {
      email: tokenPayload.email,
      firstName: tokenPayload.given_name,
      lastName: tokenPayload.family_name,
      googleId: tokenPayload.sub,
      profilePicture: tokenPayload.picture,
      isGoogleUser: true
    };
  }
}

module.exports = GoogleOAuthService;
