// src/admin/services/adminApi.ts

// Define response types for authentication
interface LoginResponse {
  token: string;
  username: string;
}

interface VerifyResponse {
  valid: boolean;
  username: string;
}

// Get the token from localStorage
const getToken = () => localStorage.getItem('admin_token');

// API base URL
const API_BASE_URL = 'http://127.0.0.1:5001/api/admin';

// Helper function for authenticated API calls
const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token');
  }
  
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`
  };
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'API request failed');
  }
  
  return response.json();
};

// Helper function for non-authenticated API calls
const publicFetch = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'API request failed');
  }
  
  return response.json();
};

export const adminApi = {
  // Authentication methods
  async login(username: string, password: string): Promise<LoginResponse> {
    return publicFetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
  },
  
  async verifyToken(): Promise<VerifyResponse> {
    const token = getToken();
    
    if (!token) {
      return { valid: false, username: '' };
    }
    
    try {
      return await authFetch(`${API_BASE_URL}/auth/verify`);
    } catch (error) {
      console.error('Token verification failed:', error);
      return { valid: false, username: '' };
    }
  },
  
  // Get all submissions with optional filtering
  async getSubmissions(filters = {}) {
    const queryParams = new URLSearchParams(filters as Record<string, string>);
    return authFetch(`${API_BASE_URL}/submissions?${queryParams}`);
  },
  
  // Get details for a specific submission
  async getSubmissionDetail(submissionId: string) {
    return authFetch(`${API_BASE_URL}/submissions/${submissionId}`);
  },
  
  // Simulate results with custom scores
  async simulateResults(learning_score: number, application_score: number) {
    return authFetch(`${API_BASE_URL}/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ learning_score, application_score })
    });
  }
};