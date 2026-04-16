import { Client } from './Client.Entites';
import { PrixProposer } from './PrixProposer.Entites';

export interface Reserver {
  id?: number;
  client: Client;
  prixProposer: PrixProposer;
}