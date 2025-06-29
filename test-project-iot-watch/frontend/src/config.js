/**
 * Application Configuration
 * ========================
 * 
 * This module contains configuration constants and environment variable
 * settings for the IoT Temperature Watch application.
 * 
 * The configuration supports both development and production environments
 * through environment variables, with sensible defaults for local development.
 * 
 * Environment Variables:
 * - VITE_API_URL: Base URL for the Open-Meteo weather API
 * - VITE_API_BASE_URL: Base URL for the Flask backend API
 */

// API configuration with environment variable support
export const API_URL = import.meta.env.VITE_API_URL || 'https://api.open-meteo.com/v1/forecast';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'; 