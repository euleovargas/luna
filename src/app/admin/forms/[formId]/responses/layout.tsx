import { MainHeader } from "@/components/layout/MainHeader";

export default function AdminFormsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MainHeader menuItems={[]} />
      <main>{children}</main>
    </>
  );
}
