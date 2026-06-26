import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { PWAInstaller } from "@/components/PWAInstaller";

export const metadata: Metadata = {
  title: "Spark — AI for code, trends & style",
  description:
    "Spark is a serious AI assistant for coding, SEO trends, and location-based fashion insights. Powered by DeepSeek.",
  keywords: [
    "AI chat",
    "DeepSeek",
    "coding assistant",
    "SEO trends",
    "fashion trends",
    "Spark AI",
  ],
  applicationName: "Spark",
  authors: [{ name: "Spark" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Spark",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Spark — AI for code, trends & style",
    description:
      "Your AI for code, trends, and everything in between. Powered by DeepSeek.",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF9F5" },
    { media: "(prefers-color-scheme: dark)", color: "#13120F" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Avoid theme flash by setting .dark class before hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var raw = localStorage.getItem('spark-store');
                  var theme = 'system';
                  if (raw) {
                    var parsed = JSON.parse(raw);
                    if (parsed && parsed.state && parsed.state.theme) {
                      theme = parsed.state.theme;
                    }
                  }
                  var wantDark =
                    theme === 'dark' ||
                    (theme === 'system' &&
                      window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (wantDark) document.documentElement.classList.add('dark');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
        <PWAInstaller />
      </body>
    </html>
  );
}
