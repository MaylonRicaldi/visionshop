// ============================================
// VISION SHOP — Cart Module
// ============================================

const getCart = () => JSON.parse(localStorage.getItem("vs_cart") || "[]");
const saveCart = (cart) => {
  localStorage.setItem("vs_cart", JSON.stringify(cart));
  renderCart();
};

function updateCartCount() {
  const cart = getCart();
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  document.querySelectorAll("#cartCount").forEach(el => el.textContent = total);
}

function formatPrice(n) {
  return `S/ ${Number(n).toFixed(2)}`;
}

function calcSubtotal(cart) {
  return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}

function renderCart() {
  const cart = getCart();
  const container = document.getElementById("cartItems");
  const emptyDiv = document.getElementById("emptyCart");
  const cartLayout = document.querySelector(".cart-layout");
  const subtotalEl = document.getElementById("subtotal");
  const totalEl = document.getElementById("totalPrice");
  const checkoutBtn = document.getElementById("checkoutBtn");

  updateCartCount();

  if (!cart.length) {
    cartLayout && (cartLayout.style.display = "none");
    emptyDiv && (emptyDiv.style.display = "block");
    return;
  }

  cartLayout && (cartLayout.style.display = "grid");
  emptyDiv && (emptyDiv.style.display = "none");

  container.innerHTML = "";

  cart.forEach((item) => {
    const el = document.createElement("div");
    el.className = "cart-item";
    el.innerHTML = `
      <img
        class="cart-item-img"
        src="${item.imageUrl || ''}"
        alt="${item.name}"
        onerror="this.src='https://placehold.co/100x130/e8e4df/6b6b6b?text=VS'"
      />
      <div class="cart-item-info">
        <p class="cart-item-category">${item.category || ''}</p>
        <h3 class="cart-item-name">${item.name}</h3>
        <p class="cart-item-price">${formatPrice(item.price)} c/u</p>
        <div class="cart-item-qty">
          <button class="btn-qty-minus" data-id="${item.id}">−</button>
          <span>${item.qty}</span>
          <button class="btn-qty-plus" data-id="${item.id}">+</button>
        </div>
      </div>
      <div class="cart-item-actions">
        <span class="cart-item-total">${formatPrice(item.price * item.qty)}</span>
        <button class="btn-remove" data-id="${item.id}">Eliminar</button>
      </div>
    `;
    container.appendChild(el);
  });

  const subtotal = calcSubtotal(cart);
  const FREE_SHIPPING = 150;
  subtotalEl.textContent = formatPrice(subtotal);
  document.getElementById("shipping").textContent = subtotal >= FREE_SHIPPING ? "Gratis" : formatPrice(10);
  totalEl.textContent = formatPrice(subtotal >= FREE_SHIPPING ? subtotal : subtotal + 10);

  // Events
  container.querySelectorAll(".btn-qty-minus").forEach(btn => {
    btn.addEventListener("click", () => {
      const cart = getCart();
      const item = cart.find(i => i.id === btn.dataset.id);
      if (!item) return;
      if (item.qty > 1) item.qty--;
      else {
        const el = btn.closest(".cart-item");
        if (el) el.classList.add("removing");
        setTimeout(() => {
          cart.splice(cart.indexOf(item), 1);
          saveCart(cart);
        }, 250);
        return;
      }
      saveCart(cart);
    });
  });

  container.querySelectorAll(".btn-qty-plus").forEach(btn => {
    btn.addEventListener("click", () => {
      const cart = getCart();
      const item = cart.find(i => i.id === btn.dataset.id);
      if (!item) return;
      if (item.qty < item.stock) item.qty++;
      saveCart(cart);
    });
  });

  container.querySelectorAll(".btn-remove").forEach(btn => {
    btn.addEventListener("click", () => {
      const cart = getCart();
      const item = cart.find(i => i.id === btn.dataset.id);
      if (!item) return;
      const el = btn.closest(".cart-item");
      if (el) el.classList.add("removing");
      setTimeout(() => {
        const idx = cart.findIndex(i => i.id === btn.dataset.id);
        if (idx !== -1) cart.splice(idx, 1);
        saveCart(cart);
      }, 250);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderCart();
});