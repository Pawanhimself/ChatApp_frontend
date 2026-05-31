const BASE_URL = import.meta.env.VITE_API_URL ?? "http://10.134.38.199:8000/api";
const APP_URL  = import.meta.env.VITE_APP_URL  ?? "http://10.134.38.199:8000";

// ✅ AbortController se fetch timeout implement karo
// Mobile pe slow network mein request hang nahi karegi
const fetchWithTimeout = (url, options = {}, ms = 8000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer));
};

export const initCsrf = async () => {
  try {
    await fetchWithTimeout(`${APP_URL}/sanctum/csrf-cookie`, {
      method: "GET",
      credentials: "include",
    });
  } catch {
    // CSRF fail ho toh bhi aage chalo — request mein error aayega tab handle karenge
  }
};

const getXsrfToken = () => {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("XSRF-TOKEN="));
  if (!match) return null;
  return decodeURIComponent(match.split("=")[1]);
};

const apiCall = async (endpoint, method = "GET", body = null) => {
  const xsrfToken = getXsrfToken();

  const options = {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...(xsrfToken && { "X-XSRF-TOKEN": xsrfToken }),
    },
  };

  if (body) options.body = JSON.stringify(body);

  let response;
  try {
    response = await fetchWithTimeout(`${BASE_URL}${endpoint}`, options);
  } catch (err) {
    // AbortError = timeout
    if (err.name === "AbortError") {
      throw { message: "Request timeout. Network slow hai ya server down hai." };
    }
    throw { message: "Server se connection nahi ho pa raha." };
  }

  if (response.status === 204) return null;
  const data = await response.json();
  if (!response.ok) throw data;
  return data;
};

// Auth
export const registerUser = async (body) => { await initCsrf(); return apiCall("/register", "POST", body); };
export const loginUser    = async (body) => { await initCsrf(); return apiCall("/login",    "POST", body); };
export const logoutUser   = ()           => apiCall("/logout", "POST");
export const getMe        = ()           => apiCall("/me");

// Users
export const getUsers = (search = "") =>
  apiCall(`/users${search ? `?search=${encodeURIComponent(search)}` : ""}`);

// Chats
export const createChat      = (body)   => apiCall("/chat",                   "POST", body);
export const getChats        = ()       => apiCall("/chats");
export const getChatMessages = (chatId) => apiCall(`/chat/${chatId}/messages`);
export const sendMessage     = (body)   => apiCall("/messages", "POST", body);