import { Geist, Geist_Mono } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "jodit/es2021/jodit.min.css";
import "./globals.css";
import BootstrapClient from "../bootstrap";
import PanelShell from "./PanelShell";
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
  title: "Cricket Academy Panel",
  description: "Admin dashboard for Cricket Academy",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <BootstrapClient />
      <body>
        <AuthProvider>
          <PanelShell>{children}</PanelShell>
        </AuthProvider>
      </body>
    </html>
  );
}
