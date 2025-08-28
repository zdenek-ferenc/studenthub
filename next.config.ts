/** @type {import('next').NextConfig} */
const nextConfig = {
  // Přidáme tuto sekci
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'xkmjeziwywflbdafkcqe.supabase.co', // Vlož sem hostname ze své chybové hlášky
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

module.exports = nextConfig;
