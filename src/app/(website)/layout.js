import { Geist, Geist_Mono } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import BootstrapClient from "../bootstrap";
import Header from "@/components/website/Header";
import Footer from "@/components/website/Footer";
import styles from "@/components/website/WebsiteShell.module.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { AuthProvider } from "@/components/utils/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Cricket Academy",
  description: "Cricket Academy Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <BootstrapClient />
        <AuthProvider>
          <Header />
          <main className={styles.pageMain}>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
