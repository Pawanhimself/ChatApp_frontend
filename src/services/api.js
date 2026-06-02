const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

// ✅ Token helpers
const getToken = () => localStorage.getItem('token');
export const setToken = (token) => localStorage.setItem('token', token);
export const removeToken = () => localStorage.removeItem('token');

// ✅ Timeout fetch
const fetchWithTimeout = (url, options = {}, ms = 8000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer));
};

const apiCall = async (endpoint, method = "GET", body = null) => {
  const token = getToken();

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      // ✅ Token hai toh Bearer header add karo
      ...(token && { "Authorization": `Bearer ${token}` }),
    },
  };

  if (body) options.body = JSON.stringify(body);

  let response;
  try {
    response = await fetchWithTimeout(`${BASE_URL}${endpoint}`, options);
  } catch (err) {
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

// Auth — token save/remove karo
export const registerUser = async (body) => {
  const res = await apiCall("/register", "POST", body);
  if (res?.token) setToken(res.token);
  return res;
};

export const loginUser = async (body) => {
  const res = await apiCall("/login", "POST", body);
  if (res?.token) setToken(res.token);
  return res;
};

export const logoutUser = async () => {
  await apiCall("/logout", "POST");
  removeToken();
  localStorage.removeItem('user');
};

export const getMe  = () => apiCall("/me");

// Users
export const getUsers = (search = "") =>
  apiCall(`/users${search ? `?search=${encodeURIComponent(search)}` : ""}`);

// Chats
export const createChat      = (body)   => apiCall("/chat",                   "POST", body);
export const getChats        = ()       => apiCall("/chats");
export const getChatMessages = (chatId) => apiCall(`/chat/${chatId}/messages`);
export const sendMessage     = (body)   => apiCall("/messages", "POST", body);