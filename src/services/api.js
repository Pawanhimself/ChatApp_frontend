const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
const APP_URL  = import.meta.env.VITE_APP_URL  ?? "http://localhost:8000";

export const initCsrf = async () => {
  await fetch(`${APP_URL}/sanctum/csrf-cookie`, {
    method: "GET",
    credentials: "include",
  });
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
    response = await fetch(`${BASE_URL}${endpoint}`, options);
  } catch {
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

// ✅ Users — search optional hai
export const getUsers = (search = "") =>
  apiCall(`/users${search ? `?search=${encodeURIComponent(search)}` : ""}`);

// Chats
export const createChat      = (body)   => apiCall("/chat",                   "POST", body);
export const getChats        = ()       => apiCall("/chats");
export const getChatMessages = (chatId) => apiCall(`/chat/${chatId}/messages`);
export const sendMessage     = (body)   => apiCall("/messages", "POST", body);