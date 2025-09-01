import axios from "axios";

// Request cache for GET requests
const requestCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch the token directly from localStorage
const getToken = () => localStorage.getItem("token");

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response || error.message);
    return Promise.reject(error);
  }
);

// Cache key generator
const getCacheKey = (url, params = {}) => {
  const paramString = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return `${url}${paramString ? `?${paramString}` : ""}`;
};

// Clear cache for specific URL pattern
const clearCachePattern = (pattern) => {
  for (const key of requestCache.keys()) {
    if (key.includes(pattern)) {
      requestCache.delete(key);
    }
  }
};

// ---------------- FETCH DATA WITH CACHING ----------------
export const fetchDataFromApi = async (url, useCache = true) => {
  try {
    const cacheKey = getCacheKey(url);

    // Check cache first
    if (useCache && requestCache.has(cacheKey)) {
      const cachedData = requestCache.get(cacheKey);
      if (Date.now() - cachedData.timestamp < CACHE_DURATION) {
        console.log("DEBUG: Using cached data for:", url);
        return cachedData.data;
      } else {
        requestCache.delete(cacheKey); // Remove expired cache
      }
    }

    console.log("DEBUG: API Call URL =", process.env.REACT_APP_BASE_URL + url);

    const { data } = await api.get(url);

    // Cache the response if caching is enabled
    if (useCache) {
      requestCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });
    }

    return data;
  } catch (error) {
    console.error("Fetch error:", error.response || error.message);
    return null;
  }
};

// ---------------- POST DATA ----------------
// export const postData = async (url, payload) => {
//   try {
//     console.log("DEBUG: POST URL =", process.env.REACT_APP_BASE_URL + url);
//     console.log("DEBUG: Payload =", payload);

//     const { data } = await api.post(url, payload);

//     // Clear relevant cache after POST
//     clearCachePattern(url.split('/')[1]); // Clear cache for the resource

//     return data;
//   } catch (error) {
//     console.error("Post data error:", error.response || error.message);
//     return {
//       error: true,
//       msg:
//         error.response?.data?.msg ||
//         error.response?.data?.message ||
//         error.message ||
//         "Network Error",
//     };
//   }
// };
export const postData = async (url, payload) => {
  try {
    console.log("DEBUG: POST URL =", process.env.REACT_APP_BASE_URL + url);
    console.log("DEBUG: Payload =", payload);

    const { data } = await api.post(url, payload);

    // Clear relevant cache after a successful POST
    clearCachePattern(url.split("/")[1]);

    return data;
  } catch (error) {
    // The console.error is already handled by the Axios interceptor.
    // The most important change is to re-throw the error so the
    // component's catch block can handle the UI feedback.
    throw error;
  }
};
// ---------------- PUT DATA WITH OPTIMISTIC UPDATES ----------------
export const putData = async (url, payload) => {
  try {
    const { data } = await api.put(url, payload);

    // Clear relevant cache after PUT
    clearCachePattern(url.split("/")[1]);

    return data;
  } catch (error) {
    console.error("Put data error:", error.response || error.message);
    throw error;
  }
};

// ---------------- DELETE DATA ----------------
export const deleteData = async (url) => {
  try {
    const { data } = await api.delete(url);

    // Clear relevant cache after DELETE
    clearCachePattern(url.split("/")[1]);

    return data;
  } catch (error) {
    console.error("Delete data error:", error.response || error.message);
    throw error;
  }
};

// ---------------- BATCH OPERATIONS ----------------
export const batchDeleteData = async (urls) => {
  try {
    const deletePromises = urls.map((url) => api.delete(url));
    const results = await Promise.allSettled(deletePromises);

    // Clear cache for all affected resources
    urls.forEach((url) => clearCachePattern(url.split("/")[1]));

    return results;
  } catch (error) {
    console.error("Batch delete error:", error);
    throw error;
  }
};

// ---------------- UPLOAD IMAGE ----------------
export const uploadImage = async (url, formData) => {
  try {
    const { data } = await api.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    clearCachePattern(url.split("/")[1]);

    return data;
  } catch (error) {
    console.error("Image upload error:", error.response || error.message);
    throw error;
  }
};

// ---------------- DELETE IMAGES ----------------
export const deleteImages = async (url) => {
  try {
    const { data } = await api.delete(url);
    clearCachePattern(url.split("/")[1]);
    return data;
  } catch (error) {
    console.error("Delete image error:", error.response || error.message);
    throw error;
  }
};

// ---------------- UTILITY FUNCTIONS ----------------
export const clearCache = () => {
  requestCache.clear();
  console.log("Cache cleared");
};

export const getCacheSize = () => requestCache.size;

// Cart specific optimized functions
export const updateCartItem = async (itemId, updates) => {
  try {
    // Optimistic approach - update locally first, then sync with server
    const { data } = await api.put(`/api/cart/${itemId}`, updates);
    clearCachePattern("cart");
    return data;
  } catch (error) {
    console.error("Cart update error:", error);
    throw error;
  }
};

// Debounced cart update utility
const updateTimeouts = new Map();

export const debouncedCartUpdate = (itemId, updates, delay = 500) => {
  return new Promise((resolve, reject) => {
    // Clear existing timeout for this item
    if (updateTimeouts.has(itemId)) {
      clearTimeout(updateTimeouts.get(itemId));
    }

    // Set new timeout
    const timeoutId = setTimeout(async () => {
      try {
        const result = await updateCartItem(itemId, updates);
        updateTimeouts.delete(itemId);
        resolve(result);
      } catch (error) {
        updateTimeouts.delete(itemId);
        reject(error);
      }
    }, delay);

    updateTimeouts.set(itemId, timeoutId);
  });
};
