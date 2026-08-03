import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    indentWidth: 2,
    outputStyle: 'expanded',
  },
};

export default withNextIntl(nextConfig);
