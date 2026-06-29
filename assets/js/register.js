// ============================================
// VISION SHOP — register.js
// Módulo de autenticación standalone
// Maneja login, registro y recuperación desde
// cualquier página que tenga el auth gate
// ============================================

import {
  loginUser,
  registerUser,
  logoutUser,
  resetPassword,
  onAuthChange,
  getAuthErrorMessage
} from "./firebase/auth.js";

import { saveUserToFirestore, getUserData } from "./firebase/firestore.js";

// ============================================
// ESTADO
// ============================================
let currentUser = null;
let initialized = false;

// ============================================
// HELPERS UI
// ============================================
function $(id) { return document.getElementById(id); }

function showToast(msg, type = "default") {
  const toast = $("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `toast show ${type}`;
  setTimeout(() => toast.classList.remove("show"), 3000);
}

function setLoading(btn, loading, label) {
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? "Cargando..." : label;
}

function setError(elId, msg) {
  const el = $(elId);
  if (el) el.textContent = msg;
}

function clearErrors() {
  ["loginError", "regError"].forEach(id => setError(id, ""));
}

// ============================================
// TABS LOGIN / REGISTRO
// ============================================
function initTabs() {
  document.querySelectorAll(".auth-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".auth-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      clearErrors();
      const target = tab.dataset.tab;
      $("loginForm")?.classList.toggle("hidden", target !== "login");
      $("registerForm")?.classList.toggle("hidden", target !== "register");
    });
  });
}

// ============================================
// TOGGLE CONTRASEÑA
// ============================================
function initPasswordToggles() {
  document.querySelectorAll(".toggle-pass").forEach(btn => {
    btn.addEventListener("click", () => {
      const input = $(btn.dataset.target);
      if (!input) return;
      input.type = input.type === "password" ? "text" : "password";
      btn.innerHTML = input.type === "password"
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
    });
  });
}

// ============================================
// LOGIN
// ============================================
function initLogin() {
  $("btnLogin")?.addEventListener("click", handleLogin);

  // Enter en campos dispara login
  [$("loginEmail"), $("loginPass")].forEach(input => {
    input?.addEventListener("keydown", e => {
      if (e.key === "Enter") handleLogin();
    });
  });
}

async function handleLogin() {
  const email = $("loginEmail")?.value.trim();
  const pass  = $("loginPass")?.value;
  setError("loginError", "");

  if (!email || !pass) {
    setError("loginError", "Completa todos los campos.");
    return;
  }

  const btn = $("btnLogin");
  setLoading(btn, true, "INGRESAR");

  try {
    await loginUser(email, pass);
    // onAuthChange se encarga de mostrar el contenido protegido
  } catch (err) {
    setError("loginError", getAuthErrorMessage(err.code));
  } finally {
    setLoading(btn, false, "INGRESAR");
  }
}

// ============================================
// REGISTRO
// ============================================
function initRegister() {
  $("btnRegister")?.addEventListener("click", handleRegister);

  [$("regEmail"), $("regPass"), $("regPassConfirm")].forEach(input => {
    input?.addEventListener("keydown", e => {
      if (e.key === "Enter") handleRegister();
    });
  });
}

async function handleRegister() {
  const email       = $("regEmail")?.value.trim();
  const pass        = $("regPass")?.value;
  const passConfirm = $("regPassConfirm")?.value;
  setError("regError", "");

  // Validaciones
  if (!email || !pass || !passConfirm) {
    setError("regError", "Completa todos los campos.");
    return;
  }
  if (!isValidEmail(email)) {
    setError("regError", "Ingresa un correo válido.");
    return;
  }
  if (pass.length < 6) {
    setError("regError", "La contraseña debe tener al menos 6 caracteres.");
    return;
  }
  if (pass !== passConfirm) {
    setError("regError", "Las contraseñas no coinciden.");
    return;
  }

  const btn = $("btnRegister");
  setLoading(btn, true, "CREAR CUENTA");

  try {
    // 1. Crea el usuario en Firebase Auth
    const user = await registerUser(email, pass);

    // 2. Guarda en colección "users" de Firestore
    await saveUserToFirestore(user);

    showToast("✓ Cuenta creada. ¡Bienvenido a VISION SHOP!");

    // 3. onAuthChange detecta el login automático y muestra el contenido
  } catch (err) {
    setError("regError", getAuthErrorMessage(err.code));
  } finally {
    setLoading(btn, false, "CREAR CUENTA");
  }
}

// ============================================
// RECUPERAR CONTRASEÑA
// ============================================
function initForgotPassword() {
  $("forgotLink")?.addEventListener("click", async (e) => {
    e.preventDefault();
    const email = $("loginEmail")?.value.trim();

    if (!email) {
      setError("loginError", "Ingresa tu correo primero.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("loginError", "Ingresa un correo válido.");
      return;
    }

    try {
      await resetPassword(email);
      showToast("✉ Correo de recuperación enviado. Revisa tu bandeja.");
    } catch (err) {
      setError("loginError", getAuthErrorMessage(err.code));
    }
  });
}

// ============================================
// LOGOUT
// ============================================
function initLogout() {
  $("btnLogout")?.addEventListener("click", async () => {
    await logoutUser();
    currentUser = null;
    showToast("Sesión cerrada correctamente.");
  });
}

// ============================================
// ESTADO DE AUTH — listener global
// ============================================
export function initAuthListener(callbacks = {}) {
  onAuthChange(async (user) => {
    currentUser = user;

    if (user) {
      // Obtiene datos extendidos del usuario desde Firestore
      let userData = null;
      try {
        userData = await getUserData(user.uid);
      } catch {
        // Si falla, usa solo los datos de Auth
      }

      callbacks.onLogin?.(user, userData);
    } else {
      callbacks.onLogout?.();
    }
  });
}

// ============================================
// UTILIDADES EXPORTADAS
// ============================================
export function getCurrentUser() {
  return currentUser;
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ============================================
// INIT — llama esto desde cualquier página
// que tenga el auth gate
// ============================================
export function initRegisterModule(callbacks = {}) {
  if (initialized) return;
  initialized = true;
  initTabs();
  initPasswordToggles();
  initLogin();
  initRegister();
  initForgotPassword();
  initLogout();
  initAuthListener(callbacks);
}