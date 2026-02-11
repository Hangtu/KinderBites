# Flujo actual de la aplicación Lonchi-web

Este documento describe el flujo completo de la aplicación: entrada, onboarding, tienda, checkout, autenticación y dónde se guardan los datos.

---

## 1. Entrada a la app

| Ruta | Archivo | Comportamiento |
|------|---------|----------------|
| `/` | `src/app/page.tsx` | **Server Component**: llama a `supabase.auth.getUser()`. Si hay usuario → `redirect("/menu")`. Si no hay usuario → `redirect("/onboarding/welcome")`. No se muestra contenido propio; solo redirige. |

No existe una “landing” visible en `/`; la primera pantalla que ve un usuario nuevo es **onboarding/welcome**.

---

## 2. Autenticación y protección de rutas

### 2.1 Middleware global

- **Archivo**: `src/middleware.ts`
- **Función**: Ejecuta `updateSession(request)` en cada request (excepto estáticos y assets).
- **Lógica** (en `src/lib/supabase/middleware.ts`):
  - Refresca la sesión de Supabase si es necesario (cookies).
  - **Rutas protegidas** (requieren usuario logueado):
    - `/checkout` (y subrutas)
    - `/orders`
    - `/profile`
    - `/admin`
  - Si el usuario **no** está logueado y entra a una ruta protegida → redirige a `/login?redirect=<ruta>`.
  - Si el usuario **sí** está logueado y entra a `/login` → redirige a `/menu`.

### 2.2 Layout de la tienda (shop)

- **Archivo**: `src/app/(shop)/layout.tsx`
- **Rutas afectadas**: `/menu`, `/cart`, `/product/[id]`, `/orders`, `/orders/[id]`, `/profile`, `/profile/children`, `/profile/addresses`
- **Comportamiento**:
  1. Si no hay usuario → `redirect("/login?redirect=/menu")`.
  2. Si el usuario no tiene **ningún niño** en la tabla `children` → `redirect("/onboarding/child")`.
  3. Si el usuario no tiene **ninguna dirección** en `delivery_addresses` → `redirect("/onboarding/address")`.
  4. Si todo está bien → muestra el contenido y el `<Footer />`.

Por tanto: para ver menú, carrito, pedidos o perfil hace falta **estar logueado y tener al menos un niño y una dirección en la base de datos**.

### 2.3 Login y registro

- **Pantalla**: `src/app/(auth)/login/page.tsx` (cliente).
- **Login**: `supabase.auth.signInWithPassword({ email, password })` → si OK, `router.push("/")` + `router.refresh()`. La app te manda a `/` y desde ahí a `/menu` porque ya hay sesión.
- **Registro**: `supabase.auth.signUp(...)` con `emailRedirectTo: /auth/callback`. Tras confirmar el correo, Supabase redirige a `/auth/callback`.
- **Callback**: `src/app/auth/callback/route.ts` recibe el `code`, hace `exchangeCodeForSession(code)` y redirige a `/` (o al `next` que venga en query). Tras eso, el usuario queda logueado.

**Nota**: La página de login actualmente no usa el parámetro `redirect` de la URL; siempre redirige a `/` tras el login. El middleware sí guarda `redirect` al enviar a login.

---

## 3. Flujo de onboarding (sin login obligatorio)

Estas rutas son **públicas**: no las protege el middleware ni exigen sesión para verse.

### 3.1 Welcome — `/onboarding/welcome`

- **Archivo**: `src/app/(onboarding)/onboarding/welcome/page.tsx`
- **Opciones**:
  - **Iniciar sesión**: enlace a `/login`.
  - **Saltar**: enlace a `/menu`. (Si luego entras al layout de shop sin tener niños/direcciones en DB, el layout te mandará a onboarding/child o onboarding/address.)
  - **Siguiente**: enlace a `/onboarding/child`.

### 3.2 Datos del niño — `/onboarding/child`

