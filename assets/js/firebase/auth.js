// ============================================
// VISION SHOP — Auth Module
// ============================================

import { auth } from "./firebase-config.js";
import { saveUserToFirestore } from "./firestore.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ---- REGISTRO ----
export async function registerUser(email, password) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Guarda en la colección users de Firestore
  await saveUserToFirestore(user);

  return user;
}

// ---- LOGIN ----
export async function loginUser(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

// ---- LOGOUT ----
export async function logoutUser() {
  await signOut(auth);
}

// ---- RECUPERAR CONTRASEÑA ----
export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

// ---- ESTADO DEL USUARIO (listener) ----
// Llama al callback con el usuario actual (o null si no está logueado)
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// ---- USUARIO ACTUAL ----
export function getCurrentUser() {
  return auth.currentUser;
}

// ---- MENSAJES DE ERROR LEGIBLES ----
export function getAuthErrorMessage(code) {
  const messages = {
    "auth/user-not-found":       "No existe una cuenta con este correo.",
    "auth/wrong-password":       "Contraseña incorrecta.",
    "auth/invalid-email":        "El formato del correo no es válido.",
    "auth/email-already-in-use": "Este correo ya está registrado.",
    "auth/weak-password":        "La contraseña debe tener al menos 6 caracteres.",
    "auth/too-many-requests":    "Demasiados intentos fallidos. Intenta más tarde.",
    "auth/invalid-credential":   "Correo o contraseña incorrectos.",
    "auth/network-request-failed": "Error de red. Verifica tu conexión."
  };
  return messages[code] || "Ocurrió un error inesperado. Intenta de nuevo.";
}