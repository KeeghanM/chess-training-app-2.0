import "./globals.css";

import NextAuthProvider from "./util/NextAuthProvider";
import Header from "./components/Header/Header";
import { trackEventOnServer } from "./util/trackEventOnServer";

export const metadata = {
  title: "ChessTraining.app - The best way to improve your chess",
  description:
    "Use our powerful training tools, backed by science and Grand Master training methods, to shape up your chess and bring in the wins!",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await trackEventOnServer("page_view");

  const test = () => {
    console.log("Hello");
  };

  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <NextAuthProvider>
          {/* {/* <Header /> */}
          {children}
        </NextAuthProvider>
      </body>
    </html>
  );
}
