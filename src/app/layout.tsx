import "./globals.css";

import { PHProvider, PostHogPageview } from "./_util/_providers";
import Header from "./components/template/header/Header";
import Footer from "./components/template/footer/Footer";
import { Suspense } from "react";
import type { ReactNode } from "react";

export const metadata = {
  title: "ChessTraining.app - The best way to improve your chess",
  description:
    "Use our powerful training tools, backed by science and Grand Master training methods, to shape up your chess and bring in the wins!",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <Suspense>
        <PostHogPageview />
      </Suspense>
      <PHProvider>
        <body>
          <Header />
          {children}
          <Footer />
        </body>
      </PHProvider>
    </html>
  );
}
