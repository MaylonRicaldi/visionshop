// ============================================
// VISION SHOP — Firestore Module
// ============================================

import { db } from "./firebase-config.js";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  increment
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ============================================
// USUARIOS
// ============================================

/**
 * Guarda un nuevo usuario en la colección "users"
 * Se llama automáticamente al registrarse
 */
export async function saveUserToFirestore(user) {
  const userRef = doc(db, "users", user.uid);

  // No sobreescribe si ya existe
  const existing = await getDoc(userRef);
  if (existing.exists()) return;

  await setDoc(userRef, {
    uid:       user.uid,
    email:     user.email,
    createdAt: serverTimestamp(),
    role:      "customer",        // "customer" | "admin"
    orders:    [],
    active:    true
  });
}

/**
 * Obtiene los datos de un usuario por su UID
 */
export async function getUserData(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Actualiza campos del perfil del usuario
 */
export async function updateUserProfile(uid, data) {
  await updateDoc(doc(db, "users", uid), {
    ...data,
    updatedAt: serverTimestamp()
  });
}

// ============================================
// PRODUCTOS
// ============================================

/**
 * Obtiene todos los productos activos, ordenados por fecha
 */
export async function getActiveProducts() {
  const q = query(
    collection(db, "products"),
    where("active", "==", true),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Obtiene un producto por ID
 */
export async function getProductById(productId) {
  const snap = await getDoc(doc(db, "products", productId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Descuenta stock de múltiples productos al confirmar una orden
 */
export async function decrementStock(items) {
  const updates = items.map(item =>
    updateDoc(doc(db, "products", item.productId), {
      stock: increment(-item.qty)
    }).catch(err => console.warn(`Stock update failed for ${item.productId}:`, err))
  );
  await Promise.all(updates);
}

// ============================================
// ÓRDENES
// ============================================

/**
 * Estructura de una orden:
 * {
 *   userId, userEmail,
 *   status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled",
 *   items: [{ productId, name, price, qty, total }],
 *   shipping: { fullName, phone, address, city, region },
 *   payment: { method, opNumber },
 *   subtotal, shippingCost, total,
 *   createdAt, updatedAt
 * }
 */

/**
 * Crea una nueva orden en Firestore y descuenta el stock
 */
export async function createOrder({ user, cart, shipping, payment }) {
  const subtotal    = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shippingCost = subtotal >= 150 ? 0 : 10;
  const total       = subtotal + shippingCost;

  const items = cart.map(i => ({
    productId: i.id,
    name:      i.name,
    price:     i.price,
    qty:       i.qty,
    total:     i.price * i.qty
  }));

  const orderRef = await addDoc(collection(db, "orders"), {
    userId:       user.uid,
    userEmail:    user.email,
    status:       "pending",
    items,
    shipping,
    payment,
    subtotal,
    shippingCost,
    total,
    createdAt:    serverTimestamp(),
    updatedAt:    serverTimestamp()
  });

  // Descuenta stock
  await decrementStock(items);

  // Agrega el ID de la orden al perfil del usuario
  await updateDoc(doc(db, "users", user.uid), {
    orders: [...(await getUserOrderIds(user.uid)), orderRef.id]
  }).catch(() => {}); // No es crítico si falla

  return orderRef.id;
}

/**
 * Obtiene los IDs de órdenes de un usuario (helper interno)
 */
async function getUserOrderIds(uid) {
  const userData = await getUserData(uid);
  return userData?.orders || [];
}

/**
 * Obtiene todas las órdenes de un usuario
 */
export async function getUserOrders(uid) {
  const q = query(
    collection(db, "orders"),
    where("userId", "==", uid),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Obtiene una orden por ID
 */
export async function getOrderById(orderId) {
  const snap = await getDoc(doc(db, "orders", orderId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}