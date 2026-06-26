import type { Metadata, Viewport } from "next";
import { getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { PWAInstaller } from "@/components/PWAInstaller";
import { APP_NAME, APP_VERSION } from "@/lib/version";
import { LOCALE_INFO, type Locale } from "@/lib/i18n/locales";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://get-spark.app";

const DESCRIPTION =
  "Spark is a local-first AI assistant for coding, SEO trends, and location-based fashion insights. Bring your own DeepSeek key — your prompts, history, and key never leave your device.";

const TITLE = "Spark — Local-first AI for code, trends & style";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s — Spark",
  },
  description: DESCRIPTION,
  applicationName: APP_NAME,
  authors: [{ name: "Spark" }],
  keywords: [
    "AI chat",
    "DeepSeek",
    "local-first AI",
    "BYOK",
    "coding assistant",
    "SEO trends",
    "fashion trends",
    "Spark AI",
    "open source AI",
    "privacy-first AI",
  ],
  category: "productivity",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Spark — local-first AI for code, trends & style",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
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

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: APP_NAME,
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Web, Windows, macOS, Linux",
  description: DESCRIPTION,
  softwareVersion: APP_VERSION,
  url: SITE_URL,
  image: `${SITE_URL}/og-image.png`,
  license: "https://opensource.org/licenses/MIT",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Organization",
    name: APP_NAME,
    url: "https://github.com/y-ming-sketch/get_spark",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = (await getLocale()) as Locale;
  const messages = await getMessages();
  const dir = LOCALE_INFO[locale]?.dir ?? "ltr";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
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
        {/* Structured data for search engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </head>
      <body className="antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>{children}</ThemeProvider>
        </NextIntlClientProvider>
        <PWAInstaller />
      </body>
    </html>
  );
}
