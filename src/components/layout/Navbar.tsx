'use client';

import { MainHeader } from '@/components/layout/MainHeader';
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { User } from 'next-auth';

interface NavbarProps {
  user?: User | null;
  menuItems?: { href: string; title: string; }[];
}

export default function Navbar({ user, menuItems: propMenuItems }: NavbarProps) {
  const defaultMenuItems = user?.role === 'ADMIN' 
    ? [
        { href: "/dashboard", title: "Dashboard" },
        { href: "/admin/users", title: "Usuários" },
        { href: "/profile", title: "Perfil" }
      ]
    : [
        { href: "/dashboard", title: "Dashboard" },
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
