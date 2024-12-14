'use client';

import { Suspense } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/Navbar";
import RootLoading from "./loading";

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
    <>
      <Navbar menuItems={menuItems} user={session?.user} />
      <Suspense fallback={<RootLoading />}>
        <main className="flex-1">{children}</main>
      </Suspense>
    </>
  );
}
