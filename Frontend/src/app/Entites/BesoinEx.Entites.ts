import { Client } from "./Client.Entites";
import { ExpertAgricole } from "./ExpertAgricole.Entites";

export interface BesoinsEx {
  id?: number;
  type: string;
  descriptionClient: string;
   typeSuivi:string;
  descriptionExpert?: string;
  quantite: number;
  statut?: string;
  client?: Client;
  expert?: ExpertAgricole;
}