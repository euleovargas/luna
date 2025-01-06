import { MainHeader } from "@/components/layout/MainHeader";

export default function NewFormLayout({
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
