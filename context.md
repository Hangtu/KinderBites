# 📂 PROJECT CONTEXT: Lonchi-web

> **SYSTEM INSTRUCTION FOR AI:**
> This file is the Single Source of Truth (SSOT) for this project.
> Before generating code, proposing changes, or answering questions, you MUST review the "Current Focus", "Constraints", and "App Map" sections.
> If a user prompt contradicts this file, prioritize this file unless explicitly told to ignore it.

---

## 0. 🤖 AI Instructions (G.R.I.A.L. Protocol)

### Prime Directive
Before answering ANY query, generating code, or analyzing logic, you MUST:
1. **Read this file** (`context.md`) in the project root immediately.
2. **Internalize the SSOT:** adopt the Tech Stack, Constraints, and Active Task defined here.
3. **Resolve Conflicts:** If the user's prompt contradicts this file, prioritize this file or ask for confirmation.

### Vibe & Behavior
- **Concise:** Do not explain basic concepts. Just give the solution.
- **Strict Compliance:** Adhere strictly to the Coding Guidelines in Section 2.
- **English for Code & Comments:** When writing code (variables, functions, types, comments, JSDoc), always use English. UI strings shown to users may stay in Spanish.
- **Scope (YAGNI):** Implement only what is requested. If you see an important related improvement, always propose it (do not implement without confirmation).
- **Tests:** Write tests only when explicitly requested.
- **Clarification:** If the request is ambiguous, ask before implementing. Do not assume.
- **Documentation:** When flow or architecture changes, update `FLUJO_APP.md`, `README`, and relevant docs accordingly.
- **Security:** Always prioritize secure code. Consider RLS, auth, validation, and attack prevention in every line and module. Security-first mindset.
- **Maintenance:** If we complete a feature, remind to update the checkboxes in this file.

### Reset Command
If the user says **"PHOENIX"** or **"RESET"**:
- Ignore all previous chat history.
- Re-read `context.md`.
- Confirm by stating the **Current Active Task** found in Section 5.

---

## 1. 🎯 Project Overview & Boundaries

### Core Vision

- **Elevator Pitch:** App para que padres con poco tiempo puedan ordenar loncheras con comida saludable para sus hijos.
- **Target Audience:** Padres de familia (kinder y primaria).
- **Key Success Metrics (KPIs):**
  - [por definir]

### 🚧 Operational Constraints (Grounding)

_Rules that the logic MUST follow strictly._

- **Cutoff 8:00 AM:** Si se ordena después de las 8:00am solo se permite pedido para el día siguiente. Hasta las 8am se permite pedido para el mismo día.
- **Geography/Localization:** [por definir]
- **User Permissions:** Admin puede subir loncheras y ver pedidos. Actualmente cualquier usuario autenticado puede acceder a `/admin` (no hay rol "admin" diferenciado).
- **Platform/Device:** Mobile-first Web App (Tailwind, diseño responsive). Desktop es secundario.

### 🚫 Negative Scope (What we are NOT building)

_Do not waste resources suggesting or implementing these._

- No app nativa iOS/Android (solo Web).
- [por definir otras exclusiones]

### 🏁 MVP Launch Criteria (Definition of Done)

- [x] User can Register & Login.
- [x] User can complete the Core Flow (Onboarding → Menú → Carrito → Checkout).
- [ ] Stripe Payments active (Test Mode) — actualmente pago en efectivo/transferencia.
- [ ] Regla de corte 8am implementada en checkout.
- [ ] Dashboard admin: vista pedidos pendientes/terminados + Excel descargable.
- [ ] Critical bugs resolved.

---

## 2. 🛠️ Tech Stack & Coding Guidelines

_Use only the tools listed below. Do not introduce new libraries without permission._

### Core Stack

