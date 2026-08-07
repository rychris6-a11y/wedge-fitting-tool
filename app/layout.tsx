import Link from "next/link";
import "./globals.css";
import MowerBackground from "@/components/MowerBackground";

export const metadata = {
  title: "Wedge Fitting Calculator",
  description: "Find the right wedge lofts and bounce for your game.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MowerBackground />
        <header className="site-header">
          <Link href="/" className="site-header-link">⛳ Wedge Fitting Calculator</Link>
        </header>
        {children}
        <hr className="fairway-divider" style={{maxWidth: '480px', margin: '2rem auto 0'}} />
        <footer className="site-footer">
          <Link href="/guide">Wedge Fitting Guide</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Use</Link>
          <Link href="/disclosure">Affiliate Disclosure</Link>
        </footer>
      </body>
    </html>
  );
}
