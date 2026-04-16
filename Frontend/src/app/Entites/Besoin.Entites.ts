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

    // relations (optional but needed for UI logic)
    public client?: any,
    public expert?: any
  ) {}
}