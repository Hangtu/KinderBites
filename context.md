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
- **Documentation:** When flow or architecture changes, update `context.md`, `README`, and relevant docs accordingly.
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

- **Elevator Pitch:** Plataforma que permite a padres ocupados delegar la nutrición escolar de sus hijos comprando **loncheras balanceadas visualmente atractivas**, eliminando la culpa y el estrés de la preparación matutina (basado en el Método Lonchera Práctica).
- **Target Audience:** Padres de familia (Kinder y Primaria) que valoran la nutrición pero carecen de tiempo.
- **Key Success Metrics (KPIs):**
  - **Weekly Recurrence Rate:** % de padres que piden para 3+ días de la semana (validación del hábito).
  - **Waste Rate:** % de comida no vendida (objetivo < 5% mediante stock finito).
  - **Conversion Rate:** % de visitantes que completan el onboarding (Child + Address).

### 🚧 Operational Constraints (Grounding)

_Rules that the logic MUST follow strictly._

- **Cutoff 8:00 AM (Hard Limit):**
  - Pedidos hechos **antes** de las 8:00 AM → Entrega HOY.
  - Pedidos hechos **después** de las 8:00 AM → Entrega MAÑANA (o fecha futura).
  - *Razón:* Logística de cocina y rutas de entrega.
- **Geography/Localization (School-Locked):**
  - El servicio **NO** entrega a domicilio.
  - El servicio entrega **EXCLUSIVAMENTE** a una lista cerrada de "Escuelas Autorizadas".
  - La dirección de entrega se selecciona de un Dropdown predefinido (no es un campo de texto libre).
- **The "Bundle" Rule (Product Composition):**
  - Un producto no es un ítem aislado. Cada "Lonchera" vendida debe respetar la estructura del Método: **Principal (Proteína/Carbo) + Vegetal/Fruta + Snack**.
- **The "Picky Eater" Logic (Menu Rotation):**
  - Para reducir la ansiedad de elección (Guía Central pág. 49), el sistema **no debe mostrar más de 3 opciones de menú** por día. (Menos es más).
- **User Permissions:**
  - **Padre:** Puede comprar, gestionar perfiles de hijos y ver historial.
  - **Admin:** Puede crear productos, gestionar escuelas y ver lista de empaquetado del día.
- **Platform/Device:** Mobile-first Web App (Tailwind, diseño responsive). Desktop es secundario.

### 🚫 Negative Scope (What we are NOT building)

_Do not waste resources suggesting or implementing these. These are explicit "Time Savers"._

- **No Customization (Ingredientes):** No permitimos "Sin cebolla" o "Sin tomate". El producto es SKU cerrado para velocidad masiva.
- **No Home Delivery:** No logística de última milla a casas. Solo "drops" masivos en escuelas.
- **No "Build Your Own":** El padre no arma la lonchera ítem por ítem. Compra el paquete diseñado por expertos.
- **No Chat/Social:** No hay comunicación entre padres ni con la cocina dentro de la app.
- **No App Nativa:** Solo PWA / Web Responsive.
- **No Historical Analytics:** El padre no necesita ver gráficos de nutrición por ahora.

### 🏁 MVP Launch Criteria (Definition of Done)

- [x] User can Register & Login.
- [x] User can complete the Core Flow (Onboarding → Menú → Carrito → Checkout).
- [x] **Product Visibility:** Admin controla qué loncheras se muestran con toggle show/hide.
- [x] **Cutoff Logic:** El Checkout bloquea visualmente la selección de "Hoy" si son las 8:01 AM.
- [x] **School Selection:** El onboarding y checkout usan dropdown de escuelas de la DB.
- [x] Stripe Payments active (Sandbox/Test Mode) — integrado con PaymentElement.
- [x] Dashboard Admin: vista pedidos pendientes/terminados + Excel descargable.
- [ ] Critical bugs resolved.

---

## 2. 🛠️ Tech Stack & Coding Guidelines

_Use only the tools listed below. Do not introduce new libraries without permission._

### Core Stack

- **Frontend:** Next.js 15 (App Router), React 19
- **Styling:** Tailwind CSS v4, Mobile Fist, componentes UI (button, input, card, etc.), Lucide Icons
- **Backend/BaaS:** NeonDB (DB), Cloudflare R2 (Storage)
- **Database:** PostgreSQL vía NeonDB, ORM Drizzle
- **State Management:** Zustand (carrito, onboarding), SWR (fetching)
- **Auth:** Clerk
- **Forms:** React Hook Form + Zod
- **Payments:** Stripe (preparado, no activo en checkout)
- **Email:** Resend (confirmación de pedido)
- **i18n:** next-intl (español)

