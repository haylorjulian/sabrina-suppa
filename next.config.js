/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static HTML export — outputs to ./out for static hosts like Cloudflare Pages.
  output: 'export',
  // No Image Optimization server in a static export; serve images as-is.
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
