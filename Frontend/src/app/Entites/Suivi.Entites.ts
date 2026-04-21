export interface Suivi {
  id?: number;
  typeSuivi: 'PHOTO' | 'VIDEO' | 'TEMPS_REEL';

  urlsAvant?: string[];
  urlsApres?: string[];

  lienTempsReel?: string;

  reserver?: {
    id: number;
  };
}