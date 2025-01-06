import { MainHeader } from "@/components/layout/MainHeader";

export default function AccountDeletedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MainHeader menuItems={[]} />
      {children}
    </>
  );
}
