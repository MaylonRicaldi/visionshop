// ============================================
// VISION SHOP — Checkout Module
// Auth delegado a register.js
// ============================================

import { initRegisterModule, getCurrentUser } from "../register.js";
import { createOrder } from "../firebase/firestore.js";
import { getProductById } from "../firebase/firestore.js";

// ⚠️ CONFIGURACIÓN CULQI
// Reemplaza con tu Public Key de Culqi (https://culqi.com/panel/)
const CULQI_PUBLIC_KEY = "pk_test_i3rfE1AO7SnQkUdl";
// URL de tu Vercel API (después de hacer deploy)
const API_BASE = "https://visionshop-api.vercel.app/api"; // ✅ Vercel API activa

// ---- HELPERS ----
const getCart  = () => JSON.parse(localStorage.getItem("vs_cart") || "[]");
const clearCart = () => localStorage.removeItem("vs_cart");
const formatPrice = (n) => `S/ ${Number(n).toFixed(2)}`;

function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

function setLoading(btn, loading, label) {
  btn.disabled = loading;
  btn.innerHTML = loading
    ? '<span class="spinner"></span> PROCESANDO...'
    : label;
}

let isConfirming = false;

// ---- VISTAS ----
function showAuthGate() {
  document.getElementById("authGate").style.display = "flex";
  document.getElementById("checkoutContent").style.display = "none";
}

function showCheckout(user, userData) {
  document.getElementById("authGate").style.display = "none";
  document.getElementById("checkoutContent").style.display = "block";
  document.getElementById("userGreeting").textContent =
    `✓ Conectado como ${user.email}`;
  document.getElementById("userStatus").textContent =
    `👤 ${user.email}`;

  if (userData?.fullName) {
    const nameInput = document.getElementById("fullName");
    if (nameInput && !nameInput.value) nameInput.value = userData.fullName;
  }

  renderOrderSummary();
}

// ---- RESUMEN DEL PEDIDO ----
function renderOrderSummary() {
  const cart = getCart();
  const list = document.getElementById("orderItems");
  const subtotalEl = document.getElementById("orderSubtotal");
  const totalEl = document.getElementById("orderTotal");

  list.innerHTML = "";
  let subtotal = 0;

  cart.forEach(item => {
    const row = document.createElement("div");
    row.className = "order-item-row";
    const itemTotal = item.price * item.qty;
    subtotal += itemTotal;
    row.innerHTML = `
      <span class="order-item-name">${item.name}</span>
      <span class="order-item-qty">x${item.qty}</span>
      <span class="order-item-price">${formatPrice(itemTotal)}</span>
    `;
    list.appendChild(row);
  });

  if (!cart.length) {
    list.innerHTML = '<p style="font-size:0.8rem;color:var(--gray)">Tu carrito está vacío.</p>';
  }

  const FREE_SHIPPING = 150;
  const shippingCost = subtotal >= FREE_SHIPPING ? 0 : 10;
  subtotalEl.textContent = formatPrice(subtotal);
  document.querySelector(".shipping-cost").textContent =
    subtotal >= FREE_SHIPPING ? "Gratis" : formatPrice(10);
  document.querySelector(".shipping-note").style.display =
    subtotal >= FREE_SHIPPING ? "none" : "block";
  totalEl.textContent = formatPrice(subtotal + shippingCost);
}

function getTotal() {
  const cart = getCart();
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  return subtotal >= 150 ? subtotal : subtotal + 10;
}

// ---- MÉTODO DE PAGO ----
function initPaymentToggle() {
  const yapeBlock = document.getElementById("yapeBlock");
  document.querySelectorAll('input[name="payment"]').forEach(radio => {
    radio.addEventListener("change", () => {
      if (yapeBlock) yapeBlock.style.display = radio.value === "yape" ? "block" : "none";
    });
  });
}

// ---- REVALIDAR STOCK ANTES DE CONFIRMAR ----
async function validateStock(cart) {
  for (const item of cart) {
    const fresh = await getProductById(item.id);
    if (!fresh) return { valid: false, msg: `"${item.name}" ya no está disponible.` };
    if (fresh.stock < item.qty) {
      return {
        valid: false,
        msg: `"${item.name}" solo tiene ${fresh.stock} unidades disponibles. Actualiza tu carrito.`
      };
    }
  }
  return { valid: true };
}

// ---- CULQI CHECKOUT ----
function initCulqi() {
  if (typeof CulqiCheckout === "undefined") {
    console.warn("Culqi JS no cargado. Verifica el script en checkout.html");
    return;
  }

  const culqiCheckout = new CulqiCheckout({
    publicKey: CULQI_PUBLIC_KEY,
    settings: {
      title: "VISION SHOP",
      currency: "PEN",
      description: "Pedido VISION SHOP",
      amount: 0,  // se setea al abrir
    },
    charge: async (token) => {
      // Culqi llamará esta función cuando tenga un token exitoso
      await processCulqiCharge(token);
    }
  });

  return culqiCheckout;
}

