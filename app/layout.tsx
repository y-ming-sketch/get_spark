import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

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
  openGraph: {
    title: "Spark — AI for code, trends & style",
    description:
      "Your AI for code, trends, and everything in between. Powered by DeepSeek.",
    type: "website",
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF9F5" },
    { media: "(prefers-color-scheme: dark)", color: "#13120F" },
  ],
  width: "device-width",
  initialScale: 1,
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
      </body>
    </html>
  );
}
