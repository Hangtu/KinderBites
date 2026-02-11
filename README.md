# Lonchi Web

Aplicación web para que padres compren lonches escolares saludables para sus hijos de kinder y primaria.

## Stack

- **Framework:** Next.js 15 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS + Shadcn/ui (mobile-first)
- **Base de datos:** Supabase (PostgreSQL, Auth, Storage)
- **ORM:** Drizzle
- **Estado:** Zustand (carrito), SWR (fetching)
- **Formularios:** React Hook Form + Zod
- **Pagos:** Stripe

## Desarrollo local

### Requisitos

- Node.js 18+
- Docker (para Supabase local)
- Cuenta de Supabase (o Supabase CLI para local)

### Configuración

1. Clonar y instalar dependencias:

```bash
npm install --legacy-peer-deps
```

2. Copiar variables de entorno:

```bash
cp .env.example .env.local
```

3. Iniciar Supabase local (opcional):

```bash
npx supabase start
```

Obtén las credenciales con `npx supabase status` y configúralas en `.env.local`.

4. Aplicar migraciones (si usas Supabase local):

```bash
npx supabase db push
```

5. Ejecutar en desarrollo:

```bash
npm run dev
```

La app estará en [http://localhost:3000](http://localhost:3000).

## Estructura del proyecto

```
src/
├── app/
│   ├── (auth)/          # Login
│   ├── (onboarding)/    # Bienvenida, Perfil niño, Dirección
│   ├── (shop)/          # Menú, Producto, Carrito, Pedidos, Perfil
│   ├── admin/           # Panel admin (productos)
│   ├── checkout/        # Finalizar pedido
│   └── api/             # Route handlers
├── components/
├── hooks/
├── lib/
├── schemas/
├── store/
└── i18n/
```

## Flujo de usuario

1. Landing → Login o Comenzar
2. Onboarding: Bienvenida → Perfil del niño → Dirección/escuela
3. Menú: Explorar productos, añadir al carrito
4. Carrito: Revisar, suscripción 15%, Finalizar compra
5. Checkout: Dirección → Fecha/Hora → Pago
6. Confirmación
# KinderBites
