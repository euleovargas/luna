'use client';

import { MainHeader } from '@/components/layout/MainHeader';
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useUserStore } from '@/store/user-store';

interface NavbarProps {
  menuItems?: { href: string; title: string; }[];
}

export default function Navbar({ menuItems: propMenuItems }: NavbarProps) {
  const user = useUserStore((state) => state.user)

  const defaultMenuItems = user?.role === 'ADMIN' 
    ? [
        { href: "/dashboard", title: "Dashboard" },
        { href: "/admin/users", title: "Usuários" },
        { href: "/admin/forms", title: "Formulários" },
        { href: "/profile", title: "Perfil" }
      ]
    : [
        { href: "/dashboard", title: "Dashboard" },
        { href: "/forms/my-responses", title: "Meus Formulários" },
        { href: "/profile", title: "Perfil" }
      ];
  
  const menuItems = propMenuItems || defaultMenuItems;

  return (
    <MainHeader menuItems={menuItems}>
      <MainHeader.Actions>
        <ThemeToggle />
      </MainHeader.Actions>
    </MainHeader>
  );
}
