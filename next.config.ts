import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	output: "standalone",
	cacheComponents: true,
	serverExternalPackages: ["youtubei.js"],
	images: {
		remotePatterns: [
			new URL("https://pub-2f67f9df6e7d4b1ba80499084f0127ba.r2.dev/photos/**"),
			new URL("https://pub-2f67f9df6e7d4b1ba80499084f0127ba.r2.dev/35mm/**"),
			new URL("https://api.qrserver.com/v1/create-qr-code/**"),
			new URL("https://i.scdn.co/image/**"),
		],
		minimumCacheTTL: 31536000,
		imageSizes: [200],
		qualities: [75],
	},
};

export default nextConfig;
