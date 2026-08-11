import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Scaffold stage: keep `next build` green without requiring an eslint
    // config to be wired up yet. Revisit once the app has real CI.
    ignoreDuringBuilds: true,
  },
};

export default withNextIntl(nextConfig);
