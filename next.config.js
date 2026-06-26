const createNextIntlPlugin = require("next-intl/plugin");

// Point at our request-locale resolver. No URL prefix — locale is
// negotiated per-request from cookie + Accept-Language.
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = withNextIntl(nextConfig);