- **Frontend:** Next.js 15 (App Router), React 19
- **Styling:** Tailwind CSS v4, Mobile Fist, componentes UI (button, input, card, etc.), Lucide Icons
- **Backend/BaaS:** Supabase (Auth, DB, Storage)
- **Database:** PostgreSQL vía Supabase, ORM Drizzle
- **State Management:** Zustand (carrito, onboarding), SWR (fetching)
- **Auth:** Supabase Auth
- **Forms:** React Hook Form + Zod
- **Payments:** Stripe (preparado, no activo en checkout)
- **Email:** Resend (confirmación de pedido)
- **i18n:** next-intl (español)

### Guidelines

1. **Strict Typing:** TypeScript strict mode is mandatory. No `any`.
2. **File Structure:** Use `kebab-case` for file names.
3. **Component Strategy:** Use functional components. Prefer server components by default.
4. **Error Handling:** All server actions must return standardized error objects.

---

## 3. 🗺️ App Architecture & Route Inventory

_A comprehensive list of all routes in the application. AI: Keep this updated._

### 📂 Directory Structure

- `src/app/` — App Router pages.
- `src/components/ui/` — Generic primitives.
- `src/lib/` — Supabase, utils, db.
- `src/store/` — Zustand (cart, onboarding).
- `src/hooks/` — useChildren, useProducts, useDeliveryAddresses.
- `src/schemas/` — Zod schemas.
- `src/i18n/` — Mensajes y configuración i18n.

### 📍 Route Inventory (Sitemap)

**Public Routes:**

- `/` → Redirige según sesión: usuario → `/menu`, sin sesión → `/onboarding/welcome`.
- `/login` → Auth Screen (Login/Register).
- `/onboarding/welcome` → Bienvenida (Siguiente, Saltar, Iniciar sesión).
- `/onboarding/child` → Datos del niño (creación en Zustand, edición en DB si `?edit=id`).
- `/onboarding/address` → Dirección y horario (creación en Zustand, edición en DB).

**Protected Routes (Shop Layout — requiere login + niño + dirección en DB):**

- `/menu` → Menú de loncheras, agregar al carrito.
- `/product/[id]` → Detalle de producto.
- `/cart` → Carrito, opción suscripción 15%.
- `/checkout` → 3 pasos: Dirección, Fecha/Hora, Pago.
- `/checkout/success` → Confirmación tras crear pedido.
- `/orders`, `/orders/[id]` → Historial de pedidos.
- `/profile`, `/profile/children`, `/profile/addresses` → Perfil y gestión de niños/direcciones.

**Protected Routes (Admin — requiere login, middleware):**

- `/admin/products` → CRUD productos (loncheras).
- `/admin/products/new` → Crear producto.
- `/admin/products/[id]` → Editar producto.

**Pendientes (scope descrito):**

- `/admin/orders` → Vista de pedidos pendientes y terminados.
- Exportar Excel de pedidos del día (a corte 8am).

**API Routes:**

- `/auth/callback` → Callback OAuth Supabase.
- `/api/seed-demo` → Crear datos de prueba.
- `/api/create-payment-intent` → Preparado para Stripe.
- `/api/send-order-confirmation` → Enviar correo tras crear pedido.

---

## 4. 🗄️ Domain Model (High-Level Schema)

_Core entities and relationships. See `src/lib/db/schema.ts` for full definitions._

- **profiles:** `id`, `email`, `full_name`, `avatar_url`, `stripe_customer_id`, `created_at`, `updated_at`
- **children:** `id`, `parent_id` (FK profiles), `name`, `birth_date`, `school_name`, `grade`, `allergy_ids`, `avoided_foods`, `special_notes`, `created_at`, `updated_at`
- **delivery_addresses:** `id`, `profile_id` (FK), `label` (school/home/office), `address`, `school_id`, `school_name`, `preferred_time_slot`, `is_default`, `created_at`, `updated_at`
- **products:** `id`, `name`, `description`, `price`, `image_url`, `category` (age_6_12, age_1_2, snack, drink), `age_range`, `is_available`, `created_at`, `updated_at`
- **orders:** `id`, `parent_id` (FK), `delivery_address_id` (FK), `delivery_date`, `delivery_time_slot`, `subtotal`, `shipping`, `subscription_discount`, `total_amount`, `status` (pending, paid, preparing, delivered, cancelled), `created_at`, `updated_at`
- **order_items:** `id`, `order_id` (FK), `product_id` (FK), `child_id` (FK), `quantity`, `unit_price`, `specific_notes`, `created_at`

