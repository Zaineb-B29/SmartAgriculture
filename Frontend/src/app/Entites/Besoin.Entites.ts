export class Besoin {
  constructor(
    public id?: number,
    public titre?: string,
    public image?: string,
    public description?: string,
    public type?: string,
    public nombreArbres?: string,
    public lieu?: string,
    public metrage?: string,
    public descriptionExpert?: string,
    public etat?: boolean,
    public statut?: string,
    public dateSoumission?: string,
    public dateValidationExpert?: string,
    public client?: any,
    public expert?: any
  ) {}
}