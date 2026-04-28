export class Message {
  constructor(
    public id?: number,
    public contenu?: string,
    public dateEnvoi?: string,
    public expediteurType?: string,
    public expediteurId?: number,
    public destinataireType?: string,
    public destinataireId?: number,
    public lu?: boolean,
    public fileUrl?: string,
    public typeMedia?: string
  ) {}
}