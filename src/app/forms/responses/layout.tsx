import { MainHeader } from "@/components/layout/MainHeader";

export default function ResponsesLayout({
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
