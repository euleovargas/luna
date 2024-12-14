'use client';

import { Suspense } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/layout/Navbar";
import RootLoading from "./loading";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  return (
    <>
      <Navbar user={session?.user} />
      <Suspense fallback={<RootLoading />}>
        <main className="flex-1">{children}</main>
      </Suspense>
    </>
  );
}
