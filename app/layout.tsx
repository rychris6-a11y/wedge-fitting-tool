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
          <a href="/" className="site-header-link">⛳ Wedge Fitting Calculator</a>
        </header>
        {children}
        <hr className="fairway-divider" style={{maxWidth: '480px', margin: '2rem auto 0'}} />
        <footer className="site-footer">
          <a href="/guide">Wedge Fitting Guide</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Use</a>
          <a href="/disclosure">Affiliate Disclosure</a>
        </footer>
      </body>
    </html>
  );
}
