// ============================================
// VISION SHOP — Shared UI Behaviors
// ============================================

document.addEventListener("DOMContentLoaded", () => {

  // ---- HAMBURGER MENU ----
  const hamburger = document.getElementById("hamburger");
  const mainNav = document.getElementById("mainNav");
  if (hamburger && mainNav) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("open");
      mainNav.classList.toggle("open");
    });
    // Cerrar al hacer click en un link
    mainNav.querySelectorAll(".filter-btn, .nav-link").forEach(btn => {
      btn.addEventListener("click", () => {
        hamburger.classList.remove("open");
        mainNav.classList.remove("open");
      });
    });
  }

  // ---- SEARCH TOGGLE ----
  const searchToggle = document.getElementById("searchToggle");
  const searchInput = document.getElementById("searchInput");
  if (searchToggle && searchInput) {
    searchToggle.addEventListener("click", () => {
      searchInput.classList.toggle("expanded");
      if (searchInput.classList.contains("expanded")) {
        searchInput.focus();
      }
    });
    searchInput.addEventListener("blur", () => {
      if (!searchInput.value) {
        searchInput.classList.remove("expanded");
      }
    });
  }

  // ---- SCROLL TO TOP ----
  const scrollBtn = document.getElementById("scrollTop");
  if (scrollBtn) {
    window.addEventListener("scroll", () => {
      scrollBtn.classList.toggle("show", window.scrollY > 400);
    });
    scrollBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

});
