/**
 * Google Apps Script Configuration
 * 
 * This file contains the Google Apps Script web app URL for form submissions.
 * 
 * IMPORTANT: If you get a 403 Forbidden error, check that your Google Apps Script is deployed with:
 * - Execute as: "Me"
 * - Who has access: "Anyone" (NOT "Only myself")
 * 
 * To use environment variables, set VITE_GOOGLE_APPS_SCRIPT_URL in your .env file
 * 
 * Note: The URL below should match the web app URL from your Google Apps Script deployment.
 * Get the URL from: Deploy → Manage deployments → Copy the web app URL
 */

// Use environment variable if available, otherwise use the default URL
export const GOOGLE_APPS_SCRIPT_URL = 
  import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || 
  'https://script.google.com/macros/s/AKfycby4zgFSCvKHqjrPTPEtYddpAA0WsVtu_fgNWpdhPiV94NsM-e8tl3HXLQ6alcxkYhpa/exec';


