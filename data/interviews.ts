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
    project: 'Unknown Title',
    youtubeId: 'K3D75w-GhiQ',
    quote: 'Building the future of tokenized communities',
  },
  {
    id: '3',
    project: 'Web3 Starter',
    youtubeId: 'V-_O7nl0Ii0',
  },
];
