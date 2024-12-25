'use client';

import { Suspense, useEffect } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/layout/Navbar";
import RootLoading from "./loading";
import { CustomSession } from "@/types";
import { useUserStore } from "@/store/user-store";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: sessionData } = useSession();
  const session = sessionData as CustomSession;
  const setUser = useUserStore((state) => state.setUser);

  // Sincronizar o estado global com a sessão
  useEffect(() => {
    if (session?.user) {
      setUser(session.user);
    }
  }, [session?.user, setUser]);

  return (
    <>
      <Navbar />
      <Suspense fallback={<RootLoading />}>
        <main className="flex-1">{children}</main>
      </Suspense>
    </>
  );
}