**Relaciones clave:** profiles → children, delivery_addresses, orders; orders → order_items, delivery_addresses; order_items → products, children.

---

## 5. 📍 Current Project Status

_Update this section at the start of every coding session._

- **Phase:** MVP Building
- **Current Sprint Focus:** [por definir]
- **Active Task:** [por definir]

---

## 6. 📝 Roadmap & Detailed Scope

### 🟢 Phase 1: Authentication (implementado)

**Scope:**

- [x] **Login Screen:** Email/Pass + Registro.
- [x] **Middleware:** Protege `/checkout`, `/orders`, `/profile`, `/admin`.
- [x] **Layout Shop:** Exige niño + dirección en DB para menú, carrito, pedidos.

### 🟢 Phase 2: Core Feature — Tienda (implementado)

**Scope:**

- [x] **Onboarding:** welcome → child → address (invitado con Zustand o edición en DB).
- [x] **Menú y Producto:** Agregar al carrito (por niño, cantidad).
- [x] **Carrito:** Subtotal, suscripción 15%, finalizar compra.
- [x] **Checkout:** 3 pasos (Dirección, Fecha/Hora, Pago).
- [x] **Creación de pedido:** orders + order_items.
- [x] **Email de confirmación:** Resend tras crear pedido.

### 🟡 Phase 3: Admin / Dashboard (parcial)

**Scope:**

- [x] **CRUD productos:** Crear, editar, listar loncheras con imágenes.
- [ ] **Loncheras disponibles de la semana:** [por definir — ¿productos por fecha? ¿menú semanal?]
- [ ] **Vista de pedidos:** Pendientes y terminados en dashboard admin.
- [ ] **Excel descargable:** Pedidos del día a corte 8am.

### 🟡 Phase 4: Regla de corte 8am (pendiente)

**Scope:**

- [ ] **Validación en checkout:** Si hora actual > 8:00am, deshabilitar opción "Hoy" y permitir solo "Mañana".

---

## 7. 🧊 Icebox / Backlog

_Features planned for later versions. Do not implement yet._

- [ ] Stripe activo en checkout (actualmente pago en efectivo/transferencia).
- [ ] Rol admin diferenciado (actualmente cualquier usuario autenticado puede acceder a `/admin`).
- [ ] Multi-idioma ampliado.
- [ ] Persistencia del carrito (localStorage o DB).

---

## 8. 🔀 Flujo actual de la app

_Diagrama del flujo de rutas y decisiones. Layout shop exige login + niño + dirección en DB; si falta, redirige a onboarding._

```mermaid
flowchart TD
    Root[/]
    Root -->|logged in| Menu[/menu]
    Root -->|no session| Welcome["/onboarding/welcome"]

    Welcome -->|Next| Child["/onboarding/child"]
    Welcome -->|Skip| Menu
    Welcome -->|Sign in| Login[/login]

    Child -->|Zustand| Address["/onboarding/address"]
    Address -->|Zustand| Menu

    Login -->|OK| Root

    Menu -.->|redirect if missing child or address in DB| Child
    Menu -.->|redirect if missing child or address in DB| Address

    Menu --> Cart[/cart]
    Cart --> Checkout["/checkout 3 steps"]
    Checkout --> Success["/checkout/success"]

    Menu --> Orders[/orders]
    Menu --> Profile[/profile]
    Menu --> Admin["/admin/products"]

    subgraph Shop [Shop requires login child and address in DB]
        Menu
        Cart
        Checkout
        Success
        Orders
        Profile
    end

    subgraph AdminArea [Admin requires login]
        Admin
    end
```
