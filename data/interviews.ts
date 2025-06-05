export interface Interview {
  id: string;
  project: string;
  youtubeId: string;
  quote?: string;
  tokenLogo?: string;
}

export const interviews: Interview[] = [
  {
    id: '1',
    project: 'Dashcoin',
    youtubeId: 'dQw4w9WgXcQ',
    quote: 'Bringing transparency to Internet Capital Markets',
  },
  {
    id: '2',
    project: 'Giggles',
    youtubeId: 'K3D75w-GhiQ',
    quote: 'Building the app for Gen Alpha Brainrot',
  },
  {
    id: '3',
    project: 'Web3 Starter',
    youtubeId: 'V-_O7nl0Ii0',
  },
];
