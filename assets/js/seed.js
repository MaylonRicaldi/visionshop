// ============================================
// VISION SHOP — Seed Products
// Ejecutar UNA SOLA VEZ en la consola del
// navegador estando en index.html
// ============================================
// Cómo usar:
// 1. Abre index.html en el navegador
// 2. Abre la consola (F12)
// 3. Copia y pega TODO este archivo
// 4. Escribe: await seedProducts()
// ============================================

import { db } from "./firebase/firebase-config.js";
import {
  addDoc,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const PRODUCTS = [
  // ========== HOMBRE (12 productos) ==========
  {
    name: "Polo Oversize Negro",
    category: "hombre",
    price: 59.90,
    stock: 30,
    imageUrl: "https://placehold.co/600x800/0a0a0a/c8a97e?text=Polo+Negro",
    description: "Polo de algodón orgánico con corte oversize. Costuras reforzadas y cuello rib. Ideal para looks urbanos.",
    style: "Casual",
    active: true
  },
  {
    name: "Camisa Blanca Premium",
    category: "hombre",
    price: 89.90,
    stock: 20,
    imageUrl: "https://placehold.co/600x800/f5f2ee/0a0a0a?text=Camisa+Blanca",
    description: "Camisa de vestir en algodón egipcio. Corte slim fit con botones de nácar.",
    style: "Formal",
    active: true
  },
  {
    name: "Chaqueta Jean Clásica",
    category: "hombre",
    price: 149.90,
    stock: 15,
    imageUrl: "https://placehold.co/600x800/4a6fa5/ffffff?text=Jean+Jacket",
    description: "Chaqueta denim lavada. Cierre metálico, bolsillos laterales y ajuste en cintura.",
    style: "Casual",
    active: true
  },
  {
    name: "Pantalón Chino Beige",
    category: "hombre",
    price: 99.90,
    stock: 25,
    imageUrl: "https://placehold.co/600x800/d4c5a9/0a0a0a?text=Chino+Beige",
    description: "Pantalón chino de tela stretch. Corte recto con cierre de botón y cremallera.",
    style: "Casual",
    active: true
  },
  {
    name: "Blazer Azul Marino",
    category: "hombre",
    price: 229.90,
    stock: 10,
    imageUrl: "https://placehold.co/600x800/1a2a3a/ffffff?text=Blazer+Marino",
    description: "Blazer de lana peinada. Forro interior, solapa en pico y dos botones.",
    style: "Formal",
    active: true
  },
  {
    name: "Short Deportivo Tech",
    category: "hombre",
    price: 69.90,
    stock: 35,
    imageUrl: "https://placehold.co/600x800/2d2d2d/c8a97e?text=Short+Tech",
    description: "Short con tejido transpirable de secado rápido. Bolsillo interno y cintura elástica.",
    style: "Deportivo",
    active: true
  },
  {
    name: "Sweater Cuello V Lanar",
    category: "hombre",
    price: 129.90,
    stock: 18,
    imageUrl: "https://placehold.co/600x800/6b4226/f5f2ee?text=Sweater+Lana",
    description: "Sweater de lana merino. Cuello V con ribetes contraste.",
    style: "Casual",
    active: true
  },
  {
    name: "Cargo Pantalón Verde Oliva",
    category: "hombre",
    price: 109.90,
    stock: 22,
    imageUrl: "https://placehold.co/600x800/4a5d23/f5f2ee?text=Cargo+Oliva",
    description: "Pantalón cargo con múltiples bolsillos. Corte regular y tela resistente.",
    style: "Urbano",
    active: true
  },
  {
    name: "Parka Invernal Negra",
    category: "hombre",
    price: 259.90,
    stock: 8,
    imageUrl: "https://placehold.co/600x800/0a0a0a/ffffff?text=Parka+Negra",
    description: "Parka acolchada con capucha desmontable. Resistente al agua y al viento.",
    style: "Invierno",
    active: true
  },
  {
    name: "Camiseta Estampada Urban",
    category: "hombre",
    price: 49.90,
    stock: 40,
    imageUrl: "https://placehold.co/600x800/ffffff/0a0a0a?text=Urban+Tee",
    description: "Camiseta de algodón peinado con estampado serigráfico exclusivo.",
    style: "Urbano",
    active: true
  },
  {
    name: "Jeans Rectos Raw Denim",
    category: "hombre",
    price: 139.90,
    stock: 12,
    imageUrl: "https://placehold.co/600x800/1a2a4a/ffffff?text=Raw+Denim",
    description: "Jeans de denim crudo japonés. Corte recto, costura contrastante y bragueta con botones.",
    style: "Casual",
    active: true
  },
  {
    name: "Chaleco Táctico Multi-bolsillos",
    category: "hombre",
    price: 119.90,
    stock: 14,
    imageUrl: "https://placehold.co/600x800/3a3a3a/c8a97e?text=Chaleco+Tactico",
    description: "Chaleco ligero con 8 bolsillos funcionales. Ideal para viajes y fotografía.",
    style: "Funcional",
    active: true
  },

  // ========== MUJER (12 productos) ==========
  {
    name: "Vestido Midi Floral",
    category: "mujer",
    price: 129.90,
    stock: 20,
    imageUrl: "https://placehold.co/600x800/d4a574/ffffff?text=Vestido+Floral",
    description: "Vestido midi con estampado floral en fondo oscuro. Corte en A con cintura ajustable.",
    style: "Casual",
    active: true
  },
  {
    name: "Blusa Seda Blanca",
    category: "mujer",
    price: 99.90,
    stock: 18,
    imageUrl: "https://placehold.co/600x800/f5f2ee/c8a97e?text=Blusa+Seda",
    description: "Blusa de seda natural con lazo en cuello. Mangas largas con puño y botón.",
    style: "Formal",
    active: true
  },
  {
    name: "Falda Plisada Metalizada",
    category: "mujer",
    price: 119.90,
    stock: 14,
    imageUrl: "https://placehold.co/600x800/8a7a9a/ffffff?text=Falda+Plisada",
    description: "Falda plisada con brillo metálico. Cintura alta con cierre lateral y forro interior.",
    style: "Fiesta",
    active: true
  },
  {
    name: "Crop Top Algodón Orgánico",
    category: "mujer",
    price: 49.90,
    stock: 35,
    imageUrl: "https://placehold.co/600x800/0a0a0a/c8a97e?text=Crop+Top",
    description: "Crop top de algodón orgánico con costuras vistas. Corte recto y cuello redondo.",
    style: "Casual",
    active: true
  },
  {
    name: "Jean Tiro Alto Mom",
    category: "mujer",
    price: 139.90,
    stock: 22,
    imageUrl: "https://placehold.co/600x800/6a7a8a/ffffff?text=Mom+Jean",
    description: "Jeans de tiro alto estilo mom. Desgastado suave con dobladillo vuelto.",
    style: "Casual",
    active: true
  },
  {
    name: "Blazer Oversize Beige",
    category: "mujer",
    price: 199.90,
    stock: 10,
    imageUrl: "https://placehold.co/600x800/d4c5a9/0a0a0a?text=Blazer+Beige",
    description: "Blazer oversize en tono beige. Hombros estructurados y solapa ancha.",
    style: "Formal",
    active: true
  },
  {
    name: "Vestido Largo Noche",
    category: "mujer",
    price: 219.90,
    stock: 8,
    imageUrl: "https://placehold.co/600x800/0a0a0a/c8a97e?text=Vestido+Noche",
    description: "Vestido largo de gala con escote drapeado. Espalda descubierta y cierre oculto.",
    style: "Fiesta",
    active: true
  },
  {
    name: "Chompa Cardigan Oversize",
    category: "mujer",
    price: 149.90,
    stock: 16,
    imageUrl: "https://placehold.co/600x800/d4c5a9/0a0a0a?text=Cardigan",
    description: "Cardigan de lana mezcla, tejido grueso y botones forrados en madera.",
    style: "Invierno",
    active: true
  },
  {
    name: "Leggings Deportivos High-Waist",
    category: "mujer",
    price: 79.90,
    stock: 30,
    imageUrl: "https://placehold.co/600x800/1a1a1a/c8a97e?text=Leggings",
    description: "Leggings de compresión con cintura alta. Tejido anti-transparente y bolsillo lateral.",
    style: "Deportivo",
    active: true
  },
  {
    name: "Camisa Oversize Cuadros",
    category: "mujer",
    price: 89.90,
    stock: 25,
    imageUrl: "https://placehold.co/600x800/8a3a3a/f5f2ee?text=Camisa+Cuadros",
    description: "Camisa de franela con patrón de cuadros. Corte oversize y puños ajustables.",
    style: "Casual",
    active: true
  },
  {
    name: "Short Ciclista Negro",
    category: "mujer",
    price: 59.90,
    stock: 28,
    imageUrl: "https://placehold.co/600x800/0a0a0a/c8a97e?text=Short+Bike",
    description: "Short estilo ciclista en nylon elastizado. Costura plana y pretina ancha.",
    style: "Deportivo",
    active: true
  },
  {
    name: "Top Deportivo Crop",
    category: "mujer",
    price: 69.90,
    stock: 32,
    imageUrl: "https://placehold.co/600x800/2a2a2a/c8a97e?text=Top+Crop",
    description: "Top deportivo con soporte medio. Tejido transpirable con panel de malla.",
    style: "Deportivo",
    active: true
  },

  // ========== UNISEX (12 productos) ==========
  {
    name: "Hoodie Básico Premium",
    category: "unisex",
    price: 129.90,
    stock: 25,
    imageUrl: "https://placehold.co/600x800/0a0a0a/c8a97e?text=Hoodie",
    description: "Hoodie de algodón fleece 420gsm. Capucha forrada, cordón ajustable y bolsillo canguro.",
    style: "Urbano",
    active: true
  },
  {
    name: "Gorra Trucker Negra",
    category: "unisex",
    price: 45.90,
    stock: 40,
    imageUrl: "https://placehold.co/600x800/0a0a0a/c8a97e?text=Gorra+Trucker",
    description: "Gorra trucker con malla trasera. Cierre ajustable de clip y visera curva.",
    style: "Accesorio",
    active: true
  },
  {
    name: "Mochila Urbana 25L",
    category: "unisex",
    price: 99.90,
    stock: 18,
    imageUrl: "https://placehold.co/600x800/2a2a2a/c8a97e?text=Mochila",
    description: "Mochila impermeable con compartimento para laptop de 15\". Bolsillo organizador y puerto USB.",
    style: "Accesorio",
    active: true
  },
  {
    name: "Jogger Algodón French Terry",
    category: "unisex",
    price: 89.90,
    stock: 30,
    imageUrl: "https://placehold.co/600x800/3a3a3a/ffffff?text=Jogger",
    description: "Pantalón jogger en French Terry. Pretina elástica con cordón y bolsillos laterales.",
    style: "Urbano",
    active: true
  },
  {
    name: "Bandolera Piel Sintética",
    category: "unisex",
    price: 69.90,
    stock: 22,
    imageUrl: "https://placehold.co/600x800/0a0a0a/c8a97e?text=Bandolera",
    description: "Bandolera de poliuretano. Correa ajustable, múltiples compartimentos y cierre magnético.",
    style: "Accesorio",
    active: true
  },
  {
    name: "Bufanda Tejida Larga",
    category: "unisex",
    price: 49.90,
    stock: 35,
    imageUrl: "https://placehold.co/600x800/d4c5a9/0a0a0a?text=Bufanda",
    description: "Bufanda de tejido grueso con flecos. Medida 180x30cm. Ideal para invierno.",
    style: "Invierno",
    active: true
  },
  {
    name: "Sudadera Cremallera Media",
    category: "unisex",
    price: 109.90,
    stock: 20,
    imageUrl: "https://placehold.co/600x800/4a4a4a/ffffff?text=Half+Zip",
    description: "Sudadera con media cremallera. Cuello alto y puños acanalados. Algodón 380gsm.",
    style: "Deportivo",
    active: true
  },
  {
    name: "Reloj Analógico Minimalista",
    category: "unisex",
    price: 159.90,
    stock: 12,
    imageUrl: "https://placehold.co/600x800/0a0a0a/c8a97e?text=Reloj",
    description: "Reloj de cuarzo con caja de acero inoxidable. Esfera negra sin números y correa de cuero.",
    style: "Accesorio",
    active: true
  },
  {
    name: "Lentes Sol Aviador Dorados",
    category: "unisex",
    price: 89.90,
    stock: 16,
    imageUrl: "https://placehold.co/600x800/c8a97e/0a0a0a?text=Aviador",
    description: "Lentes de sol estilo aviador con marco metálico dorado. Filtro UV400.",
    style: "Accesorio",
    active: true
  },
  {
    name: "Chaleco Acolchado Ligero",
    category: "unisex",
    price: 139.90,
    stock: 14,
    imageUrl: "https://placehold.co/600x800/0a0a0a/c8a97e?text=Chaleco+Puffer",
    description: "Chaleco acolchado tipo puffer. Resistente al agua, con capucha oculta y bolsillos con cierre.",
    style: "Invierno",
    active: true
  },
  {
    name: "Bolso Tote Lona Cruda",
    category: "unisex",
    price: 79.90,
    stock: 28,
    imageUrl: "https://placehold.co/600x800/d4c5a9/0a0a0a?text=Tote+Bag",
    description: "Bolso tote de lona cruda con refuerzo en base. Capacidad para 15L, asas largas.",
    style: "Accesorio",
    active: true
  },
  {
    name: "Set Gorro + Guantes Térmico",
    category: "unisex",
    price: 59.90,
    stock: 38,
    imageUrl: "https://placehold.co/600x800/0a0a0a/c8a97e?text=Gorro+Set",
    description: "Set de gorro y guantes tejidos en lana acrílica. Forro polar interior térmico.",
    style: "Invierno",
    active: true
  }
];

export async function seedProducts() {
  const confirmed = confirm(
    `¿Agregar ${PRODUCTS.length} productos a Firestore?\n\n` +
    "Esto NO borrará productos existentes, solo agregará nuevos. ¿Continuar?"
  );
  if (!confirmed) return;

  const btn = document.createElement("div");
  btn.textContent = "⏳ Sembrando productos...";
  btn.style.cssText = "position:fixed;top:1rem;left:50%;transform:translateX(-50%);background:var(--black);color:var(--white);padding:1rem 2rem;z-index:9999;font-family:var(--font-display);letter-spacing:0.1em";
  document.body.appendChild(btn);

  let count = 0;
  for (const product of PRODUCTS) {
    try {
      await addDoc(collection(db, "products"), {
        ...product,
        createdAt: serverTimestamp()
      });
      count++;
      btn.textContent = `⏳ ${count}/${PRODUCTS.length} productos agregados...`;
    } catch (err) {
      console.error(`Error al agregar "${product.name}":`, err);
    }
  }

  btn.textContent = `✅ ${count} productos agregados correctamente. Recarga la página.`;
  setTimeout(() => btn.remove(), 3000);
  return count;
}
