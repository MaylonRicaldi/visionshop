# 👕 Vision Shop

**Vision Shop** es una plataforma de comercio electrónico desarrollada para la venta de ropa y accesorios. El sistema permite a los usuarios explorar un catálogo organizado por categorías, gestionar un carrito de compras, realizar pedidos mediante diferentes métodos de pago y consultar información legal, todo sobre una arquitectura basada en Firebase.

🌐 **Sitio web:** https://vision-shop-6cb39.web.app

---

# 📋 Tabla de Contenidos

- Características
- Tecnologías utilizadas
- Arquitectura
- Base de datos
- Estructura de Firestore
- Funcionalidades
- Instalación
- Despliegue
- Autor

---

# 🚀 Características

- Catálogo de **36 productos**
- Categorías:
  - Hombre
  - Mujer
  - Unisex
- Buscador de productos
- Filtros por categoría
- Carrito persistente mediante LocalStorage
- Registro e inicio de sesión
- Checkout protegido
- Cuatro métodos de pago
- Libro de reclamaciones (INDECOPI)
- Diseño Responsive
- Carrusel de productos
- Páginas legales

---

# 🛠 Tecnologías utilizadas

| Tecnología | Uso |
|------------|-----|
| HTML5 | Estructura de la aplicación |
| CSS3 | Estilos y diseño responsive |
| JavaScript (Vanilla) | Lógica del frontend |
| Firebase Hosting | Hosting del sitio web |
| Firebase Firestore | Base de datos NoSQL |
| Firebase Authentication | Gestión de usuarios |
| Vercel | API Serverless |
| Culqi | Pasarela de pagos con tarjeta |

---

# 🏗 Arquitectura

El proyecto utiliza una arquitectura Cliente–Servidor.

### Frontend

- HTML
- CSS
- JavaScript

Se comunica directamente con Firebase para:

- autenticación
- consultas de productos
- creación de pedidos
- libro de reclamaciones

### Backend

Se implementa mediante funciones Serverless alojadas en **Vercel**, encargadas del procesamiento seguro de pagos con **Culqi**.

---

# 🗄 Base de datos (Firestore)

La aplicación utiliza **Cloud Firestore**.

## Colecciones

| Colección | Descripción |
|------------|-------------|
| **products** | Catálogo de productos |
| **orders** | Pedidos realizados |
| **users** | Usuarios registrados |
| **reclamos** | Libro de reclamaciones |

Además, el proyecto incluye:

- `firestore.rules`
- `firestore.indexes.json`
- `seed.html` (Carga automática de los 36 productos)

---

# 📂 Modelo de Base de Datos

Aunque Firestore es una base de datos NoSQL basada en documentos, su estructura puede representarse de forma equivalente mediante el siguiente esquema SQL.

## Tabla: products

```sql
CREATE TABLE products (
  id          STRING PRIMARY KEY,
  name        STRING,
  category    STRING,
  price       NUMBER,
  stock       NUMBER,
  imageUrl    STRING,
  description STRING,
  style       STRING,
  active      BOOLEAN,
  createdAt   TIMESTAMP
);
```

---

## Tabla: orders

```sql
CREATE TABLE orders (
  id           STRING PRIMARY KEY,
  userId       STRING,
  userEmail    STRING,
  status       STRING,
  items        ARRAY<OBJECT>,
  shipping     OBJECT,
  payment      OBJECT,
  subtotal     NUMBER,
  shippingCost NUMBER,
  total        NUMBER,
  createdAt    TIMESTAMP,
  updatedAt    TIMESTAMP
);
```

---

## Tabla: users

```sql
CREATE TABLE users (
  id        STRING PRIMARY KEY,
  uid       STRING,
  email     STRING,
  fullName  STRING,
  role      STRING,
  orders    ARRAY<STRING>,
  active    BOOLEAN,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

---

## Tabla: reclamos

```sql
CREATE TABLE reclamos (
  id        STRING PRIMARY KEY,
  code      STRING,
  nombres   STRING,
  dni       STRING,
  email     STRING,
  telefono  STRING,
  pedido    STRING,
  tipo      STRING,
  detalle   STRING,
  status    STRING,
  createdAt TIMESTAMP
);
```

---

# ✨ Funcionalidades

## 🛍 Catálogo

- Visualización de productos
- Buscador
- Filtros por categoría

---

## 🛒 Carrito

- Agregar productos
- Eliminar productos
- Actualizar cantidades
- Persistencia mediante LocalStorage

---

## 👤 Usuarios

- Registro
- Inicio de sesión
- Cierre de sesión
- Protección del Checkout

---

## 💳 Métodos de pago

El sistema admite cuatro modalidades:

- Tarjeta (Culqi)
- Yape
- Plin
- Transferencia bancaria
- Contra entrega

---

## 📦 Pedidos

Cada pedido almacena:

- Productos
- Datos del cliente
- Dirección de envío
- Método de pago
- Estado del pedido

Estados posibles:

- pending
- confirmed
- shipped
- delivered
- cancelled

---

## 📝 Libro de reclamaciones

Implementación conforme al formato requerido por INDECOPI.

Incluye:

- Datos personales
- Tipo (Reclamo / Queja)
- Descripción
- Código generado automáticamente

---

## 📄 Páginas legales

- Términos y condiciones
- Política de devoluciones

---

## 📱 Responsive

Compatible con:

- Desktop
- Tablet
- Smartphone

---

# ⚙ Instalación

Clonar el repositorio

```bash
git clone https://github.com/usuario/vision-shop.git
```

Ingresar al proyecto

```bash
cd vision-shop
```

Instalar Firebase CLI (si aún no está instalado)

```bash
npm install -g firebase-tools
```

Iniciar sesión

```bash
firebase login
```

Levantar el proyecto

```bash
firebase serve
```

---

# 🚀 Despliegue

## Frontend (Firebase Hosting)

```bash
firebase deploy --only hosting
```

## API de pagos (Vercel)

El despliegue es automático al realizar un push al repositorio.

```bash
git push origin master
```

---

# 📁 Estructura del proyecto

```
Vision-Shop
│
├── css/
├── js/
├── img/
├── pages/
├── api/
├── firestore.rules
├── firestore.indexes.json
├── firebase.json
├── seed.html
├── index.html
└── README.md
```

---

# 👨‍💻 Autor

- **Maylon Amilcar Ricaldi Solis**
- **Dayana Jessica Javier Curi**

Proyecto desarrollado como plataforma E-commerce utilizando Firebase, Firestore y Culqi para la gestión de productos, autenticación, pedidos y procesamiento de pagos.
