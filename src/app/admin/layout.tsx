import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login?redirect=/admin/products");
  }

  // Check admin role from Clerk publicMetadata
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const role = (user.publicMetadata as { role?: string })?.role;

  if (role !== "admin") {
    redirect("/menu");
  }

  return (
    <div>
      {/* Admin Nav */}
      <nav className="sticky top-0 z-30 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-primary mr-2" style={{ fontSize: 20 }}>admin_panel_settings</span>
            <span className="text-sm font-bold text-text-main-light dark:text-text-main-dark">Admin</span>
          </div>
          <div className="flex gap-1">
            <NavLink href="/admin/products" icon="inventory_2" label="Productos" />
            <NavLink href="/admin/orders" icon="receipt_long" label="Pedidos" />
          </div>
          <Link href="/menu" className="text-xs text-primary hover:underline font-medium">
            ← Tienda
          </Link>
        </div>
      </nav>
      {children}
    </div>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-text-sec-light dark:text-text-sec-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{icon}</span>
      {label}
    </Link>
  );
}
