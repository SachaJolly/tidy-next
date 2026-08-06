import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    indentWidth: 2,
    outputStyle: 'expanded',
  },
  images: {
    remotePatterns: [
      // Temporary allowlist for external avatar URLs during migration.
      // Target architecture:
      // 1) Upload avatars from the client to Google Cloud Storage (GCS).
      // 2) Store only the canonical GCS (or CDN) URL in the user profile.
      // 3) Replace broad external hosts with our own storage domain(s) only.
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
