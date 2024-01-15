import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sudokiste",
  description: "Solveur de Sudoku.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