- **Archivo**: `src/app/(onboarding)/onboarding/child/page.tsx`
- **Modos**:
  - **Creación** (sin `?edit=`):
    - Formulario: nombre, fecha de nacimiento, alergias, alimentos evitados, etc.
    - Al enviar: **no** se escribe en Supabase. Los datos se guardan en **Zustand** (`useOnboardingStore.setChild(...)`) y se redirige a `/onboarding/address`.
    - Es el flujo **invitado**: no hace falta estar logueado.
  - **Edición** (`?edit=<id>`):
    - Carga el niño desde Supabase y permite editar. Al guardar, actualiza la tabla `children`. **Sí requiere** usuario logueado; si no hay sesión, redirige a login.

### 3.3 Dirección y horario — `/onboarding/address`

- **Archivo**: `src/app/(onboarding)/onboarding/address/page.tsx`
- **Modos**:
  - **Creación** (sin `?edit=`):
    - Formulario: etiqueta (escuela/casa/oficina), nombre de escuela (si aplica), dirección, horario preferido (mañana/tarde).
    - Al enviar: **no** se escribe en Supabase. Los datos se guardan en **Zustand** (`useOnboardingStore.setAddress(...)`) y se redirige a **`/menu`**.
    - Flujo **invitado**.
  - **Edición** (`?edit=<id>`):
    - Carga la dirección desde Supabase y actualiza `delivery_addresses`. Requiere usuario logueado.

### 3.4 Store de onboarding

- **Archivo**: `src/store/onboarding-store.ts`
- **Estado**:
  - `child`: nombre, fecha de nacimiento, escuela, grado, alergias, alimentos evitados, notas.
  - `address`: etiqueta, nombre escuela, dirección, franja horaria (morning/evening).
- **Persistencia**: Solo en memoria (Zustand). No hay `localStorage`; al recargar la página se pierde.

Resumen: un usuario **nuevo puede completar welcome → child → address sin registrarse**; los datos quedan solo en el store. Al ir a `/menu`, el layout de shop comprobará si en la **base de datos** tiene niños y direcciones; si no (porque nunca se guardaron), lo redirigirá de nuevo a onboarding.

---

## 4. Flujo de tienda (menú, carrito, producto)

Todas estas rutas están bajo el layout **shop**, así que **requieren**: usuario logueado + al menos un niño en DB + al menos una dirección en DB.

### 4.1 Menú — `/menu`

- Lista productos (categorías, etc.). El usuario puede agregar al carrito eligiendo un **niño** (de la base de datos, vía hook `useChildren`). Cada ítem del carrito es: producto + niño + cantidad (y notas si aplica).

### 4.2 Producto — `/product/[id]`

- Detalle del producto y botón para agregar al carrito (eligiendo niño y cantidad). Usa `useCartStore.addItem(product, child, quantity, notes)`.

### 4.3 Carrito — `/cart`

- **Archivo**: `src/app/(shop)/cart/page.tsx`
- Lee y modifica el estado del **carrito** con `useCartStore`: items, cantidades, opción de suscripción (15% descuento), subtotal/total.
- **Persistencia del carrito**: Solo en memoria (`src/store/cart-store.ts`). No hay persistencia en localStorage ni en base de datos; al recargar se vacía.
- Botón “Finalizar Compra” → navega a **`/checkout`**.

---

## 5. Checkout y creación del pedido

- **Ruta**: `/checkout`
- **Protección**: Middleware (ruta protegida). Si no hay usuario → redirige a `/login`.

### 5.1 Pasos del checkout

1. **Paso 1 — Dirección**: Lista de direcciones del usuario desde Supabase (`useDeliveryAddresses`). Si no hay ninguna, puede “Agregar dirección”; al guardar se inserta en `delivery_addresses` (requiere estar logueado). Debe elegir una dirección para seguir.
2. **Paso 2 — Fecha y hora**: Elegir “Hoy” o “Mañana” y un tramo horario.
3. **Paso 3 — Pago**: Método de pago (actualmente texto “Pago en efectivo / transferencia”). No se usa aún el endpoint `/api/create-payment-intent` (Stripe).

### 5.2 Confirmar pedido

- Al pulsar “Confirmar Pedido”:
  1. Se comprueba de nuevo que haya usuario logueado; si no, redirige a `/login`.
  2. Se crea un registro en la tabla **`orders`** (parent_id, dirección, fecha, tramo, subtotal, envío, descuento suscripción, total, status, etc.).
  3. Por cada ítem del carrito se crea un registro en **`order_items`** (order_id, product_id, child_id, quantity, unit_price, specific_notes).
  4. Se vacía el carrito (`clearCart()`).
  5. Se llama a **`/api/send-order-confirmation`** (body: `{ orderId }`) para enviar el correo (p. ej. con Resend).
  6. Redirección a **`/checkout/success?orderId=...`**.

