import { Besoin } from './Besoin.Entites';
import { Fournisseur } from './Fournisseur.Entites';

export class PrixProposer {
  id?: number;
  prix?: string;
  besoin?: Besoin;
  fournisseur?: Fournisseur;
}