### Guidelines

1. **Strict Typing:** TypeScript strict mode is mandatory. No `any`.
2. **File Structure:** Use `kebab-case` for file names.
3. **Component Strategy:** Use functional components. Prefer server components by default.
4. **Error Handling:** All server actions must return standardized error objects.
5. **Database Abstraction (DAL):** Isolate all database queries (Drizzle/SQL) into dedicated Server Actions or Data Access Layer functions (e.g., `src/actions/` or `src/services/`). Never import DB clients directly in UI components. This ensures generic facades if the underlying DB changes.

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

- [x] **Login Screen:** Email/Pass + Registro (Clerk).
- [x] **Middleware:** Protege `/checkout`, `/orders`, `/profile`, `/admin` (Clerk Middleware).
- [x] **Layout Shop:** Exige niño + dirección en DB para menú, carrito, pedidos.
- [x] **Auth Migration (Supabase → Clerk):**
  - [x] Eliminar dependencias y código de Supabase (`@supabase/*`, `src/lib/supabase`, `supabase/`, `dev-auto-login` — Completado).
  - [x] Instalar `@clerk/nextjs` e integrar `<ClerkProvider>` en `layout.tsx`.
  - [x] Configurar Middleware con `clerkMiddleware()` para proteger rutas (`/menu`, `/checkout`, `/admin`).
  - [x] Configurar redirecciones post-login (Google/Email) y rutas catch-all (`[[...]]`).
- [x] **DB Migration (Supabase → Neon):**
  - [x] Actualizar `DATABASE_URL` en `.env` con connection string de Neon.
  - [x] Verificar compatibilidad de Drizzle con `postgres.js` (Confirmado).
- [x] **Storage Migration (Supabase → R2):**
  - [x] Instalar `@aws-sdk/client-s3` y `@aws-sdk/s3-request-presigner`.
  - [x] Crear cliente S3 compatible con R2 en `src/lib/r2.ts`.
  - [x] Actualizar `next.config.ts` para permitir dominios de imágenes de R2.
  - [x] Crear Server Action para presigned URLs (`src/actions/storage.ts`).
  - [x] Crear componente `ImageUpload` (`src/components/ui/image-upload.tsx`).
  - [x] Integrar subida de imágenes en formulario Admin de productos.
  - [x] Configurar CORS en bucket R2 (`kinderbites`).
  - [x] Limpiar variables de entorno y dependencias legacy de Supabase.

### 🟢 Phase 2: Core Feature — Tienda (implementado)

**Scope:**

- [x] **Onboarding:** welcome → child → address (invitado con Zustand o edición en DB).
- [x] **Menú y Producto:** Agregar al carrito (por niño, cantidad).
- [x] **Carrito:** Subtotal, suscripción 15%, finalizar compra.
- [x] **Checkout:** 3 pasos (Dirección, Fecha/Hora, Pago).
- [x] **Creación de pedido:** orders + order_items.
- [x] **Email de confirmación:** Resend tras crear pedido.

### 🟢 Phase 3: Admin / Dashboard (implementado)

**Scope:**

- [x] **CRUD productos:** Crear, editar, listar loncheras con imágenes.
- [x] **Visibilidad de productos:** Toggle show/hide desde admin para controlar qué loncheras se muestran en el menú.
- [x] **Vista de pedidos:** Pendientes y terminados en dashboard admin con cambio de estado.
- [x] **Excel descargable:** Pedidos del día exportables a `.xlsx` con formato profesional.
- [x] **Rol admin:** Protección con Clerk `publicMetadata.role === "admin"`.
- [x] **Navegación admin:** Barra superior con links a Productos y Pedidos.

### 🟢 Phase 4: Regla de corte 8am (implementado)

**Scope:**

- [x] **Validación en checkout:** Si hora actual > 8:00am, deshabilitar opción "Hoy" y permitir solo "Mañana".
- [x] **Time slots reales:** 11:30 (Mañana) y 17:30 (Tarde) en lugar de slots genéricos.
- [x] **Warning badge:** Aviso visual "Pedidos después de las 8:00 AM se entregan mañana."

---

## 7. 🧊 Icebox / Backlog

_Features planned for later versions. Do not implement yet._

- [x] ~~Stripe activo en checkout~~ (integrado con Stripe Sandbox / PaymentElement).
- [x] ~~Rol admin diferenciado~~ (implementado con Clerk publicMetadata).
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
