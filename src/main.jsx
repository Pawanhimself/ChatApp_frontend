// ==============================================================
// main.jsx — Yeh React app ka entry point hai
// HTML mein <body> ke andar sab kuch jata tha
// React mein yeh file <div id="root"> mein poora app inject karti hai
// ==============================================================

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'   // Global CSS import
import App from './App.jsx'

// document.getElementById("root") — index.html mein ek <div id="root"> hota hai
// createRoot us div ko React ka "control room" bana deta hai
// render(App) matlab: App component ko wahan inject karo
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* StrictMode = development mein extra warnings dikhata hai, production mein kuch nahi karta */}
    <App />
  </StrictMode>,
)