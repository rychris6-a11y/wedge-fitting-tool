import "./globals.css";

export const metadata = {
  title: "Wedge Fitting Calculator",
  description: "Find the right wedge lofts and bounce for your game.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <footer className="site-footer">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Use</a>
          <a href="/disclosure">Affiliate Disclosure</a>
        </footer>
      </body>
    </html>
  );
}
