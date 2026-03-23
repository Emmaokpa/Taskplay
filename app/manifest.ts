import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TaskPlay - Earn Legit Naira',
    short_name: 'TaskPlay',
    description: 'The most trusted rewards platform for hardworking Nigerians. Turn your phone into a money office.',
    start_url: '/',
    display: 'standalone',
    background_color: '#05070A',
    theme_color: '#8b5cf6',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
