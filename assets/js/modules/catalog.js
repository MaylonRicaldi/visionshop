// ============================================
// VISION SHOP — Catalog Module
// ============================================

import { db } from "../firebase/firebase-config.js";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ---- CART UTILS ----
const getCart = () => JSON.parse(localStorage.getItem("vs_cart") || "[]");
const saveCart = (cart) => {
  localStorage.setItem("vs_cart", JSON.stringify(cart));
  updateCartCount();
};

function updateCartCount() {
  const cart = getCart();
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  document.querySelectorAll("#cartCount").forEach(el => el.textContent = total);
}

// ---- TOAST ----
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2800);
}

// ---- ADD TO CART ----
function addToCart(product, qty = 1) {
  if (product.stock < 1) {
    showToast("Producto sin stock");
    return;
  }
  const cart = getCart();
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.qty = Math.min(existing.qty + qty, product.stock);
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl,
      stock: product.stock,
      qty
    });
  }
  saveCart(cart);
  showToast(`✓ ${product.name} agregado al carrito`);
}

// ---- RENDER PRODUCTS ----
let allProducts = [];
let currentFilter = "all";

function renderProducts(products) {
  const grid = document.getElementById("productGrid");
  const empty = document.getElementById("emptyState");
  const searchInput = document.getElementById("searchInput");

  grid.innerHTML = "";

  if (!products.length) {
    const searchInput = document.getElementById("searchInput");
    const emptySearch = document.getElementById("emptySearch");
    if (searchInput && searchInput.value.trim() && emptySearch) {
      empty.style.display = "none";
      emptySearch.style.display = "block";
    } else {
      empty.style.display = "block";
      if (emptySearch) emptySearch.style.display = "none";
    }
    return;
  }

  empty.style.display = "none";
  const emptySearch = document.getElementById("emptySearch");
  if (emptySearch) emptySearch.style.display = "none";

  // Update search result count if search is active
  if (searchInput && searchInput.value.trim()) {
    const header = document.querySelector(".catalog-header h2");
    if (header) header.textContent = `RESULTADOS (${products.length})`;
  } else {
    const header = document.querySelector(".catalog-header h2");
    if (header) header.textContent = "CATÁLOGO";
  }

  products.forEach((p, i) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.style.animationDelay = `${i * 0.06}s`;

    const isNew = p.createdAt && (Date.now() - p.createdAt.toMillis() < 7 * 24 * 3600 * 1000);
    const outOfStock = p.stock < 1;

    card.innerHTML = `
      <div class="product-img-wrap">
        <img
          src="${p.imageUrl}"
          alt="${p.name}"
          loading="lazy"
          onerror="this.src='https://placehold.co/400x530?text=Sin+Imagen'"
        />
        
        ${outOfStock
          ? '<span class="product-badge out-stock">AGOTADO</span>'
          : isNew
          ? '<span class="product-badge">NUEVO</span>'
          : ''}
        ${!outOfStock
          ? `<button class="quick-add" data-id="${p.id}">+ AGREGAR</button>`
          : ''}
      </div>
      <div class="product-info">
        <p class="product-category">${p.category || ''} ${p.style ? '· ' + p.style : ''}</p>
        <h3 class="product-name">${p.name}</h3>
        <p class="product-price">S/ ${Number(p.price).toFixed(2)}</p>
        <p class="product-stock-label">${outOfStock ? 'Sin stock' : `${p.stock} disponibles`}</p>
      </div>
    `;

    // Quick add
    const quickBtn = card.querySelector(".quick-add");
    if (quickBtn) {
      quickBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        addToCart(p);
      });
    }

    // Open modal
    card.addEventListener("click", () => openModal(p));

    grid.appendChild(card);
  });
}

// ---- FILTER & SORT ----
function applyFilterSort() {
  let filtered = currentFilter === "all"
    ? [...allProducts]
    : allProducts.filter(p =>
        (p.category || "").toLowerCase() === currentFilter.toLowerCase()
      );

  const sort = document.getElementById("sortSelect").value;
  if (sort === "price-asc") filtered.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") filtered.sort((a, b) => b.price - a.price);
  else if (sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));

  renderProducts(filtered);
}

// ---- SEARCH ----
function initSearch() {
  const input = document.getElementById("searchInput");
  if (!input) return;
  input.addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase().trim();
    if (!term) { applyFilterSort(); return; }
    const filtered = allProducts.filter(p =>
      p.name.toLowerCase().includes(term) ||
      (p.category || "").toLowerCase().includes(term) ||
      (p.style || "").toLowerCase().includes(term) ||
      (p.description || "").toLowerCase().includes(term)
    );
    renderProducts(filtered);
  });
}

// ---- LOAD FROM FIRESTORE ----
async function loadProducts() {
  try {
    const q = query(
      collection(db, "products"),
      where("active", "==", true),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    allProducts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    applyFilterSort();
  } catch (err) {
    console.error("Error cargando productos:", err);
    document.getElementById("productGrid").innerHTML = `
      <p style="color:var(--red);grid-column:1/-1;padding:2rem;">
        Error al cargar productos. Verifica tu configuración de Firebase.
      </p>`;
  }
}

// ---- MODAL ----
let currentProduct = null;
let currentQty = 1;

function openModal(p) {
  currentProduct = p;
  currentQty = 1;

  document.getElementById("modalImg").src = p.imageUrl || "";
  document.getElementById("modalImg").onerror = function() {
    this.src = "https://placehold.co/400x530/e8e4df/6b6b6b?text=VISION";
  };
  document.getElementById("modalCategory").textContent = `${p.category || ""} ${p.style ? "· " + p.style : ""}`;
  document.getElementById("modalName").textContent = p.name;
  document.getElementById("modalDesc").textContent = p.description || "";
  document.getElementById("modalPrice").textContent = `S/ ${Number(p.price).toFixed(2)}`;
  document.getElementById("modalStock").textContent = p.stock < 1 ? "Sin stock" : `${p.stock} unidades disponibles`;
  document.getElementById("qtyValue").textContent = 1;

  const addBtn = document.getElementById("addToCartModal");
  addBtn.disabled = p.stock < 1;
  addBtn.textContent = p.stock < 1 ? "SIN STOCK" : "AGREGAR AL CARRITO";

  document.getElementById("productModal").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.getElementById("productModal").classList.remove("open");
  document.body.style.overflow = "";
}

// ---- INIT ----
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  loadProducts();

  // Filter buttons
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      applyFilterSort();
    });
  });

  // Sort
  document.getElementById("sortSelect").addEventListener("change", applyFilterSort);

  // Search
  initSearch();

  // Modal close
  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("productModal").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeModal();
  });

  // Qty controls
  document.getElementById("qtyMinus").addEventListener("click", () => {
    if (currentQty > 1) {
      currentQty--;
      document.getElementById("qtyValue").textContent = currentQty;
    }
  });

  document.getElementById("qtyPlus").addEventListener("click", () => {
    if (currentProduct && currentQty < currentProduct.stock) {
      currentQty++;
      document.getElementById("qtyValue").textContent = currentQty;
    }
  });

  // Add to cart from modal
  document.getElementById("addToCartModal").addEventListener("click", () => {
    if (currentProduct) {
      addToCart(currentProduct, currentQty);
      closeModal();
    }
  });
});