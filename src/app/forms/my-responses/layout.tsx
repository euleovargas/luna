import { MainHeader } from "@/components/layout/MainHeader";

export default function MyResponsesLayout({
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
