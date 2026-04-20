import { APP_TITLE } from "@/lib/constants";
import { type Metadata } from "next";
import { type ReactNode } from "react";
import { Footer } from "./_components/footer";
import { Header } from "./_components/header";

export const metadata: Metadata = {
  title: APP_TITLE,
  description: "A Next.js starter with T3 stack and Lucia auth.",
};

function LandingPageLayout({ children }: { children: ReactNode }) {
  return (
    <>
      
      {children}
      <div className="h-20"></div>
      
    </>
  );
}

export default LandingPageLayout;
