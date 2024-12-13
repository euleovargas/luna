'use client';

import { useSession } from 'next-auth/react';
import { Navbar } from "@/components/layout/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  const menuItems = session?.user?.role === 'ADMIN' 
    ? [
        { href: "/dashboard", title: "Dashboard" },
        { href: "/admin/users", title: "Usuários" },
        { href: "/profile", title: "Perfil" }
      ]
    : [
        { href: "/dashboard", title: "Dashboard" },
        { href: "/profile", title: "Perfil" }
      ];

  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar menuItems={menuItems} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
