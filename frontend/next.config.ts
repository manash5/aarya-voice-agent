import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    // The default bottom-left position sits directly on top of the sidebar's
    // workspace row and theme toggle, making both unclickable in development.
    position: "bottom-right",
  },
};

export default nextConfig;
