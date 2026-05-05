export interface Suivi {
  id?: number;
  typeSuivi: 'PHOTO' | 'VIDEO';
  urlsAvant?: string[];
  urlsApres?: string[];

  reserver?: {
    id: number;
    client?: {
      id?: number;
      nom?: string;
      prenom?: string;
    };
    prixProposer?: {
      id?: number;
      Prix?: number;
      fournisseur?: {
        id?: number;
        nom?: string;
        prenom?: string;
        email?: string;
      };
      besoin?: {
        id?: number;
        titre?: string;
        lieu?: string;
        nombreArbres?: number;
      };
    };
  };
}