Las direcciones usadas en checkout son **siempre** las guardadas en Supabase para ese usuario; el store de onboarding (invitado) no se usa en este flujo.

---

## 6. Perfil y administración

### 6.1 Perfil — `/profile`, `/profile/children`, `/profile/addresses`

- Bajo layout shop: requieren login + niños + direcciones en DB.
- **children**: Lista de niños del usuario (Supabase). Enlaces para agregar/editar; editar lleva a `/onboarding/child?edit=<id>`.
- **addresses**: Lista de direcciones (Supabase). Agregar/editar; editar lleva a `/onboarding/address?edit=<id>`.

### 6.2 Admin — `/admin`, `/admin/products`, etc.

- Protegido por middleware (ruta `/admin`). Cualquier usuario **autenticado** puede acceder; no hay rol “admin” diferenciado en la UI.
- CRUD de productos (listado, crear, editar). Las políticas RLS de Supabase controlan quién puede insertar/actualizar productos.

---

## 7. APIs internas

| Ruta | Método | Uso |
|------|--------|-----|
| `/api/seed-demo` | POST | Crea datos de prueba (niño + dirección) para el usuario actual. Útil para tener datos en DB sin completar onboarding manual. |
| `/api/create-payment-intent` | POST | Preparado para Stripe; no se usa aún en la pantalla de checkout. |
| `/api/send-order-confirmation` | POST | Envía correo de confirmación tras crear la orden (body: `{ orderId }`). |

---

## 8. Resumen visual del flujo

```
                    ┌─────────┐
                    │   /     │
                    └────┬────┘
                         │
            ┌────────────┴────────────┐
            │                         │
       [con sesión]              [sin sesión]
            │                         │
            ▼                         ▼
       ┌─────────┐            ┌──────────────────┐
       │ /menu   │            │ /onboarding/     │
       └─────────┘            │   welcome        │
            │                  └────────┬─────────┘
            │                           │
            │                    [Siguiente] [Saltar] [Iniciar sesión]
            │                           │         │           │
            │                           ▼         │           ▼
            │                    ┌──────────┐     │     ┌─────────┐
            │                    │ /onboarding│     │     │ /login  │
            │                    │   child   │     │     └────┬────┘
            │                    └─────┬─────┘     │          │
            │                          │          │     [OK]  │
            │                    (store Zustand)  │          │
            │                          ▼          │          │
            │                    ┌──────────┐     │          │
            │                    │ /onboarding│     │          │
            │                    │   address │     │          │
            │                    └─────┬─────┘     │          │
            │                          │          │          │
            │                    (store Zustand)  │          │
            │                          │          │          │
            │                          └──────────┴──────────┘
            │                                     │
            │                                     ▼
            │                              ┌─────────┐
            │                              │ /menu    │  ← layout exige
            │                              └────┬────┘    niño + dirección
            │                                   │        en DB; si no hay,
            │                                   │        redirige a onboarding
            ◄───────────────────────────────────┘
            │
            ├── /cart ──► /checkout (pasos 1,2,3) ──► Confirmar ──► /checkout/success
            │
            ├── /orders, /profile, /profile/children, /profile/addresses
            │
            └── /admin/products (CRUD productos)
```

---

## 9. Dónde se guarda cada dato

| Dato | En memoria (Zustand) | En base de datos (Supabase) |
|------|----------------------|-----------------------------|
| Niño (onboarding creación) | `onboarding-store.child` | No |
| Niño (onboarding edición / perfil) | — | Tabla `children` |
| Dirección (onboarding creación) | `onboarding-store.address` | No |
| Dirección (onboarding edición / perfil / checkout “Agregar”) | — | Tabla `delivery_addresses` |
| Carrito (ítems, suscripción) | `cart-store` | No |
| Pedido y líneas | — | Tablas `orders` y `order_items` |

Este documento refleja el flujo actual del proyecto Lonchi-web a fecha de su creación.
