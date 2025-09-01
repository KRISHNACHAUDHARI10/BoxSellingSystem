import axios from "axios";

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL || "http://localhost:4000",
  timeout: 30000, // 30 seconds timeout
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Response Error:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
    });

    // Handle specific HTTP status codes
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      window.location.href = "/signin";
    } else if (error.response?.status === 403) {
      console.warn("Access forbidden - insufficient permissions");
    } else if (error.response?.status >= 500) {
      console.error("Server error occurred");
    }

    return Promise.reject(error);
  }
);

export const fetchDataFromApi = async (url) => {
  try {
    console.log(`🚀 Fetching data from: ${url}`);
    const response = await api.get(url);
    console.log(`✅ Success fetching ${url}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error fetching ${url}:`, error.message);

    // Return a more user-friendly error
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Network error occurred";

    throw new Error(errorMessage);
  }
};

export const uploadImage = async (url, formData) => {
  try {
    console.log(`📤 Uploading images to: ${url}`);
    const response = await api.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log(`✅ Upload successful:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Upload error for ${url}:`, error.message);

    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Upload failed";

    throw new Error(errorMessage);
  }
};

export const postData = async (url, payload, includeToken = true) => {
  try {
    console.log(`📝 Posting data to: ${url}`, payload);

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (!includeToken) {
      // Skip the interceptor for this request
      delete config.headers.Authorization;
    }

    const response = await api.post(url, payload, config);
    console.log(`✅ Post successful:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Post error for ${url}:`, error.message);

    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Request failed";

    throw new Error(errorMessage);
  }
};

export const putData = async (url, payload) => {
  try {
    console.log(`🔄 Updating data at: ${url}`, payload);
    const response = await api.put(url, payload);
    console.log(`✅ Update successful:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Update error for ${url}:`, error.message);

    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Update failed";

    throw new Error(errorMessage);
  }
};

export const deleteData = async (url) => {
  try {
    console.log(`🗑️ Deleting data at: ${url}`);
    const response = await api.delete(url);
    console.log(`✅ Delete successful:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Delete error for ${url}:`, error.message);

    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Delete failed";

    throw new Error(errorMessage);
  }
};

export const deleteImages = async (url) => {
  try {
    console.log(`🖼️ Deleting images at: ${url}`);
    const response = await api.delete(url);
    console.log(`✅ Image delete successful:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Image delete error for ${url}:`, error.message);

    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Image delete failed";

    throw new Error(errorMessage);
  }
};

// New utility function for health check
export const checkApiHealth = async () => {
  try {
    const response = await api.get("/health");
    return response.data;
  } catch (error) {
    console.error("API health check failed:", error.message);
    throw error;
  }
};

// Export the axios instance for direct use if needed
export { api };