let culqiInstance = null;

async function processCulqiCharge(token) {
  const user = getCurrentUser();
  const cart = getCart();
  const total = getTotal();

  const btn = document.getElementById("btnConfirm");
  setLoading(btn, true, "PROCESANDO PAGO...");

  try {
    const resp = await fetch(`${API_BASE}/charge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: token.id,
        amount: total,
        email: user.email,
        description: `VISION SHOP — ${cart.length} producto(s)`
      })
    });

    const result = await resp.json();

    if (!resp.ok || !result.success) {
      showToast(result.message || "Error al procesar el pago con tarjeta.");
      setLoading(btn, false, "CONFIRMAR PEDIDO");
      isConfirming = false;
      return;
    }

    // Pago exitoso → crear orden en Firestore
    const fullName = document.getElementById("fullName")?.value.trim();
    const phone    = document.getElementById("phone")?.value.trim();
    const address  = document.getElementById("address")?.value.trim();
    const city     = document.getElementById("city")?.value.trim();
    const region   = document.getElementById("region")?.value.trim();

    const orderId = await createOrder({
      user,
      cart,
      shipping: { fullName, phone, address, city, region },
      payment:  { method: "culqi", chargeId: result.chargeId }
    });

    clearCart();
    document.getElementById("successOrderId").textContent =
      `Pedido #${orderId.substring(0, 8).toUpperCase()}`;
    document.getElementById("successModal").style.display = "flex";

  } catch (err) {
    console.error("Error en pago Culqi:", err);
    showToast("Error al procesar el pago. Intenta de nuevo.");
    isConfirming = false;
    setLoading(btn, false, "CONFIRMAR PEDIDO");
  }
}

function openCulqiCheckout() {
  if (!culqiInstance) culqiInstance = initCulqi();
  if (!culqiInstance) { showToast("Error al cargar Culqi. Recarga la página."); return; }

  const total = getTotal();
  culqiInstance.settings.amount = Math.round(total * 100);
  culqiInstance.open();
}

// ---- CONFIRMAR PEDIDO ----
document.getElementById("btnConfirm")?.addEventListener("click", async () => {
  if (isConfirming) return;

  const cart = getCart();
  if (!cart.length) { showToast("Tu carrito está vacío."); return; }

  const user = getCurrentUser();
  if (!user) { showToast("Sesión expirada. Inicia sesión de nuevo."); showAuthGate(); return; }

  const fullName = document.getElementById("fullName")?.value.trim();
  const phone    = document.getElementById("phone")?.value.trim();
  const address  = document.getElementById("address")?.value.trim();
  const city     = document.getElementById("city")?.value.trim();
  const region   = document.getElementById("region")?.value.trim();

  if (!fullName || !phone || !address || !city) {
    showToast("Completa todos los datos de envío.");
    return;
  }

  const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;

  // Pago con Culqi → abre checkout de Culqi antes de procesar
  if (paymentMethod === "culqi") {
    isConfirming = true;
    const stockCheck = await validateStock(cart);
    if (!stockCheck.valid) {
      showToast(stockCheck.msg);
      isConfirming = false;
      return;
    }
    openCulqiCheckout();
    return;
  }

  const opNumber = paymentMethod === "yape"
    ? document.getElementById("opNumber")?.value.trim()
    : null;

  if (paymentMethod === "yape" && !opNumber) {
    showToast("Ingresa el número de operación Yape.");
    return;
  }

  const btn = document.getElementById("btnConfirm");
  isConfirming = true;
  setLoading(btn, true, "CONFIRMAR PEDIDO");

  const stockCheck = await validateStock(cart);
  if (!stockCheck.valid) {
    showToast(stockCheck.msg);
    isConfirming = false;
    setLoading(btn, false, "CONFIRMAR PEDIDO");
    return;
  }

  try {
    const orderId = await createOrder({
      user,
      cart,
      shipping: { fullName, phone, address, city, region },
      payment:  { method: paymentMethod, opNumber: opNumber || null }
    });

    clearCart();
    document.getElementById("successOrderId").textContent =
      `Pedido #${orderId.substring(0, 8).toUpperCase()}`;
    document.getElementById("successModal").style.display = "flex";

  } catch (err) {
    console.error("Error al confirmar pedido:", err);
    showToast("Error al procesar el pedido. Intenta de nuevo.");
  } finally {
    isConfirming = false;
    setLoading(btn, false, "CONFIRMAR PEDIDO");
  }
});

// ---- INIT ----
document.addEventListener("DOMContentLoaded", () => {
  initPaymentToggle();

  initRegisterModule({
    onLogin:  (user, userData) => showCheckout(user, userData),
    onLogout: ()               => showAuthGate()
  });
});
