// ============================================
// VISION SHOP — Checkout Module
// ============================================

import { initRegisterModule, getCurrentUser } from "../register.js";
import { createOrder } from "../firebase/firestore.js";
import { getProductById } from "../firebase/firestore.js";

const CULQI_PUBLIC_KEY = "pk_test_i3rfE1AO7SnQkUdl";
const API_BASE = "https://visionshop-api.vercel.app/api";

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

// ---- REVALIDAR STOCK ----
async function validateStock(cart) {
  for (const item of cart) {
    const fresh = await getProductById(item.id);
    if (!fresh) return { valid: false, msg: `"${item.name}" ya no está disponible.` };
    if (fresh.stock < item.qty) {
      return {
        valid: false,
        msg: `"${item.name}" solo tiene ${fresh.stock} unidades disponibles.`
      };
    }
  }
  return { valid: true };
}

// ---- CULQI JS v4 ----
function cargarCulqi() {
  if (typeof window.Culqi !== "undefined") return Promise.resolve();

  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.culqi.com/js/v4";
    s.onload = () => {
      const check = () => {
        if (typeof window.Culqi !== "undefined") return resolve();
        setTimeout(check, 50);
      };
      check();
    };
    s.onerror = () => reject(new Error("No se pudo cargar Culqi"));
    document.head.appendChild(s);
  });
}

async function abrirCulqi() {
  try {
    await cargarCulqi();
  } catch {
    showToast("Error al cargar la pasarela de pago.");
    isConfirming = false;
    return;
  }

  const total = getTotal();

  Culqi.publicKey = CULQI_PUBLIC_KEY;
  Culqi.settings({
    title: "VISION SHOP",
    currency: "PEN",
    description: "Pedido - VISION SHOP",
    amount: Math.round(total * 100),
  });

  window.culqi = function () {
    if (Culqi.token) {
      procesarPagoCulqi(Culqi.token);
    } else if (Culqi.error) {
      showToast(Culqi.error.userMessage || "Error al procesar el pago.");
      isConfirming = false;
    }
  };

  isConfirming = false;
  Culqi.open();
}

async function procesarPagoCulqi(token) {
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

// ---- CONFIRMAR PEDIDO ----
document.getElementById("btnConfirm")?.addEventListener("click", async () => {
  if (isConfirming) return;
  isConfirming = true;

  try {
    showToast("Verificando datos...");

    const cart = getCart();
    if (!cart.length) { showToast("Tu carrito está vacío."); isConfirming = false; return; }

    const user = getCurrentUser();
    if (!user) { showToast("Sesión expirada. Inicia sesión de nuevo."); showAuthGate(); isConfirming = false; return; }

    const fullName = document.getElementById("fullName")?.value.trim();
    const phone    = document.getElementById("phone")?.value.trim();
    const address  = document.getElementById("address")?.value.trim();
    const city     = document.getElementById("city")?.value.trim();
    const region   = document.getElementById("region")?.value.trim();

    if (!fullName || !phone || !address || !city) {
      showToast("Completa todos los datos de envío.");
      isConfirming = false;
      return;
    }

    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;

    if (paymentMethod === "culqi") {
      const stockCheck = await validateStock(cart);
      if (!stockCheck.valid) {
        showToast(stockCheck.msg);
        isConfirming = false;
        return;
      }
      await abrirCulqi();
      return;
    }

    const opNumber = paymentMethod === "yape"
      ? document.getElementById("opNumber")?.value.trim()
      : null;

    if (paymentMethod === "yape" && !opNumber) {
      showToast("Ingresa el número de operación Yape.");
      isConfirming = false;
      return;
    }

    const btn = document.getElementById("btnConfirm");
    setLoading(btn, true, "CONFIRMAR PEDIDO");

    const stockCheck = await validateStock(cart);
    if (!stockCheck.valid) {
      showToast(stockCheck.msg);
      isConfirming = false;
      setLoading(btn, false, "CONFIRMAR PEDIDO");
      return;
    }

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
    console.error("Error:", err);
    showToast("Ocurrió un error. Revisa la consola (F12).");
  } finally {
    if (document.querySelector('input[name="payment"]:checked')?.value !== "culqi") {
      isConfirming = false;
      const btn = document.getElementById("btnConfirm");
      if (btn) setLoading(btn, false, "CONFIRMAR PEDIDO");
    }
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
