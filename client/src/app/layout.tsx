import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "../components/Navbar";

export const metadata: Metadata = {
  title: "OrbitRider | Delivery Executive Console",
  description: "AI-powered delivery rider operating system for intelligent return pickups, doorstep inspections, and real-time route optimization.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css"
          crossOrigin=""
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#07090e] text-slate-100 font-sans selection:bg-emerald-500 selection:text-white" suppressHydrationWarning>
        <Navbar />
        <main className="flex-1 flex flex-col pb-20 lg:pb-0">{children}</main>
      </body>
    </html>
  );
}
