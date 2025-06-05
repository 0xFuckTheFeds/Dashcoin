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
    project: 'Fitted',
    youtubeId: 'l90SzDurh6o',
    quote: 'Fitted: The Digital Closet Reinventing Fashion',
  },
  {
    id: '2',
    project: 'Giggles',
    youtubeId: 'K3D75w-GhiQ',
    quote: 'Building the app for Gen Alpha Brainrot',
  },
  {
    id: '3',
    project: 'Dupe',
    youtubeId: 'kGb2Z_f67bo',
    quote: 'Dupe and the Rise of Internet Capital Markets',
  },
  {
    id: '4',
    project: 'Chadfirm',
    youtubeId: '9YeyB_tiLtw',
    quote: 'This Founder Turned Typeform into a Free Crypto-Powered App',
  },
  {
    id: '5',
    project: 'PipeIQ',
    youtubeId: 'pSErBNWXjtk',
    quote: "Play the Long Game: Pipe IQ’s Vision for Agents, $PIPEIQ & Enterprise Pipeline",
  },
];
