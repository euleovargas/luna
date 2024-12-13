'use client';

import { MainHeader } from '@/components/layout/MainHeader';
import { ThemeToggle } from "@/components/theme/theme-toggle";

interface NavbarProps {
  menuItems?: {
    href: string;
    title: string;
  }[];
}

export function Navbar({ menuItems }: NavbarProps) {
  return (
    <MainHeader menuItems={menuItems}>
      <MainHeader.Actions>
        <ThemeToggle />
      </MainHeader.Actions>
    </MainHeader>
  );
}
