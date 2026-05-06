import type React from "react";
// Marketing site layout with header and footer
import { Header } from "@/components/features/shared/header";
import { Footer } from "@/components/features/shared/footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex justify-center items-center">{children}</main>
      <Footer />
    </div>
  );
}
