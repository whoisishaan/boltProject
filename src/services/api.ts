// API service for mindmap data
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface MindmapListItem {
  id: string;
  title: string;
  description: string;
  version: string;
  created: string;
  lastModified: string;
  category: string;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic fetch wrapper with error handling
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new ApiError(response.status, errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    console.error('API request failed:', error);
    throw new ApiError(0, 'Network error - please check if the backend server is running');
  }
}

// API functions
export const mindmapApi = {
  // Get all mindmaps (for sidebar)
  async getAllMindmaps(): Promise<MindmapListItem[]> {
    const mindmaps = await apiRequest<Array<{
      id: string;
      metadata: {
        title: string;
        description: string;
        version: string;
        created: string;
        lastModified: string;
      };
      category?: string; // Add category to the response type
    }>>('/mindmaps');

    console.log('Fetched mindmaps from API:', mindmaps);

    // Transform the data to match the MindmapListItem interface
    return mindmaps.map(mindmap => ({
      id: mindmap.id,
      title: mindmap.metadata?.title || 'Untitled',
      description: mindmap.metadata?.description || '',
      version: mindmap.metadata?.version || '1.0.0',
      created: mindmap.metadata?.created || new Date().toISOString(),
      lastModified: mindmap.metadata?.lastModified || new Date().toISOString(),
      category: mindmap.category || 'default'
    }));
  },

  // Get specific mindmap by ID
  async getMindmapById(id: string) {
    return apiRequest(`/mindmaps/${id}`);
  },

  // Get mindmap by title (alternative method)
  async getMindmapByTitle(title: string) {
    const encodedTitle = encodeURIComponent(title);
    return apiRequest(`/mindmaps/title/${encodedTitle}`);
  },

  // Create new mindmap
  async createMindmap(mindmapData: any) {
    return apiRequest('/mindmaps', {
      method: 'POST',
      body: JSON.stringify(mindmapData),
    });
  },

  // Update existing mindmap
  async updateMindmap(id: string, mindmapData: any) {
    return apiRequest(`/mindmaps/${id}`, {
      method: 'PUT',
      body: JSON.stringify(mindmapData),
    });
  },

  // Delete mindmap
  async deleteMindmap(id: string) {
    return apiRequest(`/mindmaps/${id}`, {
      method: 'DELETE',
    });
  },

  // Health check
  async healthCheck() {
    return apiRequest('/health');
  }
};

// File upload
export const uploadFile = async (file: File): Promise<{ message: string; fileId: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
    // Don't set Content-Type header, let the browser set it with the correct boundary
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(response.status, error.message || 'File upload failed');
  }

  return response.json();
};

// Utility function to handle API errors in components
export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 0) {
      return 'Unable to connect to server. Please ensure the backend is running on http://localhost:3001';
    }
    return error.message;
  }
  
  return 'An unexpected error occurred';
}