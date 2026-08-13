import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Enlaza `src/i18n/request.ts` con next-intl (necesario en v4).
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    qualities: [25, 50, 75, 90, 100],
  },
};

export default withNextIntl(nextConfig);
