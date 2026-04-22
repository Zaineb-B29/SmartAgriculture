import { Besoin } from './Besoin.Entites';
import { Fournisseur } from './Fournisseur.Entites';

export class PrixProposer {
  id?: number;
  Prix?: string;
  isRead?: boolean;
  besoin?: Besoin;
  fournisseur?: Fournisseur;
}