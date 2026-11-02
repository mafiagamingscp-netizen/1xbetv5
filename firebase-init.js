import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
const app = getApps().length ? getApp() : initializeApp(window.FIREBASE_CONFIG);
window.X4Firebase = { app, auth: getAuth(app), db: getDatabase(app) };
window.dispatchEvent(new Event("x4-firebase-ready"));
