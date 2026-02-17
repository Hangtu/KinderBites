# KinderBites (Lonchi Web)

Aplicación web para que padres compren lonches escolares saludables para sus hijos de kinder y primaria.

**Desarrollado por Hang Tu Wong Ley Franco**

## Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS + Componentes custom (mobile-first)
- **Auth:** Clerk
- **Base de datos:** Neon PostgreSQL
- **ORM:** Drizzle
- **Estado:** Zustand (carrito), SWR (fetching)
- **Formularios:** React Hook Form + Zod
- **Pagos:** Stripe
- **Storage:** Cloudflare R2
- **Deploy:** Vercel

## Desarrollo local

### Requisitos

- Node.js 18+

### Configuración

1. Clonar y instalar dependencias:

```bash
npm install --legacy-peer-deps
```

2. Copiar variables de entorno:

```bash
cp .env.example .env.local
```

3. Configurar las credenciales en `.env.local` (ver `.env.example` para referencia).

4. Ejecutar en desarrollo:

```bash
npm run dev
```

La app estará en [http://localhost:3000](http://localhost:3000).

### Usuario de prueba

- **Email:** `test@kinderbites.dev`
- **Password:** `kinderBites1234!`
- **Rol:** Admin

### Tarjeta de prueba (Stripe Sandbox)

- **Número:** `4242 4242 4242 4242`
- **Fecha:** Cualquier fecha futura
- **CVC:** Cualquier 3 dígitos

## Estructura del proyecto

```
src/
├── app/
│   ├── (auth)/          # Login
│   ├── (onboarding)/    # Bienvenida, Perfil niño, Dirección
│   ├── (shop)/          # Menú, Producto, Carrito, Pedidos, Perfil
│   ├── admin/           # Panel admin (productos, pedidos)
│   ├── checkout/        # Finalizar pedido + Stripe
│   └── api/             # Route handlers
├── actions/             # Server actions
├── components/          # Componentes UI
├── hooks/               # Custom hooks
├── lib/                 # DB, utils, config
├── store/               # Zustand stores
└── i18n/                # Internacionalización
```

## Flujo de usuario

1. Landing → Login (Google o email/password)
2. Onboarding: Bienvenida → Perfil del niño → Escuela/Horario
3. Menú: Explorar loncheras, añadir al carrito
4. Carrito: Revisar items, opción de suscripción (15% desc.)
5. Checkout: Dirección → Fecha/Hora → Pago con Stripe
6. Confirmación de pedido

## Panel Admin (`/admin`)

- Ver y gestionar pedidos (pendientes/completados)
- Cambiar estado de pedidos
- Gestionar productos (crear, editar, mostrar/ocultar)
- Descarga de pedidos del día en Excel (.xlsx)

## Licencia

Proyecto privado. Todos los derechos reservados.

---

© 2026 Hang Tu Wong Ley Franco
