import { MainHeader } from "@/components/layout/MainHeader";

export default function FormsLayout({
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
